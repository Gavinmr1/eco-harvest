import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/FormInput";
import Typography from "../../components/Typography";
import { getAuthErrorResult, isValidEmail, type AuthFieldErrors } from "../../lib/authErrors";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecklist = [
    {
      label: "At least 6 characters",
      complete: password.length >= 6,
    },
    {
      label: "Passwords match",
      complete: Boolean(password) && password === confirmPassword,
    },
    {
      label: "Use a password you do not reuse elsewhere",
      complete: password.length >= 6,
    },
  ];

  const clearFieldError = (field: keyof AuthFieldErrors) => {
    setFieldErrors((current: AuthFieldErrors) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const nextFieldErrors: AuthFieldErrors = {};

    if (!trimmedFullName) {
      nextFieldErrors.fullName = "Enter your full name.";
    }

    if (!trimmedEmail) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Enter a password.";
    } else if (password.length < 6) {
      nextFieldErrors.password = "Use at least 6 characters.";
    }

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      setFormError("Please accept the terms and privacy policy to continue.");
      setFieldErrors(nextFieldErrors);
      return;
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
      await signup(trimmedEmail, password, trimmedFullName);
      navigate("/account");
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
          Sign Up
        </Typography>
        <Typography as="p" variant="muted" className="text-center">
          Create your account in a few quick steps.
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
          type="text"
          value={fullName}
          onChange={e => {
            setFullName(e.target.value);
            clearFieldError("fullName");
          }}
          placeholder="Full name"
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "signup-fullname-error" : undefined}
          className={
            fieldErrors.fullName
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
              : undefined
          }
          required
        />
        {fieldErrors.fullName ? (
          <Typography as="p" id="signup-fullname-error" variant="caption" className="text-rose-200">
            {fieldErrors.fullName}
          </Typography>
        ) : null}
        <FormInput
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          placeholder="Email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          className={
            fieldErrors.email
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
              : undefined
          }
          required
        />
        {fieldErrors.email ? (
          <Typography as="p" id="signup-email-error" variant="caption" className="text-rose-200">
            {fieldErrors.email}
          </Typography>
        ) : null}

        <div className="relative">
          <FormInput
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              clearFieldError("password");
              if (confirmPassword) {
                clearFieldError("confirmPassword");
              }
            }}
            placeholder="Password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
            className={clsx(
              "pr-12",
              fieldErrors.password
                ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
                : undefined
            )}
            minLength={6}
            required
          />
          <Button
            type="button"
            aria-label={showPassword ? "Hide Password" : "Show Password"}
            onPress={() => setShowPassword(current => !current)}
            className="text-foreground-dimmed3 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs transition-colors duration-300"
          >
            {showPassword ? "Hide" : "Show"}
          </Button>
        </div>
        {fieldErrors.password ? (
          <Typography as="p" id="signup-password-error" variant="caption" className="text-rose-200">
            {fieldErrors.password}
          </Typography>
        ) : null}

        <div className="relative">
          <FormInput
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              clearFieldError("confirmPassword");
            }}
            placeholder="Confirm password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined
            }
            className={clsx(
              "pr-12",
              fieldErrors.confirmPassword
                ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-400"
                : undefined
            )}
            minLength={6}
            required
          />
          <Button
            type="button"
            aria-label={showConfirmPassword ? "Hide Confirm Password" : "Show Confirm Password"}
            onPress={() => setShowConfirmPassword(current => !current)}
            className="text-foreground-dimmed3 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs transition-colors duration-300"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </Button>
        </div>
        {fieldErrors.confirmPassword ? (
          <Typography
            as="p"
            id="signup-confirm-password-error"
            variant="caption"
            className="text-rose-200"
          >
            {fieldErrors.confirmPassword}
          </Typography>
        ) : null}
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
          <Typography as="p" variant="caption" className="text-foreground-dimmed3 mb-2">
            Password checklist
          </Typography>
          <ul className="space-y-2">
            {passwordChecklist.map(item => (
              <li key={item.label} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={clsx(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors duration-300",
                    item.complete
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : "border-background-border-dimmed1 bg-background-dimmed1 text-foreground-dimmed3"
                  )}
                >
                  {item.complete ? "✓" : ""}
                </span>
                <Typography as="span" variant="caption" className="text-foreground-dimmed2">
                  {item.label}
                </Typography>
              </li>
            ))}
          </ul>
          <Typography as="p" variant="caption" className="text-foreground-dimmed3 mt-2">
            If the password is weak, Firebase may reject it even if both fields match.
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Checkbox
            isSelected={acceptTerms}
            onChange={value => {
              setAcceptTerms(value);
              if (value) {
                setFormError("");
              }
            }}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            {({ isSelected }) => (
              <>
                <div
                  aria-hidden="true"
                  className={clsx(
                    "flex size-4 shrink-0 items-center justify-center rounded border text-sm font-bold transition-colors duration-300",
                    isSelected
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-background-border-dimmed1 bg-background-dimmed1"
                  )}
                >
                  {isSelected ? "✓" : null}
                </div>
                <Typography as="span" variant="muted">
                  I agree to the Terms of Service and Privacy Policy.
                </Typography>
              </>
            )}
          </Checkbox>

          <Checkbox
            isSelected={marketingOptIn}
            onChange={setMarketingOptIn}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            {({ isSelected }) => (
              <>
                <div
                  aria-hidden="true"
                  className={clsx(
                    "flex size-4 shrink-0 items-center justify-center rounded border text-sm font-bold transition-colors duration-300",
                    isSelected
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-background-border-dimmed1 bg-background-dimmed1"
                  )}
                >
                  {isSelected ? "✓" : null}
                </div>
                <Typography as="span" variant="muted">
                  Send me product updates and seasonal offers.
                </Typography>
              </>
            )}
          </Checkbox>
        </div>

        <Button
          type="submit"
          className="btn-primary w-full"
          isDisabled={isSubmitting || !acceptTerms}
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </div>
  );
}
