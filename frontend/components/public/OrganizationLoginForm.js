"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import api from "@/lib/api";

export default function OrganizationLoginForm({ registered = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ adminEmail: "", password: "" });

  useEffect(() => {
    if (localStorage.getItem("fastExToken")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        adminEmail: formData.adminEmail.trim(),
        password: formData.password,
      });

      if (!response.data.token || !response.data.organization) {
        setError("Sign in failed because the server returned an invalid response.");
        return;
      }

      localStorage.setItem("fastExToken", response.data.token);
      localStorage.setItem("fastExUser", JSON.stringify(response.data.organization));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Sign in failed. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <header className="page-intro">
        <p className="eyebrow">Welcome back</p>
        <h1 className="text-4xl font-bold gradient-text md:text-5xl">Sign in</h1>
        <p className="text-lg">Access your organization workspace.</p>
      </header>

      <section className="card form-card auth-card" aria-labelledby="login-title">
        <div className="form-section-heading">
          <h2 id="login-title">Organization administrator</h2>
          <p>Enter the email and password associated with your organization.</p>
        </div>

        {registered && (
          <div className="form-feedback form-feedback-success" role="status">
            Your organization is registered. Sign in to continue.
          </div>
        )}
        {error && (
          <div className="form-feedback form-feedback-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label htmlFor="login-email">Administrator email</label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="login-email"
                name="adminEmail"
                type="email"
                autoComplete="email"
                placeholder="admin@yourorg.com"
                className="field-control with-icon"
                value={formData.adminEmail}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, adminEmail: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="field-control with-icon"
                value={formData.password}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, password: event.target.value }))
                }
                minLength={6}
                required
              />
              <span className="form-field-hint">Use at least 6 characters.</span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? (
              <>
                Signing in...
                <span className="form-spinner" aria-hidden="true" />
              </>
            ) : (
              <>
                Sign in
                <LogIn aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          New to Fast-Ex? <Link href="/get-going">Register your organization</Link>
        </p>
      </section>
    </div>
  );
}
