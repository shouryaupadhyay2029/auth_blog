# Layout System

> **Status:** Stable — do not alter primitive responsibilities without a full team review.
> Last updated: Sprint 1, Ticket 02.6

---

## Overview

The layout system is built from three independent layers.
Each layer owns exactly one responsibility. There is no overlap.

```
PageContainer      → page shell, background, scroll
└── Navbar         → fixed navigation bar
└── Section        → vertical rhythm, semantic wrapper
    └── Container  → content width, horizontal padding
        └── ...    → components (Card, SectionHeading, etc.)
```

Every page in this application must follow this exact hierarchy.
No exceptions.

---

## Layer Responsibilities

### `PageContainer`
**Path:** `src/components/layout/PageContainer/PageContainer.jsx`

| Responsibility | Owned by PageContainer? |
|----------------|------------------------|
| Page background color | ✅ Yes |
| Decorative overlays (noise, grid) | ✅ Yes |
| Lenis smooth scroll initialization | ✅ Yes |
| `<main>` semantic wrapper | ✅ Yes |
| Content max-width | ❌ No → Container |
| Horizontal padding | ❌ No → Container |
| Section spacing | ❌ No → Section |
| Component spacing | ❌ No → children |

**Import:**
```jsx
import { PageContainer } from '@/components/layout';
```

**Rules:**
- Always the outermost wrapper of a page
- Never apply content width or padding to PageContainer
- Never nest PageContainer inside another PageContainer

---

### `Navbar`
**Path:** `src/components/layout/Navbar/Navbar.jsx`

| Responsibility | Owned by Navbar? |
|----------------|-----------------|
| Fixed position navigation bar | ✅ Yes |
| Logo display | ✅ Yes |
| Desktop nav links | ✅ Yes |
| Mobile drawer | ✅ Yes |
| Auth action buttons | ✅ Yes |
| Page content | ❌ No |

**Import:**
```jsx
import { Navbar } from '@/components/layout';
```

**Rules:**
- Always placed directly inside PageContainer, before Sections
- Always receives `activePath` prop matching the current route
- Never used inside Section or Container

---

### `Section`
**Path:** `src/components/layout/Section/Section.jsx`

| Responsibility | Owned by Section? |
|----------------|-----------------|
| Vertical rhythm (py-16 / py-24) | ✅ Yes |
| Semantic `<section>` wrapper | ✅ Yes |
| Optional background colors | ✅ Yes (via `className`) |
| `overflow-hidden` for backgrounds | ✅ Yes |
| Content max-width | ❌ No → Container |
| Horizontal padding | ❌ No → Container |
| Component spacing | ❌ No → children |

**Import:**
```jsx
import { Section } from '@/components/layout';
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | — | HTML id for anchor links |
| `className` | string | — | Override or extend Section styles |
| `as` | string | `'section'` | HTML element (`section`, `div`, `article`) |

**Canonical usage:**
```jsx
<Section>
  <Container>
    <SectionHeading title="..." />
    {/* content */}
  </Container>
</Section>
```

**Override spacing example:**
```jsx
<Section className="pt-32 pb-16 min-h-screen">
  <Container>{/* ... */}</Container>
</Section>
```

**Rules:**
- Section NEVER applies `content-container`, max-width, or width constraints internally
- Always place a `Container` directly inside Section for content that needs width bounds
- Full-bleed backgrounds go on Section; width-bounded content goes in the Container inside

---

### `Container`
**Path:** `src/components/ui/Container/index.jsx`

| Responsibility | Owned by Container? |
|----------------|---------------------|
| Maximum content width (1280px) | ✅ Yes |
| Horizontal padding (px-6 → px-8) | ✅ Yes |
| Auto horizontal centering | ✅ Yes |
| Vertical spacing | ❌ No → Section |
| Background colors | ❌ No → Section className |
| Positioning | ❌ No → parent |
| Flexbox layout | ❌ No → children |

**Import:**
```jsx
import { Container } from '@/components/ui';
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | — | Extend with spacing or layout utilities |
| `as` | string | `'div'` | HTML element |

**Rules:**
- Always placed directly inside Section
- Never nest two Containers
- Use `className` to add `space-y-*`, `gap-*`, or flexbox utilities

---

## Content Components

### `SectionHeading`
**Path:** `src/components/ui/SectionHeading/index.jsx`

**Owns:** Typography for section headers (badge + h2 + description).

**Does NOT own:** Width, spacing, backgrounds.

**Import:**
```jsx
import { SectionHeading } from '@/components/ui';
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Section title (rendered as h2) |
| `description` | string | — | Optional body text below title |
| `badge` | string | — | Optional accent label above title |
| `align` | `'left'` \| `'center'` | `'left'` | Text alignment |

**Usage:**
```jsx
<Section>
  <Container>
    <SectionHeading
      badge="Latest"
      title="Featured Articles"
      description="Discover hand-picked content from our editors."
    />
    {/* article grid */}
  </Container>
</Section>
```

---

### `Card`
**Path:** `src/components/ui/Card/index.jsx`

**Owns:** Surface background, border, border-radius, shadow, hover state.

**Does NOT own:** Width (set by grid/flex parent), external spacing.

---

## Quick Ownership Reference

| Concern | Owner |
|---------|-------|
| Page background | `PageContainer` |
| Page overlays (noise, grid) | `PageContainer` |
| Smooth scroll | `PageContainer` |
| `<main>` semantic element | `PageContainer` |
| Fixed navigation | `Navbar` |
| Vertical section rhythm | `Section` |
| Semantic section element | `Section` |
| Full-bleed backgrounds | `Section` (via className) |
| Content max-width (1280px) | `Container` |
| Horizontal padding | `Container` |
| Section typography | `SectionHeading` |
| Card surface | `Card` |
| Component-level spacing | `className` on children |

---

## Full Page Template

```jsx
import { PageContainer, Navbar, Section } from '@/components/layout';
import { Container, SectionHeading } from '@/components/ui';

export default function SomePage() {
  return (
    <PageContainer>
      <Navbar activePath="/some-page" />

      {/* Hero section — overrides spacing to fill viewport */}
      <Section className="pt-32 pb-16 min-h-screen">
        <Container className="flex flex-col items-center text-center space-y-6">
          <h1>Page Title</h1>
        </Container>
      </Section>

      {/* Content section — uses default section-spacing */}
      <Section id="content">
        <Container>
          <SectionHeading title="Content" badge="Section" />
          {/* content */}
        </Container>
      </Section>
    </PageContainer>
  );
}
```

---

## Anti-Patterns

❌ **Do not nest Container inside Container:**
```jsx
// WRONG — double width cap
<Container>
  <Container>content</Container>
</Container>
```

❌ **Do not put content directly in Section without Container:**
```jsx
// WRONG — content extends to full page width
<Section>
  <h1>This has no width bounds</h1>
</Section>
```

❌ **Do not put spacing on PageContainer:**
```jsx
// WRONG — PageContainer does not own spacing
<PageContainer className="pt-16">
```

❌ **Do not use SectionHeader (layout/) — use SectionHeading (ui/) instead:**
```jsx
// WRONG
import SectionHeader from '@/components/layout/SectionHeader';

// CORRECT
import { SectionHeading } from '@/components/ui';
```

❌ **Do not skip the hierarchy:**
```jsx
// WRONG — PageContainer → Container without Section
<PageContainer>
  <Container>content</Container>
</PageContainer>
```
