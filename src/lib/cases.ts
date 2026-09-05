import type { CaseCardProps } from '@/components/shared/case-card';

/**
 * Single source for the three portfolio cases.
 *
 * Copy lived in four places before this: the arrays in work.tsx and
 * work/page.tsx, plus the inline "More work" cards on both case studies.
 * Edit a description here and every grid picks it up.
 *
 * `meta` is the one field call sites override. The "More work" grid on
 * veflo-trace labels its neighbours by name rather than by case number.
 */

export const vefloTrace: CaseCardProps = {
  meta: 'case \u00b7 01',
  title: 'From workflow software to AI-assisted operations',
  desc: 'How a case platform built on real operations work grew into one that puts AI inside the workflow, on purpose and under control.',
  tags: ['Product strategy', 'AI-assisted', 'Since 2025'],
  cta: 'read',
  href: '/work/veflo-trace',
};

export const internalPlatform: CaseCardProps = {
  meta: 'case \u00b7 02',
  title: 'Designing product work beside an agentic build system',
  desc: 'What it takes to be product manager of an internal platform built by a fast-moving agentic system, and how product work keeps pace without becoming the bottleneck.',
  tags: ['Platform', 'AI-assisted', 'Since 2026'],
  cta: 'read',
  href: '/work/internal-platform',
};

export const pmAiPlaybook: CaseCardProps = {
  meta: 'case \u00b7 03',
  title: 'How I use AI to do product work',
  desc: 'A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory.',
  tags: ['Open source', 'GitHub', 'Since 2026'],
  badge: 'Coming soon',
};

/** Canonical order for the Work grids. */
export const cases: CaseCardProps[] = [vefloTrace, internalPlatform, pmAiPlaybook];
