import { 
IoChatboxEllipsesOutline, 
IoCogOutline,
IoMoonOutline,
IoSunnyOutline
} from "react-icons/io5";
import { useEffect, useState } from "react";
import zyderLogo from '../assets/logo.png';
import { NavLink } from "react-router-dom";
import MessageLogo from "../assets/MessageLogo.svg";
import { api } from "../utils/api";
import { LogoutButton } from "./LogoutButton";
import { applyTheme, getStoredTheme, toggleThemeValue, type AppTheme } from "../utils/theme";

interface IUserProfile {
    username: string;
    photoUrl: string;
    name: string;
    surname: string;
    email: string;
    description: string;
}


export function MiniSidebar(){
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [, setLoading] = useState(true);
    const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());

    // Carrega o perfil do usuário da API
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get("profile/");
                const userData = response.data;
                
                const userProfile: IUserProfile = {
                    username: userData.username || "",
                    photoUrl: userData.avatar || "",
                    name: userData.first_name || "",
                    surname: userData.last_name || "",
                    email: userData.email || "",
                    description: userData.bio || ""
                };
                
                setProfile(userProfile);
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
                // Usa fallback se não conseguir carregar
                setProfile({
                    username: "",
                    photoUrl: "",
                    name: "",
                    surname: "",
                    email: "",
                    description: ""
                });
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return (
        <aside className='bg-[#f5f6fa] w-full md:w-18 md:h-lvh border-b md:border-b-0 md:border-r border-slate-200'>
            <div className="flex flex-row md:flex-col items-center md:h-lvh justify-between p-2 gap-3">
                <img 
                    src={zyderLogo} 
                    alt="Zyder" 
                    className="h-14 w-14 md:h-20 md:w-20 object-contain shrink-0"
                    style={{ imageRendering: 'auto' }}
                />
                <div className="flex flex-row md:flex-col gap-2 items-center">
                
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                    `p-3.5 rounded-[5px] transition ${
                        isActive
                        ? "text-[#ec4348] bg-[#ec4348]/15"
                        : "text-slate-500 hover:text-[#ec4348] hover:bg-[#ec4348]/25"
                    }`
                    }
                >
                    <IoChatboxEllipsesOutline size={22} />
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                    `p-3.5 rounded-[5px] transition ${
                        isActive
                        ? "text-[#ec4348] bg-[#ec4348]/15"
                        : "text-slate-500 hover:text-[#ec4348] hover:bg-[#ec4348]/25"
                    }`
                    }
                >
                    <IoCogOutline size={22} />
                </NavLink>

                </div>

                <div className="flex flex-row md:flex-col gap-4 md:gap-5 items-center">
                    <LogoutButton />
                    <button
                        type="button"
                        onClick={() => setTheme((currentTheme) => toggleThemeValue(currentTheme))}
                        title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                        aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                    >
                        {theme === "dark" ? (
                            <IoSunnyOutline size={24} className="text-slate-500 hover:text-[#ec4348]"/>
                        ) : (
                            <IoMoonOutline size={24} className="text-slate-500 hover:text-[#ec4348]"/>
                        )}
                    </button>
                    <img
                        src={profile?.photoUrl || MessageLogo}
                        alt="My profile"
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(event) => {
                            event.currentTarget.src = MessageLogo;
                        }}
                    />
                </div>
            </div>
        </aside>
    );
}
