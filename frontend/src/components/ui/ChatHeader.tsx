
import { useTranslation } from "react-i18next";
import { IoArrowBackOutline } from "react-icons/io5";
import MessageLogo from "../../assets/MessageLogo.svg";

interface IChatHeader {
    photo: string,
    name: string,
    status: boolean,
    onBack?: () => void,
    onOpenProfile?: () => void
}
export function ChatHeader(props: IChatHeader){
    const { t } = useTranslation();
    const { name, status, photo, onOpenProfile, onBack } = props;
    const displayName = name || "Usuário";
    const displayPhoto = photo || MessageLogo;

    return (
        <div className='bg-white w-full min-h-20 flex items-center p-3 gap-2 border-b border-slate-200'>
            {onBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                    aria-label="Voltar"
                >
                    <IoArrowBackOutline size={20} />
                </button>
            ) : null}
            <button
                type="button"
                onClick={onOpenProfile}
                className='flex min-w-0 flex-1 flex-row items-center gap-3 text-left cursor-pointer hover:bg-slate-50 rounded-xl p-2 transition'
            >
                <img
                    src={displayPhoto}
                    onError={(event) => {
                        event.currentTarget.src = MessageLogo;
                    }}
                    alt="My profile"
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                />
                <div className="flex min-w-0 flex-col">
                    <h1 className="text-slate-900 font-bold truncate">{displayName}</h1>
                    <p className={`text-[12px] ${status ? "text-emerald-600" : "text-slate-500"}`}>
                        {status ? t("chat.header.online") : t("chat.header.offline")}
                    </p>
                </div>
            </button>
        </div>
    )
}
