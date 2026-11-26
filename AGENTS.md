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

- `src/app/` — rutas (App Router). Existentes: `about/`, `work/` (incluye los cuatro casos: `work/veflo-trace/`, `work/internal-platform/`, `work/pitchcraft-v1-kaggle/`, `work/pitchcraft-v2-world-series/`)
- `src/components/sections/` — secciones de página completas
- `src/components/shared/` — componentes compartidos entre secciones (incluye `CaseFigure` y `CaseCover` para case studies)
- `src/components/figures/` — figures específicos de un case study (PitchCraft: pipeline y eval)
- `src/lib/` — utilidades y datos compartidos (`cases.ts` es la fuente única de los case studies)
- `tests/` — specs de Playwright (test automatizado — ver distinción abajo)
- `docs/editorial/` — copy aprobado de los case studies, palabra por palabra (los specs de PitchCraft comparan la página contra estos archivos)
- `docs/captures/` — capturas de referencia de cambios mayores (ver regla abajo)

## Case studies y rutas

| Caso | Nombre | Ruta | Copy aprobado |
|---|---|---|---|
| 01 | Veflo Trace | `/work/veflo-trace` | en la página |
| 02 | Internal Platform | `/work/internal-platform` | en la página |
| 03 | PitchCraft v1 · Kaggle | `/work/pitchcraft-v1-kaggle` | `docs/editorial/pitchcraft-2026-11-25/01_PitchCraft_v1_Kaggle_Copy.md` |
| 04 | PitchCraft v2 · World Series | `/work/pitchcraft-v2-world-series` | `docs/editorial/pitchcraft-2026-11-25/02_PitchCraft_v2_World_Series_Copy.md` |

- `src/lib/cases.ts` es la fuente única de las tarjetas (orden 01 a 04). Home y `/work` muestran las cuatro en dos filas de dos; el "More work" de cada caso lista los otros tres con `otherCases(ruta)`, nunca a sí mismo. `veflo-trace` rotula sus vecinos por nombre (`meta`).
- `/work/pitchcraft` no existe y no tiene redirect: solo vivió en `dev`, nunca en producción (decisión de Daniel, 2026-11-25). No volver a crear esa ruta.
- Convención para futuros casos de PitchCraft: `/work/pitchcraft-v{version}-{context}`, assets en `public/work/<misma ruta>/`. Una versión nueva del software no basta para un caso nuevo.
- El copy de los casos 03 y 04 se cambia primero en `docs/editorial/` (con aprobación de Daniel) y después en la página; el test de texto falla si divergen.

## Capturas de cambios mayores

Regla vigente desde 2026-11-25: todo cambio visual mayor del sitio o de PitchCraft deja capturas de referencia en el repositorio donde ocurrió el cambio, para que un case study pueda usarlas después sin reconstruir versiones viejas.

- Ubicación: `docs/captures/<yyyy-mm-dd>-<tema>/`.
- Contenido: las páginas clave a 1280 px y 390 px, en WebP, más un `README.md` corto con qué muestra cada captura, el commit o tag, y la fecha.
- WebP admite hasta 16.383 px de alto: una página más larga se parte en `-part1`, `-part2`.
- Ejemplo: `docs/captures/2026-11-25-pitchcraft-cases/`.

## Comandos

- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx playwright test` — suite de pruebas automatizadas
- `npx tsc` — chequeo de tipos

Estos ya están permitidos sin confirmación en `.claude/settings.local.json`.

## Flujo de ramas

`dev` es preprod y la rama de trabajo permanente; Vercel publica un preview de cada push a `dev`. `main` es producción y solo cambia por un PR mergeado por Daniel.

1. **Escribe** Claude Code: commits en `dev`, firmados como Daniel Herdenez <edherdenez@gmail.com>, sin Co-Authored-By, sin "Generated with" y sin ninguna atribución a IA. Mensajes convencionales: `tipo: resumen en minúsculas e imperativo` + cuerpo (qué y por qué).
2. **Revisión cruzada:** Codex revisa el diff en una sesión limpia (sin el razonamiento del escritor). Si es al revés (Codex escribe), Claude Code revisa.
3. **PR por el agente:** el agente puede abrir el PR `dev` → `main` (`gh pr create --base main --head dev`). Nunca lo mergea.
4. **Auditoría del PR:** Codex audita el PR.
5. **QA final:** Antigravity hace QA sobre el preview de Vercel del PR.
6. **Merge:** solo Daniel, en la UI de GitHub, con el check `ci` en verde.
7. **Sync:** después de cada merge, `main` vuelve a `dev` con fast-forward, estando en `dev`: `git pull --ff-only origin main` y luego `git push origin dev`.

Nunca: commit o push a `main`, force-push, rebase, `reset --hard`, `--no-verify`, cambiar `core.hooksPath`, borrar o renombrar `dev`/`main`, crear/mover/borrar tags, `gh pr merge`.

## Guardrails de git

Varias líneas; cada una cubre lo que la otra no ve:

- **Hooks de git versionados** en `.githooks/` (aplican a cualquier agente y a la terminal: Claude Code, Codex, Daniel):
  - `pre-commit`: rechaza commits en `main`/`master` y autor o committer distinto de Daniel Herdenez <edherdenez@gmail.com> (nombre y correo).
  - `pre-merge-commit`: el mismo chequeo para el merge commit automático de `git merge`, que no pasa por `pre-commit`. El fast-forward del sync no crea commit y no lo dispara.
  - `owner-check.sh`: no es un hook; es el chequeo de rama e identidad que comparten `pre-commit`, `pre-merge-commit` y `commit-msg`.
  - `commit-msg`: repite el chequeo de rama e identidad; rechaza Co-Authored-By, "Generated with", Claude-Session/Codex-Session/Assisted-by, Signed-off-by de una herramienta y direcciones noreply de una IA; exige el formato convencional y un cuerpo.
  - `pre-push`: solo deja empujar a `dev` o `experiment/*`; rechaza `main`, tags, borrar ramas o tags y cualquier push que no sea fast-forward.
  - **Activarlos una vez por clon** (un clon nuevo no los trae activos): `git config core.hooksPath .githooks`. Comprobar con `git config --get core.hooksPath` (debe decir `.githooks`). Los agentes no cambian este valor; lo hace Daniel.
  - `.gitattributes` fuerza LF en `.githooks/*`: con `core.autocrlf=true` un hook con CRLF no corre en Windows.
  - Los cuatro hooks van con modo ejecutable (`100755`) en el índice: en POSIX git ignora un hook sin el bit de ejecución. Un hook nuevo se agrega con `git update-index --chmod=+x`.
  - Tests de los hooks (git real en repos desechables): `.claude/hooks/test_githooks.py`, dentro del mismo `python -m pytest .claude/hooks -q`.
- **Claude Code:** `.claude/settings.json` cablea `.claude/hooks/git_guard.py` (portado de PitchCraft) como PreToolUse en Bash y PowerShell, más reglas `deny` como primera capa. El guard lee git y `gh` también detrás de envoltorios (`bash -c`, `powershell -Command`, `cmd /c`, `eval`, `python -c`, `Invoke-Expression`, nombres armados en tiempo de ejecución) y los bloquea si no los puede leer: correr git directo. Falla cerrado: bloquea toda escritura de `git config`, en cualquier forma (abreviaciones como `--remove-s`, `set`, `unset`, `edit`, secciones, cualquier scope); solo pasan las lecturas (`git config get`, `--get`, `--list`). La config la cambia Daniel a mano. Bloquea `-c`/`--config-env` de la identidad. Una escritura de git (commit, merge, push, pull, tag, `branch -d`, reset, un alias...) solo pasa si el guard sabe con certeza en qué checkout y rama actúa. Ese checkout es el directorio de la sesión más el `-C`/`--git-dir`/`--work-tree` literal del comando. Se bloquea dentro de `$(...)`, en un pipeline, en un subshell o bloque, o después de un `cd`/`pushd`/`Set-Location`, un `export`/`$env:`, un `alias` o una `function` en la misma línea. También con una ruta o ref armada en tiempo de ejecución, o con un subcomando que no conoce. Para otro checkout: `git -C <ruta literal> ...`, en un comando aparte. Tests: `python -m pytest .claude/hooks -q`.
- **Codex** sigue estas mismas reglas por este archivo; los hooks de git lo frenan igual que a Claude Code.
- **GitHub:** rulesets en `main` y `dev` y el check requerido `ci` (`.github/workflows/ci.yml`) son la línea del servidor. Qué configurar: `docs/runs/2026-11-21-A-git-guardrails.md`.
- **Riesgo residual aceptado: el merge "solo Daniel" no lo hace cumplir GitHub.** Los agentes usan las credenciales de Daniel (`gh` y git autenticados como él), así que GitHub no los distingue de Daniel: los rulesets exigen PR y `ci` en verde, pero no pueden exigir quién mergea. El control es local: el guard bloquea `gh pr merge` (también `--auto`), `gh pr review`, todo `gh api` que no sea GET (incluidos `PUT .../pulls/N/merge`, `POST .../merges` y las mutaciones GraphQL `mergePullRequest` y `enablePullRequestAutoMerge`) y el push a `main`. No se crea una cuenta bot. Codex no tiene ese guard: lo ata este archivo.

## Estado del proyecto

- `docs/BACKLOG.md`: las unidades de trabajo (A, B, C...) y su estado. Leerlo al empezar una sesión.
- `docs/runs/`: un reporte por unidad terminada (qué cambió, cómo se verificó, qué quedó pendiente). El estado vive en estos archivos, no en el contexto de la sesión.
- Los reportes de corrida se actualizan en el working tree y viajan con el siguiente commit sustantivo de la unidad; no se hace commit ni push solo para registrar resultados.

## Dos Playwright distintos — no confundir

- **`@playwright/test`** (devDependency, carpeta `tests/`) → suite de pruebas automatizadas. Se corre con `npx playwright test`.
- **Playwright MCP** (global, conectado vía `claude mcp add`) → deja que el agente navegue un browser real en vivo durante la sesión ("abre el sitio y revisa X"). No reemplaza la suite de tests.

## Reglas de contenido (aplican a cualquier copy, bio o case study de este sitio)

- Sin nombres de empleadores actuales ni nombres internos de producto — excepciones: MindTechSourcing y Veflo Trace (producto público).
- Sin métricas, certificaciones, herramientas o empresas inventadas. Si un bullet necesita un número y no lo tengo, preguntar antes de agregarlo.
- Voz: directa, verbos de acción, sin adjetivos vacíos ("apasionado", "proactivo", "rockstar" — prohibidos).
- Antes de redactar cualquier texto en la voz de Daniel, consultar `Estilo_de_Escritura.md` (vive en el proyecto de Claude, no en este repo).

## Skills de diseño disponibles globalmente

`design-taste-frontend`, `redesign-existing-projects` y `web-design-guidelines` están instaladas globalmente (vía `npx skills`, no son parte de este repo) y se activan solas en trabajo de layout/UI. Gobiernan la estética y accesibilidad — no anulan las reglas de contenido de arriba. Que el diseño se vea "premium" no es excusa para inventar una métrica o cifra que suene bien.

## Contexto abierto (informativo, no lista de tareas — puede quedar desactualizado, editar o borrar si ya no aplica)

- PitchCraft se partió en dos casos el 2026-11-25 (Unit G): ver "Case studies y rutas". La fuente editorial es `docs/editorial/pitchcraft-2026-11-25/` (el `05_Owner_Decisions` manda sobre 00-04; `archive/` es solo historia).
- pm-ai-playbook ya no es un case study: vive en Writing como tarjeta de repositorio. No volver a activarlo como "case study" hasta tener contenido real en sus carpetas.
- Las referencias al nombre viejo del repo `PM-AI-Prompts` deben apuntar al renombrado `pm-ai-playbook` (github.com/Dher10).
- Piezas compartidas para futuros case studies: `CaseFigure` (`src/components/shared/case-figure.tsx`) y `CaseCover` (`src/components/shared/case-cover.tsx`, portada con recorte de teléfono). `FactsStrip` se retiró en Unit F. Los figures específicos de PitchCraft viven en `src/components/figures/`. Estilos y tokens: sección "Case study pieces" de `DESIGN.md`.
- El eyebrow del hero dice "New case studies · PitchCraft" y enlaza a `/work` (cambiado 2026-11-25). Cuando deje de ser nuevo, cambiar el texto en `hero.tsx` y el test de `qa-home.spec.ts`.
- Sin JS, todo lo que envuelve `Reveal` queda invisible: el SSR emite el estado `initial` de Framer como `opacity: 0` inline y, sin hidratación, nada lo resuelve. Se caen Proof, las tres case cards, About y Writing; sobreviven hero, nav, el section head de Work y el footer. Comparte causa raíz con el bug de reduced-motion arreglado el 2026-09-05 (el mismo `opacity: 0` del SSR sin dueño): ese fix resolvió el caso con JS, no este. Verificado con Playwright y `javaScriptEnabled: false` contra `next start`. Arreglarlo es una decisión de arquitectura (reveal por CSS, o no emitir estado oculto en SSR), no un parche.
- `toBeVisible()` de Playwright no mira `opacity`: pasa sobre contenido con `opacity: 0`. Dejó pasar los dos casos de `Reveal` de arriba (reduced-motion y sin JS) con 39 tests en verde. Falta un helper de "visible de verdad" (opacity efectiva + dimensiones) para la suite — tarea aparte.
- La suite de Playwright da 1-2 falsos negativos corriendo contra un dev server recién arrancado: el primer test de cada archivo puede caer con `page.goto: Test timeout` por arranque en frío, no por regresión. Visto en las tandas P1 y P3, y en ambas la re-corrida limpia dio 75/75. Si un test falla en la primera corrida, re-correr antes de investigar.
