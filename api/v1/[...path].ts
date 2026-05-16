const NVIDIA_BASE = 'https://integrate.api.nvidia.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-amz-date, x-amz-security-token, x-api-key',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      const url = new URL(request.url);
      const upstreamPath = url.pathname.replace(/^\/api/, '');
      const targetUrl = new URL(upstreamPath + url.search, NVIDIA_BASE);

      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.delete('referer');
      headers.delete('origin');
      headers.delete('accept-encoding');
      headers.delete('connection');
      headers.delete('transfer-encoding');

      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

      const upstream = await fetch(targetUrl.toString(), {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        // @ts-ignore
        duplex: hasBody ? 'half' : undefined,
        signal: request.signal,
      });

      const responseHeaders = new Headers(upstream.headers);
      for (const [k, v] of Object.entries(CORS_HEADERS)) {
        responseHeaders.set(k, v);
      }
      responseHeaders.delete('content-encoding');
      responseHeaders.delete('content-length');
      responseHeaders.delete('transfer-encoding');
      responseHeaders.delete('connection');

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });

    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      return Response.json(
        {
          error: {
            message: isAbort ? 'Request cancelled' : 'Failed to proxy request to NVIDIA API',
            type: 'proxy_error',
            details: err?.message,
          },
        },
        { status: isAbort ? 499 : 500, headers: CORS_HEADERS }
      );
    }
  },
};
