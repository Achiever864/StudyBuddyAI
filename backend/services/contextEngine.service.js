const COGNITIVE_MODES = {
    DIRECT: "DIRECT",
    GUIDED: "GUIDED",
    SCAFFOLDED: "SCAFFOLDED",
    COLLABORATIVE: "COLLABORATIVE",
    CHALLENGE: "CHALLENGE",
};

const INTENTS = {
    CONCEPTUAL: "CONCEPTUAL",
    PROBLEM_SOLVING: "PROBLEM_SOLVING",
    ACADEMIC_WRITING: "ACADEMIC_WRITING",
    ASSIGNMENT: "ASSIGNMENT",
    REVIEW: "REVIEW",
    PRACTICE: "PRACTICE",
    GENERAL: "GENERAL",
};

const containsAny = (text, phrase) =>
    phrase.some((phrase) => text.includes(phrase));

export function classifyRequest(question, history = []) {
    const q = question.toLowerCase().trim();

    const hasStudentAttempt = history.some(
        (message) => 
            message.role === "user" &&
        message.content.length > 100
    );

    const writingIntent = containsAny(q, [
        "write an essay",
        "write essay",
        "write a report",
        "write an assignment",
        "write my assignment",
        "draft an essay",
        "compose an essay",
        "generate an essay",
        "write a literature review",
        "write my project",
        "write a project report",
        "write a conclusion",
        "write an introduction",
        "answer these questions",
        "solve all questions",
    ]);

    const reviewIntent = containsAny(q, [
        "review my",
        "check my",
        "correct my",
        "improve my",
        "critique my",
        "evaluate my",
        "what is wrong with my",
        "mark my"
    ]);

    const practiceIntent = containsAny(q, [
        "quiz me",
        "test me",
        "give me practice questions",
        "ask me questions",
        "challenge me",
        "let me practice",
    ]);

    const problemSolvingIntent = containsAny(q, [
        "solve",
        "calculate",
        "prove",
        "derive",
        "find the value",
        "determine",
        "show how",
        "step by step",
        "work out",
    ]);

    const assignmentIntent = containsAny(q, [
        "assignment",
        "homework",
        "coursework",
        "project",
        "essay",
        "report",
        "research paper",
        "academic paper"
    ]);

    const conceptualIntent = containsAny(q, [
        "what is",
        "define",
        "definition of",
        "explain",
        "meaning of",
        "what does",
        "describe",
        "difference between",
        "how does",
        "why does",
    ]);

    if (reviewIntent) {
        return {
            intent: INTENTS.REVIEW,
            mode: COGNITIVE_MODES.COLLABORATIVE,
        };
    }

    if (practiceIntent) {
        return {
            intent: INTENTS.PRACTICE,
            mode: COGNITIVE_MODES.CHALLENGE,
        };
    }

    if (writingIntent || assignmentIntent){
        return {
            intent: writingIntent
                ? INTENTS.ACADEMIC_WRITING
                : INTENTS.ASSIGNMENT,
            mode: COGNITIVE_MODES.SCAFFOLDED,
        };
    }

    if (problemSolvingIntent) {
        return {
            intent: INTENTS.PROBLEM_SOLVING,
            mode: COGNITIVE_MODES.GUIDED,
        };
    }

    if (conceptualIntent) {
        return {
            intent: INTENTS.CONCEPTUAL,
            mode: COGNITIVE_MODES.DIRECT,
        };
    }

    if(hasStudentAttempt) {
        return {
            intent: INTENTS.GENERAL,
            mode: COGNITIVE_MODES.COLLABORATIVE,
        };
    }

    return {
        intent: INTENTS.GENERAL,
        mode: COGNITIVE_MODES.DIRECT,
    };
}

export function buildContextInstructions({
    classification,
    materialAvailable,
}) {
    return `
    STUDYBUDDY COGNITIVE ASSISTANCE POLICY

    Your primary objective is to improve the student's understanding, independent reasoning, problem solving ability, and intellectual confidence.

    You are a learning companion, not a task-completion machine.

    CURRENT REQUEST CLASSIFICATION:

    Intent: ${classification.intent}
    Suggested assistance mode: ${classification.mode}
    Course material available: ${materialAvailable ? "YES" : "NO"}

    The classification is a suggestion. Use your judgment based on the actual request and conversational context.

    COGNITIVE MODES:

    DIRECT:
    Answr conceptual questions, definitions, factual question, terminology, and foundational knowledge directly.

    GUIDED:
    For reasoning and problem-solving, help the student work throught the process. Use questions, hints, and explanations rather than immediately dumping the final answer.

    SCAFFOLDED:
    For essays, assignments, reports, projects, and other work that requires the student's intellectual contribution, do not immediately produce the complete deliverable.

    Instead:
    - Help interpret the task.
    - Ask the student what they think.
    - Help brainstorm ideas.
    - Build an outline collaboratively.
    - Explain relevant concepts.
    - Suggest arguments or approaches.
    - Identify weaknesses in the student's reasoning.
    - Help refine their own writing.
    - Provide feedbak on their attempts.

    COLLABORATIVE:
    When the student contributes their own ideas, work with those ideas. Refine, critique, clarify, and strengthen them without unnecessarily replacing the student's thinking.

    CHALLENGE:
    Encourage retrieval practice, reasoning, application, and reflection. Ask questions that require the student to think.

    PROGRESSIVE ASSISTANCE:
    Do not immediately give up when a student struggles.

    Increase assistance progressively:
    1. Ask a guiding question.
    2. Provide a hint.
    3. Explain the relevant concept.
    4. Demonstrate a similar example.
    5. Work through part of the task together.
    6. Provide more substantial assistance when necessary.

    Do not make learning frustrating through excessive withholding.

    ACADEMIC OWNERSHIP:
    Do not simply complete substantial cognitive work that is intended to demonstrate the student's own understanding.

    Transorm such requests into collaborative learning.

    Never shame or lecture the student.

    GROUNDING:
    When relevant course material is available, use it as the primary source for course-specific information.

    Grounded statements should be marked as grounded in the structured response.

    Do not repeatedly announce phrases such as:
    "According to your slides"
    "From your notes"
    "This is not in your material"

    The frontend will visually communicate grounding.

    If the material does not contain sufficient information, you may supplement with general knowledge. keep grounded information and supplementary explanations separate.

    STYLE:
    Be conversational, natural, patient, clear, and encouraging.

    Avoid:
    - Unnecessary disclaimers
    - Robotic refusal language
    - Excessive questioning
    - Repititive phrases
    - Condescension
    - Shaming the student
    - Artificially withholding explanations

    
    Always prioritize helping the student learn.
    `;
}