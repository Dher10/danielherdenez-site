import type { CaseCardProps } from '@/components/shared/case-card';

/**
 * Single source for the four portfolio cases, in order 01 to 04.
 *
 * pm-ai-playbook used to hold case 03 as a "Coming soon" card. It lives in
 * Writing & Artifacts as a repository card. PitchCraft took the case slot on
 * 2026-11-20 and was split into two cases on 2026-11-25: the July Kaggle
 * capstone (case 03) and the live product through v2.2.0 (case 04). Their
 * copy comes from docs/editorial/pitchcraft-2026-11-25/. The old
 * /work/pitchcraft route was removed, with no redirect: it never reached
 * production.
 *
 * Route convention for later PitchCraft cases: /work/pitchcraft-v{version}-{context}.
 *
 * Edit a description here and every grid picks it up: home, /work and the
 * "More work" grid on each case, which lists the other three cases.
 *
 * `meta` is the one field call sites override. The "More work" grid on
 * veflo-trace labels its neighbours by name rather than by case number.
 */

export const vefloTrace: CaseCardProps = {
  meta: 'case · 01',
  title: 'From workflow software to AI-assisted operations',
  desc: 'How a case platform built on real operations work grew into one that puts AI inside the workflow, on purpose and under control.',
  tags: ['Product strategy', 'AI-assisted', 'Since 2025'],
  cta: 'read',
  href: '/work/veflo-trace',
};

export const internalPlatform: CaseCardProps = {
  meta: 'case · 02',
  title: 'Designing product work beside an agentic build system',
  desc: 'What it takes to be product manager of an internal platform built by a fast-moving agentic system, and how product work keeps pace without becoming the bottleneck.',
  tags: ['Platform', 'AI-assisted', 'Since 2026'],
  cta: 'read',
  href: '/work/internal-platform',
};

export const pitchcraftV1: CaseCardProps = {
  meta: 'case · 03',
  title: 'Building a scouting product around verifiable claims',
  desc: 'Turning a personal idea into a baseball scouting product in seven days, with a deterministic agent pipeline and a fact-checking mechanism.',
  tags: ['Product discovery', 'Agent pipeline', 'July 2026'],
  cta: 'read',
  href: '/work/pitchcraft-v1-kaggle',
};

export const pitchcraftV2: CaseCardProps = {
  meta: 'case · 04',
  title: 'From a Kaggle capstone to a live baseball product',
  desc: 'Taking PitchCraft into production, evaluating a language model as its writer and redesigning the experience for the off-season.',
  tags: ['AI evaluation', 'Agentic build', 'Since Oct 2026'],
  cta: 'read',
  href: '/work/pitchcraft-v2-world-series',
};

/** Canonical order for the Work grids. */
export const cases: CaseCardProps[] = [vefloTrace, internalPlatform, pitchcraftV1, pitchcraftV2];

/** The "More work" grid of a case: the other three cases, in canonical order. */
export function otherCases(href: string): CaseCardProps[] {
  return cases.filter((c) => c.href !== href);
}
