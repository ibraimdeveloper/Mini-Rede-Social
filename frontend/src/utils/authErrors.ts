export function extractAuthErrorMessage(data: unknown): string | null {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data.trim() || null;
  }

  if (typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const directMessage = [record.detail, record.error, record.message]
    .find((value) => typeof value === "string" && value.trim());

  if (typeof directMessage === "string") {
    return directMessage.trim();
  }

  const fieldMessages = Object.values(record)
    .flatMap((value) => {
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }

      if (typeof value === "string" && value.trim()) {
        return [value];
      }

      return [];
    })
    .map((value) => value.trim());

  return fieldMessages.length > 0 ? fieldMessages.join(" ") : null;
}

export function mapAuthErrorKey(message: string | null): string | null {
  if (!message) {
    return null;
  }

  const normalizedMessage = message.trim().toLowerCase();

  if (
    normalizedMessage.includes("a user with that username already exists") ||
    normalizedMessage.includes("username already exists") ||
    normalizedMessage.includes("nome de utilizador já existe") ||
    normalizedMessage.includes("nome de usuário já existe")
  ) {
    return "auth.register.errorUsernameExists";
  }

  if (
    normalizedMessage.includes("user with this email already exists") ||
    normalizedMessage.includes("email already exists") ||
    normalizedMessage.includes("e-mail already exists") ||
    normalizedMessage.includes("email já existe") ||
    normalizedMessage.includes("e-mail já existe")
  ) {
    return "auth.register.errorEmailExists";
  }

  if (
    normalizedMessage.includes("this field is required") ||
    normalizedMessage.includes("this field may not be blank") ||
    normalizedMessage.includes("este campo é obrigatório")
  ) {
    return "auth.register.errorRequired";
  }

  if (
    normalizedMessage.includes("enter a valid email address") ||
    normalizedMessage.includes("invalid email") ||
    normalizedMessage.includes("email inválido") ||
    normalizedMessage.includes("e-mail inválido")
  ) {
    return "auth.register.errorInvalidEmail";
  }

  if (
    normalizedMessage.includes("passwords do not match") ||
    normalizedMessage.includes("password fields didn't match") ||
    normalizedMessage.includes("as senhas não coincidem")
  ) {
    return "auth.register.errorPasswordMismatch";
  }

  if (
    normalizedMessage.includes("this password is too short") ||
    normalizedMessage.includes("password is too short") ||
    normalizedMessage.includes("senha muito curta")
  ) {
    return "auth.register.errorPasswordTooShort";
  }

  if (
    normalizedMessage.includes("this password is too common") ||
    normalizedMessage.includes("password is too common") ||
    normalizedMessage.includes("senha muito comum")
  ) {
    return "auth.register.errorPasswordTooCommon";
  }

  if (
    normalizedMessage.includes("this password is entirely numeric") ||
    normalizedMessage.includes("password is entirely numeric") ||
    normalizedMessage.includes("senha é inteiramente numérica")
  ) {
    return "auth.register.errorPasswordNumeric";
  }

  if (
    normalizedMessage.includes("unable to log in with provided credentials") ||
    normalizedMessage.includes("no active account found with the given credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "auth.login.errorInvalidCredentials";
  }

  return null;
}

export function mapRegisterErrorKey(message: string | null): string | null {
  const genericKey = mapAuthErrorKey(message);

  if (genericKey?.startsWith("auth.register.")) {
    return genericKey;
  }

  if (genericKey === "auth.login.errorInvalidCredentials") {
    return "auth.register.errorBackend";
  }

  return genericKey;
}
