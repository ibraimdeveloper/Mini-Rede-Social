import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HeroImage from "../../assets/logo-defualt.png";
import { LegalLinks } from "../../components/LegalLinks";
import { extractAuthErrorMessage, mapRegisterErrorKey } from "../../utils/authErrors";

export function RegisterPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
			setError(t("auth.register.errorRequired"));
			return;
		}

		if (password !== confirmPassword) {
			setError(t("auth.register.errorPasswordMismatch"));
			return;
		}

		setError("");
		try {
			const response = await fetch("http://localhost:8000/api/auth/register/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					email,
					password,
					password2: confirmPassword,
				}),
			});

			if (response.ok) {
				navigate("/login");
			} else {
				const data = await response.json().catch(() => null);
				const backendMsg = extractAuthErrorMessage(data);
				const knownErrorKey = mapRegisterErrorKey(backendMsg);
				setError(knownErrorKey ? t(knownErrorKey) : backendMsg || t("auth.register.errorBackend"));
			}
		} catch {
			setError(t("auth.register.errorNetwork"));
		}
	};

	return (
		<main className="min-h-screen w-full bg-white px-4 py-6 md:p-8 flex items-center justify-center flex-col">
			<div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center items-center">
				<img src={HeroImage} alt="" className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px] h-auto" />
			</div>
			<div className="w-full max-w-md p-5 sm:p-6 md:p-8 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
				<div className="w-full">
					<header className="mb-6 flex flex-col justify-center items-center">
						<h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">{t("auth.register.title")}</h1>
						<p className="text-sm text-slate-500 mt-1 text-center">{t("auth.register.subtitle")}</p>
					</header>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
								{t("auth.register.username")}
							</label>
							<input
								id="username"
								type="text"
								placeholder={t("auth.register.usernamePlaceholder")}
								className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
								{t("auth.register.email")}
							</label>
								<input
									id="email"
									type="email"
									placeholder={t("auth.register.emailPlaceholder")}
									className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
								/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
								{t("auth.register.password")}
							</label>
								<input
									id="password"
									type="password"
									placeholder={t("auth.register.passwordPlaceholder")}
									className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
								/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
								{t("auth.register.confirmPassword")}
							</label>
								<input
									id="confirmPassword"
									type="password"
									placeholder={t("auth.register.passwordPlaceholder")}
									className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-transparent"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
								/>
						</div>

						{error ? <p className="text-sm text-red-600">{error}</p> : null}

						<button
							type="submit"
							className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 transition-colors"
						>
							{t("auth.register.submit")}
						</button>

						<p className="text-sm text-center text-slate-600">
							{t("auth.register.hasAccount")}{" "}
							<Link to="/login" className="text-red-500 hover:text-red-600 font-medium">
								{t("auth.register.login")}
							</Link>
						</p>
					</form>
					<LegalLinks className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm" />
				</div>
			</div>
		</main>
	);
}
