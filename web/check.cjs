'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{innerHTML:'',textContent:'',value:'',disabled:false,classList:{toggle(){}},setAttribute(){},addEventListener(){},querySelector:element,querySelectorAll(){return [];},focus(){},scrollIntoView(){}});
  return elements.get(selector);
}
let stored = null;
const context = vm.createContext({
  document:{querySelector:element},
  localStorage:{getItem(){return stored;},setItem(key,value){stored=value;}},
  location:{hash:'#preguntas'},window:{addEventListener(){},scrollTo(){}},confirm:()=>true
});
const run = code => vm.runInContext(code,context);
run(fs.readFileSync(path.join(__dirname,'content.js'),'utf8'));
run(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'));
assert.equal(run('lessons.length'),11);
assert.equal(run('questions.length'),33);
assert.equal(run('written.length'),6);
assert.equal(run('new Set(questions.map(q=>q.id)).size'),33);
assert.equal(run('questions.every(q => q.options.length === 4 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4 && lessons.some(l => l.id === q.topic) && q.explanation.length > 10)'),true);
for (let i=0;i<100;i++) {
  assert.equal(run('buildExam().length'),10);
  assert.equal(run('buildExam().filter(q=>!q.kind).length'),8);
  assert.equal(run('buildExam().filter(q=>q.kind === "write").length'),1);
  assert.equal(run('buildExam().filter(q=>q.kind === "call").length'),1);
  assert.equal(run('new Set(buildExam().map(q=>q.id)).size'),10);
}
run('recordAnswer(questions[0],0)');
assert.equal(run('progress.wrong.includes("v1")'),true);
run('recordAnswer(questions[0],questions[0].correct)');
assert.equal(run('progress.wrong.includes("v1")'),false);
assert.equal(run('progress.answers'),2);
assert.equal(run('progress.correct'),1);
assert.equal(JSON.parse(stored).answers,2);
stored='{"done":["variables","invalid"],"wrong":["v1","invalid"],"answers":-1,"correct":99,"exams":[{"score":9}]}';
assert.equal(run('JSON.stringify(readProgress())'),' {"done":["variables"],"wrong":["v1"],"answers":0,"correct":0,"exams":[]}'.trim());
stored='broken'; assert.equal(run('readProgress().answers'),0);
for (const l of run('lessons.map(l=>l.id)')) {
  run(`renderStudy(lessons.find(l=>l.id===${JSON.stringify(l)}))`);
  assert.ok(element('main').innerHTML.includes('Comprobar mi explicación'));
}
run('startSession("exam")');
for (let i=0;i<8;i++) {
  run('session.responses[session.items[session.index].id]={selected:session.items[session.index].correct,correct:true}; nextQuestion()');
}
assert.ok(element('main').innerHTML.includes('textarea'));
run('session.responses[session.items[session.index].id]={code:"<script>unsafe</script>"}; nextQuestion()');
run('session.responses[session.items[session.index].id]={code:"val total = calcularTotal(12.5, 3)"}; nextQuestion()');
assert.equal(run('session.finished'),true);
assert.equal(run('progress.exams.at(-1).score'),8);
assert.ok(element('main').innerHTML.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
assert.ok(!element('main').innerHTML.includes('<script>unsafe</script>'));
run('startSession("written","w1"); session.responses.w1={code:"test"}; session.revealed=true; renderQuestion()');
assert.ok(element('#solution-area').innerHTML.includes('isUpperCase'));
assert.equal(run('escapeHTML("<>&")'),'&lt;&gt;&amp;');
for (const source of run('Object.values(sources)')) assert.ok(fs.existsSync(path.resolve(__dirname,decodeURIComponent(source[1]))));
console.log('OK: banco de preguntas, 100 simulacros, fallos, almacenamiento, 11 lecciones, examen completo y escape de código.');
