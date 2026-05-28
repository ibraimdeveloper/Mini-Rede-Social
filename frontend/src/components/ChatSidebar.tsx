import { CiSearch } from "react-icons/ci";
import { ChatItem } from "./ui/ChatItem";
import type { IFriend } from "../utils/mockUserData";
import MessageLogo from "../assets/MessageLogo.svg";
import { useTranslation } from "react-i18next";

interface IChat {
    id             : number;
    photo          : string;
    name           : string;
    status?        : boolean;
    lastMessage    : string;
    lastTimeMessage: number;   // timestamp em ms
    unreadCount    : number;
}

interface IChatSidebar {
    className?      : string;
    listChats       : IChat[];
    selectedChatId  : number | null;
    openChatWindow(e: IChat): void;
    searchValue     : string;
    onSearchChange(value: string): void;
    searchResults   : IFriend[];
    onOpenMessage(friend: IFriend): void;
}

function formatTime(ms: number): string {
    if (!ms) return "";
    const date = new Date(ms);
    const now  = new Date();
    const isToday =
        date.getDate()     === now.getDate()     &&
        date.getMonth()    === now.getMonth()    &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

export function ChatSidebar(props: IChatSidebar) {
    const { t } = useTranslation();
    const { listChats } = props;

    return (
        <aside className={`bg-white w-full md:w-[22rem] shrink-0 flex-col content-center
            p-4 md:pt-5 md:pr-5 md:pl-5 gap-4 md:gap-5 border-r border-slate-200 min-h-0
            ${props.className ?? "flex"}`}
        >
            <div>
                <h1 className="text-slate-900 font-bold text-lg md:text-base">
                    {t("chat.sidebar.title")}
                </h1>
            </div>

            {/* Pesquisa */}
            <div className="rounded-[10px] flex flex-row items-center gap-3 p-3 h-11
                            bg-[#ececec] border border-transparent">
                <CiSearch size={18} className="text-slate-500" />
                <input
                    value={props.searchValue}
                    onChange={(e) => props.onSearchChange(e.target.value)}
                    placeholder={t("chat.sidebar.searchPlaceholder")}
                    className="text-slate-700 placeholder:text-slate-500 text-[14px]
                               outline-none p-1 bg-transparent w-full"
                />
            </div>

            {/* Resultados de pesquisa */}
            {props.searchValue.trim() ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2
                                max-h-44 overflow-y-auto">
                    {props.searchResults.length === 0 ? (
                        <p className="text-xs text-slate-500">{t("chat.sidebar.emptySearch")}</p>
                    ) : (
                        <div className="space-y-2">
                            {props.searchResults.map((friend) => (
                                <div key={friend.id}
                                    className="flex items-center justify-between gap-2 p-2
                                               rounded-xl bg-white border border-slate-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={friend.photoUrl || MessageLogo}
                                            onError={(e) => { e.currentTarget.src = MessageLogo; }}
                                            alt={friend.username}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate text-slate-900">
                                                {friend.username}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {friend.isOnline
                                                    ? t("chat.sidebar.online")
                                                    : t("chat.sidebar.offline")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => props.onOpenMessage(friend)}
                                        className="text-xs bg-[#ec4348] text-white rounded-md
                                                   px-2 py-1 hover:bg-[#d43839] transition"
                                    >
                                        {t("chat.sidebar.message")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            {/* Lista de conversas */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 pb-2">
                {listChats.map((chat) => (
                    <ChatItem
                        key={chat.id}
                        photoUrl={chat.photo}
                        name={chat.name}
                        message={chat.lastMessage}
                        status={chat.status}
                        select={chat.id === props.selectedChatId}
                        unreadCount={chat.unreadCount}
                        lastTime={formatTime(chat.lastTimeMessage)}
                        onclick={() => props.openChatWindow(chat)}
                    />
                ))}
            </div>
        </aside>
    );
}