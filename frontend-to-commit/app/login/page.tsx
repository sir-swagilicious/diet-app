"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getAuthUser, login, register, type AuthUser } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setLoggedInUser(getAuthUser());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "User");

    if (mode === "register") {
      const confirm = String(form.get("confirmPassword") ?? "");
      if (password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "register") {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not reach backend. Start API on http://localhost:8000";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link href="/" className="auth-logo">
          <div className="logo-icon">🍽</div>
          <span>MealMaster</span>
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-left">
          <h1 className="auth-title">
            Plan meals smarter with your AI kitchen assistant
          </h1>

          <p className="auth-subtitle">
            MealMaster helps you plan meals, use products from your fridge,
            track nutrition, and create shopping lists without stress.
          </p>

          <div className="auth-features">
            <div className="auth-feature">🥗 Personalized meal planning</div>
            <div className="auth-feature">🧊 Fridge inventory tracking</div>
            <div className="auth-feature">🛒 Smart shopping lists</div>
            <div className="auth-feature">📊 Calories and macros tracking</div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>

          <div className="auth-card-subtitle">
            {mode === "login"
              ? "Log in to get a JWT token for the API."
              : "Register to save your meal data in the database."}
          </div>

          {loggedInUser && (
            <div className="page-subtitle" style={{ marginBottom: 12 }}>
              Already logged in as {loggedInUser.email}.{" "}
              <Link href="/">Go to dashboard</Link>
            </div>
          )}

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Sign up
            </button>
          </div>

          {error && (
            <div
              className="page-subtitle"
              style={{ color: "#d92d20", marginBottom: 12 }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  className="form-input"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                className="form-input"
                type="password"
                placeholder="Enter password"
                required
              />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  type="password"
                  placeholder="Repeat password"
                  required
                />
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Connecting..."
                : mode === "login"
                  ? "Login"
                  : "Create account"}
            </button>
          </form>

          <div className="auth-divider">or continue with</div>

          <div className="social-buttons">
            <button type="button" className="social-btn" disabled>
              Google
            </button>
            <button type="button" className="social-btn" disabled>
              GitHub
            </button>
          </div>

          <div className="auth-note">
            {mode === "login" ? (
              <>
                No account yet?{" "}
                <span
                  className="auth-link"
                  onClick={() => setMode("register")}
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="auth-link" onClick={() => setMode("login")}>
                  Login
                </span>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
