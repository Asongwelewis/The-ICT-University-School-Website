# Design System Guidelines

## General Guidelines

* Use a base font-size of 14px
* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files
* Date formats should always be in the format "Jun 10"
* Never use a dropdown if there are 2 or fewer options

## Color System

### Primary Colors
- **Orange (#f97316)** - Primary brand color for main actions and highlights
- **Blue (#3b82f6)** - Secondary color for supporting actions and accents

### Color Usage
- Use orange for primary buttons, main navigation, and key interactive elements
- Use blue for secondary buttons, informational elements, and complementary accents
- Maintain proper contrast ratios for accessibility

### Available Color Variants
- Orange: 50, 100, 200, 300, 400, 500 (primary), 600, 700, 800, 900
- Blue: 50, 100, 200, 300, 400, 500 (secondary), 600, 700, 800, 900

## Typography

### Font Weights
- Normal: 400
- Medium: 500 (for headings and labels)

### Hierarchy
- H1: Large headings (2xl)
- H2: Section headings (xl)
- H3: Subsection headings (lg)
- H4: Component headings (base)
- P: Body text (base)

## Component Guidelines

### Buttons
- **Primary Button**: Orange background (#f97316), white text, for main actions
- **Secondary Button**: Blue background (#3b82f6), white text, for supporting actions
- **Tertiary Button**: Transparent background, colored text, for minimal actions

### Cards
- Use subtle shadows with `card-shadow` utility class
- Orange accent border for important cards
- Blue accent border for informational cards

### Navigation
- Sidebar uses orange theme with light orange background
- Active states use primary orange color
- Hover states use darker orange variants

### Forms
- Input backgrounds use light orange (#fef7ed)
- Focus states use orange ring color
- Labels use medium font weight

## Layout Guidelines

### Spacing
- Use consistent spacing scale based on rem units
- Maintain proper padding and margins for readability

### Responsive Design
- Mobile-first approach
- Use flexbox and grid for layouts
- Avoid fixed widths where possible

### Accessibility
- Maintain proper color contrast ratios
- Use semantic HTML elements
- Provide proper focus indicators

## Dark Mode Support

The design system includes comprehensive dark mode support:
- Darker backgrounds with warm gray tones
- Adjusted orange and blue colors for better contrast
- Consistent component theming across light and dark modes