import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[700px] px-6 py-16">
          <h1 className="text-5xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Code of Conduct</h1>
          <div className="space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <p className="text-[var(--muted-foreground)]">
              Last updated: July 2026
            </p>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Introduction</h2>
              <p>
                HAAJ is dedicated to providing a welcoming, respectful, and inclusive environment
                for all participants in our events and activities. This Code of Conduct applies to
                all HAAJ events, both online and in-person, and to all participants including members,
                guests, speakers, and organizers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Expected Behavior</h2>
              <ul className="list-disc pl-5 space-y-2 text-[var(--muted-foreground)]">
                <li>
                  <strong className="text-[var(--foreground)]">Be respectful.</strong> Treat all
                  participants with dignity and respect. Harassment, discrimination, or offensive
                  behavior based on gender, sexual orientation, disability, physical appearance,
                  body size, race, age, or religion will not be tolerated.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Be collaborative.</strong> Astronomy
                  is a shared passion. Share knowledge generously, listen to others, and engage
                  constructively.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Follow safety guidelines.</strong>
                  At observation events, follow all safety instructions regarding equipment,
                  location, and nighttime activities.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Respect the venue.</strong> Leave
                  observation sites and meeting venues as you found them. Follow Leave No Trace
                  principles at outdoor events.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Be punctual.</strong> Arrive on time
                  for events. Late arrivals may disrupt the experience for others.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Unacceptable Behavior</h2>
              <ul className="list-disc pl-5 space-y-2 text-[var(--muted-foreground)]">
                <li>Verbal abuse, intimidation, stalking, or harassment</li>
                <li>Deliberate disruption of talks, workshops, or observation sessions</li>
                <li>Use of inappropriate or offensive language and imagery</li>
                <li>Photography or recording without consent</li>
                <li>Unauthorized use of another participant&apos;s equipment</li>
                <li>Any behavior that compromises the safety or comfort of others</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Enforcement</h2>
              <p className="mb-2">
                Participants asked to stop unacceptable behavior are expected to comply immediately.
                If a participant engages in unacceptable behavior, event organizers may take any
                action they deem appropriate, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                <li>Warning the participant</li>
                <li>Asking the participant to leave the event</li>
                <li>Banning the participant from future HAAJ events</li>
                <li>Reporting the behavior to relevant authorities if necessary</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>Reporting</h2>
              <p>
                If you experience or witness unacceptable behavior, or have any concerns, please
                contact event organizers immediately or email us at{" "}
                <a href="mailto:humas.haaj84@gmail.com" className="text-[var(--accent)] hover:underline">
                  humas.haaj84@gmail.com
                </a>.
                All reports will be handled confidentially.
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
