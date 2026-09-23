# Shared-Drawing Remix + Brand Attribution

**Product Requirements Document: New Feature**

- **Feature name:** Shared-Drawing Remix + Brand Attribution
- **Owner:** Antonin, Andres, Ahsan
- **Date:** September 15, 2026 — Revised September 18, 2026 (v2, after second client meeting)

**Revision note (v2):** After the team presented three options to Stefano in a second client meeting, he chose Remix + a shared-view footer as the priority feature over static export attribution (our v1 direction) — it's the only mechanism that's trackable end-to-end (view → remix → re-share), which directly serves his core KPI. This PRD has been revised accordingly. Export-filename branding is retained as a secondary, non-blocking enhancement; the referral program remains out of scope for this sprint (Phase 2), unchanged from v1.

---

## 1. PROBLEM

When someone opens a shared Excalidraw drawing and builds on it, there's currently no way to trace that back to Excalidraw or measure it happening. The viewer has no signal of where the drawing came from, and the team has no visibility into how often a shared drawing turns into a new user. Excalidraw is losing a repeatable, measurable growth loop simply because nothing marks or tracks this hand-off.

### 1a. Background & Dependencies

- **Related doc:** Head of Marketing client brief, Week 3 Monday debrief, and the Week 3 second client meeting recap (Antonin).
- **Legacy constraint:** Excalidraw's shared-link view has no attribution and no way for a viewer to create their own editable copy — confirmed via a review of the codebase that this is genuinely new logic, not a toggle on existing functionality.
- **Dependency:** Excalidraw's product roadmap includes an in-progress initiative to reduce vendor lock-in on exports; the client has agreed to raise this with the product team. Not a blocker for this feature, and largely orthogonal since this work lives in the share/view flow rather than the export flow.
- **Dependency:** Exact tracking/instrumentation approach (the client referenced a Meta Pixel-style event model) still needs technical validation during build.

### 1b. Target Use Cases

- As a person who opens a shared Excalidraw drawing, I want to see where it came from and make my own copy with one click so that I can build on it without signing up.
- As Stefano (Head of Marketing), I want to track views, remixes, and re-shares of shared drawings so that I can measure organic growth the same way a referral or invite loop would be measured.
- As an Excalidraw user sharing a drawing, I want the attribution to sit outside my artwork, not on top of it, so my drawing is presented exactly as I made it.
- As an Excalidraw user, I want my original drawing to stay untouched when someone remixes it, so my work is never altered by someone else's copy.

### 1c. Current User Journey

1. Alice creates a drawing and shares the link with Bob.
   - → **Problem:** Bob sees only the drawing — nothing tells him it was made with Excalidraw.
2. Bob wants to build on Alice's drawing or reuse part of it.
   - → **Problem:** Bob has no one-click way to get his own editable copy — he has to sign up, recreate it by hand, or never realizes he can use Excalidraw himself.
3. If Bob discovers Excalidraw some other way and creates something of his own, he may share it onward.
   - → **Problem:** None of this — views, copies, re-shares — is currently trackable, so the team has no growth loop to measure or improve.

---

## 2. PROPOSED SOLUTION

When someone opens a shared drawing, we'll show a small footer outside the canvas — "Made with Excalidraw" plus a "Remix" button. Remix gives them their own free, local, editable copy in one click, no signup required, while Alice's original stays untouched. The same interaction is what makes the loop trackable end to end.

**How it works:** Bob opens Alice's shared link and sees the drawing plus a footer beneath it, outside the artwork. Clicking Remix strips the shared link's identity from Alice's scene, creates a fresh copy for Bob to edit and save locally, and logs the event so the team can count views, remixes, and re-shares. Export-filename branding remains available as a secondary, lower-priority enhancement to the same attribution idea.

### 2a. Value Proposition

People who open a shared Excalidraw drawing will now see where it came from and can make their own copy in one click — turning a passive viewer into a potential new user with no signup friction. Unlike today, where a shared drawing is a dead end once viewed, every share becomes a trackable, repeatable growth loop, without altering the original creator's work.

### 2b. Goals & Out-of-Scope

**Goals**

- Turn shared-drawing views into a trackable growth loop — view → remix → re-share — measurable at every stage.
- Give Excalidraw an organic, ad-free growth channel driven by real usage rather than paid acquisition.
- Do this without altering or overshadowing the original creator's drawing — the footer lives outside the canvas, never on top of it.

**Out-of-Scope**

- Free-vs-Plus tiering of the attribution mark — deferred until there's evidence it increases reach before tying it to a paid plan.
- Referral incentive program for inviting friends — client called this a strong model but too large for this sprint; parked as Phase 2.
- Leading with export-filename/PNG-SVG attribution — kept as a secondary, non-blocking enhancement rather than the primary mechanism, since the client was explicit it's harder to tie to his KPI than a trackable click-through loop.

### 2c. Measurable Outcomes

| Metric | How it's measured | Baseline | Target |
| --- | --- | --- | --- |
| Footer view rate | Footer-render event logged each time a shared, non-collaboration drawing is opened | 0% (no tracking exists today) | TBD — pending baseline shared-link traffic |
| Remix click-through rate | Remix-click events ÷ footer views | 0% | TBD |
| Re-share rate (K-factor input) | Re-shares of a remixed copy ÷ remixes completed | 0% | TBD — pending usage data from client |

---

## 3. REQUIREMENTS

### User Journey 1: Recipient opens a shared drawing and remixes it

**Context:** This is the core loop the whole feature depends on — it has to work reliably, feel unobtrusive, and never put Alice's original drawing at risk.

**Sub-journey: Viewing a shared drawing**

- **[P0]** Recipient can open a shared drawing link and see a footer outside the canvas reading "Made with Excalidraw" plus a "Remix" button.
- **[P0]** Footer never overlaps or alters the drawing itself.
- **[P1]** Footer wording matches approved copy exactly — no "open source," no lengthy text, button reads simply "Remix."

**Sub-journey: Remixing**

- **[P0]** Clicking Remix creates the recipient's own free, local, editable copy with no signup required.
- **[P0]** The original drawing (Alice's) is provably untouched after a remix — verified by a test, not just visual inspection.
- **[P2]** The remixed copy opens immediately in edit mode, with no extra confirmation step.
- **[P1]** Remix-click and copy-created events fire reliably so the funnel in Measurable Outcomes can be counted.

### User Journey 2: Stefano (Head of Marketing) validating and measuring the feature

**Context:** Stefano's approval for this direction was secured in the second client meeting; this journey is about measurement fidelity, not sign-off.

**Sub-journey: Reviewing the confirmed direction**

- **[P0]** Stefano has reviewed and approved the Remix + footer concept, including specific wording tweaks (drop "open source," trim length, button reads "Remix") — confirmed in the second client meeting.

**Sub-journey: Measuring results**

- **[P0]** Team can count footer views, remix clicks, and copies created, per the funnel in Measurable Outcomes.
- **[P2]** Team can break down each funnel stage (view, remix, re-share) in a simple report, using a Meta Pixel-style event-tracking approach.

---

## 4. APPENDIX

### Design Decisions

- **Decision:** Prioritize Remix + shared-view footer over static export attribution as the primary mechanism. **Rationale:** it's the only one of the three pitched options that's trackable end-to-end (view → remix → re-share), directly serving Stefano's core KPI — confirmed by the client in the second meeting.
- **Decision:** Build Remix on top of Excalidraw's existing static share-link mechanism (the read-only shared-view link), not live collaboration — confirmed via codebase review that no duplicate/fork function exists today, so this is net-new logic. Scoped to a local, testable demo this sprint, not an upstream merge.
- **Alternative considered:** Leading with export-filename/PNG-SVG attribution as the primary mechanism (our v1 direction). Superseded because the client was explicit it's harder to tie to his KPI than a trackable click-through loop — retained instead as a secondary enhancement.

### Open Questions

- What's the exact tracking/instrumentation approach for the Meta Pixel-style event model Stefano referenced? **Owner:** Team — to be validated during build.
- What is the specific numeric target for each funnel stage (view, remix, re-share)? **Owner:** Team + Client — to be set once usage data is available.
- Does the "reduce vendor lock-in on exports" roadmap item conflict with this feature? **Owner:** Client, in discussion with product — client has indicated he'll advocate for prioritizing this work.
- When (if at all) does this get proposed to Excalidraw's real maintainers for upstream review? **Owner:** Team — out of scope for this sprint's local demo.

### Other links

- **UX Mocks:** Initial attribution-mark visual language reviewed internally (footer bar / corner icon / icon + text); a footer-outside-canvas mockup specific to the Remix flow is in progress.
- **Meeting Notes:** Week 3 Monday client kickoff debrief; Week 3 second client meeting recap (Antonin).
- **Related PRDs:** —
- **Other Resources:** Head of Marketing client brief.