"use client";

import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { toast } from "sonner";

import { EarthCanvas } from "@/components/sub/earth";
import { slideIn, staggerContainer } from "@/lib/motion";
// Contact
export const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // handle form change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });
  };

  // validate form on submit
  const validateForm = () => {
    // form fields
    const { name, email, message } = form;

    type Current = {
      name: boolean;
      email: boolean;
      message: boolean;
    };

    // Error message
    const nameError = document.querySelector("#name-error")!;
    const emailError = document.querySelector("#email-error")!;
    const messageError = document.querySelector("#message-error")!;
    const current: Current = { name: false, email: false, message: false };

    // validate name
    if (name.trim().length < 3) {
      nameError.classList.remove("hidden");
      current["name"] = false;
    } else {
      nameError.classList.add("hidden");
      current["name"] = true;
    }
    const email_regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // valiate email
    if (!email.trim().toLowerCase().match(email_regex)) {
      emailError.classList.remove("hidden");
      current["email"] = false;
    } else {
      emailError.classList.add("hidden");
      current["email"] = true;
    }

    // validate message
    if (message.trim().length < 5) {
      messageError.classList.remove("hidden");
      current["message"] = false;
    } else {
      messageError.classList.add("hidden");
      current["message"] = true;
    }

    // True if all fields are validated
    return Object.keys(current).every(
      (k) => current[k as keyof typeof current]
    );
  };

  // handle form submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // prevent default page reload
    e.preventDefault();

    // validate form
    if (!validateForm()) return false;

    // show loader
    setLoading(true);

    // send email
    emailjs
      .send(
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
      )
      .then(() => toast.success("Thanks for contacting me."))
      .catch((error) => {
        // Error handle
        console.log("[CONTACT_ERROR]: ", error);
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
        setForm({
          name: "",
          email: "",
          message: "",
        });
      });
  };

  return (
    <section id="contact-us" className="container mx-auto">
      <motion.div
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className={
          "sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0"
        }
      >
        <span className="hash-span" id="contact">
          &nbsp;
        </span>
        <div className="xl:mt-12 xl:flex-row flex-col-reverse flex gap-10 overflow-hidden">
          <motion.div
            variants={slideIn("left", "tween", 0.2, 1)}
            className="flex-[0.75] bg-[#100d25] p-8 rounded-2xl"
          >
            {/* Title */}
            <p className="sm:text-[18px] text-[14px] text-[#aaa6c3] uppercase tracking-wider">
              Get in touch
            </p>
            <h3 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
              Contact.
            </h3>

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="mt-12 flex flex-col gap-8"
            >
              {/* Name */}
              <label htmlFor="name" className="flex flex-col">
                <span className="text-white font-medium mb-4">Your Name*</span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ex. Fuad Hasan"
                  title="What's your name?"
                  disabled={loading}
                  aria-disabled={loading}
                  className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium disabled:bg-[#151030]/20 disabled:text-white/60"
                />

                {/* Invalid Name */}
                <span className="text-red-400 mt-2 hidden" id="name-error">
                  Invalid Name!
                </span>
              </label>

              {/* Email */}
              <label htmlFor="email" className="flex flex-col">
                <span className="text-white font-medium mb-4">Your Email*</span>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ex. fuad.antor@gmail.com"
                  title="What's your email?"
                  disabled={loading}
                  aria-disabled={loading}
                  className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium disabled:bg-[#151030]/20 disabled:text-white/60"
                />

                {/* Invalid Email */}
                <span className="text-red-400 mt-2 hidden" id="email-error">
                  Invalid E-mail!
                </span>
              </label>

              {/* Message */}
              <label htmlFor="message" className="flex flex-col">
                <span className="text-white font-medium mb-4">
                  Your Message*
                </span>
                <textarea
                  rows={7}
                  name="message"
                  id="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Hello there!"
                  title="What do you want to say?"
                  disabled={loading}
                  aria-disabled={loading}
                  className="bg-[#151030] py-4 px-6 placeholder:text-[#aaa6c3] text-white rounded-lg outline-none border-none font-medium disabled:bg-[#151030]/20 disabled:text-white/60 disabled:resize-none"
                />

                {/* Invalid Message */}
                <span className="text-red-400 mt-2 hidden" id="message-error">
                  Invalid Message!
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                title={loading ? "Sending..." : "Send"}
                className="bg-[#151030] py-3 px-8 outline-none w-fit text-white font-bold shadow-md shadow-primary rounded-xl disabled:bg-[#151030]/20 disabled:text-white/60"
                disabled={loading}
                aria-disabled={loading}
              >
                {/* check loader state */}
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </motion.div>

          {/* Earth Model */}
          <motion.div
            variants={slideIn("right", "tween", 0.2, 1)}
            className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
          >
            <EarthCanvas />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
