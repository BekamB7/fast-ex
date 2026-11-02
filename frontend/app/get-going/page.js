// frontend/app/get-going/page.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Mail, Lock, Phone, MapPin } from "lucide-react";
import api from "@/lib/api";
import { notifyToast } from "@/components/ui/feedback";

export default function GetGoing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", formData);

      if (response.data) {
        // Registration successful, redirect to login or dashboard
        notifyToast("Organization registered. Please sign in to continue.", "success");
        router.push("/dashboard/login");
      }
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
        <form onSubmit={handleSubmit} className="form-stack">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="field">
            <label>Organization Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Your organization name"
                className="field-control with-icon"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Admin Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="admin@yourorg.com"
                className="field-control with-icon"
                value={formData.adminEmail}
                onChange={(e) =>
                  setFormData({ ...formData, adminEmail: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Min 6 characters"
                className="field-control with-icon"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="field">
            <label>Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="0912345678"
                className="field-control with-icon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="field">
            <label>Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                placeholder="Your organization address"
                className="field-control with-icon"
                rows="2"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              "Registering..."
            ) : (
              <>
                Register Organization
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
