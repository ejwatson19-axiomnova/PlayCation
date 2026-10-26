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

## Also planned

- **Sports organizations** (Perfect Game, PBR, USSSA and others): event schedules and venue coordinates, which feed `StaySearch.venue`.
- **Places** (Eat / Play tabs): a maps or places data provider; today these open the phone's map app.
