export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const p = url.pathname.toLowerCase();
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();
  const asn = request.headers.get("CF-ASN") || "";
  const blockedASNs = [
    "15169",  // Google Cloud
    "16509",  // Amazon AWS
    "14618",  // Amazon
    "8075",   // Microsoft Azure
    "13335",  // Cloudflare (bots sometimes)
    "14061",  // DigitalOcean
    "16276",  // OVH
    "24940",  // Hetzner
    "20473",  // Vultr
    "63949",  // Linode
    "396998", // Oracle Cloud
    "30083",  // Leaseweb
    "51167",  // Contabo
  ];
  if (blockedASNs.includes(asn)) {
    return new Response("Forbidden", { status: 403 });
  }
  if (["/admin","/admin/","/secret","/secret/","/config","/config/","/hidden","/hidden/","/private","/private/"].some(x => p.startsWith(x)))
    return new Response("Forbidden", { status: 403 });
  if (p.includes("%2e"))
    return new Response("Forbidden", { status: 403 });
  if (["/.env","/env","/aws","/.aws","/.git","/git","/home/","/project_root/","/config","/test/","/v3/"].some(x => p.includes(x)))
    return new Response("Forbidden", { status: 403 });
  const bad = ["curl","wget","python","python-requests","go-http-client","libwww-perl","nikto","sqlmap","fuzzer","scanner","masscan","nmap","dirbuster","gobuster","zgrab","headless","phantomjs","selenium","scrapy","bot"];
  if (bad.some(x => ua.includes(x)))
    return new Response("Forbidden", { status: 403 });
  if (!ua.trim())
    return new Response("Forbidden", { status: 403 });
  return fetch(request);
};
