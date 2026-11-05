declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { GuideData } from "@/lib/guides";

  export const guide: GuideData;
  const Content: ComponentType;
  export default Content;
}
