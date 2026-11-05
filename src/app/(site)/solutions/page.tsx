import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";
import { SolutionCard } from "@/components/sections/solutions-cards";
import { solutions } from "@/config/solutions";

export const metadata: Metadata = {
  title: "Start or Grow an Agri-Business in Ghana | ABE Agro Hub",
  description:
    "Guides to starting a rice mill, corn-mill kiosk, gari processing, vegetable irrigation, poultry feed production and cocoa spraying, with the machines each one needs.",
};

export default function SolutionsPage() {
  return (
    <ContentPage
      title="Start or grow your agri-business"
      intro="Plain guides to the machines that work together, what power they need and what to plan for."
    >
      <h2 className="sr-only">Guides</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {solutions.map((solution) => (
          <li key={solution.slug}>
            <SolutionCard solution={solution} />
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
