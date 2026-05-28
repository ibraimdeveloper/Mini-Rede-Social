import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";

const AUTH_CHANGE_EVENT = "authchange";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/auth/";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("authToken"));

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await apiFetch(`${API_BASE_URL}profile/`);
        if (!response.ok) {
          localStorage.removeItem("authToken");
          window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        // Se a rede falhar, não alteramos o estado aqui.
      }
    };

    const syncAuth = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      void validateAuth();
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

    syncAuth();

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
    };
  }, []);

  return { isAuthenticated };
}
