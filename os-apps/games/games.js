// Game registry loader for ServerplexOS Games app
  // This file loads all source-specific game files and merges them into MANUAL_GAMES
  
// Load order matters — earlier entries take precedence
// ══════════════════════════════════════════════════════════════

// Source: Community (Serverplex/ServerplexOS-Games GitHub repo)

// Source: GN-Math (gn-math/html GitHub)

// Source: CoolDude (CoolDude2349/Offline-HTML-Games-Pack)

var MANUAL_GAMES = [
  ...(typeof COMMUNITY_GAMES !== 'undefined' ? COMMUNITY_GAMES : []),
  ...(typeof GNMATH_GAMES !== 'undefined' ? GNMATH_GAMES : []),
  ...(typeof COOLDUDE_GAMES !== 'undefined' ? COOLDUDE_GAMES : []),
];