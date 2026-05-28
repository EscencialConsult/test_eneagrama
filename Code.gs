/**
 * ============================================
 *  TEST DE ENEAGRAMA — Receptor + Generador de Informe
 *  Apps Script vinculado a un Google Sheet
 * --------------------------------------------
 *  Flujo:
 *  1) Recibe POST con respuestas → guarda fila en hoja "Respuestas"
 *  2) Genera HTML completo del informe del eneatipo dominante
 *  3) Convierte HTML a PDF
 *  4) Envía email a:
 *       - el usuario que hizo el test
 *       - ADMIN_EMAIL (vos)
 *     con el HTML en el cuerpo + PDF adjunto
 *
 *  Cómo desplegar:
 *  1) Crear un Google Sheet vacío.
 *  2) Extensiones → Apps Script → pegar todo este archivo en Code.gs.
 *  3) Guardar → Implementar → Nueva implementación →
 *     Tipo "Aplicación web"
 *     Ejecutar como: Yo
 *     Quién tiene acceso: Cualquier persona
 *  4) Autorizar permisos (Sheet + Drive + Gmail).
 *  5) Copiar la URL /exec → pegarla en script.js.
 * ============================================
 */

var ADMIN_EMAIL = 'escencialconsult@gmail.com';   // ← copia de cada informe llega acá
var SHEET_NAME  = 'Respuestas';
var BRAND_NAME  = 'Escencial Consultora';

var HEADERS = [
    'Fecha', 'Nombre', 'Apellido', 'Correo',
    'Eneatipo', 'Eneatipo_Nombre', 'Respuestas',
    'Score_T1','Score_T2','Score_T3','Score_T4','Score_T5','Score_T6','Score_T7','Score_T8','Score_T9',
    'Pct_T1','Pct_T2','Pct_T3','Pct_T4','Pct_T5','Pct_T6','Pct_T7','Pct_T8','Pct_T9',
    'Email_Enviado'
];

// ════════════════════════════════════════════════════════════════
//  BASE DE CONOCIMIENTO DE LOS 9 ENEATIPOS
// ════════════════════════════════════════════════════════════════
var ENEAGRAMA = {
    1: {
        nombre: "El Reformador",
        subtitulo: "El tipo idealista de sólidos principios",
        descripcion: "Las personas del Tipo 1 poseen una brújula moral interna muy desarrollada. Tienen un agudo sentido de lo correcto y lo incorrecto, y se esfuerzan constantemente por mejorar tanto a sí mismas como al mundo que las rodea. Su perfeccionismo nace de una convicción genuina: las cosas pueden y deben hacerse bien.",
        color: "#6e3eab",
        emocionBasica: "Ira reprimida (resentimiento)",
        motivacionProfunda: "Ser buena persona, ética, tener la razón y ser coherente con sus valores",
        miedoProfundo: "Ser corrupto, malo o defectuoso",
        deseoBasico: "Tener integridad y ser equilibrado",
        virtud: "Serenidad",
        fortalezas: ["Ético y principista","Responsable y organizado","Perfeccionista orientado a la calidad","Capaz de distinguir lo correcto","Disciplinado y persistente","Honesto y directo"],
        areas_desarrollo: ["Tendencia a la autocrítica excesiva","Rigidez ante formas distintas de hacer las cosas","Dificultad para delegar sin controlar","Represión de la ira que se convierte en resentimiento","Impaciencia ante la imperfección ajena"],
        en_trabajo: "En el ámbito laboral, el Tipo 1 es un profesional íntegro que garantiza calidad y cumple sus compromisos. Es el guardián de los estándares y los procesos. Puede ser un excelente auditor, consultor, líder de calidad o cualquier rol donde la precisión y la ética sean centrales. Su desafío es aprender a valorar los aportes de quienes trabajan diferente.",
        en_equipo: "Eleva el nivel del equipo con su compromiso. Necesita sentir que las normas son respetadas. Se frustra ante la mediocridad o la falta de compromiso. Es el que señala los errores con la intención genuina de mejorar.",
        camino_crecimiento: "El camino de integración del Tipo 1 pasa por conectar con la espontaneidad y el placer del Tipo 7. Aprender que la perfección no siempre es el camino más sabio, y que la aceptación de lo imperfecto es en sí misma una virtud profunda."
    },
    2: {
        nombre: "El Ayudador",
        subtitulo: "El tipo preocupado y orientado a los demás",
        descripcion: "Las personas del Tipo 2 tienen una capacidad extraordinaria para percibir las necesidades de los demás y responder a ellas. Son cálidas, generosas y genuinamente interesadas en el bienestar de quienes los rodean. Su mayor alegría es sentirse útiles y necesarios.",
        color: "#953a90",
        emocionBasica: "Orgullo (soberbia)",
        motivacionProfunda: "Ser amado y apreciado; ser indispensable para los demás",
        miedoProfundo: "No ser amado o querido; ser considerado egoísta",
        deseoBasico: "Sentirse amado y dar amor",
        virtud: "Humildad",
        fortalezas: ["Empático y genuinamente comprensivo","Generoso sin condiciones aparentes","Excelente para conectar emocionalmente","Intuitivo sobre las necesidades ajenas","Cálido y afectuoso","Comprometido con el bienestar del otro"],
        areas_desarrollo: ["Dificultad para reconocer y expresar sus propias necesidades","Tendencia a dar para luego esperar reconocimiento","Pérdida de identidad en el servicio al otro","Dificultad para establecer límites saludables","Orgullo encubierto: creer que sabe mejor que otros lo que necesitan"],
        en_trabajo: "El Tipo 2 es el alma del equipo. Crea vínculos, sostiene emocionalmente a sus compañeros y tiene un radar exquisito para el clima organizacional. Brilla en roles de RRHH, coaching, atención al cliente, docencia y liderazgo empático. Su reto es aprender a cuidarse sin sentir que es egoísta.",
        en_equipo: "Es el pegamento emocional del grupo. Apoya, contiene y celebra los logros ajenos. Puede volverse indispensable y luego resentirse si no es reconocido suficientemente.",
        camino_crecimiento: "La integración del Tipo 2 lleva al Tipo 4: encontrar su propia profundidad emocional, sus necesidades legítimas y su identidad más allá del servicio a otros."
    },
    3: {
        nombre: "El Triunfador",
        subtitulo: "El tipo adaptable y orientado al éxito",
        descripcion: "Las personas del Tipo 3 son enérgicas, ambiciosas y naturalmente orientadas al logro. Tienen una capacidad innata para adaptarse al entorno y proyectar la imagen que necesitan para alcanzar sus objetivos. Son los campeones del rendimiento y la eficiencia.",
        color: "#e2b808",
        emocionBasica: "Decepción (vanidad)",
        motivacionProfunda: "Ser valioso y admirado; destacar y ser exitoso",
        miedoProfundo: "Ser un fracasado o ser percibido como incompetente o sin valor",
        deseoBasico: "Sentirse valioso y aceptado",
        virtud: "Autenticidad",
        fortalezas: ["Altamente eficiente y orientado a resultados","Capacidad natural de liderazgo y motivación","Adaptable y carismático","Enfocado en metas y estrategias","Proyecta confianza y competencia","Excelente comunicador en contextos profesionales"],
        areas_desarrollo: ["Confusión entre la imagen y la identidad real","Dificultad para conectar con la autenticidad profunda","Workaholism como mecanismo de validación","Competitividad que puede dañar vínculos","Dificultad para la intimidad genuina"],
        en_trabajo: "El Tipo 3 es el motor de cualquier organización. Sabe cómo alcanzar metas, inspira al equipo con su energía y entiende perfectamente las dinámicas de éxito. Es ideal para roles de liderazgo, ventas, management y cualquier posición donde los resultados sean visibles. Su desafío es aprender que el ser vale más que el hacer.",
        en_equipo: "Eleva la productividad y el estándar de desempeño. Puede competir cuando debería colaborar. Es un generador natural de motivación cuando aprende a liderar desde la autenticidad.",
        camino_crecimiento: "La integración del Tipo 3 pasa por el Tipo 6: aprender a confiar en el proceso sin necesitar el reconocimiento inmediato, valorar la lealtad y la profundidad sobre el brillo superficial."
    },
    4: {
        nombre: "El Individualista",
        subtitulo: "El tipo romántico e introspectivo",
        descripcion: "Las personas del Tipo 4 poseen una riqueza emocional y una profundidad interior excepcionales. Son sensibles, auténticos y están constantemente en búsqueda de identidad y significado. Su mundo interno es vasto y complejo, y su mayor don es transformar el dolor en belleza.",
        color: "#47278c",
        emocionBasica: "Envidia",
        motivacionProfunda: "Encontrar su identidad única y sentido de significado personal",
        miedoProfundo: "No tener identidad o significado personal; ser ordinario o defectuoso",
        deseoBasico: "Ser auténtico y encontrar su sentido de identidad",
        virtud: "Ecuanimidad",
        fortalezas: ["Profundidad emocional excepcional","Creatividad e intuición artística","Autenticidad y rechazo de la superficialidad","Capacidad para transformar experiencias en significado","Empatía con el sufrimiento ajeno","Sensibilidad estética y simbólica"],
        areas_desarrollo: ["Tendencia a la melancolía y el ensimismamiento","Envidia que puede paralizar la acción","Dificultad para valorar lo ordinario y cotidiano","Altibajos emocionales intensos","Sensación crónica de ser incomprendido"],
        en_trabajo: "El Tipo 4 aporta originalidad, profundidad y creatividad a cualquier equipo. Sobresale en roles artísticos, terapéuticos, de diseño y en cualquier campo donde la visión única sea valorada. Su desafío es aprender a actuar incluso cuando el entorno no refleja su mundo interior.",
        en_equipo: "Aporta perspectivas únicas e innovadoras. Puede retirarse cuando no se siente comprendido. Necesita que sus emociones sean valoradas para dar lo mejor de sí.",
        camino_crecimiento: "La integración del Tipo 4 pasa por el Tipo 1: desarrollar disciplina y comprometerse con la acción concreta, dejando de esperar las condiciones perfectas para crear."
    },
    5: {
        nombre: "El Investigador",
        subtitulo: "El tipo vehemente y cerebral",
        descripcion: "Las personas del Tipo 5 poseen una mente extraordinariamente aguda y una capacidad de análisis que pocas personas pueden igualar. Son observadores meticulosos que prefieren comprender el mundo antes de actuar en él. Su independencia intelectual es su mayor fortaleza.",
        color: "#342f1d",
        emocionBasica: "Avaricia (retención)",
        motivacionProfunda: "Ser capaz y competente; comprender el mundo",
        miedoProfundo: "Ser inútil, incompetente o incapaz",
        deseoBasico: "Ser competente y capaz de entender el mundo",
        virtud: "Desapego",
        fortalezas: ["Mente analítica excepcional","Capacidad de concentración profunda","Independencia y objetividad","Innovador y visionario en su campo","Meticuloso y preciso","Perspicaz e intuitivo en el análisis"],
        areas_desarrollo: ["Tendencia al aislamiento y la desconexión social","Dificultad para pasar del análisis a la acción","Gestión de recursos emocionales como si fueran escasos","Dificultad para la intimidad y el contacto emocional","Puede parecer frío o inaccesible"],
        en_trabajo: "El Tipo 5 es el experto por excelencia. Su análisis profundo, su capacidad de síntesis y su objetividad lo hacen invaluable en roles de investigación, estrategia, tecnología, consultoría técnica y cualquier área que requiera conocimiento profundo. Necesita autonomía y espacio para pensar.",
        en_equipo: "Aporta rigor, profundidad y perspectivas que otros no ven. Prefiere roles con límites claros. No disfruta de dinámicas muy emocionales o de trabajo excesivamente colaborativo.",
        camino_crecimiento: "La integración del Tipo 5 pasa por el Tipo 8: aprender a actuar con confianza desde el conocimiento que ya posee, sin esperar tener todas las respuestas antes de moverse."
    },
    6: {
        nombre: "El Leal",
        subtitulo: "El tipo comprometido y orientado a la seguridad",
        descripcion: "Las personas del Tipo 6 son el corazón de cualquier comunidad. Son comprometidas, leales y confiables hasta en las circunstancias más difíciles. Tienen una aguda capacidad para prever problemas y su sentido de responsabilidad es profundo.",
        color: "#6e3eab",
        emocionBasica: "Miedo / Ansiedad",
        motivacionProfunda: "Tener seguridad, apoyo y certeza; sentir que pueden confiar",
        miedoProfundo: "No tener apoyo o guía; quedar desamparado",
        deseoBasico: "Tener seguridad y apoyo",
        virtud: "Coraje",
        fortalezas: ["Extraordinariamente leal y comprometido","Perspicaz para anticipar riesgos","Responsable y confiable","Defensor natural de los débiles","Trabaja bien bajo estructuras claras","Construye comunidad y pertenencia"],
        areas_desarrollo: ["Ansiedad anticipatoria que puede paralizar","Dificultad para confiar en su propio criterio","Ambivalencia ante la autoridad (obedece y desafía)","Proyección de sus miedos en el exterior","Tendencia a buscar señales de peligro donde no las hay"],
        en_trabajo: "El Tipo 6 es el pilar de confianza del equipo. Anticipa problemas antes de que ocurran, cumple lo que promete y construye relaciones de largo plazo. Sobresale en gestión de riesgos, RRHH, roles de coordinación y cualquier entorno donde la confiabilidad sea central.",
        en_equipo: "Garantiza la cohesión y la confianza del grupo. Necesita un liderazgo claro y consistente. Es el que pregunta lo que nadie se anima a preguntar y anticipa los obstáculos.",
        camino_crecimiento: "La integración del Tipo 6 pasa por el Tipo 9: encontrar paz interna y confianza en el fluir de la vida, sin necesitar certezas externas para actuar."
    },
    7: {
        nombre: "El Entusiasta",
        subtitulo: "El tipo productivo y ajetreado",
        descripcion: "Las personas del Tipo 7 traen alegría, energía y posibilidades a todo lo que tocan. Son optimistas irremediables que ven oportunidades donde otros ven problemas. Su vitalidad es contagiosa y su capacidad para imaginar futuros brillantes es un don extraordinario.",
        color: "#e2b808",
        emocionBasica: "Gula / Ansiedad encubierta",
        motivacionProfunda: "Ser feliz y estar satisfecho; tener todo lo que necesitan",
        miedoProfundo: "Ser privado, estar atrapado en el dolor o estar limitado",
        deseoBasico: "Estar satisfecho y contento; tener sus necesidades cubiertas",
        virtud: "Sobriedad",
        fortalezas: ["Optimismo genuino y contagioso","Creatividad e innovación constante","Versatilidad y adaptabilidad","Capacidad para conectar ideas aparentemente dispares","Entusiasmo que motiva a los demás","Sentido del humor e ingenio"],
        areas_desarrollo: ["Dificultad para sostener el compromiso a largo plazo","Evitación del dolor y la profundidad emocional","Dispersión: demasiados proyectos simultáneos","Impulsividad en las decisiones","Dificultad para estar presente cuando las cosas se ponen difíciles"],
        en_trabajo: "El Tipo 7 es el generador de ideas y el motor de la innovación. Aporta energía, creatividad y visión estratégica. Sobresale en emprendimiento, marketing, innovación, roles creativos y cualquier entorno dinámico. Su reto es aprender a profundizar y sostener los proyectos hasta su culminación.",
        en_equipo: "Genera entusiasmo y eleva el ánimo del grupo. Puede perder el interés cuando la tarea se vuelve rutinaria. Es el que siempre tiene una nueva idea y el que hace que trabajar sea divertido.",
        camino_crecimiento: "La integración del Tipo 7 pasa por el Tipo 5: aprender a profundizar, a concentrarse en una sola cosa y a encontrar riqueza en la profundidad más que en la amplitud."
    },
    8: {
        nombre: "El Desafiante",
        subtitulo: "El tipo poderoso y dominante",
        descripcion: "Las personas del Tipo 8 son fuerzas de la naturaleza: directas, poderosas y comprometidas con la justicia. Tienen una capacidad extraordinaria para tomar decisiones difíciles y mover montañas cuando algo les importa. Su fuerza es un don al servicio de los demás cuando está bien canalizado.",
        color: "#280640",
        emocionBasica: "Lujuria / Exceso",
        motivacionProfunda: "Ser autosuficiente y en control de su vida; proteger a los vulnerables",
        miedoProfundo: "Ser controlado, dañado o violado por otros",
        deseoBasico: "Protegerse y determinar su propio curso de acción",
        virtud: "Inocencia",
        fortalezas: ["Liderazgo natural y poderoso","Valentía y determinación","Protector nato de los vulnerables","Decisiones rápidas y contundentes","Resistencia y capacidad de sobreponerse","Honestidad directa y sin rodeos"],
        areas_desarrollo: ["Dificultad para mostrar vulnerabilidad","Tendencia a intimidar sin darse cuenta","Exceso de control que puede alienar a otros","Dificultad para la intimidad emocional profunda","Puede ser inflexible ante posiciones que percibe como débiles"],
        en_trabajo: "El Tipo 8 es el líder natural que mueve organizaciones. Toma decisiones difíciles con firmeza, protege a su equipo y no se detiene ante los obstáculos. Es ideal para roles de alta dirección, emprendimiento, negociación y cualquier contexto donde se requiera audacia y visión.",
        en_equipo: "Define la dirección y despeja los obstáculos. Genera respeto y a veces temor. Cuando aprende a escuchar, su liderazgo se vuelve transformador. Es el que defiende al equipo ante el exterior.",
        camino_crecimiento: "La integración del Tipo 8 pasa por el Tipo 2: aprender a dar desde la generosidad genuina, a mostrar la ternura que protege celosamente y a liderar desde el amor más que desde el control."
    },
    9: {
        nombre: "El Pacificador",
        subtitulo: "El tipo acomodadizo y humilde",
        descripcion: "Las personas del Tipo 9 tienen el don extraordinario de ver múltiples perspectivas y encontrar el valor en cada una de ellas. Son el centro de gravedad de cualquier grupo: su presencia calma, su perspectiva integra y su paciencia es casi ilimitada. Cuando despiertan su propio poder, son agentes de paz transformadora.",
        color: "#47278c",
        emocionBasica: "Pereza / Inercia",
        motivacionProfunda: "Tener paz interior y exterior; evitar el conflicto y la tensión",
        miedoProfundo: "Perder la conexión con los demás; fragmentación",
        deseoBasico: "Mantener la paz de mente interna",
        virtud: "Acción",
        fortalezas: ["Capacidad excepcional para mediar y unir","Perspectiva amplia e integradora","Paciencia y estabilidad emocional","Empático y genuinamente receptivo","No reactivo: puede mantener la calma bajo presión","Aceptación natural de las diferencias"],
        areas_desarrollo: ["Dificultad para reconocer y afirmar sus propias necesidades","Tendencia a la procrastinación y la inercia","Evitación del conflicto incluso cuando es necesario","Dificultad para tomar posición y mantenerla","Pérdida de sí mismo al fusionarse con el entorno"],
        en_trabajo: "El Tipo 9 es el mediador y el integrador por excelencia. Su capacidad para ver todas las perspectivas lo hace invaluable en gestión de conflictos, trabajo colaborativo, recursos humanos y roles de coordinación. Su reto es aprender a afirmarse y a actuar con mayor decisión.",
        en_equipo: "Crea armonía y facilita la cooperación. Puede postergar decisiones difíciles. Cuando está comprometido de verdad, su estabilidad es el ancla que el equipo necesita.",
        camino_crecimiento: "La integración del Tipo 9 pasa por el Tipo 3: aprender a comprometerse con metas propias, a actuar con energía y a permitirse sobresalir sin sentir que esto rompe la armonía."
    }
};

// ════════════════════════════════════════════════════════════════
//  UTILIDADES
// ════════════════════════════════════════════════════════════════
function jsonOut(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload(e) {
    var datos = null;
    if (e && e.parameter && e.parameter.data) {
        try { datos = JSON.parse(e.parameter.data); } catch (err) {}
    }
    if (!datos && e && e.postData && e.postData.contents) {
        try { datos = JSON.parse(e.postData.contents); } catch (err) {}
    }
    return datos;
}

function getOrCreateSheet(ss, nombre) {
    var sheet = ss.getSheetByName(nombre);
    if (!sheet) sheet = ss.insertSheet(nombre);
    if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, HEADERS.length)
             .setFontWeight('bold')
             .setBackground('#7c3aed')
             .setFontColor('#ffffff');
    }
    return sheet;
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ════════════════════════════════════════════════════════════════
//  doPost  →  guardar + enviar email con informe
// ════════════════════════════════════════════════════════════════
function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(15000);
    try {
        var datos = parsePayload(e);
        if (!datos || !Array.isArray(datos.fila)) {
            return jsonOut({ success: false, error: 'Datos inválidos' });
        }

        var ss     = SpreadsheetApp.getActiveSpreadsheet();
        var nombre = datos.nombreHoja || SHEET_NAME;
        var sheet  = getOrCreateSheet(ss, nombre);

        // Guardar fila + columna Email_Enviado en blanco
        var filaCompleta = datos.fila.slice();
        while (filaCompleta.length < HEADERS.length) filaCompleta.push('');
        sheet.appendRow(filaCompleta);
        var row = sheet.getLastRow();

        // Construir contexto del informe a partir de la fila
        var ctx = filaToContext(datos.fila);

        // Generar HTML del informe + PDF + enviar email
        var emailOk = false;
        var emailErr = '';
        try {
            var html    = buildReportHtml(ctx);
            var pdfBlob = htmlToPdf(html, 'Informe_Eneagrama_' + ctx.nombre + '.pdf');
            sendReportEmail(ctx, html, pdfBlob);
            emailOk = true;
            sheet.getRange(row, HEADERS.indexOf('Email_Enviado') + 1).setValue('SÍ — ' + new Date().toLocaleString('es-AR'));
        } catch (errEmail) {
            emailErr = String(errEmail);
            sheet.getRange(row, HEADERS.indexOf('Email_Enviado') + 1).setValue('ERROR: ' + emailErr);
            Logger.log('Error enviando email: ' + emailErr);
        }

        return jsonOut({ success: true, row: row, email_enviado: emailOk, email_error: emailErr });
    } catch (error) {
        return jsonOut({ success: false, error: String(error) });
    } finally {
        lock.releaseLock();
    }
}

function doGet() {
    return jsonOut({ ok: true, msg: 'Endpoint activo. Usá POST para enviar respuestas.' });
}

// ════════════════════════════════════════════════════════════════
//  Mapear fila → contexto del informe
// ════════════════════════════════════════════════════════════════
function filaToContext(fila) {
    // Mismo orden que HEADERS (sin Email_Enviado al final)
    var pct = [0, fila[16],fila[17],fila[18],fila[19],fila[20],fila[21],fila[22],fila[23],fila[24]];
    var scores = [0, fila[7],fila[8],fila[9],fila[10],fila[11],fila[12],fila[13],fila[14],fila[15]];
    return {
        fecha:          fila[0],
        nombre:         String(fila[1] || ''),
        apellido:       String(fila[2] || ''),
        correo:         String(fila[3] || ''),
        eneatipo:       parseInt(fila[4], 10) || 1,
        eneatipoNombre: String(fila[5] || ''),
        respuestas:     String(fila[6] || ''),
        scores:         scores,
        pct:            pct
    };
}

// ════════════════════════════════════════════════════════════════
//  HTML del informe (sirve para email y para PDF)
// ════════════════════════════════════════════════════════════════
function buildReportHtml(ctx) {
    var dom  = ctx.eneatipo;
    var info = ENEAGRAMA[dom];
    if (!info) info = ENEAGRAMA[1];

    var nombreCompleto = (ctx.nombre + ' ' + ctx.apellido).trim();

    // Tabla de los 9 tipos ordenada por % descendente
    var tipos = [];
    for (var t = 1; t <= 9; t++) {
        tipos.push({
            num: t,
            nombre: ENEAGRAMA[t].nombre,
            color: ENEAGRAMA[t].color,
            score: ctx.scores[t],
            pct: ctx.pct[t]
        });
    }
    tipos.sort(function(a, b){ return b.pct - a.pct; });

    var barrasHtml = tipos.map(function(t, idx) {
        var esDom = (t.num === dom);
        return [
            '<tr>',
              '<td style="padding:8px 6px; font-family:Arial,sans-serif; font-size:13px; color:#1e1433; white-space:nowrap;">',
                '<strong>' + (idx + 1) + '.</strong> Tipo ' + t.num + ' — ' + escapeHtml(t.nombre),
                (esDom ? ' <span style="color:#7c3aed; font-weight:700;">★ dominante</span>' : ''),
              '</td>',
              '<td style="padding:8px 6px; width:55%;">',
                '<div style="background:#eee; border-radius:6px; overflow:hidden; height:14px; position:relative;">',
                  '<div style="background:' + t.color + '; width:' + t.pct + '%; height:14px; border-radius:6px;"></div>',
                '</div>',
              '</td>',
              '<td style="padding:8px 6px; font-family:Arial,sans-serif; font-size:13px; color:#1e1433; text-align:right; white-space:nowrap;">',
                '<strong>' + t.pct + '%</strong> <span style="color:#888;">(' + t.score + ')</span>',
              '</td>',
            '</tr>'
        ].join('');
    }).join('');

    var fortalezasHtml = info.fortalezas.map(function(f){
        return '<li style="margin-bottom:6px; line-height:1.5;">' + escapeHtml(f) + '</li>';
    }).join('');

    var desarrolloHtml = info.areas_desarrollo.map(function(d){
        return '<li style="margin-bottom:6px; line-height:1.5;">' + escapeHtml(d) + '</li>';
    }).join('');

    return [
'<!DOCTYPE html>',
'<html lang="es"><head><meta charset="UTF-8"><title>Informe Eneagrama</title></head>',
'<body style="margin:0; padding:0; font-family:Arial,sans-serif; color:#1e1433; background:#f7f4fb;">',

  '<div style="max-width:720px; margin:0 auto; background:#fff;">',

    // ─── HEADER ───────────────────────────────────────────────
    '<div style="background:linear-gradient(135deg, #7c3aed, #5b21b6); padding:36px 32px; text-align:center;">',
      '<p style="margin:0; color:rgba(255,255,255,0.7); font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">' + escapeHtml(BRAND_NAME) + '</p>',
      '<h1 style="margin:8px 0 0; color:#fff; font-size:28px; font-weight:800; letter-spacing:1px;">Informe de Eneagrama</h1>',
      '<p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">' + escapeHtml(nombreCompleto) + '</p>',
      '<p style="margin:2px 0 0; color:rgba(255,255,255,0.6); font-size:11px;">' + escapeHtml(ctx.fecha) + '</p>',
    '</div>',

    // ─── TIPO DOMINANTE ──────────────────────────────────────
    '<div style="padding:32px;">',
      '<div style="background:' + info.color + '; color:#fff; padding:24px; border-radius:14px; text-align:center;">',
        '<p style="margin:0; font-size:12px; opacity:0.85; letter-spacing:2px; text-transform:uppercase;">Tu eneatipo dominante</p>',
        '<h2 style="margin:8px 0 4px; font-size:32px; font-weight:800;">Tipo ' + dom + '</h2>',
        '<p style="margin:0; font-size:18px; font-weight:600;">' + escapeHtml(info.nombre) + '</p>',
        '<p style="margin:6px 0 0; font-size:13px; opacity:0.85; font-style:italic;">' + escapeHtml(info.subtitulo) + '</p>',
      '</div>',

      '<p style="margin:24px 0 0; font-size:14px; line-height:1.7; color:#3a2e54;">' + escapeHtml(info.descripcion) + '</p>',
    '</div>',

    // ─── BARRAS COMPARATIVAS ─────────────────────────────────
    '<div style="padding:0 32px 24px;">',
      '<h3 style="margin:0 0 16px; font-size:16px; color:#7c3aed; border-bottom:2px solid #ede9fb; padding-bottom:8px;">Tu perfil completo (9 tipos)</h3>',
      '<table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">',
        barrasHtml,
      '</table>',
      '<p style="margin:14px 0 0; font-size:11px; color:#888; line-height:1.5;">El porcentaje refleja qué tanto te identificás con cada tipo. El score crudo va entre paréntesis (mínimo 10, máximo 50).</p>',
    '</div>',

    // ─── PERFIL PSICOLÓGICO ──────────────────────────────────
    '<div style="padding:0 32px 24px;">',
      '<h3 style="margin:0 0 16px; font-size:16px; color:#7c3aed; border-bottom:2px solid #ede9fb; padding-bottom:8px;">Perfil psicológico profundo</h3>',
      '<table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; font-size:13px;">',
        '<tr>',
          '<td style="padding:10px 12px; background:#f7f4fb; border-radius:8px; vertical-align:top; width:50%;"><strong style="color:#7c3aed;">Emoción básica</strong><br>' + escapeHtml(info.emocionBasica) + '</td>',
          '<td style="width:8px;"></td>',
          '<td style="padding:10px 12px; background:#f7f4fb; border-radius:8px; vertical-align:top; width:50%;"><strong style="color:#7c3aed;">Virtud a desarrollar</strong><br>' + escapeHtml(info.virtud) + '</td>',
        '</tr>',
        '<tr><td colspan="3" style="height:8px;"></td></tr>',
        '<tr>',
          '<td style="padding:10px 12px; background:#f7f4fb; border-radius:8px; vertical-align:top;"><strong style="color:#7c3aed;">Motivación profunda</strong><br>' + escapeHtml(info.motivacionProfunda) + '</td>',
          '<td></td>',
          '<td style="padding:10px 12px; background:#f7f4fb; border-radius:8px; vertical-align:top;"><strong style="color:#7c3aed;">Miedo profundo</strong><br>' + escapeHtml(info.miedoProfundo) + '</td>',
        '</tr>',
        '<tr><td colspan="3" style="height:8px;"></td></tr>',
        '<tr>',
          '<td colspan="3" style="padding:10px 12px; background:#f7f4fb; border-radius:8px;"><strong style="color:#7c3aed;">Deseo básico</strong><br>' + escapeHtml(info.deseoBasico) + '</td>',
        '</tr>',
      '</table>',
    '</div>',

    // ─── FORTALEZAS / ÁREAS DE DESARROLLO ────────────────────
    '<div style="padding:0 32px 24px;">',
      '<table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">',
        '<tr>',
          '<td style="width:50%; vertical-align:top; padding-right:12px;">',
            '<h3 style="margin:0 0 12px; font-size:15px; color:#16a34a;">✓ Fortalezas</h3>',
            '<ul style="margin:0; padding-left:18px; font-size:13px; color:#1e1433;">' + fortalezasHtml + '</ul>',
          '</td>',
          '<td style="width:50%; vertical-align:top; padding-left:12px;">',
            '<h3 style="margin:0 0 12px; font-size:15px; color:#dc2626;">⚠ Áreas de desarrollo</h3>',
            '<ul style="margin:0; padding-left:18px; font-size:13px; color:#1e1433;">' + desarrolloHtml + '</ul>',
          '</td>',
        '</tr>',
      '</table>',
    '</div>',

    // ─── EN EL TRABAJO / EN EQUIPO ──────────────────────────
    '<div style="padding:0 32px 24px;">',
      '<h3 style="margin:0 0 12px; font-size:16px; color:#7c3aed; border-bottom:2px solid #ede9fb; padding-bottom:8px;">Perfil profesional</h3>',
      '<p style="margin:0 0 14px; font-size:13px; line-height:1.7; color:#3a2e54;"><strong style="color:#7c3aed;">En el trabajo. </strong>' + escapeHtml(info.en_trabajo) + '</p>',
      '<p style="margin:0; font-size:13px; line-height:1.7; color:#3a2e54;"><strong style="color:#7c3aed;">En equipo. </strong>' + escapeHtml(info.en_equipo) + '</p>',
    '</div>',

    // ─── CAMINO DE CRECIMIENTO ──────────────────────────────
    '<div style="padding:0 32px 32px;">',
      '<div style="background:linear-gradient(135deg, #ede9fb, #f7f4fb); border-left:4px solid #7c3aed; border-radius:10px; padding:18px 20px;">',
        '<h3 style="margin:0 0 10px; font-size:15px; color:#7c3aed;">→ Tu camino de crecimiento</h3>',
        '<p style="margin:0; font-size:13px; line-height:1.7; color:#3a2e54;">' + escapeHtml(info.camino_crecimiento) + '</p>',
      '</div>',
    '</div>',

    // ─── FOOTER ──────────────────────────────────────────────
    '<div style="background:#1e1433; padding:24px 32px; text-align:center;">',
      '<p style="margin:0; color:rgba(255,255,255,0.85); font-size:12px;">' + escapeHtml(BRAND_NAME) + '</p>',
      '<p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:10px; line-height:1.5;">Este informe es una herramienta de autoconocimiento. No reemplaza una consulta profesional con un especialista en eneagrama.</p>',
    '</div>',

  '</div>',
'</body></html>'
    ].join('');
}

// ════════════════════════════════════════════════════════════════
//  HTML → PDF
// ════════════════════════════════════════════════════════════════
function htmlToPdf(html, filename) {
    var blob = Utilities.newBlob(html, 'text/html', filename.replace(/\.pdf$/i, '') + '.html');
    return blob.getAs('application/pdf').setName(filename);
}

// ════════════════════════════════════════════════════════════════
//  Enviar email (usuario + admin)
// ════════════════════════════════════════════════════════════════
function sendReportEmail(ctx, html, pdfBlob) {
    var nombreCompleto = (ctx.nombre + ' ' + ctx.apellido).trim();
    var subject = 'Tu Informe de Eneagrama — ' + nombreCompleto;

    // Lista de destinatarios: usuario + admin (separados por coma)
    var destinatarios = [];
    if (ctx.correo)     destinatarios.push(ctx.correo);
    if (ADMIN_EMAIL && destinatarios.indexOf(ADMIN_EMAIL) === -1) destinatarios.push(ADMIN_EMAIL);
    var to = destinatarios.join(',');

    MailApp.sendEmail({
        to: to,
        subject: subject,
        htmlBody: html,
        name: BRAND_NAME,
        attachments: [pdfBlob]
    });

    Logger.log('Email enviado a: ' + to);
}

// ════════════════════════════════════════════════════════════════
//  Test manual desde el editor Apps Script
//  (Run > testEnviarInforme — útil para probar sin pasar por el form)
// ════════════════════════════════════════════════════════════════
function testEnviarInforme() {
    var ctx = {
        fecha:          new Date().toLocaleString('es-AR'),
        nombre:         'Test',
        apellido:       'Usuario',
        correo:         ADMIN_EMAIL,   // se manda a vos mismo
        eneatipo:       4,
        eneatipoNombre: 'Tipo 4: El Individualista',
        respuestas:     '{T1: 1m - 1;3, 2;4, ...}',
        scores: [0, 30, 28, 25, 47, 32, 22, 35, 19, 27],
        pct:    [0, 50, 45, 38, 93, 55, 30, 63, 23, 42]
    };
    var html = buildReportHtml(ctx);
    var pdf  = htmlToPdf(html, 'Informe_Test.pdf');
    sendReportEmail(ctx, html, pdf);
    Logger.log('Test enviado a ' + ADMIN_EMAIL);
}
