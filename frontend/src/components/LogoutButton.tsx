import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiFetch("http://localhost:8000/api/auth/logout/", { method: "DELETE" });
    } catch {
      // Ignora falha do backend e encerra a sessão local mesmo assim.
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Terminar sessao"
      aria-label="Terminar sessao"
      className="p-3.5 rounded-[5px] text-slate-500 transition hover:text-[#ec4348] hover:bg-[#ec4348]/25"
    >
      <IoLogOutOutline size={22} />
    </button>
  );
}
