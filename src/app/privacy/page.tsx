import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[700px] px-6 py-16">
          <h1 className="text-5xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
          <div className="space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <p className="text-[var(--muted-foreground)]">
              Last updated: July 2026
            </p>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Introduction</h2>
              <p>
                Himpunan Astronomi Amatir Jakarta (HAAJ) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your personal information
                when you use our event ticketing platform at tiket.indfir.com.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Information We Collect</h2>
              <p className="mb-2">When you register for an event, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Instagram handle (optional)</li>
                <li>HAAJ membership status and member number (if applicable)</li>
                <li>Answers to custom registration questions</li>
                <li>IP address and user agent (for security purposes)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                <li>Process your event registration and generate your ticket</li>
                <li>Communicate important updates about the event</li>
                <li>Verify your identity at check-in</li>
                <li>Maintain accurate attendance records</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="mt-2">
                We do not sell, trade, or share your personal information with third parties
                for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Data Retention</h2>
              <p>
                We retain your registration data for as long as necessary to fulfill the purposes
                outlined in this policy, or as required by law. You may request deletion of your
                data by contacting us at humas.haaj84@gmail.com.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or destruction.
                Your ticket QR codes are cryptographically signed to prevent tampering.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Contact</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights,
                please contact us at <a href="mailto:humas.haaj84@gmail.com" className="text-[var(--accent)] hover:underline">humas.haaj84@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
