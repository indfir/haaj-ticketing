"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  Button,
  Input,
  Label,
  Select,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Separator,
} from "@/components/ui";

function StyleguideContent() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      {/* Header */}
      <header className="mb-16 flex items-start justify-between">
        <div>
          <h1 className="text-5xl leading-tight mb-2">Component Styleguide</h1>
          <p className="text-[var(--muted-foreground)] text-base">
            HAAJ Ticketing design system — all primitives in both themes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ─── Typography ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Typography</h2>
        <div className="space-y-4">
          <p className="text-6xl font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Display — Instrument Serif
          </p>
          <p className="text-4xl font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Heading Large
          </p>
          <p className="text-2xl font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Heading Medium
          </p>
          <p className="text-xl font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Heading Small
          </p>
          <Separator className="my-6" />
          <p className="text-base text-[var(--foreground)]">
            Body text — Inter Tight. The quick brown fox jumps over the lazy dog.
            Astronomy is the oldest of the natural sciences, with roots tracing back to ancient
            civilisations who observed the night sky.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Muted text — used for secondary information, timestamps, captions.
          </p>
          <p className="text-sm font-mono">
            Monospace — IBM Plex Mono. HAAJ-A7K2-9QMD
          </p>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* ─── Buttons ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Buttons</h2>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* ─── Form Controls ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-name" required>Full Name</Label>
            <Input id="sg-name" placeholder="e.g. Amir Nugroho" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-email" required>Email</Label>
            <Input id="sg-email" type="email" placeholder="amir@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-error">With Error</Label>
            <Input id="sg-error" defaultValue="bad input" error="This field is invalid." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-select">Category</Label>
            <Select
              id="sg-select"
              placeholder="Choose a category"
              options={[
                { value: "observation", label: "Observation" },
                { value: "workshop", label: "Workshop" },
                { value: "lecture", label: "Lecture" },
                { value: "stargazing", label: "Stargazing" },
              ]}
            />
          </div>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* ─── Badges ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Confirmed</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Rejected</Badge>
          <Badge variant="info">Checked In</Badge>
          <Badge variant="muted">Waitlisted</Badge>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* ─── Table ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Table</h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th className="text-right">Registered</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Amir Nugroho</Td>
              <Td>amir@example.com</Td>
              <Td><Badge variant="success">Confirmed</Badge></Td>
              <Td className="text-right tabular-nums">28 Jul 2026</Td>
            </Tr>
            <Tr>
              <Td>Siti Rahayu</Td>
              <Td>siti@example.com</Td>
              <Td><Badge variant="warning">Pending</Badge></Td>
              <Td className="text-right tabular-nums">27 Jul 2026</Td>
            </Tr>
            <Tr>
              <Td>Budi Santoso</Td>
              <Td>budi@example.com</Td>
              <Td><Badge variant="info">Checked In</Badge></Td>
              <Td className="text-right tabular-nums">26 Jul 2026</Td>
            </Tr>
            <Tr>
              <Td>Dewi Lestari</Td>
              <Td>dewi@example.com</Td>
              <Td><Badge variant="muted">Waitlisted</Badge></Td>
              <Td className="text-right tabular-nums">25 Jul 2026</Td>
            </Tr>
          </Tbody>
        </Table>
      </section>

      <Separator className="mb-16" />

      {/* ─── Dialog ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Dialog</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this registration? The attendee will
              receive a confirmation email with their ticket.
            </DialogDescription>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <Separator className="mb-16" />

      {/* ─── Toast ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Toast</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => toast({ title: "Registration confirmed", description: "Ticket sent to amir@example.com" })}
          >
            Default Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Check-in successful", variant: "success", description: "Amir Nugroho — HAAJ-A7K2-9QMD" })}
          >
            Success Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Invalid QR code", variant: "destructive", description: "This ticket does not match the event." })}
          >
            Error Toast
          </Button>
        </div>
      </section>

      <Separator className="mb-16" />

      {/* ─── Colour Tokens ─── */}
      <section className="mb-16">
        <h2 className="text-3xl mb-6">Colour Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { name: "Background", var: "--background" },
            { name: "Foreground", var: "--foreground" },
            { name: "Muted", var: "--muted" },
            { name: "Border", var: "--border" },
            { name: "Accent", var: "--accent" },
            { name: "Success", var: "--success" },
            { name: "Warning", var: "--warning" },
            { name: "Destructive", var: "--destructive" },
            { name: "Info", var: "--info" },
          ].map((c) => (
            <div key={c.var} className="flex flex-col gap-2">
              <div
                className="h-16 rounded-md border border-[var(--border)]"
                style={{ backgroundColor: `var(${c.var})` }}
              />
              <span className="text-xs text-[var(--muted-foreground)]">{c.name}</span>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">{c.var}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <ToastProvider>
      <StyleguideContent />
    </ToastProvider>
  );
}
