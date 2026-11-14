const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const page=document.body.dataset.page;const key='stp-volcano-v1';let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')}catch{};function save(){try{localStorage.setItem(key,JSON.stringify(state));$('#save-status').textContent='Saved on this browser'}catch{$('#save-status').textContent='Saving unavailable — print your work before leaving'}}
function bindFields(){$$('[data-save]').forEach(e=>{e.value=state[e.dataset.save]||'';e.addEventListener('input',()=>{state[e.dataset.save]=e.value;save();if(e.closest('.sort-card')){e.closest('.sort-card').querySelector('.feedback').className='feedback';updateProgress();$('#sort-score').textContent='';checkCard(Number(e.dataset.save.split('-').pop()))}})})}
$('#print').onclick=()=>window.print();$('#reset').onclick=()=>{if(confirm('Clear your answers on this activity page?')){Object.keys(state).filter(k=>k.startsWith(page+'-')).forEach(k=>delete state[k]);save();location.reload()}};
function modelToggle(){const m=$('#models');m.classList.toggle('visible');$('#model-button').setAttribute('aria-expanded',m.classList.contains('visible'));$('#model-button').textContent=m.classList.contains('visible')?'Hide suggested answers':'Compare with suggested answers'}
if(page==='compare'){bindFields();$('#model-button').onclick=modelToggle}
const categories={cone:'Composite cone',scoria:'Scoria cone',shield:'Shield volcano',caldera:'Caldera'};let rows=[];
function updateProgress(){if(page!=='sort')return;const n=rows.filter((_,i)=>state['sort-v2-type-'+i]).length;$('#sort-progress').textContent=n+' / '+rows.length+' volcanoes matched'}
if(page==='sort'){
fetch('data.json?v=5').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{rows=data;$('#cards').innerHTML=rows.map((r,i)=>`<article class="card sort-card"><button class="photo-button" data-enlarge="${i}" aria-label="Enlarge photo of ${r.name}"><img class="photo" src="assets/${r.img}.jpg" alt="Photograph of ${r.name}; enlarge to inspect its shape" loading="lazy"></button><div class="body"><span class="eyebrow">${String(i+1).padStart(2,'0')} · ${r.place}</span><h2>${r.name}</h2><details><summary>Need an evidence clue?</summary><p>${r.clue}</p></details><label for="type-${i}">Choose a type</label><select id="type-${i}" data-save="sort-v2-type-${i}"><option value="">Choose…</option>${Object.entries(categories).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><button data-check="${i}" class="secondary">Check match</button><div class="feedback" id="feedback-${i}" role="status"></div></div></article>`).join('');bindFields();updateProgress();$$('[data-check]').forEach(b=>b.onclick=()=>checkCard(+b.dataset.check));$$('[data-enlarge]').forEach(b=>b.onclick=()=>{const r=rows[+b.dataset.enlarge];$('#large-image').src='assets/'+r.img+'.jpg';$('#large-image').alt=r.name;$('#large-title').textContent=r.name;$('#image-dialog').showModal()});$('#check-all').onclick=()=>{let correct=0;rows.forEach((r,i)=>{if(checkCard(i))correct++});$('#sort-score').textContent=correct+' / '+rows.length+' types matched. Correct matches show an explanation; incorrect matches show a hint.'};}).catch(()=>{$('#cards').textContent='The photo cards could not load. Please refresh the page.'});
$('#close-dialog').onclick=()=>$('#image-dialog').close();
}
function checkCard(i){
 const r=rows[i],v=state['sort-v2-type-'+i],f=$('#feedback-'+i);
 f.className='feedback show';
 if(!v){f.textContent='Choose a type first.';return false}
 const correct=v===r.type||(r.name.startsWith('Barren')&&v==='caldera');
 f.classList.add(correct?'good':'bad');
 f.textContent=correct?'Correct! '+r.why:'Not quite — hint: '+r.clue+' Try another type.';
 return correct;
}
const labels=['Magma chamber','Main vent','Secondary vent','Crater','Lava flow','Ash cloud','Layers of lava and ash'];const facts=['Stores molten rock beneath the surface.','The main passage that magma travels through.','A branch passage that carries magma to the side of the volcano.','A bowl-shaped opening around a vent at the surface.','Molten rock moving over the surface.','Fine rock fragments carried upwards and dispersed in an eruption.','Deposits from repeated eruptions build a composite volcano.'];let selected=null;
if(page==='label'){
 const descriptionOrder=[4,1,6,0,5,2,3];
 function clearFeedback(){$('#label-feedback').innerHTML=''}
 function draw(){
  const assigned=state['label-answers']||{},descriptions=state['label-descriptions']||{};
  $('#label-bank').innerHTML=labels.slice().sort().map(n=>`<button class="${selected===n?'selected ':''}${Object.values(assigned).includes(n)?'used':''}" aria-pressed="${selected===n}">${n}</button>`).join('');
  $$('#label-bank button').forEach(b=>b.onclick=()=>{selected=b.textContent;draw();$('#lab-message').textContent='Now select a numbered marker for '+selected+'.'});
  $('#label-list').innerHTML=labels.map((_,i)=>`<div class="lab-part"><div class="lab-row"><strong>${i+1}</strong><span>${assigned[i]||'Not labelled yet'}</span><button data-remove="${i}" aria-label="Clear marker ${i+1}" class="secondary">Clear</button></div><label for="description-${i}">Choose the description for part ${i+1}</label><select id="description-${i}" data-description="${i}" ${assigned[i]?'':'disabled'}><option value="">${assigned[i]?'Choose a description…':'Place a name on this marker first'}</option>${descriptionOrder.map(j=>`<option value="${j}" ${String(descriptions[i])===String(j)?'selected':''}>${facts[j]}</option>`).join('')}</select><p class="description-choice quiet" id="chosen-description-${i}">${assigned[i]&&descriptions[i]!==undefined?facts[Number(descriptions[i])]||'':''}</p></div>`).join('');
  $$('[data-description]').forEach(e=>e.onchange=()=>{state['label-descriptions']=state['label-descriptions']||{};if(e.value==='')delete state['label-descriptions'][e.dataset.description];else state['label-descriptions'][e.dataset.description]=e.value;save();clearFeedback();updateCount();$('#chosen-description-'+e.dataset.description).textContent=e.value===''?'':facts[Number(e.value)]});
  $$('[data-remove]').forEach(b=>b.onclick=()=>{delete assigned[b.dataset.remove];delete descriptions[b.dataset.remove];state['label-answers']=assigned;state['label-descriptions']=descriptions;save();draw();clearFeedback()});
  $$('.target').forEach((t,i)=>t.setAttribute('aria-label','Marker '+(i+1)+': '+(assigned[i]||'not labelled')));
  updateCount();
 }
 function updateCount(){const assigned=state['label-answers']||{},d=state['label-descriptions']||{};$('#label-count').textContent=Object.keys(assigned).length+' / 7 named · '+Object.keys(d).filter(i=>assigned[i]).length+' / 7 descriptions chosen'}
 function assign(i){
  if(!selected){$('#lab-message').textContent='Select a name from the bank first.';return}
  const assigned=state['label-answers']||{},d=state['label-descriptions']||{};
  Object.keys(assigned).forEach(k=>{if(assigned[k]===selected&&String(k)!==String(i)){delete assigned[k];delete d[k]}});
  if(assigned[i]!==selected)delete d[i];
  assigned[i]=selected;state['label-answers']=assigned;state['label-descriptions']=d;selected=null;save();draw();clearFeedback();$('#lab-message').textContent='Name placed on part '+(i+1)+'. Now choose its description below.';
 }
 $$('.target').forEach((t,i)=>{t.onclick=()=>assign(i);t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();assign(i)}}});
 draw();
 $('#check-labels').onclick=()=>{
  const assigned=state['label-answers']||{},d=state['label-descriptions']||{};let names=0,descriptions=0;
  $('#label-feedback').innerHTML=labels.map((l,i)=>{const nameOK=assigned[i]===l,descriptionOK=!!assigned[i]&&String(d[i])===String(i);if(nameOK)names++;if(descriptionOK)descriptions++;return `<div class="feedback show ${nameOK&&descriptionOK?'good':'bad'}"><strong>Part ${i+1}</strong><br>Name: ${nameOK?'Correct — '+l:assigned[i]?'Try another name.':'Place a name first.'}<br>Description: ${!assigned[i]?'Name this part first.':descriptionOK?'Correct — '+facts[i]:d[i]===undefined?'Choose a description.':'Not quite. Think about what this part does or contains.'}</div>`}).join('');
  $('#lab-message').textContent=names+' / 7 names correct · '+descriptions+' / 7 descriptions correct. Keep the correct answers and try the others again.';
 };
 $('#reveal-labels').onclick=()=>{$('#label-feedback').innerHTML=labels.map((l,i)=>`<p><strong>${i+1}. ${l}</strong> — ${facts[i]}</p>`).join('');$('#lab-message').textContent='Suggested names and descriptions shown below. Use them to review your diagram.'};
}
