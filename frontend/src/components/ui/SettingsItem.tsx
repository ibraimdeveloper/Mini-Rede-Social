import type { IconType } from "react-icons";

interface ISettingsItem {
    title: string;
    subtitle: string;
    icon: IconType;
    selected?: boolean;
    onClick?: () => void;
}

export function SettingsItem(props: ISettingsItem) {
    const { title, subtitle, icon: Icon, selected = false, onClick } = props;
    
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-w-[13rem] md:min-w-0 w-full flex items-center gap-3 md:gap-4 p-3 rounded-lg transition-all ${
                selected
                    ? "bg-[#ec4348] text-white shadow-md"
                    : "text-slate-900 hover:bg-slate-100"
            }`}
        >
            <div className={`flex items-center justify-center p-2 rounded-lg ${
                selected ? "bg-white/20" : "bg-slate-100 border border-slate-200"
            }`}>
                <Icon className="size-5" />
            </div>
            <div className="flex-1 text-left">
                <strong className="block text-sm">{title}</strong>
                <p className={`hidden md:block text-xs ${
                    selected ? "text-white/80" : "text-slate-500"
                }`}>
                    {subtitle}
                </p>
            </div>
        </button>
    );
}
