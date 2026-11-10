import type { ComponentType } from "react";
import CocoaSpraying, { guide as cocoa } from "../../content/solutions/cocoa-spraying.mdx";
import CornMillKiosk, { guide as cornMill } from "../../content/solutions/corn-mill-kiosk.mdx";
import PoultryFeed, { guide as feed } from "../../content/solutions/poultry-feed-production.mdx";
import RiceMill, { guide as rice } from "../../content/solutions/start-a-rice-mill.mdx";
import VegetableIrrigation, {
  guide as irrigation,
} from "../../content/solutions/vegetable-irrigation.mdx";

export type GuideData = {
  /** The recommended machine set, as catalogue slugs. */
  machines: string[];
  /** The process diagram, in order. */
  steps: string[];
  /** Questions that open Kobby. */
  prompts: string[];
};

export const guides: Record<string, { Body: ComponentType; data: GuideData }> = {
  "start-a-rice-mill": { Body: RiceMill, data: rice },
  "corn-mill-kiosk": { Body: CornMillKiosk, data: cornMill },
  "vegetable-irrigation": { Body: VegetableIrrigation, data: irrigation },
  "poultry-feed-production": { Body: PoultryFeed, data: feed },
  "cocoa-spraying": { Body: CocoaSpraying, data: cocoa },
};
