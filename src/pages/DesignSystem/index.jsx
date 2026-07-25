import React, { useState } from 'react';
import { PageContainer, Navbar, Section } from '@/components/layout';
import {
  Container, SectionHeading, Button, Input, Textarea,
  Badge, Tag, Chip, Avatar, Card, Divider, Loader, EmptyState,
} from '@/components/ui';
import { Icon } from '@/components/ui/icons';


/**
 * DesignSystem renders a comprehensive Style Guide & Component Showcase page.
 * Displays all color values, typographic scales, spacing tokens, and reusable UI components.
 */
export default function DesignSystem() {
  const [inputValue, setInputValue] = useState('');
  const [activeChip, setActiveChip] = useState('tech');
  const [tags, setTags] = useState(['Development', 'Security', 'Web']);

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <PageContainer>
      <Navbar activePath="/design-system" />
      <Section className="min-h-screen pt-32 pb-16">
        <Container className="space-y-24">
          
          {/* Style Guide Intro */}
          <header className="border-b border-border/80 pb-12">
            <span className="text-accent font-heading text-caption uppercase tracking-widest font-semibold block mb-3 animate-pulse">
              System Active
            </span>
            <h1 className="text-display font-heading tracking-tight mb-4 text-text-primary">
              Design Foundations
            </h1>
            <p className="text-body-lg text-text-secondary max-w-2xl font-light">
              Sprint 1 — Ticket 01 specification guide. Minimal, editorial, and architectural design system optimized for the BlogAuth platform.
            </p>
          </header>

          {/* Color & Spacing Tokens */}
          <section className="space-y-8">
            <SectionHeading title="Color & Spacing System" badge="Tokens" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card variant="surface" className="space-y-6">
                <h3 className="text-h3 font-heading">Primary Palette</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-16 w-full rounded bg-background border border-border flex items-center justify-center font-heading text-caption font-semibold">#FAF9F6</div>
                    <span className="text-caption font-heading text-text-secondary uppercase">Warm Off-White</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 w-full rounded bg-accent flex items-center justify-center font-heading text-caption font-semibold text-white">#10B981</div>
                    <span className="text-caption font-heading text-text-secondary uppercase">Accent Emerald</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 w-full rounded bg-surface border border-border flex items-center justify-center font-heading text-caption font-semibold">#FDFDFD</div>
                    <span className="text-caption font-heading text-text-secondary uppercase">Surface</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 w-full rounded bg-text-primary flex items-center justify-center font-heading text-caption font-semibold text-background">#18181B</div>
                    <span className="text-caption font-heading text-text-secondary uppercase">Charcoal Text</span>
                  </div>
                </div>
              </Card>
              <Card variant="surface" className="space-y-6">
                <h3 className="text-h3 font-heading">Spacing Tokens</h3>
                <div className="flex flex-wrap items-end gap-2 h-24 border-b border-border/40 pb-4">
                  <div className="bg-accent/20 w-4 h-4 rounded-sm" title="4px" />
                  <div className="bg-accent/20 w-4 h-8 rounded-sm" title="8px" />
                  <div className="bg-accent/20 w-4 h-12 rounded-sm" title="12px" />
                  <div className="bg-accent/20 w-4 h-16 rounded-sm" title="16px" />
                  <div className="bg-accent/20 w-4 h-20 rounded-sm" title="24px" />
                  <div className="bg-accent/20 w-4 h-24 rounded-sm" title="32px" />
                </div>
                <span className="text-caption font-heading text-text-secondary block">
                  Scale: 4px | 8px | 12px | 16px | 20px | 24px | 32px | 40px | 48px | 64px | 80px | 96px | 128px
                </span>
              </Card>
            </div>
          </section>

          {/* Typography Scale */}
          <section className="space-y-8">
            <SectionHeading title="Typography System" badge="Typography" />
            <Card variant="surface" className="divide-y divide-border/60">
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Display Title</span>
                <span className="text-display col-span-3 font-heading tracking-tight leading-none">Display Header</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Heading H1</span>
                <span className="text-h1 col-span-3 font-heading tracking-tight">H1 Editorial Title</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Heading H2</span>
                <span className="text-h2 col-span-3 font-heading tracking-tight">H2 Section Title</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Heading H3</span>
                <span className="text-h3 col-span-3 font-heading">H3 Card Header</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Body Large</span>
                <span className="text-body-lg col-span-3 font-body">Body Large — Editorial copy.</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Body Normal</span>
                <span className="text-body col-span-3 font-body">Body — Default reading paragraph element.</span>
              </div>
              <div className="py-4 grid grid-cols-1 md:grid-cols-4 items-center">
                <span className="text-caption font-heading text-text-secondary uppercase font-semibold">Metadata & Caption</span>
                <div className="col-span-3 flex flex-wrap gap-8 font-heading">
                  <span className="text-small">Small Label</span>
                  <span className="text-caption">Caption Text</span>
                  <span className="text-metadata text-text-secondary">Metadata Details</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Reusable UI Components */}
          <section className="space-y-16">
            
            {/* Buttons Showcase */}
            <div className="space-y-6">
              <SectionHeading title="Buttons & Interactivity" badge="UI Components" />
              <Card variant="surface" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">Primary</span>
                    <Button variant="primary">Submit Request</Button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">Secondary</span>
                    <Button variant="secondary" icon={Icon.Calendar}>Select Date</Button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">Ghost</span>
                    <Button variant="ghost" trailingIcon={Icon.ArrowRight}>Read Post</Button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">Danger</span>
                    <Button variant="danger" icon={Icon.Trash}>Delete Draft</Button>
                  </div>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">Sizes</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">States (Loading)</span>
                    <Button loading>Saving Draft</Button>
                  </div>
                  <div className="space-y-2">
                    <span className="text-caption uppercase text-text-secondary block mb-2 font-heading">States (Disabled)</span>
                    <Button disabled>Action Blocked</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form Fields Showcase */}
            <div className="space-y-6">
              <h3 className="text-h2 font-heading tracking-tight">Inputs & Controls</h3>
              <Card variant="surface" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Input 
                    id="search" 
                    label="Search Articles" 
                    placeholder="Search by keywords..." 
                    leadingIcon={Icon.Search}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input 
                    id="email" 
                    label="Email Address" 
                    type="email"
                    placeholder="you@domain.com"
                    leadingIcon={Icon.Mail}
                    required
                  />
                  <Input 
                    id="password" 
                    label="Password" 
                    type="password"
                    placeholder="••••••••"
                    leadingIcon={Icon.Lock}
                    error="Password is too short"
                  />
                </div>
                <div className="space-y-6">
                  <Textarea 
                    id="bio"
                    label="Short Biography"
                    placeholder="Tell us about yourself..."
                    validationMessage="Max 250 words allowed"
                  />
                  <Input 
                    id="disabled-input" 
                    label="Read-only Field"
                    placeholder="Value is immutable"
                    disabled
                  />
                </div>
              </Card>
            </div>

            {/* Badges, Tags, Chips */}
            <div className="space-y-6">
              <h3 className="text-h2 font-heading tracking-tight">Pills, Tags & Selection Chips</h3>
              <Card variant="surface" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <span className="text-caption uppercase text-text-secondary block font-heading">Status Badges</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">Admin</Badge>
                    <Badge variant="secondary">Draft</Badge>
                    <Badge variant="success">Active</Badge>
                    <Badge variant="warning">Pending</Badge>
                    <Badge variant="danger">Blocked</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-caption uppercase text-text-secondary block font-heading">Interactive Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-caption text-text-secondary/70 italic">All tags cleared.</span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-caption uppercase text-text-secondary block font-heading">Filter Chips</span>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={activeChip === 'tech'} onClick={() => setActiveChip('tech')}>Tech</Chip>
                    <Chip active={activeChip === 'design'} onClick={() => setActiveChip('design')}>Design</Chip>
                    <Chip active={activeChip === 'ops'} onClick={() => setActiveChip('ops')}>DevOps</Chip>
                  </div>
                </div>
              </Card>
            </div>

            {/* Layout Cards */}
            <div className="space-y-6">
              <h3 className="text-h2 font-heading tracking-tight">Card Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Surface Card */}
                <Card variant="surface" className="justify-between min-h-55">
                  <div>
                    <span className="text-caption text-accent uppercase font-semibold mb-2 block">Surface Card</span>
                    <h4 className="text-h3 font-heading mb-2 leading-tight">Card layout default</h4>
                    <p className="text-small text-text-secondary">
                      Perfect for standard panels, settings containers, and structural content wrapping.
                    </p>
                  </div>
                  <Divider className="my-3" />
                  <span className="text-caption text-text-secondary/60">Static container</span>
                </Card>

                {/* Interactive Card */}
                <Card variant="interactive" className="justify-between min-h-55">
                  <div>
                    <span className="text-caption text-accent uppercase font-semibold mb-2 block">Interactive Card</span>
                    <h4 className="text-h3 font-heading mb-2 leading-tight">Hover Lift Interaction</h4>
                    <p className="text-small text-text-secondary">
                      Leverages motion.js spring hover-lifts, border highlights, and cursor pointer indications.
                    </p>
                  </div>
                  <Divider className="my-3" />
                  <div className="flex items-center gap-1 text-accent text-caption uppercase font-semibold">
                    <span>Click Action</span>
                    <Icon.ArrowRight size={12} />
                  </div>
                </Card>

                {/* Editorial Card */}
                <Card variant="editorial" className="justify-between min-h-55">
                  <div>
                    <span className="text-caption text-accent uppercase font-semibold mb-2 block">Editorial Card</span>
                    <h4 className="text-h3 font-heading mb-2 leading-tight">Strictly Clean Layout</h4>
                    <p className="text-small text-text-secondary">
                      Zero card background fill or heavy shadow outlines. Optimizes readability and grid margins.
                    </p>
                  </div>
                  <Divider className="my-3" />
                  <span className="text-caption text-text-secondary/60">Blogging Layout</span>
                </Card>
              </div>
            </div>

            {/* Avatars, Loading, & Empty States */}
            <div className="space-y-6">
              <h3 className="text-h2 font-heading tracking-tight">Feedback & Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <Card variant="surface" className="space-y-6">
                  <h4 className="text-h3 font-heading">Avatars</h4>
                  <div className="flex items-end gap-4">
                    <div className="space-y-1 text-center">
                      <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80" name="John Doe" size="sm" />
                      <span className="text-caption text-text-secondary block">Small</span>
                    </div>
                    <div className="space-y-1 text-center">
                      <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" name="Jane Smith" size="md" />
                      <span className="text-caption text-text-secondary block">Medium</span>
                    </div>
                    <div className="space-y-1 text-center">
                      <Avatar name="Shourya Upadhyay" size="lg" />
                      <span className="text-caption text-text-secondary block">Initials fallback</span>
                    </div>
                  </div>
                </Card>

                <Card variant="surface" className="space-y-6">
                  <h4 className="text-h3 font-heading">Loaders</h4>
                  <div className="grid grid-cols-2 gap-4 items-center justify-items-center h-28">
                    <div className="text-center space-y-2">
                      <Loader variant="spinner" size="md" />
                      <span className="text-caption text-text-secondary">Spinner</span>
                    </div>
                    <div className="text-center space-y-2">
                      <Loader variant="pulse" size="sm" />
                      <span className="text-caption text-text-secondary">Pulse</span>
                    </div>
                  </div>
                </Card>

                <EmptyState 
                  title="No Drafts Yet"
                  description="Start crafting your first engineering editorial by hitting the compile actions."
                  icon={Icon.BookOpen}
                  action={<Button variant="secondary" size="sm">Create Article</Button>}
                />
              </div>
            </div>

          </section>

        </Container>
      </Section>
    </PageContainer>
  );
}
