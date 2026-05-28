import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function LegalLinks({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <nav className={className} aria-label={t("legal.linksAriaLabel")}>
      <Link to="/privacy-policy" className="text-slate-500 hover:text-[#ec4348] transition">
        {t("legal.privacy.title")}
      </Link>
      <span className="text-slate-400">·</span>
      <Link to="/terms-of-service" className="text-slate-500 hover:text-[#ec4348] transition">
        {t("legal.terms.title")}
      </Link>
    </nav>
  );
}
