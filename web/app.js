'use strict';
const {lessons,questions,written,sources} = KOTLIN_CONTENT;
const KEY = 'kotlin-cuaderno-v1';
const main = document.querySelector('main');
let storageAvailable = true;
function readProgress() {
  const empty = {done:[],wrong:[],answers:0,correct:0,exams:[],lastLesson:null};
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (!value || typeof value !== 'object') return empty;
    return {
      lastLesson:lessons.some(l => l.id === value.lastLesson) ? value.lastLesson : null,
      done:Array.isArray(value.done) ? value.done.filter(id => lessons.some(l => l.id === id)) : [],
      wrong:Array.isArray(value.wrong) ? value.wrong.filter(id => questions.some(q => q.id === id)) : [],
      answers:Number.isSafeInteger(value.answers) && value.answers >= 0 ? value.answers : 0,
      correct:Number.isSafeInteger(value.correct) && value.correct >= 0 && value.correct <= value.answers ? value.correct : 0,
      exams:Array.isArray(value.exams) ? value.exams.filter(x => Number.isInteger(x.score) && x.score >= 0 && x.score <= 8 && typeof x.date === 'string').slice(-10) : []
    };
  } catch { storageAvailable = false; return empty; }
}
let progress = readProgress();
let session = null;
let topic = 'all';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const codeBlock = value => `<pre><code>${escapeHTML(value)}</code></pre>`;
const lessonName = id => lessons.find(l => l.id === id)?.title || id;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); }
  catch { storageAvailable = false; }
  storageNote();
}
function storageNote() {
  document.querySelector('#storage-note').textContent = storageAvailable ? '' : 'El navegador no permite guardar el progreso. Puedes seguir estudiando durante esta sesión.';
}
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}
function buildExam() {
  const groups = [
    ['variables','operadores'],['nulos'],['funciones'],['bucles'],
    ['colecciones'],['busquedas'],['clases','inicializacion'],['compose','herramientas']
  ];
  return [...shuffle(groups.map(group => shuffle(questions.filter(q => group.includes(q.topic)))[0])),
    shuffle(written.filter(q => q.kind === 'write'))[0],shuffle(written.filter(q => q.kind === 'call'))[0]];
}
function focusContent() { main.focus({preventScroll:true}); }
function navigate(hash) {
  if (location.hash === hash) { renderRoute(); return; }
  location.hash = hash;
}
function renderRoute() {
  const hash = location.hash.slice(1).split('/');
  const isQuiz = hash[0] === 'preguntas';
  document.querySelector('#nav-study').classList.toggle('active', !isQuiz);
  document.querySelector('#nav-quiz').classList.toggle('active', isQuiz);
  document.querySelector('#nav-study').setAttribute('aria-current',isQuiz ? 'false':'page');
  document.querySelector('#nav-quiz').setAttribute('aria-current',isQuiz ? 'page':'false');
  if (isQuiz) {
    if (session) renderQuestion(); else renderQuizHome();
  } else {
    session = null;
    renderStudy(lessons.find(l => l.id === hash[1]) || lessons.find(l => l.id === progress.lastLesson) || lessons.find(l => !progress.done.includes(l.id)) || lessons[0]);
  }
  focusContent();
}
function renderStudy(lesson) {
  if (progress.lastLesson !== lesson.id) { progress.lastLesson = lesson.id; save(); }
  const index = lessons.indexOf(lesson);
  const done = progress.done.includes(lesson.id);
  const source = sources[lesson.source];
  main.innerHTML = `<section class="hero"><div><p class="eyebrow">TU EXAMEN, PASO A PASO</p><h1>Primero entiéndelo.<br>Después, <em>ponte a prueba.</em></h1><p class="intro">Un bloque cada vez, ejemplos que puedes seguir y preguntas para comprobar lo aprendido. Empieza por entender el código; después intenta explicarlo sin mirar.</p></div><aside class="exam-card" aria-label="Formato del examen"><span class="label">EL OBJETIVO</span><strong>8 + 1 + 1</strong><p>8 preguntas tipo test<br>1 ejercicio de escribir código<br>1 ejercicio de llamar a una función</p><div class="rule"></div><p>Lee → predice → comprueba → practica</p></aside></section>
  <div class="study-layout"><aside class="sidebar" aria-label="Temario"><div class="progress-box"><div class="progress-label"><span>Tu recorrido</span><strong>${progress.done.length} / ${lessons.length}</strong></div><progress value="${progress.done.length}" max="${lessons.length}" aria-label="Lecciones marcadas como estudiadas"></progress></div><nav class="lesson-nav" aria-label="Lecciones">${lessons.map((l,i) => `<button class="lesson-link ${l.id === lesson.id ? 'selected':''}" data-lesson="${l.id}" ${l.id === lesson.id ? 'aria-current="step"':''}><span class="lesson-num">${String(i+1).padStart(2,'0')}</span><span>${l.title}</span>${progress.done.includes(l.id) ? '<span class="check" aria-label="Estudiada">✓</span>':''}</button>`).join('')}</nav></aside>
  <article class="lesson-card" id="lesson"><div class="lesson-meta"><span>BLOQUE ${String(index+1).padStart(2,'0')} / ${lessons.length}</span><span>~ ${lesson.time} MIN DE LECTURA</span></div><h2>${lesson.title}</h2><p>${lesson.lead}</p><h3>Qué debes reconocer</h3><div class="table-wrap"><table><thead><tr><th scope="col">Código / concepto</th><th scope="col">Qué hace</th></tr></thead><tbody>${lesson.rows.map(([a,b]) => `<tr><td><code>${escapeHTML(a)}</code></td><td>${escapeHTML(b)}</td></tr>`).join('')}</tbody></table></div><div class="code-top">LEE EL CÓDIGO · INTENTA PREDECIR EL RESULTADO</div>${codeBlock(lesson.code)}<details><summary>Ver resultado y explicación</summary>${codeBlock(lesson.output)}<p>${lesson.explanation}</p></details><div class="callout"><strong>Ojo en el examen</strong>${escapeHTML(lesson.trap)}</div><h3>Explícalo sin mirar</h3><p>${escapeHTML(lesson.recall)}</p><details><summary>Comprobar mi explicación</summary><p style="white-space:pre-line">${escapeHTML(lesson.answer)}</p></details><p class="source">Adaptado de <a href="${source[1]}" target="_blank" rel="noopener">${escapeHTML(source[0])} ↗</a>. Los ejemplos se han preparado para practicar; no son preguntas oficiales.</p><div class="lesson-actions"><button class="btn" id="mark-done">${done ? '✓ Estudiado · desmarcar':'Marcar como estudiado'}</button><button class="btn secondary" id="practice-topic">Practicar este bloque →</button>${index < lessons.length-1 ? '<button class="btn secondary" id="next-lesson">Siguiente bloque →</button>':'<a class="btn secondary" href="#preguntas">Ir al simulacro →</a>'}</div></article></div>`;
  main.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click',() => navigate(`#estudiar/${button.dataset.lesson}`)));
  main.querySelector('#mark-done').addEventListener('click',() => {
    progress.done = done ? progress.done.filter(id => id !== lesson.id) : [...progress.done,lesson.id];
    save(); renderStudy(lesson); main.querySelector('#mark-done').focus();
  });
  main.querySelector('#practice-topic').addEventListener('click',() => { topic = lesson.id; startSession('practice'); });
  main.querySelector('#next-lesson')?.addEventListener('click',() => { navigate(`#estudiar/${lessons[index+1].id}`); document.querySelector('#lesson')?.scrollIntoView({block:'start'}); });
}
function renderQuizHome() {
  main.innerHTML = `<section class="hero"><div><p class="eyebrow">AHORA TE TOCA A TI</p><h1>Comprueba lo que<br><em>ya sabes.</em></h1><p class="intro">Predice la salida, distingue funciones y escribe tu propia solución. Cada respuesta incluye una explicación para que sepas por qué.</p></div><aside class="exam-card"><span class="label">TU BANCO DE PRÁCTICA</span><strong>${questions.length} + ${written.length}</strong><p>Preguntas tipo test + ejercicios de código.<br>Sin límite de tiempo. A tu ritmo.</p></aside></section>
  <div class="filter-row"><label for="topic"><strong>Bloque para practicar</strong></label><select id="topic"><option value="all">Todos los bloques</option>${lessons.map(l => `<option value="${l.id}">${l.title}</option>`).join('')}</select><span class="small">El simulacro siempre mezcla temas.</span><button class="btn secondary" data-start="functions">¿Qué hace esta función? (${questions.filter(q => q.category === 'function').length}) →</button></div>
  <div class="modes"><article class="mode-card"><div class="mode-icon">01 /</div><h2>Practicar</h2><p>Preguntas tipo test del bloque elegido, en orden aleatorio. Comprueba cada respuesta y lee su explicación al momento.</p><button class="btn" data-start="practice">Empezar a practicar →</button></article><article class="mode-card featured"><div class="mode-icon">02 /</div><h2>Simulacro de examen</h2><p>8 preguntas tipo test, 1 de escribir código y 1 de llamar a una función. Corrección del test al terminar y rúbrica para revisar el código.</p><button class="btn lime" data-start="exam">Hacer el simulacro →</button></article><article class="mode-card"><div class="mode-icon">03 /</div><h2>Volver a los fallos</h2><p>${progress.wrong.length ? `Tienes ${progress.wrong.length} preguntas tipo test pendientes. Al acertarlas aquí o en otra ronda, salen de esta lista.`:'Tus preguntas falladas aparecerán aquí. Acertarlas en una ronda posterior las elimina del repaso.'}</p><button class="btn secondary" data-start="wrong" ${progress.wrong.length ? '':'disabled'}>Repasar fallos (${progress.wrong.length}) →</button></article></div>
  <section aria-labelledby="writing-title"><div class="section-head"><h2 id="writing-title">También se aprende escribiendo</h2><span class="small">Sin ejecutar Kotlin · con solución y lista de comprobación</span></div><div class="modes">${written.filter(w => w.kind === 'write').map(w => `<article class="mode-card"><span class="tag">ESCRIBIR + LLAMAR</span><h3>${w.title}</h3><p>Escribe tu solución antes de abrir el modelo. Después practica una llamada a una función.</p><button class="btn secondary" data-written="${w.id}">Abrir ejercicio →</button></article>`).join('')}</div></section>
  <section aria-labelledby="stats-title"><div class="section-head"><h2 id="stats-title">Tu progreso, sin prisas</h2></div><div class="stats"><div class="stat"><strong>${progress.done.length}/${lessons.length}</strong><span class="small">bloques estudiados</span></div><div class="stat"><strong>${progress.answers}</strong><span class="small">respuestas al test</span></div><div class="stat"><strong>${progress.answers ? Math.round(progress.correct/progress.answers*100)+'%' : '—'}</strong><span class="small">aciertos acumulados</span></div><div class="stat"><strong>${progress.exams.length ? progress.exams[progress.exams.length-1].score+'/8':'—'}</strong><span class="small">último test de simulacro</span></div></div><p class="small">El porcentaje cuenta todos los intentos. Las dos preguntas de código se revisan manualmente y no se incluyen en la nota automática.</p></section>`;
  const select = main.querySelector('#topic'); select.value = topic;
  select.addEventListener('change',() => { topic = select.value; });
  main.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click',() => startSession(button.dataset.start)));
  main.querySelectorAll('[data-written]').forEach(button => button.addEventListener('click',() => startSession('written',button.dataset.written)));
}
function startSession(mode, writtenId) {
  let items;
  if (mode === 'exam') items = buildExam();
  else if (mode === 'functions') items = shuffle(questions.filter(q => q.category === 'function'));
  else if (mode === 'wrong') items = shuffle(questions.filter(q => progress.wrong.includes(q.id)));
  else if (mode === 'written') items = [written.find(w => w.id === writtenId),shuffle(written.filter(w => w.kind === 'call'))[0]];
  else items = shuffle(questions.filter(q => topic === 'all' || q.topic === topic));
  if (!items.length) return;
  session = {mode,items,index:0,responses:{},selected:null,revealed:false,finished:false};
  if (location.hash !== '#preguntas') location.hash = '#preguntas';
  else renderQuestion();
}
function recordAnswer(question, selected) {
  const correct = selected === question.correct;
  progress.answers++; if (correct) progress.correct++;
  progress.wrong = progress.wrong.filter(id => id !== question.id);
  if (!correct) progress.wrong.push(question.id);
  save(); return correct;
}
function renderQuestion() {
  if (session.finished) { renderResults(); return; }
  const {items,index,mode} = session;
  const item = items[index];
  const isWritten = Boolean(item.kind);
  const response = session.responses[item.id];
  const checked = !isWritten && response !== undefined && mode !== 'exam';
  const title = mode === 'exam' ? 'Simulacro de examen' : mode === 'wrong' ? 'Repaso de fallos' : mode === 'written' ? 'Práctica de código' : mode === 'functions' ? '¿Qué hace esta función?' : 'Práctica por bloques';
  main.innerHTML = `<div class="quiz-shell"><div class="quiz-header"><div><p class="eyebrow">${title}</p><span class="small">Pregunta ${index+1} de ${items.length}${mode === 'exam' ? ' · corrección al terminar':''}</span></div><button class="text-button" id="exit-session">Salir de la ronda</button></div><progress value="${index}" max="${items.length}" aria-label="Preguntas completadas"></progress><article class="question-card" style="margin-top:24px"><span class="tag">${isWritten ? item.kind === 'write' ? 'ESCRIBIR CÓDIGO':'LLAMAR A UNA FUNCIÓN' : escapeHTML(lessonName(item.topic))}</span><h2>${escapeHTML(isWritten ? item.title:item.prompt)}</h2>${isWritten ? `<p class="intro">${escapeHTML(item.prompt)}</p>${item.signature ? codeBlock(item.signature):''}<label class="field-label" for="code-answer">Tu respuesta en Kotlin</label><textarea id="code-answer" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Escribe tu código aquí…">${escapeHTML(session.responses[item.id]?.code ?? item.starter)}</textarea><p class="small">Tu borrador se conserva durante esta ronda. No se ejecuta ni se corrige automáticamente como Kotlin.</p><div id="solution-area"></div>` : `${item.code ? codeBlock(item.code):''}<div class="options" role="group" aria-label="Opciones de respuesta">${item.options.map((option,i) => `<button class="option ${session.selected === i ? 'chosen':''} ${checked && i === item.correct ? 'correct':''} ${checked && response.selected === i && !response.correct ? 'wrong':''}" data-option="${i}" aria-pressed="${session.selected === i}" ${checked ? 'disabled':''}><span class="letter">${'ABCD'[i]}</span><span>${escapeHTML(option)}${checked && i === item.correct ? ' ✓ Correcta':''}${checked && response.selected === i && !response.correct ? ' ✕ Tu respuesta':''}</span></button>`).join('')}</div>${checked ? `<div class="feedback ${response.correct ? '':'wrong'}" role="status"><strong>${response.correct ? 'Bien razonado.':'Vamos a entenderlo.'}</strong>${escapeHTML(item.explanation)}<br><a href="#estudiar/${item.topic}">Repasar este bloque →</a></div>`:''}`}
  <div class="quiz-actions"><span class="small">${isWritten ? mode === 'exam' ? 'Revisarás la solución al terminar.':'Compara el razonamiento, no solo el texto exacto.' : 'Elige una respuesta antes de continuar.'}</span><button class="btn" id="submit-answer" ${!isWritten && !checked && session.selected === null ? 'disabled':''}>${isWritten ? mode === 'exam' ? index === items.length-1 ? 'Terminar simulacro →':'Guardar y continuar →' : session.revealed ? 'Siguiente →':'Ver solución y revisar' : checked ? index === items.length-1 ? 'Ver resultados →':'Siguiente →' : mode === 'exam' ? 'Guardar y continuar →':'Comprobar respuesta'}</button></div></article></div>`;
  main.querySelector('#exit-session').addEventListener('click',() => {
    if (!confirm('¿Salir de esta ronda? Los intentos de test ya respondidos se conservan; perderás la ronda y los borradores de código.')) return;
    session = null; renderQuizHome(); focusContent();
  });
  main.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click',() => {
    session.selected = Number(button.dataset.option);
    main.querySelectorAll('[data-option]').forEach(b => { b.classList.toggle('chosen',b === button); b.setAttribute('aria-pressed',String(b === button)); });
    main.querySelector('#submit-answer').disabled = false;
  }));
  if (isWritten) main.querySelector('textarea').addEventListener('input',e => { session.responses[item.id] = {...session.responses[item.id],code:e.target.value}; });
  main.querySelector('#submit-answer').addEventListener('click',() => {
    if (isWritten) {
      session.responses[item.id] = {...session.responses[item.id],code:main.querySelector('textarea').value};
      if (mode !== 'exam' && !session.revealed) { session.revealed = true; showSolution(item); return; }
    } else if (!checked) {
      if (session.selected === null) return;
      session.responses[item.id] = {selected:session.selected,correct:recordAnswer(item,session.selected)};
      if (mode !== 'exam') { renderQuestion(); main.querySelector('#submit-answer').focus(); return; }
    }
    nextQuestion();
  });
  if (session.revealed && isWritten) showSolution(item);
}
function showSolution(item) {
  const response = session.responses[item.id];
  main.querySelector('#solution-area').innerHTML = `<div class="callout"><strong>Una solución posible</strong>Puede haber otras soluciones correctas. Comprueba la firma, los tipos y el comportamiento.</div>${codeBlock(item.solution)}<h3>Lista de comprobación</h3><ul>${item.checks.map(c => `<li>${escapeHTML(c)}</li>`).join('')}</ul><label class="small"><input type="checkbox" id="self-check" ${response?.reviewed ? 'checked':''}> He comparado mi respuesta con estos criterios.</label>`;
  main.querySelector('#self-check').addEventListener('change',e => { session.responses[item.id].reviewed = e.target.checked; });
  main.querySelector('#submit-answer').textContent = session.index === session.items.length-1 ? 'Terminar práctica →':'Siguiente →';
}
function nextQuestion() {
  session.index++; session.selected = null; session.revealed = false;
  if (session.index >= session.items.length) {
    session.finished = true;
    if (session.mode === 'exam') {
      const score = session.items.filter(q => !q.kind && session.responses[q.id]?.correct).length;
      progress.exams.push({score,date:new Date().toISOString()}); progress.exams = progress.exams.slice(-10); save();
    }
    renderResults();
  } else renderQuestion();
  focusContent(); window.scrollTo(0,0);
}
function renderResults() {
  const test = session.items.filter(q => !q.kind);
  const codeItems = session.items.filter(q => q.kind);
  const correct = test.filter(q => session.responses[q.id]?.correct).length;
  main.innerHTML = `<div class="quiz-shell"><p class="eyebrow">RONDA COMPLETADA</p><h1>${test.length ? 'Ya sabes dónde<br><em>seguir practicando.</em>':'Escribir también<br><em>es aprender.</em>'}</h1><div class="question-card">${test.length ? `<span class="tag">SOLO PREGUNTAS TIPO TEST</span><div class="result-number">${correct}<span style="font-size:30px;color:var(--muted)"> / ${test.length}</span></div><p class="intro">${correct === test.length ? 'Has acertado todas las preguntas de esta ronda. Intenta explicar también por qué las otras opciones no encajan.':'Revisa las explicaciones de abajo. Los fallos quedan guardados para volver a practicarlos.'}</p>`:''}${codeItems.length ? '<div class="callout"><strong>El código se revisa aparte</strong>Esta web no compila Kotlin. Compara tu solución con el modelo y sus criterios; las preguntas de código no se incluyen en la puntuación automática.</div>':''}<div class="lesson-actions"><button class="btn" id="back-to-quiz">Elegir otra práctica →</button><a class="btn secondary" href="#estudiar">Volver a estudiar</a></div></div><div class="section-head"><h2>Corrección y razonamiento</h2></div>${session.items.map((item,index) => {
    const response = session.responses[item.id];
    if (item.kind) return `<article class="question-card" style="margin-bottom:18px"><span class="tag">${index+1} · ${item.kind === 'write' ? 'ESCRIBIR':'LLAMAR'}</span><h2>${item.title}</h2><p class="small">${escapeHTML(item.prompt)}</p>${item.signature ? codeBlock(item.signature):''}<h3>Tu respuesta</h3>${codeBlock(response?.code || '(Sin respuesta)')}<details><summary>Ver solución y criterios de revisión</summary>${codeBlock(item.solution)}<ul>${item.checks.map(c => `<li>${escapeHTML(c)}</li>`).join('')}</ul><p class="small">Puede haber otras soluciones válidas.</p></details></article>`;
    return `<article class="question-card" style="margin-bottom:18px"><span class="tag">${index+1} · ${response.correct ? '✓ ACIERTO':'✕ REPASAR'}</span><h3>${escapeHTML(item.prompt)}</h3>${item.code ? codeBlock(item.code):''}<p class="small">Tu respuesta: ${escapeHTML(item.options[response.selected])}<br>Respuesta correcta: <strong>${escapeHTML(item.options[item.correct])}</strong></p><div class="feedback ${response.correct ? '':'wrong'}">${escapeHTML(item.explanation)}</div><a class="small" href="#estudiar/${item.topic}">Estudiar ${escapeHTML(lessonName(item.topic))} →</a></article>`;
  }).join('')}</div>`;
  main.querySelector('#back-to-quiz').addEventListener('click',() => { session = null; renderQuizHome(); focusContent(); window.scrollTo(0,0); });
}
document.querySelector('#reset').addEventListener('click',() => {
  if (!confirm('¿Borrar lecciones estudiadas, estadísticas y preguntas falladas de este navegador?')) return;
  progress = {done:[],wrong:[],answers:0,correct:0,exams:[],lastLesson:null}; session = null; save(); renderRoute();
});
applyTheme(document.documentElement.dataset.theme);
document.querySelector('#theme-toggle').addEventListener('click',() => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem(THEME_KEY,theme); }
  catch { storageAvailable = false; storageNote(); }
});
window.addEventListener('hashchange',renderRoute);
storageNote(); renderRoute();
