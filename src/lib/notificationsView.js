import { api } from "@/api/apiClient";

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `Il y a ${Math.floor(diff)} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
  return `Il y a ${Math.floor(diff / 1440)} j`;
}

export async function fetchNotifications() {
  try {
    const list = await api.entities.Notification.list();
    return (list || []).map((n) => ({
      ...n,
      time: when(n.time),
    }));
  } catch {
    return [];
  }
}

export async function markAllNotificationsRead() {
  await api.entities.Notification.markAllRead();
}
