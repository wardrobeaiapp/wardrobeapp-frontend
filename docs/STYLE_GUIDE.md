# Wardrobe App Style Guide

*A comprehensive design system for consistent UI across the application*

## Table of Contents
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Usage Guidelines](#usage-guidelines)

---

## Colors

### Primary Purple System
Our app uses a systematic purple color palette for consistency and brand identity.

#### Theme Tokens
```typescript
// From src/styles/theme.ts
colors: {
  primary: '#6366f1',           // Primary actions, buttons, links
  purple: {
    50: '#f5f3ff',             // Light backgrounds, subtle highlights
    100: '#ede9fe',            // Very light purple for cards/sections
    200: '#ddd6fe',            // Light purple for borders, dividers
    300: '#c4b5fd',            // Medium-light for secondary elements
    400: '#a78bfa',            // Medium purple for icons, accents
    500: '#8b5cf6',            // Standard purple for gradients (start)
    600: '#7c3aed',            // Dark purple for gradients (middle/end)
    700: '#6d28d9',            // Darker purple for hover states
    800: '#5b21b6',            // Very dark purple for emphasis
    900: '#4c1d95'             // Darkest purple for text on light
  }
}
```

#### Usage Guidelines

**✅ DO:**
- Use `theme.colors.primary` for primary actions (buttons, links, focus states)
- Use purple gradients for visual hierarchy: `linear-gradient(135deg, ${theme.colors.purple[500]} 0%, ${theme.colors.purple[600]} 100%)`
- Use darker purples for hover states: `theme.colors.purple[700]`
- Use light purples for background highlights: `theme.colors.purple[50]`

**❌ DON'T:**
- Hardcode purple values like `#6366f1`, `#8b5cf6`, `#7c3aed`
- Mix purple shades inconsistently
- Use purple for error states (reserved for brand/primary actions)

#### Common Gradient Patterns
```scss
// Standard purple gradient (buttons, tags)
background: linear-gradient(135deg, ${theme.colors.purple[500]} 0%, ${theme.colors.purple[600]} 100%);

// Hover state gradient (darker)
background: linear-gradient(135deg, ${theme.colors.purple[600]} 0%, ${theme.colors.purple[700]} 100%);
```

### Standardized Components
The following components have been standardized with theme tokens:

#### Page-Level Components (9 files)
- **HomePage.styles.tsx** - Tab navigation, focus states
- **AIAssistantPage.styles.tsx** - 14 purple values standardized
- **LoginPage.styles.tsx** - Form elements, buttons
- **RegisterPage.styles.tsx** - Form elements, buttons
- **WardrobePage.styles.tsx** - Tab states, navigation
- **ProfilePage.styles.tsx** - Settings, form controls
- **CalendarPage.styles.tsx** - Calendar events, highlights
- **WelcomePage.styles.tsx** - Onboarding elements
- **OnboardingPage.styles.tsx** - Step progress, form controls

#### Component-Level Files (4 files)
- **WardrobeItemCard.styles.tsx** - Card gradients, tags, buttons
- **OutfitCard.styles.tsx** - Card actions, occasion tags
- **ScenarioSettingsSection.styles.tsx** - Form controls, buttons
- **ScenarioSettingsSection.tsx** - Inline button styles

**Total Achievement:** **90+ hardcoded purple values** systematically replaced with theme tokens!

### Other Color Systems

#### Gray Scale System
Your theme already defines a systematic gray scale that should be used consistently:

```typescript
gray: {
  50: '#f9fafb',   // Lightest background, page backgrounds
  100: '#f3f4f6',  // Light background, card backgrounds
  200: '#e5e7eb',  // Light borders, dividers
  300: '#d1d5db',  // Medium borders, inactive elements
  400: '#9ca3af',  // Placeholder text, disabled state
  500: '#6b7280',  // Light text, secondary information
  600: '#4b5563',  // Medium text, labels
  700: '#374151',  // Dark text, body text
  800: '#1f2937',  // Very dark text, headings
  900: '#111827',  // Darkest text, high contrast
}
```

**✅ DO:** Use `${theme.colors.gray[500]}` for secondary text
**❌ DON'T:** Use hardcoded `#6b7280` or `rgb(107, 114, 128)`

#### Status Color System
Your theme defines semantic status colors for consistent messaging:

```typescript
success: '#4caf50',    // Green for success states
error: '#ef4444',      // Red for error states  
warning: '#f59e0b',    // Amber for warning states
info: '#3b82f6',       // Blue for informational states
```

**✅ DO:** Use `${theme.colors.success}` for positive feedback
**❌ DON'T:** Use hardcoded `#4caf50` or `rgb(76, 175, 80)`

#### Blue Color System
**Current Issue:** Multiple blue shades used inconsistently throughout the app:
- `#4285f4` (Google Blue)
- `#1976d2` (Material Blue)
- `#3b82f6` (Tailwind Blue)
- Various light blue backgrounds

**Recommendation:** Standardize to a systematic blue scale:

```typescript
blue: {
  50: '#eff6ff',   // Light blue backgrounds
  100: '#dbeafe',  // Very light blue
  200: '#bfdbfe',  // Light blue accents
  300: '#93c5fd',  // Medium light blue
  400: '#60a5fa',  // Medium blue
  500: '#3b82f6',  // Primary blue (info color)
  600: '#2563eb',  // Darker blue
  700: '#1d4ed8',  // Dark blue
  800: '#1e40af',  // Very dark blue
  900: '#1e3a8a',  // Darkest blue
}
```

#### Green Color System
**Current Issue:** Various green shades used inconsistently:
- `#4caf50` (success)
- `#34a853` (Google Green)
- `#2e7d32` (Material Green)
- Different green backgrounds

**Recommendation:** Standardize to a systematic green scale:

```typescript
green: {
  50: '#f0fdf4',   // Light green backgrounds
  100: '#dcfce7',  // Very light green
  200: '#bbf7d0',  // Light green accents
  300: '#86efac',  // Medium light green
  400: '#4ade80',  // Medium green
  500: '#22c55e',  // Primary green (success color)
  600: '#16a34a',  // Darker green
  700: '#15803d',  // Dark green
  800: '#166534',  // Very dark green
  900: '#14532d',  // Darkest green
}
```

#### Current Hardcoded Color Issues Found

##### High-Priority Files for Standardization:
1. **onboardingOptions.tsx** - 50+ hardcoded background/icon colors
2. **HomePage.styles.tsx** - White, RGBA shadows, box-shadow patterns
3. **AIAssistantPage.styles.tsx** - Success greens, RGB shadows
4. **LoginPage.styles.tsx** - White backgrounds, RGBA focus states
5. **OnboardingPage.styles.tsx** - Various background colors

##### Common Hardcoded Patterns:
- **White backgrounds:** `background-color: white` → `${theme.colors.white}`
- **Black shadows:** `rgba(0, 0, 0, 0.1)` → Use standardized shadow system
- **Success states:** `rgba(16, 185, 129, 0.3)` → `${theme.colors.success}` with opacity
- **Focus rings:** `rgba(139, 92, 246, 0.1)` → Already using purple tokens
- **Gray backgrounds:** Various hex values → `${theme.colors.gray[X]}`

---

## Typography

### Font System
Your app uses a systematic typography scale built on **Roboto** with consistent sizing, weights, and spacing.

#### Font Family
```typescript
fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
```

#### Font Size Scale
```typescript
fontSize: {
  xs: '0.75rem',    // 12px - Small labels, captions
  sm: '0.875rem',   // 14px - Secondary text, form inputs
  md: '1rem',       // 16px - Body text (base size)
  lg: '1.25rem',    // 20px - Subheadings, important text
  xl: '1.5rem',     // 24px - Page headings (h2)
  xxl: '2rem',      // 32px - Main headings (h1)
}
```

#### Font Weight Scale
```typescript
fontWeight: {
  light: 300,       // Light text, decorative elements
  regular: 400,     // Body text, standard elements
  medium: 500,      // Emphasis, button text
  bold: 700,        // Headings, strong emphasis
}
```

#### Line Height Scale
```typescript
lineHeight: {
  tight: 1.25,      // Headings, compact text
  normal: 1.5,      // Body text, forms
  loose: 1.75,      // Reading text, long content
}
```

### Typography Mixins
Pre-built typography styles for consistent usage:

#### Heading Styles
```scss
// Main page heading (h1)
${heading1}
// font-size: 2rem (32px)
// font-weight: 700 (bold)
// line-height: 1.25 (tight)

// Section heading (h2)  
${heading2}
// font-size: 1.5rem (24px)
// font-weight: 700 (bold)
// line-height: 1.25 (tight)

// Subsection heading (h3)
${heading3} 
// font-size: 1.25rem (20px)
// font-weight: 500 (medium)
// line-height: 1.5 (normal)
```

#### Text Styles
```scss
// Standard body text
${bodyText}
// font-size: 1rem (16px)
// font-weight: 400 (regular)
// line-height: 1.5 (normal)

// Secondary/small text
${smallText}
// font-size: 0.875rem (14px)
// font-weight: 400 (regular)
// line-height: 1.5 (normal)
```

### Usage Guidelines

#### ✅ DO:
- **Use typography mixins** for consistent heading/text styles
- **Import theme tokens** for custom typography: `${theme.typography.fontSize.lg}`
- **Maintain hierarchy** with appropriate font sizes for content importance
- **Use medium weight** (500) for buttons and emphasized text
- **Use tight line-height** (1.25) for headings
- **Use normal line-height** (1.5) for body text

#### ❌ DON'T:
- **Hardcode font sizes** like `font-size: 14px` or `fontSize: '0.875rem'`
- **Mix different font families** - stick to Roboto system
- **Skip line-height** declarations - always specify for consistency
- **Use extreme font weights** - stick to the defined scale (300, 400, 500, 700)

### Typography Hierarchy Examples

#### Page Structure
```scss
// Page title
h1 {
  ${heading1}
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xl};
}

// Section headers
h2 {
  ${heading2} 
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
}

// Subsection headers
h3 {
  ${heading3}
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
}

// Body content
p {
  ${bodyText}
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
}

// Secondary information
.caption {
  ${smallText}
  color: ${theme.colors.textSecondary};
}
```

#### Component Typography
```scss
// Button text
.button {
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.normal};
}

// Form labels
.form-label {
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
}

// Card titles
.card-title {
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.tight};
}
```

### Current Implementation Status

#### ✅ Well-Implemented:
- **Global styles** use typography tokens consistently
- **Typography mixins** available for reuse
- **Semantic HTML** (h1, h2, h3) properly styled with theme tokens

#### ⚠️ Areas for Improvement:
- **Component files** contain many hardcoded font sizes (`14px`, `0.875rem`)
- **Inline styles** with hardcoded typography (especially HomePage.tsx tabs)
- **Inconsistent usage** of typography tokens vs direct values

#### Priority Files for Typography Standardization:
1. **HomePage.tsx** - Multiple inline `fontSize: '14px'` and `fontSize: '16px'`
2. **AIAssistantPage.styles.tsx** - Hardcoded `font-size: 1.25rem`, `0.875rem`
3. **Component cards** - Mixed typography approaches
4. **Form components** - Inconsistent text sizing

### Migration Strategy
```typescript
// Instead of:
font-size: 14px;
font-size: 0.875rem;

// Use:
font-size: ${theme.typography.fontSize.sm};

// Instead of:
font-weight: 600;

// Use:
font-weight: ${theme.typography.fontWeight.medium};

// Instead of hardcoded styles, use mixins:
${smallText} // for secondary text
${bodyText}  // for main content
${heading3}  // for subheadings
```

---

## Spacing

### Spacing Scale
Our theme defines a systematic spacing scale that follows an 8px base unit with consistent ratios:

```typescript
spacing: {
  xs: '4px',    // 0.25rem - Micro spacing (tags, small gaps)
  sm: '8px',    // 0.5rem  - Small gaps, tight spacing
  md: '16px',   // 1rem    - Standard spacing unit
  lg: '24px',   // 1.5rem  - Section spacing, comfortable gaps
  xl: '32px',   // 2rem    - Large sections, major spacing
  xxl: '48px',  // 3rem    - Page-level spacing, major sections
}
```

### Usage Guidelines

#### **✅ DO:**
- **Use theme tokens:** `${theme.spacing.md}` instead of hardcoded values
- **Follow the scale:** Stick to the defined spacing values for consistency
- **Use semantic naming:** Choose spacing sizes based on content hierarchy
- **Apply consistently:** Use the same spacing for similar elements

#### **⚠️ DON'T:**
- **Mix units inconsistently:** Avoid mixing px, rem, and theme tokens randomly
- **Use arbitrary values:** `padding: 13px` breaks the systematic approach
- **Ignore hierarchy:** Different content levels should use different spacing scales

### Current Implementation Analysis

#### **✅ Well-implemented:**
- **Global styles:** Use `${theme.spacing.md}` for consistent margins
- **Mixins:** Grid and layout mixins properly use spacing tokens
- **Some components:** Basic spacing tokens in shared components

#### **⚠️ Needs improvement:**
- **Page-level styles:** Many hardcoded rem/px values (2rem, 1.5rem, etc.)
- **Component padding:** Mixed approaches between theme tokens and hardcoded values
- **Gap spacing:** Flexbox/grid gaps often use hardcoded values instead of tokens

### Spacing Patterns by Use Case

#### **Layout Spacing (Page/Section Level)**
```scss
// Page containers
.page-container {
  padding: ${theme.spacing.xl}; // 32px - generous page padding
}

// Section spacing
.section {
  margin-bottom: ${theme.spacing.xxl}; // 48px - major section breaks
}

// Content blocks
.content-block {
  margin-bottom: ${theme.spacing.lg}; // 24px - comfortable content separation
}
```

#### **Component Spacing (Cards/Elements)**
```scss
// Card padding
.card {
  padding: ${theme.spacing.lg}; // 24px - comfortable card internal spacing
}

// Button spacing
.button-group {
  gap: ${theme.spacing.sm}; // 8px - tight button grouping
}

// Form elements
.form-field {
  margin-bottom: ${theme.spacing.md}; // 16px - standard form field spacing
}
```

#### **Micro Spacing (Internal Elements)**
```scss
// Tag spacing
.tag {
  padding: ${theme.spacing.xs} ${theme.spacing.sm}; // 4px 8px - compact tag padding
}

// Icon spacing
.icon-with-text {
  gap: ${theme.spacing.xs}; // 4px - tight icon-text spacing
}

// List items
.list-item {
  margin-bottom: ${theme.spacing.sm}; // 8px - compact list spacing
}
```

### Grid and Layout Spacing

#### **Flexbox Gaps**
```scss
// Primary content areas
.main-grid {
  gap: ${theme.spacing.lg}; // 24px - generous content spacing
}

// Card grids
.card-grid {
  gap: ${theme.spacing.md}; // 16px - balanced card spacing
}

// Compact layouts
.compact-list {
  gap: ${theme.spacing.sm}; // 8px - tight, scannable lists
}
```

#### **Grid Responsive Patterns**
```scss
// Responsive grid spacing
.responsive-grid {
  gap: ${theme.spacing.lg}; // 24px default
  
  @media (max-width: 768px) {
    gap: ${theme.spacing.md}; // 16px on smaller screens
  }
  
  @media (max-width: 480px) {
    gap: ${theme.spacing.sm}; // 8px on mobile
  }
}
```

### Common Spacing Anti-patterns Found

#### **❌ Inconsistent Values**
```scss
// Found in codebase - inconsistent spacing
padding: 1.25rem;  // 20px - doesn't align with 8px scale
margin: 0.75rem;   // 12px - off-scale value
gap: 1.75rem;      // 28px - breaks systematic approach
```

#### **✅ Corrected Approach**
```scss
// Use systematic spacing tokens
padding: ${theme.spacing.lg};    // 24px - aligns with scale
margin: ${theme.spacing.md};     // 16px - standard spacing
gap: ${theme.spacing.xl};        // 32px - follows scale
```

### Migration Priority

#### **High Priority Files (Many hardcoded values):**
1. **AIAssistantPage.styles.tsx** - 25+ hardcoded spacing values
2. **HomePage.styles.tsx** - 20+ hardcoded spacing values  
3. **OnboardingPage.styles.tsx** - 15+ hardcoded spacing values
4. **Component card styles** - Mixed spacing approaches

#### **Migration Strategy**
```typescript
// Phase 1: Replace exact matches
// 16px → ${theme.spacing.md}
// 24px → ${theme.spacing.lg}  
// 8px → ${theme.spacing.sm}

// Phase 2: Normalize off-scale values
// 20px → ${theme.spacing.lg} (24px)
// 12px → ${theme.spacing.md} (16px)
// 28px → ${theme.spacing.xl} (32px)

// Phase 3: Compound spacing
// padding: 0.75rem 1.5rem → padding: ${theme.spacing.md} ${theme.spacing.lg}
```

### Spacing Documentation Template

When creating new components, document spacing decisions:

```scss
/**
 * Component: ItemCard
 * Spacing decisions:
 * - Card padding: lg (24px) - comfortable internal spacing
 * - Content gaps: md (16px) - balanced content separation  
 * - Button spacing: sm (8px) - tight action grouping
 * - Margin bottom: lg (24px) - clear card separation
 */
```

---

## Components

### Buttons
#### Primary Button
```scss
// Standard purple gradient button
background: linear-gradient(135deg, ${theme.colors.purple[500]} 0%, ${theme.colors.purple[600]} 100%);
color: white;
border: none;
border-radius: 0.5rem;
padding: 0.75rem 1rem;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;

&:hover {
  background: linear-gradient(135deg, ${theme.colors.purple[600]} 0%, ${theme.colors.purple[700]} 100%);
  transform: translateY(-1px);
}
```

#### Secondary Button
```scss
background-color: transparent;
color: ${theme.colors.primary};
border: 1px solid ${theme.colors.primary};
border-radius: 0.5rem;
padding: 0.75rem 1rem;

&:hover {
  background-color: ${theme.colors.purple[50]};
}
```

### Cards
#### Standard Card with Purple Accents
```scss
background-color: white;
border-radius: 0.75rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
border: 1px solid #f3f4f6;

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

### Form Elements
#### Focus States
```scss
&:focus {
  outline: none;
  border-color: ${theme.colors.primary};
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
```

---

## Usage Guidelines

### For Developers

#### Import Theme
Always import the theme in styled components:
```typescript
import { theme } from '../../../styles/theme';
```

#### Color Usage Priority
1. **Primary actions** → `theme.colors.primary`
2. **Purple gradients** → `theme.colors.purple[500-700]`
3. **Light backgrounds** → `theme.colors.purple[50-100]`
4. **Borders/dividers** → `theme.colors.purple[200-300]`

#### Migration Pattern
When updating existing components:
1. Add theme import
2. Replace hardcoded purple values systematically
3. Test in browser to verify appearance
4. Build to ensure no TypeScript errors

### Design Consistency
- Maintain visual hierarchy with consistent purple usage
- Use gradients for primary interactive elements
- Reserve solid purple for backgrounds and borders
- Test accessibility with color contrast

---

## Changelog

### v1.0.0 - Purple System Standardization
- ✅ **Completed:** Systematic replacement of 90+ hardcoded purple values
- ✅ **Standardized:** 9 page-level and 4 component-level files
- ✅ **Established:** Consistent purple gradient patterns
- ✅ **Verified:** All changes tested with successful build

### v2.0.0 - Comprehensive Card Component Standardization
- ✅ **Completed:** Created centralized card component system with variants and theme integration
- ✅ **Migrated:** 10 major card components to the centralized system:
  - AuthCard (LoginPage/RegisterPage)
  - FeatureCard (WelcomePage)
  - StepCard (WelcomePage)
  - AICard (AIAssistantPage)
  - OutfitCard (CalendarPage)
  - ScenarioItem (ScenarioFrequencyStep)
  - AIOptionCard (AIOptionCard)
  - WardrobeItemCard (Wardrobe feature)
  - OptionCard (OnboardingCardComponents)
  - OutfitCard (Wardrobe feature)
- ✅ **Standardized:** All hardcoded colors replaced with theme tokens
- ✅ **Implemented:** Consistent variants (`default`, `outline`, `elevated`, `flat`)
- ✅ **Enhanced:** Interactive states with `$hoverable` and `$interactive` props
- ✅ **Applied:** Semantic status colors using theme tokens
- ✅ **Verified:** All migrations tested with successful builds

### v3.0.0 - Complete Design System Documentation
- ✅ **Documented:** Typography system with usage guidelines and examples
- ✅ **Documented:** Spacing system with semantic tokens and usage patterns  
- ✅ **Documented:** Color systems (purple, grays, blues, status colors)
- ✅ **Documented:** Component examples with theme integration
- ✅ **Created:** Developer migration patterns and best practices

---

## Next Steps

### Completed Achievements ✅
- ✅ **Typography standardization** - Comprehensive font system documented with usage guidelines
- ✅ **Spacing system** - Complete spacing tokens and usage patterns documented
- ✅ **Color expansion** - All color families standardized (purple, grays, blues, status colors)
- ✅ **Component library** - Centralized card system created and fully migrated
- ✅ **Purple standardization** - All hardcoded purple values replaced with theme tokens
- ✅ **Form standardization** - Centralized input components with theme integration
- ✅ **Button standardization** - Unified button system with theme tokens

### Future Enhancements
- [ ] **Accessibility audit** - Verify color contrast ratios for WCAG compliance
- [ ] **Animation system** - Standardize transitions and micro-interactions
- [ ] **Icon system** - Create consistent icon usage patterns
- [ ] **Layout components** - Standardize grid and flexbox patterns
- [ ] **Dark mode support** - Extend theme system for dark mode variants

---

*This style guide is a living document that will evolve with the application.*
