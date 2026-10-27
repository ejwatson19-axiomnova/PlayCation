import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { STAYS, SPORTS, eventsFor, type EventItem, type Sport, type Stay } from '@/src/data/mock';
import { getCachedStay } from '@/src/services/lodging';

export type Message = { id: string; from: 'me' | 'host' | 'system'; text: string; meta: string };

export type Booking = {
  stay: Stay;
  event: EventItem;
  sport: Sport;
  org: string;
  splitWithTeam: boolean;
  checkedOut: boolean;
  review?: { stars: number; text: string };
};

type AppState = {
  sport: Sport;
  org: string;
  setSport: (name: string) => void;
  setOrg: (org: string) => void;
  events: EventItem[];
  findEvent: (id: string) => EventItem | undefined;
  findStay: (id: string) => Stay | undefined;
  booking: Booking | null;
  book: (stay: Stay, event: EventItem, splitWithTeam: boolean) => void;
  checkOut: () => void;
  submitReview: (stars: number, text: string) => void;
  selectEvent: (sportName: string, org: string) => void;
  /** EazyTab places this family has ordered from through Playcation (shows "Buy again"). */
  orderedAt: Record<string, true>;
  markOrdered: (eazytabVenueId: string) => void;
  messages: Message[];
  sendMessage: (text: string) => void;
  unread: number;
  markRead: () => void;
};

const Ctx = createContext<AppState | null>(null);

const HOST_WELCOME: Message[] = [
  { id: 'm1', from: 'host', text: 'Welcome! Your booking for the tournament weekend is confirmed. The door code arrives the morning of check-in.', meta: '[Host name] · 9:41 AM' },
];

let nextId = 100;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [sport, setSportState] = useState<Sport>(SPORTS[0]);
  const [org, setOrg] = useState<string>(SPORTS[0].orgs[0]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [orderedAt, setOrderedAt] = useState<Record<string, true>>({});

  const value = useMemo<AppState>(() => {
    const events = eventsFor(sport, org);
    return {
      sport,
      org,
      setSport: (name) => {
        const next = SPORTS.find((s) => s.name === name) ?? SPORTS[0];
        setSportState(next);
        setOrg(next.orgs[0]);
      },
      setOrg,
      events,
      findEvent: (id) => events.find((e) => e.id === id) ?? (booking?.event.id === id ? booking.event : undefined),
      findStay: (id) => getCachedStay(id) ?? STAYS.find((s) => s.id === id),
      booking,
      book: (stay, event, splitWithTeam) => {
        setBooking({ stay, event, sport, org, splitWithTeam, checkedOut: false });
        setMessages(HOST_WELCOME);
        setUnread(1);
      },
      checkOut: () => {
        setBooking((b) => (b ? { ...b, checkedOut: true } : b));
        setMessages((m) => [
          ...m,
          { id: String(nextId++), from: 'system', text: 'You checked out. Your host has been notified.', meta: 'Just now' },
          { id: String(nextId++), from: 'host', text: 'Thanks for staying with us! Hope the team had a great tournament. Safe travels home.', meta: '[Host name] · just now' },
        ]);
      },
      submitReview: (stars, text) => setBooking((b) => (b ? { ...b, review: { stars, text } } : b)),
      selectEvent: (sportName, o) => {
        const next = SPORTS.find((s) => s.name === sportName) ?? SPORTS[0];
        setSportState(next);
        setOrg(next.orgs.includes(o) ? o : next.orgs[0]);
      },
      orderedAt,
      markOrdered: (id) => setOrderedAt((m) => (m[id] ? m : { ...m, [id]: true })),
      messages,
      sendMessage: (text) => {
        const t = text.trim();
        if (!t) return;
        setMessages((m) => [...m, { id: String(nextId++), from: 'me', text: t, meta: 'You · just now' }]);
      },
      unread,
      markRead: () => setUnread(0),
    };
  }, [sport, org, booking, messages, unread, orderedAt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
