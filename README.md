# danielherdenez.com

Personal portfolio for Daniel Herdenez. The site includes selected product work, case studies, background, and writing.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Framer Motion. Production runs on Vercel.

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page lives at `src/app/page.tsx`.

## Checks

```bash
npm run lint
npx tsc
npx playwright test
npm run build
```

## Project structure

- `src/app/`: App Router pages, layouts, metadata, and global styles
- `src/components/sections/`: full page sections
- `src/components/shared/`: components shared across sections and routes
- `src/lib/cases.ts`: source of truth for case study cards
- `tests/`: Playwright end-to-end tests

## Deployment

The site deploys to Vercel from this repository.
