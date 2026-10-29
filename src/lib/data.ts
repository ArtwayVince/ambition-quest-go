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

export const PATH_STAGES = ["Dream", "Discover", "Learn", "Plan", "Save", "Prepare", "Practise", "Visit", "Reflect", "Achieve"] as const;

export type JourneyStageSet = { stages: readonly string[]; prompts: readonly string[] };

const DEFAULT_JOURNEY_STAGES = ["Dream", "Discover", "Learn", "Plan", "Save", "Prepare", "Practise", "Take action", "Reflect", "Achieve"] as const;
const DEFAULT_JOURNEY_PROMPTS = [
  "What do you hope to achieve, and why does it matter to you?",
  "What did you discover about this ambition?",
  "What useful knowledge did you gain?",
  "What part of your plan became clearer?",
  "What did you learn about the resources or costs involved?",
  "What did you do to prepare?",
  "What did you practise or try?",
  "What concrete step did you take?",
  "What did you learn from your progress so far?",
  "What milestone have you reached, or what remains before the outcome is achieved?",
] as const;

export const JOURNEY_STAGES_BY_GOAL: Record<string, JourneyStageSet> = {
  jet: { stages: ["Dream", "Explore", "Learn", "Plan", "Save", "Prepare", "Practise", "Book", "Get ready", "Jet off"], prompts: [
    "What makes this journey meaningful to you?", "What did you learn about private-jet travel options?",
    "What did you learn about chartering, routes, or requirements?", "What became clearer in your travel plan?",
    "What did you learn about the likely cost and your savings plan?", "What arrangements or documents did you identify?",
    "How did you build confidence for the experience?", "What did you learn about booking and provider verification?",
    "What remains to be checked before departure?", "Have you taken the journey or reached another meaningful milestone? What remains?",
  ] },
  house: { stages: ["Envision", "Explore locations", "Learn ownership", "Plan purchase", "Build deposit", "Check affordability", "Assess properties", "Verify documents", "Review decision", "Secure your home"], prompts: [
    "What does owning a home mean to you?", "What did you learn about suitable locations?",
    "What did you learn about ownership, financing, or property types?", "What part of your purchase plan improved?",
    "What did you learn about building your deposit?", "What did you learn about affordability and ongoing costs?",
    "What did you learn while comparing properties?", "What documents or legal checks need attention?",
    "What evidence or advice is informing your decision?", "Have you secured a home or reached a milestone? What remains?",
  ] },
  school: { stages: ["Choose your goal", "Explore schools", "Check requirements", "Plan your studies", "Budget and fund", "Prepare documents", "Build readiness", "Apply", "Confirm admission", "Begin studies"], prompts: [
    "What do you hope this education will help you achieve?", "What did you learn about possible schools or programmes?",
    "What entry requirements did you discover?", "What became clearer about your study plan and timeline?",
    "What did you learn about fees, funding, or support?", "Which documents did you prepare or identify?",
    "How are you preparing academically or personally?", "What did you learn from preparing or submitting an application?",
    "What is the status of your admission and what needs follow-up?", "Have you begun your studies or reached another milestone? What remains?",
  ] },
  agri: { stages: ["Define the vision", "Explore farming", "Learn the basics", "Plan the project", "Budget and fund", "Prepare resources", "Test methods", "Establish the farm", "Review results", "Grow the project"], prompts: [
    "What do you want your agricultural project to achieve?", "What did you learn about crops, livestock, markets, or location?",
    "What farming knowledge did you gain?", "What part of your farm plan became clearer?",
    "What did you learn about startup costs and funding?", "What land, tools, inputs, or support will you need?",
    "What did you test or learn before committing more resources?", "What concrete step did you take toward establishing the project?",
    "What do your early results teach you?", "What milestone have you reached, and what is needed for sustainable growth?",
  ] },
  biz: { stages: ["Define the idea", "Research the market", "Learn the business", "Build the plan", "Arrange funding", "Prepare to launch", "Test the offer", "Launch the business", "Review performance", "Build for growth"], prompts: [
    "What problem or opportunity do you want your business to address?", "What did you discover about customers and competitors?",
    "What did you learn about running this kind of business?", "What part of your business plan improved?",
    "What did you learn about startup costs and funding options?", "What did you prepare before launch?",
    "What feedback did you get from testing your product or service?", "What did you learn from launching or making your first sale?",
    "What do your early results tell you?", "What milestone have you reached, and what is your next growth priority?",
  ] },
  skill: { stages: ["Choose a skill", "Explore options", "Learn foundations", "Plan learning", "Arrange resources", "Prepare to practise", "Practise regularly", "Build a project", "Assess progress", "Demonstrate skill"], prompts: [
    "Why did you choose this skill and what do you want to do with it?", "What did you discover about learning options?",
    "What foundational knowledge did you gain?", "What did you decide about your learning plan?",
    "What resources or support did you identify?", "How did you prepare a place, time, or routine to practise?",
    "What did practice teach you, including mistakes?", "What did you create or complete using the skill?",
    "What strengths and gaps did you notice when assessing your progress?", "How have you demonstrated competence, and what would you like to improve next?",
  ] },
};

export function journeyStagesForGoal(goalId: string, goalTitle: string): JourneyStageSet {
  const known = JOURNEY_STAGES_BY_GOAL[goalId];
  if (known) return known;
  const title = goalTitle.trim() || "your ambition";
  return {
    stages: DEFAULT_JOURNEY_STAGES,
    prompts: DEFAULT_JOURNEY_PROMPTS.map((prompt) => prompt.replace("this ambition", title).replace("your ambition", title)),
  };
}

export const TOUR_STOPS = [
  { id: "gate", name: "Entrance & Security", x: 12, y: 80, info: "This walkthrough is a preparation aid, not a live navigation system. The Adamawa Gate is not the customer entrance; follow the venue’s current directions to the customer vehicle barrier.", protocol: "Stop for security checks and follow staff instructions. Entrance details must be confirmed with the venue before a real visit.", media: [] },
  { id: "drive", name: "Customer Vehicle Route", x: 30, y: 62, info: "After the customer vehicle barrier, the directions supplied for this pilot say to turn right toward parking, then follow the sign to reception.", protocol: "Do not use the exit-only gate as an entrance. Confirm current signage and access with the venue before travelling.", media: [] },
  { id: "park", name: "Parking Area", x: 22, y: 40, info: "The pilot directions place customer parking to the right after the customer vehicle barrier. Follow staff instructions and any current parking signs.", protocol: "After parking, follow the pedestrian route to reception. The exact layout remains subject to venue confirmation.", media: [] },
  { id: "reception", name: "Reception Check-in", x: 50, y: 48, info: "Follow the pedestrian path to reception and complete the required check-in before proceeding to the resort’s main facilities.", protocol: "Do not enter the main area before reception clearance. ID and any booking requirements must be confirmed with the venue.", media: [] },
  { id: "pool", name: "Swimming Pool", x: 72, y: 30, info: "Preview the swimming area and see what a pool visit may look like. Pool rules, opening hours and safety arrangements must be confirmed with the resort.", protocol: "Follow the resort’s current pool rules and staff instructions. Lifeguard cover and swimming requirements are pending confirmation.", media: [] },
  { id: "stables", name: "Horse Riding", x: 82, y: 66, info: "Explore the horse-riding stop before deciding whether to take part. Availability, supervision and suitability must be confirmed with the resort.", protocol: "Confirm the safety briefing, suitable footwear, age/weight limits and handler supervision before riding.", media: [] },
  { id: "karaoke", name: "Karaoke Lounge", x: 60, y: 78, info: "Preview the karaoke area and learn what to ask about sessions and group arrangements.", protocol: "Sessions, timings, equipment and any charges are pending venue confirmation.", media: [] },
  { id: "bbq", name: "Barbecue Area", x: 40, y: 20, info: "Preview the barbecue area and check what arrangements may be needed for a group visit.", protocol: "Confirm whether booking is required and follow the venue’s current fire-safety and food policies.", media: [] },
  { id: "event-hall", name: "Event Hall", x: 46, y: 10, info: "Explore the event hall for possible celebrations, meetings and gatherings. Capacity, facilities and hire arrangements need confirmation.", protocol: "Ask the venue to confirm availability, capacity, equipment, accessibility and current hire terms.", media: [] },
  { id: "sports-complex", name: "Sports Complex", x: 90, y: 42, info: "Preview the sports complex and discover which sporting or recreational activities may be available.", protocol: "Specific courts, equipment, opening times, safety requirements and fees are pending venue confirmation.", media: [] },
  { id: "green-area", name: "Green Picnic Area", x: 15, y: 20, info: "Explore the green area as a possible place to relax, take photographs or picnic with friends and family.", protocol: "Confirm picnic rules, seating, food arrangements, access and any booking requirements with the venue.", media: [] },
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
  "Record a real saving toward one of your ambitions",
  "Record the result of one guided activity",
  "Write a meaningful journey reflection",
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
