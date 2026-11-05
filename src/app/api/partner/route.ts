import { handleEnquiry } from "@/lib/enquiries";

export function POST(request: Request) {
  return handleEnquiry("partner", request);
}
