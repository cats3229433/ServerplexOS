// ══════════════════════════════════════════════
//  SERVERPLEX BROWSER — CONTENT FILTER v2
//  os-apps/BrowserFiles/content-filter.js
//
//  Usage: ContentFilter.check(url) → { blocked, reason }
//         ContentFilter.logBlock(url, reason)
//         ContentFilter.userSettings  — read/write user prefs
// ══════════════════════════════════════════════

const ContentFilter = (() => {

  // ══════════════════════════════════════════════
  //  CORE BLOCKED DOMAINS — LOCKED, NEVER EDITABLE
  // ══════════════════════════════════════════════
  const CORE_DOMAINS = [
    'pornhub.com','xvideos.com','xnxx.com','xhamster.com','redtube.com',
    'youporn.com','tube8.com','brazzers.com','bangbros.com','realitykings.com',
    'mofos.com','nubiles.net','twistys.com','digitalplayground.com','vivid.com',
    'penthouse.com','playboy.com','hustler.com','adultfriendfinder.com',
    'ashleymadison.com','onlyfans.com','fansly.com','manyvids.com','clips4sale.com',
    'iwantclips.com','niteflirt.com','chaturbate.com','myfreecams.com','cam4.com',
    'streamate.com','livejasmin.com','bongacams.com','stripchat.com','camsoda.com',
    'flirt4free.com','imlive.com','slutroulette.com','dirtyroulette.com',
    'rule34.xxx','nhentai.net','hanime.tv','hentaihaven.xxx','gelbooru.com',
    'danbooru.donmai.us','e621.net','e-hentai.org','exhentai.org','fakku.net',
    'luscious.net','sex.com','porn.com','xxx.com','adult.com','fuq.com',
    'spankwire.com','extremetube.com','hardsextube.com','keezmovies.com',
    'beeg.com','drtuber.com','txxx.com','vporn.com','nuvid.com','4tube.com',
    'ixxx.com','porntrex.com','eporner.com','porntube.com','fapdu.com',
    'thumbzilla.com','motherless.com','gotporn.com','ashemaletube.com',
    'tnaflix.com','sexvid.xxx','porndig.com','hdpornvideo.xxx','netfapx.com',
    'vjav.com','javhd.com','caribbeancom.com','heyzo.com','1pondo.tv',
    'tokyohot.com','fanza.net','pornzog.com','tubedupe.com','helixstudios.net',
    'gaymaletube.com','xtube.com','gaytube.com','boyfriendtv.com','gayporn.com',
    'femdomempire.com','kink.com','boundgods.com','whippedass.com',
    'camwhores.tv','camhub.cc','nudostar.com','thothub.to','simpcity.su',
    'leakedbb.com','anonib.al','anon-v.com','gotanynudes.com','nudeleak.com',
    'spankbang.com','pornhd.com','empflix.com','alohatube.com','pornoxo.com',
    'slutload.com','hotmovies.com','pornerbros.com','hdporno.tv','fuck.com',
    'sexo.com','porzo.com','sexu.com','submityourflicks.com','xbabe.com',
    'sunporno.com','camsex.com','webcamsex.com','sexchat.com','adultchat.net',
    'sexcamly.com','camcontacts.com','fetlife.com','collarspace.com',
    'adultwork.com','sexfinder.com','fuckbook.com','instabang.com',
    'benaughty.com','iamnaughty.com','uberhorny.com','wantmatures.com',
    'milfplay.com','together2night.com','snapsext.com','pussysaga.com',
    'nudefap.com','fap18.net','fapvid.com','fapping.com','hentai-foundry.com',
    'rule34.paheal.net','fc2.com','phica.net','incestflix.com','taboo.tube',
    'camrecordings.com','nudogram.com','shemale.xxx','metatube.com',
    'poringa.net','eroxia.com','sexhound.com','camcontacts.com',
    'swinglifestyle.com','kasidie.com','fabswingers.com','swingers.com',
    'bondage.com','alt.com','adultmatchmaker.com','recon.com',
    'pornorama.com','pervclips.com','megatube.xxx','freepornvideo.xxx',
    'sexfilm.nl','seksfilmpjes.nl','porno.de','sex.de','porno.fr',
    'sexo.es','porno.es','porno.it',
  ];

  // ══════════════════════════════════════════════
  //  CORE URL KEYWORDS — LOCKED
  // ══════════════════════════════════════════════
  const CORE_KEYWORDS = [
    'porn','xxx','adult','nsfw','hentai','erotic','nude','naked',
    'milf','dildo','orgasm','masturbat','cumshot','creampie',
    'gangbang','threesome','fetish','bdsm','bondage','domina',
    'onlyfan','fansly','camgirl','webcamgirl','stripclub','escort',
    'prostitut','callgirl','naughty','kinky','taboo','incest',
    'lolicon','shotacon','jailbait',
    'xvideo','xhamster','xnxx','pornhub','brazzers','bangbros',
    'chaturbate','livejasmin','myfreecams','bongacams',
    'spankbang','redtube','youporn','tube8','rule34',
    'big-tits','big-ass','blowjob','handjob','titjob','footjob','rimjob',
    'deepthroat','facials','squirt','camwhore','nakedphoto','nakedvid',
  ];

  // ══════════════════════════════════════════════
  //  OPTIONAL CATEGORY DOMAINS (user toggleable)
  // ══════════════════════════════════════════════
  const SOCIAL_MEDIA_DOMAINS = [
    'twitter.com','x.com','instagram.com','tiktok.com','snapchat.com',
    'facebook.com','fb.com','reddit.com','tumblr.com','pinterest.com',
    'discord.com','telegram.org','whatsapp.com','threads.net','bereal.com',
  ];

  const GAMING_DOMAINS = [
    'miniclip.com','poki.com','coolmathgames.com','agame.com','y8.com',
    'friv.com','kizi.com','silvergames.com','crazygames.com','gameflare.com',
    'addictinggames.com','kongregate.com','newgrounds.com','armor games.com',
    'unblocked-games.com','unblockedgames66.com','unblockedgames77.com',
    'tyrone unblocked','66unblocked.com','mills eagles.com',
    'steamcommunity.com','roblox.com','minecraft.net',
  ];

  // ══════════════════════════════════════════════
  //  USER SETTINGS (stored in localStorage)
  // ══════════════════════════════════════════════
  function loadUserSettings() {
    try {
      return JSON.parse(localStorage.getItem('cf_user_settings') || '{}');
    } catch(e) { return {}; }
  }
  function saveUserSettings(s) {
    localStorage.setItem('cf_user_settings', JSON.stringify(s));
  }

  function getUserDomains()   { return loadUserSettings().domains   || []; }
  function getUserKeywords()  { return loadUserSettings().keywords  || []; }
  function getAllowedSites()  { return loadUserSettings().allowed   || []; }
  function isSocialBlocked()  { return !!loadUserSettings().blockSocial; }
  function isGamingBlocked()  { return !!loadUserSettings().blockGaming; }
  function isSafeSearch()     { return loadUserSettings().safeSearch !== false; } // on by default
  function getFilterPin()     { return loadUserSettings().filterPin || ''; }

  // ── Block log ────────────────────────────────
  function logBlock(url, reason) {
    var log = [];
    try { log = JSON.parse(sessionStorage.getItem('cf_block_log') || '[]'); } catch(e) {}
    log.unshift({ url, reason, time: Date.now() });
    if (log.length > 100) log.pop();
    sessionStorage.setItem('cf_block_log', JSON.stringify(log));
  }
  function getBlockLog() {
    try { return JSON.parse(sessionStorage.getItem('cf_block_log') || '[]'); } catch(e) { return []; }
  }

  // ── Hostname helper ──────────────────────────
  function getHost(url) {
    try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); }
    catch(e) { return url.toLowerCase(); }
  }

  function domainMatch(host, list) {
    for (var i = 0; i < list.length; i++) {
      var d = list[i].toLowerCase().replace(/^www\./, '');
      if (host === d || host.endsWith('.' + d)) return true;
    }
    return false;
  }

  // ── Safe search URL rewriter ─────────────────
  function applySafeSearch(url) {
    if (!isSafeSearch()) return url;
    try {
      var u = new URL(url);
      var h = u.hostname;
      if (h.includes('google.'))  { u.searchParams.set('safe','active'); return u.toString(); }
      if (h.includes('bing.'))    { u.searchParams.set('adlt','strict'); return u.toString(); }
      if (h.includes('duckduckgo')) { u.searchParams.set('kp','1'); return u.toString(); }
      if (h.includes('youtube.')) { u.searchParams.set('safe','active'); return u.toString(); }
    } catch(e) {}
    return url;
  }

  // ══════════════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════════════
  return {

    check(url) {
      if (!url) return { blocked: false, url };
      var lower = url.toLowerCase();
      var host  = getHost(url);
      var allowed = getAllowedSites().map(s => s.toLowerCase().replace(/^www\./, ''));

      // Whitelist check — allowed sites bypass everything
      if (domainMatch(host, allowed)) return { blocked: false, url };

      // ── Core domain block (locked) ──
      if (domainMatch(host, CORE_DOMAINS)) {
        logBlock(url, 'Adult content');
        return { blocked: true, reason: 'This site contains adult content and has been blocked.' };
      }

      // ── Core keyword block (locked) ──
      for (var i = 0; i < CORE_KEYWORDS.length; i++) {
        if (lower.includes(CORE_KEYWORDS[i])) {
          logBlock(url, 'Restricted keyword');
          return { blocked: true, reason: 'This URL contains restricted content.' };
        }
      }

      // ── Social media block (user toggle) ──
      if (isSocialBlocked() && domainMatch(host, SOCIAL_MEDIA_DOMAINS)) {
        logBlock(url, 'Social media');
        return { blocked: true, reason: 'Social media sites are currently blocked.' };
      }

      // ── Gaming block (user toggle) ──
      if (isGamingBlocked() && domainMatch(host, GAMING_DOMAINS)) {
        logBlock(url, 'Gaming site');
        return { blocked: true, reason: 'Gaming sites are currently blocked.' };
      }

      // ── User custom domain block ──
      var userDomains = getUserDomains();
      if (userDomains.length && domainMatch(host, userDomains)) {
        logBlock(url, 'Custom block');
        return { blocked: true, reason: 'This site has been blocked by your custom filter.' };
      }

      // ── User custom keyword block ──
      var userKeywords = getUserKeywords();
      for (var j = 0; j < userKeywords.length; j++) {
        if (lower.includes(userKeywords[j].toLowerCase())) {
          logBlock(url, 'Custom keyword');
          return { blocked: true, reason: 'This URL matches a custom blocked keyword.' };
        }
      }

      // Not blocked — apply safe search if needed
      return { blocked: false, url: applySafeSearch(url) };
    },

    checkTitle(title) {
      if (!title) return { blocked: false };
      var lower = title.toLowerCase();
      var coreTitle = ['porn','xxx','adult','nude','naked','sex video','hentai','erotic','nsfw','onlyfans'];
      for (var i = 0; i < coreTitle.length; i++) {
        if (lower.includes(coreTitle[i])) return { blocked: true, reason: 'Page content is restricted.' };
      }
      return { blocked: false };
    },

    applySafeSearch,
    logBlock,
    getBlockLog,
    loadUserSettings,
    saveUserSettings,
    getUserDomains,
    getUserKeywords,
    getAllowedSites,
    isSocialBlocked,
    isGamingBlocked,
    isSafeSearch,
    getFilterPin,
  };
})();