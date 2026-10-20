# Gemini AI journey coach setup

The dashboard's AI ambition coach calls Gemini from the TanStack Start server. The API key must stay on the server and must never be added to browser code, a `VITE_*` variable, or a committed file.

## Server configuration

Set these environment variables in the server/deployment environment that runs the TanStack Start application:

- `GEMINI_API_KEY` — a Gemini API key created or managed through Google AI Studio. Use the current supported key type and restrict it to the Gemini API where applicable.
- `GEMINI_MODEL` — optional model override. If omitted, the integration currently uses `gemini-3.8-flash`.

Do not commit `.env` files or paste a secret into the dashboard. Local development can use a private, ignored `.env` file only if the local runtime loads it. AI Studio's app preview does not automatically mean that a production server secret has been configured; if the preview reports that the AI service is not configured, add the key to the server environment supported by the actual runtime.

## What the first integration does

- Sends the ambition title, optional user context, and up to five recent self-reported activity results to Gemini.
- Requests a structured journey with three to five activities and a milestone for each.
- Validates the response before returning it to the interface.
- Lets the user review the proposed plan before applying it.
- Stores an applied plan in the browser's existing local state and uses it in the guided journey and goal review.
- Keeps the key and Gemini request on the server.

## Important prototype limitations

- Journey plans and activity records are currently stored in browser local storage, not a shared database.
- This prototype's profile is not production authentication. Before exposing an API-key-backed endpoint publicly, add server-enforced authentication or an abuse-resistant rate limit and usage monitoring for the deployment.
- AI output can be wrong. Verify important costs, legal or safety requirements, deadlines, and provider details independently.
- Applying a new AI journey changes the activity plan shown for that ambition. Existing records are preserved, but records for activities that are no longer in the current plan will not automatically count toward the new plan.

## Test checklist

1. Configure the server-side key and model.
2. Open the dashboard and select an ambition.
3. Generate a journey and inspect whether its activities genuinely fit the ambition.
4. Apply it and verify that the dashboard's guided journey and the Goals review show the same activities.
5. Record a result, refresh, and verify that the journey and record persist.
6. Test missing/invalid key handling and confirm that no API key appears in browser requests, logs, or source code.
