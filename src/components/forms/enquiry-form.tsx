"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { enquirySchema, type EnquiryFields } from "@/lib/enquiry-schema";
import { whatsappLink } from "@/lib/whatsapp";

const msSince = (start: number) => Date.now() - start;

/** Partner and contact form. WhatsApp is always offered, so a failure never leaves a dead end. */
export function EnquiryForm({
  kind,
  whatsappIntro,
}: {
  kind: "partner" | "contact";
  whatsappIntro: string;
}) {
  const [state, setState] = useState<"editing" | "sent" | "failed">("editing");
  const [handoff, setHandoff] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);
  const status = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state !== "editing") status.current?.focus();
  }, [state]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFields>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", company: "", phone: "", email: "", message: "" },
  });

  async function send(enquiry: EnquiryFields) {
    setHandoff(whatsappLink(`${whatsappIntro}\n\n${enquiry.message}\n\nName: ${enquiry.name}`));
    try {
      const response = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiry,
          website: honeypot.current?.value,
          elapsedMs: msSince(startedAt.current),
        }),
      });
      setState(response.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state !== "editing") {
    return (
      <div ref={status} tabIndex={-1} className="rounded-lg bg-accent p-5 outline-none">
        <p className="text-lg font-semibold">
          {state === "sent" ? "Message sent. Our team will reply." : "Your message did not send."}
        </p>
        <p className="mt-1">
          {state === "sent"
            ? "For a quicker reply, you can also send it on WhatsApp."
            : "Please send it on WhatsApp instead, and it will reach the same team."}
        </p>
        <Button asChild className="mt-3">
          <a href={handoff} target="_blank" rel="noopener noreferrer">
            Send on WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(send)(event)}
      noValidate
      className="flex max-w-xl flex-col gap-4"
    >
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={`${kind}-website`}>Leave this empty</label>
        <input ref={honeypot} id={`${kind}-website`} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Field label="Your name" error={errors.name?.message}>
        {(field) => <Input autoComplete="name" {...field} {...register("name")} />}
      </Field>
      {kind === "partner" && (
        <Field label="Company (optional)" error={errors.company?.message}>
          {(field) => <Input autoComplete="organization" {...field} {...register("company")} />}
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone or WhatsApp" error={errors.phone?.message}>
          {(field) => <Input type="tel" autoComplete="tel" {...field} {...register("phone")} />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(field) => <Input type="email" autoComplete="email" {...field} {...register("email")} />}
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message}>
        {(field) => <Textarea maxLength={1000} {...field} {...register("message")} />}
      </Field>
      <Button type="submit" size="lg" loading={isSubmitting} className="self-start">
        Send message
      </Button>
    </form>
  );
}
