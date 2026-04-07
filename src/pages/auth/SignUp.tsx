import { useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/FormInput";
import Typography from "../../components/Typography";

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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(email, password, fullName);
      navigate("/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="z-10 flex size-full grow flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-card/10 p-appSpacing gap-appInnerSpacing mx-auto flex w-full max-w-md flex-col rounded-2xl shadow-md backdrop-blur-lg"
      >
        <Typography as="h2" className="mx-auto text-2xl font-semibold">Sign Up</Typography>
        {error ? <Typography as="p" className="text-sm text-red-600">{error}</Typography> : null}
        <FormInput
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Full name"
          required
        />
        <FormInput
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <div className="relative">
          <FormInput
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="pr-12"
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

        <div className="relative">
          <FormInput
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="pr-12"
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
        <div className="flex flex-col gap-2">
          <Checkbox
            isSelected={acceptTerms}
            onChange={setAcceptTerms}
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
                <Typography as="span" className="text-foreground-dimmed2">
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
                <Typography as="span" className="text-foreground-dimmed2">
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
