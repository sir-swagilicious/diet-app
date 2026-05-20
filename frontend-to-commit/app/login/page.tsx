"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, login, register } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("fullName") ?? "User");

    try {
      if (mode === "register") {
        await register(email, password, name);
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
              ? "Log in to continue your meal plan."
              : "Create your account and start planning meals."}
          </div>

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
                  className="form-input"
                  type="password"
                  placeholder="Repeat password"
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
            <button className="social-btn">Google</button>
            <button className="social-btn">GitHub</button>
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