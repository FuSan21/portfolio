"use client";

import emailjs from "@emailjs/browser";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { SectionHeading } from "@/components/sub/section-heading";

const EMAIL = "fuad.antor@gmail.com";

const inputClass =
  "w-full border-0 border-b-2 border-carbon/30 bg-transparent px-0 py-3 text-lg text-carbon placeholder:text-carbon/40 focus:border-copy focus:outline-none disabled:opacity-50";

// Contact
export const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // handle form change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSent(false);
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // validate form on submit
  const validateForm = () => {
    const { name, email, message } = form;
    const errors: Record<string, boolean> = {};

    errors.name = name.trim().length < 3;
    errors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim().toLowerCase()
    );
    errors.message = message.trim().length < 5;

    Object.entries(errors).forEach(([field, hasError]) => {
      const errorElement = document.querySelector(`#${field}-error`);
      if (errorElement) {
        errorElement.classList.toggle("hidden", !hasError);
      }
    });

    return Object.values(errors).every((error) => !error);
  };

  // handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_TEMPLATE_ID || "",
        {
          from_name: form.name,
          to_name: "Fuad Hasan",
          from_email: form.email.trim().toLowerCase(),
          to_email: process.env.NEXT_PUBLIC_EMAILJS_RECIEVER,
          reply_to: form.email.trim().toLowerCase(),
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_KEY
      );
      // Only clear the form once it has actually been sent, so a failed
      // send doesn't throw away what the visitor wrote.
      setForm({ name: "", email: "", message: "" });
      setSent(true);
    } catch (error) {
      console.error("[CONTACT_ERROR]: ", error);
      toast.error(
        `Message not sent. Check your connection and try again, or email ${EMAIL}.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact-us"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28 md:px-10"
    >
      <SectionHeading title="Contact" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="max-w-sm text-lg leading-relaxed text-form/80">
            Have a process that needs untangling? Send a message here, or email{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-form underline decoration-copy underline-offset-4"
            >
              {EMAIL}
            </a>
            .
          </p>
        </div>

        {/* Intake form, printed on paper. */}
        <div className="relative bg-form p-6 text-carbon md:p-10">
          <p className="mono-label flex justify-between border-b-2 border-carbon pb-3 text-carbon/70">
            <span>Intake form</span>
            <span>All fields required</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
            {/* Name */}
            <label htmlFor="name" className="flex flex-col">
              <span className="mono-label text-carbon/70">Name</span>
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                disabled={loading}
                aria-disabled={loading}
                className={inputClass}
              />

              {/* Invalid Name */}
              <span
                className="mt-2 hidden text-sm text-[#A3271C]"
                id="name-error"
              >
                Enter at least 3 characters.
              </span>
            </label>

            {/* Email */}
            <label htmlFor="email" className="flex flex-col">
              <span className="mono-label text-carbon/70">Email</span>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                aria-disabled={loading}
                className={inputClass}
              />

              {/* Invalid Email */}
              <span
                className="mt-2 hidden text-sm text-[#A3271C]"
                id="email-error"
              >
                Enter an email address so I can reply.
              </span>
            </label>

            {/* Message */}
            <label htmlFor="message" className="flex flex-col">
              <span className="mono-label text-carbon/70">Message</span>
              <textarea
                rows={6}
                name="message"
                id="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What are you working on?"
                disabled={loading}
                aria-disabled={loading}
                className={`${inputClass} resize-y disabled:resize-none`}
              />

              {/* Invalid Message */}
              <span
                className="mt-2 hidden text-sm text-[#A3271C]"
                id="message-error"
              >
                Write at least 5 characters.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="mono-label w-fit bg-stamp px-6 py-3 text-sm font-bold text-carbon transition-colors hover:bg-[#EA6457] disabled:opacity-60"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>

          <p role="status" className="sr-only">
            {sent ? "Message sent." : ""}
          </p>
          <AnimatePresence>
            {sent && (
              <motion.p
                aria-hidden
                initial={{ opacity: 0, scale: 1.8, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="mono-label pointer-events-none absolute bottom-10 right-8 border-[3px] border-stamp px-4 py-2 text-lg font-bold text-stamp"
              >
                Received
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
