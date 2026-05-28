import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoLanguageSharp } from "react-icons/io5";

export function LanguageSettings() {
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.resolvedLanguage ?? "pt");
    return (
        <div className="flex flex-col items-center gap-5 md:gap-6 bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-200 max-w-2xl w-full">
            <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#ec4348]/10 rounded-full">
                {/* <img src={MessageLogo} height={100} width={100} alt="Idioma" /> */}
                <IoLanguageSharp className="h-12.5 w-12.5 text-[#ec4348]"/>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t("settings.languageSettings.title")}</h2>
            <p className="text-center text-slate-600">{t("settings.languageSettings.subtitle")}</p>
            <div className="space-y-2 w-full mt-2 md:mt-4">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input 
                        type="radio" 
                        name="language" 
                        className="w-4 h-4"
                        value="pt"
                        checked={selectedLanguage === "pt"}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        />
                    <span>{t("settings.languageSettings.pt")}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input 
                        type="radio" 
                        name="language" 
                        className="w-4 h-4"
                        value="en"
                        checked={selectedLanguage === "en"}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        />
                    <span>{t("settings.languageSettings.en")}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input 
                        type="radio" 
                        name="language" 
                        className="w-4 h-4"
                        value="fr"
                        checked={selectedLanguage === "fr"}
                        onChange={(e) => setSelectedLanguage(e.target.value)} 
                        />
                    <span>{t("settings.languageSettings.fr")}</span>
                </label>
            </div>
            <button 
                className="w-full bg-[#ec4348] text-white font-semibold py-3 rounded-lg hover:bg-[#d43839] transition mt-4"
                onClick={() => {
                    void i18n.changeLanguage(selectedLanguage);
                    localStorage.setItem("appLanguage", selectedLanguage);
                }}
            >
                {t("settings.languageSettings.btn_title")}
            </button>
        </div>
    );
}
