import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatSidebar } from '../../components/ChatSidebar';
import { ChatWindow } from '../../components/ChatWindow';
import { api } from '../../utils/api';
import { apiChat } from '../../utils/apiChat';
import { usePresence } from '../../utils/presence';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface IFriend {
    id         : number;
    name       : string;
    username   : string;
    bio        : string;
    photoUrl   : string;
    isOnline   : boolean;
    lastMessage: string;
}

interface IChat {
    id             : number;
    photo          : string;
    name           : string;
    status?        : boolean;
    lastMessage    : string;
    lastTimeMessage: number;
    unreadCount    : number;
}

function mapFriendToChat(friend: IFriend): IChat {
    return {
        id             : friend.id,
        photo          : friend.photoUrl,
        name           : friend.name || friend.username,
        status         : friend.isOnline,
        lastMessage    : friend.lastMessage,
        lastTimeMessage: 0,
        unreadCount    : 0,
    };
}

export function ChatPage() {
    const location   = useLocation();
    const navigate   = useNavigate();
    const [searchParams] = useSearchParams();
    const { onlineUsers } = usePresence();

    const [friends, setFriends]             = useState<IFriend[]>([]);
    const [convUsers, setConvUsers]         = useState<Record<number, IFriend>>({});
    const [searchValue, setSearchValue]     = useState("");
    const [searchResults, setSearchResults] = useState<IFriend[]>([]);
    const [selectedChatId, setSelectedChatId]             = useState<number | null>(null);
    const [selectedChatFallback, setSelectedChatFallback] = useState<IFriend | null>(null);
    const [, setLoadingFriends]     = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const [convByUser, setConvByUser]       = useState<Record<number, number>>({});
    const [unreadByConv, setUnreadByConv]   = useState<Record<number, number>>({});
    const [lastMsgByConv, setLastMsgByConv] = useState<Record<number, { text: string; ts: number }>>({});

    const selectedChatIdRef    = useRef<number | null>(null);
    // Handler registado pelo ChatWindow para receber deletes externos
    const onExternalDeleteRef  = useRef<((id: number) => void) | null>(null);
    // IDs apagados antes do ChatWindow estar montado
    const pendingDeletesRef    = useRef<Set<number>>(new Set());

    useEffect(() => {
        selectedChatIdRef.current = selectedChatId;
    }, [selectedChatId]);

    // ─── Carregar utilizador atual ────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const r = await api.get('profile/');
                setCurrentUserId(r.data.id);
            } catch (err) {
                console.error('Erro ao carregar utilizador atual:', err);
            }
        };
        void load();
    }, []);

    // ─── Carregar amigos ──────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingFriends(true);
                const r = await api.get('users/friends/');
                setFriends(r.data.map((u: any) => ({
                    id         : u.id,
                    name       : u.first_name || "",
                    username   : u.username   || "",
                    bio        : u.bio        || "",
                    photoUrl   : u.avatar     || "",
                    isOnline   : onlineUsers[u.id] ?? (u.is_online ?? false),
                    lastMessage: "",
                })));
            } catch (err) {
                console.error('Erro ao carregar amigos:', err);
                setFriends([]);
            } finally {
                setLoadingFriends(false);
            }
        };
        void load();
    }, [onlineUsers]);

    // ─── Carregar conversas ───────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            if (currentUserId === null) return;
            try {
                const r     = await apiChat.get('/conversations/');
                const convs : any[] = r.data;

                const newConvByUser : Record<number, number>                       = {};
                const newUnread     : Record<number, number>                       = {};
                const newLastMsg    : Record<number, { text: string; ts: number }> = {};
                const newConvUsers  : Record<number, IFriend>                      = {};

                for (const conv of convs) {
                    newUnread[conv.id]  = conv.unread_count ?? 0;
                    newLastMsg[conv.id] = {
                        text: conv.last_message?.content ?? "",
                        ts  : conv.last_message?.timestamp
                            ? new Date(conv.last_message.timestamp).getTime()
                            : 0,
                    };
                    for (const p of conv.participants ?? []) {
                        if (p.id === currentUserId) continue;
                        newConvByUser[p.id] = conv.id;
                        newConvUsers[p.id]  = {
                            id         : p.id,
                            name       : p.first_name || p.username || "",
                            username   : p.username || "",
                            bio        : p.bio || "",
                            photoUrl   : p.avatar || "",
                            isOnline   : p.is_online ?? false,
                            lastMessage: "",
                        };
                    }
                }

                setConvByUser(newConvByUser);
                setUnreadByConv(newUnread);
                setLastMsgByConv(newLastMsg);
                setConvUsers((prev) => ({ ...prev, ...newConvUsers }));
            } catch (err) {
                console.error('Erro ao carregar conversas:', err);
            }
        };
        void load();
    }, [currentUserId]);

    // ─── Pesquisa ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const query = searchValue.trim();
            if (!query) { setSearchResults([]); return; }
            try {
                const r = await api.get(`users/search/?search=${encodeURIComponent(query)}`);
                setSearchResults(r.data.map((u: any) => ({
                    id         : u.id,
                    name       : u.first_name || "",
                    username   : u.username   || "",
                    bio        : u.bio        || "",
                    photoUrl   : u.avatar     || "",
                    isOnline   : u.is_online  ?? false,
                    lastMessage: "",
                })));
            } catch (err) {
                console.error('Erro na pesquisa:', err);
                setSearchResults([]);
            }
        };
        void load();
    }, [searchValue]);

    // ─── WS notificações (canal user_<id>) ───────────────────────────────────
    useEffect(() => {
        if (currentUserId === null) return;

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

        const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/notifications/?token=${token}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // ── Mensagem apagada para todos ───────────────────────────────────
            if (data.type === 'message_deleted') {
                const msgId = data.message_id as number;
                if (onExternalDeleteRef.current) {
                    // ChatWindow está aberto — delega imediatamente
                    onExternalDeleteRef.current(msgId);
                } else {
                    // ChatWindow fechado — guarda para quando abrir
                    pendingDeletesRef.current.add(msgId);
                }
                return;
            }

            // ── Nova mensagem ─────────────────────────────────────────────────
            if (data.type !== 'direct_message') return;

            const convId   = data.conversation_id as number;
            const senderId = data.sender_id as number;
            const ts       = data.timestamp ? new Date(data.timestamp).getTime() : Date.now();
            const text     = data.file_name ? `📎 ${data.file_name}` : (data.message ?? "");

            setConvByUser((prev) => ({ ...prev, [senderId]: convId }));
            setConvUsers((prev) => ({
                ...prev,
                [senderId]: {
                    id         : senderId,
                    name       : data.sender_name || data.sender_username || "",
                    username   : data.sender_username || "",
                    bio        : prev[senderId]?.bio || "",
                    photoUrl   : data.sender_avatar || prev[senderId]?.photoUrl || "",
                    isOnline   : true,
                    lastMessage: "",
                },
            }));
            setLastMsgByConv((prev) => ({ ...prev, [convId]: { text, ts } }));

            if (selectedChatIdRef.current !== senderId) {
                setUnreadByConv((prev) => ({ ...prev, [convId]: (prev[convId] ?? 0) + 1 }));
            }
        };

        return () => ws.close();
    }, [currentUserId]);

    // ─── Helpers de presença ──────────────────────────────────────────────────
    const applyPresence = (friend: IFriend): IFriend => ({
        ...friend,
        isOnline: onlineUsers[friend.id] ?? friend.isOnline,
    });

    const chatUsers = useMemo(() => {
        const byId: Record<number, IFriend> = {};
        for (const f of friends) byId[f.id] = applyPresence(f);
        for (const u of Object.values(convUsers)) {
            if (!byId[u.id]) byId[u.id] = applyPresence(u);
        }
        return byId;
    }, [friends, convUsers, onlineUsers]);

    const listChats = useMemo(() => {
        return Object.values(chatUsers)
            .map((friend) => {
                const convId = convByUser[friend.id];
                const unread = convId !== undefined ? (unreadByConv[convId] ?? 0) : 0;
                const last   = convId !== undefined ? (lastMsgByConv[convId])    : null;
                return {
                    id             : friend.id,
                    photo          : friend.photoUrl,
                    name           : friend.name || friend.username,
                    status         : friend.isOnline,
                    lastMessage    : last?.text   ?? "",
                    lastTimeMessage: last?.ts     ?? 0,
                    unreadCount    : unread,
                };
            })
            .sort((a, b) => b.lastTimeMessage - a.lastTimeMessage);
    }, [chatUsers, convByUser, unreadByConv, lastMsgByConv]);

    const visibleSearchResults = useMemo(
        () => searchResults.map(applyPresence),
        [searchResults, onlineUsers]
    );

    const queryUser = useMemo(() => {
        const userId = Number(searchParams.get("chatUserId"));
        if (Number.isNaN(userId)) return null;
        return chatUsers[userId] ?? null;
    }, [searchParams, chatUsers]);

    const selectedUser = useMemo(() => {
        if (selectedChatId === null) return null;
        return (
            (chatUsers[selectedChatId] ?? null) ??
            (() => { const f = searchResults.find((i) => i.id === selectedChatId); return f ? applyPresence(f) : null; })() ??
            (selectedChatFallback?.id === selectedChatId ? applyPresence(selectedChatFallback) : null)
        );
    }, [chatUsers, searchResults, selectedChatFallback, selectedChatId, onlineUsers]);

    const activeChat = useMemo(() => {
        const activeUser = queryUser ?? selectedUser;
        if (!activeUser) return null;
        const convId = convByUser[activeUser.id];
        return {
            ...mapFriendToChat(activeUser),
            unreadCount    : convId !== undefined ? (unreadByConv[convId] ?? 0) : 0,
            lastTimeMessage: convId !== undefined ? (lastMsgByConv[convId]?.ts ?? 0) : 0,
        };
    }, [queryUser, selectedUser, convByUser, unreadByConv, lastMsgByConv]);

    // ─── Ao abrir conversa — zera contador ───────────────────────────────────
    const handleOpenChat = (chat: IChat) => {
        setSelectedChatId(chat.id);
        setSelectedChatFallback(null);
        const convId = convByUser[chat.id];
        if (convId !== undefined) {
            setUnreadByConv((prev) => ({ ...prev, [convId]: 0 }));
        }
    };

    // ─── Actualiza sidebar com última mensagem ────────────────────────────────
    const handleNewMessage = (userId: number, text: string | null, ts: number, meta?: any) => {
        if (meta?.type === 'sender_online') {
            setConvUsers((prev) => ({
                ...prev,
                [userId]: { ...prev[userId], isOnline: true },
            }));
            return;
        }
        if (text === null) return;
        const convId = convByUser[userId];
        if (convId === undefined) return;
        setLastMsgByConv((prev) => ({ ...prev, [convId]: { text, ts } }));
    };

    // ─── ChatWindow regista o seu handler de delete ───────────────────────────
    // Chamado pelo ChatWindow assim que monta, para receber deletes externos.
    const handleRegisterDeleteHandler = (fn: ((id: number) => void) | null) => {
        onExternalDeleteRef.current = fn;
        if (fn) {
            // Aplica deletes que chegaram enquanto o chat estava fechado
            pendingDeletesRef.current.forEach((id) => fn(id));
            pendingDeletesRef.current.clear();
        }
    };

    return (
        <div className='flex w-full min-h-0 flex-1'>
            <ChatSidebar
                className={activeChat ? "hidden md:flex" : "flex"}
                listChats={listChats}
                selectedChatId={activeChat?.id ?? null}
                openChatWindow={handleOpenChat}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchResults={visibleSearchResults}
                onOpenMessage={(friend) => {
                    setSelectedChatId(friend.id);
                    setSelectedChatFallback(friend);
                    setSearchValue("");
                    const convId = convByUser[friend.id];
                    if (convId !== undefined) {
                        setUnreadByConv((prev) => ({ ...prev, [convId]: 0 }));
                    }
                }}
            />
            <ChatWindow
                className={activeChat ? "flex" : "hidden md:flex"}
                chatWindow={activeChat}
                onBack={() => {
                    setSelectedChatId(null);
                    setSelectedChatFallback(null);
                    handleRegisterDeleteHandler(null);
                }}
                onOpenFriendProfile={(friendId: number) => navigate(`/friends/${friendId}`, {
                    state: { returnTo: `${location.pathname}${location.search}` },
                })}
                onNewMessage={handleNewMessage}
                onRegisterDeleteHandler={handleRegisterDeleteHandler}
            />
        </div>
    );
}