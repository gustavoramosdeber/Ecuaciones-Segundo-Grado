'use strict';

// Cambia este PIN antes de publicar tu aplicación.
const TEACHER_PIN = '2468';
const STORAGE_KEY = 'matematicaChallenge_v1';

const defaultChallenges = [
  {id:'d1',title:'El número misterioso',topic:'lineal',question:'Piensa en un número. Si lo multiplicas por 3 y luego sumas 5, obtienes 26. ¿Cuál es el número?',answer:'7',hint:'Plantea 3x + 5 = 26 y despeja x.',active:true,custom:false},
  {id:'d2',title:'La edad de Ana',topic:'lineal',question:'Ana tiene el triple de la edad de su hermano. Si entre los dos suman 32 años, ¿cuántos años tiene el hermano?',answer:'8',hint:'Si x es la edad del hermano: x + 3x = 32.',active:true,custom:false},
  {id:'d3',title:'Compra en la papelería',topic:'lineal',question:'Tres cuadernos iguales y un bolígrafo de $2 cuestan $17. ¿Cuánto cuesta cada cuaderno?',answer:'5',hint:'Resuelve 3x + 2 = 17.',active:true,custom:false},
  {id:'d4',title:'Rectángulo perfecto',topic:'cuadratica',question:'El largo de un rectángulo mide 2 cm más que su ancho. Si su área es 48 cm², ¿cuánto mide el ancho?',answer:'6',hint:'Plantea x(x + 2) = 48; busca la solución positiva.',active:true,custom:false},
  {id:'d5',title:'Dos números consecutivos',topic:'cuadratica',question:'El producto de dos números enteros positivos consecutivos es 72. ¿Cuál es el menor?',answer:'8',hint:'Plantea x(x + 1) = 72.',active:true,custom:false},
  {id:'d6',title:'La trayectoria',topic:'cuadratica',question:'La altura de una pelota está dada por h(t) = -5t² + 20t. ¿En cuántos segundos vuelve al suelo después de lanzarla?',answer:'4',hint:'Cuando vuelve al suelo h(t) = 0. Factoriza -5t(t - 4) = 0 y elige el tiempo positivo.',active:true,custom:false},
  {id:'d7',title:'El cuadrado aumentado',topic:'cuadratica',question:'El área de un cuadrado es 81 cm². Si x representa la medida de su lado, ¿cuál es el valor positivo de x?',answer:'9',hint:'Resuelve x² = 81 y considera la longitud positiva.',active:true,custom:false},
  {id:'d8',title:'Diseño de un jardín',topic:'cuadratica',question:'Un jardín rectangular tiene ancho x y largo x + 5. Su área es 84 m². ¿Cuál es el ancho?',answer:'7',hint:'x(x + 5) = 84. Busca dos factores cuya diferencia sea 5.',active:true,custom:false}
];

const $ = (id) => document.getElementById(id);
let data = loadData();
let currentChallenge = null;
let currentStudent = '';
let deferredInstallPrompt = null;

function loadData(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.challenges) && Array.isArray(saved.results)) return saved;
  } catch (error) { console.warn('No se pudieron leer los datos guardados.', error); }
  return {challenges: defaultChallenges.map(item => ({...item})), results: [], studentName:''};
}
function saveData(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (error) { alert('No fue posible guardar los datos. Revisa el espacio disponible del navegador.'); }
}
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function enterWorkspace(role){
  $('workspace').classList.remove('hidden');
  $('workspace').scrollIntoView({behavior:'smooth',block:'start'});
  $('studentPanel').classList.toggle('hidden', role !== 'student');
  $('teacherPanel').classList.toggle('hidden', role !== 'teacher');
  $('workspaceEyebrow').textContent = role === 'teacher' ? 'GESTIÓN DOCENTE' : 'ÁREA DE APRENDIZAJE';
  $('workspaceTitle').textContent = role === 'teacher' ? 'Panel del profesor' : '¡Vamos a resolver retos!';
  if(role === 'student') renderStudent(); else renderTeacher();
}
function renderStudent(){
  $('studentNameDisplay').textContent = currentStudent || 'Estudiante';
  const mine = data.results.filter(result => result.student === currentStudent);
  $('scoreDisplay').textContent = mine.filter(result => result.correct).length * 10;
  $('completedDisplay').textContent = mine.length;
  const filter = $('topicFilter').value;
  const challenges = data.challenges.filter(item => item.active && (filter === 'todos' || item.topic === filter));
  $('challengeList').innerHTML = challenges.length ? challenges.map(item => `
    <article class="challenge-card"><span class="tag">${item.topic === 'lineal' ? 'ECUACIÓN LINEAL' : 'ECUACIÓN CUADRÁTICA'}</span>
    <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.question)}</p>
    <button class="button button-dark" type="button" data-challenge="${escapeHTML(item.id)}">Resolver reto →</button></article>`).join('') : '<p class="muted">No hay retos disponibles en esta categoría.</p>';
  $('challengeList').querySelectorAll('[data-challenge]').forEach(button => button.addEventListener('click', () => openChallenge(button.dataset.challenge)));
}
function openChallenge(id){
  currentChallenge = data.challenges.find(item => item.id === id);
  if(!currentChallenge) return;
  $('quizTopic').textContent = currentChallenge.topic === 'lineal' ? 'ECUACIÓN LINEAL' : 'ECUACIÓN CUADRÁTICA';
  $('quizTitle').textContent = currentChallenge.title;
  $('quizQuestion').textContent = currentChallenge.question;
  $('answerInput').value = '';
  $('answerHint').textContent = currentChallenge.hint || 'Escribe tu resultado y comprueba tu respuesta.';
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('quizPanel').classList.remove('hidden');
  $('quizPanel').scrollIntoView({behavior:'smooth',block:'center'});
  $('answerInput').focus();
}
function normalizeAnswer(value){
  const parsed = Number(String(value).trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}
function checkAnswer(){
  if(!currentChallenge) return;
  const entered = normalizeAnswer($('answerInput').value);
  const expected = normalizeAnswer(currentChallenge.answer);
  if(entered === null){ $('feedback').textContent = 'Escribe una respuesta numérica válida.'; $('feedback').className = 'feedback error'; return; }
  const correct = expected !== null && Math.abs(entered - expected) < 0.000001;
  data.results.push({student:currentStudent,challengeId:currentChallenge.id,challengeTitle:currentChallenge.title,correct,answer:$('answerInput').value.trim(),date:new Date().toISOString()});
  saveData();
  $('feedback').textContent = correct ? '¡Excelente! Respuesta correcta. Has ganado 10 puntos.' : 'Todavía no es correcto. Revisa el procedimiento y vuelve a intentarlo.';
  $('feedback').className = correct ? 'feedback success' : 'feedback error';
  renderStudent();
}
function renderTeacher(){
  $('teacherChallengeCount').textContent = data.challenges.length;
  $('teacherAttempts').textContent = data.results.length;
  $('teacherCorrect').textContent = data.results.filter(item => item.correct).length;
  $('teacherChallengeList').innerHTML = data.challenges.map(item => `<div class="teacher-item"><div><strong>${escapeHTML(item.title)}</strong><span class="muted">${item.topic === 'lineal' ? 'Lineal' : 'Cuadrática'} · ${item.active ? 'Activo' : 'Inactivo'}</span></div><button type="button" data-toggle="${escapeHTML(item.id)}">${item.active ? 'Desactivar' : 'Activar'}</button>${item.custom ? `<button type="button" data-delete="${escapeHTML(item.id)}" aria-label="Eliminar ${escapeHTML(item.title)}">Eliminar</button>` : ''}</div>`).join('');
  $('teacherChallengeList').querySelectorAll('[data-toggle]').forEach(button => button.addEventListener('click', () => {const item=data.challenges.find(ch=>ch.id===button.dataset.toggle);if(item){item.active=!item.active;saveData();renderTeacher();}}));
  $('teacherChallengeList').querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => {if(confirm('¿Eliminar este reto personalizado?')){data.challenges=data.challenges.filter(ch=>ch.id!==button.dataset.delete);saveData();renderTeacher();}}));
  const rows = data.results.slice().reverse();
  $('resultsTable').innerHTML = rows.length ? rows.map(result => `<tr><td>${escapeHTML(result.student)}</td><td>${escapeHTML(result.challengeTitle)}</td><td>${result.correct ? 'Correcto' : 'Incorrecto'}</td><td>${new Date(result.date).toLocaleString('es-EC')}</td></tr>`).join('') : '<tr><td colspan="4">Todavía no hay resultados.</td></tr>';
}

$('studentEnter').addEventListener('click', () => {
  $('studentName').value = data.studentName || '';
  $('nameDialog').showModal();
});
$('nameForm').addEventListener('submit', event => {
  event.preventDefault();
  currentStudent = $('studentName').value.trim();
  if(!currentStudent) return;
  data.studentName = currentStudent; saveData(); $('nameDialog').close(); enterWorkspace('student');
});
$('teacherEnter').addEventListener('click', () => { $('teacherPin').value=''; $('teacherError').textContent=''; $('teacherDialog').showModal(); });
$('teacherForm').addEventListener('submit', event => {
  event.preventDefault();
  if($('teacherPin').value === TEACHER_PIN){$('teacherDialog').close();enterWorkspace('teacher');}
  else $('teacherError').textContent='PIN incorrecto. Inténtalo nuevamente.';
});
$('logoutBtn').addEventListener('click', () => { $('workspace').classList.add('hidden'); $('quizPanel').classList.add('hidden'); $('acceso').scrollIntoView({behavior:'smooth'}); });
$('topicFilter').addEventListener('change', renderStudent);
$('checkAnswer').addEventListener('click', checkAnswer);
$('answerInput').addEventListener('keydown', event => {if(event.key==='Enter') checkAnswer();});
$('closeQuiz').addEventListener('click', () => $('quizPanel').classList.add('hidden'));
$('challengeForm').addEventListener('submit', event => {
  event.preventDefault();
  const title=$('newTitle').value.trim(), question=$('newQuestion').value.trim(), answer=$('newAnswer').value.trim();
  if(!title || !question || normalizeAnswer(answer)===null){$('formMessage').textContent='Completa los campos y escribe una respuesta numérica válida.';return;}
  data.challenges.push({id:`c${Date.now()}`,title,topic:$('newTopic').value,question,answer,hint:$('newHint').value.trim(),active:true,custom:true});
  saveData(); $('challengeForm').reset(); $('formMessage').textContent='Reto guardado correctamente.'; renderTeacher();
});
$('exportResults').addEventListener('click', () => {
  const rows=[['Estudiante','Reto','Respuesta','Resultado','Fecha'],...data.results.map(r=>[r.student,r.challengeTitle,r.answer,r.correct?'Correcto':'Incorrecto',r.date])];
  const csv='\uFEFF'+rows.map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='resultados-matematica-challenge.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
});
$('resetData').addEventListener('click', () => {
  if(confirm('Esta acción eliminará los retos personalizados y todos los resultados guardados en este navegador. ¿Deseas continuar?')){
    data={challenges:defaultChallenges.map(item=>({...item})),results:[],studentName:''};saveData();renderTeacher();
  }
});

window.addEventListener('beforeinstallprompt', event => {event.preventDefault();deferredInstallPrompt=event;$('installBtn').classList.remove('hidden');});
$('installBtn').addEventListener('click', async () => {
  if(!deferredInstallPrompt){alert('En iPhone/iPad: abre el menú Compartir de Safari y selecciona “Agregar a pantalla de inicio”.');return;}
  deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('installBtn').classList.add('hidden');
});
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.warn('No se pudo registrar el modo sin conexión:',error)));
}
