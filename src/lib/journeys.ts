export type JourneyActivity = {
  id: string;
  title: string;
  guidance: string;
  why: string;
  resultPrompt: string;
  milestoneId: string;
};

export type JourneyMilestone = {
  id: string;
  title: string;
  description: string;
  activityId: string;
};

export type GoalJourney = {
  activities: JourneyActivity[];
  milestones: JourneyMilestone[];
};

const makeJourney = (
  entries: Array<[string, string, string, string, string, string]>,
): GoalJourney => ({
  activities: entries.map(([id, title, guidance, why, resultPrompt, milestoneId]) => ({
    id, title, guidance, why, resultPrompt, milestoneId,
  })),
  milestones: entries.map(([id, title, , why, , milestoneId]) => ({
    id: milestoneId,
    title: title.replace(/[.!?]+$/, ""),
    description: why,
    activityId: id,
  })),
});

export const DEFAULT_JOURNEY: GoalJourney = makeJourney([
  ["understand-requirements", "Identify what this ambition requires.", "Write down what you need to learn, obtain, arrange, or verify. Make the ambition concrete rather than leaving it as a wish.", "A clear picture of requirements helps you choose a useful next step.", "What did you identify, and what question remains?", "requirements-identified"],
  ["choose-practical-step", "Choose one practical action.", "Choose a specific action you can realistically take this week, considering your time, responsibilities, and resources.", "A small action turns intention into movement.", "What action did you choose or take, and what happened?", "practical-step-chosen"],
  ["review-resources-risks", "Review resources, timing, and risks.", "Consider costs if relevant, time, skills, support, dependencies, and risks. Decide what you still need to check before committing.", "Responsible preparation includes understanding limits and unknowns.", "What resource, risk, or next decision did you identify?", "preparation-reviewed"],
]);

export const GOAL_JOURNEYS: Record<string, GoalJourney> = {
  jet: makeJourney([
    ["jet-charter-basics", "Understand private-jet charter basics.", "Research how route, aircraft size, flight time, passenger count, repositioning, fees, and operating details affect a charter. Treat online figures as provisional.", "Understanding the main price drivers helps you ask informed questions instead of relying on a headline price.", "What did you learn, and which question still needs a provider's answer?", "charter-basics-understood"],
    ["jet-cost-estimate", "Build an itemised journey estimate.", "Write down your intended route, dates or timing, passengers, ground transport, likely fees, and other needs. Mark unknown amounts clearly and seek a legitimate provider quote when practical.", "A realistic estimate exposes the gap between an aspiration and the resources required.", "What items or figures did you record, and what remains unverified?", "journey-estimate-documented"],
    ["jet-preparation-plan", "Make a responsible preparation plan.", "Review essential expenses first. Record a realistic time horizon, available resources, possible alternatives, and what you need to learn or save next. Do not treat a virtual balance as real money.", "A plan should fit your actual circumstances and must not promise that a costly trip is affordable.", "What is your next practical step, and what constraint must you respect?", "responsible-plan-created"],
  ]),
  house: makeJourney([
    ["house-due-diligence", "Learn the basics of property due diligence.", "List the title, ownership, survey, planning, and encumbrance questions that must be checked with qualified professionals before paying or signing.", "Property decisions can carry serious legal and financial risks; verification comes before commitment.", "Which checks or questions did you identify, and who can verify them?", "property-checks-identified"],
    ["house-total-cost", "Estimate the full cost of buying.", "Consider more than the advertised price: legal checks, documentation, taxes or fees, repairs, transaction costs, and ongoing expenses. Mark estimates separately from verified figures.", "The full cost gives a more useful planning baseline than the asking price alone.", "What cost items did you include, and which figures need confirmation?", "total-cost-estimated"],
    ["house-qualified-advice", "Plan a safe next step with qualified advice.", "Identify a reputable property professional or lawyer to consult. Prepare questions and avoid making payments based only on verbal assurances or unverified documents.", "A clear due-diligence plan reduces avoidable risk before a major commitment.", "Who or what source will you consult, and what will you ask?", "due-diligence-plan-ready"],
  ]),
  school: makeJourney([
    ["school-shortlist", "Shortlist suitable institutions.", "Identify up to three institutions offering your intended programme. Check official sources for accreditation or recognition; do not rely only on promotional claims.", "A verified shortlist makes later comparisons meaningful.", "Which institutions did you shortlist, and what official source did you check?", "institutions-shortlisted"],
    ["school-compare", "Compare requirements, fees, and deadlines.", "Record entry requirements, programme duration, application dates, fees, and realistic funding options from official sources.", "Comparing requirements and total costs helps reveal what preparation is needed.", "What requirements, costs, or deadlines did you record? Note anything still uncertain.", "requirements-and-costs-compared"],
    ["school-application-plan", "Build an application and preparation plan.", "List documents, prerequisite learning, deadlines, funding questions, and tasks. Applying or gaining admission is a later outcome, not implied by this planning step.", "A timeline turns research into manageable preparation.", "What is on your checklist, and what is the next dated action?", "application-plan-created"],
  ]),
  agri: makeJourney([
    ["agri-project-market", "Define the project and its market.", "Describe what you want to produce or provide, where it could operate, who might buy it, and what local evidence supports the idea.", "A clear project and customer need are the starting point for feasibility.", "What project and potential customers did you identify, and what evidence did you find?", "project-and-market-defined"],
    ["agri-feasibility", "Estimate inputs and major risks.", "Consider land, inputs, labour, water, storage, transport, timing, likely buyers, price changes, and other local risks before investing.", "A basic feasibility view can reveal hidden costs and operational constraints.", "Which inputs and risks did you record, and what needs a local estimate?", "feasibility-assessed"],
    ["agri-expert-advice", "Seek practical advice from an experienced source.", "Identify an experienced farmer or agricultural extension officer. Prepare specific questions; a farm visit is optional and should only happen when a suitable opportunity is verified.", "Advice grounded in local conditions can improve the next decision.", "Who or what source did you identify, and what useful advice or questions resulted?", "practical-advice-sought"],
  ]),
  biz: makeJourney([
    ["biz-customer-problem", "Describe the customer problem and offer.", "State who the customer is, what problem they have, and how your offer might help. Separate assumptions from things you have evidence for.", "A business starts with a problem worth solving, not only a product idea.", "What customer problem and offer did you define, and what is still an assumption?", "customer-problem-defined"],
    ["biz-customer-evidence", "Speak with potential customers.", "Talk with a few potential customers about their needs and current alternatives. Ask open questions and record what you hear without pressuring anyone to buy.", "Real feedback is more useful than assuming demand exists.", "How many people did you speak with, and what did you learn from their responses?", "customer-evidence-gathered"],
    ["biz-small-test", "Plan a small, low-risk test.", "Estimate basic costs, decide what evidence would count as useful, and choose a small test before committing substantial money.", "A limited test can help you decide whether to continue, adjust, or stop.", "What test did you plan or run, what did it cost, and what did the result suggest?", "small-test-reviewed"],
  ]),
  skill: makeJourney([
    ["skill-outcome", "Choose a skill and a demonstrable outcome.", "Describe what you want to be able to do in observable terms, rather than choosing only a course title.", "A concrete outcome makes it easier to choose training and assess progress.", "What skill outcome did you choose, and how will you demonstrate it?", "learning-outcome-defined"],
    ["skill-learning-route", "Compare credible ways to learn.", "Compare at least two possible routes where practical. Check provider credibility, cost, hands-on work, time commitment, and what you will be able to demonstrate.", "Choosing a suitable route protects time and resources.", "Which routes did you compare, and why does the preferred option fit?", "learning-route-selected"],
    ["skill-practice-project", "Practise and create a small project.", "Set a realistic practice routine and make something small that demonstrates your developing skill. Adapt the scope to your current level and resources.", "Practice and visible work provide evidence of progress beyond merely enrolling.", "What did you practise or make, and what did it show you need to improve?", "practical-progress-demonstrated"],
  ]),
};

const tailoredCustomJourney = (title: string): GoalJourney => {
  const name = title.trim() || "your ambition";
  const lower = name.toLowerCase();
  let entries: Array<[string, string, string, string, string, string]>;
  if (/cyber|software|coding|program|technology|digital skill/.test(lower)) entries = [
    ["custom-tech-outcome", `Define the outcome for ${name}.`, "Describe the specific skill, tool, service, or product you want to deliver, who would use it, and what a successful demonstration looks like.", "A concrete outcome connects learning to a useful result.", "What will you demonstrate, and who could benefit?", "custom-tech-outcome-defined"],
    ["custom-tech-route", "Choose a credible learning and practice route.", "Compare documentation, courses, mentors, and hands-on practice. Check prerequisites, costs, time, credibility, and practical work.", "The right route builds capability rather than only collecting certificates.", "Which route did you choose and what practical work will it involve?", "custom-tech-route-chosen"],
    ["custom-tech-project", "Build and review a small demonstration.", "Create a small project or exercise related to this ambition. Test it, document what works, and identify gaps before relying on it in a real setting.", "Demonstrable work gives evidence of progress and reveals what to learn next.", "What did you build or test, what happened, and what needs improvement?", "custom-tech-demo-reviewed"],
  ];
  else if (/school|university|college|course|degree|education|learn|training|academy|certif/.test(lower)) entries = [
    ["custom-education-options", `Identify suitable routes for ${name}.`, "Find relevant institutions or learning routes. Check official recognition, prerequisites, delivery format, and whether the programme matches your intended outcome.", "Checking suitability first avoids investing in an unsuitable route.", "Which routes did you compare and what reliable source supports your shortlist?", "custom-education-routes-checked"],
    ["custom-education-requirements", "Compare requirements, time, and full costs.", "Record deadlines, prerequisites, duration, fees, materials, transport or connectivity, and possible funding. Separate estimates from verified figures.", "The full commitment is clearer when time and non-tuition costs are included.", "Which requirements and costs did you record, and what remains uncertain?", "custom-education-requirements-compared"],
    ["custom-education-plan", "Prepare an application and learning plan.", "List documents, prerequisite skills, deadlines, funding questions, and the next dated task. Contact the institution to verify anything unclear.", "A plan turns the ambition into manageable actions without assuming admission or success.", "What is your next dated action and what must be ready first?", "custom-education-plan-prepared"],
  ];
  else if (/farm|agric|crop|livestock|poultry|fish farm|fishery/.test(lower)) entries = [
    ["custom-agri-scope", `Define the project behind ${name}.`, "Specify the product or activity, scale, location, season, likely customers, and what local evidence supports demand.", "A defined scope makes resource estimates more realistic.", "What exactly will you produce or provide, and what evidence of demand did you find?", "custom-agri-scope-defined"],
    ["custom-agri-resources", "Estimate inputs, operations, and risks.", "List land or space, water, inputs, labour, equipment, storage, transport, timing, likely prices, and relevant local risks. Seek local estimates for important unknowns.", "Agricultural feasibility depends on local conditions as well as the idea.", "Which inputs and risks did you identify, and which need local advice?", "custom-agri-resources-estimated"],
    ["custom-agri-validation", "Validate the plan with local expertise.", "Speak with an experienced producer, extension officer, or credible local buyer. Ask about common failures, seasonal constraints, and how to test the plan before investing heavily.", "Local evidence can reveal risks that generic estimates miss.", "Who did you consult or plan to consult, and what did you learn?", "custom-agri-plan-validated"],
  ];
  else if (/business|company|startup|enterprise|shop|sell|brand|market/.test(lower)) entries = [
    ["custom-business-customer", `Identify the customer and need for ${name}.`, "Describe the people you hope to serve, their problem, and how your offer could help. Speak with potential customers where possible and separate evidence from assumptions.", "A business needs a real customer problem, not just an appealing idea.", "Who is the intended customer, what need did you confirm, and what remains an assumption?", "custom-business-need-validated"],
    ["custom-business-model", "Map the costs and sustainability assumptions.", "List startup and recurring costs, pricing assumptions, suppliers, time, legal or regulatory requirements, and major risks. Identify figures needing verification.", "A basic model helps reveal whether the idea can be tested responsibly.", "What are the main costs and assumptions, and how will you verify them?", "custom-business-model-mapped"],
    ["custom-business-test", "Design a small test and define useful evidence.", "Plan a low-risk pilot, sample, interview, or trial. Set a modest budget and a clear way to judge feedback before a larger commitment.", "A small test helps decide whether to continue, adapt, or stop.", "What test will you run, what will it cost, and what result would change your decision?", "custom-business-test-designed"],
  ];
  else if (/house|home|land|property|real estate|building/.test(lower)) entries = [
    ["custom-property-needs", `Clarify the property outcome for ${name}.`, "Define intended location, use, essential features, and constraints. Research comparable options and record the source and date of estimates.", "Clear requirements make comparisons more useful.", "What are your essential requirements, and what evidence supports your shortlist?", "custom-property-needs-defined"],
    ["custom-property-costs", "Estimate full costs and ongoing obligations.", "Consider purchase or construction costs, legal and documentation fees, utilities, repairs, maintenance, and ongoing expenses. Separate estimates from confirmed figures.", "The advertised price rarely represents the full commitment.", "Which costs did you include, and what needs professional confirmation?", "custom-property-costs-estimated"],
    ["custom-property-checks", "Plan independent checks before committing.", "List documents, permissions, ownership or title checks, inspections, and qualified professionals relevant to the decision. Do not pay or sign based only on unverified claims.", "Independent verification helps protect against serious risks.", "Which checks must happen first, and who is qualified to verify them?", "custom-property-checks-planned"],
  ];
  else if (/book|write|novel|film|music|art|creative|content|publish/.test(lower)) entries = [
    ["custom-creative-outcome", `Define the finished work for ${name}.`, "Describe the audience, format, scope, and what counts as a finished first version. Break the work into a small deliverable.", "A defined deliverable makes a creative ambition easier to start and review.", "What will you create first, for whom, and how will you know it is finished?", "custom-creative-outcome-defined"],
    ["custom-creative-plan", "Build a realistic production and feedback plan.", "Break the work into stages, estimate time and essential costs, identify tools or permissions, and decide who can give useful feedback.", "A workable process protects time and helps improve the work.", "What are your main stages, resources, and feedback source?", "custom-creative-plan-created"],
    ["custom-creative-draft", "Create a small draft and review it.", "Produce a sample, outline, prototype, or first section. Review it against your intended audience and use feedback to choose the next revision.", "A real draft gives more useful evidence than waiting for a perfect plan.", "What did you produce, what feedback did you get, and what will you revise?", "custom-creative-draft-reviewed"],
  ];
  else if (/travel|visit|trip|holiday|resort|experience|journey|concert|event/.test(lower)) entries = [
    ["custom-experience-requirements", `Research what ${name} requires.`, "Identify destination or provider, dates, eligibility, access, transport, safety requirements, and inclusions. Verify important details with reliable sources.", "The details determine whether the experience is practical and suitable.", "What requirements did you verify, and what is still unconfirmed?", "custom-experience-requirements-checked"],
    ["custom-experience-budget", "Build a complete and flexible estimate.", "Include entry or participation fees, transport, accommodation if needed, meals, equipment, contingency, and cancellation terms. Mark unverified amounts clearly.", "A complete estimate helps prevent surprises.", "What costs did you include, and which figures need confirmation?", "custom-experience-costs-estimated"],
    ["custom-experience-plan", "Make a safe participation plan.", "Check provider credibility, access rules, travel arrangements, emergency contacts, and a realistic timeline. Do not treat a practice score as a booking.", "Responsible planning covers safety and logistics as well as money.", "What is the next verified step, and what must be confirmed before committing?", "custom-experience-plan-prepared"],
  ];
  else entries = [
    ["custom-outcome", `Define what achieving “${name}” means.`, `Describe what achieving “${name}” would look like in observable terms. Identify who or what is involved, the intended outcome, and the first important unknown to resolve.`, "A specific outcome helps distinguish useful progress from unrelated activity.", "What would success look like, and what key question must you answer first?", "custom-outcome-defined"],
    ["custom-requirements", `Research the real requirements for “${name}”.`, `Find reliable information about the skills, people, permissions, resources, time, costs if relevant, and risks involved in “${name}”. Record sources and separate facts from assumptions.`, "Reliable information helps you choose an appropriate next action.", "What requirements did you identify, what evidence supports them, and what remains uncertain?", "custom-requirements-researched"],
    ["custom-practical-step", `Take and review one practical step toward “${name}”.`, "Choose a small action that fits your present circumstances. Do it if appropriate, record the result, and decide what the result means for your next step.", "Progress becomes meaningful when an action produces evidence or better-informed decisions.", "What step did you take, what happened, and what will you do next?", "custom-practical-step-reviewed"],
  ];
  return makeJourney(entries);
};

export function journeyFor(goalId: string, goalTitle = ""): GoalJourney {
  return GOAL_JOURNEYS[goalId] ?? tailoredCustomJourney(goalTitle);
}

export type ReadinessQuestion = { q: string; opts: string[]; correct: number; tip: string };

export function readinessFor(goalId: string, goalTitle = ""): ReadinessQuestion[] {
  const title = goalTitle.trim() || "your ambition";
  const known: Record<string, ReadinessQuestion[]> = {
    jet: [
      { q: "Before relying on a private-jet charter estimate, what should you do?", opts: ["Treat an online headline price as final", "Confirm route, aircraft, dates, fees and terms with a legitimate provider", "Assume the virtual balance can pay for it"], correct: 1, tip: "A route-specific quote and clear terms are needed; a practice balance is not real money." },
      { q: "What belongs in a realistic charter estimate?", opts: ["Only the flight headline price", "No ground transport or fees", "Main cost items, with unknown figures marked for verification"], correct: 2, tip: "Keep estimates, unknowns and verified quotes separate." },
      { q: "If the real cost exceeds your present resources, what should you do?", opts: ["Protect essential expenses and revise timing or alternatives", "Borrow immediately without comparing risks", "Claim readiness because your quiz score is high"], correct: 0, tip: "Readiness requires realistic finances and verified arrangements." },
    ],
    house: [
      { q: "Before paying for a property, what should be checked?", opts: ["Only the seller's verbal assurance", "Ownership/title, documents and relevant approvals with qualified help", "Only the advertised price"], correct: 1, tip: "Independent due diligence should precede payment or signing." },
      { q: "Which estimate is most useful for a home purchase?", opts: ["Asking price alone", "A guessed price with no source", "Full costs including legal, transaction, repair and ongoing expenses"], correct: 2, tip: "Include costs beyond the headline price and verify them." },
      { q: "A property claim cannot be verified. What next?", opts: ["Pause and seek qualified independent advice", "Pay a deposit to secure it", "Assume it is genuine"], correct: 0, tip: "Unverified claims are a reason to pause, not rush." },
    ],
    school: [
      { q: "How should you check whether a programme suits your ambition?", opts: ["Rely only on a social-media advert", "Check official recognition and programme requirements", "Assume every certificate is accepted everywhere"], correct: 1, tip: "Use official sources to verify recognition and entry requirements." },
      { q: "What should a realistic education plan include?", opts: ["Tuition only", "Only the first payment", "Fees, materials, deadlines, duration and funding assumptions"], correct: 2, tip: "Consider the full period of study and confirm current figures." },
      { q: "You discover a prerequisite you do not meet. What next?", opts: ["Record it and plan how or when to meet it", "Hide it from the institution", "Assume it will not matter"], correct: 0, tip: "Turn gaps into practical preparation tasks." },
    ],
    agri: [
      { q: "Before investing in an agricultural project, what should you validate?", opts: ["Only equipment price", "Demand, local conditions, inputs and risks", "A social-media success story"], correct: 1, tip: "Feasibility depends on local conditions and market evidence." },
      { q: "How should uncertain input and selling prices be handled?", opts: ["Assume the most favourable price", "Ignore seasonal changes", "Record assumptions and seek current local estimates"], correct: 2, tip: "Use realistic ranges and validate assumptions locally." },
      { q: "Who may help check the plan against local realities?", opts: ["An experienced producer or agricultural extension officer", "Only someone selling equipment", "No one"], correct: 0, tip: "Local expertise can identify seasonal and operational risks." },
    ],
    biz: [
      { q: "What is a strong early test of a business idea?", opts: ["Spend heavily before talking to anyone", "Assume friends' praise proves demand", "Speak with potential customers about their needs and alternatives"], correct: 2, tip: "Customer evidence is more useful than assumptions alone." },
      { q: "Before a larger investment, what should you estimate?", opts: ["Startup and recurring costs, pricing assumptions and risks", "Only logo cost", "Revenue as if every prospect will buy"], correct: 0, tip: "A simple model should expose assumptions and recurring obligations." },
      { q: "What is the purpose of a small pilot?", opts: ["Guarantee success", "Test key assumptions at manageable risk", "Avoid collecting feedback"], correct: 1, tip: "A pilot helps decide whether to continue, adapt, or stop." },
    ],
    skill: [
      { q: "How can you define progress in a practical skill?", opts: ["Count only videos watched", "Choose a specific task or project you can demonstrate", "Assume enrollment proves mastery"], correct: 1, tip: "Demonstrable outcomes are stronger evidence than attendance alone." },
      { q: "How should you choose a learning route?", opts: ["Compare credibility, practical work, cost and time", "Choose only the cheapest advert", "Ignore prerequisites"], correct: 0, tip: "Check the quality and fit of the route before committing." },
      { q: "What should you do after practising?", opts: ["Claim expertise without review", "Avoid feedback", "Review the result, identify gaps and practise again"], correct: 2, tip: "Feedback and iteration help turn practice into capability." },
    ],
  };
  if (known[goalId]) return known[goalId];
  const journey = tailoredCustomJourney(title);
  const first = journey.activities[0].title;
  const second = journey.activities[1].title;
  const third = journey.activities[2].title;
  const lower = title.toLowerCase();
  if (/cyber|software|coding|program|technology|digital skill/.test(lower)) return [
    { q: `For “${title}”, how should you define useful progress?`, opts: ["Choose a skill or product you can demonstrate in a small practical project", "Count only videos watched", "Assume a course certificate proves practical ability"], correct: 0, tip: "A concrete demonstration helps connect learning to a useful result." },
    { q: `When choosing a route for “${title}”, what should you compare?`, opts: ["Only the most popular advert", "Credibility, prerequisites, hands-on work, cost and time", "Ignore whether you can practise"], correct: 1, tip: "Choose a route that fits your goals and gives you practical work." },
    { q: `Before relying on a solution built for “${title}”, what should you do?`, opts: ["Assume it works because it runs once", "Skip documentation", "Test it, record what works, and identify security or reliability gaps"], correct: 2, tip: "Testing and reviewing gaps are part of responsible technical work." },
  ];
  if (/farm|agric|crop|livestock|poultry|fish farm|fishery/.test(lower)) return [
    { q: `For “${title}”, what should you validate before committing resources?`, opts: ["Local demand, operating conditions, inputs and risks", "Only the cheapest equipment", "A success story from a different region"], correct: 0, tip: "Check the assumptions that most affect feasibility in your context." },
    { q: `When estimating resources for “${title}”, how should unknowns be handled?`, opts: ["Assume ideal conditions", "Record assumptions and seek reliable local estimates", "Ignore seasonal variation"], correct: 1, tip: "Mark uncertainty clearly and consult relevant local expertise." },
    { q: `What is a sensible next step for “${title}” if major risks remain unknown?`, opts: ["Invest everything immediately", "Treat a quiz result as proof", "Seek informed advice and test the riskiest assumption on a small scale"], correct: 2, tip: "Reduce avoidable risk before a major commitment." },
  ];
  if (/house|home|land|property|real estate|building/.test(lower)) return [
    { q: `Before committing to “${title}”, what should you clarify?`, opts: ["Essential requirements, location and independent evidence", "Only how attractive it looks", "A seller's promise without checking"], correct: 0, tip: "Clear requirements help you compare options and avoid pressure." },
    { q: `How should you estimate the costs of “${title}”?`, opts: ["Use the asking price alone", "Include transaction, legal, repair and ongoing costs, verifying important figures", "Ignore future obligations"], correct: 1, tip: "Include the full commitment and separate estimates from verified costs." },
    { q: `If ownership or permission details for “${title}” are unclear, what should you do?`, opts: ["Pay a deposit immediately", "Assume the paperwork is fine", "Pause and arrange qualified independent checks"], correct: 2, tip: "Independent checks should come before signing or paying." },
  ];
  if (/school|university|college|course|degree|education|learn|training|academy|certif/.test(lower)) return [
    { q: `Before pursuing “${title}”, how should you check a learning route?`, opts: ["Rely on a promotional claim", "Verify recognition, requirements and suitability from reliable sources", "Assume all providers are equivalent"], correct: 1, tip: "Verify the route and its requirements before investing." },
    { q: `What belongs in a plan for “${title}”?`, opts: ["Deadlines, prerequisites, total costs and funding assumptions", "Tuition only with no dates", "A promise that admission is guaranteed"], correct: 0, tip: "Plan around the full commitment and outstanding requirements." },
    { q: `If you discover a missing requirement for “${title}”, what should you do?`, opts: ["Pretend it is completed", "Ignore the deadline", "Record it and plan a realistic way to address it"], correct: 2, tip: "Turn gaps into specific preparation steps." },
  ];
  if (/business|company|startup|enterprise|shop|sell|brand|market/.test(lower)) return [
    { q: `What is the best way to test the need behind “${title}”?`, opts: ["Talk to potential customers and record their needs", "Assume demand because you like the idea", "Spend the full budget immediately"], correct: 0, tip: "Use customer evidence to challenge assumptions." },
    { q: `How should you handle uncertain costs for “${title}”?`, opts: ["Ignore recurring costs", "List assumptions, verify important figures and plan a small test", "Assume every sale will be profitable"], correct: 1, tip: "A small, measured test can reduce the risk of a larger commitment." },
    { q: `What should you learn from a pilot for “${title}”?`, opts: ["Only whether it felt exciting", "That success is guaranteed", "What customers did, what it cost and what decision the evidence supports"], correct: 2, tip: "Use results to decide whether to continue, adapt or stop." },
  ];
  if (/book|write|novel|film|music|art|creative|content|publish/.test(lower)) return [
    { q: `How can you make progress on “${title}” visible?`, opts: ["Wait until the whole work is perfect", "Create a defined draft, sample or outline", "Only collect inspiration without making anything"], correct: 1, tip: "A small finished piece creates something you can review." },
    { q: `How should you plan the work for “${title}”?`, opts: ["Break it into stages and identify time, tools and feedback", "Assume it takes no time", "Avoid deciding what finished means"], correct: 0, tip: "A staged plan makes creative work more manageable." },
    { q: `What should you do with useful feedback on “${title}”?`, opts: ["Ignore all feedback", "Claim the work is complete immediately", "Use it to decide what to revise next"], correct: 2, tip: "Feedback should inform your next revision." },
  ];
  if (/travel|visit|trip|holiday|resort|experience|journey|concert|event/.test(lower)) return [
    { q: `Before arranging “${title}”, what should you verify?`, opts: ["Access rules, current terms, provider details and safety requirements", "Only a photo of the venue", "Assume online details are current"], correct: 0, tip: "Confirm important details directly with a reliable source." },
    { q: `How should you estimate the full cost of “${title}”?`, opts: ["Count only the entry fee", "Include transport and other likely costs, marking unverified figures", "Assume all extras are free"], correct: 1, tip: "A full estimate helps avoid unexpected expenses." },
    { q: `If a key detail for “${title}” is unconfirmed, what should you do?`, opts: ["Assume it will work out", "Treat a high quiz score as a booking", "Verify it before making an irreversible commitment"], correct: 2, tip: "Practice is not confirmation; verify the actual arrangement." },
  ];
  return [
    { q: `For “${title}”, what is the best approach to the first step: ${first}?`, opts: ["Complete the relevant checks and record evidence or questions", "Skip it and assume everything is ready", "Commit significant resources before checking details"], correct: 0, tip: "Start with evidence that is specific to your ambition." },
    { q: `While pursuing “${title}”, how should you handle the step “${second}”?`, opts: ["Ignore uncertainties", "Separate verified facts from assumptions and check important unknowns", "Treat practice points as real resources"], correct: 1, tip: "Record what is known and what still needs verification." },
    { q: `What makes the next step toward “${title}” useful: ${third}?`, opts: ["It sounds impressive even if unrelated", "It requires a large payment first", "It is relevant, realistic, and produces evidence or learning"], correct: 2, tip: "Choose a step that genuinely advances the ambition." },
  ];
}

export function milestoneIsComplete(
  milestone: JourneyMilestone,
  records: Record<string, { result: string; completedAt: string }> | undefined,
): boolean {
  const record = records?.[milestone.activityId];
  return Boolean(record && typeof record.result === "string" && record.result.trim() && record.completedAt);
}
