import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
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
      navigate("/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md p-4">
      <h2 className="mb-4 text-xl font-semibold">Login</h2>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-3 block w-full rounded border p-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="mb-4 block w-full rounded border p-2"
        minLength={6}
        required
      />
      <div className="flex gap-4">
        <button
          type="submit"
          className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="cursor-pointer rounded bg-gray-200 px-4 py-2 text-black transition-all hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
