# Playcation × EazyTab

Playcation helps families travel to tournaments; EazyTab handles food and drink ordering and tabs at venues. Both are owned by the same company, so this document is the contract between the two apps. Playcation's side is built; EazyTab implements the pieces marked **EazyTab**.

## What families can do

| Where in Playcation | Action | What opens |
| --- | --- | --- |
| Event → Eat tab | **Order** on any place that uses EazyTab, including the venue's concessions | That venue's EazyTab ordering page |
| Trips → Food at the fields | **Order food** | The tournament venue's concessions |
| Trips → Food at the fields | **Team tab** | A shared tab the team's families can join and split |

Places without an EazyTab venue ID show no Order button. Until EazyTab links are configured, Order buttons show "Coming soon" instead of a broken link.

## Where EazyTab stands (Oct 26, 2026)

- **Web only.** EazyTab has no phone app and no App Store listing, so `EXPO_PUBLIC_EAZYTAB_APP_URL` stays empty and Playcation opens EazyTab's website.
- **Pickup only.** EazyTab doesn't deliver yet. Families order ahead, can pick a time between games, and collect at the stand with a Pickup ID or QR code.
- **Demo complex.** The EazyTab prototype has a "Youth tournaments" category with a demo venue, Front Range Sports Complex (EazyTab ID `front-range-sports-complex`: Snack Shack, Grill Station, Coffee & Smoothies). Playcation's sample concessions point at it.
- **Attribution.** Orders opened from Playcation show "via Playcation" in EazyTab's vendor and admin portals. The prototype reads it from the link's last dotted part (`...#fan.youth-tournaments.front-range-sports-complex.playcation-<eventId>`), because claude.ai only passes a plain `#token` to a page. In production, EazyTab reads the query parameters below.
- **Team tabs** are not built in EazyTab yet; a `mode=team` link opens the same ordering page.

To demo it, set `EXPO_PUBLIC_EAZYTAB_WEB_URL=https://claude.ai/artifact/1rxKTgNgUpL4ASjkzjQw6v#fan.youth-tournaments.{venueId}` (the viewer must be signed in to claude.ai with access to the prototype).

## Phase 1: links (no API needed)

Playcation opens EazyTab with a link. Set these in Playcation's `.env`:

```
EXPO_PUBLIC_EAZYTAB_APP_URL=eazytab://venue/{venueId}
EXPO_PUBLIC_EAZYTAB_WEB_URL=https://<eazytab web ordering host>/v/{venueId}
```

Playcation tries the app link first (if the EazyTab app is installed), then the web link. It appends:

| Parameter | Example | Purpose |
| --- | --- | --- |
| `source` | `playcation` | Attribution for referral reporting |
| `mode` | `personal` or `team` | `team` opens a shared, splittable tab |
| `eventId` | `baseball-perfect-game-1` | Which tournament the order is for |
| `team` | `[Team name]` | Pre-fills the team tab's name (team mode) |

**EazyTab:**
1. Register the `eazytab://` URL scheme in the EazyTab app (and iOS universal links / Android app links for the web host, if available).
2. Accept the parameters above; store `source`, `eventId` and `mode` on the order or tab.
3. Provide each venue's EazyTab ID so Playcation can attach it to restaurants and sports complexes.

Playcation already declares `eazytab` in iOS `LSApplicationQueriesSchemes` (app.json) so it can detect the app. Android 11+ needs a `<queries>` entry added through a config plugin before app detection works there; until then Android uses the web link.

## Phase 2: API (shared backend)

When both apps share accounts and data, replace links with server-to-server calls (from Playcation's backend, never the phone):

| Endpoint (**EazyTab**) | Use in Playcation |
| --- | --- |
| `GET /v1/venues?lat=&lng=&radiusMiles=` | Mark which nearby places take EazyTab orders; show live menus |
| `POST /v1/tabs` `{ venueId, mode, eventId, teamId }` | Open a team tab from Playcation and share its join link with team families |
| `GET /v1/tabs/{id}` | Show the tab total and each family's share in Trips |
| Webhook `order.status_changed` | Push "Your order is ready at the stand" through Playcation notifications |
| Webhook `tab.closed` | Record referral revenue per event |

Account linking: one sign-in shared across both apps (single sign-on), so a family's payment method and team membership carry over.

## Phase 3: arrival triggers

With geofencing (see the location plan), when a family arrives at a tournament venue that uses EazyTab, Playcation offers "Order ahead at the concessions" and "Open a team tab."

## Open decisions

- Referral fee or revenue share between the two businesses, and how it's reported.
- Who handles payment for a team tab split across families (EazyTab's checkout is the natural owner).
- Which venues to pilot: the Playcation pilot sports complex and the restaurants around it.
