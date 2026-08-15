/**
 * IATA airline code → display name (carriers common on TLV routes).
 * Reference data — the live-price API returns airlines as IATA codes; this makes
 * them human-readable. Unknown codes fall back to the code itself.
 */
export const AIRLINES: Record<string, string> = {
  LY: 'El Al', '6H': 'Israir', IZ: 'Arkia', H4: 'HiSky',
  W6: 'Wizz Air', W4: 'Wizz Air Malta', FR: 'Ryanair', U2: 'easyJet',
  LH: 'Lufthansa', TK: 'Turkish Airlines', A3: 'Aegean', AZ: 'ITA Airways',
  AF: 'Air France', KL: 'KLM', BA: 'British Airways', IB: 'Iberia', VY: 'Vueling',
  UX: 'Air Europa', OS: 'Austrian', LX: 'SWISS', SN: 'Brussels Airlines',
  TP: 'TAP Air Portugal', AY: 'Finnair', SK: 'SAS', DE: 'Condor', EW: 'Eurowings',
  PC: 'Pegasus', XQ: 'SunExpress', VF: 'AJet', HV: 'Transavia', TO: 'Transavia France',
  KM: 'Air Malta', OU: 'Croatia Airlines', JU: 'Air Serbia', RO: 'TAROM',
  FB: 'Bulgaria Air', BT: 'airBaltic', A9: 'Georgian Airways',
  DL: 'Delta', AA: 'American Airlines', UA: 'United', B6: 'JetBlue',
  EK: 'Emirates', QR: 'Qatar Airways', EY: 'Etihad', WY: 'Oman Air', GF: 'Gulf Air',
  J9: 'Jazeera Airways', MS: 'EgyptAir', RJ: 'Royal Jordanian', ET: 'Ethiopian',
  NO: 'Neos', LO: 'LOT', A5: 'HOP', TB: 'TUI fly', X3: 'TUI fly', VA: 'Air Montenegro',
}

export const airlineName = (code: string): string => AIRLINES[code] || code
