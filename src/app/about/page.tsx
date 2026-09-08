import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[700px] px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-3xl sm:text-5xl mb-4 sm:mb-6" style={{ fontFamily: "var(--font-display)" }}>
            About HAAJ
          </h1>

          <div className="space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <p>
              <strong>Himpunan Astronomi Amatir Jakarta (HAAJ)</strong> — the Amateur Astronomers
              Association of Jakarta — is a community-based organisation dedicated to bringing
              astronomy to the public. Founded on <strong>21 April 1984</strong>, HAAJ is based at
              the Planetarium and Observatory of Jakarta and is open to everyone: students,
              professionals, parents, children, and seniors alike.
            </p>

            <Separator />

            <div>
              <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>History</h2>
              <p>
                Since the opening of the Planetarium and Observatory of Jakarta on 1 March 1969,
                public interest in astronomy has continued to grow. However, many astronomy
                enthusiasts felt that the material offered at the Planetarium was not sufficient to
                satisfy their curiosity. Drs. Darsa Sukartadiredja, then head of the Jakarta
                Planetarium, initiated the formation of a club to accommodate this growing interest.
                Thus HAAJ was born — with Darsa Sukartadiredja as its first patron.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>Vision</h2>
              <p>
                <em>&ldquo;Bringing astronomy to the people.&rdquo;</em>
              </p>
              <p>
                HAAJ&rsquo;s vision is to shift the paradigm that astronomy is a &ldquo;luxurious&rdquo;
                science reserved for academics, and instead make it familiar and accessible to the
                wider public.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>Mission</h2>
              <p>
                To carry out public-oriented astronomy activities that embrace all layers of society
                — regardless of educational background, occupation, or age — united by a shared hobby
                and love for the night sky.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>Activities</h2>

              <h3 className="text-lg font-medium mt-4 mb-2">Regular Activities</h3>
              <ul className="list-disc pl-5 space-y-2 text-[var(--muted-foreground)]">
                <li>
                  <strong className="text-[var(--foreground)]">Bi-weekly Meetings</strong> — Held
                  every two weeks on Saturdays. Lectures and discussions delivered in accessible
                  language for the general public.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Star Party</strong> — Observation
                  sessions and hands-on practice. Held four times a year at different locations,
                  running for two days and one night (Saturday evening to Sunday morning). One Star
                  Party is open to the public; the other three are for members only.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Amateur Astronomy Workshop</strong> —
                  Held once a year (full day, Sunday). Covers advanced astronomy, instrumentation,
                  teaching aids, and basic research training.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Astro Party</strong> — Held once a
                  year at a cultural centre in Jakarta. Features talkshows, exhibitions, and film
                  screenings. Targeted at high-school students.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Jakarta Astronomy Week (PAJ)</strong> —
                  Astronomy competitions for high-school students to measure interest and broaden
                  their knowledge.
                </li>
              </ul>

              <h3 className="text-lg font-medium mt-6 mb-2">Special Activities</h3>
              <ul className="list-disc pl-5 space-y-2 text-[var(--muted-foreground)]">
                <li>
                  <strong className="text-[var(--foreground)]">Outreach Star Parties</strong> —
                  Astronomy outreach at schools, based on invitations.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Astronomical Phenomena</strong> —
                  Observation and documentation during notable astronomical events (open house for
                  the public or expeditions).
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">World Space Week</strong> — Seminars
                  and exhibitions in collaboration with the Planetarium and Observatory of Jakarta.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Astronomy Exhibitions</strong> —
                  Participation in events at various institutions.
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)" }}>Contact</h2>
              <div className="space-y-2 text-[var(--muted-foreground)]">
                <p>Jl. Cikini Raya No. 73, Jakarta Pusat 10330</p>
                <p>Email: humas.haaj84@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
