# Ambition Quest Go — Product Roadmap

## Product promise

Help people move from an ambition to real preparation and meaningful action. This is not merely a savings tracker, a generic resort guide, or a points game. A person may be preparing for a private-jet journey, buying a home, further education, a practical skill, a business, an agricultural project, or another important ambition.

The experience should help someone who previously assumed an opportunity was beyond reach understand the steps, learn what is involved, plan responsibly, record progress, build readiness, and eventually connect with real-world providers. Encourage small, realistic actions—including a first self-reported ₦1,000 saving—without implying that saving alone guarantees an outcome.

## Product principles

1. **Ambition before mechanics.** Start with what the person wants to make possible, their current position, and their next practical step.
2. **Real progress over decorative gamification.** XP, levels, streaks and badges should reinforce useful learning, planning, practice and responsible follow-through—not reward empty clicks.
3. **Money stays honest.** Self-reported savings are personal tracking, not held funds or independently verified balances. Practice currency is simulated and has no cash value.
4. **Readiness is visible and contextual.** Show what the person has prepared and what remains. A quiz score is a practice indicator, not a guarantee of safety, provider acceptance or success.
5. **Experiences have a real route.** Explain how to prepare, arrive, check in, follow venue instructions, and understand requirements. Venue-specific details, prices and policies remain unverified until the provider confirms them.
6. **Providers earn trust.** Applications, approval, verification, availability, price confirmation, request handling and completed participation are distinct states.
7. **Prototype is not production.** Browser storage and demonstration role selection are not secure authentication, server-side authorization, verified bookings or a reliable multi-device record.
8. **Mobile-first and accessible.** Keep the sliding navigation, active route state, readable content, clear feedback, and working paths across phone and desktop.
9. **Inspect, agree, implement, verify.** Preserve working behavior; make focused changes, run the relevant checks, then sync and preview. Never claim a build, test, provider or deployment is verified without evidence.

## Roadmap

### Phase 1 — Foundation and return paths

- Ambition-first welcome screen and dashboard.
- Mobile slide-out navigation and desktop navigation.
- Goal selection and self-reported savings records.
- Existing XP, challenges, mission chain, experience discovery and pilot tour retained.
- After logging savings, explain the next step and offer working routes to the dashboard, missions and experiences.
- Make the return-to-welcome path visible.
- Keep admin out of the public profile/demo-role choice.

**Acceptance:** CI build, formatting, lint and tests pass; dashboard and goal routes remain reachable; a saved entry updates the displayed totals and presents useful next steps; existing imagery and working navigation are preserved.

### Phase 2 — A meaningful ambition journey

- Give custom ambitions a user-defined target instead of silently assigning a fixed ₦1,000,000 target.
- Show a visible preparation/readiness indicator and a route to the readiness coach.
- Connect goal-specific milestones to concrete next actions and relevant routes.
- Continue replacing generic stage progression with goal-specific completion criteria; the current reflection checkpoint is explicitly self-reported.
- Explain what an action earns and why it matters; avoid duplicate rewards on repeated submissions.
- Expand tests around savings records, goal targets, readiness state, mission progression and navigation.

**Acceptance:** users can define an ambition and realistic target; progress and readiness have clear meanings; next actions are actionable; XP cannot be collected repeatedly for the same one-time action.

### Phase 3 — Real-world experiences and provider workflows

- Improve experience detail pages with useful requirements, preparation guidance, location/status clarity and accessible request forms.
- Keep proposed, pending verification, verified, requested, provider-confirmed and completed states distinct.
- Build provider application review with the information needed for verification and safety.
- Develop the pilot experience around actual provider-approved route details, including the correct entrance, security clearance, parking, reception, and facility access.
- Treat all venue-specific photos, routes, prices, hours and policies as placeholders until confirmed by the provider.
- Create a feedback/participation record without claiming that an unverified self-report proves attendance.

**Acceptance:** every listing explains its verification status; request is not presented as a booking; no unverified provider or venue information is represented as fact; pilot instructions match the real provider's approved procedures.

### Phase 4 — Trust and production readiness

- Replace prototype-only profile switching with proper authentication and server-side role authorization.
- Store user goals, savings logs, mission outcomes, provider applications and requests in a secure database with clear ownership and validation.
- Add provider identity/business checks, moderation audit trail, abuse prevention and safe error handling.
- Review privacy, consent, retention, photo handling, safety language and terms with appropriate professional input.
- Add reliable server-side reward calculation, idempotent event handling and cross-device persistence.
- Establish end-to-end tests, monitoring, backups and deployment checks.

**Acceptance:** no security-sensitive permission relies on a client-side role; personal records are access-controlled; reward and request transitions are validated server-side; production readiness is demonstrated, not inferred from the prototype.

### Phase 5 — Expand responsibly

- Support additional ambitions and partner categories without turning the app into a generic catalogue.
- Add provider-sponsored learning, workshops, tours, practical skill sessions and aspirational experiences.
- Add optional savings plans and progress projections only with transparent assumptions and no guaranteed-outcome language.
- Introduce community stories or mentorship only with consent, moderation and clear attribution.
- Measure whether users make useful progress, not just clicks, time-on-screen or XP accumulation.

## Current audit findings

The current repository is a useful interactive prototype, but many flows are still shallow:

- State is persisted in browser localStorage (key: jetoff-v1); there is no server-backed user record.
- Profile creation is local demonstration behavior, not secure sign-in. Admin moderation is also a local prototype queue.
- The custom-goal control currently labels a goal “pending review” and assigns a fixed ₦1,000,000 target instead of asking the user for a target.
- The dashboard now requires a short self-reported reflection before advancing a journey stage and awards XP once per stage; the reflection is not independently verified, and goal-specific completion criteria remain future work.
- The readiness quiz produces a useful practice score, but that score is not prominent on the dashboard and should never be framed as proof of real-world readiness.
- Experience requests are stored locally and display an awaiting-provider status, but no provider notification or response workflow exists.
- Provider applications do not yet collect sufficient evidence for actual business verification or safety review.
- Experience listings and tour details are illustrative placeholders until confirmed by providers.
- Existing automated tests are very small; expand coverage as each behavior is deepened.

## Delivery workflow

- Keep main working and avoid force-pushing or rewriting published history.
- Make focused changes on branches and use pull requests.
- Inspect the actual source before editing; preserve existing behavior unless a deliberate product decision says otherwise.
- Run formatting, build, lint and tests; inspect failures rather than bypassing checks.
- After merge, sync the merged source to the designated Google AI Studio project, verify the preview and key flows, then report exactly what was and was not tested.
- Keep Ambition Quest Go separate from Goal Trekker Hub and the other JET OFF repositories unless an explicit integration decision is made.
