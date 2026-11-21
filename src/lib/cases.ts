import type { CaseCardProps } from '@/components/shared/case-card';

/**
 * Single source for the three portfolio cases.
 *
 * pm-ai-playbook used to hold case 03 as a "Coming soon" card. It lives in
 * Writing & Artifacts as a repository card; PitchCraft took the case slot
 * on 2026-11-20.
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

export const pitchcraft: CaseCardProps = {
  meta: 'case \u00b7 03',
  title: 'From a Kaggle capstone to a live baseball product',
  desc: 'A seven-day contest entry that became a daily product for the World Series, and the evaluation that kept its AI writer switched off.',
  tags: ['AI evaluation', 'Agentic build', 'Since 2026'],
  cta: 'read',
  href: '/work/pitchcraft',
};

/** Canonical order for the Work grids. */
export const cases: CaseCardProps[] = [vefloTrace, internalPlatform, pitchcraft];
