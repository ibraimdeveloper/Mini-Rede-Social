import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { api } from "../../utils/api";
import { extractAuthErrorMessage } from "../../utils/authErrors";

export function SecuritySettings() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSuccess("");
      setError(t("settings.security.errorRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setSuccess("");
      setError(t("settings.security.errorMismatch"));
      return;
    }

    try {
      const { data } = await api.post("password/change/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setError("");
      setSuccess(extractAuthErrorMessage(data) || t("settings.security.success"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSuccess("");

      if (axios.isAxiosError(err)) {
        setError(extractAuthErrorMessage(err.response?.data) || t("settings.security.errorBackend"));
        return;
      }

      setError(t("settings.security.errorNetwork"));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm max-w-2xl w-full overflow-hidden border border-slate-200">
      <div className="h-24 md:h-28 bg-linear-to-r from-[#ec4348] to-[#ef6a6e]" />
      <div className="px-4 pb-4 md:px-8 md:pb-8">
        <div className="py-6">
          <h2 className="text-2xl font-bold text-slate-900">{t("settings.security.title")}</h2>
          <p className="text-slate-500 mt-1">{t("settings.security.subtitle")}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder={t("settings.security.oldPassword")}
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
          />
          <input
            type="password"
            placeholder={t("settings.security.newPassword")}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
          />
          <input
            type="password"
            placeholder={t("settings.security.confirmPassword")}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ec4348]"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition-colors"
          >
            {t("settings.security.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
