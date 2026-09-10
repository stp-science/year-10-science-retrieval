(()=>{
const TOTAL=10;
const grid=document.getElementById('ballGrid');
const shot=document.getElementById('shotBall');
const court=document.getElementById('courtPanel');
const message=document.getElementById('message');
const confetti=document.getElementById('confetti');
const spark=document.getElementById('impactSpark');
const roundNo=document.getElementById('roundNo');
const shotsNo=document.getElementById('shotsNo');
const winsNo=document.getElementById('winsNo');
const resetBtn=document.getElementById('resetBtn');
const musicBtn=document.getElementById('musicBtn');
const soundBtn=document.getElementById('soundBtn');

let buttons=[], used=new Set(), round=1, wins=0, winner=1, lastWinner=null, locked=false;
let musicOn=true,sfxOn=true,audioCtx=null,musicTimer=null,musicMaster=null,hasInteracted=false;

const rand=n=>Math.floor(Math.random()*n);
function chooseWinner(){
  let n;
  do{n=rand(TOTAL)+1;}while(n===lastWinner&&TOTAL>1);
  lastWinner=n;
  return n;
}
function updateHud(){roundNo.textContent=round;shotsNo.textContent=used.size;winsNo.textContent=wins;}
function setMessage(main,sub,kind=''){message.className='message'+(kind?' '+kind:'');message.innerHTML=`${main}<span class="sub">${sub}</span>`;}

function ensureAudio(){
  if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume();
  if(!musicTimer)startMusic();
}
function tone(freq=440,duration=.08,type='sine',vol=.035,delay=0){
  if(!sfxOn)return;
  ensureAudio();
  const t=audioCtx.currentTime+delay,osc=audioCtx.createOscillator(),g=audioCtx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(g).connect(audioCtx.destination);osc.start(t);osc.stop(t+duration+.03);
}
function noise(duration=.08,vol=.03,highpass=900){
  if(!sfxOn)return;
  ensureAudio();
  const b=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*duration),audioCtx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  const src=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();
  src.buffer=b;f.type='highpass';f.frequency.value=highpass;g.gain.value=vol;
  src.connect(f).connect(g).connect(audioCtx.destination);src.start();
}
const bounce=()=>{tone(120,.08,'triangle',.045);tone(92,.1,'triangle',.025,.04)};
const whoosh=()=>noise(.16,.025,650);
const rimSound=()=>{tone(980,.035,'square',.04);tone(620,.065,'triangle',.027,.025)};
const missSound=()=>{tone(175,.09,'square',.025);tone(125,.13,'triangle',.022,.08)};
const swish=()=>{noise(.16,.035,1600);tone(560,.08,'triangle',.026,.02);tone(760,.12,'sine',.02,.08)};
const cheer=()=>{tone(392,.12,'sawtooth',.021);tone(494,.12,'sawtooth',.018,.05);tone(659,.15,'sawtooth',.018,.11)};

function startMusic(){
  if(!audioCtx)return;
  musicMaster=audioCtx.createGain();musicMaster.gain.value=musicOn?.045:.0001;musicMaster.connect(audioCtx.destination);
  let step=0;
  const bassNotes=[98,98,110,98,82,98,110,123],leadNotes=[392,440,392,349,392,440,494,440];
  musicTimer=setInterval(()=>{
    if(!musicOn)return;
    const t=audioCtx.currentTime,s=step%8;
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=bassNotes[s];
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g).connect(musicMaster);o.start(t);o.stop(t+.31);
    if(s%2===0){const l=audioCtx.createOscillator(),lg=audioCtx.createGain();l.type='square';l.frequency.value=leadNotes[s];lg.gain.setValueAtTime(.0001,t);lg.gain.exponentialRampToValueAtTime(.012,t+.01);lg.gain.exponentialRampToValueAtTime(.0001,t+.15);l.connect(lg).connect(musicMaster);l.start(t);l.stop(t+.17);}
    step++;
  },390);
}

function makeBallMarkup(i){return `<div class="basketball"><span class="seam seam-v"></span><span class="seam seam-h"></span><span class="seam seam-l"></span><span class="seam seam-r"></span><span class="ball-number">${i}</span></div><span class="ball-label">BALL ${i}</span>`;}
function createBalls(){
  grid.innerHTML='';buttons=[];
  for(let i=1;i<=TOTAL;i++){
    const b=document.createElement('button');b.className='ball-btn';b.setAttribute('aria-label',`Basketball ${i}`);b.innerHTML=makeBallMarkup(i);
    b.addEventListener('click',()=>takeShot(i,b));grid.appendChild(b);buttons.push(b);
  }
}

function resetRound(full=false){
  used.clear();locked=false;winner=chooseWinner();
  shot.style.transition='none';shot.style.opacity='0';shot.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)';
  buttons.forEach(b=>{b.disabled=false;b.className='ball-btn';});
  updateHud();setMessage(full?'New game ready':'New round ready','Ask the next question, then let a student choose a number.');
}
function launchConfetti(){
  confetti.innerHTML='';const colors=['#ffd35a','#69d8ff','#5be39a','#ff778d','#fff','#ff9a41'];
  for(let i=0;i<36;i++){const bit=document.createElement('i');bit.style.left=Math.random()*100+'%';bit.style.background=colors[i%colors.length];bit.style.setProperty('--dx',(Math.random()*260-130)+'px');bit.style.animationDuration=(1.5+Math.random())+'s';confetti.appendChild(bit);}
  setTimeout(()=>confetti.innerHTML='',2200);
}
function flashRim(x,y){
  spark.style.left=x+'px';spark.style.top=y+'px';spark.classList.remove('hit');void spark.offsetWidth;spark.classList.add('hit');
}

function takeShot(num,btn){
  if(locked||used.has(num))return;
  if(!hasInteracted){hasInteracted=true;ensureAudio();}
  used.add(num);locked=true;buttons.forEach(b=>b.disabled=true);btn.classList.add('used');updateHud();
  const made=num===winner;
  setMessage(`Ball ${num} is in the air...`,made?'That one is on line.':'Watch the rim...');
  animateShot(made,()=>{
    if(made){
      wins++;btn.classList.remove('used');btn.classList.add('winner-used');cheer();launchConfetti();updateHud();
      setMessage(`SWISH! Ball ${num} scores!`,'New round loading with a different winning number.','made');
      setTimeout(()=>{round++;resetRound();},2100);
    }else{
      missSound();setMessage(`Off the rim! Ball ${num} misses.`,'Keep answering questions and try another number.','miss');
      locked=false;buttons.forEach((b,i)=>{const n=i+1;b.disabled=used.has(n);if(used.has(n))b.classList.add('used');});
    }
  });
}

function animateShot(made,done){
  bounce();setTimeout(whoosh,300);
  const rect=court.getBoundingClientRect();
  const ball=shot.getBoundingClientRect();
  const startLeft=parseFloat(getComputedStyle(shot).left)||34;
  const startBottom=parseFloat(getComputedStyle(shot).bottom)||72;
  const startTop=rect.height-startBottom-ball.width;

  // Position of the photographed rim in the court image.
  const rimX=rect.width*.73;
  const rimY=rect.height*.19;
  const side=Math.random()<.5?-1:1;
  const contactX=rimX+(made?0:side*Math.max(15,rect.width*.035));
  const contactY=rimY+(made?3:0);
  const dx=contactX-ball.width/2-startLeft;
  const dy=contactY-ball.width/2-startTop;
  const apex=Math.max(125,rect.height*.27);

  shot.style.transition='none';shot.style.opacity='1';shot.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)';
  const duration=1900;
  const started=performance.now();

  function fly(now){
    const t=Math.min(1,(now-started)/duration);
    const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    const x=dx*e;
    const y=dy*e-4*apex*e*(1-e);
    const rot=500*e;
    shot.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${1-.13*e})`;
    if(t<1){requestAnimationFrame(fly);return;}

    if(made){
      swish();
      shot.style.transition='transform .66s cubic-bezier(.35,.05,.75,.45),opacity .18s linear .52s';
      shot.style.transform=`translate3d(${dx}px,${dy+Math.max(105,rect.height*.2)}px,0) rotate(760deg) scale(.68)`;
      shot.style.opacity='0';setTimeout(done,700);
    }else{
      rimSound();flashRim(contactX,contactY);
      const reboundX=dx-side*Math.max(80,rect.width*.17);
      const reboundY=dy-Math.max(48,rect.height*.085);
      shot.style.transition='transform .48s cubic-bezier(.12,.78,.22,1)';
      shot.style.transform=`translate3d(${reboundX}px,${reboundY}px,0) rotate(${760+side*100}deg) scale(.82)`;
      setTimeout(()=>{
        const fallX=reboundX-side*Math.max(35,rect.width*.08);
        const fallY=Math.min(rect.height-startTop-30,reboundY+Math.max(180,rect.height*.34));
        shot.style.transition='transform .78s cubic-bezier(.3,.08,.72,.92),opacity .2s linear .58s';
        shot.style.transform=`translate3d(${fallX}px,${fallY}px,0) rotate(${1160+side*120}deg) scale(.78)`;
        shot.style.opacity='0';setTimeout(done,820);
      },500);
    }
  }
  requestAnimationFrame(fly);
}

resetBtn.addEventListener('click',()=>{if(!hasInteracted){hasInteracted=true;ensureAudio();}round=1;wins=0;lastWinner=null;resetRound(true);});
musicBtn.addEventListener('click',()=>{if(!hasInteracted){hasInteracted=true;ensureAudio();}musicOn=!musicOn;musicBtn.textContent=musicOn?'♫ Music: On':'♫ Music: Off';if(musicMaster)musicMaster.gain.value=musicOn?.045:.0001;});
soundBtn.addEventListener('click',()=>{if(!hasInteracted){hasInteracted=true;ensureAudio();}sfxOn=!sfxOn;soundBtn.textContent=sfxOn?'🔊 SFX: On':'🔇 SFX: Off';});

createBalls();winner=chooseWinner();updateHud();
})();