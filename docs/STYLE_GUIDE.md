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

### Button Component System

The Button component is the primary interactive element with comprehensive variants, sizes, and states. Import from `components/common/Button`.

#### Variants

**Primary** - Main actions (Save, Submit, Create)
- Uses brand purple color (#8b5cf6)
- Default variant for primary actions

```tsx
<Button variant="primary">Save Changes</Button>
<Button variant="primary" outlined>Cancel</Button>
```

**Secondary** - Secondary actions
- Gray styling for less prominent actions

```tsx
<Button variant="secondary">Cancel</Button>
<Button variant="secondary" outlined>Reset</Button>
```

**Success** - Success feedback states only
- Green styling (#22c55e)
- Reserved for actual success feedback, not primary actions

```tsx
<Button variant="success">✓ Completed</Button>
```

**Error** - Destructive actions
- Red styling for dangerous operations

```tsx
<Button variant="error">Delete Item</Button>
<Button variant="error" outlined>Remove</Button>
```

**Warning** - Warning states
```tsx
<Button variant="warning">Archive</Button>
```

**Info** - Informational actions
```tsx
<Button variant="info">Learn More</Button>
```

**Ghost** - Minimal styling
```tsx
<Button variant="ghost">Skip</Button>
```

**Link** - Link-style button
```tsx
<Button variant="link">View Details</Button>
```

#### Sizes
- `xs` (24px height), `sm` (32px), `md` (40px - default), `lg` (48px), `xl` (56px)

```tsx
<Button size="lg">Large Button</Button>
```

#### Props & States
```tsx
<Button loading>Saving...</Button>
<Button disabled>Cannot Save</Button>
<Button fullWidth>Full Width Button</Button>
```

#### Usage Guidelines
**✅ Do:**
- Use `variant="primary"` for main actions (Save, Submit, Create)  
- Use `fullWidth` in modals and forms for consistent layout
- Use `variant="success"` only for actual success feedback
- Use appropriate sizes based on context
- Handle loading/disabled states

**❌ Don't:**
- Use `variant="success"` for primary save/submit actions  
- Mix too many variants in the same interface
- Use `variant="link"` for primary actions

#### Common Patterns
**Modal Actions:**
```tsx
<Button variant="secondary" outlined onClick={onCancel}>Cancel</Button>
<Button variant="primary" fullWidth onClick={onSave}>Save Changes</Button>
```

### Form System

The form system provides consistent layout, validation, and interaction patterns. Import from `components/forms/common/`.

#### Form Structure

**FormSection** - Organizes form content into logical sections
```tsx
import { FormSection } from '../components/forms/common/FormSection';

<FormSection 
  title="Basic Information"
  subtitle="Required details for your item"
  layout="double"
  spacing="md"
>
  {/* Form fields */}
</FormSection>
```

**Layout Options:**
- `single` - Single column layout (default)
- `double` - Two-column grid (responsive, collapses on mobile)

**Spacing Options:**
- `sm` - Tight spacing for compact forms
- `md` - Standard spacing (default)
- `lg` - Generous spacing for complex forms

#### Input Components

**FormField** - Wrapper for all form inputs with labels and validation
```tsx
import { FormField, BaseInput, BaseSelect, BaseTextarea } from '../components/forms/common/FormField';

<FormField label="Item Name" required error={errors.name}>
  <BaseInput
    type="text"
    placeholder="Enter item name"
    value={formData.name}
    onChange={(e) => setFormData({...formData, name: e.target.value})}
  />
</FormField>

<FormField label="Category" required>
  <BaseSelect value={formData.category} onChange={handleCategoryChange}>
    <option value="">Select category</option>
    <option value="tops">Tops</option>
    <option value="bottoms">Bottoms</option>
  </BaseSelect>
</FormField>

<FormField label="Notes">
  <BaseTextarea
    placeholder="Additional notes..."
    value={formData.notes}
    onChange={(e) => setFormData({...formData, notes: e.target.value})}
  />
</FormField>
```

#### Form Actions

**FormActions** - Standardized submit/cancel button layout
```tsx
import { FormActions } from '../components/forms/common/FormActions';

<FormActions
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitText="Save Item"
  cancelText="Cancel"
  isSubmitting={isLoading}
  isDisabled={!isValid}
  submitVariant="primary"
  layout="row"
  align="right"
/>
```

**Action Variants:**
- `primary` - Standard save actions (default)
- `secondary` - Less prominent actions  
- `danger` - Destructive actions (delete, remove)

**Layout Options:**
- `row` - Horizontal layout with configurable alignment
- `column` - Vertical stacked layout (mobile-friendly)

#### Validation Patterns

**Field-level validation:**
```tsx
const [errors, setErrors] = useState({});

<FormField label="Email" required error={errors.email}>
  <BaseInput
    type="email"
    value={formData.email}
    onChange={(e) => {
      setFormData({...formData, email: e.target.value});
      if (errors.email) {
        setErrors({...errors, email: ''});
      }
    }}
  />
</FormField>
```

**Form-level validation:**
```tsx
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.name?.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!formData.category) {
    newErrors.category = 'Category is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### Image Upload Patterns

**Image drop zone with preview:**
```tsx
const ImageUploadField = ({ imageUrl, onImageChange }) => (
  <FormField label="Item Image">
    <ImageDropZone
      onDrop={onImageChange}
      imageUrl={imageUrl}
      placeholder="Drop image here or click to upload"
    />
  </FormField>
);
```

#### Usage Guidelines

**✅ Do:**
- Use FormSection to organize complex forms into logical groups
- Always include labels with FormField for accessibility
- Show validation errors immediately on field blur/submit
- Use appropriate input types (email, tel, etc.)
- Provide clear placeholder text
- Use double layout for related fields (name/email, width/height)
- Handle loading/submitting states in FormActions
- Use consistent spacing between form sections

**❌ Don't:**
- Mix form components from different systems
- Skip validation error handling
- Use generic placeholder text like "Enter text"
- Forget to disable submit button during submission
- Make forms too wide on desktop (max-width recommended)
- Skip required field indicators

#### Complete Form Example
```tsx
<form onSubmit={handleSubmit}>
  <FormSection title="Item Details" layout="double">
    <FormField label="Name" required error={errors.name}>
      <BaseInput type="text" value={name} onChange={handleNameChange} />
    </FormField>
    
    <FormField label="Category" required error={errors.category}>
      <BaseSelect value={category} onChange={handleCategoryChange}>
        <option value="">Select category</option>
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </BaseSelect>
    </FormField>
  </FormSection>

  <FormSection title="Additional Information" layout="single">
    <FormField label="Notes">
      <BaseTextarea value={notes} onChange={handleNotesChange} />
    </FormField>
  </FormSection>

  <FormActions
    onSubmit={handleSubmit}
    onCancel={handleCancel}
    isSubmitting={isSubmitting}
    submitText="Save Item"
  />
</form>
```

### Modal System

The modal system provides consistent overlay dialogs with standardized structure and behavior patterns. Modals are organized by feature in `features/[feature]/modals/`.

#### Modal Structure

**Base Modal Components** - Import from `pages/HomePage.styles`
```tsx
import {
  Modal,
  ModalContent, 
  ModalHeader,
  ModalTitle,
  ModalBody,
  CloseButton
} from '../../../pages/HomePage.styles';

<Modal>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <CloseButton onClick={onClose}>&times;</CloseButton>
    </ModalHeader>
    <ModalBody>
      {/* Modal content */}
    </ModalBody>
  </ModalContent>
</Modal>
```

#### Modal Types & Patterns

**Form Modals** - For create/edit operations
```tsx
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen, onClose, onSubmit, initialData, isEditing
}) => {
  if (!isOpen) return null;
  
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <FormComponent
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
```

**Detail/View Modals** - For displaying item details
```tsx
interface DetailModalProps {
  item: Item;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

<Modal>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>{item.name}</ModalTitle>
      <CloseButton onClick={onClose}>&times;</CloseButton>
    </ModalHeader>
    <ModalBody>
      {/* Item details */}
      <ButtonGroup>
        <Button variant="primary" fullWidth onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button variant="secondary" fullWidth onClick={() => onDelete(item.id)}>
          Delete
        </Button>
      </ButtonGroup>
    </ModalBody>
  </ModalContent>
</Modal>
```

**Confirmation Modals** - For destructive actions
```tsx
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

<Modal>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>{title}</ModalTitle>
      <CloseButton onClick={onClose}>&times;</CloseButton>
    </ModalHeader>
    <ModalBody>
      <MessageText>{message}</MessageText>
      <ButtonsContainer>
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant={isDestructive ? "error" : "primary"} 
          fullWidth 
          onClick={onConfirm}
        >
          {confirmText || 'Confirm'}
        </Button>
      </ButtonsContainer>
    </ModalBody>
  </ModalContent>
</Modal>
```

#### Modal Sizing & Behavior

**Standard Sizing:**
- **Small** - 400px max-width for simple confirmations
- **Medium** - 500px max-width for forms (default)
- **Large** - 700px max-width for complex detail views
- **Full width** - 90vw max-width on mobile

**Responsive Behavior:**
```scss
// Default modal content sizing
max-width: 500px;
width: 90vw;
max-height: 90vh;
overflow-y: auto;

@media (max-width: 768px) {
  width: 95vw;
  margin: 1rem;
}
```

#### Button Layout Patterns

**Form Actions** - Right-aligned, Cancel + Primary
```tsx
<ButtonGroup>
  <Button variant="secondary" onClick={onCancel}>Cancel</Button>
  <Button variant="primary" onClick={onSave}>Save Changes</Button>
</ButtonGroup>
```

**Detail Actions** - Full-width stacked buttons  
```tsx
<ButtonGroup>
  <Button variant="primary" fullWidth onClick={onEdit}>Edit</Button>
  <Button variant="secondary" fullWidth onClick={onDelete}>Delete</Button>
</ButtonGroup>
```

**Confirmation Actions** - Full-width side-by-side
```tsx
<ButtonsContainer>
  <Button variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
  <Button variant="error" fullWidth onClick={onConfirm}>Delete</Button>
</ButtonsContainer>
```

#### State Management

**Mounting/Unmounting Protection:**
```tsx
const [isMounted, setIsMounted] = useState(true);

useEffect(() => {
  setIsMounted(true);
  return () => setIsMounted(false);
}, []);

// Prevent state updates after unmount
const handleSubmit = (data) => {
  if (isMounted) {
    onSubmit(data);
  }
};

if (!isOpen || !isMounted) return null;
```

**Loading States:**
```tsx
const [isLoading, setIsLoading] = useState(false);

{isLoading ? (
  <MessageText>Loading...</MessageText>
) : (
  // Modal content
)}
```

#### Usage Guidelines

**✅ Do:**
- Always include a close button (×) in the header
- Use conditional rendering with `if (!isOpen) return null`
- Implement escape key and overlay click to close
- Use appropriate button variants (primary for save, error for delete)
- Include loading states for async operations
- Prevent state updates after component unmount
- Use fullWidth buttons in mobile layouts
- Group related actions together

**❌ Don't:**
- Nest modals (use single modal with content switching instead)
- Use modals for complex multi-step flows (use dedicated pages)
- Forget to handle form validation in form modals
- Use too many buttons in the action area (max 3 recommended)
- Make modals too wide on desktop (maintain readability)
- Skip confirmation for destructive actions

#### Feature Organization

**Wardrobe Modals** - `features/wardrobe/modals/`
- `ItemFormModal.tsx` - Add/edit wardrobe items
- `ItemViewModal.tsx` - View item details
- `CapsuleDetailModal.tsx` - View capsule details  
- `OutfitDetailModal.tsx` - View outfit details
- `DeleteItemConfirmModal.tsx` - Confirm item deletion

**Profile Modals** - `features/profile/modals/`
- `ConfirmationModal.tsx` - Generic confirmations
- `SaveConfirmationModal.tsx` - Save confirmations

## Architecture Guidelines

### Feature-Based Organization

The app follows a feature-based architecture where related functionality is grouped by business domain rather than technical layers. This approach improves maintainability, scalability, and developer experience.

#### Directory Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Loader/
│   │   └── auth/
│   ├── features/         # Feature-specific components
│   │   ├── ai-assistant/
│   │   ├── calendar/
│   │   ├── onboarding/
│   │   ├── profile/
│   │   └── wardrobe/
│   ├── forms/           # Form system components
│   │   ├── common/
│   │   └── styles/
│   ├── layout/          # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Layout/
│   └── cards/           # Generic card components
├── hooks/               # Shared custom hooks
├── services/            # API and data services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Theme tokens and global styles
└── context/             # React context providers
```

#### Feature Structure Pattern

Each feature follows a consistent internal organization:

```
features/[feature-name]/
├── components/          # Feature-specific UI components
├── modals/             # Feature-specific modals
├── forms/              # Feature-specific forms (if complex)
├── hooks/              # Feature-specific hooks
├── services/           # Feature-specific API calls
├── types/              # Feature-specific types (if needed)
├── utils/              # Feature-specific utilities
└── context/            # Feature-specific context (if needed)
```

**Example - Wardrobe Feature:**
```
features/wardrobe/
├── cards/              # WardrobeItemCard, etc.
├── forms/              # WardrobeItemForm + components
├── modals/             # ItemFormModal, ItemViewModal, etc.
├── outfit/             # Outfit-related components
├── capsule/            # Capsule-related components
└── tabs/               # Tab components
```

#### Import Path Conventions

**Feature to Common Components:**
```tsx
// ✅ Correct - Reference common components
import Button from '../../../common/Button';
import { FormField } from '../../../forms/common/FormField';
```

**Feature to Shared Resources:**
```tsx
// ✅ Correct - Reference shared resources
import { WardrobeItem } from '../../../../types';
import { wardrobeService } from '../../../../services/api';
import { useWardrobeItems } from '../../../../hooks/useWardrobeItems';
```

**Internal Feature References:**
```tsx
// ✅ Correct - Reference within same feature
import { ItemFormModal } from './modals/ItemFormModal';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
```

**Cross-Feature References:**
```tsx
// ⚠️ Avoid direct cross-feature imports when possible
// Use shared components or services instead
import { CalendarModal } from '../calendar/modals/CalendarModal'; // Avoid

// ✅ Better - Use shared service or context
import { useCalendarService } from '../../../services/calendarService';
```

#### Component Organization Principles

**1. Single Responsibility**
- Each component should have one clear purpose
- Complex components should be broken into smaller sub-components

**2. Co-location**
- Keep related files together (component + styles + tests)
- Place feature-specific code within the feature directory

**3. Consistent Naming**
- Use descriptive, feature-prefixed names
- Example: `WardrobeItemCard`, `AIRecommendationModal`

**4. Clear Dependencies**
- Minimize cross-feature dependencies
- Use shared services for cross-cutting concerns

#### File Naming Conventions

**Components:**
- PascalCase: `ComponentName.tsx`
- Styled components: `ComponentName.styles.tsx`
- Index files: `index.tsx` (for barrel exports)

**Utilities and Services:**
- camelCase: `formatHelpers.ts`, `apiService.ts`
- Hooks: `useFeatureName.ts`

**Types:**
- PascalCase interfaces: `interface UserProfile {}`
- Centralized in `src/types/index.ts`

#### Migration Strategy

When adding new features or refactoring:

**1. Create Feature Directory**
```bash
mkdir -p src/components/features/new-feature/{components,modals,hooks}
```

**2. Move Related Components**
```bash
# Move feature-specific components
mv src/components/SomeFeatureComponent.tsx src/components/features/new-feature/components/
```

**3. Update Import Paths**
```tsx
// Update all references to the moved component
import { SomeFeatureComponent } from '../features/new-feature/components/SomeFeatureComponent';
```

**4. Organize Subdirectories**
```
new-feature/
├── components/     # Main feature components
├── modals/        # Feature modals
├── forms/         # Complex forms (if needed)
└── utils/         # Feature-specific utilities
```

#### Benefits of This Architecture

**✅ Maintainability**
- Easy to locate feature-related code
- Changes are isolated to feature boundaries
- Clear ownership and responsibility

**✅ Scalability**
- New features can be added without affecting existing ones
- Team members can work on different features independently
- Easier to test and deploy features incrementally

**✅ Developer Experience**
- Intuitive code organization
- Faster navigation and debugging
- Clearer mental model of the application

**✅ Code Reusability**
- Common components are easily shareable
- Feature-specific logic stays encapsulated
- Clear separation between shared and feature code

#### Best Practices

**✅ Do:**
- Group related functionality by feature
- Keep shared utilities in `utils/` and `hooks/`
- Use consistent directory structures across features
- Maintain clear import/export patterns
- Document feature boundaries and responsibilities

**❌ Don't:**
- Mix feature-specific code in common directories
- Create deep nesting (max 3-4 levels recommended)
- Use unclear or generic component names
- Allow circular dependencies between features
- Skip organizing new features properly from the start

### Layout Components

The layout system provides consistent page structure and responsive behavior across the application using centralized components in `components/layout/`.

#### PageContainer

The primary container for all main application pages providing consistent max-width, centering, and responsive padding.

```tsx
import PageContainer from '../components/layout/PageContainer';

// Usage in pages
<PageContainer>
  <PageHeader>
    <Title>Page Title</Title>
  </PageHeader>
  {/* Page content */}
</PageContainer>
```

**Specifications:**
```scss
max-width: 1200px;
margin: 0 auto;
padding: 2rem 1rem;

// Mobile responsive
@media (max-width: 768px) {
  padding: 1rem;
}
```

**Used across:**
- AIAssistant page
- Home page  
- Calendar page
- Profile page

#### Header Component

Adaptive header with multiple variants supporting navigation, authentication, and onboarding states.

**Variants:**

**App Header** - Default authenticated app navigation
```tsx
import Header from '../components/layout/Header';

<Header variant="app" />
```

**Welcome Header** - Marketing/landing page navigation
```tsx
<Header variant="welcome" />
```

**Onboarding Header** - Step indicator and back navigation
```tsx
<Header 
  variant="app"
  isOnboarding={true}
  currentStep={3}
  totalSteps={8}
  showBackButton={true}
  onBackClick={handleBack}
  title="Profile Setup"
/>
```

**Props Interface:**
```tsx
interface HeaderProps {
  variant?: 'welcome' | 'app';
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void | Promise<void>;
  isOnboarding?: boolean;
  currentStep?: number;
  totalSteps?: number;
}
```

**Responsive Behavior:**
- Desktop: Full navigation visible
- Mobile: Hamburger menu with toggle
- Logo adapts to context (brand logo vs back button + title)

#### Footer Component

Multi-variant footer supporting marketing and app contexts.

**Full Footer** - Marketing pages with comprehensive links
```tsx
import Footer from '../components/layout/Footer';

<Footer variant="full" />
```

**Simple Footer** - App pages with minimal footprint
```tsx
<Footer variant="simple" />
```

**Structure:**
```tsx
// Full footer - 4 columns
- Logo & tagline column
- Product links column  
- Company links column
- Legal links column

// Simple footer - Single row
- Copyright | Privacy | Terms | Contact
```

#### Responsive Design Patterns

**Breakpoints:**
```scss
// Mobile first approach
@media (max-width: 768px) {
  // Mobile styles
}

@media (min-width: 768px) {
  // Tablet and desktop styles
}

@media (min-width: 1024px) {
  // Desktop styles
}
```

**Layout Patterns:**

**Page Layout:**
```tsx
<Header variant="app" />
<PageContainer>
  {/* Page content with consistent spacing */}
</PageContainer>
<Footer variant="simple" />
```

**Grid Layouts:**
```scss
// Responsive grid
.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Flex Layouts:**
```scss
// Responsive flex containers
.flex-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
```

#### Navigation Patterns

**Primary Navigation** - Main app sections
```tsx
// Desktop: Horizontal nav bar
<Nav>
  <NavLink to="/" $active={isActive('/')}>My Wardrobe</NavLink>
  <NavLink to="/calendar" $active={isActive('/calendar')}>Calendar</NavLink>
  <NavLink to="/ai-assistant" $active={isActive('/ai-assistant')}>AI Assistant</NavLink>
</Nav>

// Mobile: Hidden, accessible via hamburger menu
```

**Contextual Navigation** - Feature-specific navigation
```tsx
// Tabs within pages
<TabsContainer>
  <Tab $active={activeTab === 'items'}>Items</Tab>
  <Tab $active={activeTab === 'outfits'}>Outfits</Tab>
  <Tab $active={activeTab === 'wishlist'}>Wishlist</Tab>
</TabsContainer>
```

#### Spacing System

**Container Spacing:**
```scss
// Page containers
padding: 2rem 1rem; // Desktop
padding: 1rem;      // Mobile

// Section spacing
margin-bottom: 2rem;   // Between major sections
margin-bottom: 1.5rem; // Between subsections
margin-bottom: 1rem;   // Between related elements
```

**Component Spacing:**
```scss
// Form sections
gap: 1.5rem;        // Between form sections
gap: 1rem;          // Between form fields

// Grid layouts
gap: 1.5rem;        // Card grids
gap: 1rem;          // Compact lists

// Button groups
gap: 0.75rem;       // Button spacing
```

#### Usage Guidelines

**✅ Do:**
- Use PageContainer for all main content areas
- Implement mobile-first responsive design
- Use consistent breakpoints (768px, 1024px)
- Test layouts across all device sizes
- Use semantic HTML elements (header, nav, main, footer)
- Maintain consistent spacing using the spacing system
- Use appropriate header variant for each context

**❌ Don't:**
- Create custom page containers (use PageContainer)
- Mix breakpoint values across components
- Use fixed pixel widths for content areas
- Forget mobile navigation states
- Skip testing responsive behavior
- Use inconsistent spacing values
- Override layout component core styles

#### Component Import Paths

```tsx
// Layout components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';  
import PageContainer from '../components/layout/PageContainer';

// Page structure components (from HomePage.styles)
import {
  PageHeader,
  Title, 
  TabsContainer,
  Tab,
  FiltersContainer
} from '../pages/HomePage.styles';
```

## Icon System

The application uses a standardized icon system built on `react-icons` with consistent patterns for icon usage, sizing, colors, and contexts.

### Icon Libraries

**Primary Libraries:**
- **FontAwesome (`react-icons/fa`)** - General purpose icons, scenario icons, social icons
- **Material Design (`react-icons/md`)** - Navigation icons, action icons, UI elements
- **FontAwesome 6 (`react-icons/fa6`)** - Modern variants and newer icons

### Icon Categories and Usage

#### Navigation Icons
```tsx
import { MdCheckroom, MdOutlineStyle, MdOutlineWorkspaces, MdFavoriteBorder } from 'react-icons/md';

// Tab navigation
<Tab $active={activeTab === 'items'}>
  <MdCheckroom />
  Items
</Tab>
<Tab $active={activeTab === 'outfits'}>
  <MdOutlineWorkspaces />
  Outfits
</Tab>
```

#### Action Icons
```tsx
import { MdAdd, MdSearch, MdCloudUpload } from 'react-icons/md';
import { FaTrash, FaPlus } from 'react-icons/fa';

// Action buttons
<Button variant="primary">
  <MdAdd />
  Add Item
</Button>

// Search functionality
<SearchIcon>
  <MdSearch />
</SearchIcon>
```

#### Status and Feedback Icons
```tsx
import { FaCheckCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa';

// Success states
<FaCheckCircle style={{ color: '#22c55e' }} />

// Warning states  
<FaExclamationTriangle style={{ color: '#f59e0b' }} />

// Rating/scoring
<FaStar style={{ color: '#fbbf24' }} />
```

### Scenario Icon System

The app includes a dedicated scenario icon system with contextual colors and backgrounds.

**Implementation:**
```tsx
import { getScenarioIcon } from '../utils/scenarioIconUtils';

// Usage in components
const { Icon, color, bgColor } = getScenarioIcon(scenario.type);

<IconContainer style={{ backgroundColor: bgColor }}>
  <Icon style={{ color }} />
</IconContainer>
```

**Scenario Icon Mappings:**
```tsx
// Work contexts
'office' → FaBriefcase (blue)
'remote' → FaLaptop (green)

// Social contexts  
'social' → FaUsers (orange)
'party' → FaUsers (orange)

// Activity contexts
'workout' → FaRunning (red)
'outdoor' → FaWalking (green)
'travel' → FaPlane (purple)

// Personal contexts
'casual' → FaHome (green)
'date' → FaHeart (pink)
'formal' → FaGlassCheers (orange)
```

**Color Scheme:**
```tsx
// Icon and background color pairs
office: { color: '#4285f4', bgColor: '#e8f0fe' }    // Blue
remote: { color: '#34a853', bgColor: '#e6f4ea' }    // Green  
social: { color: '#f59e0b', bgColor: '#fff8f0' }    // Orange
workout: { color: '#ef4444', bgColor: '#fee2e2' }   // Red
travel: { color: '#8b5cf6', bgColor: '#f8f0ff' }    // Purple
default: { color: '#6b7280', bgColor: '#f3f4f6' }   // Gray
```

### Icon Sizing Standards

**Size Variants:**
```tsx
// Small icons (16px) - Inline with text, compact UI
<Icon style={{ fontSize: '1rem' }} />

// Medium icons (20px) - Standard buttons, cards
<Icon style={{ fontSize: '1.25rem' }} />

// Large icons (24px) - Header icons, prominent actions  
<Icon style={{ fontSize: '1.5rem' }} />

// Extra large (32px) - Hero sections, empty states
<Icon style={{ fontSize: '2rem' }} />
```

**Responsive Sizing:**
```scss
.icon {
  font-size: 1.25rem; // 20px default
  
  @media (max-width: 768px) {
    font-size: 1rem; // 16px mobile
  }
}
```

### Icon Container Patterns

#### Circular Icon Containers
```tsx
const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${props => props.bgColor || '#f3f4f6'};
`;

// Usage
<IconContainer bgColor="#e8f0fe">
  <FaBriefcase style={{ color: '#4285f4' }} />
</IconContainer>
```

#### Logo Icon Pattern
```tsx
const LogoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.5rem;
  background-color: ${theme.colors.primary};
  color: white;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

// Usage - Emoji or icon
<LogoIcon>👔</LogoIcon>
```

### Icon Usage Guidelines

#### Contextual Icon Selection

**✅ Do:**
```tsx
// Use Material Design for navigation
import { MdCheckroom } from 'react-icons/md';

// Use FontAwesome for descriptive/semantic icons  
import { FaBriefcase, FaHeart } from 'react-icons/fa';

// Match icon context to content
<Button variant="primary">
  <MdAdd /> Add Item  // Addition action
</Button>

<ScenarioIcon>
  <FaBriefcase /> Office // Work context
</ScenarioIcon>
```

**❌ Don't:**
```tsx
// Don't mix icon styles inconsistently
<Tab><FaHome />Home</Tab>           // FontAwesome  
<Tab><MdOutlineStyle />Style</Tab>  // Material Design - inconsistent

// Don't use unclear icon metaphors
<FaRocket /> Save  // Confusing metaphor

// Don't ignore semantic meaning
<FaTrash /> Edit   // Wrong semantic association
```

#### Icon and Text Combinations

**Icon with Text:**
```tsx
// Standard spacing
<Button>
  <MdAdd style={{ marginRight: '0.5rem' }} />
  Add Item
</Button>

// Using Flexbox
<ButtonContent>
  <MdAdd />
  <span>Add Item</span>
</ButtonContent>

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
```

**Icon-Only Buttons:**
```tsx
// Ensure accessibility
<IconButton 
  aria-label="Delete item"
  title="Delete item"
>
  <FaTrash />
</IconButton>
```

### Icon Color Patterns

#### Brand Colors
```tsx
// Primary brand purple
<Icon style={{ color: '#8b5cf6' }} />

// Secondary actions - gray
<Icon style={{ color: '#6b7280' }} />
```

#### Semantic Colors
```tsx
// Success/positive actions
<Icon style={{ color: '#22c55e' }} />

// Warning/caution
<Icon style={{ color: '#f59e0b' }} />

// Error/destructive actions  
<Icon style={{ color: '#ef4444' }} />

// Information/neutral
<Icon style={{ color: '#3b82f6' }} />
```

#### State-Based Colors
```tsx
// Active/selected state
<Icon style={{ 
  color: isActive ? '#8b5cf6' : '#6b7280' 
}} />

// Disabled state
<Icon style={{ 
  color: isDisabled ? '#d1d5db' : '#374151',
  opacity: isDisabled ? 0.5 : 1
}} />
```

### Implementation Examples

#### Tab Icon Integration
```tsx
const TabIcon = ({ icon: Icon, active }) => (
  <Icon style={{ 
    fontSize: '1.25rem',
    color: active ? '#8b5cf6' : '#6b7280',
    marginRight: '0.5rem'
  }} />
);

// Usage in tabs
<Tab $active={activeTab === 'items'}>
  <TabIcon icon={MdCheckroom} active={activeTab === 'items'} />
  Items
</Tab>
```

#### Search Icon Pattern
```tsx
const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-size: 1.25rem;
  pointer-events: none;
`;

// Usage
<SearchContainer>
  <SearchIcon>
    <MdSearch />
  </SearchIcon>
  <SearchInput placeholder="Search items..." />
</SearchContainer>
```

### Import Patterns

```tsx
// Group imports by library
import { 
  FaBriefcase, 
  FaHeart, 
  FaTrash, 
  FaPlus 
} from 'react-icons/fa';

import { 
  MdCheckroom, 
  MdSearch, 
  MdAdd 
} from 'react-icons/md';

// Import scenario utility
import { getScenarioIcon } from '../utils/scenarioIconUtils';
```

### Accessibility Considerations

```tsx
// Provide meaningful labels
<button aria-label="Delete item">
  <FaTrash />
</button>

// Use title attributes for tooltips
<Icon title="Office scenario" />

// Ensure sufficient color contrast
<Icon style={{ 
  color: '#374151', // Meets WCAG AA standards
  fontSize: '1.25rem' // Minimum 19.2px for touch targets
}} />
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

## State Management Patterns

The Wardrobe App uses a layered state management approach combining React Context, custom hooks, and local state patterns for optimal performance and maintainability.

### Context Providers

#### Primary Contexts
- **`WardrobeContext`** - Core wardrobe data (items, outfits, capsules)
- **`SupabaseAuthContext`** - Authentication state and user management
- **`StyleProfileContext`** - User preferences and profile data

```tsx
// Context usage pattern
import { useWardrobe } from '../context/WardrobeContext';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const MyComponent = () => {
  const { items, outfits, addItem } = useWardrobe();
  const { user, isAuthenticated } = useSupabaseAuth();
  
  return (
    // Component JSX
  );
};
```

#### Context Provider Structure
```tsx
// Provider wrapping pattern in App.tsx
<SupabaseAuthProvider>
  <WardrobeProvider>
    <StyleProfileProvider>
      <Routes />
    </StyleProfileProvider>
  </WardrobeProvider>
</SupabaseAuthProvider>
```

### Custom Data Hooks

#### Page-Level Data Hooks
- **`useHomePageData`** - Complex state management for main wardrobe interface
- **`useProfileData`** - User preferences and settings management
- **`useCalendar`** - Calendar and outfit planning data

#### Entity-Specific Hooks
- **`useWardrobeItemsDB`** - Database-synchronized wardrobe items
- **`useOutfits`** - Outfit management with local fallbacks
- **`useCapsules`** - Capsule collections with relationships
- **`useSupabaseWardrobeItems`** - Database integration for items

#### Form-Specific Hooks
- **`useWardrobeItemForm`** - Complex form state with validation
- **`useCapsuleFormState`** - Capsule creation form management
- **`useImageHandling`** - File upload and image processing

### State Management Patterns

#### 1. Hybrid Storage Pattern
Combines database storage with localStorage fallbacks:

```tsx
// Example from WardrobeContext
const addItem = async (itemData) => {
  try {
    if (isAuthenticated) {
      // Try database first
      const newItem = await api.createItem(itemData);
      setItems(prev => [...prev, newItem]);
    } else {
      // Fall back to localStorage
      const newItem = { ...itemData, id: uuidv4() };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem(`wardrobe-items-${userId}`, JSON.stringify(updatedItems));
    }
  } catch (error) {
    // Graceful fallback to localStorage on API failure
    console.error('API error, falling back to localStorage');
  }
};
```

#### 2. Derived State with Memoization
Heavy use of `useMemo` for computed values:

```tsx
// Example from useHomePageData
const filteredItems = useMemo(() => 
  items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSeason = seasonFilter === 'all' || item.season.includes(seasonFilter);
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeason && matchesSearch;
  }), 
  [items, categoryFilter, seasonFilter, searchQuery]
);
```

#### 3. Modal State Management
Centralized modal state patterns:

```tsx
// Modal state pattern from useHomePageData
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

// Event handlers for modal management
const handleViewItem = useCallback((item: WardrobeItem) => {
  setSelectedItem(item);
  setIsViewModalOpen(true);
}, []);

const handleEditItem = useCallback((id: string) => {
  setCurrentItemId(id);
  setIsEditModalOpen(true);
}, []);
```

#### 4. Filter State Management
Dedicated state for complex filtering:

```tsx
// Filter state pattern
const [categoryFilter, setCategoryFilter] = useState<string>('all');
const [seasonFilter, setSeasonFilter] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState<string>('');

// Separate filters for different entities
const [outfitSeasonFilter, setOutfitSeasonFilter] = useState<string>('all');
const [capsuleSearchQuery, setCapsuleSearchQuery] = useState<string>('');
```

#### 5. Form State with Validation
Complex form state management:

```tsx
// Example from form hooks
const useWardrobeItemForm = (initialItem) => {
  const [formData, setFormData] = useState(initialItem || defaultFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  return { formData, setFormData, errors, validateForm, isSubmitting };
};
```

#### 6. Loading State Management
Coordinated loading states across data sources:

```tsx
// Example from useHomePageData
const [initialLoadComplete, setInitialLoadComplete] = useState(false);

const isLoading = useMemo(() => {
  if (initialLoadComplete) return false;
  return itemsLoading || outfitsLoading || capsulesLoading;
}, [itemsLoading, outfitsLoading, capsulesLoading, initialLoadComplete]);

useEffect(() => {
  if (!itemsLoading && !outfitsLoading && !capsulesLoading && !initialLoadComplete) {
    const timer = setTimeout(() => setInitialLoadComplete(true), 500);
    return () => clearTimeout(timer);
  }
}, [itemsLoading, outfitsLoading, capsulesLoading, initialLoadComplete]);
```

### Data Synchronization Patterns

#### Database + Local Storage Sync
```tsx
// Save data to both database and localStorage
useEffect(() => {
  if (isLoading) return;
  
  if (isAuthenticated && userId !== 'guest') {
    // Save to database for authenticated users
    localStorage.setItem(`items-${userId}`, JSON.stringify(items));
  } else {
    // Save to guest storage
    localStorage.setItem('wardrobe-items-guest', JSON.stringify(items));
  }
}, [items, isLoading, isAuthenticated, userId]);
```

#### Event-Based Communication
```tsx
// Cross-component communication via custom events
const handleItemDeleted = (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail?.updatedOutfits) {
    setOutfits(customEvent.detail.updatedOutfits);
  }
};

window.addEventListener('wardrobeItemDeleted', handleItemDeleted);
```

### State Performance Optimization

#### Callback Memoization
```tsx
// Memoize event handlers to prevent unnecessary re-renders
const handleAddItem = useCallback(() => {
  setIsAddModalOpen(true);
}, []);

const handleSubmitEdit = useCallback((item: any) => {
  if (currentItemId) {
    updateItem(currentItemId, item);
    setIsEditModalOpen(false);
    setCurrentItemId(null);
  }
}, [currentItemId, updateItem]);
```

#### Selective Re-renders
```tsx
// Use specific dependencies to control re-renders
const currentItem = useMemo(() => 
  currentItemId ? items.find(item => item.id === currentItemId) : undefined,
  [items, currentItemId]
);
```

### Error State Management

#### Graceful Error Handling
```tsx
// Error state with fallback patterns
const error = itemsError || outfitsError || capsuleError;

// Only show errors if we don't have data loaded
const displayError = items.length > 0 ? null : error;
```

### Best Practices

#### Do's
- **Use custom hooks** for complex state logic
- **Memoize derived state** with `useMemo` and `useCallback`
- **Implement fallback strategies** for database failures
- **Separate concerns** between different state domains
- **Use TypeScript interfaces** for state shape validation
- **Implement loading states** for better UX

#### Don'ts
- **Don't put everything in Context** - use local state when appropriate
- **Don't ignore loading states** - always provide feedback
- **Don't mutate state directly** - use immutable updates
- **Don't forget cleanup** - remove event listeners and timers
- **Don't over-optimize** - measure before optimizing

### Import Patterns
```tsx
// Context hooks
import { useWardrobe } from '../context/WardrobeContext';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

// Custom data hooks
import { useHomePageData } from '../hooks/useHomePageData';
import { useProfileData } from '../hooks/useProfileData';

// Form hooks
import { useWardrobeItemForm } from '../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm';
import { useCapsuleFormState } from '../components/features/wardrobe/forms/CapsuleForm/hooks/useCapsuleFormState';
```

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
