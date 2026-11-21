"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Mail, Lock, Phone, MapPin } from "lucide-react";
import api from "@/lib/api";
import { notifyToast } from "@/components/ui/feedback";

const initialFormData = {
  name: "",
  adminEmail: "",
  password: "",
  phone: "",
  address: "",
};

export default function GetGoing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    const name = formData.name.trim();
    const adminEmail = formData.adminEmail.trim();

    if (name.length < 2) {
      errors.name = "Enter an organization name with at least 2 characters.";
    } else if (name.length > 100) {
      errors.name = "Organization names must be 100 characters or fewer.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      errors.adminEmail = "Enter a valid administrator email address.";
    }

    if (formData.password.length < 6) {
      errors.password = "Use at least 6 characters for your password.";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await api.post("/auth/register", {
        ...formData,
        name,
        adminEmail,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      notifyToast("Organization registered. Please sign in to continue.", "success");
      router.push("/login?registered=1");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    fieldErrors[field] ? (
      <span className="form-field-error" id={`${field}-error`}>
        {fieldErrors[field]}
      </span>
    ) : null;

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-intro"
      >
        <p className="eyebrow">Start with clarity</p>
        <h1 className="text-4xl font-bold gradient-text md:text-5xl">
          Get Going
        </h1>
        <p className="text-lg">Register your organization to get started</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card form-card"
      >
        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          {error && (
            <div className="form-feedback form-feedback-error" role="alert">
              {error}
            </div>
          )}

          <section className="form-section" aria-labelledby="organization-details">
            <div className="form-section-heading">
              <h2 id="organization-details">Organization details</h2>
              <p>Set up the organization learners will see.</p>
            </div>

            <div className="field">
              <label htmlFor="organization-name">Organization name *</label>
              <div className="relative">
                <Building2 aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="organization-name"
                  name="name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your organization name"
                  className="field-control with-icon"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
              {fieldError("name")}
            </div>

            <div className="field">
              <label htmlFor="organization-phone">Phone number <span>(optional)</span></label>
              <div className="relative">
                <Phone aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="organization-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Your contact number"
                  className="field-control with-icon"
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="organization-address">Address <span>(optional)</span></label>
              <div className="relative">
                <MapPin aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  id="organization-address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="Organization address"
                  className="field-control with-icon"
                  rows={2}
                  value={formData.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="form-section" aria-labelledby="administrator-account">
            <div className="form-section-heading">
              <h2 id="administrator-account">Administrator account</h2>
              <p>Use these details to manage your exam workspace.</p>
            </div>

            <div className="field">
              <label htmlFor="admin-email">Administrator email *</label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="admin-email"
                  name="adminEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@yourorg.com"
                  className="field-control with-icon"
                  value={formData.adminEmail}
                  onChange={(event) => updateField("adminEmail", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.adminEmail)}
                  aria-describedby={fieldErrors.adminEmail ? "adminEmail-error" : undefined}
                  required
                />
              </div>
              {fieldError("adminEmail")}
            </div>

            <div className="field">
              <label htmlFor="admin-password">Password *</label>
              <div className="relative">
                <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="field-control with-icon"
                  value={formData.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
                  minLength={6}
                  required
                />
              </div>
              {fieldError("password") || (
                <span className="form-field-hint" id="password-hint">
                  Use at least 6 characters.
                </span>
              )}
            </div>
          </section>

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                Registering…
                <span className="form-spinner" aria-hidden="true" />
              </>
            ) : (
              <>
                Register organization
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="auth-switch">
            Already have an organization? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
