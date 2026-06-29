import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/FormInput";
import Typography from "../../components/Typography";
import { getAuthErrorResult, isValidEmail, type AuthFieldErrors } from "../../lib/authErrors";

export default function Login() {
  const { login, refreshAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginHelpText = "Use the email and password from your Eco Harvest account.";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextFieldErrors: AuthFieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Enter your password.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("Fix the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    setFormError("");
    setIsSubmitting(true);

    try {
      await login(trimmedEmail, password);
      const isAdmin = await refreshAdminStatus(true);
      navigate(isAdmin ? "/admin" : "/account");
    } catch (err) {
      const { message, fieldErrors: nextErrors } = getAuthErrorResult(err);
      setFormError(message);
      if (nextErrors) {
        setFieldErrors((current: AuthFieldErrors) => ({ ...current, ...nextErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-appSpacing z-10 flex size-full grow flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-card/10 p-appSpacing gap-appInnerSpacing mx-auto flex w-full max-w-md flex-col rounded-2xl border border-white/10 shadow-md backdrop-blur-lg"
      >
        <Typography as="h2" className="mx-auto">
          Login
        </Typography>
        <Typography as="p" variant="muted" className="text-center">
          {loginHelpText}
        </Typography>
        {formError ? (
          <Typography
            as="p"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200"
          >
            {formError}
          </Typography>
        ) : null}
        <FormInput
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((current: AuthFieldErrors) => {
                const next = { ...current };
                delete next.email;
                return next;
              });
            }
          }}
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          className={
            fieldErrors.email
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
              : undefined
          }
          required
        />
        {fieldErrors.email ? (
          <Typography as="p" id="login-email-error" variant="caption" className="text-rose-200">
            {fieldErrors.email}
          </Typography>
        ) : null}
        <FormInput
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((current: AuthFieldErrors) => {
                const next = { ...current };
                delete next.password;
                return next;
              });
            }
          }}
          placeholder="Password"
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          className={
            fieldErrors.password
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
              : undefined
          }
          minLength={6}
          required
        />
        {fieldErrors.password ? (
          <Typography as="p" id="login-password-error" variant="caption" className="text-rose-200">
            {fieldErrors.password}
          </Typography>
        ) : null}
        <Typography as="p" variant="caption" className="text-foreground-dimmed3 text-center">
          Having trouble? Double-check the email spelling and that Caps Lock is off.
        </Typography>
        <div className="gap-appInnerSpacing flex">
          <Button type="submit" className="btn-primary w-1/2" isDisabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            onPress={() => navigate("/signup")}
            className="btn-secondary w-1/2"
            isDisabled={isSubmitting}
          >
            Sign up
          </Button>
        </div>
        <Button
          type="button"
          onPress={() => navigate("/forgot-password")}
          className="text-foreground-dimmed2 hover:text-foreground mx-auto text-sm transition-colors"
          isDisabled={isSubmitting}
        >
          Forgot your password?
        </Button>
      </form>
    </div>
  );
}
