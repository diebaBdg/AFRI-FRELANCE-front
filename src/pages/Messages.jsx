import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Send, Paperclip, Phone, Video, Loader2, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { fetchConversationsForUser, fetchMessages, ensureConversation, sendMessage } from "@/lib/messaging";

const now = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function Avatar({ conv, size = "h-10 w-10" }) {
  const initial = (conv?.clientName || "?").charAt(0).toUpperCase();
  return <div className={`grid ${size} place-items-center rounded-full bg-brand-light text-sm font-bold text-brand`}>{initial}</div>;
}

export default function Messages() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [real, setReal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  const loadConvs = async () => {
    const list = await fetchConversationsForUser(user?.id);
    setReal(list);
    setLoading(false);
    return list;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadConvs();
      if (!alive) return;
      const to = params.get("to");
      if (to && user) {
        const existing = list.find((c) => c.otherId === to);
        let id = existing?.id;
        if (!id) {
          id = await ensureConversation({ me: user.id, meName: user.full_name || user.email, other: to, otherName: params.get("name") || "Interlocuteur", projectTitle: params.get("project") || "" });
          await loadConvs();
        }
        if (alive) setActiveId(id);
        params.delete("to"); params.delete("name"); params.delete("project");
        setParams(params, { replace: true });
      } else if (list[0] && alive) {
        setActiveId(list[0].id);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const conversations = real;
  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!activeId) return;
      const msgs = await fetchMessages(activeId, user?.id);
      if (alive) setThread(msgs);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const send = async () => {
    if (!draft.trim() && attachments.length === 0) return;
    const text = draft.trim();
    const files = attachments;
    setThread((p) => [...p, { from: "me", text, time: now(), files }]);
    setDraft("");
    setAttachments([]);
    setSending(true);
    try {
      await sendMessage({ conversation_id: activeId, sender_id: user.id, sender_name: user.full_name || user.email, text, files });
      const msgs = await fetchMessages(activeId, user.id);
      setThread(msgs);
    } finally {
      setSending(false);
    }
  };

  const pickFile = () => fileRef.current?.click();
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        uploaded.push({ name: f.name, url: file_url, size: f.size });
      }
      setAttachments((p) => [...p, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };
  const removeAttach = (i) => setAttachments((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold text-brand-ink"><MessageSquare className="h-6 w-6 text-brand" /> Messagerie</h1>
      <div className="grid h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-border sm:grid-cols-[300px_1fr]">
        <div className="hidden flex-col border-r border-border sm:flex">
          <div className="border-b border-border p-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." className="pl-9" /></div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Aucune conversation. Démarrez-en une depuis un contrat.</p>
            ) : conversations.map((m) => (
              <button key={m.id} onClick={() => setActiveId(m.id)} className={`flex w-full items-center gap-3 border-b border-border/60 p-3 text-left transition-colors ${activeId === m.id ? "bg-brand-light" : "hover:bg-muted/50"}`}>
                <Avatar conv={m} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{m.clientName}</p><p className="truncate text-xs text-muted-foreground">{m.lastMessage || "Nouvelle conversation"}</p></div>
                {m.time && <span className="text-[10px] text-muted-foreground">{m.time}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          {active ? (
            <>
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="flex items-center gap-3">
                  <Avatar conv={active} size="h-9 w-9" />
                  <div>
                    <p className="text-sm font-semibold">{active.clientName}</p>
                    {active.projectTitle ? <p className="text-xs text-muted-foreground">{active.projectTitle}</p> : <p className="text-xs text-brand">En ligne</p>}
                  </div>
                </div>
                <div className="flex gap-1"><Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button></div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin bg-muted/30 p-4">
                {thread.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Démarrez la conversation.</p> : thread.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.from === "me" ? "bg-brand text-white" : "bg-white border border-border"}`}>
                      {msg.text && <p>{msg.text}</p>}
                      {msg.files?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {msg.files.map((f, j) => (
                            <a key={j} href={f.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${msg.from === "me" ? "bg-white/15 text-white" : "bg-muted"}`}>
                              <Paperclip className="h-3.5 w-3.5" /> <span className="truncate">{f.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`mt-1 text-[10px] ${msg.from === "me" ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-border px-3 pt-2">
                  {attachments.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-1 text-xs text-brand">
                      <Paperclip className="h-3 w-3" /> {f.name}
                      <button onClick={() => removeAttach(i)} className="ml-1 text-brand/70 hover:text-brand">×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 border-t border-border p-3">
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />
                <Button variant="ghost" size="icon" onClick={pickFile} disabled={uploading} aria-label="Joindre un fichier">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </Button>
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écrivez un message..." />
                <Button className="bg-brand hover:bg-brand-dark" size="icon" onClick={send} disabled={sending} aria-label="Envoyer">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm">{loading ? "Chargement…" : "Sélectionnez une conversation ou démarrez-en une depuis un contrat."}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}