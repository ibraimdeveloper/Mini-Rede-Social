import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatHeader } from "./ui/ChatHeader";
import { MessageInput } from "./ui/MessageInput";
import { MessageBox } from "./ui/MessageBox";
import MessageLogo from "../assets/MessageLogo.svg";
import { apiChat } from "../utils/apiChat";
import { api } from "../utils/api";

export function ChatWindow(props: any) {
    const { t } = useTranslation();
    const { chatWindow, onOpenFriendProfile, onBack, onNewMessage, onRegisterDeleteHandler } = props;

    const [loading, setLoading]               = useState(false);
    const [messages, setMessages]             = useState<any[]>([]);
    const [currentUserId, setCurrentUserId]   = useState<number | null>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const socketRef      = useRef<WebSocket | null>(null);
    const currentUserRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // ─── Handler de delete externo (vindo do WS de notificações no ChatPage) ─
    const handleMessageDeleted = (id: number) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    // Regista o handler no ChatPage assim que monta, cancela ao desmontar
    useEffect(() => {
        onRegisterDeleteHandler?.(handleMessageDeleted);
        return () => { onRegisterDeleteHandler?.(null); };
    }, []);

    // ─── Criar ou obter conversa ──────────────────────────────────────────────
    const getOrCreateConversation = async (userId: number) => {
        try {
            const response = await apiChat.post("/conversations/", { user_id: userId });
            return response.data.id;
        } catch (error) {
            console.error("Erro ao criar/obter conversa:", error);
            return null;
        }
    };

    // ─── Buscar mensagens ─────────────────────────────────────────────────────
    const fetchMessages = async (convId: number, userId: number) => {
        try {
            setLoading(true);
            const response = await apiChat.get(`/conversations/${convId}/messages/`);
            setMessages(response.data.map((msg: any) => ({
                id      : msg.id,
                message : msg.content  ?? "",
                forMe   : msg.sender?.id === userId,
                time    : new Date(msg.timestamp).toLocaleTimeString("pt-PT", {
                    hour: "2-digit", minute: "2-digit",
                }),
                fileUrl  : msg.file_url  ?? null,
                fileName : msg.file_name ?? null,
                isRead   : msg.is_read   ?? false,
            })));
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
        } finally {
            setLoading(false);
        }
    };

    // ─── WebSocket ────────────────────────────────────────────────────────────
    const connectSocket = (convId: number) => {
        const token       = localStorage.getItem("authToken");
        const apiChatBase = import.meta.env.VITE_API_BASE_URL_CHAT ?? "http://localhost:8000/api/chat/";
        let wsHost     = window.location.host;
        let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";

        try {
            const url  = new URL(apiChatBase);
            wsHost     = url.host;
            wsProtocol = url.protocol === "https:" ? "wss" : "ws";
        } catch {
            // fallback
        }

        const ws = new WebSocket(
            `${wsProtocol}://${wsHost}/ws/chat/${convId}/?token=${token}`
        );

        ws.onopen = () => {
            console.log("WebSocket conectado");
            ws.send(JSON.stringify({ type: "open_conversation" }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const uid  = currentUserRef.current;

            // ── Mensagem apagada (vinda da sala chat_<id>) ────────────────────
            if (data.type === "message_deleted") {
                handleMessageDeleted(data.message_id);
                return;
            }

            // ── Receptor leu as mensagens ─────────────────────────────────────
            if (data.type === "messages_read") {
                const readSet = new Set<number>(data.message_ids as number[]);
                setMessages((prev) =>
                    prev.map((m) => readSet.has(m.id) ? { ...m, isRead: true } : m)
                );
                return;
            }

            // ── sender_online ─────────────────────────────────────────────────
            if (data.type === "sender_online") {
                if (chatWindow?.id) {
                    onNewMessage?.(chatWindow.id, null, Date.now(), {
                        type           : 'sender_online',
                        sender_id      : data.sender_id,
                        sender_name    : data.sender_name,
                        sender_username: data.sender_username,
                        sender_avatar  : data.sender_avatar,
                    });
                }
                return;
            }

            // ── Nova mensagem (texto ou ficheiro) ─────────────────────────────
            setMessages((prev) => {
                if (prev.some((m) => m.id === data.message_id)) return prev;
                return [
                    ...prev,
                    {
                        id      : data.message_id,
                        message : data.message   ?? "",
                        forMe   : data.sender_id === uid,
                        time    : new Date(data.timestamp).toLocaleTimeString("pt-PT", {
                            hour: "2-digit", minute: "2-digit",
                        }),
                        fileUrl  : data.file_url  ?? null,
                        fileName : data.file_name ?? null,
                        isRead   : data.is_read   ?? false,
                    },
                ];
            });

            if (chatWindow?.id) {
                const text = data.file_name ? `📎 ${data.file_name}` : (data.message ?? "");
                const ts   = data.timestamp ? new Date(data.timestamp).getTime() : Date.now();
                onNewMessage?.(chatWindow.id, text, ts);
            }

            // Se somos o receptor, avisa que lemos
            if (data.sender_id !== uid && socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "open_conversation" }));
            }
        };

        ws.onclose = () => console.log("WebSocket fechado");

        socketRef.current = ws;
        return ws;
    };

    // ─── INIT CHAT ────────────────────────────────────────────────────────────
    useEffect(() => {
        let wsRef: WebSocket | null = null;

        if (!chatWindow || currentUserId === null) {
            setMessages([]);
            socketRef.current?.close();
            return;
        }

        const init = async () => {
            const convId = await getOrCreateConversation(chatWindow.id);
            if (!convId) return;
            setConversationId(convId);
            await fetchMessages(convId, currentUserId);
            wsRef = connectSocket(convId);
        };

        void init();

        return () => {
            wsRef?.close();
            socketRef.current = null;
        };
    }, [chatWindow?.id, currentUserId]);

    // ─── Carregar utilizador atual ────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get("profile/");
                const id = response.data.id;
                currentUserRef.current = id;
                setCurrentUserId(id);
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
            }
        };
        void load();
    }, []);

    // ─── Auto scroll ──────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ─── Enviar mensagem de texto via WebSocket ───────────────────────────────
    const handleSend = (message: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({ message }));
    };

    // ─── Após envio de ficheiro via REST ──────────────────────────────────────
    const handleFileSent = (messageData: any) => {
        if (!messageData?.id) return;
        setMessages((prev) => {
            if (prev.some((m) => m.id === messageData.id)) return prev;
            return [
                ...prev,
                {
                    id      : messageData.id,
                    message : messageData.content  ?? "",
                    forMe   : true,
                    time    : new Date(messageData.timestamp).toLocaleTimeString("pt-PT", {
                        hour: "2-digit", minute: "2-digit",
                    }),
                    fileUrl  : messageData.file_url  ?? null,
                    fileName : messageData.file_name ?? null,
                    isRead   : messageData.is_read   ?? false,
                },
            ];
        });

        if (chatWindow?.id) {
            const text = messageData.file_name
                ? `📎 ${messageData.file_name}`
                : (messageData.content ?? "");
            const ts = messageData.timestamp
                ? new Date(messageData.timestamp).getTime()
                : Date.now();
            onNewMessage?.(chatWindow.id, text, ts);
        }
    };

    // ─── UI sem chat seleccionado ─────────────────────────────────────────────
    if (!chatWindow) {
        return (
            <main
                className={`flex-1 flex-col justify-center items-center bg-[#F5F6FA] min-h-0 gap-4 ${
                    props.className ?? "flex"
                }`}
            >
                <img src={MessageLogo} className="opacity-90 max-w-40" alt="" />
                <p className="text-sm text-slate-500">
                    {t("chat.window.selectConversation")}
                </p>
            </main>
        );
    }

    // ─── Chat aberto ──────────────────────────────────────────────────────────
    return (
        <main className={`min-h-0 flex-col flex-1 ${props.className ?? "flex"}`}>
            <ChatHeader
                photo={chatWindow.photo}
                name={chatWindow.name}
                status={chatWindow.status ?? false}
                onBack={onBack}
                onOpenProfile={() => onOpenFriendProfile?.(chatWindow.id)}
            />

            <div className="bg-[#F5F6FA] w-full flex-1 flex flex-col min-h-0">
                <div className="flex flex-col flex-1 overflow-y-auto px-4 py-3">
                    {loading && (
                        <p className="text-center py-4 text-slate-500">
                            {t("chat.window.loading")}
                        </p>
                    )}

                    {messages.map((msg) => (
                        <MessageBox
                            key={msg.id}
                            messageId={msg.id}
                            message={msg.message}
                            forMe={msg.forMe}
                            time={msg.time}
                            fileUrl={msg.fileUrl}
                            fileName={msg.fileName}
                            isRead={msg.isRead}
                            onDeleted={handleMessageDeleted}
                        />
                    ))}

                    <div ref={messagesEndRef} />
                </div>

                <MessageInput
                    id={chatWindow.id}
                    conversationId={conversationId ?? undefined}
                    onSend={handleSend}
                    onFileSent={handleFileSent}
                />
            </div>
        </main>
    );
}