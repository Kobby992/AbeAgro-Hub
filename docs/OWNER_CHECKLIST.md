# Owner checklist

These are the things only you can answer. Nothing here is invented on the website: until you confirm an item, the site leaves it out.

## Needed before launch

- [ ] **Hostinger plan:** confirm it is Business or Cloud, which the site needs to run as a Node.js app.
- [ ] **Sales mailbox password:** for sales@abeagrohub.com, so the site can email you every request. Set it only as a server setting, never in chat.
- [ ] **Anthropic API key and monthly budget:** needed for Kobby. Set the key only as a server setting, never in chat. Until it is set, Kobby shows a WhatsApp button instead of answering. Also set a spending limit in your Anthropic account: `KOBBY_DAILY_MESSAGE_CAP` limits messages (3,000 a day by default), not money.
- [ ] **Kobby's first real test:** with the key set, run `npm run kobby:evals` and read a sample of chats before launch. Kobby's answers have not yet been tested against the real model.
- [ ] **Saved chats:** Kobby's chats are kept for 180 days and can include a customer's name and phone number. The privacy policy says so; please include this in the legal review.
- [ ] **Analytics choice:** the site is ready for Plausible, which needs no cookie notice. It is a paid service: sign up, then set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=abeagrohub.com` on Hostinger and redeploy. Until then no statistics are collected. GA4 is free, but needs a cookie notice building first.
- [ ] **Google Search Console:** add the site and submit `https://www.abeagrohub.com/sitemap.xml`.
- [ ] **Google Business Profiles:** set one up for the Accra head office and each branch (Accra Central, Kumasi, Ashaiman, Kasoa). They matter most for local searches.
- [ ] **Privacy policy and terms:** the drafts at `/privacy` and `/terms` were written without a lawyer. Please have them reviewed.

## Business facts to confirm

- [ ] **Opening days:** the site says 9:00am – 5:00pm without days. Monday to Friday? Saturdays? Search engines get no opening hours until you confirm.
- [ ] **Street addresses and map pins:** the contact page lists all five branches with phone numbers, and the map shows Accra in general. Send the street address of the head office (and branches if you like) to pin them exactly.
- [ ] **Phone calls:** the contact page offers "Call +233 23 580 1203" (the WhatsApp number). Does that number take normal calls?
- [ ] **Hostinger setting:** the site no longer reads `NEXT_PUBLIC_WHATSAPP_NUMBER`. You can delete it from the Node.js environment variables in hPanel.
- [ ] **Services:** the About page now mentions reliable after-sales support, in your words. Do you also offer installation, training or spare parts? One FAQ answer is waiting on this.
- [ ] **About page:** team details, if you want them included. (Founding year, story and vision are in, from your November 2026 document.)
- [ ] **Partners page:** check you are happy to offer "verified listings", "qualified enquiries" and "local support", which come from the earlier concept.
- [ ] **Social media links:** the footer leaves these out until supplied.

## Products

- [ ] **Review the derived fields:** see `content/DERIVED_FIELDS_REVIEW.md`, especially the items listed first.
- [ ] **Unconfirmed specs:** 8 products show "To be confirmed by sales" beside values the catalogue marks as unconfirmed. Send the correct values to remove the hint.

- [ ] **New products from November 2026:** the eight new machines (Irrigation Water Pump, Rice Huller, Concrete Vibrator, Plate Compactor, High Pressure Pump, Ex Motor for Gas, Diesel Car Wash Machine, Kirloskar Diesel Engine) were described from your photos and typical figures for machines of that type found online. Their cards say "To be confirmed by sales" until you send the exact model specs. The Electric Car Washing Machine's specs were also rewritten for an electric washer.
- [ ] **Jotform chatbot:** Kobby on the live site is a Jotform AI agent, trained inside Jotform. Update its knowledge with the new products, branches and About text, for example by adding `https://www.abeagrohub.com/llms.txt` as a knowledge source once this update is live.

## Photos

- [ ] **SOLO PORT 423 mist blower:** the photo shows only the boxed packaging. It also appears on the "Spray cocoa" guide.
- [ ] **Real photos:** shop, team, deliveries and machines at work, with permission. The site uses only product photos for now and has no stock images, so nothing is presented as ABE's customers or premises.

## Decide later

- [ ] **Automatic WhatsApp alerts:** optional. Customers must press Send themselves, so a server alert would tell you about requests they never send. It needs Meta Business verification and a second number (`BUILD_SPEC.md` §8.6).
- [ ] **One-tap lead emails:** every Get quote tap sends one. Tell us if that gets too noisy.
