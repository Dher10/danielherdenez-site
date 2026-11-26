# Caso PitchCraft: contexto para el revisor v5

Fecha: 25 nov 2026 · Autor: Daniel Herdenez · Texto: `PitchCraft_Caso_Texto_v5.md` · Contexto anterior: `PitchCraft_Caso_Contexto_Revisor_v4.md` (tabla de fuentes completa en `..._v2.md`)

## Qué cambió de v4 a v5 y por qué

El v4 se construyó en el sitio y se revisó en el preview. Daniel lo leyó en el teléfono y encontró que el texto se sentía estático: párrafos correctos uno al lado del otro, sin el hilo de alguien contando qué hizo y por qué. Los casos 01 y 02 del sitio son prosa narrativa con conectores y razones, y el 03 rompía ese patrón. Una auditoría de diseño y UX (Codex, 24 nov) marcó además como densa la parte central del caso.

Cambios:
1. **Introducción nueva** escrita a partir de un borrador de Daniel en español: el béisbol como juego lento que le atrae, las preguntas de personas cercanas, el muro de las estadísticas y la idea de entrenar el ojo del fan. Es experiencia personal de Daniel; no tiene fuente en el repo.
2. **Conectores y razones en todo el caso.** Cada párrafo parte del anterior.
3. **Sección del writer reordenada como historia:** umbral fallido, etiquetado, tipo de error, qué tan bien lo atrapaban los checks, juez, preferencia de Daniel. La figura 2 queda justo después de los números que muestra.
4. **Decisión de lanzar primero los reportes por reglas** movida antes de la evaluación, como consecuencia de la fecha límite.
5. **Franja de datos eliminada** (Built with, Status, Infrastructure cost). En su lugar, una línea bajo la bajada: "Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗", para que el caso quede fechado contra una versión y no envejezca con cada release. Decisión de Daniel.
6. **Etiquetas de capítulo:** "Running every day, October 2026" pasa a "Live for the World Series"; "Why I kept the rules-based reports / The writer" pasa a "Testing an AI writer".
7. **"Still open" pasa a "What's next" (25 nov).** Decisión de Daniel: este caso es el corte en v2.2.0 y la siguiente etapa tendrá su propio artículo. La sección ahora cuenta hacia dónde va el producto en lugar de listar lo no resuelto. Los límites de la evaluación siguen en el texto, en la sección del writer ("I was the only reader, I could recognize the model's style"). Lo que desaparece del texto: que ningún check detecta afirmaciones de similitud entre lanzadores y que la comparación no fue del todo ciega (esto último se conserva en parte en la sección del writer).

## Fuentes de "What's next"

| Afirmación | Base |
|---|---|
| La siguiente etapa empieza en febrero | D67: congelado hasta febrero 2027 |
| Página por lanzador | R5 en el plan: rutas `/pitcher/<id>` y `/pitchers` (`PitchCraft_Estado_2026-11-14.md`) |
| Ayuda junto a cada estadística | Intención de Daniel ("incluir ayudas" en la interfaz) |
| Writer de nuevo, con el código decidiendo qué decir y el modelo escribiendo desde hechos citables | Writer v3 congelado hasta febrero: "ángulos de historia por código"; v4 decía "have the code identify a pitcher's profile and the opposing lineup's weakness, then give those facts to the model to cite" |
| Voz más cercana en los reportes | Intención de Daniel; la redacción de los reportes del writer de reglas quedó para febrero 2027 |
| "I'm also exploring a chat-style way to ask PitchCraft questions" | Idea de Daniel, no está en el PRD ni en el plan. Por eso dice "exploring", no "will build" |

## Frases con interpretación nueva (no estaban en v4)

Daniel las aceptó al leer el borrador; el revisor debe juzgar si están respaldadas por los hechos del caso o si exageran.

| Frase | Base |
|---|---|
| "every sentence could be traced back to the data" | El critic revisaba cada afirmación con evidencia (`KAGGLE_WRITEUP.md`) |
| "That small moment holds the idea behind everything that came later: PitchCraft is only useful if what it says is true." | Hilo del caso: data contract ("unknown is never zero"), evaluación centrada en afirmaciones sin respaldo |
| "Every game starts with two starting pitchers, so that's where I started" | Agregada por Claude para explicar el foco en abridores; Daniel la aceptó |
| "The process paid off right away." | El primer QA encontró seis blockers (`docs/qa/QA-phase-0-2026-10-10.md`) |
| "numbers that looked real and weren't" | QA-01: valores demo en abridores en vivo |
| "to be taken only if the evaluation supported it" | Umbral de lanzamiento fijado antes de la corrida (`results-planB.md`) |
| "The checks were rejecting good sentences and letting bad ones through." | 36 de 40 marcadas tenían respaldo; 3 de 5 aceptadas tenían una oración sin respaldo (`results-planB.md` sección 1) |
| "The last measure was my own preference, and it turned out to be the least reliable." | Elecciones opuestas entre dev y test en 11 pares; único lector; estilo reconocible |
| "The model wrote well; what I couldn't do yet was stop it from saying things the facts didn't support." | Resume la decisión ya documentada |
| "so a fan can go straight to the duels" | Las razones de notable funcionan como filtros en `/notable` |
| "because without it each of them would have built its own version" | Razón de Daniel para aprobar el design system antes de las páginas nuevas |
| "taught me CI/CD, agentic development and QA by doing them" | Reformulación de v4 ("expanded what I know about CI/CD, agentic development and QA") |

## Afirmaciones de la introducción (experiencia de Daniel)

- Las reglas recientes para acelerar el juego existen (reloj de lanzamiento, MLB 2023); el texto no da fechas ni cifras.
- "more than most sports" reemplaza "más que en cualquier otro deporte" del borrador de Daniel para que sea defendible.
- ERA, wRC+ y FIP son estadísticas reales. El borrador decía "Wrc"; Daniel confirmó que es wRC+.
- "Kaggle's AI Agents Intensive and its capstone competition": la entrada de julio fue el capstone del curso (`KAGGLE_WRITEUP.md`).

## Lo que no cambió

Todos los números, fechas y fuentes del v4: 28 jun a 4 jul; cinco agentes; changeup 12 % bajo el umbral de 15 %; seis blockers; ocho reglas; 23 oct; umbral 5 de 10 y 4 aprobados; 348 oraciones (113 dev, 235 test); 36 de 40; 3 de 5; juez 79,6 %, meta 85 %, 94,5 %, 5 de 12; 11 pares; 25 % más largos; 40 juegos, 30 notables; 2.1.0 el 17 nov; 17 hallazgos en la auditoría de datos; febrero. Figuras, pies, cierre, CTA y fuentes iguales.

## Qué se le pide al revisor

1. Que confirme que la introducción y los conectores no contradicen ni inflan los hechos.
2. Que marque cualquier frase de las tablas que no se sostenga, en especial que "What's next" no prometa algo que el plan no tiene.
3. Que revise el ritmo y la cohesión frente a los casos 01 y 02 (prosa narrativa en primera persona).
4. Que señale cualquier rastro de escritura de IA que haya sobrevivido al humanizer.
