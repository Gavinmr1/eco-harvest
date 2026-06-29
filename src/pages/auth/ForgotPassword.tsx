import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/FormInput";
import Typography from "../../components/Typography";
import {
  getPasswordResetErrorResult,
  isValidEmail,
  type AuthFieldErrors,
} from "../../lib/authErrors";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const nextFieldErrors: AuthFieldErrors = {};

    if (!trimmedEmail) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("Fix the highlighted field and try again.");
      setSuccessMessage("");
      return;
    }

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await sendPasswordReset(trimmedEmail);
      setSuccessMessage("If an account exists for that email, we sent a reset link.");
    } catch (err) {
      const { message, fieldErrors: nextErrors } = getPasswordResetErrorResult(err);
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
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-transparent px-4 py-4">
          <Typography as="h2" className="mx-auto text-center">
            Reset Password
          </Typography>
          <Typography as="p" variant="muted" className="mt-2 text-center">
            Enter the email address for your account and we’ll send a reset link.
          </Typography>
        </div>
        <Typography as="p" variant="caption" className="text-foreground-dimmed3 text-center">
          The link will go to your inbox, and you can come right back here when you are done.
        </Typography>
        {formError ? (
          <Typography
            as="p"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200"
          >
            {formError}
          </Typography>
        ) : null}
        {successMessage ? (
          <Typography
            as="p"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200"
          >
            {successMessage}
          </Typography>
        ) : null}
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
          <Typography as="p" variant="caption" className="text-foreground-dimmed3 mb-1">
            What happens next
          </Typography>
          <Typography as="p" variant="caption" className="text-foreground-dimmed2">
            We send a reset email only after a valid address is entered. If the address is not
            found, the site still keeps the response vague for safety.
          </Typography>
        </div>
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
          aria-describedby={fieldErrors.email ? "reset-email-error" : undefined}
          className={
            fieldErrors.email
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
              : undefined
          }
          required
        />
        {fieldErrors.email ? (
          <Typography as="p" id="reset-email-error" variant="caption" className="text-rose-200">
            {fieldErrors.email}
          </Typography>
        ) : null}
        <div className="gap-appInnerSpacing flex flex-col sm:flex-row">
          <Button type="submit" className="btn-primary w-full sm:w-1/2" isDisabled={isSubmitting}>
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </Button>
          <Button
            type="button"
            onPress={() => navigate("/login")}
            className="btn-secondary w-full sm:w-1/2"
            isDisabled={isSubmitting}
          >
            Back to login
          </Button>
        </div>
      </form>
    </div>
  );
}
