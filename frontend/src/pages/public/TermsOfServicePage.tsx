import { useTranslation } from "react-i18next";
import {useNavigate} from "react-router-dom";

export function TermsOfServicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (

    <main className="min-h-screen w-full bg-white px-4 py-6 md:p-8 flex justify-center">
     <button 
        onClick={() => navigate('/login')}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Voltar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <section className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("legal.terms.title")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("legal.lastUpdated")}</p>
        <div className="mt-6 space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("legal.terms.sections.acceptance.title")}</h2>
            <p className="mt-2">{t("legal.terms.sections.acceptance.body")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("legal.terms.sections.account.title")}</h2>
            <p className="mt-2">{t("legal.terms.sections.account.body")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("legal.terms.sections.acceptableUse.title")}</h2>
            <p className="mt-2">{t("legal.terms.sections.acceptableUse.body")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("legal.terms.sections.availability.title")}</h2>
            <p className="mt-2">{t("legal.terms.sections.availability.body")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">{t("legal.terms.sections.termination.title")}</h2>
            <p className="mt-2">{t("legal.terms.sections.termination.body")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              {t("legal.privacy.sections.contact.title")}
            </h2>
          
            <p className="mt-2">
              {t("legal.privacy.sections.contact.body")}{" "}
              <a
                href="mailto:zyder42@gmail.com"
                className="text-blue-600 hover:underline"
              >
                zyder42@gmail.com
              </a>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
