

## Plan: Platform-wide improvements

This plan addresses all 6 items in priority order. No database changes needed yet — all data will be centralized in a shared data layer used across all pages.

---

### 1. Create a unified member data model (`src/data/members.ts`)

Create a single source of truth for all learners used across the platform. Generate ~150 realistic members with names, emails, roles, enrollment dates, avatars, and course enrollments. Each member will have per-module score/confidence data so clusters vary by module.

This file exports:
- `Member` interface (id, name, email, role, avatar initials, joinDate, enrolledCourseIds)
- `members: Member[]` — ~150 generated members
- `getMemberModuleData(memberId, courseId, moduleId)` — returns `{score, confidence}` per member per module (seeded deterministically so clusters differ across modules)
- A shared `courses` array (only 2 courses kept) with their module definitions

### 2. Create shared course data (`src/data/courses.ts`)

Define exactly 2 courses with their modules:
- "Data Security & Privacy Essentials" (6 modules: SOC 2, GDPR, Phishing, Data Classification, Incident Response, Final Assessment)
- "AI Reskilling — Engineering" (5 modules: Prompt Engineering, ML Fundamentals, LLM Architecture, AI Ethics, Applied AI Project)

Export course and module types used by Courses page, CourseDetail, and Mastery.

### 3. Update `masteryData.ts`

- Remove the old `generateModuleData` and `moduleDataMap`
- Instead, export a function `getLearnerDataForModule(courseId, moduleId, thresholds)` that pulls from the shared members data and classifies each
- Increase learner count to ~150 per module (all enrolled members)
- Keep existing `ThresholdConfig`, `classifyStudent`, `clusterColors`, `clusterMeta` unchanged

### 4. Update Mastery page (`src/pages/insights/Mastery.tsx`)

- Add a **course selector** dropdown above the module selector
- When a course is selected, populate the module dropdown from that course's modules
- Use the new `getLearnerDataForModule` to get classified data
- **Layout improvements** to match screenshot style:
  - Stronger page header with title + description + filters in a row
  - Cluster summary cards in a horizontal row (5 cards showing count per cluster)
  - Better spacing between sections
  - Scatter plot and bar charts with more whitespace

### 5. Simplify navigation (`AppSidebar.tsx`)

Remove from sidebar:
- Events (main nav)
- Messages insight
- Products insight

Remove from routes (`App.tsx`):
- `/events`, `/insights/messages`, `/insights/products`, `/admin/events`, `/admin/products`

Insights section becomes just: Engagement, Mastery

Simplify admin to: Dashboard, Members, Content, Automations

### 6. Build Admin → Members page

Replace the placeholder `MembersPage` with a real page showing:
- Table of all members (name, email, role, join date, enrolled courses)
- Search/filter
- Clean layout with proper spacing

### 7. Update Courses page

- Reduce to only 2 courses (from shared data)
- Keep create course dialog but use shared data

### 8. Update ChatPage

- Use shared `members` data for conversation list instead of hardcoded names
- Show first 8 members as conversations

### 9. UI cleanup across all pages

- Increase whitespace in page layouts (larger gaps, more padding)
- Reduce visual noise — fewer badges, simpler headers
- Cleaner card styling with more breathing room
- Apply Disco.co-inspired spacing: `space-y-8` instead of `space-y-6`, larger section gaps

### Files to create/edit

| File | Action |
|------|--------|
| `src/data/members.ts` | **Create** — unified member data with per-module scores |
| `src/data/courses.ts` | **Create** — shared course definitions (2 courses) |
| `src/data/masteryData.ts` | **Edit** — remove moduleDataMap, add getLearnerDataForModule |
| `src/pages/insights/Mastery.tsx` | **Edit** — course+module filtering, layout improvements, use shared data |
| `src/components/layout/AppSidebar.tsx` | **Edit** — remove Events, Messages, Products insights |
| `src/App.tsx` | **Edit** — remove unused routes |
| `src/pages/PlaceholderPages.tsx` | **Edit** — remove unused exports |
| `src/pages/Courses.tsx` | **Edit** — use shared course data, only 2 courses |
| `src/pages/ChatPage.tsx` | **Edit** — use shared member data |
| `src/pages/CourseDetail.tsx` | **Edit** — use shared course data |
| `src/pages/Index.tsx` | **Edit** — cleaner spacing |
| `src/pages/admin/Members.tsx` | **Create** — real members table page |

