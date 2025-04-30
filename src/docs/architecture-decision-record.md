# Architecture Decision Record (ADR)
OrganIQ

This document records all major technical and architectural decisions for the OrganIQ project.

---

## ADR-001: Adopt Centralized Styling via Tailwind Config

### Status
Accepted

### Context
To ensure a unified design language and minimize hardcoded values, styling will be centralized in `tailwind.config.ts` whenever possible.

### Decision
- All custom shadows, colors, radii, and spacings will be defined in Tailwind config utilities.
- Direct inline values will be avoided unless strictly necessary.
- The goal is to maintain a single source of truth for design values.

### Consequences
- Greater codebase consistency.
- Easier future visual redesigns.
- Minor initial overhead in config setup.

### Date
2025-04-28

---

## ADR-002: Modernize Drag and Drop with dnd-kit

### Status
Accepted

### Context
The legacy drag-and-drop (DnD) logic was based on native HTML5 DnD and/or older libraries like sortablejs, lacking mobile support. A modern, cross-device capable solution is needed for OrganIQ.

### Decision
- Adopted packages:
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/modifiers` (planned for future auto-scroll or custom behaviors)
- Sensors configured:
  - **Desktop:** `PointerSensor` with `activationConstraint: { distance: 1 }`
  - **Mobile:** `TouchSensor` with `activationConstraint: { delay: 100, tolerance: 5 }`
- CSS behavior:
  - Apply `touch-action: none` to draggable elements to prevent mobile browsers from interpreting drag gestures as scroll gestures.

### Consequences
- Smooth, native-feeling drag-and-drop interactions on both desktop and mobile browsers.
- Normal page scrolling remains functional when not interacting with draggable elements.
- Auto-scrolling during drag (at screen edges) is not yet implemented; if needed, it will be added later using `@dnd-kit/modifiers`.
- No additional packages required beyond the dnd-kit suite.

### Date
2025-04-28 (Updated 2025-04-29 for mobile touch support clarification)

---

## ADR-003: Host Prototype on GitHub Pages (Public Repo)

### Status
Accepted

### Context
To enable easy deployment for the grant application phase, the prototype will be hosted via GitHub Pages.

### Decision
- Accept that the prototype repository will remain public during grant evaluation.
- Production hosting (private) will be reassessed post-grant.

### Consequences
- Public code visibility temporarily.
- Simplified deployment during prototyping.

### Date
2025-04-28

---

## ADR-004: Language Support — English Baseline, German Layer

### Status
Accepted

### Context
OrganIQ is currently developed with an English UI baseline. German support must be added for the grant application but without overwriting English.

### Decision
- Maintain English as the primary development language.
- Add German as a parallel language for UI and exercises.
- Build modular i18n system expandable to future languages.

### Consequences
- Minimal friction for international scaling later.
- Small upfront i18n work needed.

### Date
2025-04-28

---

## ADR-005: Accessibility and Inclusivity Planning

### Status
Accepted

### Context
Accessibility is a vital long-term goal, but immediate prototype requirements are more focused on UX quality and feasibility demonstration.

### Decision
- ADA/WCAG compliance is an aspirational target for full product release.
- Prototype phase exempt from strict accessibility requirements.
- Accessibility execution will be brainstormed thoroughly before lock-in.

### Consequences
- Prototype development faster.
- Full inclusivity planned but not rushed prematurely.

### Date
2025-04-28

---

## ADR-006: Backend Scope — Firebase Tentative

### Status
Accepted

### Context
OrganIQ requires authentication, database, and scalable backend services post-prototype.

### Decision
- Firebase planned for authentication and database.
- Alternative solutions will be evaluated before final execution.
- No backend will be built before grant application.

### Consequences
- Avoids premature technology lock-in.
- Focus remains on prototype quality first.

### Date
2025-04-28

---

## ADR-007: Hosting Migration Strategy Post-Prototype

### Status
Accepted

### Context
GitHub Pages is sufficient for prototype deployment but unsuitable for production (public repo limitation).

### Decision
- Move to a private hosting solution (Firebase Hosting, Vercel, or similar) after the grant application.
- Hosting choice will be bundled with backend decision to ensure ecosystem consistency.

### Consequences
- Cohesive hosting and backend architecture.
- Cleaner deployment pipelines later.

### Date
2025-04-28

---

## ADR-008: Documentation and Project Management

### Status
Accepted

### Context
Managing human+AI collaboration at a high professional standard requires strict documentation practices.

### Decision
- Formal documentation includes:
  - `project-requirements.md` (product requirements)
  - `architecture-decision-record.md` (technical decisions)
  - `project-collaboration-guidelines.md` (working protocols)
- Only the **most recent** version of documents is considered valid.
- If conflicts exist between older and newer instructions, the **latest Lock In decision** overrides.
- "Lock in decision: XYZ" is the **only accepted phrasing** to formally finalize a decision.

### Consequences
- Ultra-clear project state at all times.
- Zero ambiguity across multiple sessions and contributors.

### Date
2025-04-28

---
## ADR-009: Image Preloading Strategy

### Status
Accepted

### Context
OrganIQ relies on consistent, visually engaging image assets across all screens, including memory exercises, UI icons, and success animations. During early testing, image load delays negatively impacted perceived quality. A balanced image preloading strategy was needed to ensure a smooth user experience without wasting bandwidth or introducing unnecessary complexity.

### Decision
- **Critical UI images** (icons, memory card backs) are preloaded using `<link rel="preload">` tags in `index.html`.
- **All other images** (e.g. memory card fronts, topic-specific exercise visuals) remain in `/public/images/...` and are **not** preloaded via `<head>`.
- Instead, components dynamically preload images using `new Image().src = ...` immediately upon mounting, warming up the cache before user interaction.
- The `src/assets/images/` folder was deprecated in favor of `public/images/` to allow predictable URL-based access and direct preloading.
- No image imports are used in components; all image paths are resolved as static URLs.

### Consequences
- ✅ Smooth, delay-free transitions for memory cards and visual elements
- ✅ No unnecessary preloads for unused lessons or exercises
- ✅ Full control over when and how each image is cached
- ✅ Compatible with browser caching and DevTools inspection
- ⚠️ Vite’s asset pipeline is bypassed for these images, so compression must be handled manually if needed

### Date
2025-04-29
