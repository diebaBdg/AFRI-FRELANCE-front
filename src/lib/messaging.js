import { base44 } from "@/api/base44Client";

export const timeShort = (iso) => (iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");

const toConvView = (rec, userId) => {
  const isA = rec.participant_a_id === userId;
  return {
    id: rec.id,
    _real: true,
    otherId: isA ? rec.participant_b_id : rec.participant_a_id,
    clientName: (isA ? rec.participant_b_name : rec.participant_a_name) || "Interlocuteur",
    clientAvatar: null,
    lastMessage: rec.last_message || "",
    time: rec.last_time ? timeShort(rec.last_time) : "",
    unread: 0,
    thread: [],
    projectTitle: rec.project_title || "",
  };
};

export async function fetchConversationsForUser(userId) {
  if (!userId) return [];
  const [a, b] = await Promise.all([
    base44.entities.Conversation.filter({ participant_a_id: userId }, "-updated_date", 50).catch(() => []),
    base44.entities.Conversation.filter({ participant_b_id: userId }, "-updated_date", 50).catch(() => []),
  ]);
  const seen = new Set();
  const out = [];
  for (const r of [...(a || []), ...(b || [])]) {
    if (!seen.has(r.id)) { seen.add(r.id); out.push(toConvView(r, userId)); }
  }
  return out;
}

export async function fetchMessages(convId, userId) {
  try {
    const list = await base44.entities.Message.filter({ conversation_id: convId }, "created_date", 200);
    return (Array.isArray(list) ? list : []).map((m) => ({
      id: m.id,
      from: m.sender_id === userId ? "me" : "them",
      text: m.body || "",
      files: Array.isArray(m.attachments) ? m.attachments : [],
      time: m.created_date ? timeShort(m.created_date) : "",
    }));
  } catch {
    return [];
  }
}

export async function ensureConversation({ me, meName, other, otherName, projectTitle }) {
  const existing = await fetchConversationsForUser(me);
  const found = existing.find((c) => c.otherId === other);
  if (found) return found.id;
  const rec = await base44.entities.Conversation.create({
    participant_a_id: me,
    participant_a_name: meName || "",
    participant_b_id: other,
    participant_b_name: otherName || "",
    project_title: projectTitle || "",
    last_message: "",
    last_time: new Date().toISOString(),
  });
  return rec.id;
}

export async function sendMessage({ conversation_id, sender_id, sender_name, text, files }) {
  await base44.entities.Message.create({
    conversation_id,
    sender_id,
    sender_name: sender_name || "",
    body: text || "",
    attachments: files || [],
  });
  await base44.entities.Conversation.update(conversation_id, {
    last_message: text || "",
    last_time: new Date().toISOString(),
  });
}