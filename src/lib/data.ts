export type Category = "Experience & Enjoyment" | "Learn & Discover" | "Create & Build" | "Grow & Achieve";
export const CATEGORIES: Category[] = ["Experience & Enjoyment", "Learn & Discover", "Create & Build", "Grow & Achieve"];

export type Experience = {
  id: string;
  title: string;
  provider: string;
  category: Category;
  location: string;
  price: string; // always "Pending verification" until provider confirms
  verified: boolean;
  summary: string;
  dressCode?: string;
  requirements: string[];
};

export const EXPERIENCES: Experience[] = [
  { id: "yuby-day-visit", title: "Resort Day Visit", provider: "Yuby Resort (proposed pilot)", category: "Experience & Enjoyment", location: "Location to be confirmed", price: "Pending verification", verified: false, summary: "Prepare for a real day at the resort — gate, reception, facilities, and etiquette.", dressCode: "Smart casual. Swimwear only in pool area (placeholder — awaiting venue policy).", requirements: ["Valid ID at reception", "Complete reception check-in before entering facilities"] },
  { id: "yuby-horse-riding", title: "Supervised Horse Riding", provider: "Yuby Resort (proposed pilot)", category: "Experience & Enjoyment", location: "Location to be confirmed", price: "Pending verification", verified: false, summary: "Beginner-friendly ride with a trained handler, subject to availability.", dressCode: "Closed shoes, long trousers.", requirements: ["Safety briefing", "Age/weight limits to be confirmed"] },
  { id: "kefiano-limo", title: "Limousine City Ride", provider: "Kefiano Autos (proposed partner)", category: "Experience & Enjoyment", location: "City route to be confirmed", price: "Pending verification", verified: false, summary: "A chauffeured ride through town, subject to actual availability.", requirements: ["Advance request", "Group size limits"] },
  { id: "soap-workshop", title: "Soap-Making Workshop", provider: "Partner workshop (pending)", category: "Create & Build", location: "To be confirmed", price: "Pending verification", verified: false, summary: "Supervised practical session — leave with your own bars and the method.", requirements: ["Protective gloves provided", "Age 14+"] },
  { id: "baking-class", title: "Bread & Pastry Basics", provider: "Partner bakery (pending)", category: "Learn & Discover", location: "To be confirmed", price: "Pending verification", verified: false, summary: "Hands-on intro to baking fundamentals.", requirements: ["Apron recommended"] },
  { id: "photo-walk", title: "Photography Walk", provider: "Partner studio (pending)", category: "Learn & Discover", location: "To be confirmed", price: "Pending verification", verified: false, summary: "Learn composition and light on a guided walk.", requirements: ["Any phone camera works"] },
  { id: "agri-visit", title: "Farm Project Visit", provider: "Partner farm (pending)", category: "Grow & Achieve", location: "To be confirmed", price: "Pending verification", verified: false, summary: "See how a small agricultural project is run — costs, timelines, realities.", requirements: ["Comfortable outdoor wear"] },
  { id: "biz-mentor", title: "Small Business Shadow Day", provider: "Partner SME (pending)", category: "Grow & Achieve", location: "To be confirmed", price: "Pending verification", verified: false, summary: "Spend a day observing a working business.", requirements: ["Professional conduct"] },
];

export type GoalTemplate = { id: string; title: string; target: number; milestones: string[]; actions: string[] };
export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: "jet", title: "Experience a private-jet journey", target: 5_000_000, milestones: ["First ₦1,000 saved", "Complete a resort visit", "Learn charter basics", "Reach 25%", "Reach 50%", "Book"], actions: ["Complete Mission 2", "Visit a verified provider", "Save consistently weekly"] },
  { id: "house", title: "Buy a house", target: 30_000_000, milestones: ["Open savings habit", "Learn property basics", "Reach 10%"], actions: ["Learn about land documents", "Track monthly"] },
  { id: "school", title: "Attend pastoral school / further education", target: 1_500_000, milestones: ["Research institutions", "Reach 30%", "Apply"], actions: ["Shortlist 3 schools"] },
  { id: "agri", title: "Start an agricultural project", target: 2_000_000, milestones: ["Farm visit", "Business plan", "Reach 40%"], actions: ["Book the Farm Project Visit"] },
  { id: "biz", title: "Start a business", target: 1_000_000, milestones: ["Shadow day", "Learn a skill", "First sale"], actions: ["Book a workshop"] },
  { id: "skill", title: "Acquire a practical skill", target: 150_000, milestones: ["Pick a skill", "Attend a class", "Practise 10 times"], actions: ["Browse Learn & Discover"] },
];

export const PATH_STAGES = ["Dream", "Discover", "Learn", "Plan", "Save", "Prepare", "Practise", "Visit", "Reflect", "Jet Off"];

export const TOUR_STOPS = [
  { id: "gate", name: "Entrance Gate", x: 12, y: 80, info: "Approach slowly. Security may ask for your name, purpose of visit, and booking reference.", protocol: "Wait to be waved through. Do not photograph security posts." },
  { id: "drive", name: "Driveway & Approach", x: 30, y: 62, info: "Follow directional signage. Speed limits apply on resort grounds.", protocol: "Pedestrians have priority." },
  { id: "park", name: "Car Park", x: 22, y: 40, info: "Park in marked bays. Keep valuables out of sight.", protocol: "Note your bay for exit." },
  { id: "reception", name: "Reception", x: 50, y: 48, info: "Every visitor checks in here first. Present ID, confirm services, and receive any wristband or pass.", protocol: "You may not enter facilities before reception check-in." },
  { id: "pool", name: "Swimming Pool", x: 72, y: 30, info: "Shower before swimming. Lifeguard hours to be confirmed.", protocol: "Swimwear in pool area only." },
  { id: "stables", name: "Horse Riding", x: 82, y: 66, info: "Handler-led rides. Safety briefing required.", protocol: "Closed shoes required." },
  { id: "karaoke", name: "Karaoke Lounge", x: 60, y: 78, info: "Evening sessions, subject to availability.", protocol: "Respect queue order." },
  { id: "bbq", name: "Barbecue Area", x: 40, y: 20, info: "Group bookings typically required.", protocol: "Follow fire-safety guidance." },
];

export const BUDGET_SCENARIOS = [
  { q: "Friends invite you to a ₦25,000 weekend outing.", a: { label: "Go", cost: 25000, xp: { Presence: 10 }, feedback: "Fun memories — and your goal moves a bit further away. That's a real trade-off." }, b: { label: "Save it", cost: 0, xp: { Discipline: 15 }, feedback: "You protected your goal. Postponing isn't missing out — it's choosing." } },
  { q: "A ₦15,000 workshop teaches a skill you could earn from.", a: { label: "Enrol", cost: 15000, xp: { Mindset: 15, Network: 5 }, feedback: "Investing in skills can pay back over time — though nothing is guaranteed." }, b: { label: "Skip", cost: 0, xp: { Discipline: 5 }, feedback: "Saved money now; consider if the skill could open doors later." } },
  { q: "New phone on sale for ₦60,000. Yours still works.", a: { label: "Buy", cost: 60000, xp: { Presence: 5 }, feedback: "Wants vs needs: most of your budget gone on something you already had." }, b: { label: "Keep current", cost: 0, xp: { Discipline: 20 }, feedback: "Strong discipline. Your resources stay ready for what matters." } },
  { q: "Pay ₦10,000 for a resort reception tour & day pass.", a: { label: "Book it", cost: 10000, xp: { Presence: 15, Network: 10 }, feedback: "Exposure builds confidence for the real visit." }, b: { label: "Wait", cost: 0, xp: { Discipline: 5 }, feedback: "Fine — the virtual tour is free to prepare first." } },
];

export const READINESS = [
  { q: "You arrive at the gate. Security asks your purpose. You…", opts: ["Drive past", "State your name and booking", "Argue"], correct: 1, tip: "Calmly state your name and booking reference." },
  { q: "You want to swim right away. First you…", opts: ["Go to reception", "Jump in", "Ask a guest"], correct: 0, tip: "Reception check-in comes before any facility." },
  { q: "The price you saw online differs at the venue. You…", opts: ["Pay anyway", "Ask for the verified price list", "Leave angry"], correct: 1, tip: "Ask politely for the verified, current price list." },
  { q: "Appropriate dress for horse riding?", opts: ["Sandals", "Closed shoes & trousers", "Swimwear"], correct: 1, tip: "Closed shoes and long trousers are safest." },
];

export const DAILY_CHALLENGES = [
  "Save any amount today — even ₦100 counts",
  "Learn one fact about your goal",
  "Complete one readiness scenario",
  "Explore one tour stop",
  "Write one sentence about why your goal matters",
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
