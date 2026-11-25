---
name: Executive Talent Matrix
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#485f83'
  primary: '#00142f'
  on-primary: '#ffffff'
  primary-container: '#0f294a'
  on-primary-container: '#7a91b7'
  inverse-primary: '#b0c8f1'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301e'
  on-tertiary-container: '#00a472'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b0c8f1'
  on-primary-fixed: '#001b3b'
  on-primary-fixed-variant: '#30476a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system reflects a balanced corporate aesthetic: authoritative yet human, structured yet fluid. Engineered to support both a public-facing collaborator directory and an internal HR administration dashboard, the visual language establishes credibility, precision, and operational clarity.

- **Brand Personality**: Trustworthy, institutional, organized, proactive, and accessible.
- **Target Audience**: External partners seeking department contacts, enterprise leadership, and HR administrators managing talent lifecycle records.
- **Visual Style**: Clean Modern Corporate with functional elevation. It uses refined line hierarchy, disciplined spacing rhythms, and high-readability typography, avoiding decorative clutter to keep focus on key communication actions (direct WhatsApp outreach, email routing, and employment status auditing).

## Colors
The palette leverages deep navy tones for structural anchor points and contrast, paired with crisp semantic indicators for immediate status verification.

- **Primary (`#0F294A`)**: Used for core navigational frames, primary calls to action, prominent headers, and high-contrast typography.
- **Secondary (`#3B82F6`)**: Applied to interactive states, active link filters, primary iconography, and quick-contact highlights.
- **Semantic Status Signals**:
  - **Active / Available (`#10B981`)**: Emerald tone paired with a 10% opacity tint background for current active personnel badges.
  - **On Leave / Vacation (`#F59E0B`)**: Warm amber utilized for temporary leave indicators and schedule warnings.
  - **Terminated / Inactive (`#EF4444`)**: Crisp crimson applied to archived, offboarded, or terminated records.
- **Surfaces & Neutrals**:
  - Canvas Background: `#F8FAFC`
  - Elevated Container / Card Surface: `#FFFFFF`
  - Subtle Border / Divider: `#E2E8F0`
  - Body Text: `#1E293B`
  - Muted Labels / Supporting Meta: `#64748B`

## Typography
The system couples Plus Jakarta Sans for titles and section breaks with Inter for data grids, metadata blocks, and form interactions.

- **Plus Jakarta Sans**: Provides modern authority in card titles, employee names, modal headers, and key administrative stats.
- **Inter**: Handles tabular figures, contact details, status pill text, and functional form inputs with neutral optical balance.
- **Numeric Clarity**: Numerical indicators (phone numbers, employee IDs, dates) use Inter with tabular figures (`tnum`) enabled to ensure clean vertical alignment across table layouts.

## Layout & Spacing
The layout operates on a standard 12-column responsive fluid grid with strict breakpoint behaviors.

- **Desktop (1200px+)**: 12-column grid, `margin: 2rem`, `gutter: 1.5rem`. Public directory displays a 3-column or 4-column collaborator card structure. Administrative panel incorporates a fixed 260px navigation sidebar with a dynamic data workarea.
- **Tablet (768px - 1199px)**: 8-column grid, `margin: 1.5rem`, `gutter: 1rem`. Cards adjust to a 2-column format. Side navigation collapses into an icon-rail or top drawer.
- **Mobile (< 768px)**: 4-column grid, `margin: 1rem`, `gutter: 1rem`. Collaborator profiles stack into a single column with horizontal quick-action buttons for email and WhatsApp at the card base.
- **Component Padding Scale**:
  - Cards and Modals: `space-lg` (1.5rem) internal padding.
  - Form Fields and Filter Chips: `space-sm` (0.5rem) vertical by `space-md` (1rem) horizontal padding.
  - Action Bars & Table Rows: `space-md` (1rem) block padding.

## Elevation & Depth
Depth is created through soft ambient shadows and low-contrast surface outlines rather than dramatic vertical shifts.

- **Level 0 (Flat / Canvas)**: Base background `#F8FAFC` without shadow. Used for administrative main content backdrops and panel gutters.
- **Level 1 (Cards & Data Tables)**: Surface `#FFFFFF` bordered by a 1px stroke of `#E2E8F0` and an ambient shadow of `0 1px 3px 0 rgba(15, 41, 74, 0.05), 0 1px 2px -1px rgba(15, 41, 74, 0.03)`.
- **Level 2 (Hover State / Popovers)**: Collaborator cards lift on interaction to shadow `0 10px 15px -3px rgba(15, 41, 74, 0.08), 0 4px 6px -4px rgba(15, 41, 74, 0.03)` with a subtle primary border transition to `#3B82F6`.
- **Level 3 (Modals & Administrative Drawers)**: Floating administrative detail panels employ `0 20px 25px -5px rgba(15, 41, 74, 0.12), 0 8px 10px -6px rgba(15, 41, 74, 0.05)` layered over a 40% opacity `#0F294A` backdrop scrim.

## Shapes
A clean, soft geometry is applied throughout the system to maintain professional rigor while remaining approachable.

- **Base Radius (`0.25rem` / 4px)**: Checkboxes, table cell badges, input fields, and compact administrative tags.
- **Container Radius (`rounded-lg` / `0.5rem` / 8px)**: Collaborator directory cards, standard buttons, dropdown menus, and search bars.
- **Modal & Large Surfaces (`rounded-xl` / `0.75rem` / 12px)**: Central dialogs, drawer corners, and highlighted metric summary modules.
- **Avatars & Status Dots**: Retain complete circular symmetry (`rounded-full`) for profile photos and status pulse indicators.

## Components

### Collaborator Cards
- **Structure**: White card background, 1px `#E2E8F0` border, `0.5rem` radius, `1.5rem` padding.
- **Header**: Top row with circular profile avatar (56px desktop, 48px mobile), collaborator full name in `headline-sm`, corporate role in `body-sm` (`#64748B`), and an absolute-positioned status chip in the top right.
- **Body**: Secondary metadata grid showing department, location, and internal ID in `body-sm`.
- **Footer / Direct Actions**: Split dual-button layout for quick communication:
  - **WhatsApp**: Neutral outlined button with emerald accent icon, triggering a direct API link.
  - **Email**: Primary filled or light-tint button (`#EFF6FF` background, `#1D4ED8` text) triggering direct client mail draft.

### Status Chips (Pills)
- Text formatted in `label-sm` with uppercase tracking.
- **Active**: Text `#065F46`, background `#D1FAE5`, paired with an emerald 6px status circle dot.
- **On Vacation**: Text `#92400E`, background `#FEF3C7`, paired with an amber 6px dot.
- **Terminated**: Text `#991B1B`, background `#FEE2E2`, paired with a neutral slate or red dot.

### Buttons & Quick Actions
- **Primary**: Solid background `#0F294A`, text `#FFFFFF`, hover `#1E3A8A`, padding `0.5rem 1rem`, radius `0.5rem`.
- **Secondary**: Transparent background, border 1px solid `#CBD5E1`, text `#1E293B`, hover `#F1F5F9`.
- **WhatsApp Action**: Background `#ECFDF5`, border 1px solid `#A7F3D0`, text `#065F46`, hover background `#D1FAE5`.

### Input Fields & Search Bars
- Standard text input: 40px height, 1px `#CBD5E1` border, `#FFFFFF` background, font `body-md`. Focus state uses a 1px border `#3B82F6` accompanied by a 3px ring of `#3B82F6` at 20% opacity.
- Public Search Bar: 48px height with leading icon slot, integrated department filter dropdown, and live clearance trigger.

### Administrative Data Tables
- Header row with `#F8FAFC` background, 1px `#E2E8F0` bottom border, column labels set in `label-sm` with text `#64748B`.
- Content rows padded at `0.75rem 1rem`, hover effect with `#F1F5F9`, featuring bulk selection checkboxes, inline status editing, and a context action trigger (`...`).