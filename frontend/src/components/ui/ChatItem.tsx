import { IoChatbubbleEllipses } from "react-icons/io5";
import logoMessageLogo from "../../assets/MessageLogo.svg";

interface IChatItem {
    photoUrl     : string;
    name         : string;
    message      : string;
    status?      : boolean;
    select       : boolean;
    unreadCount  : number;
    lastTime     : string;
    onclick()    : void;
}

export function ChatItem(props: IChatItem) {
    const { photoUrl, name, message, select, status, unreadCount, lastTime } = props;
    const displayName = name || "Sem nome";
    const count = Number(unreadCount) || 0;
    const hasUnread = count > 0 && !select;

    return (
        <button
            type="button"
            className={`w-full flex items-center gap-2 p-2 rounded-[10px] transition text-left
                ${select ? "bg-[#ec4348]/15" : "hover:bg-[#f7f7f7]"}`}
            onClick={props.onclick}
        >
            {/* Avatar + indicador de presença */}
            <div className="relative shrink-0">
                <img
                    src={photoUrl || logoMessageLogo}
                    onError={(e) => { e.currentTarget.src = logoMessageLogo; }}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                />
                <span
                    className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white
                        ${status ? "bg-emerald-500" : "bg-slate-300"}`}
                />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <h6 className="text-[13px] font-bold text-slate-900 truncate">{displayName}</h6>
                    <p className="text-[11px] text-slate-400 shrink-0 ml-1">{lastTime}</p>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-[12px] truncate flex-1 mr-2 ${
                        hasUnread ? "font-bold text-slate-900" : "text-slate-500"
                    }`}>
                        {message}
                    </p>
                </div>
            </div>
        </button>
    );
}