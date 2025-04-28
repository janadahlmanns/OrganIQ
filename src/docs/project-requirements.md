# Project Requirements Specification (PRS)
OrganIQ

---

## 📜 Product Vision

OrganIQ is a university-level educational game designed to teach vegetative physiology and neurophysiology through a neon-academic, visually engaging, and gamified experience.
It targets technical university students (engineering, physics, data science), not medical students or the general public - (yet).
The app is playful but serious, fun but academically rigorous — combining the energy of games like Fortnite with the structure of platforms like Duolingo.

---

## 📱 Platform and Device Requirements

- Platform: **Website** (desktop and mobile web)
- Native mobile apps: **Possible future goal** (shared codebase considerations encouraged)
- Access priority: **Equal support** for both **computer** and **smartphone** users from Day 1
- All UX, visual, and interaction decisions must support both device types fully and equally.

---

## 🌍 Language and Internationalization (i18n)

- MVP must fully support **German** (for prototype and initial user testing).
- English support exists for UI and structure.
- UI language and exercise content language should be independently selectable (e.g., English UI + German exercises).
- The system must be **easily expandable** for future additional languages (modular i18n approach).

---

## 🔥 Core Features (Before Grant Application)

- User progression through **Topic Lessons**:
  - Each lesson contains multiple **Exercises**.
  - Current exercises include "questions" (multiple choice or open text) and "ordering" (sortable answers).
- Support growing **Exercise Types**:
  - (e.g., cloze text, memory match, labeling, mind map, mini crossword)
  - Full list maintained dynamically (growing design space).
- Progress tracking:
  - XP system (prototype basic implementation)
  - Lesson completion and streak mechanics.
- Touch-optimized drag and interactions:
  - Full DnD support on mobile and desktop.
  - Use dnd-kit architecture.
- Neon Academic Visual Identity:
  - Dark mode, neon accent glows (magenta, violet, cyan).
  - Synthwave-inspired modern UI.
- Prototype Hosting:
  - GitHub Pages for prototype hosting during grant application phase.

---

## 🔒 Features Planned Post-Grant

- Backend Development:
  - Firebase Authentication and Database
- Hosting Migration:
  - Move away from GitHub Pages (private production hosting TBD)
- Full Accessibility Support:
  - Keyboard navigation
  - Alternative input methods (tap vs. type answer options)
  - Formal ADA/WCAG compliance (to be evaluated)
- Expansion of Lesson Types:
  - Recap Lessons (mixed unlocked topics)
  - Exam Prep Lessons (full access to all topics/difficulties)
- Expansion of Exercise Types:
  - Implement broader exercise pool prioritized by feasibility and data readiness.

---

## 🛠 Technical Stack

| Category         | Current Plan       |
|:-----------------|:-------------------|
| Framework        | React 18 + Vite     |
| Language         | TypeScript          |
| State Management | Redux (already active) |
| Styling          | Tailwind CSS        |
| Routing          | React Router        |
| Drag and Drop    | @dnd-kit/core, @dnd-kit/sortable |
| Future Touch Gestures | @use-gesture/react (planned) |
| Icons            | Local PNG assets    |
| Hosting (Prototype) | GitHub Pages    |
| Hosting (Production) | TBD (Firebase Hosting or other) |

---

## 🧠 Accessibility and Inclusivity

- Prototype: No strict accessibility enforcement yet.
- Full Product: Keyboard navigation and alternative input methods required.
- Full ADA/WCAG compliance to be researched and planned after grant application.

---

## 🗓 Development Phases

| Phase | Description |
|:------|:------------|
| Before Grant Application | Build a high-quality web prototype showcasing the concept, demonstrating technical feasibility and UI/UX strength. |
| After Grant Application | Full development phase with backend integration, accessibility upgrades, hosting migration, and additional features expansion. |

- Internal priorities within each phase will be organized pragmatically by technical sense and resource availability.
- The transition between phases is not automatic; will be planned based on grant outcome.

---

## 🔖 Important Permanent Policies

- Always support both desktop and mobile access equally from the first prototype onward.
- German language support is mandatory for the prototype.
- Exercise Types list is dynamic and expandable.
- Accessibility is a critical future goal but not a prototype blocker.
- New technical decisions always override older ones unless specified otherwise.

---

## 📚 Project Management and Documentation Standards

- Project collaboration rules, AI communication protocols, and version control instructions are formally documented in `project-collaboration-guidelines.md`.
- Technical decisions are recorded in `architecture-decision-record.md` (ADR).
- Product and feature requirements are maintained in this `project-requirements.md`.
- Only the most recent versions of documentation files are considered valid; outdated versions are disregarded unless explicitly approved.
- If conflicts exist between older and newer instructions or decisions, the most recent explicitly approved version takes precedence.
- Documentation updates are synchronized with major project milestones or significant design shifts.
- Communication with AI assistants follows structured prompting and explicit locking of decisions (as outlined in the collaboration guidelines).

---

## 📅 Last Updated

2025-04-28
