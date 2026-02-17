export function fixText(str: string | null | undefined) {
  if (!str) return "";

  try {
    return JSON.parse(`"${str}"`);
  } catch {
    return str;
  }
}
