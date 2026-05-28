import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (window.location.port === "5173"
	? "http://localhost:8000/api/auth/"
	: `${window.location.origin}/api/auth/`);

export function OAuthGithubCallback() {
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const code = searchParams.get("code");
		const error = searchParams.get("error");
		const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
		const access = hashParams.get("access");
		const refresh = hashParams.get("refresh");

		if (error) {
			console.error("OAuth error:", error);
			const oauthError = searchParams.get("error_description") ?? error;
			navigate(`/login?oauthError=${encodeURIComponent(oauthError)}`, { replace: true });
			return;
		}

		if (access) {
			localStorage.setItem("authToken", access);
			if (refresh) {
				localStorage.setItem("refreshToken", refresh);
			}
			navigate("/", { replace: true });
			return;
		}

		if (!code) {
			navigate("/login", { replace: true });
			return;
		}

		window.location.href = `${API_BASE_URL}github/callback/?code=${code}`;
	}, [location, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<p className="text-slate-600">{t("auth.login.processing", "Processando autenticação...")}</p>
		</div>
	);
}
