const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  if (!path.startsWith("/") || !BASE_PATH) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

export function withoutBasePath(path: string): string {
  if (!BASE_PATH) return path;
  if (path === BASE_PATH) return "/";
  if (path.startsWith(`${BASE_PATH}/`)) return path.slice(BASE_PATH.length);
  return path;
}

export function normalizeBasePathCallback(callbackUrl: string | undefined): string {
  if (!callbackUrl) return withBasePath("/");
  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return withBasePath(callbackUrl);
  }
  return callbackUrl;
}
