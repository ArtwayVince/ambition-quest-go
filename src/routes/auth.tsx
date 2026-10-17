import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card, Btn, Notice, meta } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => meta("Sign in", "Create your JET OFF profile and choose how you take part."),
  component: Auth,
});

function Auth() {
  const { s, set, reset } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"explorer" | "provider">("explorer");
  if (s.user)
    return (
      <Shell>
        <Card>
          <h1 className="text-2xl font-bold">Hi, {s.user.name}</h1>
          <p className="text-sm text-muted-foreground">{s.user.email} · role: {s.role}</p>
          <div className="mt-4 flex gap-2">
            <Btn onClick={() => nav({ to: "/dashboard" })}>Go to dashboard</Btn>
            <Btn variant="ghost" onClick={() => set((p) => ({ ...p, user: null }))}>Sign out</Btn>
            <Btn variant="ghost" onClick={reset}>Reset all progress</Btn>
          </div>
        </Card>
      </Shell>
    );
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Create your profile</h1>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return;
          set((p) => ({ ...p, user: { name: name.trim(), email }, role }));
          nav({ to: "/dashboard" });
        }}
      >
        <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2" />
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2" />
        <div className="grid grid-cols-2 gap-2">
          {(["explorer", "provider"] as const).map((r) => (
            <button type="button" key={r} onClick={() => setRole(r)} className={`rounded-xl border px-3 py-2 text-sm capitalize ${role === r ? "border-primary bg-primary/10" : "border-border"}`}>{r}</button>
          ))}
        </div>
        <Btn type="submit">Continue</Btn>
      </form>
      <div className="mt-4"><Notice>This is a local prototype profile, not a verified account. Your profile and progress are saved on this device only. Explorer/provider selection is a demonstration feature, not production-grade access control.</Notice></div>
    </Shell>
  );
}
