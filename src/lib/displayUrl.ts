/** Human-friendly link label: no protocol, no `www.`, no trailing slash. */
export function displayUrl(url: string): string {
  const { host, pathname, search } = new URL(url);
  const path = pathname.replace(/\/+$/, "");
  return `${host.replace(/^www\./, "")}${path}${search}`;
}
