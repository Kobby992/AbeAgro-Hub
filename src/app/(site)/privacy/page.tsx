import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy | ABE Agro Hub",
  description: "What information ABE Agro Hub collects, why, and how to ask about it.",
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy policy">
      <div className="prose-abe">
        <p>
          This policy explains what information {site.name} collects through this website and how we
          use it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Quote requests:</strong> your name, phone number, location, the machines you ask
            about and any message you add.
          </li>
          <li>
            <strong>One-tap quotes:</strong> the machine you asked about. Your name and number reach
            us only if you send the WhatsApp message.
          </li>
          <li>
            <strong>Contact and partner forms:</strong> your name, contact details, company if you
            give it, and your message.
          </li>
          <li>
            <strong>Chatbot:</strong> what you type into the chat assistant on this website. The
            assistant is provided by Jotform, so your messages are processed by Jotform. Please do
            not share payment details in a chat.
          </li>
          <li>
            <strong>Technical details:</strong> the page you were on, campaign tags in the link you
            followed, and your browser type.
          </li>
        </ul>
        <h2>Why we use it</h2>
        <p>
          We use this information to reply to you, prepare your quote, arrange delivery and improve
          our service. We do not ask for payment details on this website, and we do not sell your
          information.
        </p>
        <h2>WhatsApp</h2>
        <p>
          When you choose WhatsApp, your message is sent through WhatsApp, which has its own privacy
          policy. WhatsApp only sends your message after you press Send.
        </p>
        <h2>Saved on your device</h2>
        <p>
          Your quote list and compare list are saved in your own browser, so they are there when you
          come back. You can clear them at any time.
        </p>
        <h2>Your choices</h2>
        <p>
          To ask what we hold about you, or to have it corrected or deleted, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </ContentPage>
  );
}
