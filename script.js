(function () {

    /* ══════════════════════════════════════════════════════════
       ⚙️  CONFIGURACIÓN — pegá acá la URL de tu Apps Script
       (la que termina en /exec, después de "Implementar > Aplicación web")
       ══════════════════════════════════════════════════════════ */
    var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnpX0zqJlY_VO3qGKuj9YfP5husv34pn51P66kxVxBHPK43_y0KgI7Kg0fI6aDopcqwg/exec';

    /* ══════════════════════════════════════════════════════════
       FONDO — estrellas sutiles
       ══════════════════════════════════════════════════════════ */
    (function initStars() {
        var canvas = document.getElementById('starsCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        var STAR_COUNT = 120;
        var stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random(), y: Math.random(),
                r: Math.random() * 1.1 + 0.15,
                a: Math.random() * 0.45 + 0.12,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.28 + 0.08,
                glow:  Math.random() < 0.08
            });
        }

        var FLARE_COUNT = 5;
        var flares = [];
        for (var j = 0; j < FLARE_COUNT; j++) {
            flares.push({
                x: Math.random(), y: Math.random(),
                r: Math.random() * 1.2 + 0.9,
                a: Math.random() * 0.35 + 0.25,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.15 + 0.06
            });
        }

        function draw(t) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var W = canvas.width, H = canvas.height;

            for (var si = 0; si < stars.length; si++) {
                var s  = stars[si];
                var al = s.a * (0.75 + 0.25 * Math.sin(t * s.speed + s.phase));
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + al.toFixed(3) + ')';
                ctx.fill();
                if (s.glow) {
                    var g = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, s.r * 4.5);
                    g.addColorStop(0, 'rgba(210,220,255,' + (al * 0.4).toFixed(3) + ')');
                    g.addColorStop(1, 'rgba(210,220,255,0)');
                    ctx.beginPath();
                    ctx.arc(s.x * W, s.y * H, s.r * 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = g;
                    ctx.fill();
                }
            }

            for (var fi = 0; fi < flares.length; fi++) {
                var f  = flares[fi];
                var fc = f.a * (0.65 + 0.35 * Math.sin(t * f.speed + f.phase));
                var cx = f.x * W, cy = f.y * H;
                var len = f.r * 7;

                ctx.beginPath();
                ctx.arc(cx, cy, f.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + fc.toFixed(3) + ')';
                ctx.fill();

                var fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, f.r * 6);
                fg.addColorStop(0, 'rgba(200,210,255,' + (fc * 0.38).toFixed(3) + ')');
                fg.addColorStop(1, 'rgba(200,210,255,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, f.r * 6, 0, Math.PI * 2);
                ctx.fillStyle = fg;
                ctx.fill();

                ctx.save();
                ctx.globalAlpha  = fc * 0.38;
                ctx.strokeStyle  = 'rgba(255,255,255,0.65)';
                ctx.lineWidth    = 0.5;
                ctx.beginPath();
                ctx.moveTo(cx - len, cy); ctx.lineTo(cx + len, cy);
                ctx.moveTo(cx, cy - len); ctx.lineTo(cx, cy + len);
                ctx.stroke();
                ctx.restore();
            }
        }

        var last = 0;
        function animate(ts) {
            var t = ts / 1000;
            if (t - last > 0.05) { draw(t); last = t; }
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    })();

    /* ══════════════════════════════════════════════════════════
       NOMBRES DE LOS 9 TIPOS
       ══════════════════════════════════════════════════════════ */
    var TYPE_NAMES = [null,
        'Tipo 1: El Reformador','Tipo 2: El Ayudador','Tipo 3: El Triunfador',
        'Tipo 4: El Individualista','Tipo 5: El Investigador','Tipo 6: El Leal',
        'Tipo 7: El Entusiasta','Tipo 8: El Desafiante','Tipo 9: El Pacificador'
    ];

    /* ══════════════════════════════════════════════════════════
       PREGUNTAS — 90 en total (10 por tipo × 9 tipos)
       ══════════════════════════════════════════════════════════ */
    var QperPage    = 10;
    var PAGE_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9'];

    var QUESTIONS = [
        // ── TIPO 1 — El Reformador ──────────────────────────────
        {t:"Cuando notás un error o algo que podría hacerse mejor, ¿sentís una tensión interna que no se calma hasta que lo corregís o lo señalás?", ty:1},
        {t:"¿Te resulta difícil relajarte cuando sabés que hay tareas pendientes o cosas que podrían hacerse mejor?", ty:1},
        {t:"¿Tenés un crítico interno que constantemente evalúa si estás haciendo las cosas de manera correcta?", ty:1},
        {t:"¿Sentís resentimiento cuando otros no cumplen con los mismos estándares de responsabilidad que vos mantenés?", ty:1},
        {t:"¿Experimentás frustración cuando las reglas o procedimientos no se siguen adecuadamente?", ty:1},
        {t:"¿Sentís que hay una forma correcta de hacer las cosas y te frustrás cuando no se respeta?", ty:1},
        {t:"¿Cuando terminás una tarea, solés revisarla varias veces para asegurarte de que no haya errores?", ty:1},
        {t:"¿Sentís tensión interna cuando alguien hace algo de manera incorrecta o ineficiente frente a vos?", ty:1},
        {t:"¿Te resulta difícil disfrutar el tiempo libre cuando sentís que podrías estar siendo más productivo?", ty:1},
        {t:"¿Tenés estándares muy altos para vos mismo que a veces te resultan difíciles de sostener?", ty:1},

        // ── TIPO 2 — El Ayudador ────────────────────────────────
        {t:"¿Tendés a anticipar las necesidades de los demás antes de que te las expresen, sintiendo satisfacción al ayudarlos?", ty:2},
        {t:"¿Sentís incomodidad o frustración cuando tus esfuerzos por ayudar a otros no son reconocidos o valorados?", ty:2},
        {t:"¿Te sentís más valorado cuando estás siendo útil o indispensable para alguien?", ty:2},
        {t:"¿Te resulta más fácil identificar las necesidades ajenas que reconocer las tuyas propias?", ty:2},
        {t:"¿Sentís que das más en las relaciones de lo que recibís, pero te cuesta expresarlo directamente?", ty:2},
        {t:"¿Modificás tu comportamiento para ser querido o aceptado por las personas importantes en tu vida?", ty:2},
        {t:"¿Cuando percibís que alguien cercano está mal, sentís una urgencia interna de ayudar aunque no te hayan pedido que lo hagas?", ty:2},
        {t:"¿Te cuesta decir que no cuando alguien te pide un favor, incluso cuando no tenés tiempo o energía?", ty:2},
        {t:"¿Tu bienestar emocional depende en gran parte de que las personas cercanas estén bien?", ty:2},
        {t:"¿Sentís que tu valor como persona está ligado a cuánto podés hacer por los demás?", ty:2},

        // ── TIPO 3 — El Triunfador ──────────────────────────────
        {t:"¿Sentís que tu valor como persona está directamente relacionado con lo que lográs o lo que otros perciben de vos?", ty:3},
        {t:"¿Adaptás tu comportamiento o presentación según el contexto para causar una mejor impresión?", ty:3},
        {t:"¿Medís tu autoestima en función de tus logros y el reconocimiento que recibís?", ty:3},
        {t:"¿Te sentís incómodo con el fracaso al punto de evitar situaciones donde podrías no destacar?", ty:3},
        {t:"¿Te enfocás intensamente en tus metas, a veces descuidando tu bienestar emocional o relaciones personales?", ty:3},
        {t:"¿Te resulta difícil desconectar del trabajo o pausar tu búsqueda de objetivos para simplemente estar?", ty:3},
        {t:"¿Te comparás frecuentemente con otros en términos de logros o éxito para medir tu progreso?", ty:3},
        {t:"¿Presentás versiones distintas de vos mismo según el contexto, asegurándote de que siempre quede la mejor imagen posible?", ty:3},
        {t:"¿Te resulta difícil descansar genuinamente cuando sentís que otros avanzan más rápido que vos?", ty:3},
        {t:"¿A veces sentís que si dejaras de lograr cosas o de ser exitoso, no sabrías muy bien quién sos realmente sin eso?", ty:3},

        // ── TIPO 4 — El Individualista ──────────────────────────
        {t:"¿Sentís que hay algo único y diferente en vos que te distingue de las demás personas?", ty:4},
        {t:"¿Experimentás emociones intensas que parecen más profundas que las de quienes te rodean?", ty:4},
        {t:"¿Sentís nostalgia por experiencias o conexiones que parecen más auténticas o significativas que tu realidad actual?", ty:4},
        {t:"¿Sentís que algo esencial falta en tu vida, incluso cuando las cosas van objetivamente bien?", ty:4},
        {t:"¿Tendés a idealizar lo que no tenés mientras desvalorizás lo que está presente en tu vida?", ty:4},
        {t:"¿Sentís atracción por la belleza, el arte o experiencias que expresan profundidad emocional?", ty:4},
        {t:"¿Sentís que pocas personas realmente comprenden la profundidad de tus experiencias internas?", ty:4},
        {t:"¿A veces te quedás atrapado en emociones difíciles más tiempo del que considerarías razonable?", ty:4},
        {t:"¿Buscás crear experiencias que reflejen auténticamente quién sos sin importar la opinión ajena?", ty:4},
        {t:"¿Sentís una tensión permanente entre querer pertenecer y necesitar ser diferente al mismo tiempo?", ty:4},

        // ── TIPO 5 — El Investigador ────────────────────────────
        {t:"¿Sentís que las interacciones sociales prolongadas te consumen energía de una manera que requiere tiempo a solas para poder recuperarte?", ty:5},
        {t:"¿Cuando alguien invade tu espacio, tiempo o privacidad sin avisar, sentís una incomodidad interna intensa que resulta difícil de ignorar?", ty:5},
        {t:"¿Sentís que actuar sin entender completamente una situación es casi intolerable, incluso cuando el tiempo o las circunstancias te presionan para actuar?", ty:5},
        {t:"¿Preferís tener pocos compromisos sociales para proteger tu tiempo y energía, y sentís alivio cuando planes se cancelan?", ty:5},
        {t:"¿Antes de compartir una idea o posición, necesitás haberla procesado completamente en privado, sintiéndote expuesto si te piden opinar sin preparación?", ty:5},
        {t:"¿Mantenés compartimentos claros entre las distintas áreas de tu vida (trabajo, familia, amigos) para que no se mezclen ni invadan entre sí?", ty:5},
        {t:"¿Preferís dominar completamente un tema antes de considerarte en condiciones de opinar, actuar o comprometerte con él?", ty:5},
        {t:"¿En situaciones de alta intensidad emocional, tu tendencia es retirarte internamente, analizar desde la distancia y desconectarte del componente emocional?", ty:5},
        {t:"¿Sentís que dar demasiado de tu tiempo o energía emocional a otros te deja vaciado, y necesitás soledad para volver a ser vos?", ty:5},
        {t:"¿Valorás tu autonomía e independencia al punto de preferir arreglarte solo antes que depender de otros o exponerte a sus demandas?", ty:5},

        // ── TIPO 6 — El Leal ────────────────────────────────────
        {t:"¿Te encontrás frecuentemente anticipando posibles problemas o escenarios negativos antes de tomar decisiones?", ty:6},
        {t:"¿Buscás constantemente respaldo o confirmación antes de comprometerte con decisiones importantes?", ty:6},
        {t:"¿Cuestionás las intenciones de los demás hasta que demuestran ser confiables?", ty:6},
        {t:"¿Sentís tensión entre confiar en figuras de autoridad y cuestionarlas al mismo tiempo?", ty:6},
        {t:"¿Planificás con anticipación y detalle para minimizar riesgos e imprevistos, sintiéndote más seguro cuanto más preparado estés?", ty:6},
        {t:"¿Te cuesta confiar en tu propio juicio, buscando validación externa frecuentemente?", ty:6},
        {t:"¿Antes de tomar una decisión importante, necesitás consultar con personas de confianza para validarla?", ty:6},
        {t:"¿Tendés a imaginar lo que podría salir mal en una situación incluso cuando todo parece estar bien?", ty:6},
        {t:"¿La lealtad y la confianza son valores tan fundamentales para vos que una traición en ese plano te resulta casi imperdonable?", ty:6},
        {t:"¿Sentís incomodidad ante la ambigüedad o cuando no sabés exactamente qué esperar de una situación?", ty:6},

        // ── TIPO 7 — El Entusiasta ──────────────────────────────
        {t:"¿Solés tener múltiples planes e ideas emocionantes, sintiendo inquietud cuando la rutina se vuelve monótona?", ty:7},
        {t:"¿Te cuesta permanecer enfocado en una sola actividad cuando surgen nuevas oportunidades interesantes?", ty:7},
        {t:"¿Evitás conscientemente situaciones o emociones que puedan resultar dolorosas o limitantes?", ty:7},
        {t:"¿Mantenés múltiples opciones abiertas porque comprometerte con una sola te genera ansiedad?", ty:7},
        {t:"¿Cuando algo va mal o es doloroso, tu mente busca automáticamente el lado positivo o una salida antes de procesar realmente lo que sentís?", ty:7},
        {t:"¿Preferís mantener las conversaciones ligeras y optimistas, evitando temas pesados o dolorosos?", ty:7},
        {t:"¿Sentís que el dolor, la tristeza o los límites son estados que hay que superar rápidamente, no explorar ni sostener por mucho tiempo?", ty:7},
        {t:"¿Te aburris rápidamente de las rutinas y buscás activamente nuevas experiencias o proyectos?", ty:7},
        {t:"¿Te resulta difícil comprometerte con una sola opción cuando hay muchas posibilidades disponibles?", ty:7},
        {t:"¿Preferís mantener tu agenda flexible en lugar de planificar todo con anticipación detallada?", ty:7},

        // ── TIPO 8 — El Desafiante ──────────────────────────────
        {t:"¿Cuando entrás a una situación nueva o de tensión, tendés a ocupar el espacio con decisión y seguridad de manera casi automática?", ty:8},
        {t:"¿Valorás la honestidad directa y te incomoda cuando las personas son evasivas o indecisas?", ty:8},
        {t:"¿Sentís la necesidad de proteger a quienes percibís como vulnerables o en desventaja?", ty:8},
        {t:"¿Te resulta difícil mostrar vulnerabilidad, prefiriendo proyectar fortaleza en todo momento?", ty:8},
        {t:"¿Cuando hay un problema, preferís hablarlo de frente antes que dejarlo sin resolver?", ty:8},
        {t:"¿Tenés poca paciencia con la debilidad o la victimización, tanto en vos como en otros?", ty:8},
        {t:"¿Cuando alguien es injusto o deshonesto, tendés a confrontarlo directamente sin rodeos?", ty:8},
        {t:"¿Te incomoda profundamente depender de otros o necesitar apoyo externo para lograr tus objetivos?", ty:8},
        {t:"¿En situaciones de conflicto, tendés a intensificar la confrontación antes que buscar una salida?", ty:8},
        {t:"¿Tendés a ocupar el espacio con seguridad y decisión cuando entrás a una situación nueva?", ty:8},

        // ── TIPO 9 — El Pacificador ─────────────────────────────
        {t:"¿Preferís mantener la armonía y evitar conflictos, incluso si eso significa postergar tus propias necesidades?", ty:9},
        {t:"¿Te cuesta expresar tus opiniones cuando difieren de las del grupo o podrían generar tensión?", ty:9},
        {t:"¿Postergás la toma de decisiones importantes o te distraés con tareas menos relevantes?", ty:9},
        {t:"¿Adoptás las opiniones o preferencias de otros para mantener la paz, aunque no coincidan con las tuyas?", ty:9},
        {t:"¿Te fusionás con las agendas de otros, perdiendo contacto con tus propias prioridades y deseos?", ty:9},
        {t:"¿Encontrás difícil identificar qué es realmente importante para vos entre todas las demandas externas?", ty:9},
        {t:"¿Cuando hay tensión entre personas cercanas, sentís la necesidad de mediar y restaurar la armonía?", ty:9},
        {t:"¿A veces te dás cuenta de que perdiste de vista tus propias necesidades por enfocarte en las de otros?", ty:9},
        {t:"¿Te resulta difícil mantener impulso en proyectos propios cuando no hay presión externa que te mueva?", ty:9},
        {t:"¿Preferís encontrar puntos en común con las personas antes que enfatizar diferencias que separan?", ty:9}
    ];

    var totalPages = Math.ceil(QUESTIONS.length / QperPage); // = 9

    /* ══════════════════════════════════════════════════════════
       ESTADO + CACHÉ
       ══════════════════════════════════════════════════════════ */
    var answers   = {};
    var pageTimes = {};
    var pageStart = null;
    var curPage   = 0;
    var userName  = '';
    var userLast  = '';
    var userEmail = '';

    var TEST_CACHE_KEY = 'one_test_draft';
    var TEST_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 h

    function saveTestCache() {
        try {
            localStorage.setItem(TEST_CACHE_KEY, JSON.stringify({
                ts: Date.now(), answers: answers, pageTimes: pageTimes,
                curPage: curPage, userName: userName, userLast: userLast, userEmail: userEmail
            }));
        } catch(e) {}
    }
    function loadTestCache() {
        try {
            var raw = localStorage.getItem(TEST_CACHE_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.ts > TEST_CACHE_TTL) {
                localStorage.removeItem(TEST_CACHE_KEY);
                return null;
            }
            return p;
        } catch(e) { return null; }
    }
    function clearTestCache() {
        try { localStorage.removeItem(TEST_CACHE_KEY); } catch(e) {}
    }

    /* ══════════════════════════════════════════════════════════
       HELPERS
       ══════════════════════════════════════════════════════════ */
    function recordTime(pg) {
        if (pageStart !== null) {
            var s = Math.floor((Date.now() - pageStart) / 1000);
            pageTimes[pg] = (pageTimes[pg] || 0) + s;
            pageStart = null;
        }
    }
    function fmtTime(s) { return Math.floor(s/60)+'m '+(s%60)+'s'; }

    function buildRespuestas() {
        var parts = [];
        for (var pg = 0; pg < totalPages; pg++) {
            var s0  = pg * QperPage;
            var s1  = Math.min(s0 + QperPage, QUESTIONS.length);
            var lbl = PAGE_LABELS[pg] || ('P'+(pg+1));
            var qp  = [];
            for (var i = s0; i < s1; i++) qp.push((i+1)+';'+(answers[i]||0));
            parts.push('{'+lbl+': '+fmtTime(pageTimes[pg]||0)+' - '+qp.join(', ')+'}');
        }
        return parts.join(' ');
    }

    function updateHeaderProgress(pct) {
        var hp = document.getElementById('headerProgress');
        var hf = document.getElementById('headerProgressFill');
        var hpct = document.getElementById('headerProgressPct');
        if (!hp) return;
        hp.style.display = 'flex';
        if (hf) hf.style.width = pct + '%';
        if (hpct) hpct.textContent = pct + '%';
    }

    /* ══════════════════════════════════════════════════════════
       FLUJO
       ══════════════════════════════════════════════════════════ */
    function startTest() {
        userName  = (document.getElementById('userName').value     ||'').trim();
        userLast  = (document.getElementById('userLastName').value ||'').trim();
        userEmail = (document.getElementById('userEmail').value    ||'').trim();
        if (!userName || !userLast || !userEmail) {
            alert('Por favor, completá todos los campos');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            alert('Por favor, ingresá un correo electrónico válido');
            return;
        }
        document.getElementById('registrationScreen').classList.add('hidden');
        document.getElementById('testScreen').classList.remove('hidden');
        showPage();
    }

    function showPage() {
        pageStart = Date.now();
        var s0  = curPage * QperPage;
        var ctr = document.getElementById('questionsContainer');
        ctr.innerHTML = '';

        for (var i = 0; i < QperPage && (s0+i) < QUESTIONS.length; i++) {
            var qi = s0 + i;
            var q  = QUESTIONS[qi];

            var card = document.createElement('div');
            card.className = 'question-card fade-up';
            card.style.animationDelay = (i * 0.055) + 's';
            if (answers[qi] !== undefined) card.classList.add('answered');

            var td = document.createElement('div');
            td.className   = 'question-text';
            td.textContent = q.t;
            card.appendChild(td);

            var sd = document.createElement('div');
            sd.className = 'scale-options';

            for (var v = 1; v <= 5; v++) {
                var op = document.createElement('div');
                op.className = 'scale-option';
                var rb = document.createElement('input');
                rb.type  = 'radio';
                rb.id    = 'q'+qi+'v'+v;
                rb.name  = 'q'+qi;
                rb.value = v;
                if (answers[qi] === v) rb.checked = true;
                rb.addEventListener('change', (function(qii, vv, cardEl) {
                    return function() {
                        answers[qii] = vv;
                        cardEl.classList.add('answered');
                        checkDone();
                    };
                })(qi, v, card));
                var lb = document.createElement('label');
                lb.htmlFor     = 'q'+qi+'v'+v;
                lb.textContent = v;
                op.appendChild(rb);
                op.appendChild(lb);
                sd.appendChild(op);
            }
            card.appendChild(sd);
            ctr.appendChild(card);
        }
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function checkDone() {
        var s0 = curPage * QperPage;
        var ok = true;
        for (var i = s0; i < s0+QperPage && i < QUESTIONS.length; i++) {
            if (answers[i] === undefined) { ok = false; break; }
        }
        document.getElementById('nextBtn').disabled = !ok;
        saveTestCache();
    }

    function updateUI() {
        document.getElementById('pageInfo').textContent = 'Página '+(curPage+1)+' de '+totalPages;
        var done = Object.keys(answers).length;
        var pct  = Math.round(done / QUESTIONS.length * 100);
        var fill = document.getElementById('progressFill');
        var ppct = document.getElementById('progressPercent');
        if (fill) fill.style.width = pct+'%';
        if (ppct) ppct.textContent = pct+'%';
        updateHeaderProgress(pct);
        var prevBtn = document.getElementById('prevBtn');
        var nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.style.display = curPage > 0 ? 'inline-flex' : 'none';
        if (nextBtn) nextBtn.textContent = curPage === totalPages-1 ? 'Enviar →' : 'Siguiente →';
        checkDone();
    }

    function nextPage() {
        recordTime(curPage);
        if (curPage < totalPages-1) { curPage++; showPage(); }
        else { calcResults(); }
    }

    function prevPage() {
        recordTime(curPage);
        if (curPage > 0) { curPage--; showPage(); }
    }

    /* ══════════════════════════════════════════════════════════
       CÁLCULO Y ENVÍO A GOOGLE SHEETS
       ══════════════════════════════════════════════════════════ */
    function calcResults() {
        var scores = [0,0,0,0,0,0,0,0,0,0];
        QUESTIONS.forEach(function(q, i){ if(answers[i]) scores[q.ty]+=answers[i]; });
        var maxS=0, dom=1;
        for (var t=1;t<=9;t++) { if(scores[t]>maxS){maxS=scores[t];dom=t;} }

        var qPorTipo = [0,0,0,0,0,0,0,0,0,0];
        QUESTIONS.forEach(function(q) { qPorTipo[q.ty]++; });
        var pct = [0,0,0,0,0,0,0,0,0,0];
        for (var t2=1;t2<=9;t2++) {
            var n   = qPorTipo[t2];
            var min = n * 1;
            var max = n * 5;
            pct[t2] = (max > min) ? Math.round(((scores[t2] - min) / (max - min)) * 100) : 0;
            if (pct[t2] < 0)   pct[t2] = 0;
            if (pct[t2] > 100) pct[t2] = 100;
        }

        doSend(dom, scores, pct);
    }

    function doSend(dom, scores, pct) {
        // Pantalla de carga
        document.getElementById('testScreen').classList.add('hidden');
        var loadingScreen = document.createElement('div');
        loadingScreen.id = 'sendingScreen';
        loadingScreen.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;font-family:Exo 2,sans-serif';
        loadingScreen.innerHTML =
            '<div style="width:60px;height:60px;border:3px solid rgba(255,255,255,0.1);border-top-color:#7c3aed;border-radius:50%;animation:spin 1s linear infinite"></div>' +
            '<p style="color:#fff;font-size:1rem;font-weight:600;margin:0">Enviando respuestas...</p>' +
            '<p style="color:#a4a8c0;font-size:0.8rem;margin:0">Por favor esperá unos segundos</p>' +
            '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
        document.body.appendChild(loadingScreen);

        var now   = new Date();
        var fecha = now.toLocaleString('es-AR',{
            day:'2-digit',month:'2-digit',year:'numeric',
            hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
        });

        // Fila: Fecha, Nombre, Apellido, Correo, Eneatipo, NombreEneatipo, Respuestas,
        //       Score_T1..T9, Pct_T1..T9
        var fila = [
            fecha, userName, userLast, userEmail,
            dom, TYPE_NAMES[dom],
            buildRespuestas(),
            scores[1], scores[2], scores[3], scores[4], scores[5], scores[6], scores[7], scores[8], scores[9],
            pct[1], pct[2], pct[3], pct[4], pct[5], pct[6], pct[7], pct[8], pct[9]
        ];

        var fd = new URLSearchParams();
        fd.append('data', JSON.stringify({ nombreHoja: 'Respuestas', fila: fila }));

        fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: fd })
            .then(function(r){ return r.text(); })
            .then(function(t){
                var res;
                try { res = JSON.parse(t); } catch(e) { throw new Error(t); }
                if (!res || res.success === false) throw new Error(res && res.error || 'Error al guardar');
                console.log('[Test] Respuesta guardada → row=' + res.row);
                clearTestCache();
                showResultScreen(dom, true);
            })
            .catch(function(err){
                console.error('Error guardando respuestas:', err);
                showResultScreen(dom, false, err.message);
            });
    }

    function showResultScreen(dom, ok, errMsg) {
        var sending = document.getElementById('sendingScreen');
        if (sending) sending.remove();
        document.getElementById('resultScreen').classList.remove('hidden');
        var lbl = document.getElementById('dominantTypeLabel');
        if (lbl) lbl.textContent = TYPE_NAMES[dom] || ('Tipo ' + dom);
        var sm = document.getElementById('successMsg');
        if (sm) {
            if (ok) {
                sm.textContent = '¡Respuestas guardadas correctamente!';
                sm.classList.remove('hidden');
            } else {
                sm.textContent = 'Error al enviar: ' + (errMsg || '') + ' (revisá la URL de Apps Script)';
                sm.style.background = 'rgba(250,80,80,0.12)';
                sm.style.borderColor = 'rgba(250,80,80,0.24)';
                sm.style.color = '#fca5a5';
                sm.classList.remove('hidden');
            }
        }
    }

    function restartTest() {
        clearTestCache();
        curPage = 0; answers = {}; pageTimes = {}; pageStart = null;
        userName = ''; userLast = ''; userEmail = '';
        document.getElementById('userName').value = '';
        document.getElementById('userLastName').value = '';
        document.getElementById('userEmail').value = '';
        var sm = document.getElementById('successMsg');
        if (sm) sm.classList.add('hidden');
        var hp = document.getElementById('headerProgress');
        if (hp) hp.style.display = 'none';
        document.getElementById('resultScreen').classList.add('hidden');
        document.getElementById('registrationScreen').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ══════════════════════════════════════════════════════════
       INIT
       ══════════════════════════════════════════════════════════ */
    function init() {
        var draft = loadTestCache();
        if (draft && Object.keys(draft.answers).length > 0) {
            var contestadas = Object.keys(draft.answers).length;
            var confirmar = confirm(
                'Tenés ' + contestadas + ' respuestas guardadas de una sesión anterior.\n' +
                '¿Querés continuar desde donde dejaste?'
            );
            if (confirmar) {
                answers   = draft.answers;
                pageTimes = draft.pageTimes || {};
                curPage   = draft.curPage   || 0;
                userName  = draft.userName  || '';
                userLast  = draft.userLast  || '';
                userEmail = draft.userEmail || '';
                var elUN = document.getElementById('userName');
                var elUL = document.getElementById('userLastName');
                var elUE = document.getElementById('userEmail');
                if (elUN && userName)  elUN.value = userName;
                if (elUL && userLast)  elUL.value = userLast;
                if (elUE && userEmail) elUE.value = userEmail;
            } else {
                clearTestCache();
            }
        }

        var startBtn   = document.getElementById('startBtn');
        var prevBtn    = document.getElementById('prevBtn');
        var nextBtn    = document.getElementById('nextBtn');
        var restartBtn = document.getElementById('restartBtn');

        if (startBtn)   startBtn.addEventListener('click', startTest);
        if (prevBtn)    prevBtn.addEventListener('click', prevPage);
        if (nextBtn)    nextBtn.addEventListener('click', nextPage);
        if (restartBtn) restartBtn.addEventListener('click', restartTest);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
