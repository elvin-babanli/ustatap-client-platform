/**
 * Per-user favorite master ids (API-ready local persistence).
 */

const NS = "ustatap_favorites_v1";

function key(userId: string) {
  return `${NS}:${userId}`;
}

export function loadFavoriteIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function toggleFavoriteId(userId: string, masterId: string): boolean {
  if (typeof window === "undefined") return false;
  const set = loadFavoriteIds(userId);
  const next = new Set(set);
  if (next.has(masterId)) {
    next.delete(masterId);
    persist(userId, next);
    return false;
  }
  next.add(masterId);
  persist(userId, next);
  return true;
}

export function isFavorite(userId: string, masterId: string): boolean {
  return loadFavoriteIds(userId).has(masterId);
}

function persist(userId: string, set: Set<string>) {
  localStorage.setItem(key(userId), JSON.stringify([...set]));
  window.dispatchEvent(new Event("ustatap-favorites-changed"));
}
