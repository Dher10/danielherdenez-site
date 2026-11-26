# Caso PitchCraft: contexto para el revisor v2

Fecha: 19 nov 2026 · Autor del caso: Daniel Herdenez · Texto: `PitchCraft_Caso_Texto_v2.md`

## Qué es esto

Un caso de estudio para danielherdenez.com, el sitio personal de Daniel (Product Manager). Va en `/work/pitchcraft` como tercer caso. Cuenta la evolución de PitchCraft como proyecto personal: la idea, el sistema visual básico y la entrada a Kaggle (julio 2026), la decisión de seguir con lo aprendido sobre IA y desarrollo con agentes (octubre), el eval del writer con LLM como clímax, el rediseño para temporada baja (noviembre) y lo que Daniel aprendió en el camino.

**Producto:** PitchCraft explica duelos de lanzadores abridores de MLB en lenguaje simple para fans casuales. No predice resultados y no tiene relación con apuestas. Producción: pitchcraft-agent.vercel.app. Código: github.com/Dher10/pitchcraft-agent.

**Lector del caso:** reclutadores y hiring managers de producto (PM, AI PM, Technical PM) en empresas de IA y SaaS. Tienen poco tiempo y quieren ver criterio, no solo un demo.

**Qué tiene que lograr:** que en un par de minutos se entienda qué construyó Daniel, qué decidió y con qué evidencia.

**Idioma y voz:** inglés, primera persona, tono calmado y específico. El texto ya pasó por un humanizer.

## Qué te pedimos como revisor

1. Claridad y ritmo del inglés para ese lector.
2. Frases que suenen a texto generado por IA.
3. Cualquier afirmación que no veas respaldada en la tabla de fuentes de abajo.
4. Tres propuestas para la frase de cierre (ver la sección "Frase de cierre").

Devuelve los cambios como sugerencias marcadas, no como un texto reescrito entero.


### Reglas que el editor debe respetar

1. No agregar cifras, fechas, herramientas ni afirmaciones que no estén en la tabla de fuentes. Si una frase necesita un dato que no está, marcarla para Daniel, no completarla.
2. Daniel no escribió el código: lo escribieron agentes de IA bajo su revisión. El texto no puede insinuar lo contrario.
3. El caso nunca presenta a PitchCraft como predicción ni apuestas, ni el writer con LLM como algo publicado.
4. Sin em dashes en texto corrido, sin "not X but Y", sin adjetivos que no defienda un hecho. Primera persona.
5. Las cifras del eval se reportan con sus límites (muestra pequeña, comparación no del todo ciega, kappa bajo). Quitar los límites infla el resultado.
6. Las dos citas en serif son palabras textuales de Daniel registradas en el repo. No se reescriben.

### Fuentes por afirmación

Repo: github.com/Dher10/pitchcraft-agent, rama main, commit fd96889 (19 nov 2026).

| Afirmación | Fuente |
|---|---|
| Daniel planeó cada hito en un chat con Claude; Codex y Claude Code escribieron el código | Resumen del chat "Kaggle Capstone - PitchCraft Agent" (jul 2026) |
| Sistema visual de Kaggle: mockup de Claude Design, color por cada uno de los 30 equipos, badge de equipo, una familia tipográfica (IBM Plex), aplicado por Claude Code el 3 jul | Commit del 3 jul "Apply visual polish from Claude Design mockup: team badges, colors, chart/tile polish"; `lib/teamColors.ts`, `components/TeamBadge.tsx` y `app/layout.tsx` en el tag `v1.0.0-kaggle`; resumen del chat de julio |
| Razones para seguir: que corriera a diario en la postemporada y probar un eval real de un writer con LLM | Memoria del proyecto (oct 2026): "el proyecto de evals de la Fase 1 se construye sobre PitchCraft"; `docs/PRD_v2.md`, sección 3 |
| El 10 oct entraron el PRD v2, el registro de decisiones, el eval spec, el flujo de git y las reglas de agentes | Fecha de creación de `docs/PRD_v2.md`, `docs/DECISIONS.md`, `docs/eval-spec.md`, `docs/CONTRIBUTING.md` y `.githooks/` (todos 2026-10-10); commits del 10 oct |
| El arnés: un escritor a la vez, plan aprobado, revisor con contexto limpio que solo ve el diff y el plan, paradas obligatorias | D35 (15 oct, de ahí "within a week"); `AGENTS.md` línea 58 |
| Hook y reglas de GitHub bloquean force-push, reescritura de historia y trabajo de agentes en main; hook de commit verifica la identidad | `AGENTS.md`, sección de seguridad de git (líneas 66 a 72 y 103 a 105); D21 |
| Primer commit 28 jun 2026, tag v1.0.0-kaggle 4 jul 2026, 15 commits, commits en 6 días | git log del repo (`git rev-list --count v1.0.0-kaggle` = 15) |
| Capstone del Kaggle AI Agents Intensive, track Freestyle | docs/KAGGLE_WRITEUP.md |
| Cinco agentes (Data Scout, Matchup Analyst, Report Writer, Critic, Postgame Grader), sin LLM, determinísticos | docs/KAGGLE_WRITEUP.md, sección Architecture |
| Bill James Game Score | docs/KAGGLE_WRITEUP.md, sección Postgame grading |
| Ejemplo del changeup al 12 %, umbral de 15 % | docs/KAGGLE_WRITEUP.md, secciones Verify y The critic loop |
| v1 corría con un comando, sin cron | docs/KAGGLE_WRITEUP.md, sección Data strategy |
| Primer QA de v2 con FAIL y seis blockers; los siguientes encontraron datos demo en abridores en vivo y umbrales mal redondeados | Resumen del chat "Plan de evals y PitchCraft"; informes en docs/qa/QA-phase-0-*.md. El primero (10 oct) dio FAIL con seis blockers. Verificar el detalle en esos informes |
| Contrato de datos con ocho reglas, "unknown is never zero" | docs/DATA_CONTRACT.md, sección 2; D34 |
| Corte en el día anterior al juego | D29; PRD_v2 FR1 |
| Lanzamiento en dos tramos por la postemporada | D10 |
| Primera publicación diaria el 23 oct, Juego 1 de la Serie Mundial el 23 oct | Commit del bot "data: daily update 2026-10-23"; public/data/archive/index-2026.json (juegos de Serie Mundial del 23 al 28 oct) |
| Línea fijada antes: 5 de 10; resultado 4 de 10 | D64 |
| Writer con Gemini en capa gratuita | D46, D47, D54 |
| 348 oraciones (113 dev, 235 test), re-etiquetado ciego de una muestra (12 dev, 24 test) | docs/results-planB.md, secciones 2 y 7 |
| Ningún error fue un número o nombre inventado | docs/results-planB.md, sección 1 (test: 0 wrong-number-or-name) y sección 12 (los 12 "wrong-number-or-name" de dev son la misma glosa de plantilla, no un número ni nombre incorrecto). El editor debe saber esta corrección |
| Errores restantes: juicios de similitud y líneas "watch" | docs/results-planB.md, sección 12.2 |
| 40 oraciones marcadas en test, 36 correctas; 19 de las falsas alarmas vienen de W1.entity en 2 reportes | docs/results-planB.md, sección 1 |
| 3 de 5 reportes aceptados en test con una oración no soportada | docs/results-planB.md, sección 1 |
| Juez: 79,6 %, meta 85 %, línea trivial 94,5 %, encontró 5 de 12 errores | docs/results-planB.md, sección 8 (kappa 0,17, no citado en el texto por ser técnico) |
| U1: 3 victorias, 1 empate, 7 derrotas en 11 pares; dev y test en direcciones opuestas; reconocía el estilo; reportes de reglas ~25 % más largos | docs/results-planB.md, secciones 7 y 12.1; docs/case-study-notes.md |
| Cita del pull quote | docs/case-study-notes.md, "Qualitative verdict (Nov 4 2026)", palabras de Daniel |
| Cita del serif beat | docs/case-study-notes.md, "U1 result" (Nov 7 2026), declaración de Daniel |
| Producción se queda con reglas | D56, D65 |
| Último juego el 28 oct | public/data/archive/index-2026.json |
| 40 juegos, 30 destacados, cuatro razones | index-2026.json (count 40, notable_count 30); release v2.1.0 |
| Auditoría de la interfaz, dirección "scoreboard", logo con home plate y zona de strike, sistema de diseño antes de páginas nuevas | docs/design-audit.md; D65; D67; docs/design/ |
| v2.1.0 el 17 nov con página por juego, archivo con filtros y destacados | docs/releases/v2.1.0.md; tag v2.1.0 |
| Claude Code escribe, Codex audita, Antigravity QA final, Daniel hace el merge | D27, D35; docs/releases/*.md; memoria del proyecto |
| Agentes sin acceso a main, tags ni historia; hook de git; identidad de commits | D14, D20, D21, D35 |
| Bot con llave que solo escribe datos | D15, D41, D42 |
| Test rojo primero | docs/releases/*.md ("a red test before each change") |
| 68 decisiones, 15 informes de QA, 255 commits, 240 después de Kaggle | DECISIONS.md; docs/qa/ (15 .md); git rev-list en main |
| Notas de release desde el 17 nov | D68; docs/releases/ |
| Ángulos calculados por código (writer v3) | docs/case-study-notes.md, Backlog |
| Congelado hasta febrero 2027 | Proyecto Profesional, PitchCraft_Estado_2026-11-15.md, replan del 14 nov |
| Infraestructura $0 | D9, D26, D46, D47 |
| Auditoría de interfaz hecha por un agente antes del rediseño | `docs/design-audit.md` (7 nov, "read-only pass") |
| Sistema de diseño con tokens, componentes, páginas y reglas de contenido, en el repo para los agentes; ninguna página nueva antes de aprobarlo | `docs/design/` (`tokens.json`, `COMPONENTS.md`, `PAGES.md`, `CONTENT.md`); D65 (orden) y D67 |
| Codex audita cada fase con un protocolo escrito | D27; `docs/QA_PROTOCOL.md` |
| Rama de desarrollo, merge a main solo por Daniel vía pull request; cada merge es un release desde el 17 nov | D14, D41, D68 |
| La auditoría de datos antes del release de noviembre: 17 hallazgos, 7 blockers, todos corregidos | `docs/qa/R4-data-audit-2026-11-14.md`; `PitchCraft_Estado_2026-11-15.md` en el proyecto |
| "What I learned": unir el gusto por el béisbol con el trabajo de PM, y ampliar lo que sabe de CI/CD, desarrollo con agentes, QA y buenas prácticas | Declaración de Daniel en el chat del 19 nov 2026. Las lecciones son su lectura de los hechos citados arriba; el revisor puede ajustar la redacción, no agregar lecciones nuevas |
| 28 oct = Juego 5 de la Serie Mundial, juego que cerró la serie (gamePk 849799) | `index-2026.json` (razones series_clincher y world_series); `docs/design-audit.md`, sección 1 |

### Decisiones editoriales tomadas en este borrador

1. **Ángulo:** cómo una entrada de concurso se convierte en producto, con el eval como clímax (pedido de Daniel, 19 nov).
2. **Fuera del caso:** el recorte del servidor MCP en Kaggle. Viene del chat de julio y no está en el repo, así que no se puede verificar desde el caso.
3. **Kappa 0,17 no se cita** en el texto por ser técnico; se reemplazó por la comparación con un juez que siempre dice "supported", que dice lo mismo en lenguaje llano. Está en la ficha.
4. **El rol se dice explícito** en la franja de datos y en "How it ships": el código lo escribieron agentes.
5. **Fechas sobrias:** "By November" en vez de "four months later", porque de julio al 19 de noviembre no son exactamente cuatro meses.
6. **Sección de fuentes al final del caso**, con rutas del repo, para que cualquier lector pueda verificar.
7. **Nombres de herramientas** (Claude Code, Codex, Gemini, Antigravity, Claude Design, Kaggle) se nombran: son públicos y son evidencia.
8. **Figura de Kaggle eliminada:** el despliegue de la versión de julio ya no existe en Vercel, así que la primera figura muestra la vista diaria del 28 de octubre, que conserva el diseño anterior al rediseño.
9. **Nueva estructura (v2, pedido de Daniel del 19 nov):** el caso cuenta la evolución desde la idea; el proceso con agentes se presenta como parte de la historia (sección "Round two") y no solo como apéndice; se agregó "What I learned".

**Nota sobre U1 (comparación de reportes completos).** En el set de test solo, el LLM ganó 3 de 5 comparaciones. El 7 de 10 a favor de las reglas sale de sumar dev y test, que apuntaron en direcciones opuestas (prueba de signo exacta, p = 0,34). Por eso el texto dice que once pares no alcanzan para decidir. No conviertas esa cifra en una conclusión más fuerte.


## Frase de cierre: la propone el revisor

Va en serif grande al final, después de "What's still open". Daniel no ha elegido una. Dirección que pidió:
- Cómo una idea que nace de un gusto personal se vuelve un producto que se puede abrir y sigue iterando.
- La IA lo acompañó en todas las etapas, y las decisiones fueron suyas.
- Empezar con "I built PitchCraft because I like baseball and wanted to see how far a contest idea could go with AI at my side." Esa primera mitad le gusta; las continuaciones probadas hasta ahora no.

Restricciones:
- Corta: una o dos frases que quepan en unos 28 caracteres por línea sin pasar de cuatro líneas.
- Nada que caduque con la próxima versión ("four releases later"), ni datos de uso que no existen ("people use it").
- Sin "passion", sin aforismos ni contrastes del tipo "not X but Y".
- Propón 3 opciones con una línea de justificación cada una.

## Figuras previstas

| # | Qué muestra | Origen |
|---|---|---|
| 1 | La vista diaria del 28 de oct (Juego 5 de la Serie Mundial) antes del rediseño | `docs/design-audit/screens/03-live-game-desktop.png`, recortada |
| 2 | Diagrama del pipeline diario | Lo dibuja Claude con los tokens del sitio |
| 3 | Gráfico: 40 oraciones marcadas en test, 36 correctas y 4 errores | Lo dibuja Claude, datos de `results-planB.md` sección 1 |
| 4 | Antes y después del mismo juego en teléfono | Antes: `04-live-game-mobile.png`. Después: captura de `/game/849799` que toma Daniel |

## Pendiente de Daniel

1. Elegir la frase de cierre entre las propuestas del revisor.
2. Confirmar la línea de rol de la franja de datos.
3. Capturas de producción para la figura 4 y la imagen del caso.
