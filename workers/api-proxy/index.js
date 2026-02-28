addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, "https://25maths-website.pages.dev");

  const headers = new Headers(request.headers);
  headers.set("Host", "25maths-website.pages.dev");

  const init = {
    method: request.method,
    headers: headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const response = await fetch(target.toString(), init);

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "https://www.25maths.com");
  newHeaders.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: newHeaders });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
