import { useRoutes } from "react-router-dom";
import { PublicLayout } from "../components/layout/PublicLayout";
import { ChatPage } from "../pages/public/ChatPage";
import { SettingsPage } from "../pages/public/SettingsPage";
import { LoginPage } from "../pages/public/LoginPage";
import { RegisterPage } from "../pages/public/RegisterPage";
import { FriendProfilePage } from "../pages/public/FriendProfilePage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PrivacyPolicyPage } from "../pages/public/PrivacyPolicyPage";
import { TermsOfServicePage } from "../pages/public/TermsOfServicePage";
import { OAuth42Callback } from "../pages/public/OAuth42Callback";
import { OAuthGithubCallback } from "../pages/public/OAuthGithubCallback";
import { ApiDocsPage } from "../pages/public/ApiDocsPage";

export function AppRoutes () {
    return useRoutes([
        { path: "/login", element: <LoginPage /> },
        { path: "/auth/42/callback", element: <OAuth42Callback /> },
        { path: "/auth/github/callback", element: <OAuthGithubCallback /> },
        { path: "/register", element: <RegisterPage /> },
        { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
        { path: "/terms-of-service", element: <TermsOfServicePage /> },
        { path: "/api", element: <ProtectedRoute><ApiDocsPage /></ProtectedRoute> },
        {
            element: <ProtectedRoute><PublicLayout /></ProtectedRoute>,
            children:[
                {path: "/", element: <ChatPage />},
                {path: "/settings", element: <SettingsPage />},
                {path: "/friends/:friendId", element: <FriendProfilePage />}
            ]
        }
    ])
}
