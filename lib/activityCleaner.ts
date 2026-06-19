/**
 * Cleans activity descriptions by removing transit information
 * and normalizing the text
 */
export function cleanActivityDescription(description: string): string {
  if (!description) return "";

  // Remove common transit-related patterns
  const cleaned = description
    // Remove travel time patterns like "10 min drive", "30 min walk", etc.
    .replace(/\b(\d+\s*(?:hour|minute|min|hr|hrs|mins)?s?\s*(?:drive|walk|transit|travel|commute|journey))\b/gi, "")
    // Remove transit modes at the beginning or after punctuation
    .replace(/(?:^|[.!?])\s*(?:by|via|using|take|drive|walk|fly|train|bus|taxi|uber|ride)\s+/gi, " ")
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}
