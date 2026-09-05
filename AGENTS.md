<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- Todo lo de abajo es tuyo. Next.js solo reescribe el bloque de arriba, esto queda intacto en cada actualizacion. -->

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 + shadcn/ui + Radix primitives
- Framer Motion para animación
- Desplegado en Vercel (`@vercel/analytics`, `@vercel/speed-insights` ya integrados)

## Estructura

- `src/app/` — rutas (App Router). Existentes: `about/`, `work/`
- `src/components/sections/` — secciones de página completas
- `src/components/shared/` — componentes compartidos entre secciones
- `src/components/ui/` — primitivos de shadcn
- `src/lib/` — utilidades
- `tests/` — specs de Playwright (test automatizado — ver distinción abajo)

## Comandos

- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx playwright test` — suite de pruebas automatizadas
- `npx tsc` — chequeo de tipos

Estos ya están permitidos sin confirmación en `.claude/settings.local.json`.

## Dos Playwright distintos — no confundir

- **`@playwright/test`** (devDependency, carpeta `tests/`) → suite de pruebas automatizadas. Se corre con `npx playwright test`.
- **Playwright MCP** (global, conectado vía `claude mcp add`) → deja que el agente navegue un browser real en vivo durante la sesión ("abre el sitio y revisa X"). No reemplaza la suite de tests.

## Reglas de contenido (aplican a cualquier copy, bio o case study de este sitio)

- Sin nombres de empleadores actuales ni nombres internos de producto — única excepción: MindTechSourcing.
- Sin métricas, certificaciones, herramientas o empresas inventadas. Si un bullet necesita un número y no lo tengo, preguntar antes de agregarlo.
- Voz: directa, verbos de acción, sin adjetivos vacíos ("apasionado", "proactivo", "rockstar" — prohibidos).
- Antes de redactar cualquier texto en la voz de Daniel, consultar `Estilo_de_Escritura.md` (vive en el proyecto de Claude, no en este repo).

## Skills de diseño disponibles globalmente

`design-taste-frontend`, `redesign-existing-projects` y `web-design-guidelines` están instaladas globalmente (vía `npx skills`, no son parte de este repo) y se activan solas en trabajo de layout/UI. Gobiernan la estética y accesibilidad — no anulan las reglas de contenido de arriba. Que el diseño se vea "premium" no es excusa para inventar una métrica o cifra que suene bien.

## Contexto abierto (informativo, no lista de tareas — puede quedar desactualizado, editar o borrar si ya no aplica)

- Case 3 del portafolio (pm-ai-playbook) estaba bloqueado: las carpetas de contenido del repo estaban vacías. No activarlo como "case study" hasta tener contenido real.
- Las referencias al nombre viejo del repo `PM-AI-Prompts` deben apuntar al renombrado `pm-ai-playbook` (github.com/Dher10).
- Sin JS, todo lo que envuelve `Reveal` queda invisible: el SSR emite el estado `initial` de Framer como `opacity: 0` inline y, sin hidratación, nada lo resuelve. Se caen Proof, las tres case cards, About y Writing; sobreviven hero, nav, el section head de Work y el footer. Comparte causa raíz con el bug de reduced-motion arreglado el 2026-09-05 (el mismo `opacity: 0` del SSR sin dueño): ese fix resolvió el caso con JS, no este. Verificado con Playwright y `javaScriptEnabled: false` contra `next start`. Arreglarlo es una decisión de arquitectura (reveal por CSS, o no emitir estado oculto en SSR), no un parche.
- `toBeVisible()` de Playwright no mira `opacity`: pasa sobre contenido con `opacity: 0`. Dejó pasar los dos casos de `Reveal` de arriba (reduced-motion y sin JS) con 39 tests en verde. Falta un helper de "visible de verdad" (opacity efectiva + dimensiones) para la suite — tarea aparte.
