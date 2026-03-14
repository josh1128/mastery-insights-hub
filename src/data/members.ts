import { courses } from "./courses";
import { contentStore } from "./contentStore";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "learner" | "instructor" | "admin";
  initials: string;
  joinDate: string;
  enrolledCourseIds: string[];
}

// Deterministic seeded RNG
function seededRng(seed: number) {
  return () => {
    seed = Math.sin(seed) * 10000;
    return seed - Math.floor(seed);
  };
}

const firstNames = [
  "Sarah", "Mike", "Emily", "James", "Lisa", "David", "Anna", "Chris", "Maria", "Ryan",
  "Sophia", "Daniel", "Olivia", "Andrew", "Emma", "Ben", "Chloe", "Ethan", "Mia", "Nathan",
  "Ava", "Kevin", "Isabella", "Tyler", "Grace", "Justin", "Lily", "Brandon", "Zoe", "Alex",
  "Hannah", "Jacob", "Ella", "Luke", "Aria", "Sam", "Nora", "Josh", "Layla", "Adam",
  "Riley", "Dylan", "Scarlett", "Mason", "Violet", "Owen", "Hazel", "Caleb", "Stella", "Leo",
  "Ivy", "Max", "Aurora", "Liam", "Savannah", "Jack", "Audrey", "Elijah", "Brooklyn", "Aiden",
  "Claire", "Noah", "Penelope", "Carter", "Maya", "Gavin", "Naomi", "Colin", "Ruby", "Ian",
  "Quinn", "Sean", "Piper", "Mark", "Elena", "Hugo", "Lena", "Finn", "Clara", "Kai",
];

const lastNames = [
  "Johnson", "Chen", "Davis", "Wilson", "Park", "Brown", "Lee", "Martin", "Garcia", "Taylor",
  "Thomas", "Anderson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young", "King",
  "Wright", "Lopez", "Hill", "Scott", "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Perez",
  "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Morris",
  "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox",
  "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly",
  "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry",
  "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Bryant",
];

function generateMembers(): Member[] {
  const rng = seededRng(42);
  const result: Member[] = [];

  for (let i = 0; i < 150; i++) {
    const first = firstNames[Math.floor(rng() * firstNames.length)];
    const last = lastNames[Math.floor(rng() * lastNames.length)];
    const name = `${first} ${last}`;
    const initials = `${first[0]}${last[0]}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@company.com`;

    // Most learners enrolled in both courses, some in just one
    const r = rng();
    const enrolledCourseIds = r < 0.7
      ? courses.map(c => c.id)
      : r < 0.85
        ? [courses[0].id]
        : [courses[1].id];

    const month = Math.floor(rng() * 6) + 1;
    const day = Math.floor(rng() * 28) + 1;

    result.push({
      id: `member-${i + 1}`,
      name,
      email,
      role: "learner",
      initials,
      joinDate: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      enrolledCourseIds,
    });
  }

  return result;
}

export const members: Member[] = generateMembers();

/**
 * Returns {score, confidence} for a member on a specific course+module.
 * Deterministic but varies across modules so learners appear in different clusters.
 */
export function getMemberModuleData(
  memberId: string,
  courseId: string,
  moduleId: string
): { score: number; confidence: number } {
  // If we have real quiz results (including possible retests), use them instead
  const latest = contentStore.getLatestQuizResultForModule(memberId, courseId, moduleId);
  if (latest) {
    return {
      score: latest.score,
      confidence: latest.averageConfidence ?? latest.score,
    };
  }

  // Create a unique seed from the combination
  let seed = 0;
  for (let i = 0; i < memberId.length; i++) seed += memberId.charCodeAt(i) * (i + 1);
  for (let i = 0; i < courseId.length; i++) seed += courseId.charCodeAt(i) * (i + 3);
  for (let i = 0; i < moduleId.length; i++) seed += moduleId.charCodeAt(i) * (i + 7);

  const rng = seededRng(seed);

  // Generate score and confidence with clustering tendencies suitable for the new 2x2 matrix
  const archetype = rng();
  let score: number, confidence: number;

  if (archetype < 0.30) {
    // Mastery (High Score, High Conf)
    score = 70 + rng() * 30;
    confidence = 70 + rng() * 30;
  } else if (archetype < 0.45) {
    // Overconfident (Low Score, High Conf)
    score = 10 + rng() * 40;
    confidence = 70 + rng() * 30;
  } else if (archetype < 0.58) {
    // Underconfident (High Score, Low Conf)
    score = 70 + rng() * 30;
    confidence = 10 + rng() * 40;
  } else if (archetype < 0.70) {
    // Struggling (Low Score, Low Conf)
    score = 10 + rng() * 40;
    confidence = 10 + rng() * 40;
  } else {
    // Middle spread (around threshold transition zone)
    score = 40 + rng() * 30;
    confidence = 40 + rng() * 30;
  }

  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    confidence: Math.round(Math.min(100, Math.max(0, confidence))),
  };
}