import { History, MessageCircle, Truck, Users } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { categories } from "@/config/categories";
import { allProducts } from "@/lib/products";

const TRUST = [
  { Icon: Truck, text: "Nationwide delivery" },
  { Icon: Users, text: "Expert advice" },
  { Icon: MessageCircle, text: "Quotes on WhatsApp" },
  { Icon: History, text: "Trusted since 1978" },
];

// Real figures only (BUILD_SPEC §5.2-2): both counts come from the catalogue itself.
const STATS = [
  { value: allProducts.length, label: "machines" },
  { value: categories.length, label: "categories" },
  { value: 1, label: "WhatsApp away" },
];

export function TrustStrip() {
  return (
    <section aria-label="Why buy from ABE Agro Hub" className="relative z-10 page-container -mt-12">
      <div className="grid gap-6 rounded-xl border border-black/5 bg-card p-6 shadow-lg lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:px-10">
        <dl className="grid grid-cols-3 gap-3 lg:flex lg:gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm leading-tight text-muted-foreground">{stat.label}</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-forest tabular-nums">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
          {TRUST.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2 font-semibold">
              <Icon aria-hidden className="size-5 shrink-0 text-forest" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
