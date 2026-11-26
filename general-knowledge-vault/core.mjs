export const LADDER = [10,20,50,100,200,500,1000];
export const DURATION = 300000;
export function newRun(now=Date.now()){return {deadline:now+DURATION,phase:'question',banked:0,chain:0,attempts:0,correct:0,bestChain:0,mistakes:[],ended:false};}
export function remaining(run,now=Date.now()){return Math.max(0,run.deadline-now);}
export function finish(run){if(run.ended)return;run.lostAtEnd=run.chain;run.chain=0;run.ended=true;run.phase='finished';}
export function live(run,now=Date.now()){if(run.ended)return false;if(!remaining(run,now)){finish(run);return false;}return true;}
export function mark(run,question,good,now=Date.now()){
 if(!live(run,now)||run.phase!=='revealed')return false;
 run.attempts++;
 if(good){run.correct++;const i=LADDER.indexOf(run.chain)+1;run.chain=LADDER[i];run.bestChain=Math.max(run.bestChain,run.chain);run.autoBanked=run.chain===1000;if(run.autoBanked){run.banked+=run.chain;run.chain=0;}run.phase='decision';}
 else{run.lastLost=run.chain;run.chain=0;run.autoBanked=false;run.mistakes.push(question);run.phase='feedback';}
 return true;
}
export function bank(run,now=Date.now()){
 if(!live(run,now)||run.phase!=='decision'||!run.chain)return 0;
 const points=run.chain;run.banked+=points;run.chain=0;return points;
}
export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeDeck(topics){const buckets=shuffle(topics).map(t=>shuffle(t.questions.map(q=>({...q,topic:t.name,topicId:t.id}))));const deck=[];while(buckets.some(b=>b.length))for(const b of shuffle(buckets))if(b.length)deck.push(b.pop());return deck;}
