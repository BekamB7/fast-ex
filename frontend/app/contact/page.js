// frontend/app/contact/page.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (will integrate with API later)
    alert("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="container py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-intro"
      >
        <p className="eyebrow">We are here to help</p>
        <h1 className="text-4xl font-bold gradient-text md:text-5xl">
          Contact Us
        </h1>
        <p className="text-lg">
          Have questions? We&apos;d love to hear from you.
        </p>
      </motion.div>

      <div className="contact-layout grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="card">
            <p className="section-label">Contact details</p>
            <h2 className="mt-2 mb-6 text-2xl font-semibold">Get in Touch</h2>
            <div className="info-list">
              <div className="info-row">
                <div className="info-icon">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Email
                  </p>
                  <p className="font-medium">support@fast-ex.com</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Phone
                  </p>
                  <p className="font-medium">+251-XXX-XXXXXX</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Location
                  </p>
                  <p className="font-medium">Addis Ababa, Ethiopia</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card form-card"
        >
          <p className="section-label">Drop us a line</p>
          <h2 className="mt-2 mb-6 text-2xl font-semibold">Send a Message</h2>
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="field-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="field-control"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea
                rows="4"
                placeholder="Your message..."
                className="field-control"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Send Message
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
