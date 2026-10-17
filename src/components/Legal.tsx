import { Shell } from "@/components/Shell";
export function Legal({ title, points }: { title: string; points: string[] }) {
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{points.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="mt-6 text-xs text-muted-foreground">Draft demonstrator text — to be reviewed by a qualified legal adviser before launch.</p>
    </Shell>
  );
}
