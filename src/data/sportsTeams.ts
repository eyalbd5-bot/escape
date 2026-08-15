/**
 * Curated TheSportsDB team IDs per featured city (spec §8.3 — team→city map).
 * Football + basketball (NBA / EuroLeague-tier) top clubs per city, so the events
 * screen surfaces real home matches via the key-free `eventsnext`.
 * Keyed by the curated city IATA.
 */
export interface TeamRef {
  id: string
  name: string
  league: string
  sport: 'soccer' | 'basketball'
}

const soccer = (id: string, name: string, league: string): TeamRef => ({ id, name, league, sport: 'soccer' })
const basket = (id: string, name: string, league: string): TeamRef => ({ id, name, league, sport: 'basketball' })

export const SPORTS_TEAMS: Record<string, TeamRef[]> = {
  LON: [
    soccer('133604', 'Arsenal', 'Premier League'),
    soccer('133610', 'Chelsea', 'Premier League'),
    soccer('133616', 'Tottenham Hotspur', 'Premier League'),
    soccer('133636', 'West Ham United', 'Premier League'),
    soccer('133632', 'Crystal Palace', 'Premier League'),
    soccer('133600', 'Fulham', 'Premier League'),
    soccer('134355', 'Brentford', 'Premier League'),
  ],
  PAR: [
    soccer('133714', 'Paris Saint-Germain', 'Ligue 1'),
    soccer('135465', 'Paris FC', 'Ligue 1'),
    basket('141489', 'Paris Basketball', 'EuroLeague'),
  ],
  BCN: [
    soccer('133739', 'Barcelona', 'La Liga'),
    soccer('133734', 'Espanyol', 'La Liga'),
    basket('135082', 'FC Barcelona Bàsquet', 'EuroLeague'),
  ],
  MAD: [
    soccer('133738', 'Real Madrid', 'La Liga'),
    soccer('133729', 'Atlético Madrid', 'La Liga'),
    soccer('133728', 'Rayo Vallecano', 'La Liga'),
    basket('135092', 'Real Madrid Baloncesto', 'EuroLeague'),
  ],
  ROM: [soccer('133682', 'AS Roma', 'Serie A'), soccer('133668', 'Lazio', 'Serie A')],
  MIL: [
    soccer('133667', 'AC Milan', 'Serie A'),
    soccer('133681', 'Inter Milan', 'Serie A'),
    basket('135383', 'Olimpia Milano', 'EuroLeague'),
  ],
  AMS: [soccer('133772', 'Ajax', 'Eredivisie')],
  BER: [
    soccer('134690', 'Union Berlin', 'Bundesliga'),
    soccer('133658', 'Hertha BSC', '2. Bundesliga'),
    basket('135416', 'ALBA Berlin', 'EuroLeague'),
  ],
  MUC: [
    soccer('133664', 'Bayern Munich', 'Bundesliga'),
    soccer('134242', '1860 Munich', '3. Liga'),
  ],
  PRG: [soccer('136036', 'Slavia Prague', 'Czech First League')],
  VIE: [
    soccer('134021', 'Rapid Vienna', 'Austrian Bundesliga'),
    soccer('134390', 'Austria Wien', 'Austrian Bundesliga'),
  ],
  BUD: [soccer('134620', 'Ferencváros', 'NB I')],
  ATH: [
    soccer('133746', 'Panathinaikos', 'Super League Greece'),
    basket('135636', 'Panathinaikos BC', 'EuroLeague'),
    basket('135635', 'Olympiacos BC', 'EuroLeague'),
  ],
  LIS: [soccer('134108', 'Benfica', 'Primeira Liga')],
  OTP: [soccer('134005', 'FCSB', 'Liga I')],
  SOF: [soccer('134085', 'Levski Sofia', 'Bulgarian First League')],
  VAR: [soccer('137915', 'Cherno More', 'Bulgarian First League')],
  IST: [
    soccer('133804', 'Galatasaray', 'Süper Lig'),
    soccer('133807', 'Fenerbahçe', 'Süper Lig'),
    soccer('133794', 'Beşiktaş', 'Süper Lig'),
    basket('136066', 'Anadolu Efes', 'EuroLeague'),
  ],
  NYC: [
    soccer('134630', 'New York City FC', 'MLS'),
    basket('134862', 'New York Knicks', 'NBA'),
    basket('134861', 'Brooklyn Nets', 'NBA'),
  ],
  LAX: [
    soccer('134153', 'LA Galaxy', 'MLS'),
    basket('134867', 'Los Angeles Lakers', 'NBA'),
    basket('134866', 'LA Clippers', 'NBA'),
  ],
  MIA: [
    soccer('137699', 'Inter Miami', 'MLS'),
    basket('134882', 'Miami Heat', 'NBA'),
  ],
  DXB: [soccer('137835', 'Al Wasl', 'UAE Pro League')],
  BKK: [soccer('139227', 'BG Pathum United', 'Thai League 1')],
  TYO: [soccer('137704', 'FC Tokyo', 'J1 League')],
}
