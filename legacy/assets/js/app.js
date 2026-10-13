(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- data ---------- */
var GATES={
 G1:{name:"Estrategia de pruebas aprobada",from:"Planeación → Diseño",cond:"Test Plan, matriz de trazabilidad y matriz de riesgos completos",evid:"Firma formal de la estrategia",who:"Product Strategist, Platform Engineers y stakeholder principal"},
 G2:{name:"Suite diseñada y aprobada",from:"Diseño → Ambiente",cond:"100% de los casos vinculados a historias de usuario en TestMu AI",evid:"Suite aprobada; exclusiones registradas como Riesgo de Cobertura",who:"Product Owner / Product Strategist"},
 G3:{name:"Ambiente y datos habilitados",from:"Ambiente → Ejecución",cond:"Smoke test de ambiente aprobado y datos anonimizados disponibles",evid:"Log de smoke test y notificación oficial de inicio",who:"Product Strategist comunica el inicio"},
 G4:{name:"SIT aprobado",from:"SIT → UAT (dentro de Ejecución)",cond:"Cero defectos críticos o altos abiertos",evid:"Reporte de resumen de pruebas SIT",who:"QA Lead"},
 G5:{name:"Acta de conformidad firmada",from:"Ejecución → Cierre",cond:"Criterios de aceptación UAT cumplidos, sin críticos o altos abiertos",evid:"Acta de conformidad (deuda técnica documentada si aplica)",who:"Product Owner + QA Lead"},
 G6:{name:"Sign-off formal de QA",from:"Cierre → Despliegue",cond:"Pass Rate ≥ 80%, Defect Leakage < 20%, Reopen Rate < 10%",evid:"Test Summary Report",who:"QA Lead, Platform Engineer y Product Strategist"}
};
function S(t,d,r,o){return {t:t,d:d,r:r,o:o}}
var PH=[
{id:"planeacion",n:1,name:"Planeación",sop:"SOP-QA-001",title:"Planeación y estrategia de pruebas",
 purpose:"Estandarizar la participación de QA en las sesiones funcionales, la estrategia y el Test Plan para asegurar entregas estables.",
 inputs:["README","PRD","Business Case","Caso de uso"],pre:"Viabilidad del PRD aprobada por PMO",gate:"G1",
 steps:[S("Analizar la documentación de entrada","Revisar el README, el PRD, el Business Case y el caso de uso entregados en el hito de Alistamiento por el equipo de gestión.","QA Lead","Análisis de entrada documentado"),
  S("Participar en el refinamiento funcional","Desde Discovery, junto con el Product Strategist y los Platform Engineers, validar criterios de aceptación, casos de uso y la matriz de trazabilidad.","QA Lead + Product Strategist","Criterios DoR validados"),
  S("Elaborar el Test Plan","Documentar el Test Plan definiendo alcances y prioridades de las pruebas.","QA Lead","Test Plan"),
  S("Construir las matrices de trazabilidad y riesgos","Evaluar cada riesgo por su impacto técnico y de negocio.","QA","Matriz de riesgos inicial"),
  S("Aprobar la estrategia","Presentar la estrategia para revisión y obtener la firma formal del Product Strategist, los Platform Engineers y el stakeholder principal.","QA Lead","Aprobación formal (Stakeholder Map SOP-STR-001)")],
 ex:[["PRD o Business Case ambiguo","El QA Lead escala de inmediato al Product Strategist antes de avanzar al paso 3."],
  ["No se logran definir los criterios DoR","Documentar el bloqueo en la Matriz de Riesgos y escalar al Product Strategist y al Platform Engineer."],
  ["Tiempo de Discovery insuficiente","Negociar con el Product Strategist una estrategia basada en riesgos y registrar la excepción en el Test Plan."],
  ["Riesgo crítico que invalida el release","Notificar al Product Strategist, Platform Engineer y QA para decidir stop-gap o replanificación."]]},
{id:"diseno",n:2,name:"Diseño",sop:"SOP-QA-002",title:"Diseño de test cases y cobertura",
 purpose:"Diseñar casos con una base de prueba sólida, trazabilidad y cobertura lógica (happy paths, errores, edge cases y valores límite) antes de ejecutar.",
 inputs:["Criterios de aceptación","Mockups","Contratos API (Swagger)"],gate:"G2",
 steps:[S("Analizar la Test Basis","Revisar criterios de aceptación, mockups y contratos de API (Swagger) para identificar condiciones de prueba y reglas de negocio.","QA Engineer","Test Basis validada"),
  S("Identificar condiciones de prueba","Definir escenarios de alto nivel y reglas de negocio críticas a partir del análisis.","QA Engineer","Lista de condiciones"),
  S("Validar la cobertura unitaria","Verificar que desarrollo ejecutó pruebas unitarias con cobertura óptima antes de iniciar pruebas funcionales.","QA Lead","Reporte de cobertura"),
  S("Diseñar los casos","Aplicar técnicas de caja negra (partición de equivalencia, valores límite, tablas de decisión) para casos positivos, negativos y edge cases.","QA Engineer","Matriz de casos en TestMu AI"),
  S("Revisión de pares","Validar lógica, cobertura y consistencia de los casos con otro integrante de QA antes de implementarlos.","QA Engineer","Casos validados"),
  S("Preparar casos de API","Diseñar test cases de API en Postman/Newman y validar la integridad de los contratos.","QA Tester (API)","Colecciones de API validadas"),
  S("Configurar la matriz de datos","Configurar los datos de prueba (SOP-QA-003) para los escenarios, garantizando anonimización y disponibilidad.","QA Tester / Platform Engineer","Matriz de datos en Excel"),
  S("Validación estática de UI","Revisar mockups contra criterios de aceptación (layout, componentes, flujo) antes de la maquetación final.","QA Engineer","Check-list de revisión UI"),
  S("Trazabilidad y aprobación","Vincular el 100% de los casos en TestMu AI con las historias de usuario y obtener la aprobación de la suite.","QA Lead","Suite diseñada y aprobada")],
 ex:[["Información insuficiente en la Test Basis","Registrar un “Bloqueo de Diseño” y notificar al Product Strategist para su aclaración."],
  ["El bloqueo afecta los plazos del hito","Nivel 1: QA Lead (ajuste de alcance). Nivel 2: Product Strategist / Product Owner. Nivel 3: PMO (cronograma y riesgos)."],
  ["Cobertura reducida o excluida","Documentar en TestMu AI como “Riesgo de Cobertura”; el Product Owner aprueba formalmente el “Fuera de Alcance”."]]},
{id:"ambiente",n:3,name:"Ambiente y datos",sop:"SOP-QA-003",title:"Configuración de entorno y datos de prueba",
 purpose:"Preparar a tiempo datos estáticos y matrices en Excel para ejecutar pruebas manuales y automatizadas en SIT y UAT de forma segura.",
 inputs:["Test cases diseñados","Pipelines CI/CD","Bases de datos Oracle"],gate:"G3",
 steps:[S("Verificar el entorno","Verificar disponibilidad y estabilidad del entorno (SIT/UAT) y de los pipelines de CI/CD.","DevOps / Platform Engineer","Reporte de estado del entorno"),
  S("Mapear requerimientos de datos","Derivar de los test cases los datos necesarios: roles, tokens y registros.","API Tester","Requerimientos de datos listos"),
  S("Generar credenciales","Coordinar con Seguridad credenciales y perfiles de prueba en QA, SIT y UAT.","API Tester + Seguridad","Credenciales autorizadas"),
  S("Construir la matriz de datos","Matriz en Excel con parámetros de entrada categorizados y estados esperados en base de datos.","API Tester","Matriz de datos (Excel)"),
  S("Enmascarar y anonimizar","Aplicar políticas de enmascaramiento y anonimización para no usar información sensible real.","Seguridad","Datos anonimizados"),
  S("Validar integridad de datos","Confirmar existencia e integridad de los datos en las bases y su disponibilidad para ejecución.","Platform Engineer","Ambiente de datos habilitado"),
  S("Smoke test de ambiente","Validar conectividad y configuración básica antes de las pruebas funcionales.","QA","Log de smoke test"),
  S("Comunicar el inicio","Comunicar oficialmente la disponibilidad del ambiente y los datos para iniciar la ejecución.","Product Strategist","Notificación de inicio de pruebas")],
 ex:[["Entorno o CI/CD inestable","Escalar a DevOps / Platform Engineer; si el bloqueo supera 4 horas se avisa al Product Strategist para ajustar el cronograma."],
  ["Datos sin anonimizar","Se detiene el proceso y se escala a Seguridad y al QA Lead. Está prohibido procesar datos reales."],
  ["Dependencia de terceros","El API Tester escala al Product Strategist para resolverlo con los stakeholders comerciales."],
  ["Configuración con errores críticos","Registrar defecto “Crítica” en Jira; el QA Lead y el Product Strategist evalúan suspender el ciclo."]]},
{id:"ejecucion",n:4,name:"Ejecución",sop:"SOP-QA-004 a 007",title:"Ejecución en cuatro niveles",
 purpose:"Validar el producto de lo visual a lo funcional y de lo técnico al negocio: prototipos, unidades y API, integración y aceptación.",gate:"G5",
 levels:[
  {id:"uiux",name:"UI/UX",sop:"SOP-QA-004",title:"Pruebas UI/UX sobre prototipos",who:"QA Manual",where:"Prototipo navegable en Lovable o Figma",exit:"Reporte de cierre de pruebas",
   purpose:"Validación navegable de usabilidad, diseño visual y experiencia sobre prototipos, antes o en paralelo al desarrollo.",
   steps:[S("Analizar requisitos","Revisar PRD, wireframes, business case y design system o UI Kit para definir criterios de aceptación UI/UX.","QA Manual","Matriz de cobertura inicial"),
    S("Diseñar el checklist","Checklist de validación basado en flujos críticos y heurísticas de usabilidad.","QA Manual","Suite de pruebas UI/UX"),
    S("Preparar el entorno","Validar acceso al prototipo navegable (Lovable/Figma) y a los assets necesarios.","QA Manual","Entorno validado"),
    S("Validación visual","Verificar alineación estricta con el UI Kit: tipografías, colores y componentes.","QA Manual","Reporte de cumplimiento visual"),
    S("Pruebas de usabilidad","Evaluar navegabilidad, responsividad y claridad de mensajes de error.","QA Manual","Resultados de usabilidad"),
    S("Pruebas exploratorias","Pruebas no estructuradas para detectar comportamientos inesperados.","QA Manual","Hallazgos exploratorios"),
    S("Reportar defectos","Registrar en Jira las discrepancias con evidencia (capturas o videos).","QA Manual","Bugs reportados en Jira"),
    S("Evaluar y cerrar","Validar criterios de salida, verificar correcciones y emitir el resumen final.","QA Lead","Reporte de cierre de pruebas")],
   ex:[["Prototipo inaccesible","Notificar de inmediato al Product Strategist."],["Discrepancia con el UI Kit","Escalar al Product Strategist para aclarar antes de registrar el bug."],["Flujo fuera del PRD","Reportar al Product Strategist para validar alcance."],["Tiempo insuficiente","Priorizar flujos críticos y documentar la excepción en el Test Plan."]]},
  {id:"api",name:"Unitarias y API",sop:"SOP-QA-005",title:"Pruebas unitarias y de API",who:"Developer / QA · API Tester",where:"Postman y Swagger, antes de integrar en la UI",exit:"Endpoints validados y reporte de excepciones",
   purpose:"Ejecución manual sobre APIs y servicios REST verificando payloads, códigos de respuesta y manejo de excepciones.",
   steps:[S("Analizar y diseñar","Revisar PRD y Swagger para identificar escenarios basados en criterios de aceptación.","QA / API Tester","Matriz de escenarios"),
    S("Preparar entorno y datos","Configurar Base URL, tokens y headers; preparar datos válidos e inválidos.","QA / API Tester","Entorno y data set listos"),
    S("Pruebas unitarias","Validar la lógica de funciones aisladas o métodos clave.","Developer / QA","Resultados de pruebas unitarias"),
    S("Pruebas de API","Ejecutar peticiones (GET, POST…) verificando códigos de respuesta, latencia y estructura de payloads.","QA / API Tester","Endpoints validados"),
    S("Validación negativa","Inyectar payloads malformados o tipos inválidos para verificar el manejo de errores.","QA / API Tester","Reporte de excepciones"),
    S("Reporte y cierre","Registrar evidencias en TestMu/Jira, reportar defectos y actualizar el estado de ejecución.","QA / API Tester","Tickets de defectos y evidencia")],
   ex:[["Entorno no disponible o falta de datos","Registrar el bloqueo en Jira y notificar al QA Lead, que escala a DevOps / Platform Engineer."],["Ambigüedad de negocio","El QA Lead escala al Product Strategist."],["Bloqueo crítico de proyecto","El QA Lead escala a la Dirección de Operaciones."]]},
  {id:"sit",name:"SIT",sop:"SOP-QA-006",title:"Pruebas de integración de sistemas",who:"QA Engineer",where:"Build en Staging/QA, suite en TestMu AI",exit:"Cero críticos o altos: habilita UAT (G4)",gateIn:"G4",
   purpose:"Integración de sistemas y regresión funcional end-to-end para certificar la estabilidad antes de convocar a UAT.",
   steps:[S("Confirmar despliegue y datos","Confirmar el build en Staging/QA y la disponibilidad de los datos de prueba.","QA Engineer","Ambiente y datos listos"),
    S("Smoke test","Validar la disponibilidad crítica del sistema.","QA Engineer","Smoke test aprobado"),
    S("Ejecutar la suite SIT","Casos funcionales y E2E en TestMu AI.","QA Engineer","Casos SIT ejecutados"),
    S("Gestionar defectos","Registrar y dar seguimiento a los defectos encontrados.","QA Engineer","Defectos reportados"),
    S("Retest","Verificar la corrección de los defectos reportados.","QA Engineer","Retest completado"),
    S("Regresión core","Asegurar la integridad de las funciones existentes.","QA Engineer","Regresión superada"),
    S("Reporte y criterios de salida","Generar el reporte de resumen y validar cero defectos críticos o altos para habilitar UAT.","QA Lead","Reporte y aprobación UAT")],
   ex:[["Bloqueante técnico","Documentar en la herramienta como “Bloqueante” y notificar al responsable de ambiente o infraestructura."],["Sin resolver en 4 horas o afecta el hito","Escalar: QA Lead → Product Strategist → PMO / Gerencia."]]},
  {id:"uat",name:"UAT",sop:"SOP-QA-007",title:"Pruebas de aceptación del usuario",who:"Usuarios de negocio (mínimo 7–8 PGN) + QA",where:"Ambiente estabilizado con perfiles de usuario",exit:"Acta de conformidad firmada (G5)",
   purpose:"Soporte y guía para que los usuarios de negocio y el cliente ejecuten manualmente las pruebas de aceptación.",
   steps:[S("Planificar y diseñar","Definir matriz de trazabilidad y test cases UAT basados en el PRD.","QA Lead","Matriz y casos definidos"),
    S("Preparar el ambiente","Estabilizar entorno, datos de prueba y perfiles de usuario.","QA Lead + Platform","Ambiente listo"),
    S("Smoke test","Pruebas de sanidad para verificar la estabilidad del build.","QA","Build verificado"),
    S("Ejecución funcional y E2E","Escenarios de negocio integrados según las guías de prueba.","Usuarios de negocio + QA","Ejecución completada"),
    S("Gestión de defectos","Registrar, categorizar y dar seguimiento a las desviaciones.","QA","Reporte de defectos"),
    S("Evaluar criterios de salida","Analizar resultados contra los criterios de aceptación.","QA Lead","Análisis de resultados"),
    S("Cierre de ciclo","Firmar el acta de conformidad y obtener la aprobación formal de los stakeholders.","PO + QA Lead","Acta firmada")],
   ex:[["Defecto crítico o alto","Se reporta en Jira (SOP-QA-008); no se firma el acta hasta su resolución y revalidación."],["Defecto medio o bajo","Puede aceptarse como deuda técnica con visto bueno del Product Owner, documentada en el acta."],["Caso sin conformidad","Se marca “Pendiente” y se escala al Product Owner."],["Ambiente inestable","Escalar a Platform Engineering y al Project Manager."],["Desacuerdo en el cierre","El ciclo no se cierra; escala a la Gerencia de QA y al Product Owner."]]}
 ]},
{id:"cierre",n:5,name:"Cierre",sop:"SOP-QA-009",title:"Monitoreo, control y cierre de pruebas",
 purpose:"Recolectar evidencias, emitir el informe analítico de cobertura y el sign-off formal de QA para el handoff.",
 inputs:["Ejecuciones en TestMu","Defectos en Jira","Test Plan"],gate:"G6",
 steps:[S("Monitorear el progreso","Comparar la ejecución real contra el plan (cronograma y alcance) y ajustar recursos.","QA Lead","Estatus de avance"),
  S("Controlar y mitigar","Gestionar riesgos emergentes y ejecutar planes de contingencia para desbloquear pruebas.","QA Lead / PMO","Riesgos mitigados"),
  S("Consolidar ejecuciones","Validar que el 100% de las ejecuciones tenga estado definitivo (Pass/Fail).","QA Lead","Ejecuciones consolidadas"),
  S("Calcular KPIs","Pass Rate ≥ 80%, Defect Leakage < 20%, Reopen Rate < 10%.","QA Lead","KPIs calculados"),
  S("Generar el informe","Crear el informe analítico de cierre (Test Summary Report).","QA Lead","Test Summary Report"),
  S("Presentar resultados","Socializar resultados con stakeholders técnicos y de negocio.","QA Lead","Resultados presentados"),
  S("Sign-off","Emitir y firmar la aprobación formal de QA para habilitar el despliegue.","QA Lead + Platform Engineer + Product Strategist","Sign-off emitido"),
  S("Retrospectiva","Sesión de lecciones aprendidas para la mejora continua.","Equipo de QA","Documento de lecciones"),
  S("Cierre administrativo","Archivar artefactos de prueba, limpiar entornos y documentar lecciones.","QA Lead","Artefactos archivados")],
 ex:[["Identificación y evaluación","El QA Lead identifica la anomalía y evalúa su impacto en cronograma y calidad."],["Reporte de excepción","Se documenta el bloqueo en el registro de incidencias y riesgos."],["Escalamiento","Si el equipo no lo resuelve, escala a PMO / Gerencia con evidencia técnica y propuestas de mitigación."],["Resolución y seguimiento","Los stakeholders aceptan el riesgo, ajustan alcance o asignan recursos; se actualiza el Test Plan."]]}
];
var COLS=[{k:"planeacion",l:"Planeación"},{k:"diseno",l:"Diseño"},{k:"ambiente",l:"Ambiente"},{k:"ejecucion",l:"Ejecución"},{k:"defectos",l:"Defectos"},{k:"cierre",l:"Cierre"}];
var ROLES=[
 {n:"QA Lead",d:"Diseña, refina y firma la estrategia global de pruebas; coordina recursos, monitorea métricas, ejecuta pruebas, registra defectos y emite aprobación, rechazo o bloqueo.",s:"Todos los SOP",m:["R","R","P","R/A","A","R"]},
 {n:"QA Engineer / QA Manual / API Tester",d:"Diseñan y ejecutan los casos (UI/UX, API, SIT), mapean datos y credenciales, registran defectos y hacen retest y regresión.",s:"SOP 002 · 003 · 004 · 005 · 006 · 008",m:["R","R","R","R","R","P"]},
 {n:"Product Strategist",d:"Ejecuta y valida el Alistamiento con agentes de IA, confirma criterios de aceptación y participa en la aceptación funcional. Comunica el inicio de pruebas. No tiene acceso a repositorios, Merge Requests ni pipelines de GitLab.",s:"SOP 001 · 002 · 003 · 009",m:["A","A","R","E","—","A"]},
 {n:"Platform Engineer",d:"Hace autocontrol, prepara datos y evidencia y entrega una versión reproducible. Es dueño de las decisiones técnicas y escala al líder técnico o Head de Desarrollo.",s:"SOP 001 · 002 · 003 · 007 · 009",m:["A","P","R","P","—","A"]},
 {n:"DevOps / Arquitectura",d:"Asegura la configuración de CI/CD y la infraestructura del ambiente de pruebas. Atiende escalamientos de infraestructura.",s:"SOP 003 · 005",m:["—","—","R","E","—","—"]},
 {n:"Seguridad",d:"Genera credenciales y perfiles de prueba y aplica enmascaramiento y anonimización de datos.",s:"SOP 003",m:["—","—","R","—","—","—"]},
 {n:"Development / Operations Lead",d:"Operations Lead asigna severidad en el triaje. Development Lead analiza causa raíz, corrige y despliega la build corregida. Desarrollo ejecuta pruebas unitarias.",s:"SOP 002 · 005 · 008",m:["—","P","—","P","R","—"]},
 {n:"Product Owner / Usuarios de negocio",d:"El PO aprueba la suite y las exclusiones de cobertura, firma el acta UAT y valida los Won't Fix. Los usuarios de negocio ejecutan los escenarios UAT.",s:"SOP 002 · 007 · 008",m:["—","A","—","R/A","A","—"]},
 {n:"PMO / Gerencia",d:"Analiza la viabilidad del PRD como criterio de entrada, apoya el control de riesgos y es el último nivel de escalamiento.",s:"SOP 001 · 002 · 006 · 009",m:["P","E","—","E","E","P"]},
 {n:"Comercial y Account Management",d:"Entrega el PRD inicial, resuelve ambigüedades con el Product Strategist y valida el Business Case. Actúa antes de la fase de Planeación.",s:"Todos los SOP (entrada)",m:["P","—","—","—","—","—"]}
];
var DSTATES=[
 {id:"rep",x:10,y:40,w:170,name:"Reportado",sub:"QA Engineer",who:"QA Engineer",what:"Registra la incidencia en Jira con la plantilla estándar: pasos exactos, entorno, evidencias y clasificación inicial.",out:"Bug reportado en Jira",step:1},
 {id:"tri",x:210,y:40,w:170,name:"Triaje",sub:"Operations Lead",who:"Operations Lead",what:"Asigna la severidad en la mesa de triaje según los SLA definidos.",out:"Severidad asignada",step:2},
 {id:"ana",x:410,y:40,w:170,name:"En análisis",sub:"Development Lead",who:"Development Lead",what:"Confirma que el defecto es reproducible e identifica su causa raíz.",out:"Análisis técnico documentado",step:3},
 {id:"cor",x:610,y:40,w:170,name:"En corrección",sub:"Development Lead",who:"Development Lead",what:"Corrige el defecto y despliega la build corregida en el ambiente de QA.",out:"Build corregida",step:4},
 {id:"ret",x:810,y:40,w:170,name:"Retest",sub:"QA Engineer",who:"QA Engineer",what:"Añade pruebas de regresión y revalida el caso en el ambiente correspondiente. El QA Lead verifica el cierre y actualiza métricas (DDP, efectividad de corrección).",out:"Retest y regresión ejecutados",step:"5–7"},
 {id:"cer",x:840,y:270,w:140,name:"Cerrado",sub:"Closed / Resolved",who:"QA Engineer",what:"Si la prueba es exitosa, el defecto se cierra en Jira.",out:"Defecto cerrado",step:8,cls:"cl"},
 {id:"rea",x:610,y:270,w:170,name:"Reabierto",sub:"Persiste el defecto",who:"QA Engineer",what:"Si el defecto persiste, se reabre y vuelve a corrección. Impacta el Reopen Rate.",out:"Defecto reabierto",step:8,cls:"re"}
];
var DEX=[["No reproducible","Sesión síncrona o log adicional en menos de 2 h","Development Lead"],["Discrepancia de severidad","Revisión en el comité de triaje diario","QA Lead / PM"],["SLA incumplido","Aviso inmediato de riesgo al cronograma","Project Manager"],["Won't Fix / By Design","Justificación técnica y validación del impacto","Product Owner"]];
var SEV=[{n:"Crítica",i:"Bloquea la operación o el pipeline",a:"< 1 h",ah:1,s:"< 4 h",sh:4,b:true},{n:"Alta",i:"Afecta el flujo principal",a:"< 4 h",ah:4,s:"< 24 h",sh:24,b:true},{n:"Media",i:"Flujo secundario o con workaround",a:"Mismo día",ah:8,s:"En el sprint",sh:80,b:false},{n:"Baja",i:"Cosmético o de UX",a:"Semanal",ah:40,s:"Backlog",sh:160,b:false}];
var TRIG=[
 {t:"Bloqueo sin resolver en 4 horas",src:"SOP-QA-006",path:[["Nivel 1","QA Lead"],["Nivel 2","Product Strategist"],["Nivel 3","PMO / Gerencia"]],lv:3,note:"También aplica si el bloqueo afecta la fecha de finalización del hito SIT."},
 {t:"Requisito o PRD ambiguo",src:"SOP-QA-001 · 002 · 005",path:[["Detecta","QA / QA Lead"],["Aclara","Product Strategist / PO"]],lv:2,note:"En Diseño se registra como “Bloqueo de Diseño”. Si afecta el cronograma, sube a PMO."},
 {t:"Falla de infraestructura o ambiente",src:"SOP-QA-003 · 005",path:[["Registra","Tester en Jira"],["Evalúa","QA Lead"],["Resuelve","DevOps / Platform Engineer"]],lv:1,note:"Si supera 4 horas, el Product Strategist ajusta el cronograma."},
 {t:"Datos sensibles sin anonimizar",src:"SOP-QA-003",path:[["Detiene","Proceso pausado"],["Escala","Seguridad + QA Lead"]],lv:1,note:"Está estrictamente prohibido procesar datos reales."},
 {t:"SLA de un defecto incumplido",src:"SOP-QA-008",path:[["Detecta","QA Lead"],["Notifica riesgo","Project Manager"]],lv:3,note:"El aviso es inmediato porque compromete el cronograma."},
 {t:"Bloqueo crítico del proyecto",src:"SOP-QA-005",path:[["Registra","Tester en Jira"],["Evalúa","QA Lead"],["Decide","Dirección de Operaciones"]],lv:3,note:"Para bloqueos que no son de entorno ni de requisitos."},
 {t:"Riesgo que invalida el release",src:"SOP-QA-001",path:[["Detecta","QA"],["Decide","Product Strategist + Platform Engineer + QA"]],lv:2,note:"Se decide stop-gap o replanificación."},
 {t:"KPI o desviación fuera de tolerancia",src:"SOP-QA-009",path:[["Evalúa","QA Lead"],["Documenta","Registro de riesgos"],["Escala","PMO / Gerencia"],["Deciden","Stakeholders"]],lv:3,note:"Opciones: aceptar el riesgo, ajustar alcance o asignar recursos. Se actualiza el Test Plan."}
];

/* ---------- state ---------- */
var st={p:0,l:0,tab:"pasos",s:0,gate:null};

/* ---------- map ---------- */
var map=$("#map");
var mapHtml="";
PH.forEach(function(p,i){
  var extra="";
  if(p.levels){extra='<span class="lv">'+p.levels.map(function(l,j){return (l.id==="uat"?'<em aria-hidden="true"></em>':"")+'<span>'+esc(l.name)+'</span>'}).join("")+'</span>'}
  mapHtml+='<button class="station" type="button" data-p="'+i+'" style="grid-column:'+(i*2+1)+'" aria-pressed="false"><span class="dot">'+p.n+'</span><span class="tx"><span class="nm">'+esc(p.name)+'</span><span class="sb">'+esc(p.sop)+'</span>'+extra+'</span></button>';
  var g=["G1","G2","G3","G5","G6"][i];
  mapHtml+='<button class="gate" type="button" data-g="'+g+'" style="grid-column:'+(i*2+2)+'" aria-pressed="false" aria-label="Quality gate '+g+': '+esc(GATES[g].name)+'"><span class="dm"></span><span class="gl">'+g+'</span></button>';
});
mapHtml+='<div class="end" style="grid-column:11"><span class="flag" aria-hidden="true">🚀</span><p>Despliegue</p></div>';
mapHtml+='<div class="gatepop" id="gatepop"></div>';
mapHtml+='<button class="band def" type="button" data-jump="defectos"><span><strong>Gestión de defectos</strong> · SOP-QA-008 · corre en paralelo desde Diseño hasta Ejecución</span><span class="go">Ver ciclo ↓</span></button>';
mapHtml+='<button class="band mon" type="button" data-jump="kpis"><span><strong>Monitoreo y control</strong> · SOP-QA-009 · avance vs. plan, riesgos y KPIs durante todo el ciclo</span><span class="go">Abrir simulador ↓</span></button>';
map.insertAdjacentHTML("beforeend",mapHtml);

map.addEventListener("click",function(e){
  var b=e.target.closest("button"); if(!b) return;
  if(b.dataset.p!==undefined){go(+b.dataset.p,true)}
  else if(b.dataset.g){showGate(b.dataset.g)}
  else if(b.dataset.jump){$("#"+b.dataset.jump).scrollIntoView()}
});
function showGate(g){
  var pop=$("#gatepop");
  if(st.gate===g){st.gate=null;pop.classList.remove("on")}
  else{st.gate=g;var d=GATES[g];
    pop.innerHTML='<h3>'+g+' · '+esc(d.name)+'</h3><dt>Transición</dt><dd>'+esc(d.from)+'</dd><dt>Condición</dt><dd>'+esc(d.cond)+'</dd><dt>Evidencia</dt><dd>'+esc(d.evid)+'</dd><dt>Aprueba</dt><dd>'+esc(d.who)+'</dd>';
    pop.classList.add("on")}
  map.querySelectorAll(".gate").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.g===st.gate?"true":"false")});
}
function paintMap(){
  map.querySelectorAll(".station").forEach(function(x){x.setAttribute("aria-pressed",+x.dataset.p===st.p?"true":"false")});
  var pct=(st.p/(PH.length-1))*82+4;
  var tf=$("#trackfill"); tf.style.width=pct+"%"; tf.parentNode.style.setProperty("--h",pct+"%");
}

/* ---------- detail ---------- */
function cur(){var p=PH[st.p];return p.levels?p.levels[st.l]:p}
function go(i,scroll){st.p=i;st.s=0;st.tab="pasos";if(PH[i].levels&&scroll)st.l=0;render();paintMap();
  try{history.replaceState(null,"","#fase-"+(i+1))}catch(e){}
  if(scroll) $("#detalle").scrollIntoView();
}
function render(){
  var p=PH[st.p], c=cur(), d=$("#dcard");
  var h='<div class="dhead"><div class="dnum">'+p.n+'</div><div><p class="code">'+esc(p.sop)+' · Fase '+p.n+' de 5</p><h3>'+esc(p.title)+'</h3><p class="pur">'+esc(p.purpose)+'</p></div>'+
   '<div class="pager"><button type="button" id="pv" '+(st.p===0?"disabled":"")+'>← '+(st.p>0?esc(PH[st.p-1].name):"Anterior")+'</button><button type="button" id="nx" '+(st.p===PH.length-1?"disabled":"")+'>'+(st.p<PH.length-1?esc(PH[st.p+1].name):"Siguiente")+' →</button></div></div>';
  if(p.inputs){h+='<div class="inputs"><b>Entradas:</b>'+p.inputs.map(function(x){return '<span class="chip">'+esc(x)+'</span>'}).join("")+(p.pre?'<span class="chip o">Requisito: '+esc(p.pre)+'</span>':"")+'</div>'}
  if(p.levels){
    h+='<div class="levels"><span class="lab">Nivel de prueba:</span>'+p.levels.map(function(l,j){
      return (j>0?(l.gateIn?'<span class="arrow g" title="Gate G4">G4</span>':'<span class="arrow" aria-hidden="true">→</span>'):"")+'<button type="button" class="lvbtn" data-l="'+j+'" aria-pressed="'+(j===st.l)+'"><small>4.'+(j+1)+' · '+esc(l.sop)+'</small><strong>'+esc(l.name)+'</strong></button>'}).join("")+'</div>';
    h+='<div class="inputs"><b>Quién:</b>'+esc(c.who)+' <b style="margin-left:14px">Dónde:</b>'+esc(c.where)+' <span class="chip o" style="margin-left:8px">Sale con: '+esc(c.exit)+'</span></div>';
  }
  var dl=c.steps.length;
  var tabs=[["pasos","Pasos",c.steps.length],["entregables","Entregables",dl],["gate","Gate y excepciones",c.ex.length],["roles","Roles",null]];
  h+='<div class="tabs" role="tablist">'+tabs.map(function(t){return '<button class="tab" role="tab" type="button" data-t="'+t[0]+'" aria-selected="'+(st.tab===t[0])+'">'+t[1]+(t[2]!=null?'<span class="cnt">'+t[2]+'</span>':"")+'</button>'}).join("")+'</div>';
  h+='<div class="pane fade" id="pane" role="tabpanel"></div>';
  d.innerHTML=h;
  renderPane();
}
function renderPane(){
  var p=PH[st.p], c=cur(), el=$("#pane"), h="";
  if(st.tab==="pasos"){
    h='<div class="stepper"><ol class="slist">'+c.steps.map(function(s,i){
      return '<li><button type="button" class="sbtn'+(i<st.s?" done":"")+'" data-s="'+i+'"'+(i===st.s?' aria-current="step"':"")+'><span class="n">'+(i+1)+'</span><span class="t">'+esc(s.t)+'<small>'+esc(s.r)+'</small></span></button></li>'}).join("")+'</ol>';
    var s=c.steps[st.s];
    h+='<div class="sdet"><p class="k">Paso '+(st.s+1)+' de '+c.steps.length+' · '+esc(c.sop||p.sop)+'</p><h4>'+esc(s.t)+'</h4><p>'+esc(s.d)+'</p>'+
     '<div class="flowmini"><div class="fm who"><small>Responsable</small>'+esc(s.r)+'</div><span class="ar" aria-hidden="true">→</span><div class="fm out"><small>Registro / resultado</small>'+esc(s.o)+'</div></div>'+
     '<div class="sctrl"><button type="button" id="sp" '+(st.s===0?"disabled":"")+'>← Paso anterior</button><button type="button" class="pri" id="sn">'+(st.s<c.steps.length-1?"Siguiente paso →":"Ver entregables →")+'</button></div>'+
     '<div class="prog" aria-hidden="true"><b style="width:'+((st.s+1)/c.steps.length*100)+'%"></b></div></div></div>';
  } else if(st.tab==="entregables"){
    var key="qa:"+p.id+":"+(p.levels?c.id:"");
    var saved={}; try{saved=JSON.parse(store.get(key)||"{}")||{}}catch(e){saved={}}
    var done=c.steps.filter(function(s,i){return saved[i]}).length;
    h='<div class="dlbar"><span><b id="dlc">'+done+'</b> de '+c.steps.length+' entregables listos</span><div class="prog"><b id="dlp" style="width:'+(done/c.steps.length*100)+'%"></b></div><button type="button" id="dlr">Limpiar</button></div><div class="dl" data-key="'+key+'">'+
     c.steps.map(function(s,i){return '<label class="dli'+(saved[i]?" ck":"")+'"><input type="checkbox" data-i="'+i+'" '+(saved[i]?"checked":"")+'><span><strong>'+esc(s.o)+'</strong><small>Paso '+(i+1)+' · '+esc(s.r)+'</small></span></label>'}).join("")+'</div>'+
     '<p class="note" style="margin-top:14px">Usa la lista como checklist del ciclo; se guarda solo en este navegador.</p>';
  } else if(st.tab==="gate"){
    var gs=[]; if(c.gateIn) gs.push(c.gateIn);
    if(!p.levels||st.l===p.levels.length-1) gs.push(p.gate);
    h='<div class="gx"><div style="display:grid;gap:14px;align-content:start">'+(gs.length?gs.map(function(g){var x=GATES[g];return '<div class="gcard"><h4><span class="dm"></span>'+g+' · '+esc(x.name)+'</h4><dl><dt>Transición</dt><dd>'+esc(x.from)+'</dd><dt>Condición de paso</dt><dd>'+esc(x.cond)+'</dd><dt>Evidencia</dt><dd>'+esc(x.evid)+'</dd><dt>Aprueba</dt><dd>'+esc(x.who)+'</dd></dl></div>'}).join(""):'<div class="gcard"><h4>Sin gate propio</h4><p>Este nivel termina con: '+esc(c.exit)+'. El siguiente nivel arranca con su smoke test.</p></div>')+'</div>'+
     '<div><h3 style="font-size:22px;margin-bottom:12px">Excepciones y escalamiento</h3><div class="exlist">'+c.ex.map(function(x,i){return '<details class="ex"'+(i===0?" open":"")+'><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+'</p></details>'}).join("")+'</div></div></div>';
  } else {
    var col=COLS.findIndex(function(x){return x.k===p.id});
    var list=ROLES.map(function(r){return {r:r,v:r.m[col]}}).filter(function(x){return x.v!=="—"});
    var counts={};c.steps.forEach(function(s){counts[s.r]=(counts[s.r]||0)+1});
    h='<p class="note" style="margin-bottom:14px">Participación de cada rol en esta fase según la matriz de responsabilidades.</p><div class="rgrid">'+list.map(function(x){var L=x.v.split("/")[0];return '<div class="rc"><span class="let '+L+'">'+esc(x.v)+'</span><span><strong>'+esc(x.r.n)+'</strong><small>'+({R:"Ejecuta",A:"Aprueba o firma",P:"Participa o apoya",E:"Recibe escalamientos"})[L]+'</small></span></div>'}).join("")+'</div>'+
     '<h3 style="font-size:20px;margin:24px 0 10px">Responsables de los pasos'+(p.levels?" de "+esc(c.name):"")+'</h3><div class="rgrid">'+Object.keys(counts).map(function(k){return '<div class="rc"><span class="let P">'+counts[k]+'</span><span><strong>'+esc(k)+'</strong><small>'+(counts[k]===1?"paso":"pasos")+' a cargo</small></span></div>'}).join("")+'</div>';
  }
  el.innerHTML=h; el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade");
}
$("#dcard").addEventListener("click",function(e){
  var b=e.target.closest("button"); if(!b) return;
  var c=cur();
  if(b.id==="pv"){go(st.p-1,true)} else if(b.id==="nx"){go(st.p+1,true)}
  else if(b.dataset.l!==undefined){st.l=+b.dataset.l;st.s=0;render()}
  else if(b.dataset.t){st.tab=b.dataset.t;render()}
  else if(b.dataset.s!==undefined){st.s=+b.dataset.s;renderPane()}
  else if(b.id==="sp"){st.s=Math.max(0,st.s-1);renderPane()}
  else if(b.id==="sn"){if(st.s<c.steps.length-1){st.s++;renderPane()}else{st.tab="entregables";render()}}
  else if(b.id==="dlr"){var k=$(".dl").dataset.key;store.set(k,"{}");renderPane()}
});
$("#dcard").addEventListener("change",function(e){
  if(!e.target.matches(".dli input")) return;
  var wrap=$(".dl"),k=wrap.dataset.key,o={};
  wrap.querySelectorAll("input").forEach(function(x){if(x.checked)o[x.dataset.i]=1;x.closest(".dli").classList.toggle("ck",x.checked)});
  store.set(k,JSON.stringify(o));
  var n=Object.keys(o).length,t=wrap.querySelectorAll("input").length;
  $("#dlc").textContent=n;$("#dlp").style.width=(n/t*100)+"%";
});
document.addEventListener("keydown",function(e){
  if(st.tab!=="pasos"||!e.target.closest||!e.target.closest(".stepper")) return;
  var c=cur();
  if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault();if(st.s<c.steps.length-1){st.s++;renderPane();$('.sbtn[data-s="'+st.s+'"]').focus()}}
  if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault();if(st.s>0){st.s--;renderPane();$('.sbtn[data-s="'+st.s+'"]').focus()}}
});

/* ---------- defects ---------- */
var ng=$("#nodes"),SVGNS="http://www.w3.org/2000/svg";
DSTATES.forEach(function(s){
  var g=document.createElementNS(SVGNS,"g");g.setAttribute("class","node "+(s.cls||""));g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",s.name+", responsable "+s.who);g.dataset.id=s.id;
  g.innerHTML='<rect x="'+s.x+'" y="'+s.y+'" width="'+s.w+'" height="70" rx="12"/><text x="'+(s.x+s.w/2)+'" y="'+(s.y+31)+'" text-anchor="middle">'+esc(s.name)+'</text><text class="s" x="'+(s.x+s.w/2)+'" y="'+(s.y+52)+'" text-anchor="middle">'+esc(s.sub)+'</text>';
  ng.appendChild(g);
});
function pickState(id){
  var s=DSTATES.find(function(x){return x.id===id});
  ng.querySelectorAll(".node").forEach(function(n){n.classList.toggle("on",n.dataset.id===id)});
  $("#dside").innerHTML='<p class="code">Paso '+s.step+' del SOP-QA-008</p><h3>'+esc(s.name)+'</h3><div class="row"><span class="chip">'+esc(s.who)+'</span><span class="chip o">'+esc(s.out)+'</span></div><p>'+esc(s.what)+'</p>'+
   '<h3 style="font-size:18px;margin-top:8px">Excepciones del flujo</h3>'+DEX.map(function(x){return '<details class="ex"><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+' · <b>'+esc(x[2])+'</b></p></details>'}).join("");
  moveToken(s);
}
function moveToken(s){$("#token").style.transform="translate("+(s.x+s.w/2)+"px,"+(s.y-2)+"px)"}
ng.addEventListener("click",function(e){var g=e.target.closest(".node");if(g){stopSim();pickState(g.dataset.id)}});
ng.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.closest(".node")){e.preventDefault();stopSim();pickState(e.target.closest(".node").dataset.id)}});
var simT=null;
var ROUTE=["rep","tri","ana","cor","ret","rea","cor","ret","cer"];
var MSG={rep:"QA Engineer registra el bug en Jira con pasos, entorno y evidencia.",tri:"Operations Lead asigna severidad: Alta → atención en menos de 4 h.",ana:"Development Lead reproduce el fallo y documenta la causa raíz.",cor:"Development Lead despliega la build corregida en QA.",ret:"QA Engineer ejecuta retest y regresión.",rea:"El defecto persiste: se reabre y vuelve a corrección (suma al Reopen Rate).",cer:"Retest exitoso: el defecto se cierra como Closed / Resolved."};
function stopSim(){if(simT){clearInterval(simT);simT=null}}
$("#sim").addEventListener("click",function(){
  stopSim();var i=0;var seen={};
  function tick(){var id=ROUTE[i];pickState(id);var second=seen[id];seen[id]=1;$("#simlog").textContent=(i+1)+". "+(second&&id==="ret"?"Segundo retest: ahora pasa.":second&&id==="cor"?"Segunda corrección del Development Lead.":MSG[id]);i++;if(i>=ROUTE.length)stopSim()}
  tick();simT=setInterval(tick,1700);
});
$("#simstop").addEventListener("click",function(){stopSim();pickState("rep");$("#simlog").textContent="El punto naranja representa un defecto. Pulsa “Simular un defecto” para verlo avanzar."});
pickState("rep");

/* severity */
var sb=$("#sevbtns");
sb.innerHTML=SEV.map(function(s,i){return '<button type="button" class="sevb" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+s.n+'</button>'}).join("");
function lw(h){return Math.max(6,Math.log(h+1)/Math.log(161)*100)}
function sev(i){var s=SEV[i];
  sb.querySelectorAll(".sevb").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.i===i?"true":"false")});
  $("#bars").innerHTML='<span>Impacto</span><strong>'+esc(s.i)+'</strong><span>Atención</span><div class="bar"><b style="width:'+lw(s.ah)+'%"></b><span>'+esc(s.a)+'</span></div><span>Solución</span><div class="bar s"><b style="width:'+lw(s.sh)+'%"></b><span>'+esc(s.s)+'</span></div>';
  $("#sevnote").textContent=(s.b?"Bloquea el paso a UAT (G4) y la firma del acta (G5) mientras siga abierto.":"No bloquea gates: en UAT puede aceptarse como deuda técnica con visto bueno del Product Owner.")+" Barras en escala logarítmica aproximada.";
}
sb.addEventListener("click",function(e){var b=e.target.closest(".sevb");if(b)sev(+b.dataset.i)});
sev(0);

/* ---------- raci ---------- */
var rt=$("#raci");
rt.innerHTML='<thead><tr><th class="nb">Rol</th>'+COLS.map(function(c){return '<th>'+(c.k==="defectos"?'<button type="button" data-jump="defectos">'+c.l+'</button>':'<button type="button" data-ph="'+c.k+'">'+c.l+'</button>')+'</th>'}).join("")+'</tr></thead><tbody>'+
 ROLES.map(function(r,i){return '<tr data-r="'+i+'" tabindex="0"><td>'+esc(r.n)+'</td>'+r.m.map(function(v){return v==="—"?'<td class="none">—</td>':'<td><span class="let '+v.split("/")[0]+'">'+v+'</span></td>'}).join("")+'</tr>'}).join("")+'</tbody>';
function role(i){var r=ROLES[i];rt.querySelectorAll("tbody tr").forEach(function(t){t.classList.toggle("sel",+t.dataset.r===i)});
  $("#rinfo").innerHTML='<h3>'+esc(r.n)+'</h3><p>'+esc(r.d)+'</p><p class="code" style="margin-top:8px">'+esc(r.s)+'</p>'}
rt.addEventListener("click",function(e){
  var b=e.target.closest("button");
  if(b&&b.dataset.ph){go(PH.findIndex(function(p){return p.id===b.dataset.ph}),true);return}
  if(b&&b.dataset.jump){$("#"+b.dataset.jump).scrollIntoView();return}
  var tr=e.target.closest("tbody tr");if(tr)role(+tr.dataset.r)});
rt.addEventListener("keydown",function(e){var tr=e.target.closest("tbody tr");if(tr&&(e.key==="Enter"||e.key===" ")){e.preventDefault();role(+tr.dataset.r)}});
role(0);

/* ---------- kpi sim ---------- */
function num(id){var v=parseFloat($("#"+id).value);return isNaN(v)||v<0?0:v}
function pct(v){return isFinite(v)?(v*100).toFixed(1).replace(/\.0$/,"")+"%":"—"}
function kpi(){
  var plan=num("k-plan"),pass=num("k-pass"),qa=num("k-qa"),prod=num("k-prod"),fix=num("k-fix"),re=num("k-re"),crit=num("k-crit");
  var pr=plan?pass/plan:NaN, lk=(qa+prod)?prod/(qa+prod):0, rr=fix?re/fix:0;
  var ok1=pr>=.8, ok2=lk<.2, ok3=rr<.1, ok4=crit===0, okc=pass<=plan;
  function g(n,v,ok,meta,target,dir){var w=Math.min(100,(isFinite(v)?v:0)*100);return '<div class="gauge '+(ok?"ok":"bad")+'"><p><b>'+n+'</b></p><p class="v">'+pct(v)+'</p><p class="m">Meta: '+meta+'</p><div class="meter"><b style="width:'+w+'%"></b><i style="left:'+target+'%"></i></div></div>'}
  var fails=[];
  if(!okc) fails.push("Hay más casos exitosos que planificados: revisa los datos.");
  if(!ok1) fails.push("Pass Rate por debajo de 80%: consolidar ejecuciones fallidas y revisar cobertura.");
  if(!ok2) fails.push("Defect Leakage de 20% o más: demasiados defectos llegan a producción.");
  if(!ok3) fails.push("Reopen Rate de 10% o más: las correcciones no se sostienen en el retest.");
  if(!ok4) fails.push("Hay defectos críticos o altos abiertos: no pasan G4 (SIT → UAT) ni G5 (acta UAT).");
  var all=fails.length===0;
  $("#kout").innerHTML='<div class="gauges">'+g("Pass Rate",pr,ok1,"≥ 80%",80)+g("Defect Leakage",lk,ok2,"< 20%",20)+g("Reopen Rate",rr,ok3,"< 10%",10)+'</div>'+
   '<div class="gchk"><span class="'+(ok4?"y":"n")+'">G4 · SIT → UAT '+(ok4?"cumple":"no cumple")+'</span><span class="'+(ok4?"y":"n")+'">G5 · Acta UAT '+(ok4?"cumple":"no cumple")+'</span><span class="'+(all?"y":"n")+'">G6 · Sign-off '+(all?"cumple":"no cumple")+'</span></div>'+
   '<div class="verdict '+(all?"ok":"bad")+'"><span class="ic" aria-hidden="true">'+(all?"✓":"!")+'</span><div><h3>'+(all?"El ciclo puede recibir el sign-off de QA":"El sign-off queda bloqueado")+'</h3>'+
   (all?'<p>Siguiente paso: Test Summary Report, presentación a stakeholders y firma de QA Lead, Platform Engineer y Product Strategist.</p>':'<ul>'+fails.map(function(f){return '<li>'+esc(f)+'</li>'}).join("")+'</ul><p style="margin-top:8px">Ruta: el QA Lead documenta la desviación y escala a PMO / Gerencia con evidencia y propuesta de mitigación.</p>')+'</div></div>';
}
$("#kin").addEventListener("input",kpi);kpi();

/* ---------- escalation ---------- */
var tg=$("#trig");
tg.innerHTML=TRIG.map(function(t,i){return '<button type="button" data-i="'+i+'" aria-pressed="false">'+esc(t.t)+'</button>'}).join("");
var escT=[];
function escal(i){
  var t=TRIG[i];
  tg.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.i===i?"true":"false")});
  escT.forEach(clearTimeout);escT=[];
  var lv=[["Nivel 1","QA Lead","Revisión interna y ajuste de alcance"],["Nivel 2","Product Strategist / PO","Aclaración de requisitos y prioridades"],["Nivel 3","PMO / Gerencia / Dir. de Operaciones","Cronograma, riesgos y recursos"]];
  $("#route").innerHTML='<div><p class="code">'+esc(t.src)+'</p><h3 style="font-size:26px;margin-top:4px">'+esc(t.t)+'</h3></div><div class="path">'+t.path.map(function(h,j){return (j?'<span class="hsep" aria-hidden="true">→</span>':"")+'<div class="hop'+(j===t.path.length-1?" last":"")+'"><small>'+esc(h[0])+'</small><strong>'+esc(h[1])+'</strong></div>'}).join("")+'</div>'+
   '<p>'+esc(t.note)+'</p><div><p class="note" style="margin-bottom:8px">Nivel máximo que alcanza esta situación en la escalera general:</p><div class="ladder">'+lv.map(function(l,j){return '<div class="rung'+(j<t.lv?" hit":"")+'"><small>'+l[0]+'</small><p><b>'+esc(l[1])+'</b></p><p class="note">'+esc(l[2])+'</p></div>'}).join("")+'</div></div><p class="note">Registro obligatorio: acta de la sesión y Matriz de Riesgos.</p>';
  var hops=$("#route").querySelectorAll(".hop");
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  hops.forEach(function(h,j){if(reduce)h.classList.add("on");else escT.push(setTimeout(function(){h.classList.add("on")},120+j*380))});
}
tg.addEventListener("click",function(e){var b=e.target.closest("button");if(b)escal(+b.dataset.i)});
escal(0);

/* ---------- theme ---------- */
$("#theme").addEventListener("click",function(){
  var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
  r.dataset.theme=dark?"light":"dark";store.set("qa-theme",r.dataset.theme);
});
var th=store.get("qa-theme");if(th)document.documentElement.dataset.theme=th;

/* ---------- init ---------- */
var m=/fase-(\d)/.exec(location.hash);
st.p=m?Math.min(4,Math.max(0,+m[1]-1)):0;
render();paintMap();
})();
