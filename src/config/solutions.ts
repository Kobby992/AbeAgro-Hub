import type { CategorySlug } from "@/config/categories";

// Solution guides from BUILD_SPEC §3. The guides themselves arrive in Phase 5.
export const solutions: {
  slug: string;
  title: string;
  blurb: string;
  image: string;
  category: CategorySlug;
}[] = [
  {
    slug: "start-a-rice-mill",
    title: "Start a rice mill",
    blurb: "Turn paddy into clean white rice with a huller, destoner and elevator.",
    image: "/products/sb10-rice-huller-mill.jpg",
    category: "rice-processing",
  },
  {
    slug: "corn-mill-kiosk",
    title: "Run a corn-mill kiosk",
    blurb: "Grind maize and other grains for the people around you.",
    image: "/products/disk-mill.jpg",
    category: "grain-milling",
  },
  {
    slug: "vegetable-irrigation",
    title: "Irrigate vegetables",
    blurb: "Bring water from a river or well to your beds with a pump and hose.",
    image: "/products/petrol-water-pump-3-inch-wp30.jpg",
    category: "irrigation",
  },
  {
    slug: "poultry-feed-production",
    title: "Make poultry feed",
    blurb: "Grind and pellet your own feed for your birds or to sell.",
    image: "/products/electric-feed-pelletizing-machine.jpg",
    category: "animal-feed",
  },
  {
    slug: "cocoa-spraying",
    title: "Spray cocoa",
    blurb: "Cover tall trees and large plots with a motorized mist blower.",
    image: "/products/solo-port-423-motorized-mist-blower.jpg",
    category: "crop-protection",
  },
];
