import { useState } from "react";
import { IoPersonOutline, IoLanguageOutline, IoPeopleOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { SettingsItem } from "../../components/ui/SettingsItem";
import { ProfileSettings } from "../../components/ui/ProfileSettings";
import { LanguageSettings } from "../../components/ui/LanguageSettings";
import { FriendsSettings } from "../../components/ui/FriendsSettings";
import { SecuritySettings } from "../../components/ui/SecuritySettings";
import { useTranslation } from "react-i18next";
import { LegalLinks } from "../../components/LegalLinks";

export function SettingsPage() {
    const [selectedSection, setSelectedSection] = useState<"profile" | "friends" | "language" | "security">("profile");
    const { t } = useTranslation();
    return (
        <div className="flex w-full flex-1 min-h-0 flex-col md:flex-row">
            <aside className="bg-white w-full md:w-80 flex shrink-0 flex-col border-b md:border-b-0 md:border-r border-slate-200">
                <div className="bg-linear-to-r from-[#ec4348] to-[#ef6a6e]">
                    <h1 className="text-white font-bold px-4 py-4 md:p-6">{t("settings.title")}</h1>
                </div>
                <div className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:space-y-2 md:overflow-x-visible md:p-4">
                    <SettingsItem
                        title={t("settings.settingsItem.profile.title")}
                        subtitle={t("settings.settingsItem.profile.subtitle")}
                        icon={IoPersonOutline}
                        selected={selectedSection === "profile"}
                        onClick={() => setSelectedSection("profile")}
                    />
                    <SettingsItem
                        title={t("settings.settingsItem.friends.title")}
                        subtitle={t("settings.settingsItem.friends.subtitle")}
                        icon={IoPeopleOutline}
                        selected={selectedSection === "friends"}
                        onClick={() => setSelectedSection("friends")}
                    />
                    <SettingsItem
                        title={t("settings.settingsItem.idioma.title")}
                        subtitle={t("settings.settingsItem.idioma.subtitle")}
                        icon={IoLanguageOutline}
                        selected={selectedSection === "language"}
                        onClick={() => setSelectedSection("language")}
                    />
                    <SettingsItem
                        title={t("settings.settingsItem.security.title")}
                        subtitle={t("settings.settingsItem.security.subtitle")}
                        icon={IoShieldCheckmarkOutline}
                        selected={selectedSection === "security"}
                        onClick={() => setSelectedSection("security")}
                    />
                </div>
            </aside>
            <main className="flex-1 flex min-h-0 flex-col items-center bg-[#F5F6FA] p-3 md:justify-center md:p-8">
                {selectedSection === "profile" && (
                    <ProfileSettings />
                )}
                {selectedSection === "friends" && (
                    <FriendsSettings />
                )}
                {selectedSection === "language" && (
                    <LanguageSettings />
                )}
                {selectedSection === "security" && (
                    <SecuritySettings />
                )}
                <LegalLinks className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm" />
            </main>
        </div>
    );
}
