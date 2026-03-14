import { Quiz, VideoLecture, Resource } from "@/data/contentStore";

/* ------------------ VIDEO LECTURES ------------------ */

export const demoVideos: VideoLecture[] = [
  {
    id: "video-arrays",
    title: "Introduction to Arrays",
    courseId: "course-1",
    moduleId: "arrays-two-pointers",
    fileName: "arrays-intro.mp4",
    fileUrl: "/demo/videos/arrays-intro.mp4",
    confidenceCheckpoints: [
      {
        id: "cp-arrays-1",
        timestampSeconds: 30,
        prompt: "How confident are you that you understand what an array is?"
      } 
    ],
    createdAt: new Date().toISOString()
  },

  {
    id: "video-hashing",
    title: "Hash Maps and Prefix Sums Overview",
    courseId: "course-1",
    moduleId: "hashing-prefix",
    fileName: "hashing-prefix.mp4",
    fileUrl: "/demo/videos/hashing-prefix.mp4",
    confidenceCheckpoints: [],
    createdAt: new Date().toISOString()
  },

  {
    id: "video-linked-lists",
    title: "Understanding Linked Lists",
    courseId: "course-1",
    moduleId: "linked-lists",
    fileName: "linked-lists.mp4",
    fileUrl: "/demo/videos/linked-lists.mp4",
    confidenceCheckpoints: [],
    createdAt: new Date().toISOString()
  },

  {
    id: "video-db-intro",
    title: "What is a Database?",
    courseId: "course-2",
    moduleId: "db-intro",
    fileName: "database-intro.mp4",
    fileUrl: "/demo/videos/database-intro.mp4",
    confidenceCheckpoints: [],
    createdAt: new Date().toISOString()
  },

  {
    id: "video-er",
    title: "ER Diagrams Explained",
    courseId: "course-2",
    moduleId: "er-model",
    fileName: "er-model.mp4",
    fileUrl: "/demo/videos/er-model.mp4",
    confidenceCheckpoints: [],
    createdAt: new Date().toISOString()
  },

  {
    id: "video-sql",
    title: "Basic SQL Queries",
    courseId: "course-2",
    moduleId: "sql-basics",
    fileName: "sql-basics.mp4",
    fileUrl: "/demo/videos/sql-basics.mp4",
    confidenceCheckpoints: [],
    createdAt: new Date().toISOString()
  }
];


/* ------------------ RESOURCES (PDFs) ------------------ */

export const demoResources: Resource[] = [
  {
    id: "pdf-arrays",
    title: "Array Cheat Sheet",
    courseId: "course-1",
    moduleId: "arrays-two-pointers",
    fileName: "arrays-cheatsheet.pdf",
    fileUrl: "/demo/resources/arrays-cheatsheet.pdf",
    fileType: "pdf",
    isOptional: false,
    createdAt: new Date().toISOString()
  },

  {
    id: "pdf-hashing",
    title: "Hash Map Patterns",
    courseId: "course-1",
    moduleId: "hashing-prefix",
    fileName: "hashmap-patterns.pdf",
    fileUrl: "/demo/resources/hashmap-patterns.pdf",
    fileType: "pdf",
    isOptional: false,
    createdAt: new Date().toISOString()
  },

  {
    id: "pdf-linked-lists",
    title: "Linked List Operations Guide",
    courseId: "course-1",
    moduleId: "linked-lists",
    fileName: "linked-lists-guide.pdf",
    fileUrl: "/demo/resources/linked-lists-guide.pdf",
    fileType: "pdf",
    isOptional: false,
    createdAt: new Date().toISOString()
  },

  {
    id: "pdf-er",
    title: "ER Diagram Symbols",
    courseId: "course-2",
    moduleId: "er-model",
    fileName: "er-symbols.pdf",
    fileUrl: "/demo/resources/er-symbols.pdf",
    fileType: "pdf",
    isOptional: false,
    createdAt: new Date().toISOString()
  },

  {
    id: "pdf-precourse-optional",
    title: "Data Structures Quick Reference",
    courseId: "course-1",
    moduleId: "testing",
    fileName: "ds-quick-reference.pdf",
    fileUrl: "/demo/resources/ds-quick-reference.pdf",
    fileType: "pdf",
    isOptional: true,
    createdAt: new Date().toISOString()
  }
];




/* ------------------ QUIZZES (MAX 3 QUESTIONS) ------------------ */

export const demoQuizzes: Quiz[] = [
    {
        id: "quiz-ds-precourse",
        title: "Pre-Course Knowledge Check: Data Structures",
        courseId: "course-1",
        moduleId: "testing",
        captureConfidence: true,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: "pre-q1",
            type: "true-false",
            text: "Arrays allow constant-time access to elements using an index.",
            correctAnswer: "true"
          },
          {
            id: "pre-q2",
            type: "multiple-choice",
            text: "Which data structure follows First-In First-Out (FIFO) order?",
            correctAnswer: "queue",
            options: [
              { id: "stack", text: "Stack" },
              { id: "queue", text: "Queue" },
              { id: "tree", text: "Binary Tree" },
              { id: "graph", text: "Graph" }
            ]
          },
          {
            id: "pre-q3",
            type: "multiple-choice",
            text: "Which operation is typically O(1) in a hash map?",
            correctAnswer: "lookup",
            options: [
              { id: "lookup", text: "Looking up a key" },
              { id: "sorting", text: "Sorting the keys" },
              { id: "traversal", text: "Traversing all elements" },
              { id: "rebalancing", text: "Rebalancing the structure" }
            ]
          }
        ]
      },
  {
    id: "quiz-arrays",
    title: "Arrays Basics Quiz",
    courseId: "course-1",
    moduleId: "arrays-two-pointers",
    captureConfidence: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q1",
        type: "true-false",
        text: "Arrays store elements in contiguous memory.",
        correctAnswer: "true"
      },
      {
        id: "q2",
        type: "true-false",
        text: "Accessing an element in an array takes O(n) time.",
        correctAnswer: "false"
      },
      {
        id: "q3",
        type: "true-false",
        text: "Two-pointer technique is often used with sorted arrays.",
        correctAnswer: "true"
      }
    ]
  },

  // In demoQuizzes, add:
{
    id: "quiz-ds-precourse-retest",
    title: "Pre-Course Knowledge Check — Retest",
    courseId: "course-1",
    moduleId: "testing",
    captureConfidence: true,
    isRetest: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "pre-rt-q1",
        type: "true-false",
        text: "A stack follows Last-In First-Out (LIFO) order.",
        correctAnswer: "true"
      },
      {
        id: "pre-rt-q2",
        type: "multiple-choice",
        text: "What is the time complexity of searching an unsorted array?",
        correctAnswer: "on",
        options: [
          { id: "o1", text: "O(1)" },
          { id: "on", text: "O(n)" },
          { id: "ologn", text: "O(log n)" },
          { id: "on2", text: "O(n²)" }
        ]
      },
      {
        id: "pre-rt-q3",
        type: "true-false",
        text: "A linked list allows O(1) random access by index.",
        correctAnswer: "false"
      }
    ]
  },

  {
    id: "quiz-sql",
    title: "SQL Basics Quiz",
    courseId: "course-2",
    moduleId: "sql-basics",
    captureConfidence: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q1",
        type: "true-false",
        text: "SQL stands for Structured Query Language.",
        correctAnswer: "true"
      },
      {
        id: "q2",
        type: "true-false",
        text: "SELECT is used to delete rows.",
        correctAnswer: "false"
      },
      {
        id: "q3",
        type: "true-false",
        text: "WHERE filters rows in a query.",
        correctAnswer: "true"
      }
    ]
  }
];