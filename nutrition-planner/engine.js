(function(root){
const keys=['energy','protein','fibre','calcium','iron','sugar'];
const targets={energy:{min:8370,max:10230,aim:9300},protein:{aim:40},fibre:{aim:24},calcium:{aim:1300},iron:{aim:8}};
function expected(food,portion,key){return food.values[key]*portion/100;}
function validNumber(v){return v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>=0;}
function tolerance(key,value){return Math.max(key==='energy'?2:key==='calcium'?1:.11,value*.01);}
function check(row,food){return keys.map(key=>({key,expected:expected(food,row.portion,key),valid:validNumber(row.answers[key])&&Math.abs(Number(row.answers[key])-expected(food,row.portion,key))<=tolerance(key,expected(food,row.portion,key))}));}
function total(rows){const out=Object.fromEntries(keys.map(k=>[k,0]));for(const row of rows)for(const k of keys)if(validNumber(row.answers[k]))out[k]+=Number(row.answers[k]);return out;}
function status(key,n){const t=targets[key];if(!t)return 'context';if(t.max)return n<t.min?'below':n>t.max?'above':'met';return n+1e-8>=t.aim?'met':n>=t.aim*.95?'close':'below';}
const drinkData=[
{id:'coke',name:'Coca-Cola Classic',sugar:10.6,energy:180,volume:330,portion:'330 mL can',source:'https://www.coca-cola.com/nz/en/brands/coca-cola'},
{id:'fanta',name:'Fanta Orange',sugar:7.9,energy:137,volume:600,portion:'600 mL bottle',source:'https://www.coca-cola.com/nz/en/brands/fanta'},
{id:'apple',name:'Keri Apple Fruit Juice',sugar:11.2,energy:207,volume:200,portion:'200 mL poured portion',source:'https://www.coca-cola.com/nz/en/brands/keri/products/keri-cans'},
{id:'water',name:'Plain water',sugar:0,energy:0,volume:750,portion:'750 mL bottle',source:null}
];
const drinkHints={coke:'Find how many 100 mL portions are in 330 mL, then multiply by the label value.',fanta:'Find how many 100 mL portions are in 600 mL, then multiply by the label value.',apple:'Use the sugar per 100 mL and the 200 mL portion. “No added sugar” does not mean no sugar.',water:'Use the sugar value for plain water. An answer of zero is allowed.',volume:'Use the unrounded sugar total for the Coca-Cola can. Divide by Fanta’s sugar per 100 mL, then multiply by 100.',concentration:'Compare the per-100-mL figures for the three drinks other than water.',container:'Compare your calculated sugar amounts for the three chosen portions other than water.'};
function drinkAnswers(){const out=Object.fromEntries(drinkData.map(d=>[d.id,d.sugar*d.volume/100]));return {...out,volume:out.coke/7.9*100,concentration:'fanta',container:'apple'};}
function checkDrinks(d){return Object.entries(drinkAnswers()).map(([key,value])=>({key,valid:typeof value==='number'?validNumber(d[key])&&Math.abs(Number(d[key])-value)<0.06:d[key]===value}));}
function aboveReferences(totals){return ['protein','fibre','calcium','iron'].filter(k=>totals[k]>targets[k].aim*1.5);}
function planIssues(rows,foods){
const byId=new Map(foods.map(f=>[f.id,f]));let treats=0,sugaryDrinks=0;const groups=new Set(),meals=new Set();
for(const r of rows){const f=byId.get(r.food);if(!f)continue;const servings=r.portion/f.portion;if(f.group==='Extras'||f.group==='Treats & takeaway options'||f.treat)treats+=servings;if(f.sugaryDrink||['C1116','C1167'].includes(f.id))sugaryDrinks+=servings;groups.add(f.group);meals.add(r.meal);}
const issues=[],totals=total(rows);
if(treats>2+1e-8)issues.push(`Your plan has ${Number(treats.toFixed(2))} treat servings. Reduce this to no more than 2 reference servings for this activity.`);
if(sugaryDrinks>1+1e-8)issues.push(`Your plan has ${Number(sugaryDrinks.toFixed(2))} servings of sugary drinks or juice. Choose no more than 1 reference serving for this activity; consider water for additional drinks.`);
if(totals.energy>targets.energy.max)issues.push(`Your energy total is above the classroom range of ${targets.energy.max.toLocaleString('en-NZ')} kJ. Review your foods and servings.`);
const missingMeals=['Breakfast','Lunch','Dinner'].filter(m=>!meals.has(m));if(missingMeals.length)issues.push('Add food for '+missingMeals.join(', ')+'.');
const missingGroups=['Grains','Fruit','Vegetables','Protein foods'].filter(g=>!groups.has(g));if(!groups.has('Dairy')&&!groups.has('Dairy alternatives'))missingGroups.push('Dairy or a fortified alternative');if(missingGroups.length)issues.push('Add variety: include '+missingGroups.join(', ')+'.');
return issues;
}
const api={planIssues,drinkData,drinkAnswers,aboveReferences,checkDrinks,drinkHints,keys,targets,expected,check,total,status,validNumber};root.NutritionEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
