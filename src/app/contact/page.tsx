import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[700px] px-6 py-16">
          <h1 className="text-5xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Contact</h1>
          <div className="space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
            <p className="text-[var(--muted-foreground)]">
              Get in touch with HAAJ. We are based at the Planetarium and Observatory of Jakarta.
            </p>

            <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Address</p>
              <p className="text-sm">Jl. Cikini Raya No. 73, Jakarta Pusat 10330</p>
              <p className="text-sm text-[var(--muted-foreground)]">Planetarium and Observatory of Jakarta</p>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Email</p>
              <a href="mailto:humas.haaj84@gmail.com" className="text-sm text-[var(--accent)] hover:underline">
                humas.haaj84@gmail.com
              </a>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Social Media</p>
              <div className="space-y-1 text-sm">
                <p>Facebook: HAAJ – Himpunan Astronomi Amatir Jakarta</p>
                <p>Instagram: @haaj.84</p>
                <p>Twitter: @PenjelajahAngkasa</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
