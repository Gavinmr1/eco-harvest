type AuthFieldName = "fullName" | "email" | "password" | "confirmPassword";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

export type AuthErrorResult = {
  message: string;
  fieldErrors?: AuthFieldErrors;
};

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const normalizeCode = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "";
  }

  const code = (error as FirebaseLikeError).code ?? "";
  return code.replace(/^auth\//, "").replace(/^firebase\//, "");
};

export const getAuthErrorResult = (error: unknown): AuthErrorResult => {
  const code = normalizeCode(error);

  switch (code) {
    case "invalid-email":
      return {
        message: "Enter a valid email address.",
        fieldErrors: { email: "Enter a valid email address." },
      };
    case "email-already-in-use":
      return {
        message: "That email is already in use. Try logging in instead.",
        fieldErrors: { email: "That email is already in use." },
      };
    case "weak-password":
      return {
        message: "Use a stronger password.",
        fieldErrors: { password: "Use at least 6 characters, and make it harder to guess." },
      };
    case "missing-password":
      return { message: "Enter your password.", fieldErrors: { password: "Enter your password." } };
    case "user-not-found":
    case "wrong-password":
    case "invalid-credential":
    case "invalid-login-credentials":
      return {
        message: "We could not log you in with that email and password.",
        fieldErrors: {
          email: "Check the email address.",
          password: "Check the password.",
        },
      };
    case "user-disabled":
      return { message: "This account has been disabled. Contact support for help." };
    case "too-many-requests":
      return { message: "Too many attempts. Wait a bit and try again." };
    case "network-request-failed":
      return { message: "Network error. Check your connection and try again." };
    case "operation-not-allowed":
      return { message: "Email/password sign-in is not enabled for this project yet." };
    case "requires-recent-login":
      return { message: "Please sign in again before making that change." };
    default:
      return {
        message: (error as FirebaseLikeError)?.message ?? "Something went wrong. Please try again.",
      };
  }
};

export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const getPasswordResetErrorResult = (error: unknown): AuthErrorResult => {
  const code = normalizeCode(error);

  switch (code) {
    case "invalid-email":
      return {
        message: "Enter a valid email address.",
        fieldErrors: { email: "Enter a valid email address." },
      };
    case "user-not-found":
    case "invalid-credential":
    case "missing-email":
      return {
        message: "We could not find an account with that email address.",
        fieldErrors: { email: "We could not find an account with that email address." },
      };
    case "too-many-requests":
      return { message: "Too many reset attempts. Wait a bit and try again." };
    case "network-request-failed":
      return { message: "Network error. Check your connection and try again." };
    case "operation-not-allowed":
      return { message: "Password reset is not enabled for this project yet." };
    default:
      return {
        message:
          (error as FirebaseLikeError)?.message ?? "Could not send the reset email. Try again.",
      };
  }
};
