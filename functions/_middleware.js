export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  // Block encoded dotfiles (.env, .git, .aws, etc.)
  if (path.includes("%2e")) {
    return new Response("Forbidden", { status: 403 });
  }

  // Block attempts to access hidden or dangerous paths
  const blockedPatterns = [
    "/.env",
    "/env",
    "/aws",
    "/.aws",
    "/.git",
    "/git",
    "/home/",
    "/project_root/",
    "/config",
    "/test/",
    "/v3/",
  ];

  for (const pattern of blockedPatterns) {
    if (path.includes(pattern)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Allow normal traffic
  return fetch(request);
};
