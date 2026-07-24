export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const p = url.pathname.toLowerCase();
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();

  if (p.includes("%2e")) return new Response("Forbidden", { status: 403 });

  if (["/.env","/env","/.git","/git","/.aws","/aws"].some(x => p.includes(x)))
    return new Response("Forbidden", { status: 403 });

  if (!ua.trim()) return new Response("Forbidden", { status: 403 });

  return fetch(request);
};
