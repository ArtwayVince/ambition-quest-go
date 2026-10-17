# Ambition Quest Go

# JET OFF — Master Project Brief



## 1. Project identity



Build JET OFF as a mobile-first web application combining real-world goals, experiences, bookings, providers, and personal development with a gamified system of XP points, levels, badges, streaks, and challenges.



JET OFF should help people move from ambition to action: setting goals, discovering experiences, participating in activities, tracking progress, and earning recognition for meaningful engagement.



This is an independent project. Do not merge it into Goal Trekker Hub or overwrite any other existing project.



## 2. Source-code-first development



Use the supplied JET OFF prototype source code as the starting point. Inspect its existing components, routes, data structures, styles, and dependencies before making changes.



Preserve working functionality wherever possible. Do not replace the prototype with a generic landing page or rebuild everything without first identifying what already exists.



If the source archive is not accessible, report that limitation and request the files or repository access needed. Do not pretend that the source has been imported.



## 3. Core application areas



Organize the application around these functional areas:



* Home dashboard and personal overview.

* Goals, progress tracking, and savings targets.

* Discovery and exploration of experiences.

* Experience details, requests, and bookings.

* Provider registration and applications.

* XP, levels, badges, streaks, and challenges.

* Virtual wallet and mission chains.

* Readiness, safety, and participation information.

* User profiles and account access.

* Administration and moderation.

* Terms, privacy, and safety policies.



Reuse the existing routes and components where appropriate rather than duplicating them.



## 4. Navigation and dashboard



Provide a clean, responsive interface for both phones and larger screens.



On mobile, support a collapsible navigation panel that opens from the left when its menu control is activated. The panel should function as a vertical dashboard/navigation rail, with clear links to the major application areas.



On larger screens, provide a suitable persistent sidebar or collapsible navigation layout.



The navigation must open and close reliably, identify the active page, and remain usable on small screens. Do not substitute a static sidebar that cannot be toggled.



## 5. Gamification



Treat gamification as a core feature, not decorative artwork.



Include XP accumulation, levels, badges, streaks, challenges, progress indicators, and mission chains. Explain how each action affects progress.



Keep simulated rewards and practice currency clearly labelled. Do not present self-reported savings or unverified activity as independently confirmed facts.



Design the data model so that later versions can introduce verified participation, fraud prevention, and server-side reward calculations.



## 6. Real-world experience platform



Allow users to explore experiences, review relevant details, make requests or bookings, and interact with providers.



Include provider applications and moderation workflows. Distinguish proposed pilot listings from verified providers, confirmed bookings, and completed activities.



Any references to real venues or businesses must be treated as proposed examples until their details and participation are verified.



## 7. Authentication, permissions, and administration



Distinguish a demonstration profile switcher from secure authentication.



Production authentication, user permissions, provider verification, administrative approval, booking confirmation, and reward calculations must be enforced on the server using suitable authentication and database services.



Do not treat browser-only state, local storage, or a client-side role selector as secure authentication or authorization.



Clearly label prototype-only functions that have not yet been connected to production services.



## 8. Design and quality requirements



Use a polished, modern, mobile-first interface with consistent spacing, readable typography, accessible controls, clear feedback, and responsive layouts.



Avoid unnecessary redesigns of existing working screens.



After changes, check navigation, routes, forms, responsive behavior, persistence, and console errors where the available environment permits.



Report what works, what remains simulated, what has been tested, and what still requires external configuration.



## 9. Development strategy



Work incrementally. Inspect first, plan second, implement in small stages, and validate each stage before proceeding.



Do not claim that a feature is implemented, tested, secured, or deployed unless that has actually been established.



The first milestone is to import and inspect the existing prototype, confirm the application structure, an

d identify any missing files or dependencies before changing the design or business logic.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ambition-quest-go.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a04069a2-25e1-4e88-a6d9-6df785f8e8f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
