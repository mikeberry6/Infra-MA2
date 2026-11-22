export function normalizeLoginCallback(callbackUrl: string | undefined): string {
  if (
    typeof callbackUrl !== "string" ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(callbackUrl)
  ) return "/";

  try {
    const origin = "https://infrasight.invalid";
    const parsed = new URL(callbackUrl, origin);
    if (parsed.origin !== origin) return "/";
    // Bookmarked sign-in links can carry a return path from the old deployment.
    const pathname = parsed.pathname.replace(/^\/Infra-MA2(?:\/|$)/, "/");
    if (pathname.startsWith("//")) return "/";
    return `${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export function normalizeNextAuthRedirect(callbackUrl: string | undefined, baseUrl: string): string {
  let applicationUrl: URL;
  try {
    applicationUrl = new URL(baseUrl);
  } catch {
    return "/";
  }

  let applicationPath = callbackUrl;
  if (callbackUrl && !callbackUrl.startsWith("/")) {
    try {
      const parsedCallback = new URL(callbackUrl);
      applicationPath = parsedCallback.origin === applicationUrl.origin
        ? `${parsedCallback.pathname}${parsedCallback.search}${parsedCallback.hash}`
        : undefined;
    } catch {
      applicationPath = undefined;
    }
  }

  return new URL(
    normalizeLoginCallback(applicationPath),
    applicationUrl.origin,
  ).toString();
}
