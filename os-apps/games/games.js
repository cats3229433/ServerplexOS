// Game registry loader for ServerplexOS Games app
// Merges all sources, then deduplicates by name.
// ALL_GAMES = full list (used by source dropdown)
// MANUAL_GAMES = deduplicated list (shown in game grid)

var ALL_GAMES = [
  ...(typeof COMMUNITY_GAMES !== 'undefined' ? COMMUNITY_GAMES : []),
  ...(typeof COOLDUDE_GAMES  !== 'undefined' ? COOLDUDE_GAMES  : []),
  ...(typeof KH0_GAMES       !== 'undefined' ? KH0_GAMES       : []),
  ...(typeof RADON_GAMES     !== 'undefined' ? RADON_GAMES     : []),
];

// Deduplicate by normalized name.
// For each group of duplicates, keep the entry that scores highest:
//   3pts = has cover image
//   2pts = has description
//   1pt  = has author
// Ties broken by source priority order: Community > CoolDude > 3KH0 > Radon-Games
(function() {
  var normalize = function(n) { return (n || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var sourcePriority = { 'Community': 4, 'CoolDude': 3, '3KH0': 2, 'Radon-Games': 1 };

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

    // Score each entry — pick the best one
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

  var MANUAL_GAMES = deduped;
  // Expose globally
  window.MANUAL_GAMES = MANUAL_GAMES;
})();

// Fallback if not set
if (typeof window.MANUAL_GAMES === 'undefined') window.MANUAL_GAMES = ALL_GAMES;
var MANUAL_GAMES = window.MANUAL_GAMES;
