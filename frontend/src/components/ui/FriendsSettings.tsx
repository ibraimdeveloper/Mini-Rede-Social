import { useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import MessageLogo from "../../assets/MessageLogo.svg";
import { api } from "../../utils/api";
import { useTranslation } from "react-i18next";
import { usePresence } from "../../utils/presence";

interface IFriend {
    id: number;
    name: string;
    username: string;
    bio: string;
    photoUrl: string;
    isOnline: boolean;
    lastMessage: string;
}

export function FriendsSettings() {
    const { t } = useTranslation();
    const { onlineUsers } = usePresence();
    const [friends, setFriends] = useState<IFriend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFriends = async () => {
            try {
                setLoading(true);
                const response = await api.get("users/friends/");
                const friendsData = response.data.map((user: any) => ({
                    id: user.id,
                    name: user.first_name || "",
                    username: user.username || "",
                    bio: user.bio || "",
                    photoUrl: user.avatar || "",
                    isOnline: onlineUsers[user.id] ?? (user.is_online ?? false),
                    lastMessage: "",
                }));
                setFriends(friendsData);
                setError("");
            } catch (err) {
                setError(t("settings.friendsSettings.loadingError"));
                console.error("Erro ao carregar amigos:", err);
            } finally {
                setLoading(false);
            }
        };

        void loadFriends();
    }, [onlineUsers, t]);

    const handleRemoveFriend = async (friendId: number) => {
        try {
            await api.delete(`users/${friendId}/remove-friend/`);
            setFriends((current) => current.filter((friend) => friend.id !== friendId));
            setError("");
        } catch (err) {
            setError(t("settings.friendsSettings.removeError"));
            console.error("Erro ao remover amigo:", err);
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 max-w-2xl w-full min-h-0 md:max-h-[80vh]">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">{t("settings.friendsSettings.title")}</h2>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#ec4348]/10 text-[#ec4348]">
                    {friends.length}
                </span>
            </div>

            {error ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {loading ? (
                    <p className="text-sm text-slate-500">Carregando amigos...</p>
                ) : friends.length === 0 ? (
                    <p className="text-sm text-slate-500">{t("settings.friendsSettings.empty")}</p>
                ) : null}

                {friends.map((friend) => (
                    <article key={friend.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <img
                            src={friend.photoUrl || MessageLogo}
                            onError={(event) => {
                                event.currentTarget.src = MessageLogo;
                            }}
                            alt={friend.username}
                            className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{friend.username}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleRemoveFriend(friend.id)}
                            aria-label={t("settings.friendsSettings.removeFriendAriaLabel", { name: friend.username })}
                            title={t("settings.friendsSettings.removeFriend")}
                            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <IoTrashOutline size={18} />
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}
