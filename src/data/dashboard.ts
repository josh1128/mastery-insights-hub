import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { members } from "@/data/members";
import { courses } from "@/data/courses";

export const dashboardStats = [
  { label: "Total Members", value: members.length.toString(), icon: Users, change: "+12%" },
  { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, change: `${courses.length} active` },
  { label: "Avg Mastery", value: "78%", icon: TrendingUp, change: "+5%" },
  { label: "Certificates Issued", value: "342", icon: Award, change: "+28" },
];

export const masteryTrendData = [
    { week: "Jan 6", mastery: 62 },
    { week: "Jan 13", mastery: 65 },
    { week: "Jan 20", mastery: 68 },
    { week: "Jan 27", mastery: 72 },
    { week: "Feb 3", mastery: 75 },
    { week: "Feb 10", mastery: 74 },
    { week: "Feb 17", mastery: 77 },
    { week: "Feb 24", mastery: 78 }, // Matches your current "78%" stat
  ];

export const dashboardQuickStats = [
  { label: "New Members Today", value: "3" },
  { label: "New This Week", value: "19" },
  { label: "New This Month", value: "42" },
  { label: "Completion Rate", value: "68%" },
];