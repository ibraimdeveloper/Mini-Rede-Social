import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface PresenceContextValue {
    onlineUsers: Record<number, boolean>;
}

const PresenceContext = createContext<PresenceContextValue>({
    onlineUsers: {},
});

export function PresenceProvider({ children }: { children: ReactNode }) {
    const [onlineUsers, setOnlineUsers] = useState<Record<number, boolean>>({});

    const wsRef = React.useRef<WebSocket | null>(null);
    const shouldReconnectRef = React.useRef(true);
    const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = React.useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const BASE_RECONNECT_DELAY = 1000;

    const connectWebSocket = React.useCallback(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            shouldReconnectRef.current = false;
            setOnlineUsers({});
            return;
        }

        shouldReconnectRef.current = true;

        const apiChatBase = import.meta.env.VITE_API_BASE_URL_CHAT ?? "http://localhost:8000/api/chat/";
        let wsHost = window.location.host;
        let wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";

        try {
            const url = new URL(apiChatBase);
            wsHost = url.host;
            wsProtocol = url.protocol === "https:" ? "wss" : "ws";
        } catch (error) {
            // fallback
        }

        try {
            const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/presence/?token=${token}`);

            ws.onopen = () => {
                console.log("[Presence] WebSocket conectado");
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type !== "presence_update") {
                    return;
                }

                setOnlineUsers((current) => ({
                    ...current,
                    [data.user_id]: data.is_online,
                }));
            };

            ws.onerror = (error) => {
                console.error("[Presence] WebSocket erro:", error);
            };

            ws.onclose = () => {
                console.log("[Presence] WebSocket fechado, tentando reconectar...");
                wsRef.current = null;

                if (!shouldReconnectRef.current) {
                    return;
                }

                if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
                    reconnectAttemptsRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, delay);
                } else {
                    console.warn("[Presence] Max reconexão tentativas atingidas");
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error("[Presence] Erro ao criar WebSocket:", error);
        }
    }, []);

    useEffect(() => {
        connectWebSocket();

        const handleBeforeUnload = () => {
            shouldReconnectRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            shouldReconnectRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [connectWebSocket]);

    const value = useMemo(() => ({ onlineUsers }), [onlineUsers]);

    return (
        <PresenceContext.Provider value={value}>
            {children}
        </PresenceContext.Provider>
    );
}

export function usePresence() {
    return useContext(PresenceContext);
}
