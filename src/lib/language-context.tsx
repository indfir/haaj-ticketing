"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    "nav.events": "Events",
    "nav.guide": "Panduan",
    "nav.about": "Tentang",
    "nav.findTicket": "Cari Tiket",

    "hero.tagline": "HIMPUNAN ASTRONOMI AMATIR JAKARTA — EST. 1984",
    "hero.title.line1": "Event untuk mereka",
    "hero.title.line2": "yang mendongak.",
    "hero.description": "Observasi, workshop, dan pertemuan stargazing dari komunitas astronomi amatir terlama di Jakarta.",
    "hero.browseEvents": "Lihat Event",
    "hero.aboutHaaj": "Tentang HAAJ",
    "hero.eventsHeld": "Event dilaksanakan",
    "hero.registrations": "Pendaftaran",
    "hero.yearsActive": "Tahun aktif",

    "category.explore": "Jelajahi:",
    "category.OBSERVATION": "Observasi",
    "category.WORKSHOP": "Workshop",
    "category.LECTURE": "Lecture",
    "category.STARGAZING": "Stargazing",
    "category.MEETUP": "Meetup",
    "category.OTHER": "Lainnya",

    "event.nextEvent": "Event Berikutnya",
    "event.free": "Gratis",
    "event.online": "Online",
    "event.registered": "terdaftar",
    "event.seatsLeft": "kursi tersisa",
    "event.fullyBooked": "Penuh",
    "event.beFirst": "Jadi yang pertama daftar",
    "event.left": "tersisa",
    "event.idr": "Rp",
    "event.upcoming": "Event Mendatang",
    "event.viewAll": "Lihat semua \u2192",

    "cta.title": "Sudah daftar?",
    "cta.description": "Cari tiketmu berdasarkan email. Kamu bisa download sebagai PDF atau PNG untuk ditunjukkan di venue.",
    "cta.findTicket": "Cari Tiket Saya",

    "chat.welcome": "Halo! Saya asisten virtual HAAJ. Ada yang bisa saya bantu soal event astronomi, registrasi, atau tiket?",
    "chat.placeholder": "Ketik pertanyaan...",
    "chat.sending": "Sedang mengetik...",
    "chat.close": "Tutup chat",
    "chat.open": "Buka chat",
    "chat.title": "Asisten HAAJ",
    "chat.subtitle": "Tanya soal event & tiket",
    "chat.error": "Maaf, terjadi gangguan. Silakan coba lagi.",
    "chat.connectionError": "Maaf, tidak dapat terhubung. Silakan coba lagi.",

    "footer.tagline": "Himpunan Astronomi Amatir Jakarta. Membawa astronomi ke masyarakat sejak 1984.",
    "footer.events": "EVENTS",
    "footer.allEvents": "Semua Event",
    "footer.observations": "Observasi",
    "footer.stargazing": "Stargazing",
    "footer.workshops": "Workshop",
    "footer.community": "KOMUNITAS",
    "footer.aboutHaaj": "Tentang HAAJ",
    "footer.codeOfConduct": "Kode Etik",
    "footer.contact": "Kontak",
    "footer.findMyTicket": "Cari Tiket Saya",
    "footer.legal": "LEGAL",
    "footer.privacyPolicy": "Kebijakan Privasi",
  },
  en: {
    "nav.events": "Events",
    "nav.guide": "Guide",
    "nav.about": "About",
    "nav.findTicket": "Find Ticket",

    "hero.tagline": "AMATEUR ASTRONOMERS ASSOCIATION OF JAKARTA \u2014 EST. 1984",
    "hero.title.line1": "Events for those",
    "hero.title.line2": "who look up.",
    "hero.description": "Observations, workshops, and stargazing gatherings from Jakarta's longest-running amateur astronomy community.",
    "hero.browseEvents": "Browse Events",
    "hero.aboutHaaj": "About HAAJ",
    "hero.eventsHeld": "Events held",
    "hero.registrations": "Registrations",
    "hero.yearsActive": "Years active",

    "category.explore": "Explore:",
    "category.OBSERVATION": "Observation",
    "category.WORKSHOP": "Workshop",
    "category.LECTURE": "Lecture",
    "category.STARGAZING": "Stargazing",
    "category.MEETUP": "Meetup",
    "category.OTHER": "Other",

    "event.nextEvent": "Next Event",
    "event.free": "Free",
    "event.online": "Online",
    "event.registered": "registered",
    "event.seatsLeft": "seats left",
    "event.fullyBooked": "Fully booked",
    "event.beFirst": "Be the first to register",
    "event.left": "left",
    "event.idr": "IDR",
    "event.upcoming": "Upcoming Events",
    "event.viewAll": "View all \u2192",

    "cta.title": "Already registered?",
    "cta.description": "Look up your ticket by email. You can download it as PDF or PNG to present at the venue.",
    "cta.findTicket": "Find My Ticket",

    "chat.welcome": "Hello! I'm HAAJ's virtual assistant. How can I help you with astronomy events, registration, or tickets?",
    "chat.placeholder": "Type your question...",
    "chat.sending": "Typing...",
    "chat.close": "Close chat",
    "chat.open": "Open chat",
    "chat.title": "HAAJ Assistant",
    "chat.subtitle": "Ask about events & tickets",
    "chat.error": "Sorry, something went wrong. Please try again.",
    "chat.connectionError": "Sorry, unable to connect. Please try again.",

    "footer.tagline": "Amateur Astronomers Association of Jakarta. Bringing astronomy to the people since 1984.",
    "footer.events": "EVENTS",
    "footer.allEvents": "All Events",
    "footer.observations": "Observations",
    "footer.stargazing": "Stargazing",
    "footer.workshops": "Workshops",
    "footer.community": "COMMUNITY",
    "footer.aboutHaaj": "About HAAJ",
    "footer.codeOfConduct": "Code of Conduct",
    "footer.contact": "Contact",
    "footer.findMyTicket": "Find My Ticket",
    "footer.legal": "LEGAL",
    "footer.privacyPolicy": "Privacy Policy",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "id" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
