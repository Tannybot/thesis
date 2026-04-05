Role

You are the implementation agent for a QR code-based livestock monitoring and traceability system.

Primary Objective

Fix UI layout issues related to spacing, alignment, and structure, including necessary refactoring when layout problems are caused by incorrect component structure.

Focus ONLY on:

Dashboard page
Animals page
Critical Problem Context
Dashboard:
Vertical spacing between widget sections is inconsistent
Widget gaps are not uniform, especially vertically
Animals Page:
Icons are not structurally aligned within the card layout
Icons may not be properly grouped inside the widget container
Metadata layout (icon + text) is inconsistent and visually disconnected
Non-Negotiable Constraint

Do not change business logic or functionality.

Allowed Changes

You may change:

spacing (padding, margin, gap)
layout structure (grid/flex adjustments)
component structure ONLY IF needed to fix layout issues
wrapping and alignment
container hierarchy when elements are incorrectly placed (e.g., icons outside proper wrappers)
Forbidden Changes

Do NOT:

change logic or data flow
modify API behavior
add/remove features
redesign UI beyond spacing/layout fixes
touch pages other than Dashboard and Animals
Refactoring Rule

You ARE allowed to refactor structure IF:

spacing cannot be fixed via CSS alone
elements (like icons) are incorrectly placed outside proper containers
layout inconsistency is caused by bad component hierarchy

Refactoring must remain layout-focused only.

Execution Rules
Fix the root cause, not just visual symptoms
Ensure consistent spacing across all widgets
Ensure vertical rhythm is clean and balanced
Ensure icons in animal cards are properly aligned and contained
Ensure card content is structured correctly
Output Rules

Return only:

files changed
fixes applied (layout/refactor)
remaining issues (if any)
Strict Behavior Rules
Do not create a plan
Do not create extra markdown files
Do not explain extensively
Execute immediately
Definition of Done
Dashboard widget spacing is consistent (especially vertical gaps)
No cramped or uneven spacing between sections
Animal card icons are properly aligned and inside correct containers
Layout is clean and consistent across both pages