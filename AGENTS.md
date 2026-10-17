<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- JET OFF app state lives in `src/lib/store.tsx` (browser localStorage) and listings/templates in `src/lib/data.ts`; why: imported prototype, kept as-is until a server-backed data layer replaces it.
- Shared page chrome (header, nav, Card/Btn/Notice, `meta()`) lives in `src/components/Shell.tsx`; why: every route reuses it, so navigation changes happen in one place.
- Welcome and app pages reuse the same navigation drawer; sidebar presentation state is held by the root NavigationProvider without browser storage, so collapse survives route changes without changing app data.
