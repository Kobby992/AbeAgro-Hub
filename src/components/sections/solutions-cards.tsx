import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { solutions } from "@/config/solutions";
import { SectionHeading } from "./section-heading";

export function SolutionCard({ solution }: { solution: (typeof solutions)[number] }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      data-cat={solution.category}
      className="group lift-card flex h-full overflow-hidden rounded-lg border-l-[3px] border-cat bg-card shadow-sm"
    >
      <div className="machine-stage aspect-square w-28 shrink-0 sm:w-32">
        <Image
          src={solution.image}
          alt=""
          fill
          sizes="128px"
          className="object-contain p-2 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-col justify-center p-3 sm:p-4">
        <h3 className="text-xl leading-tight">{solution.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{solution.blurb}</p>
      </div>
    </Link>
  );
}

export function SolutionsCards() {
  return (
    <section className="page-container py-12 md:py-20">
      <Reveal>
        <SectionHeading
          title="Start or grow your agri-business"
          intro="See which machines work together for the business you have in mind."
        />
      </Reveal>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {solutions.map((solution) => (
          <li key={solution.slug}>
            <SolutionCard solution={solution} />
          </li>
        ))}
      </ul>
    </section>
  );
}
