import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-aria-components";
import { useAuth } from "../../hooks/useAuth";
import FormInput from "../../components/FormInput";
import Typography from "../../components/Typography";

export default function Login() {
  const { login, refreshAdminStatus } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      const isAdmin = await refreshAdminStatus(true);
      navigate(isAdmin ? "/admin" : "/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
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
        <Typography as="h2" className="mx-auto text-2xl font-semibold">Login</Typography>
        {error ? <Typography as="p" className="text-sm text-red-600">{error}</Typography> : null}
        <FormInput
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <FormInput
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          minLength={6}
          required
        />
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
      </form>
    </div>
  );
}
