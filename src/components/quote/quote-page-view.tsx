"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { QuoteLines, QuoteListEmpty } from "@/components/quote/quote-lines";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { useQuoteCatalogue } from "@/hooks/use-quote-catalogue";
import { notify } from "@/lib/notify";
import { normalizePhone } from "@/lib/phone";
import { openWhatsApp, postQuote, reportWhatsAppOpened } from "@/lib/quote-client";
import {
  CUSTOMER_TYPES,
  customerLocation,
  customerSchema,
  GHANA_REGIONS,
  OUTSIDE_GHANA,
  type CustomerFields,
  type QuoteResponse,
} from "@/lib/quote-schema";
import { createReference } from "@/lib/reference";
import { quoteRequestMessage, whatsappLink } from "@/lib/whatsapp";
import { useQuoteStore } from "@/store/quote";

const SEND_TIMEOUT_MS = 4_000;

const msSince = (start: number) => Date.now() - start;

function SentScreen({ result }: { result: QuoteResponse }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="max-w-2xl">
      <h1 ref={heading} tabIndex={-1} className="text-4xl outline-none md:text-5xl">
        Your request is ready to send
      </h1>
      <p className="mt-3 text-lg">
        Your reference is <strong className="font-bold">{result.reference}</strong>.
      </p>
      <h2 className="mt-6 text-2xl">What happens next</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5">
        <li>Press Send in WhatsApp. WhatsApp cannot send it without you.</li>
        <li>Our sales team replies with price, availability, payment and warranty terms.</li>
        <li>We agree the details with you and arrange delivery.</li>
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
            Open WhatsApp again
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/machinery">Continue browsing</Link>
        </Button>
      </div>
    </div>
  );
}

export function QuotePageView() {
  const items = useQuoteStore((state) => state.items);
  const replaceAll = useQuoteStore((state) => state.replaceAll);
  const { catalogue, failed } = useQuoteCatalogue();
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFields>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      town: "",
      region: "",
      country: "",
      customerType: "",
      message: "",
      consent: false,
    },
  });
  const values = useWatch({ control });

  const lines = items.flatMap((item) => {
    const product = catalogue?.get(item.slug);
    return product ? [{ ...item, name: product.name }] : [];
  });

  function messageFor(fields: Partial<CustomerFields>, reference?: string) {
    const location =
      fields.town && fields.region
        ? customerLocation(fields as CustomerFields)
        : (fields.town ?? "");
    return quoteRequestMessage({
      reference,
      name: fields.name ?? "",
      phone: normalizePhone(fields.phone ?? "")?.display ?? fields.phone ?? "",
      location,
      customerType: fields.customerType,
      items: lines,
      message: fields.message,
    });
  }

  async function send(fields: CustomerFields) {
    // If the API cannot be reached, the customer can still always reach ABE (BUILD_SPEC §8.3).
    let saved = true;
    const response = postQuote(
      {
        source: "site",
        items: items.map(({ slug, qty, note }) => ({ slug, qty, note: note || undefined })),
        customer: fields,
        website: honeypot.current?.value,
        elapsedMs: msSince(startedAt.current),
      },
      SEND_TIMEOUT_MS,
    ).catch((): QuoteResponse => {
      saved = false;
      const reference = createReference();
      return { reference, whatsappUrl: whatsappLink(messageFor(fields, reference)) };
    });

    const link = response.then((quote) => {
      // Shown before a phone leaves for WhatsApp, so it is there when the customer comes back.
      setResult(quote);
      replaceAll([]);
      return quote.whatsappUrl;
    });

    const opened = await openWhatsApp(link);
    const { reference } = await response;
    if (opened && saved) reportWhatsAppOpened(reference);
  }

  function copyRequest() {
    navigator.clipboard.writeText(messageFor(values)).then(
      () => notify("Request copied"),
      () => notify("Could not copy. Select the text in the preview instead."),
    );
  }

  function clearList() {
    const previous = items;
    replaceAll([]);
    void notify("Quote list cleared", { label: "Undo", onClick: () => replaceAll(previous) });
  }

  if (result) return <SentScreen result={result} />;

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Your quote list</h1>

      {items.length === 0 ? (
        <div className="mt-6 max-w-2xl">
          <QuoteListEmpty />
        </div>
      ) : failed ? (
        <p role="alert" className="mt-6">
          Your list could not load. Check your connection, then reload this page.
        </p>
      ) : !catalogue ? (
        <p role="status" className="mt-6">
          Loading your list
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="quote-items">
            <h2 id="quote-items" className="text-2xl">
              Machines
            </h2>
            <QuoteLines catalogue={catalogue} withNotes />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/machinery">Add more machines</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clearList}>
                Clear list
              </Button>
            </div>
          </section>

          <section aria-labelledby="quote-details">
            <h2 id="quote-details" className="text-2xl">
              Your details
            </h2>
            <form
              onSubmit={(event) => void handleSubmit(send)(event)}
              noValidate
              className="mt-3 flex flex-col gap-4"
            >
              {/* People never see this field. Bots tend to fill it in (BUILD_SPEC §8.3). */}
              <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
                <label htmlFor="quote-website">Leave this empty</label>
                <input
                  ref={honeypot}
                  id="quote-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <Field label="Full name" error={errors.name?.message}>
                {(field) => <Input autoComplete="name" {...field} {...register("name")} />}
              </Field>
              <Field
                label="Phone or WhatsApp number"
                hint="We use this to reply about your request."
                error={errors.phone?.message}
              >
                {(field) => (
                  <Input type="tel" autoComplete="tel" {...field} {...register("phone")} />
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Town" error={errors.town?.message}>
                  {(field) => <Input {...field} {...register("town")} />}
                </Field>
                <Field label="Region" error={errors.region?.message}>
                  {(field) => (
                    <Select {...field} {...register("region")}>
                      <option value="">Choose a region</option>
                      {GHANA_REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                      <option value={OUTSIDE_GHANA}>{OUTSIDE_GHANA}</option>
                    </Select>
                  )}
                </Field>
              </div>
              {values.region === OUTSIDE_GHANA && (
                <Field label="Country" error={errors.country?.message}>
                  {(field) => (
                    <Input autoComplete="country-name" {...field} {...register("country")} />
                  )}
                </Field>
              )}
              <Field label="I am a (optional)">
                {(field) => (
                  <Select {...field} {...register("customerType")}>
                    <option value="">Choose one</option>
                    {CUSTOMER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Message (optional)" error={errors.message?.message}>
                {(field) => (
                  <Textarea
                    maxLength={500}
                    placeholder="For example, please include delivery to Tamale"
                    {...field}
                    {...register("message")}
                  />
                )}
              </Field>
              <div>
                <Checkbox
                  label="ABE may contact me about this request"
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "quote-consent-error" : undefined}
                  {...register("consent")}
                />
                {errors.consent && (
                  <p id="quote-consent-error" className="text-sm font-semibold text-destructive">
                    {errors.consent.message}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg">Your WhatsApp message</h3>
                <pre
                  tabIndex={0}
                  aria-label="Preview of your WhatsApp message"
                  className="mt-2 max-h-72 overflow-y-auto rounded-lg bg-accent p-3 font-sans text-sm break-words whitespace-pre-wrap"
                >
                  {messageFor(values)}
                </pre>
              </div>

              <Button type="submit" size="lg" loading={isSubmitting}>
                Send quote request on WhatsApp
              </Button>
              <p className="text-sm text-muted-foreground">
                WhatsApp opens with your message filled in. Press Send there to reach our sales
                team.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={copyRequest}>
                Copy request
              </Button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
