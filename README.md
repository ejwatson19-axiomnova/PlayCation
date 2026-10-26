# Playcation

Lodging for youth sports families: pick your sport, organization and tournament, then book a hotel, condo, home or apartment ranked by drive time to your fields.

Built with [Expo](https://expo.dev) (React Native + Expo Router), so one codebase runs on iPhone, Android and the web.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `w` to open it in a browser.

## What's in the app

| Screen | File | What it does |
| --- | --- | --- |
| Welcome | `app/index.tsx` | Logo, tagline, Get started / Log in |
| Log in / Sign up | `app/login.tsx` | Email + password form (not connected to real accounts yet) |
| Explore | `app/(tabs)/explore.tsx` | 1. Pick a sport · 2. Pick the organization · 3. Choose your event |
| Event | `app/event/[id].tsx` | Map area + Stay / Eat / Play tabs, stays sorted by drive time |
| Listing | `app/stay/[id].tsx` | Drive time to fields, perks, Reserve panel with team cost split |
| Trips | `app/(tabs)/trips.tsx` | Booked stay, check-in/out, game times, Message host |
| Messages | `app/(tabs)/messages.tsx` | Chat with the host, quick replies, guided check-out |
| Profile | `app/(tabs)/profile.tsx` | Account menu linking to the screens below |
| Search | `app/search.tsx` | Find events by sport, organization or city |
| Reset password | `app/forgot-password.tsx` | Email a reset link (not sent yet) |
| List your place | `app/host.tsx` | Hosts submit a property near the fields |
| Leave a review | `app/review.tsx` | Star rating + comments after check-out |
| My teams | `app/teams.tsx` | Teams, families, and invite by share sheet |
| Payment methods | `app/payments.tsx` | Placeholder until a payment provider is connected |
| Notifications | `app/notifications.tsx` | Notification toggles |
| Help | `app/help.tsx` | FAQ and email support |

Directions buttons (Trips, and Eat/Play places on the Event screen) open Apple Maps or Google Maps.

Shared pieces live in `src/`: `theme.ts` (brand colors), `data/mock.ts` (sample sports, organizations, stays), `state/AppState.tsx` (selected event, booking, messages) and `components/ui.tsx` (buttons, chips, tabs).

## Still to build

- Real sign-in and accounts
- Tournament schedules and field locations from sports organizations
- Hotel inventory (booking network) and rental listings (property-management channel partners)
- Live map, payments, and real host messaging

See `docs/INTEGRATIONS.md` for how lodging partners (Expedia Rapid, Rentals United, Guesty and others) plug in.
