import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MessageLogo from "../../assets/MessageLogo.svg";
import { api } from "../../utils/api";
import { usePresence } from "../../utils/presence";

interface IFriend {
    id: number;
    name: string;
    username: string;
    bio: string;
    photoUrl: string;
    isOnline: boolean;
}

export function FriendProfilePage() {
    const { t } = useTranslation();
    const params = useParams<{ friendId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { onlineUsers } = usePresence();
    const friendId = Number(params.friendId);
    const [friend, setFriend] = useState<IFriend | null>(null);
    const [alreadyFriend, setAlreadyFriend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFriend = async () => {
            if (Number.isNaN(friendId)) {
                setError(t("friendProfile.invalidId"));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [detailResponse, friendsResponse] = await Promise.all([
                    api.get(`users/${friendId}/`),
                    api.get("users/friends/")
                ]);

                const userData = detailResponse.data;
                const friendsData = friendsResponse.data;

                setFriend({
                    id: userData.id,
                    name: userData.first_name || "",
                    username: userData.username || "",
                    bio: userData.bio || "",
                    photoUrl: userData.avatar || "",
                    isOnline: onlineUsers[userData.id] ?? (userData.is_online ?? false),
                });

                setAlreadyFriend(Array.isArray(friendsData) && friendsData.some((f: any) => f.id === friendId));
                setError("");
            } catch (err) {
                setError(t("friendProfile.loadError"));
                console.error("Erro ao carregar perfil de amigo:", err);
            } finally {
                setLoading(false);
            }
        };

        void loadFriend();
    }, [friendId, t, onlineUsers]);

    const handleAddFriend = async () => {
        if (Number.isNaN(friendId)) {
            return;
        }

        try {
            await api.post(`users/${friendId}/add-friend/`);
            setAlreadyFriend(true);
            setError("");
        } catch (err) {
            setError(t("friendProfile.addError"));
            console.error("Erro ao adicionar amigo:", err);
        }
    };

    const handleBackToChat = () => {
        const returnTo = location.state?.returnTo;
        if (typeof returnTo === "string" && returnTo.length > 0) {
            navigate(returnTo);
            return;
        }

        navigate("/");
    };

    if (loading) {
        return (
            <main className="flex-1 bg-[#F5F6FA] p-8 flex items-center justify-center">
                <p className="text-slate-500">{t("friendProfile.loading")}</p>
            </main>
        );
    }

    if (error || !friend) {
        return (
            <main className="flex-1 bg-[#F5F6FA] p-8 flex items-center justify-center">
                <section className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
                    <h1 className="text-xl font-bold text-slate-900">{t("friendProfile.notFound")}</h1>
                    <p className="text-slate-500 mt-2">{error || "Não foi possível carregar o perfil deste amigo."}</p>
                    <button
                        type="button"
                        onClick={handleBackToChat}
                        className="inline-flex items-center rounded-xl bg-[#ec4348] hover:bg-[#d43839] text-white px-5 py-2.5 font-semibold transition mt-5"
                    >
                        {t("friendProfile.backButton")}
                    </button>
                </section>
            </main>
        );
    }

    const displayedIsOnline = onlineUsers[friend.id] ?? friend.isOnline;

    return (
        <main className="flex-1 bg-[#F5F6FA] p-8 flex items-center justify-center">
            <section className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <header className="flex items-center gap-4">
                    <img
                        src={friend.photoUrl || MessageLogo}
                        onError={(event) => {
                            event.currentTarget.src = MessageLogo;
                        }}
                        alt={friend.username}
                        className="h-24 w-24 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{friend.name}</h1>
                        <p className="text-slate-600">@{friend.username}</p>
                        <p className={`text-xs mt-1 ${displayedIsOnline ? "text-emerald-600" : "text-slate-500"}`}>
                            {displayedIsOnline ? t("chat.header.online") : t("chat.header.offline")}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-3 mt-6">
                    <article className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">{t("friendProfile.nameLabel")}</p>
                        <p className="text-slate-900 font-semibold">{friend.name}</p>
                    </article>
                    <article className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">{t("friendProfile.usernameLabel")}</p>
                        <p className="text-slate-900 font-semibold">@{friend.username}</p>
                    </article>
                    <article className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">{t("friendProfile.bioLabel")}</p>
                        <p className="text-slate-900 font-semibold">{friend.bio || t("friendProfile.noBio")}</p>
                    </article>
                </div>

                <div className="mt-6">
                    {!alreadyFriend ? (
                        <button
                            type="button"
                            onClick={handleAddFriend}
                            className="inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 font-semibold transition mr-3"
                        >
                            {t("friendProfile.addButton")}
                        </button>
                    ) : (
                        <span className="inline-flex items-center rounded-xl bg-emerald-100 text-emerald-700 px-5 py-2.5 font-semibold mr-3">
                            {t("friendProfile.alreadyFriend")}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleBackToChat}
                        className="inline-flex items-center rounded-xl bg-[#ec4348] hover:bg-[#d43839] text-white px-5 py-2.5 font-semibold transition"
                    >
                        {t("friendProfile.backButton")}
                    </button>
                </div>
            </section>
        </main>
    );
}
