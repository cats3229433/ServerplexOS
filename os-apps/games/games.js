// Game registry loader for ServerplexOS Games app
// Merges all sources, then deduplicates by name.
// ALL_GAMES = full list (used by source dropdown)
// MANUAL_GAMES = deduplicated list (shown in game grid)

var ALL_GAMES = [
  ...(typeof COMMUNITY_GAMES        !== 'undefined' ? COMMUNITY_GAMES        : []),
  ...(typeof COOLDUDE_GAMES         !== 'undefined' ? COOLDUDE_GAMES         : []),
  ...(typeof KH0_GAMES              !== 'undefined' ? KH0_GAMES              : []),
  ...(typeof RADON_GAMES            !== 'undefined' ? RADON_GAMES            : []),
  ...(typeof CHILIBOWL_GAMES        !== 'undefined' ? CHILIBOWL_GAMES        : []),
  ...(typeof MINECRAFT_CLIENTS      !== 'undefined' ? MINECRAFT_CLIENTS      : []),
];

// Deduplicate by normalized name.
// For each group of duplicates, keep the entry that scores highest:
//   30pts = has cover image
//   20pts = has description
//   10pts = has author
// Ties broken by source priority order
(function() {
  var normalize = function(n) { return (n || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var sourcePriority = {
    'Community':          10,
    'CoolDude':            9,
    '3KH0':                8,
    'Radon-Games':         7,
    'ChiliBowl':           6,
    'MinecraftClients':    5,
  };

  var grouped = {};
  ALL_GAMES.forEach(function(g) {
    var key = normalize(g.name);
    if (!key) return;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(g);
  });

  var seen = new Set();
  var deduped = [];

  ALL_GAMES.forEach(function(g) {
    var key = normalize(g.name);
    if (!key || seen.has(key)) return;
    seen.add(key);

    var group = grouped[key];
    if (group.length === 1) {
      deduped.push(g);
      return;
    }

    var scored = group.map(function(x) {
      var score = (sourcePriority[x.source] || 0);
      if (x.cover)       score += 30;
      if (x.description) score += 20;
      if (x.author)      score += 10;
      return { g: x, score: score };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    deduped.push(scored[0].g);
  });

  window.MANUAL_GAMES = deduped;
})();

if (typeof window.MANUAL_GAMES === 'undefined') window.MANUAL_GAMES = ALL_GAMES;
var MANUAL_GAMES = window.MANUAL_GAMES;