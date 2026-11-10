# ABE Agro Hub website — rules for Claude Code

- **Read `BUILD_SPEC.md` first.** It is the full brief; build in the phases of §14 and track them in the task list.
- **Git:** the repo is https://github.com/Kobby992/AbeAgro-Hub. **Commit and push after every phase, every build session and every change to the codebase.** Work on `develop`, and merge to `main` (production, which auto-deploys to Hostinger) when a phase passes its checks. Never commit `.env*`, `node_modules/` or `.next/`.
- Products come only from `content/products.json` (42 items: the official catalogue plus the owner's November 2026 changes). **No prices anywhere**: every product has a **Get quote** button that opens WhatsApp `https://wa.me/233557042005` with the product details pre-filled. Never invent stock, warranties or delivery times, and never claim brand partnerships.
- Confirmed business facts: www.abeagrohub.com · established 1978 as Abdul Baai Enterprise · head office in Accra, branches in Accra Central, Kumasi, Ashaiman and Kasoa (numbers in `src/config/site.ts`) · serving Ghana, Togo, Burkina Faso and Côte d'Ivoire · sales@abeagrohub.com · WhatsApp +233 55 704 2005 · 9:00am – 5:00pm · nationwide delivery · payment & warranty terms are agreed with each quote.
- `main` is production and does not contain the old AI Kobby code that is still on `develop` (the live chatbot is Jotform). Make shared changes on `develop`, then cherry-pick them onto `main`; never merge `develop` into `main` wholesale.
- The WhatsApp number lives only in `src/config/site.ts` (env `NEXT_PUBLIC_WHATSAPP_NUMBER=233557042005`). Quote requests are also logged to MySQL and emailed to sales@abeagrohub.com.
- Hosting is **Hostinger** (Node.js app, Business/Cloud plan; domain registered there). Install the plugin with `/plugin install hostinger@claude-plugins-official`, then use the `hostinger:deploy-to-hosting` and `hostinger:connect-domain` skills.
- Load the skills listed in BUILD_SPEC §1.2 at the phase where they apply (`frontend-design`, `design:*`, `searchfit-seo:*`, `product-self-knowledge`, `hostinger:*`).
- Facts still needed from the owner are marked `TODO(owner)` and collected in `docs/OWNER_CHECKLIST.md`; never show TODO text on public pages.
- Mobile-first (most users are on Android + mobile data). Respect `prefers-reduced-motion`.
- After every phase: lint, typecheck, tests, Playwright screenshots at 390px and 1440px (look at them), then commit and push.
