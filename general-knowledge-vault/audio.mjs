// Browsers unlock audio on the first player gesture. Sound starts enabled.
export function createShowAudio({Music=Audio,Context=globalThis.AudioContext??globalThis.webkitAudioContext}={}) {
 let enabled=true,active=false,context,risk=0,finalMinute=false;
 const music=new Music(new URL('./assets/vault-suspense.mp3',import.meta.url).href);
 music.loop=true;music.preload='none';music.volume=.24;
 if(typeof document!=='undefined'){music.hidden=true;music.setAttribute('aria-hidden','true');document.body.append(music);}
 function intensity(){music.volume=.24+Math.min(risk/1000,1)*.1+(finalMinute?.04:0);music.playbackRate=finalMinute?1.13:1+Math.min(risk/1000,1)*.035;}
 function play(){try{const p=music.play();p?.catch?.(()=>{});}catch{}}
 function sync(){if(enabled&&active)play();else music.pause();}
 function notes(type){if(!enabled||!Context)return;try{context??=new Context();const resumed=context.resume();resumed?.catch?.(()=>{});const sequences={start:[147,220,294,311],good:[587,880],bank:[294,349,440,587],wrong:[155,110,73],finish:[294,233,147,73]};const list=sequences[type]??sequences.good;list.forEach((frequency,i)=>{const start=context.currentTime+i*.105,osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=frequency;osc.type=type==='wrong'?'triangle':'sine';gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.09,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.28);osc.connect(gain);gain.connect(context.destination);osc.start(start);osc.stop(start+.3);});}catch{}}
 return {get enabled(){return enabled;},toggle(){enabled=!enabled;sync();if(enabled)notes('good');return enabled;},start(){active=true;risk=0;finalMinute=false;music.currentTime=0;intensity();sync();notes('start');},stop(){active=false;music.pause();},setRisk(points){risk=points;intensity();},urgent(){finalMinute=true;intensity();},tone:notes};
}
