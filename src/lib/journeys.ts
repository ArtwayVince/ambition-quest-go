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

export function journeyFor(goalId: string): GoalJourney {
  return GOAL_JOURNEYS[goalId] ?? DEFAULT_JOURNEY;
}

export function milestoneIsComplete(
  milestone: JourneyMilestone,
  records: Record<string, { result: string; completedAt: string }> | undefined,
): boolean {
  const record = records?.[milestone.activityId];
  return Boolean(record && typeof record.result === "string" && record.result.trim() && record.completedAt);
}
