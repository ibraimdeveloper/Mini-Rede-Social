import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeroImage from "../../assets/logo-defualt.png";
import { LegalLinks } from "../../components/LegalLinks";
import { extractAuthErrorMessage, mapAuthErrorKey } from "../../utils/authErrors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (window.location.port === "5173"
	? "http://localhost:8000/api/auth/"
	: `${window.location.origin}/api/auth/`);

export function LoginPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const oauthError = searchParams.get("oauthError");
		if (oauthError) {
			setError(oauthError);
		}
	}, [location.search]);

	const handleOAuth42Login = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}42/`);
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch {
			setError(t("auth.login.errorNetwork"));
		}
	};

	const handleOAuthGithubLogin = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}github/`);
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch {
			setError(t("auth.login.errorNetwork"));
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!username.trim() || !password.trim()) {
			setError(t("auth.login.errorRequired"));
			return;
		}

		setError("");
		try {
			const response = await fetch(`${API_BASE_URL}login/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data && data.access) {
					localStorage.setItem('authToken', data.access);
					if (data.refresh) {
						localStorage.setItem('refreshToken', data.refresh);
					}
				}
				navigate("/");
			} else {
				const data = await response.json().catch(() => null);
				const rawBackendMsg = extractAuthErrorMessage(data);
				const backendMsg = rawBackendMsg?.toLowerCase() ?? "";
				const mappedErrorKey = mapAuthErrorKey(rawBackendMsg);
				const looksLikeCredentialsError =
				response.status === 401 ||
				response.status === 403 ||
				mappedErrorKey === "auth.login.errorInvalidCredentials" ||
				backendMsg.includes("invalid credentials") ||
				backendMsg.includes("unable to log in") ||
				backendMsg.includes("no active account") ||
					backendMsg.includes("password") ||
					backendMsg.includes("senha") ||
					backendMsg.includes("utilizador") ||
					backendMsg.includes("username") ||
					backendMsg.includes("user");

				setError(
					looksLikeCredentialsError
						? t("auth.login.errorInvalidCredentials")
						: mappedErrorKey
							? t(mappedErrorKey)
							: t("auth.login.errorBackend")
				);
			}
		} catch {
			setError(t("auth.login.errorNetwork"));
		}
	};

	return (
		<main className="min-h-screen w-full bg-white px-4 py-6 md:p-8 flex items-center justify-center flex-col">
				<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center items-center">
					<img src={HeroImage} alt="" className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[350px] h-auto"/>
				</div>
				<div className="w-full max-w-md p-5 sm:p-6 md:p-8 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
					<div className="w-full">
						<header className="mb-6 flex flex-col justify-center items-center">
							<h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">{t("auth.login.title")}</h1>
							<p className="text-sm text-slate-500 mt-1 text-center">
								{t("auth.login.subtitle")}
							</p>
						</header>

						<form className="space-y-4" onSubmit={handleSubmit}>
							<div>
								<label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
									{t("auth.login.username")}
								</label>
								<input
									id="username"
									type="text"
									placeholder={t("auth.login.usernamePlaceholder")}
									className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
								/>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
									{t("auth.login.password")}
								</label>
								<input
									id="password"
									type="password"
									placeholder={t("auth.login.passwordPlaceholder")}
									className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
								/>
							</div>

							{error ? <p className="text-sm text-red-600">{error}</p> : null}
							
							<button
								type="submit"
								className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 transition-colors"
							>
								{t("auth.login.submit")}
							</button>
							<div className="flex justify-end">
								<Link to="/register" className="text-sm text-slate-600 hover:text-slate-800 font-medium">
									{t("auth.login.register")}
								</Link>
							</div>	

							<div className="flex items-center justify-center gap-4 mt-6">
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={handleOAuth42Login}
										className="w-12 h-12 bg-white rounded-full border border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
										aria-label="Login com 42"
									>
										<img src="/download.png" alt="logo 42" className="w-6 h-6 object-contain" />
									</button>
									<button
										type="button"
										onClick={handleOAuthGithubLogin}
										className="w-12 h-12 bg-white rounded-full border border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
										aria-label="Login com GitHub"
									>
									<img src="/github.svg" alt="logo 42" className="w-6 h-6 object-contain" />
									</button>
								</div>
					</div>
				</form>
				<LegalLinks className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm" />
					</div>
				</div>
		</main>
	);
}
