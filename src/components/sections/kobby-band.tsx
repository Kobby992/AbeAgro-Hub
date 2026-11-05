import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "What pump do I need for 2 acres of tomatoes?",
  "What do I need to start a gari business?",
  "Which mill suits a small corn-mill kiosk?",
];

export function KobbyBand() {
  return (
    <section className="page-container py-12 md:py-20">
      <div className="grain overflow-hidden rounded-xl bg-forest-900 p-6 text-white md:p-10">
        <h2 className="max-w-2xl text-3xl md:text-4xl">Not sure which machine fits your farm?</h2>
        <p className="mt-2 max-w-prose text-lg">
          Tell Kobby what you grow or process. Start with one of these:
        </p>
        <ul className="mt-5 flex flex-col gap-3 lg:flex-row">
          {PROMPTS.map((prompt) => (
            <li key={prompt} className="lg:flex-1">
              <KobbyPromptButton
                prompt={prompt}
                className={cn(
                  buttonVariants({ variant: "outline-light" }),
                  "h-full w-full py-2.5 text-left whitespace-normal",
                )}
              >
                {prompt}
              </KobbyPromptButton>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
