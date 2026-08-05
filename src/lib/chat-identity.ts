const STORAGE_KEY = "novacart_chat_guest";

export interface GuestChatIdentity {
  id: string;
  name: string;
  email: string;
}

export interface ChatIdentity extends GuestChatIdentity {
  isGuest: boolean;
}

function generateGuestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readGuestChatIdentity(): GuestChatIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<GuestChatIdentity>;
    if (!parsed?.id) {
      return null;
    }

    return {
      id: parsed.id,
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return null;
  }
}

export function createGuestChatIdentity(): GuestChatIdentity {
  const identity: GuestChatIdentity = { id: generateGuestId(), name: "", email: "" };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {}

  return identity;
}

export function saveGuestChatInfo(name: string, email: string): GuestChatIdentity {
  const existing = readGuestChatIdentity() ?? createGuestChatIdentity();
  const next: GuestChatIdentity = { ...existing, name: name.trim(), email: email.trim() };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}

  return next;
}
