/**
 * Generates a unique ID with an optional prefix
 * @param prefix Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${randomPart}`;
}

/**
 * Ensures an ID is unique by either using the provided ID or generating a new one
 * @param id The ID to check
 * @param prefix Optional prefix for the generated ID
 * @returns A unique ID string
 */
export function ensureUniqueId(id: string | undefined | null, prefix: string = ''): string {
  if (id) return id;
  return generateUniqueId(prefix);
}
