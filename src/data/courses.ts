export interface CourseModule {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "Active" | "Draft";
  modules: CourseModule[];
}

export const courses: Course[] = [
    {
        id: "course-1",
        name: "Introduction to Data Structures",
        category: "Computer Science",
        status: "Active",
        description: "An introductory course designed to build strong data structures foundations for coding interviews and LeetCode-style problem solving.",
        modules: [
            { id: "testing", name: "Pre-course Quiz" },
          { id: "arrays-two-pointers", name: "Arrays and Two Pointers" },
          { id: "hashing-prefix", name: "Hashing and Prefix Sums" },
          { id: "linked-lists", name: "Linked Lists" },

        ],
      },
      {
        id: "course-2",
        name: "Introduction to Databases",
        category: "Computer Science",
        status: "Active",
        description: "Learn the fundamentals of relational databases, SQL, and data modeling. This course covers how to design schemas, write queries, and build efficient database-backed systems.",
        modules: [
          { id: "db-intro", name: "Introduction to Databases & Data Models" },
          { id: "er-model", name: "Entity-Relationship (ER) Modeling" },
          { id: "sql-basics", name: "SQL Basics and Querying" },
        ],
      }
];

export function getCourse(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

