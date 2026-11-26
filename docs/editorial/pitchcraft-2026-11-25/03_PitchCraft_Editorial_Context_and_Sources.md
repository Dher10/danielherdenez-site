# PitchCraft — Contexto editorial y fuentes (v6, dos casos)

Fecha: 25 de noviembre de 2026. Autor del caso: Daniel Herdenez. Este contexto reemplaza el enfoque de un único caso de v5. Las versiones originales se conservan en `archive/` con su tabla de fuentes completa, no como instrucciones de implementación.

## 1. Objetivo y alcance editorial

PitchCraft es un proyecto personal de Daniel, Product Manager. Explica enfrentamientos de lanzadores abridores de MLB en lenguaje comprensible para aficionados, sin predicciones ni apuestas. El producto público está en https://pitchcraft-agent.vercel.app/ y su código en https://github.com/Dher10/pitchcraft-agent.

Audiencia: reclutadores y hiring managers de Product Management, AI PM y Technical PM. Deben entender qué problema se abordó, qué decidió Daniel, por qué y con qué evidencia. El portafolio muestra cuatro casos independientes, dos de ellos sobre etapas diferentes de PitchCraft.

- Case 03, PitchCraft v1 · Kaggle (`/work/pitchcraft-v1-kaggle`): origen personal, problema, alcance de MVP, decisiones de verificabilidad y capstone de junio–julio de 2026. Corte: `v1.0.0-kaggle`.
- Case 04, PitchCraft v2 · World Series (`/work/pitchcraft-v2-world-series`): transición a producción en octubre, experimentación con LLM, decisiones de lanzamiento, rediseño de temporada baja y proceso de entrega hasta v2.2.0, noviembre de 2026.

El segundo recupera solo el contexto del primero necesario para entender la evolución. Enlaces recíprocos dentro de la prosa; ninguna lectura obligatoria. El identificador World Series describe el contexto que impulsó v2, no limita el contenido a la serie: incluye la evaluación posterior y la experiencia de temporada baja. La siguiente etapa tendrá su propio artículo si existe material editorial suficiente; no publicar un nuevo caso solo porque cambie la versión.

## 2. Reglas editoriales vigentes

- Inglés natural y específico, primera persona sin repetir «I» mecánicamente. Prosa narrativa como Cases 01 y 02, ritmo variado, conexiones causales reales. Mostrar el problema, la tensión y la decisión cuando el relato lo pide. Evitar convertir todos los párrafos en aforismos.
- Sin em dashes, sin «not X but Y» ni «not only X but also Y» como fórmula retórica, sin adjetivos promocionales, transiciones vacías, tríadas automáticas o autocelebración. Las citas textuales tienen prioridad sobre restricciones de estilo.
- No inventar datos, fechas, métricas, impacto, adopción ni atribuciones. No introducir hechos nuevos por una edición de estilo. No implicar que la disponibilidad pública demuestra uso real. Separar hechos verificables, notas personales, inferencias y planes.
- No insinuar que Daniel escribió el código. Él definió el producto, planificó, dirigió, revisó, evaluó y aprobó; los agentes de IA escribieron el código. No confundir agentes deterministas en el runtime con agentes de IA usados en el desarrollo.
- v1: cinco agentes deterministas, sin LLM en ejecución. El critic es el cuarto y el Postgame Grader el quinto (solo para juegos terminados). No presentar el determinismo como superioridad universal ni la comprobación como garantía infalible de verdad.
- v2: se experimentó con un writer LLM (Gemini); nunca se habilitó en producción en el corte del caso. Los reportes publicados se mantuvieron basados en reglas. No confundir el modelo escritor con el modelo juez ni con herramientas de revisión del código.
- No mezclar PitchCraft con empleadores o productos de la suite. Reglas generales del sitio: https://github.com/Dher10/danielherdenez-site/blob/main/AGENTS.md. Consultar `Estilo_de_Escritura.md` en el proyecto de Claude si está disponible, y utilizar el skill Humanizer como revisión, no como permiso para alterar hechos o reescribir citas. En esta edición se aplicaron los criterios manualmente; no se ejecutó el skill ni se tuvo acceso al archivo independiente de estilo.
- Mantener textualmente las dos citas de Case 04: “The guardrails that prevent invention are what flatten the voice.” y “The LLM writes better sentences but says less.” Son reflexiones del autor registradas en `docs/case-study-notes.md`, no resultados generalizables.
- Mantener el cierre personal aprobado para Case 04. El cierre de Case 03 es una propuesta editorial, no una cita documentada; requiere aprobación del autor como parte del copy.
- Respetar las notas visuales, la procedencia de figuras y el patrón del sitio. No restaurar la facts strip ni agregar una capa de capítulos. La fecha/versión de corte es una referencia histórica, no un estado dinámico del aplicativo.

## 3. Matriz de evidencia activa — Case 03

Referencia pública histórica: [tag v1.0.0-kaggle](https://github.com/Dher10/pitchcraft-agent/tree/v1.0.0-kaggle) y [Kaggle write-up](https://github.com/Dher10/pitchcraft-agent/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md).

| Afirmación | Fuente / estado |
|---|---|
| Motivación, conversaciones cercanas y deseo de enseñar a mirar el juego | Notas personales y borrador en español de Daniel, recogidos en contexto v5; no verificable en Git. |
| Capstone del Kaggle AI Agents Intensive, track Freestyle | `docs/KAGGLE_WRITEUP.md`. No afirmar resultado del concurso. |
| Primer commit 28 junio, tag 4 julio de 2026, siete días calendario | Historial Git; primer commit `d9d550dad4f79b01362e57cb498172d2d9c2ce21`, tag `v1.0.0-kaggle`. No decir que Kaggle solo concedió siete días. |
| Hitos planificados con Claude; código por Codex y Claude Code | Notas del autor y contexto v2.1. |
| Descarte de lineups confirmados y de tablas detalladas; decisión de no usar una métrica compuesta de calidad de pitcheo | Brief original de julio compartido por Daniel. El write-up confirma los splits y la preferencia por datos legibles, pero no documenta explícitamente todos los descartes. Mantener como decisiones de primera persona, confirmar con Daniel si hace falta. |
| Statcast y estadísticas de equipos por mano del lanzador; refresh manual y snapshot | Write-up, secciones Data strategy, Limitations; intención de evitar dependencia en el video evaluado en brief original. |
| Game Score de Bill James y letra como capa de lectura | Write-up, Postgame grading. No afirmar que la primera versión carecía de toda señal interna: el repo distingue sus señales derivadas de Stuff+ oficial. |
| Cinco agentes, determinismo sin llamadas LLM y postgame grading | Write-up, Architecture. No atribuir garantía total de precisión. |
| Changeup al 12% por debajo del 15% | Write-up, Verify y The critic loop. Es un umbral de las reglas del producto, no una definición universal del béisbol. El carácter deliberado del caso de prueba procede del brief original de Daniel; el repo confirma la escena y la revisión visible, no esa intención. |
| Diseño de Claude Design, badges y colores | Contexto v2.1; commit del 3 julio y `lib/teamColors.ts`, `components/TeamBadge.tsx`, `app/layout.tsx` del tag. |
| Demo pública y tag congelado | Write-up y D14 del decision log de v2. El enlace público actual no es una instancia congelada de v1. |

Se mantienen fuera del copy el MCP, la rúbrica, los conteos de líneas y commits, el resultado del concurso y cifras que no aportan al relato. El archivo histórico contiene datos adicionales; no son permiso para reintroducirlos.

## 4. Matriz de evidencia activa — Case 04

Referencia de documentación: [commit fd96889](https://github.com/Dher10/pitchcraft-agent/tree/fd96889), del 19 de noviembre de 2026, utilizado en los documentos v5. El corte editorial es v2.2.0; no presentar ese commit como la última versión actual ni actualizar el texto con datos de releases posteriores.

| Afirmación | Fuente / estado |
|---|---|
| Motivación para volver en octubre: operar diariamente y evaluar un writer LLM | Contexto v2.1; `docs/PRD_v2.md` sección 3, D10. |
| PRD, decision log, eval spec, instrucciones; un writer y revisor con contexto fresco; decisiones fuera del plan regresan a Daniel | `AGENTS.md`, `docs/CONTRIBUTING.md`, D35. |
| Seis blockers en primera QA, valores demo en pitchers reales | `docs/qa/QA-phase-0-2026-10-10.md`, QA-01 y veredicto FAIL. |
| Ocho reglas de datos, “unknown is never zero”, corte día anterior | `docs/DATA_CONTRACT.md`, D29 y D34, PRD FR1. |
| Lanzamiento por etapas; primera actualización diaria el 23 octubre, Game 1 World Series | D10, D56, commit `abf58e1a59da6fe69156427130c599c5daf914ce`, índice del archivo. No afirmar que publicó diariamente toda la postemporada. |
| Gemini cita IDs de hechos; validación por código | D54 y D58. |
| Umbral de 5/10; 4/10 pasaron | D64: umbral predefinido del dev run para continuar con Plan A; no era una prueba suficiente de autorización de lanzamiento. Se pasó a Plan B, se congeló el instrumento, se etiquetaron oraciones y se mantuvo producción rules-based. |
| 348 oraciones (113 dev, 235 test) | `docs/results-planB.md`, sección 2. Un único etiquetador, Daniel. Protocolos dev y test difieren; no mezclar ambos para generalizar. |
| Ningún error de número o nombre en test; ejemplo de four-seam | `docs/results-planB.md`, secciones 1 y 12.2. No extender esta afirmación a todo el universo de reportes ni confundir etiquetas de dev con errores de cifras. |
| 40 oraciones marcadas en test, 36 con respaldo; 3/5 reportes aceptados con error | `docs/results-planB.md`, secciones 1 y 4. Son conteos de muestra; no presentar como tasas universales. |
| Juez 79.6%, objetivo 85%, baseline 94.5%, 5/12 errores, kappa 0.17 | `docs/results-planB.md`, sección 8. El copy usa baseline trivial y conteos para expresar la limitación sin jerga. |
| Preferencia por frases del LLM; 11 pares de reportes, resultados opuestos dev/test, único lector, estilo reconocible, reglas ~25% más largas | `docs/results-planB.md`, secciones 7 y 12.1; `docs/case-study-notes.md`. Comparación no plenamente ciega; no afirmar superioridad de reglas en test. |
| Citas destacadas | `docs/case-study-notes.md`, Qualitative verdict y U1 result. Mantener verbatim. |
| Producción mantiene reglas | D56 y D65; release v2.1.0. |
| 40 juegos de postseason, 30 notables, filtros, origen de los reportes | `public/data/archive/index-2026.json`, `docs/releases/v2.1.0.md`. En la revisión anterior se constató que cinco reportes se publicaron en vivo y 35 se reconstruyeron; no es necesario incluir esa cifra nueva en la prosa. |
| Design audit, identidad scoreboard y design system antes de las páginas; v2.1.0 el 17 noviembre | `docs/design-audit.md`, `docs/design/`, D65 y D67, `docs/releases/v2.1.0.md`. |
| Claude Code escribe, Codex audita, Gemini en Antigravity revisa preview, Daniel decide merge | D27, D35, `docs/QA_PROTOCOL.md`, release notes y contexto del autor. |
| 17 hallazgos de auditoría de datos de noviembre | `docs/qa/R4-data-audit-2026-11-14.md`. No confundir hallazgos con blockers. |
| Merge de código como release versionado, daily bot limitado por script a data paths | D15, D41, D42, D68 y `scripts/publish_data.py`. No afirmar que la llave SSH por sí sola limita las rutas. |
| Aprendizajes y cierre personal | Reflexiones de Daniel recogidas en los contextos y conversación editorial. |
| Febrero 2027, página por pitcher, ayuda junto a estadísticas, story angles calculados por código, modelo narrador | D67, plan R5, `docs/case-study-notes.md` Backlog y contexto v5. Plan e intención, no funcionalidad existente. |
| Chat-style questions | Idea exploratoria del autor, no compromiso del PRD. |

## 5. Cambios respecto a los textos separados presentados en conversación

- Nombres, eyebrows, metadata, rutas y cross-links se actualizaron a PitchCraft v1 · Kaggle y PitchCraft v2 · World Series.
- Se reemplazó la frase que sugería que Kaggle había concedido siete días por una descripción del período de construcción. Se distingue la referencia histórica de v1 de la fecha en que se redactó este caso.
- Se precisó el umbral 5/10 de D64: era el criterio del plan de evaluación de desarrollo, no la autorización suficiente de salida a producción.
- Se mantuvo el texto de las dos citas y los pies de figura de v5. Se añadieron únicamente destinos de enlaces y notas para implementar figuras.
- Se reemplazó “View the Kaggle submission” por “Read the Kaggle write-up” para no presentar como página del concurso un enlace que lleva al documento en GitHub. No se enlaza el video.

## 6. Límites y pendientes antes de publicar

No se ha editado Git ni se han ejecutado tests o inspección visual de la nueva implementación. No se ha vuelto a auditar cada afirmación del repo en esta generación del paquete; se conserva la validación previa, la documentación citada y las notas aportadas por Daniel. Los hechos de intención de julio no se presentan como comprobados independientemente por Git. Claude debe comprobar las referencias y el estado actual del sitio antes de implementar, sin ampliar el alcance.

La portada de Case 03 queda pendiente de una fuente visual histórica válida y aprobación del autor. Confirmar la frase de cierre de Case 03 y, si es necesario, los descartes e intención del ejemplo de critic procedentes del brief original. Los cambios de routing son especificación para implementar, no rutas que ya existan. La decisión de redirección de la URL anterior depende de su estado publicado o compartido. El paquete no incluye los assets gráficos ni el skill Humanizer.
