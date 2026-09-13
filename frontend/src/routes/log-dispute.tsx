import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Button } from "@/components/ui/button";
import { createDispute, converseVoice, evidenceLabels, messageFromError, reasonLabels, transcribeVoice, type CreateDisputeInput } from "@/lib/dispute-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/log-dispute")({
  head: () => ({ meta: [
    { title: "Log a Dispute · Dispute-Desk" },
    { name: "description", content: "Log a payment dispute by typing it or describing it out loud." },
    { property: "og:title", content: "Log a Dispute · Dispute-Desk" },
    { property: "og:description", content: "Log a payment dispute by typing it or describing it out loud." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LogDisputePage,
});

type Mode = "type" | "say";
type Stage = "input" | "confirm" | "sent";
type ChatTurn = { role: "user" | "assistant"; content: string };

const evidenceOptions = Object.keys(evidenceLabels);
const networkOptions = ["UPI", "Visa", "Mastercard", "RuPay", "NetBanking"];
const reasonOptions = Object.entries(reasonLabels);

const initialForm: CreateDisputeInput = { transaction_id: "demo-transaction", network: "UPI", reason_code: "1064", amount: 0, deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), evidence: [] };

async function speakQuestion(text: string) {
  try {
    const response = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ text }),
    });
    if (!response.ok) return;
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch {
    // Fail silently -- the question is still shown as text either way
  }
}

function LogDisputePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("type");
  const [stage, setStage] = useState<Stage>("input");
  const [form, setForm] = useState<CreateDisputeInput>(initialForm);
  const [confidenceNote, setConfidenceNote] = useState("");
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => () => recorderRef.current?.stop(), []);

  const update = (patch: Partial<CreateDisputeInput>) => setForm((current) => ({ ...current, ...patch }));
  const toggleEvidence = (item: string) => update({ evidence: form.evidence.includes(item) ? form.evidence.filter((entry) => entry !== item) : [...form.evidence, item] });

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("Your browser does not allow voice recording. Please use Type it instead."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); void finishRecording(new Blob(chunksRef.current, { type: "audio/webm" })); };
      recorderRef.current = recorder; recorder.start(); setRecording(true);
    } catch { setError("We could not access your microphone. You can use Type it instead."); }
  };

  const stopRecording = () => { recorderRef.current?.stop(); recorderRef.current = null; setRecording(false); };

  const finishRecording = async (audio: Blob) => {
    setBusy(true); setError("");
    try {
      const text = await transcribeVoice(audio);
      const nextChat = [...chat, { role: "user" as const, content: text }];
      setChat(nextChat);
      const response = await converseVoice(nextChat);
      if (response.status === "needs_more_info") {
        const withQuestion = [...nextChat, { role: "assistant" as const, content: response.question }];
        setChat(withQuestion);
        void speakQuestion(response.question);
      } else {
        update({ network: response.network, reason_code: response.reason_code, amount: response.amount, evidence: response.available_evidence });
        setConfidenceNote(response.confidence_note ?? ""); setStage("confirm");
      }
    } catch (voiceError) { setError(messageFromError(voiceError)); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    if (!form.amount || !form.transaction_id || !form.deadline) { setError("Add a transaction reference, amount, and response date before continuing."); return; }
    setBusy(true); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      await createDispute(form, data.session?.user.id);
      setStage("sent");
    } catch (submitError) { setError(messageFromError(submitError)); } finally { setBusy(false); }
  };

  return <AppShell title="Log a Dispute" intro={<p>Capture a payment reversal</p>}>
    <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary"><ArrowLeft className="size-4" /> Back to my disputes</Link>
    <div className="surface-card p-5 md:p-7">
      {stage === "sent" ? <div className="py-10 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success"><Check /></div><h2 className="mt-5 text-[22px] font-bold">Dispute logged</h2><p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">Dispute details submitted.</p><Button onClick={() => void navigate({ to: "/dashboard" })} className="mt-7">Back to My Disputes</Button></div> : <>
        <div className="flex rounded-md border border-border p-1" role="tablist"><button onClick={() => setMode("say")} className={`flex-1 rounded px-3 py-2 text-[14px] font-medium ${mode === "say" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Say it</button><button onClick={() => setMode("type")} className={`flex-1 rounded px-3 py-2 text-[14px] font-medium ${mode === "type" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Type it</button></div>
        {mode === "say" && stage === "input" ? <div className="mt-6"><div className="rounded-md bg-secondary p-4 text-[14px] leading-relaxed text-muted-foreground">Describe the dispute.</div><div className="mt-6 flex flex-col items-center text-center"><button type="button" onClick={recording ? stopRecording : startRecording} disabled={busy} className={`flex size-24 items-center justify-center rounded-full text-primary-foreground shadow-sm transition-transform ${recording ? "bg-danger" : "bg-primary"}`} aria-label={recording ? "Stop recording" : "Tap and describe your dispute"}>{recording ? <Square className="size-7" /> : <Mic className="size-8" />}</button><p className="mt-4 text-[15px] font-semibold">{busy ? "Listening…" : recording ? "Tap again when you are done" : "Tap and describe your dispute"}</p><p className="mt-1 text-[13px] text-muted-foreground">Transcript appears below.</p></div>{chat.length > 0 && <div className="mt-8 flex flex-col gap-3">{chat.map((turn, index) => <div key={`${turn.role}-${index}`} className={`max-w-[85%] rounded-md px-4 py-3 text-[14px] leading-relaxed ${turn.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary text-foreground"}`}>{turn.content}</div>)}</div>}</div> : null}
        {stage === "input" && mode === "type" ? <DisputeForm form={form} update={update} toggleEvidence={toggleEvidence} confidenceNote={confidenceNote} /> : null}
        {stage === "confirm" ? <Confirmation form={form} confidenceNote={confidenceNote} update={update} /> : null}
        {error && <p role="alert" className="mt-5 rounded-md bg-danger-soft p-3 text-[13px] text-danger">{error}</p>}
        {stage === "input" && mode === "type" ? <Button onClick={() => { setError(""); setStage("confirm"); }} className="mt-7 w-full sm:w-auto">Review what we captured</Button> : null}
        {stage === "confirm" ? <div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setStage("input")}>Edit details</Button><Button onClick={confirm} disabled={busy}>{busy ? <><Loader2 className="animate-spin" /> Sending…</> : "Confirm & Check This Dispute"}</Button></div> : null}
      </>}
    </div>
  </AppShell>;
}

function DisputeForm({ form, update, toggleEvidence, confidenceNote }: { form: CreateDisputeInput; update: (patch: Partial<CreateDisputeInput>) => void; toggleEvidence: (item: string) => void; confidenceNote: string }) {
  return <div className="mt-7 grid gap-5 md:grid-cols-2"><label className="text-[14px] font-medium">Transaction reference<input value={form.transaction_id} onChange={(event) => update({ transaction_id: event.target.value })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px] outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. order-1042" />{confidenceNote && <small className="mt-1 block text-[13px] text-muted-foreground">{confidenceNote}</small>}</label><label className="text-[14px] font-medium">Payment network<InfoTooltip term="network" className="ml-1" /><select value={form.network} onChange={(event) => update({ network: event.target.value })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]"><option value="">Choose one</option>{networkOptions.map((network) => <option key={network}>{network}</option>)}</select></label><label className="text-[14px] font-medium">What did the customer say?<select value={form.reason_code} onChange={(event) => update({ reason_code: event.target.value })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]">{reasonOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label><label className="text-[14px] font-medium">Amount in rupees<input type="number" min="1" value={form.amount || ""} onChange={(event) => update({ amount: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]" placeholder="5000" /></label><label className="text-[14px] font-medium">Respond by<InfoTooltip term="deadline" className="ml-1" /><input type="date" value={form.deadline} onChange={(event) => update({ deadline: event.target.value })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]" /></label><div className="md:col-span-2"><p className="text-[14px] font-medium">Proof you have <InfoTooltip term="evidence" className="ml-1" /></p><div className="mt-3 grid gap-2 sm:grid-cols-2">{evidenceOptions.map((item) => <label key={item} className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-[14px] hover:bg-secondary"><input type="checkbox" checked={form.evidence.includes(item)} onChange={() => toggleEvidence(item)} className="mt-0.5 accent-primary" /><span>{evidenceLabels[item]}</span></label>)}</div></div></div>;
}

function Confirmation({ form, confidenceNote, update }: { form: CreateDisputeInput; confidenceNote: string; update: (patch: Partial<CreateDisputeInput>) => void }) {
  return <div className="mt-7"><p className="text-[15px] font-semibold">Captured details</p><p className="mt-1 text-[14px] text-muted-foreground">Review before checking.</p><dl className="mt-6 grid gap-4 border-y border-border py-5 text-[14px] sm:grid-cols-2"><div><dt className="text-[13px] text-muted-foreground">Customer said</dt><dd className="mt-1 font-medium">{reasonLabels[form.reason_code]}</dd></div><div><dt className="text-[13px] text-muted-foreground">Amount</dt><dd className="data-mono mt-1">₹{form.amount.toLocaleString("en-IN")}</dd></div><div><dt className="text-[13px] text-muted-foreground">Paid with</dt><dd className="mt-1">{form.network}</dd></div><div><dt className="text-[13px] text-muted-foreground">Respond by</dt><dd className="data-mono mt-1">{form.deadline}</dd></div></dl>{confidenceNote && <p className="mt-4 rounded-md bg-secondary p-3 text-[13px] text-muted-foreground">{confidenceNote}</p>}<p className="mt-5 text-[14px] text-muted-foreground">Proof selected: {form.evidence.length ? form.evidence.map((item) => evidenceLabels[item] ?? item).join(", ") : "None added yet."}</p><div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-[14px] font-medium">Amount<input type="number" value={form.amount || ""} onChange={(event) => update({ amount: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]" /></label><label className="text-[14px] font-medium">Transaction reference<input value={form.transaction_id} onChange={(event) => update({ transaction_id: event.target.value })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-[14px]" /></label></div></div>;
}