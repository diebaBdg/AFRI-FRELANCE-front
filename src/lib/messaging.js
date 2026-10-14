import { api } from "@/api/apiClient";

export const timeShort = (iso) => (iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");

const toConvView = (rec, userId) => {
  const isA = String(rec.participant_a_id) === String(userId);
  return {
    id: rec.id,
    _real: true,
    otherId: isA ? rec.participant_b_id : rec.participant_a_id,
    clientName: (isA ? rec.participant_b_name : rec.participant_a_name) || "Interlocuteur",
    clientAvatar: isA ? rec.user2AvatarUrl : rec.user1AvatarUrl,
    lastMessage: rec.last_message || "",
    time: rec.last_time ? timeShort(rec.last_time) : "",
    unread: rec.unread || 0,
    thread: [],
    projectTitle: rec.project_title || "",
  };
};

export async function fetchConversationsForUser(userId) {
  if (!userId) return [];
  const list = await api.entities.Conversation.filter().catch(() => []);
  return (list || []).map((r) => toConvView(r, userId));
}

export async function fetchMessages(convId, userId) {
  try {
    const list = await api.entities.Message.filter({ conversation_id: convId });
    return (Array.isArray(list) ? list : []).map((m) => ({
      id: m.id,
      from: String(m.sender_id) === String(userId) ? "me" : "them",
      text: m.body || "",
      files: Array.isArray(m.attachments) ? m.attachments : [],
      time: m.created_date ? timeShort(m.created_date) : "",
    }));
  } catch {
    return [];
  }
}

export async function ensureConversation({ me, other, projectId }) {
  const existing = await fetchConversationsForUser(me);
  const found = existing.find((c) => String(c.otherId) === String(other));
  if (found) return found.id;
  const rec = await api.entities.Conversation.create({
    targetUserId: other,
    projectId: projectId || null,
  });
  return rec.id;
}

export async function sendMessage({ conversation_id, text, files }) {
  await api.entities.Message.create({
    conversation_id,
    content: text || "",
    attachments: files || [],
  });
}
