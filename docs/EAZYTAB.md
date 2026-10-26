# Playcation × EazyTab

Playcation helps families travel to tournaments; EazyTab lets them order food and drinks at the venue and pick up with a QR code. Both are owned by the same company. This document is the contract between the two; the EazyTab side lives in the [EazyTab repository](https://github.com/ejwatson19-axiomnova/eazytab) (README → "Youth tournaments and Playcation").

## What families can do

| Where in Playcation | Action | What opens |
| --- | --- | --- |
| Event → Eat tab | **Order** on Snack Shack, Grill Station or Coffee & Smoothies | That stand's EazyTab menu, with pickup times between games |
| Trips → Food at the fields | **Order food** | The tournament venue in EazyTab, to pick a stand |
| Trips → Food at the fields | **Team tab** | "Coming soon" until EazyTab supports team tabs (below) |

Places with no EazyTab path (the sample restaurants) show no Order button.

## Phase 1: links (live in the demo)

EazyTab is **web-only**: fans, stands and owners all use it in a browser, so Playcation always opens a web link. There is no EazyTab phone app to detect.

Playcation's setting (`.env`, see `.env.example`):

```
EXPO_PUBLIC_EAZYTAB_WEB_URL=          # empty = EazyTab's demo
```

| Mode | Link Playcation builds | How EazyTab tags it |
| --- | --- | --- |
| Demo (default) | `https://claude.ai/artifact/1rxKTgNgUpL4ASjkzjQw6v#fan.youth-tournaments.front-range-sports-complex.grill-station.playcation-<eventId>` | Last dotted part `playcation-<eventId>` |
| Production | `https://eazytab.app/<venue path>?source=playcation&eventId=<eventId>` (set the URL with `{venueId}`) | `source` and `eventId` query parameters |

**Venue paths** are EazyTab's own: `<category>.<venue>` or `<category>.<venue>.<stand>`, using lowercase names with dashes (e.g. `youth-tournaments.front-range-sports-complex.snack-shack`). Event IDs are reduced to letters, numbers and dashes so they don't break the dotted format.

Orders that arrive this way show "Ordering through Playcation" to the family and **via Playcation** on the stand's ticket and in the admin portal. Tested: EazyTab's `tests/pc_flow.js` (link → stand → pickup time → order → vendor sees "Ready by" and "via Playcation"), plus a cross-check that every link Playcation generates lands on the right stand with the tag.

The EazyTab demo is a private claude.ai page; share it with testers so the links open for them.

## Phase 2: team tabs (EazyTab to build)

EazyTab tabs today belong to one fan at one venue and close when the fan leaves the geofence. A team tab needs:

- One parent opens a tab for a team at the tournament venue, with a spending limit.
- Other families join with a link Playcation shares to the team.
- Each family's orders are tracked, and the tab is split by what each family ordered (or evenly).
- Playcation link: add `team-<name>` as a dotted part (demo) or `mode=team&team=<name>` (production).

## Phase 3: shared API (both apps on one backend)

Server-to-server calls from Playcation's backend, never the phone:

| EazyTab endpoint | Use in Playcation |
| --- | --- |
| `GET /v1/venues?lat=&lng=&radiusMiles=` | EazyTab already has `venues_near()` (geofence migration); mark which places near the fields take EazyTab orders |
| `POST /v1/tabs`, `GET /v1/tabs/{id}` | Open team tabs from Playcation and show each family's share in Trips |
| Webhook `order.status_changed` | "Your order is ready at the Snack Shack" through Playcation notifications |
| Webhook `tab.closed` | Referral revenue per event |

Account linking: one sign-in across both apps so payment methods and team membership carry over.

## Phase 4: arrival triggers

EazyTab already opens a venue automatically when a fan inside its geofence opens the site. When Playcation adds geofencing, arriving at the tournament can prompt "Order ahead at the Snack Shack."

## Open decisions

- How a team tab splits: by what each family ordered, or evenly.
- Referral fee or revenue share between Playcation and EazyTab, and how it's reported.
- Which real venues to pilot, starting with Playcation's pilot sports complex.
