// Mock data used until the sports-organization, hotel and rental integrations exist.
// Bracketed values like [Home name] are placeholders.

export type Sport = {
  name: string;
  orgs: string[];
  division: string;
  venue: string; // plural noun: fields, courts, rinks...
  unit: string; // Field, Court, Rink...
};

export const SPORTS: Sport[] = [
  { name: 'Baseball', orgs: ['Perfect Game', 'PBR', 'USSSA', 'Five Tool', 'Triple Crown'], division: '12U Baseball', venue: 'fields', unit: 'Field' },
  { name: 'Soccer', orgs: ['US Youth Soccer', 'US Club Soccer', 'ECNL', 'MLS NEXT'], division: 'U12 Soccer', venue: 'fields', unit: 'Field' },
  { name: 'Basketball', orgs: ['AAU', 'Nike EYBL', 'Adidas 3SSB', 'Under Armour Assoc.'], division: '14U Basketball', venue: 'courts', unit: 'Court' },
  { name: 'FB 7v7', orgs: ['Pylon 7on7', 'OT7', 'The Sevens'], division: '14U 7v7', venue: 'fields', unit: 'Field' },
  { name: 'Softball', orgs: ['USA Softball', 'USSSA', 'PGF', 'Triple Crown', 'Alliance Fastpitch'], division: '14U Fastpitch', venue: 'fields', unit: 'Field' },
  { name: 'Hockey', orgs: ['USA Hockey', 'AAU Hockey', 'NAHC'], division: '12U Hockey', venue: 'rinks', unit: 'Rink' },
  { name: 'Equestrian', orgs: ['US Equestrian', 'IEA', 'USHJA', 'US Pony Clubs'], division: 'Junior Hunter/Jumper', venue: 'arenas', unit: 'Ring' },
  { name: 'Gymnastics', orgs: ['USA Gymnastics', 'AAU Gymnastics', 'USAIGC', 'NGA'], division: 'Level 7', venue: 'gyms', unit: 'Session' },
];

export type EventItem = {
  id: string;
  month: string;
  day: string;
  name: string;
  city: string;
  dates: string;
  staysNearby: number;
};

export function eventsFor(sport: Sport, org: string): EventItem[] {
  const slug = (sport.name + '-' + org).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return [
    { id: slug + '-1', month: 'NOV', day: '13', name: `[Tournament name] · ${sport.division}`, city: '[City, ST]', dates: 'Nov 13–15', staysNearby: 42 },
    { id: slug + '-2', month: 'DEC', day: '04', name: `[Tournament name] · ${sport.division}`, city: '[City, ST]', dates: 'Dec 4–6', staysNearby: 28 },
    { id: slug + '-3', month: 'JAN', day: '15', name: `[Tournament name] · ${sport.division}`, city: '[City, ST]', dates: 'Jan 15–17', staysNearby: 35 },
  ];
}

export type SearchHit = EventItem & { sport: string; org: string };

// Searches every sport and organization's events by sport, organization, event name or city.
export function searchEvents(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const s of SPORTS) {
    for (const o of s.orgs) {
      const first = eventsFor(s, o)[0];
      const text = `${s.name} ${o} ${first.name} ${first.city}`.toLowerCase();
      if (q.split(/\s+/).every((w) => text.includes(w))) hits.push({ ...first, sport: s.name, org: o });
    }
  }
  return hits;
}

export type PlaceType ='Hotel' | 'Condo' | 'Home' | 'Apartment';

export type Stay = {
  id: string;
  /** Which provider supplied this listing (see src/services/lodging/registry.ts). */
  source?: string;
  type: PlaceType;
  name: string;
  summary: string;
  sleeps: number;
  driveMin: number;
  miles: number;
  pricePerNight: string;
  perks: string[];
};

export const STAYS: Stay[] = [
  { id: 'home-1', type: 'Home', name: '[Home name] · 4BR', summary: '4 bedrooms · 3 baths', sleeps: 10, driveMin: 4, miles: 1.1, pricePerNight: '[$000]', perks: ['Parking for 3 cars', 'Washer for uniforms', 'Full kitchen', 'Early check-in'] },
  { id: 'hotel-1', type: 'Hotel', name: '[Hotel name]', summary: 'Suite · 2 queens + sofa bed', sleeps: 6, driveMin: 6, miles: 1.8, pricePerNight: '[$000]', perks: ['Team rate', 'Pool', 'Free breakfast', 'Free parking'] },
  { id: 'condo-1', type: 'Condo', name: '[Condo name] · 2BR', summary: '2 bedrooms · 2 baths', sleeps: 6, driveMin: 8, miles: 2.6, pricePerNight: '[$000]', perks: ['Washer for uniforms', 'Full kitchen', 'Gear storage', 'Free parking'] },
  { id: 'apt-1', type: 'Apartment', name: '[Apartment name] · 3BR', summary: '3 bedrooms · 2 baths', sleeps: 7, driveMin: 11, miles: 4.0, pricePerNight: '[$000]', perks: ['Full kitchen', 'Washer', 'Elevator', 'Free parking'] },
];

export type Place = {
  tag: string;
  name: string;
  note: string;
  driveMin: number;
  /** Set when the venue takes orders through EazyTab. */
  eazytabVenueId?: string;
};

export const EAT: Place[] = [
  // EazyTab demo venue: Front Range Sports Complex (see the EazyTab repo's README).
  { tag: 'SNACK', name: 'Snack Shack', note: 'At the complex · order ahead, pick a pickup time', driveMin: 0, eazytabVenueId: 'youth-tournaments.front-range-sports-complex.snack-shack' },
  { tag: 'GRILL', name: 'Grill Station', note: 'At the complex · burgers and tenders', driveMin: 0, eazytabVenueId: 'youth-tournaments.front-range-sports-complex.grill-station' },
  { tag: 'COFFEE', name: 'Coffee & Smoothies', note: 'At the complex · main entrance', driveMin: 0, eazytabVenueId: 'youth-tournaments.front-range-sports-complex.coffee-smoothies' },
  { tag: 'BBQ', name: '[Restaurant name]', note: 'Big groups welcome', driveMin: 3 },
  { tag: 'PIZZA', name: '[Pizza place]', note: 'Delivers to the fields', driveMin: 5 },
  { tag: 'CAFE', name: '[Breakfast spot]', note: 'Opens 6 AM', driveMin: 4 },
  { tag: 'SHOP', name: '[Grocery store]', note: 'Snacks, ice, drinks', driveMin: 3 },
];

export const PLAY: Place[] = [
  { tag: 'FUN', name: '[Trampoline park]', note: 'Team group rates', driveMin: 9 },
  { tag: 'BOWL', name: '[Bowling alley]', note: 'Lanes for big groups', driveMin: 7 },
  { tag: 'SWIM', name: '[Water park]', note: 'Indoor · open late', driveMin: 14 },
  { tag: 'PARK', name: '[City park]', note: 'Playground + picnic', driveMin: 5 },
];

export const GAME_TIMES = [
  { when: 'Fri 6:00 PM', where: '[Park A]', unitNo: 2 },
  { when: 'Sat 9:00 AM', where: '[Park B]', unitNo: 5 },
  { when: 'Sat 2:00 PM', where: '[Park A]', unitNo: 1 },
];

export const CHECKOUT_TASKS = ['Doors locked', 'Dishwasher started', 'Trash taken out', 'Keys left on the counter'];
