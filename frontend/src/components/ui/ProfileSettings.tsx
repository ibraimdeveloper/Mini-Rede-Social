import { useRef, useState, useEffect } from "react";
import { IoPencilOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageLogo from "../../assets/MessageLogo.svg";
import { api } from "../../utils/api";
import { extractAuthErrorMessage } from "../../utils/authErrors";

interface IUserProfile {
    username: string;
    photoUrl: string;
    name: string;
    surname: string;
    email: string;
    description: string;
}

const DEFAULT_USER_PROFILE: IUserProfile = {
    username: "",
    photoUrl: "",
    name: "",
    surname: "",
    email: "",
    description: ""
};

export function ProfileSettings() {
    const { t } = useTranslation();
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<IUserProfile>(DEFAULT_USER_PROFILE);
    const [draftProfile, setDraftProfile] = useState<IUserProfile>(profile);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Carrega o perfil do usuário da API
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get("profile/");
                const userData = response.data;
                
                const avatarUrl = userData.avatar || "";
                const userProfile: IUserProfile = {
                    username: userData.username || "",
                    photoUrl: avatarUrl,
                    name: userData.first_name || "",
                    surname: userData.last_name || "",
                    email: userData.email || "",
                    description: userData.bio || ""
                };
                
                setProfile(userProfile);
                setDraftProfile(userProfile);
            } catch (err) {
                setError(extractAuthErrorMessage(err) || t("settings.profileSettings.loadingError"));
                console.error("Erro ao carregar perfil:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSave = async () => {
        const sanitizedProfile: IUserProfile = {
            username: draftProfile.username.trim() || DEFAULT_USER_PROFILE.username,
            photoUrl: draftProfile.photoUrl.trim() || DEFAULT_USER_PROFILE.photoUrl,
            name: draftProfile.name.trim() || DEFAULT_USER_PROFILE.name,
            surname: draftProfile.surname.trim() || DEFAULT_USER_PROFILE.surname,
            email: draftProfile.email.trim() || DEFAULT_USER_PROFILE.email,
            description: draftProfile.description.trim() || DEFAULT_USER_PROFILE.description
        };

        try {
            setLoading(true);
            // Atualiza o perfil via API
            await api.patch("profile/edit/", {
                username: sanitizedProfile.username,
                first_name: sanitizedProfile.name,
                last_name: sanitizedProfile.surname,
                email: sanitizedProfile.email,
                bio: sanitizedProfile.description
            });

            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);
                const avatarResponse = await api.patch("profile/avatar/", formData);
                const returnedAvatar = avatarResponse.data?.avatar;
                if (returnedAvatar) {
                    sanitizedProfile.photoUrl = returnedAvatar;
                }
            }
            
            setProfile(sanitizedProfile);
            setDraftProfile(sanitizedProfile);
            setAvatarFile(null);
            setMode("view");
            setError("");
        } catch (err) {
            setError(extractAuthErrorMessage(err) || t("settings.profileSettings.savingError"));
            console.error("Erro ao salvar perfil:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setDraftProfile(profile);
        setMode("edit");
    };

    const handleCancel = () => {
        setDraftProfile(profile);
        setAvatarFile(null);
        setMode("view");
    };

    const handleSelectPhoto = () => {
        photoInputRef.current?.click();
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setAvatarFile(file);

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const result = fileReader.result;

            if (typeof result === "string") {
                setDraftProfile((previous) => ({
                    ...previous,
                    photoUrl: result
                }));
            }
        };

        fileReader.readAsDataURL(file);
        event.target.value = "";
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm max-w-2xl w-full overflow-hidden border border-slate-200 flex items-center justify-center p-8">
                <p className="text-slate-500">{t("settings.profileSettings.loading")}</p>
            </div>
        );
    }

    if (mode === "view") {
        return (
            <div className="bg-white rounded-3xl shadow-sm max-w-2xl w-full overflow-hidden border border-slate-200">
                <div className="h-24 md:h-28 bg-linear-to-r from-[#ec4348] to-[#ef6a6e]" />
                <div className="px-4 pb-4 md:px-8 md:pb-8 -mt-12 md:-mt-14">
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-white rounded-full p-1.5 shadow-md">
                    <img
                        src={profile.photoUrl || MessageLogo}
                        onError={(event) => {
                            event.currentTarget.src = MessageLogo;
                        }}
                        height={100}
                        width={100}
                                className="w-full h-full rounded-full object-cover"
                        alt={profile.username}
                    />
                </div>
                        <button
                            type="button"
                            onClick={handleEdit}
                            disabled={loading}
                            className="w-full md:w-auto bg-[#ec4348] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#d43839] transition disabled:opacity-50"
                        >
                            {t("settings.profileSettings.editBtn")}
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">{profile.username}</h2>
                    <p className="text-slate-500">{t("settings.profileSettings.viewSubtitle")}</p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="w-full space-y-3 mt-5">
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs text-slate-500">{t("settings.profileSettings.usernameLabel")}</p>
                        <p className="text-slate-900 font-medium">{profile.username}</p>
                    </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs text-slate-500">{t("settings.profileSettings.nameLabel")}</p>
                        <p className="text-slate-900 font-medium">{profile.name}</p>
                    </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs text-slate-500">{t("settings.profileSettings.surnameLabel")}</p>
                        <p className="text-slate-900 font-medium">{profile.surname}</p>
                    </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs text-slate-500">{t("settings.profileSettings.emailLabel")}</p>
                        <p className="text-slate-900 font-medium">{profile.email}</p>
                    </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs text-slate-500">{t("settings.profileSettings.descriptionLabel")}</p>
                        <p className="text-slate-900 font-medium">{profile.description}</p>
                    </div>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="h-24 md:h-28 bg-linear-to-r from-[#ec4348] to-[#ef6a6e]" />
            <div className="px-4 pb-4 md:px-8 md:pb-8 -mt-12 md:-mt-14">
                <div className="relative w-fit">
                    <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-white rounded-full overflow-hidden p-1.5 shadow-md">
                    <img
                        src={draftProfile.photoUrl || MessageLogo}
                        onError={(event) => {
                            event.currentTarget.src = MessageLogo;
                        }}
                        height={100}
                        width={100}
                            className="w-full h-full rounded-full object-cover"
                        alt={draftProfile.username}
                    />
                </div>
                <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                />
                <button
                    type="button"
                    onClick={handleSelectPhoto}
                    aria-label={t("settings.profileSettings.changePhotoAriaLabel")}
                        className="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-[#ec4348] text-white flex items-center justify-center shadow-md hover:bg-[#d43839] transition"
                >
                    <IoPencilOutline className="size-5" />
                </button>
            </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">{draftProfile.username || t("settings.profileSettings.usernamePlaceholder")}</h2>
                <p className="text-slate-500">{t("settings.profileSettings.editSubtitle")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                <input
                    type="text"
                    placeholder={t("settings.profileSettings.usernamePlaceholder")}
                    value={draftProfile.username}
                    onChange={(event) => setDraftProfile((previous) => ({ ...previous, username: event.target.value }))}
                        className="md:col-span-2 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
                />
                <input
                    type="text"
                    placeholder={t("settings.profileSettings.namePlaceholder")}
                    value={draftProfile.name}
                    onChange={(event) => setDraftProfile((previous) => ({ ...previous, name: event.target.value }))}
                        className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
                />
                <input
                    type="text"
                    placeholder={t("settings.profileSettings.surnamePlaceholder")}
                    value={draftProfile.surname}
                    onChange={(event) => setDraftProfile((previous) => ({ ...previous, surname: event.target.value }))}
                        className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
                />
                <input
                    type="email"
                    placeholder={t("settings.profileSettings.emailPlaceholder")}
                    value={draftProfile.email}
                    onChange={(event) => setDraftProfile((previous) => ({ ...previous, email: event.target.value }))}
                        className="md:col-span-2 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
                />
                <textarea
                    placeholder={t("settings.profileSettings.descriptionPlaceholder")}
                    value={draftProfile.description}
                    onChange={(event) => setDraftProfile((previous) => ({ ...previous, description: event.target.value }))}
                        className="md:col-span-2 border border-slate-300 rounded-xl p-3 min-h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
                />
            </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                        className="w-full border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
                >
                    {t("settings.profileSettings.cancelBtn")}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                        className="w-full bg-[#ec4348] text-white font-semibold py-3 rounded-xl hover:bg-[#d43839] transition disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t("settings.profileSettings.saving")}
                        </span>
                    ) : (
                        t("settings.profileSettings.saveBtn")
                    )}
                </button>
            </div>
            </div>
        </div>
    );
}
