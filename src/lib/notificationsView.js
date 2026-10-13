import { base44 } from "@/api/base44Client";

// Derived, real notifications from the DB (proposals on my projects, wallet earnings, conversations)
function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `Il y a ${Math.floor(diff)} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
  return `Il y a ${Math.floor(diff / 1440)} j`;
}

export async function fetchNotifications(userId) {
  if (!userId) return [];
  const out = [];

  // 1) Pending proposals on MY projects
  try {
    const myProjects = await base44.entities.Project.filter({ created_by_id: userId }, "-created_date", 50).catch(() => []);
    for (const p of myProjects || []) {
      const props = await base44.entities.Proposal.filter({ project_id: p.id, status: "pending" }, "-created_date", 20).catch(() => []);
      for (const pr of props || []) {
        out.push({
          id: `prop-${pr.id}`,
          type: "proposal",
          title: "Nouvelle candidature",
          text: `${pr.freelancer_name || "Un freelance"} a postulé à « ${pr.project_title || p.title} ».`,
          time: when(pr.created_date),
          unread: true,
          link: `/projects/${p.id}`,
        });
      }
    }
  } catch { /* ignore */ }

  // 2) Recent wallet earnings
  try {
    const txns = await base44.entities.WalletTransaction.filter({ user_id: userId, type: "earning" }, "-created_date", 5).catch(() => []);
    for (const t of txns || []) {
      out.push({
        id: `pay-${t.id}`,
        type: "payment",
        title: "Paiement reçu",
        text: `${t.description || "Revenu"} crédité sur votre wallet.`,
        time: when(t.created_date),
        unread: false,
        link: "/wallet",
      });
    }
  } catch { /* ignore */ }

  // 3) Recent conversations with last message
  try {
    const [a, b] = await Promise.all([
      base44.entities.Conversation.filter({ participant_a_id: userId }, "-updated_date", 10).catch(() => []),
      base44.entities.Conversation.filter({ participant_b_id: userId }, "-updated_date", 10).catch(() => []),
    ]);
    const seen = new Set();
    for (const c of [...(a || []), ...(b || [])]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      if (!c.last_message) continue;
      const other = c.participant_a_id === userId ? c.participant_b_name : c.participant_a_name;
      out.push({
        id: `msg-${c.id}`,
        type: "message",
        title: "Nouveau message",
        text: `${other || "Interlocuteur"} : ${c.last_message}`,
        time: when(c.updated_date || c.last_time),
        unread: false,
        link: "/messages",
      });
    }
  } catch { /* ignore */ }

  return out.sort((x, y) => 0); // preserve creation order (proposals first)
}