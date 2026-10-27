# Lodging integrations

Playcation shows hotels, homes, condos and apartments near a tournament's fields. Listings come from outside partners. The app is ready for them; the partners and the backend that talks to them are not live yet.

## How it fits together

```
Phone app ──► Playcation backend ──► Expedia Rapid        (hotels + some rentals)
  (Expo)         /v1/lodging/search ├─► Booking.com          (hotels, apartments)
                                    ├─► Rentals United / NextPax / BookingPal
                                    │       (rental distributors: many managers, one connection)
                                    ├─► Guesty / Hostaway / OwnerRez
                                    │       (property-management systems, direct)
                                    └─► Playcation hosts   ("List your place")
```

**Partner calls never come from the app.** Partner keys must stay secret, and anything inside a mobile app can be extracted. The app calls one Playcation endpoint; the backend holds the keys, calls each partner, merges results and returns one list.

## What's in the app today

| File | Role |
| --- | --- |
| `src/services/lodging/types.ts` | `StaySearch` (what the app asks for) and the `LodgingProvider` interface every source implements |
| `src/services/lodging/registry.ts` | Every planned partner: type, what it covers, credential names, status |
| `src/services/lodging/providers/backend.ts` | Calls the backend and converts results into the app's `Stay` shape |
| `src/services/lodging/providers/mock.ts` | Sample listings, used while `EXPO_PUBLIC_API_URL` is empty |
| `src/services/lodging/index.ts` | `searchStays()`: picks backend or sample data, sorts by drive time, removes duplicates across partners |
| `src/services/lodging/useStays.ts` | Screen hook with loading, error and retry |

To switch from sample data to live data, set `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`) and restart Expo.

## Backend contract

`POST /v1/lodging/search`

Request body (`StaySearch`):

```json
{
  "eventId": "baseball-perfect-game-1",
  "venueName": "fields for [Tournament name]",
  "city": "[City, ST]",
  "venue": { "lat": 33.45, "lng": -112.07 },
  "checkIn": "2026-11-13",
  "checkOut": "2026-11-15",
  "guests": { "adults": 2, "children": 3 },
  "types": ["Home", "Hotel"],
  "maxDriveMinutes": 20
}
```

Response:

```json
{
  "stays": [
    {
      "id": "abc123",
      "source": "rentals-united",
      "type": "Home",
      "name": "Lakeview 4BR",
      "summary": "4 bedrooms · 3 baths",
      "sleeps": 10,
      "driveMinutes": 4,
      "distanceMiles": 1.1,
      "nightlyPrice": { "amount": 289, "currency": "USD" },
      "perks": ["Parking for 3 cars", "Washer for uniforms"]
    }
  ],
  "partial": ["guesty"]
}
```

`partial` lists partners that failed or timed out, so the app can still show everyone else's results.

### Backend adapter checklist (per partner)

1. Search the partner by the venue's coordinates and dates.
2. Map its property types to `Hotel | Condo | Home | Apartment`.
3. Compute `driveMinutes` from the venue with a routing service (straight-line distance is misleading near highways).
4. Map amenities to the game-weekend perks (parking, washer, kitchen, gear storage, early check-in).
5. Cache availability briefly and respect each partner's rate limits.
6. Booking and payment go through the partner's booking API or its required checkout flow; confirm the rules in each partner agreement.

## Partner onboarding

Each partner requires an application and approval before any keys are issued. Terms, commission and booking rules differ per partner and are not confirmed yet.

| Partner | Type | Why | Next step |
| --- | --- | --- | --- |
| Expedia Group Rapid API | Hotel network | Broad hotel coverage on day one; also advertises vacation rentals ([docs](https://developers.expediagroup.com/rapid/lodging/vacation-rentals)) | Apply to the partner program |
| Booking.com partner program | Hotel network | Hotels and apartments | Apply as an affiliate or connectivity partner |
| Rentals United | Rental distributor | One connection reaches many property managers | Contact partnerships |
| NextPax | Rental distributor | Syncs rentals to 100+ channels ([site](https://nextpax.com/accommodations/vacation-rental)) | Contact partnerships |
| BookingPal | Rental distributor | Rentals from connected managers | Contact partnerships |
| Guesty, Hostaway, OwnerRez | Property-management systems | Direct links to managers near pilot complexes | Pick whichever is most used near the pilot complex |
| Playcation hosts | Direct | Owners with no software | Already started: "List your place" form in the app |

Partners will expect Playcation to handle payments, cancellation and damage policies, and guest verification; early pilot booking numbers help approvals.

## Map and EV charging

**Map.** The Event screen shows a live map (`src/components/EventMap.tsx`, built on `react-native-maps`): Google Maps on Android, Apple Maps on iPhone. It shows the venue, a drive-time circle, and pins for the current tab (stays, food, things to do, chargers); tapping a pin's label opens the listing or directions. A "my location" button shows where the family is (it asks for location permission only when tapped). The web preview shows a simple stand-in (`EventMap.web.tsx`).

- Works in Expo Go with no keys.
- Store builds: Android needs a Google Maps key (`GOOGLE_MAPS_ANDROID_API_KEY`, restricted to the app's package name and SHA-1 fingerprint, with Maps SDK for Android enabled). Set `GOOGLE_MAPS_IOS_API_KEY` only to use Google Maps instead of Apple Maps on iPhone. Keys are read by `app.config.js`.

**EV chargers.** Event screen → **Charge** tab (also Trips → **EV chargers nearby**): public charging stations near the fields, or near the family's GPS position ("Near me"), with fast vs Level 2 ports, plug types, power and cost; tap for directions.

| File | Role |
| --- | --- |
| `src/services/charging/types.ts` | `Charger` and `ChargerSearch` |
| `src/services/charging/providers/openChargeMap.ts` | Open Charge Map v3 `poi` search, converted to `Charger` |
| `src/services/charging/providers/backend.ts` | `POST /v1/charging/near` on Playcation's backend |
| `src/services/charging/providers/sample.ts` | Sample stations until a source is connected |
| `src/lib/geo.ts` | GPS (when-in-use permission) and distance |

Source order: the backend if `EXPO_PUBLIC_API_URL` is set; else Open Charge Map if `EXPO_PUBLIC_OPENCHARGEMAP_KEY` is set; else sample stations.

| Source | Coverage | Cost |
| --- | --- | --- |
| [Open Charge Map](https://openchargemap.org) | Worldwide, community-maintained | Free for non-commercial and limited commercial use; plans for larger commercial use |
| NREL Alternative Fuel Stations (U.S. Department of Energy) | United States, government data | Free API key; call it from the backend (`/api/alt-fuel-stations/v1/nearest.json`, `fuel_type=ELEC`) |

Backend contract: `POST /v1/charging/near` with `{ near: { lat, lng }, radiusMiles, fastOnly, limit }` returns `{ chargers: Charger[] }`. Merging both sources and removing duplicates is the backend's job.

## Also planned

- **Sports organizations** (Perfect Game, PBR, USSSA and others): event schedules and venue coordinates, which feed `StaySearch.venue`.
- **Places** (Eat / Play tabs): a maps or places data provider; today these open the phone's map app.
