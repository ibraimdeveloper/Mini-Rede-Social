import { useMemo } from "react";

type ApiRoute = {
  method: string;
  path: string;
  auth: string;
  summary: string;
  howToUse: string;
  request?: string;
  response?: string;
};

type ApiSection = {
  title: string;
  description: string;
  routes: ApiRoute[];
};

const apiSections: ApiSection[] = [
  {
    title: "Autenticação",
    description: "Rotas para criar conta, entrar, sair e renovar o token JWT.",
    routes: [
      {
        method: "POST",
        path: "/api/auth/register/",
        auth: "Público",
        summary: "Cria um novo utilizador (exige confirmação da password) e devolve `access` e `refresh` tokens.",
        howToUse: "Use quando o utilizador estiver a criar a conta pela primeira vez; envie `password2` para confirmação.",
        request: "{ \"username\": \"joao\", \"email\": \"joao@exemplo.com\", \"password\": \"senhaSegura\", \"password2\": \"senhaSegura\" }",
        response: "{ user, access, refresh }",
      },
      {
        method: "POST",
        path: "/api/auth/login/",
        auth: "Público",
        summary: "Autentica com username e password e devolve tokens JWT.",
        howToUse: "Chama esta rota no formulário de login.",
        request: "{ \"username\": \"joao\", \"password\": \"senhaSegura\" }",
        response: "{ user, access, refresh }",
      },
      {
        method: "DELETE",
        path: "/api/auth/logout/",
        auth: "Autenticado",
        summary: "Regista o logout e invalida a sessão atual do utilizador.",
        howToUse: "Envie o Bearer token atual no header Authorization.",
        response: "{ message: \"Logout efetuado com sucesso.\" }",
      },
      {
        method: "GET",
        path: "/api/auth/profile/",
        auth: "Autenticado",
        summary: "Devolve o perfil do utilizador autenticado.",
        howToUse: "Use para preencher dados do perfil no frontend após o login.",
        response: "{ username, email, first_name, last_name, bio, avatar, ... }",
      },
      {
        method: "POST",
        path: "/api/auth/token/refresh/",
        auth: "Público",
        summary: "Renova o access token usando o refresh token.",
        howToUse: "Use quando o access token expirar.",
        request: "{ \"refresh\": \"<refresh_token>\" }",
        response: "{ access }",
      },
    ],
  },
  {
    title: "Password",
    description: "Rotas para alterar a password do utilizador autenticado.",
    routes: [
      {
        method: "POST",
        path: "/api/auth/password/change/",
        auth: "Autenticado",
        summary: "Altera a password atual após validar a password antiga.",
        howToUse: "Envie old_password, new_password e confirm_password no body.",
        request: "{ \"old_password\": \"...\", \"new_password\": \"...\", \"confirm_password\": \"...\" }",
        response: "{ message: \"Password alterada com sucesso.\" }",
      },
    ],
  },
  {
    title: "OAuth 42",
    description: "Fluxo de autenticação via 42 Intra.",
    routes: [
      {
        method: "GET",
        path: "/api/auth/42/",
        auth: "Público",
        summary: "Inicia o login OAuth com a 42.",
        howToUse: "Redirecione o utilizador para esta rota ao clicar em entrar com 42.",
      },
      {
        method: "GET",
        path: "/api/auth/42/callback/",
        auth: "Público",
        summary: "Recebe o callback da 42 e conclui o login.",
        howToUse: "Normalmente é chamado pelo próprio provider após a autorização.",
      },
    ],
  },
  {
    title: "Perfil e utilizadores",
    description: "Rotas para ver e editar perfil, procurar utilizadores e gerir amigos/bloqueios.",
    routes: [
      {
        method: "GET",
        path: "/api/auth/profile/me/",
        auth: "Autenticado",
        summary: "Mostra o perfil do próprio utilizador.",
        howToUse: "Use para carregar a página de perfil ou settings.",
      },
      {
        method: "PATCH",
        path: "/api/auth/profile/edit/",
        auth: "Autenticado",
        summary: "Atualiza username, nome, apelido e bio de forma parcial.",
        howToUse: "Envie apenas os campos que quer alterar.",
      },
      {
        method: "PATCH",
        path: "/api/auth/profile/avatar/",
        auth: "Autenticado",
        summary: "Atualiza o avatar do utilizador.",
        howToUse: "Envie `multipart/form-data` com o ficheiro em `avatar`.",
      },
      {
        method: "GET",
        path: "/api/auth/users/search/?search=joao",
        auth: "Autenticado",
        summary: "Procura utilizadores pelo username.",
        howToUse: "Passe o termo de busca na query `search`.",
      },
      {
        method: "GET",
        path: "/api/auth/users/<id>/",
        auth: "Autenticado",
        summary: "Mostra o perfil de outro utilizador.",
        howToUse: "Substitua `<id>` pelo ID numérico do utilizador.",
      },
      {
        method: "GET",
        path: "/api/auth/users/friends/",
        auth: "Autenticado",
        summary: "Lista os amigos do utilizador autenticado.",
        howToUse: "Use para alimentar a lista de amigos na interface.",
      },
      {
        method: "POST",
        path: "/api/auth/users/<id>/add-friend/",
        auth: "Autenticado",
        summary: "Adiciona um utilizador aos amigos.",
        howToUse: "Use quando o utilizador clicar em adicionar amigo.",
      },
      {
        method: "DELETE",
        path: "/api/auth/users/<id>/remove-friend/",
        auth: "Autenticado",
        summary: "Remove um utilizador da lista de amigos.",
        howToUse: "Use quando o utilizador retirar um amigo.",
      },
      {
        method: "POST",
        path: "/api/auth/users/<id>/block/",
        auth: "Autenticado",
        summary: "Bloqueia um utilizador e remove-o dos amigos se necessário.",
        howToUse: "Use para impedir mensagens e interações desse utilizador.",
      },
      {
        method: "DELETE",
        path: "/api/auth/users/<id>/unblock/",
        auth: "Autenticado",
        summary: "Desbloqueia um utilizador.",
        howToUse: "Use para restaurar a interação com o utilizador bloqueado.",
      },
    ],
  },
  {
    title: "Chat",
    description: "Rotas para conversas, mensagens e upload de ficheiros.",
    routes: [
      {
        method: "GET",
        path: "/api/chat/conversations/",
        auth: "Autenticado",
        summary: "Lista as conversas do utilizador autenticado.",
        howToUse: "Carrega a lista de chats da sidebar ou da página principal.",
      },
      {
        method: "POST",
        path: "/api/chat/conversations/",
        auth: "Autenticado",
        summary: "Cria ou recupera uma conversa com outro utilizador.",
        howToUse: "Envie `user_id` no body para iniciar a conversa.",
        request: "{ \"user_id\": 12 }",
      },
      {
        method: "GET",
        path: "/api/chat/conversations/<conversation_id>/messages/",
        auth: "Autenticado",
        summary: "Carrega o histórico de mensagens da conversa.",
        howToUse: "Substitua `<conversation_id>` pelo ID da conversa.",
      },
      {
        method: "POST",
        path: "/api/chat/conversations/<conversation_id>/upload/",
        auth: "Autenticado",
        summary: "Envia uma mensagem com ficheiro opcional.",
        howToUse: "Use `multipart/form-data` com `file` e opcionalmente `content`.",
      },
      {
        method: "DELETE",
        path: "/api/chat/messages/<message_id>/?for_everyone=true|false",
        auth: "Autenticado",
        summary: "Apaga a mensagem para todos ou apenas para o utilizador atual.",
        howToUse: "Use `for_everyone=true` apenas se o remetente quiser remover para todos.",
      },
    ],
  },
];

const methodStyles: Record<string, string> = {
  GET: "bg-sky-100 text-sky-700",
  POST: "bg-emerald-100 text-emerald-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-rose-100 text-rose-700",
};

export function ApiDocsPage() {
  const sections = useMemo(() => apiSections, []);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#F5F6FA] px-4 py-6 md:px-8 md:py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ec4348]">API</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-4xl">Rotas da API e como usar</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
            Esta página resume os endpoints do backend, o método HTTP esperado, quando é necessário autenticação
            e um exemplo rápido de uso para facilitar a integração no frontend.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Base URL</div>
              <div className="mt-2 break-all text-sm font-medium text-slate-900">http://localhost:8000</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Auth</div>
              <div className="mt-2 text-sm font-medium text-slate-900">Enviar `Authorization: Bearer &lt;token&gt;` nas rotas protegidas</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Formato</div>
              <div className="mt-2 text-sm font-medium text-slate-900">JSON, exceto uploads com `multipart/form-data`</div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{section.description}</p>
              </div>

              <div className="grid gap-4">
                {section.routes.map((route) => (
                  <article key={`${route.method}-${route.path}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${methodStyles[route.method] ?? "bg-slate-100 text-slate-700"}`}>
                            {route.method}
                          </span>
                          <code className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            {route.auth}
                          </code>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900">{route.path}</h3>
                        <p className="mt-1 text-sm text-slate-700">{route.summary}</p>
                      </div>
                      <div className="max-w-md rounded-lg bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">
                        <span className="block font-semibold text-slate-900">Como usar</span>
                        <span>{route.howToUse}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {route.request && (
                        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Request</div>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{route.request}</pre>
                        </div>
                      )}
                      {route.response && (
                        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Response</div>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">{route.response}</pre>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
