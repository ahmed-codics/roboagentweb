/**
 * The app is served behind nginx under /roboagent (see basePath in next.config.ts).
 *
 * Next rewrites <Link> hrefs and the router for you, but it does NOT prefix URLs
 * passed to fetch() — a client-side fetch("/api/…") would hit the root app and
 * 404. Anything fetched from the browser must go through here.
 */
export const BASE_PATH = "/roboagent";

export function apiUrl(path: string): string {
	return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
