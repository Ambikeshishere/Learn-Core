(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var fmtIN=function(n){return Math.round(n).toLocaleString('en-IN')};
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

var EXAMS={
  jee:{name:'JEE',full:'JEE Main + Advanced',subjects:['Physics','Chemistry','Maths'],pop:1200000,label:'Est. AIR'},
  neet:{name:'NEET',full:'NEET UG',subjects:['Physics','Chemistry','Biology'],pop:2200000,label:'Est. AIR'},
  boards:{name:'Boards',full:'Class 12 Boards',subjects:['Physics','Chemistry','Maths','Biology'],pop:1500000,label:'Est. board rank'}
};
var ALL=['jee','neet','boards'];
var DN={E:'Easy',M:'Medium',H:'Hard'};
var Q=[
 {id:'p1',t:'Kinetic Energy of a Moving Mass',d:'E',s:'Physics',x:ALL,tp:'Work, energy and power',q:'A body of mass 2 kg moves at 3 m/s. What is its kinetic energy?',o:['3 J','6 J','9 J','18 J'],a:2,e:'KE = ½mv² = ½ × 2 × 3² = 9 J.',m:18},
 {id:'p2',t:'Parallel Resistors',d:'E',s:'Physics',x:ALL,tp:'Current electricity',q:'A 6 Ω and a 3 Ω resistor are connected in parallel. What is the equivalent resistance?',o:['9 Ω','4.5 Ω','2 Ω','18 Ω'],a:2,e:'1/R = 1/6 + 1/3 = 1/2, so R = 2 Ω.',m:22},
 {id:'p3',t:'Pendulum with g = π²',d:'M',s:'Physics',x:['jee','boards'],tp:'Oscillations',q:'A simple pendulum of length 1 m is at a place where g = π² m/s². Its time period is:',o:['1 s','2 s','π s','2π s'],a:1,e:'T = 2π√(L/g) = 2π√(1/π²) = 2 s.',m:35},
 {id:'p4',t:'Power of a Convex Lens',d:'E',s:'Physics',x:ALL,tp:'Ray optics',q:'A convex lens has focal length 25 cm. Its power is:',o:['+4 D','−4 D','+0.25 D','+25 D'],a:0,e:'P = 1/f with f in metres: 1/0.25 = +4 D. A convex lens has positive power.',m:20},
 {id:'p5',t:'Energy in a Charged Capacitor',d:'M',s:'Physics',x:['jee','boards'],tp:'Capacitance',q:'A 10 µF capacitor is charged to 100 V. The energy stored is:',o:['0.05 J','0.5 J','0.1 J','0.01 J'],a:0,e:'U = ½CV² = ½ × 10×10⁻⁶ × 100² = 0.05 J.',m:30},
 {id:'p6',t:'Photon Energy at 500 nm',d:'M',s:'Physics',x:ALL,tp:'Dual nature of radiation',q:'The energy of a photon of wavelength 500 nm is closest to:',o:['1.24 eV','2.48 eV','4.96 eV','0.62 eV'],a:1,e:'E (eV) ≈ 1240 / λ (nm) = 1240 / 500 = 2.48 eV.',m:28},
 {id:'c1',t:'Hybridisation in Ethene',d:'E',s:'Chemistry',x:ALL,tp:'Hybridisation',q:'The hybridisation of each carbon atom in ethene (C₂H₄) is:',o:['sp','sp²','sp³','sp³d'],a:1,e:'Each carbon forms three sigma bonds (two C–H, one C–C) and one pi bond, so it is sp² hybridised.',m:20},
 {id:'c2',t:'pH of Dilute HCl',d:'E',s:'Chemistry',x:ALL,tp:'Ionic equilibrium',q:'What is the pH of a 0.001 M HCl solution at 25 °C?',o:['1','2','3','11'],a:2,e:'HCl dissociates fully, so [H⁺] = 10⁻³ M and pH = 3.',m:25},
 {id:'c3',t:'Most Electronegative Element',d:'E',s:'Chemistry',x:ALL,tp:'Periodic properties',q:'Which element has the highest electronegativity?',o:['Chlorine','Fluorine','Oxygen','Nitrogen'],a:1,e:'Fluorine is the most electronegative element (4.0 on the Pauling scale).',m:12},
 {id:'c4',t:'Molar Mass of Calcium Carbonate',d:'E',s:'Chemistry',x:ALL,tp:'Mole concept',q:'The molar mass of CaCO₃ is:',o:['84 g/mol','100 g/mol','116 g/mol','56 g/mol'],a:1,e:'40 + 12 + 3 × 16 = 100 g/mol.',m:22},
 {id:'c5',t:'Moles in 36 g of Water',d:'E',s:'Chemistry',x:ALL,tp:'Mole concept',q:'How many moles are present in 36 g of water?',o:['1','2','3','4'],a:1,e:'Molar mass of H₂O is 18 g/mol, so n = 36 / 18 = 2 mol.',m:20},
 {id:'c6',t:'Half-life of a First-order Reaction',d:'H',s:'Chemistry',x:['jee','boards'],tp:'Chemical kinetics',q:'A first-order reaction has k = 0.0693 min⁻¹. Its half-life is:',o:['1 min','10 min','100 min','0.693 min'],a:1,e:'t½ = 0.693 / k = 0.693 / 0.0693 = 10 min.',m:40},
 {id:'c7',t:'Shape of Ammonia',d:'E',s:'Chemistry',x:ALL,tp:'Chemical bonding',q:'The shape of the NH₃ molecule is:',o:['Linear','Trigonal planar','Trigonal pyramidal','Tetrahedral'],a:2,e:'NH₃ has three bond pairs and one lone pair. The electron geometry is tetrahedral and the molecular shape is trigonal pyramidal.',m:18},
 {id:'m1',t:'Integral of sin x',d:'M',s:'Maths',x:['jee','boards'],tp:'Definite integrals',q:'The value of ∫₀^π sin x dx is:',o:['0','1','2','π'],a:2,e:'∫₀^π sin x dx = [−cos x] from 0 to π = −cos π + cos 0 = 1 + 1 = 2.',m:40},
 {id:'m2',t:'Sum of Roots',d:'E',s:'Maths',x:['jee','boards'],tp:'Quadratic equations',q:'The sum of the roots of x² − 5x + 6 = 0 is:',o:['5','6','−5','1'],a:0,e:'Sum of roots = −b/a = 5. (The roots are 2 and 3.)',m:18},
 {id:'m3',t:'Determinant Scaling',d:'M',s:'Maths',x:['jee','boards'],tp:'Determinants',q:'If A is a 2×2 matrix with det A = 3, then det(2A) equals:',o:['6','12','9','3'],a:1,e:'det(kA) = kⁿ det A for an n×n matrix. Here 2² × 3 = 12.',m:30},
 {id:'m4',t:'Limit of sin 3x over x',d:'M',s:'Maths',x:['jee','boards'],tp:'Limits',q:'lim (x→0) sin(3x) / x equals:',o:['0','1','3','∞'],a:2,e:'sin(3x)/x = 3 · sin(3x)/(3x), and sin(u)/u → 1, so the limit is 3.',m:28},
 {id:'m5',t:'Arrangements of LEVEL',d:'H',s:'Maths',x:['jee'],tp:'Permutations',q:'In how many distinct ways can the letters of the word LEVEL be arranged?',o:['30','60','120','15'],a:0,e:'5 letters with L repeated twice and E repeated twice: 5! / (2! × 2!) = 30.',m:45},
 {id:'m6',t:'Tangent Slope of x Cubed',d:'M',s:'Maths',x:['jee','boards'],tp:'Application of derivatives',q:'The slope of the tangent to y = x³ at x = 2 is:',o:['6','8','12','4'],a:2,e:'dy/dx = 3x², which is 12 at x = 2.',m:30},
 {id:'m7',t:'Dice Sum of Seven',d:'M',s:'Maths',x:['jee','boards'],tp:'Probability',q:'Two fair dice are thrown. The probability that the sum is 7 is:',o:['1/12','1/6','1/9','5/36'],a:1,e:'Six of the 36 outcomes sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). So 6/36 = 1/6.',m:32},
 {id:'b1',t:'Joining Okazaki Fragments',d:'M',s:'Biology',x:['neet','boards'],tp:'Molecular basis of inheritance',q:'Which enzyme joins the Okazaki fragments on the lagging strand?',o:['DNA polymerase','DNA ligase','Helicase','Primase'],a:1,e:'DNA ligase seals the nicks between Okazaki fragments.',m:20},
 {id:'b2',t:'Site of the Light Reaction',d:'E',s:'Biology',x:['neet','boards'],tp:'Photosynthesis',q:'The light reaction of photosynthesis takes place in the:',o:['Stroma','Thylakoid membrane','Mitochondrial matrix','Cytoplasm'],a:1,e:'Light reactions occur on the thylakoid membranes of the grana. The Calvin cycle runs in the stroma.',m:18},
 {id:'b3',t:'Gamete Chromosome Number',d:'E',s:'Biology',x:['neet','boards'],tp:'Human reproduction',q:'How many chromosomes does a human gamete contain?',o:['46','23','24','22'],a:1,e:'Gametes are haploid, so 46 / 2 = 23 chromosomes.',m:10},
 {id:'b4',t:'Pineal Gland Hormone',d:'E',s:'Biology',x:['neet','boards'],tp:'Chemical coordination',q:'Which hormone is secreted by the pineal gland?',o:['Thyroxine','Insulin','Melatonin','Cortisol'],a:2,e:'The pineal gland secretes melatonin, which helps regulate the sleep–wake cycle.',m:10},
 {id:'b5',t:'Double Fertilisation',d:'E',s:'Biology',x:['neet','boards'],tp:'Sexual reproduction in plants',q:'Double fertilisation is a characteristic feature of:',o:['Gymnosperms','Angiosperms','Pteridophytes','Bryophytes'],a:1,e:'Syngamy plus triple fusion (double fertilisation) occurs only in angiosperms.',m:14},
 {id:'b6',t:'Universal Donor',d:'E',s:'Biology',x:['neet','boards'],tp:'Body fluids and circulation',q:'Which blood group is called the universal donor?',o:['AB positive','O negative','A positive','B negative'],a:1,e:'O-negative red cells carry no A, B or Rh antigens, so they can be given to almost any recipient.',m:12},
 {id:'b7',t:'Sex Determination in Humans',d:'E',s:'Biology',x:['neet','boards'],tp:'Principles of inheritance',q:'In humans, the sex of a child is determined by:',o:['The mother\'s egg','The father\'s sperm','Temperature during development','The autosomes'],a:1,e:'The egg always carries X. The sperm carries either X (girl) or Y (boy).',m:14}
];
/* Extra questions from questions.js (made by import_questions.py). Text is escaped because it comes from outside. */
function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function normQ(x){
  if(!x||typeof x.id!=='string'||!/^[A-Za-z0-9]+$/.test(x.id)||!Array.isArray(x.o)||x.o.length!==4||!(x.a>=0&&x.a<4))return null;
  if(['Physics','Chemistry','Maths','Biology'].indexOf(x.s)<0||!Array.isArray(x.x))return null;
  if(Q.some(function(q){return q.id===x.id}))return null;
  var ex=x.x.filter(function(e){return ALL.indexOf(e)>-1});if(!ex.length)return null;
  return {id:x.id,t:esc(x.t||x.id),d:(typeof x.d==='string'&&x.d.length===1&&'EMH'.indexOf(x.d)>-1)?x.d:'M',s:x.s,x:ex,tp:esc(x.tp||x.s),q:esc(x.q),
    o:x.o.map(esc),a:x.a|0,e:esc(x.e||'No worked solution is included in the source dataset.'),m:Math.max(5,+x.m||120),src:x.src?esc(x.src):''};
}
if(Array.isArray(window.EXTRA_QUESTIONS))window.EXTRA_QUESTIONS.forEach(function(x){var q=normQ(x);if(q)Q.push(q)});
function typeset(el){try{if(el&&window.renderMathInElement)window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})}catch(e){}}
var QBY={};Q.forEach(function(q){QBY[q.id]=q});

var S={exam:load('ail.exam','jee'),att:load('ail.att',[]),q:null,sel:-1,locked:false,t0:0,res:null,tab:'desc',confirm:false,period:'w',range:'30',f:{text:'',diff:'',status:'',subj:''}};
if(!EXAMS[S.exam])S.exam='jee';
if(!Array.isArray(S.att))S.att=[];
var U=window.Auth&&Auth.get()||null;
if(U&&EXAMS[U.exam])S.exam=U.exam;
var theme=load('ail.theme','');if(theme==='dark'||theme==='light')document.documentElement.setAttribute('data-theme',theme);
var tm=null;

/* ---------- utilities ---------- */
function hash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){var u=0;while(!u)u=r();var v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function phi(z){var t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2);var p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p}
function sum(arr,f){var t=0;for(var i=0;i<arr.length;i++)t+=f(arr[i]);return t}
function dayKey(ts){var d=new Date(ts);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function fmtK(n){return n>=1000?(n/1000).toFixed(1)+'K':String(n)}
function fmtT(ms){return (ms/1000).toFixed(1)+' s'}

/* ---------- v2 helpers: progress, badges, insights, export ---------- */
function xpTotal(){return sum(S.att,function(a){return a.ok===true?10:a.ok===false?3:1})}
function levelInfo(){var xp=xpTotal();return {xp:xp,lv:Math.floor(xp/100)+1,cur:xp%100,need:100}}
function toast(msg){
  var old=$('.toast');if(old)old.remove();
  var d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;
  document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove()},2800);
}
function download(name,text,type){
  try{
    var blob=new Blob([text],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);
  }catch(e){toast('Download is not available in this browser.')}
}
function badgeDefs(){
  var a=S.att,ok=a.filter(function(x){return x.ok===true}).length,wr=a.filter(function(x){return x.ok===false}).length;
  var st=streaks(),acc=ok+wr?ok/(ok+wr):0;
  var quick=a.filter(function(x){var q=QBY[x.q];return x.ok===true&&q&&x.t/1000<q.m}).length;
  var subs=['Physics','Chemistry','Maths','Biology'],master=subs.some(function(s){
    var list=pool().filter(function(q){return q.s===s});return list.length>0&&list.every(function(q){return stOf(q.id)==='s'});
  });
  return [
    {n:'First step',d:'Your first correct answer',got:ok>=1,i:'01'},
    {n:'On a roll',d:'3-day streak',got:st.max>=3,i:'03'},
    {n:'Unbreakable',d:'7-day streak',got:st.max>=7,i:'07'},
    {n:'Twenty strong',d:'20 submissions',got:a.length>=20,i:'20'},
    {n:'Century',d:'100 submissions',got:a.length>=100,i:'100'},
    {n:'Sharpshooter',d:'80% accuracy over 20+ attempts',got:ok+wr>=20&&acc>=.8,i:'80'},
    {n:'Quick mind',d:'10 correct answers under median time',got:quick>=10,i:'10'},
    {n:'Clean sweep',d:'Solve every problem in one subject',got:master,i:'ALL'}
  ];
}
function filteredAtt(){
  var a=forExam(S.exam);
  if(S.range==='all')return a;
  var days=+S.range||30,cut=Date.now()-days*864e5;
  return a.filter(function(x){return x.ts>=cut});
}
function weakTopics(n,useRange){
  var m={};
  (useRange?filteredAtt():forExam(S.exam)).forEach(function(x){
    var q=QBY[x.q];if(!q)return;
    var k=q.tp;if(!m[k])m[k]={tp:k,total:0,ok:0,pace:0};
    m[k].total++;if(x.ok===true)m[k].ok++;m[k].pace+=x.t/1000/q.m;
  });
  var arr=Object.keys(m).map(function(k){var v=m[k];v.acc=v.ok/v.total;v.pace=v.pace/v.total;return v});
  var weak=arr.filter(function(v){return v.total>=2&&v.acc<.75}).sort(function(a,b){return a.acc-b.acc||b.total-a.total});
  var rest=arr.filter(function(v){return v.total<2||v.acc>=.75}).sort(function(a,b){return a.acc-b.acc||b.total-a.total});
  var out=weak.concat(rest);
  out.forEach(function(v){
    var cand=pool().filter(function(q){return q.tp===v.tp&&stOf(q.id)!=='s'});
    v.id=cand.length?cand[0].id:(pool().filter(function(q){return q.tp===v.tp})[0]||{}).id;
  });
  return out.filter(function(v){return v.id}).slice(0,n||3);
}
function trendSVG(days){
  var a=filteredAtt(),W=620,H=190,pl=34,pr=12,pt=12,pb=26,today=new Date();today.setHours(12,0,0,0);
  var buckets=[],labels=[];
  for(var i=days-1;i>=0;i--){var d=new Date(today);d.setDate(d.getDate()-i);buckets.push({k:dayKey(d),n:0});labels.push(d)}
  a.forEach(function(x){var k=dayKey(x.ts);for(var i=0;i<buckets.length;i++)if(buckets[i].k===k){buckets[i].n++;break}});
  var mx=Math.max(1,Math.max.apply(null,buckets.map(function(b){return b.n})));
  var X=function(i){return pl+(i/(days-1))*(W-pl-pr)},Y=function(v){return pt+(1-v/mx)*(H-pt-pb)};
  var d=buckets.map(function(b,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(b.n).toFixed(1)}).join(' ');
  var area=d+' L'+X(days-1).toFixed(1)+' '+(H-pb)+' L'+X(0).toFixed(1)+' '+(H-pb)+' Z';
  var g='';[0,Math.ceil(mx/2),mx].forEach(function(v){var y=Y(v);g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/><text x="'+(pl-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end">'+v+'</text>'});
  var ticks=[0,Math.floor((days-1)/2),days-1].map(function(i){return '<text x="'+X(i).toFixed(1)+'" y="'+(H-7)+'" text-anchor="'+(i===0?'start':i===days-1?'end':'middle')+'">'+labels[i].toLocaleDateString('en-IN',{day:'numeric',month:'short'})+'</text>'}).join('');
  return '<svg class="trend" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Submissions per day">'+g+'<path class="area" d="'+area+'"/><path class="ln" d="'+d+'"/>'+
    buckets.map(function(b,i){return b.n?'<circle class="dot" cx="'+X(i).toFixed(1)+'" cy="'+Y(b.n).toFixed(1)+'" r="3"/>':''}).join('')+ticks+'</svg>';
}

/* Rank model: shrink average marks per question toward a prior, map to a percentile on a normal curve. */
function estFrom(net,n,pop){
  var s=(net+10*0.8)/(n+10),z=(s-0.9)/0.8,top=1-phi(z);
  return {air:Math.max(1,Math.round(top*pop)),top:top*100,s:s};
}
function forExam(e){return S.att.filter(function(a){return a.e===e})}
function fmtTop(t){return t<1?t.toFixed(2):t.toFixed(1)}
function pool(){return Q.filter(function(q){return q.x.indexOf(S.exam)>-1})}
function stOf(id){var a=forExam(S.exam).filter(function(x){return x.q===id});return a.some(function(x){return x.ok===true})?'s':a.length?'t':''}

/* Simulated cohort for one problem: acceptance depends on difficulty, solve-times are drawn around the median. */
var CO={};
function cohort(q){
  if(CO[q.id])return CO[q.id];
  var r=rng(hash(q.id)),base={E:0.70,M:0.46,H:0.26}[q.d],acc=base+0.17*r(),att=Math.round(7000+r()*9000),times=[];
  for(var i=0;i<800;i++)times.push(Math.max(4,q.m*Math.exp(0.42*gauss(r))));
  times.sort(function(a,b){return a-b});
  return CO[q.id]={acc:acc,att:att,correct:Math.round(att*acc),times:times};
}
function compare(q,t){
  var c=cohort(q),slower=0,same=0;
  for(var i=0;i<c.times.length;i++){if(c.times[i]>t)slower++;if(Math.floor(c.times[i])===Math.floor(t))same++}
  return {slower:slower/c.times.length,same:same/c.times.length*c.correct,c:c};
}
function histSVG(q,t){
  var c=cohort(q),bins=16,maxT=Math.max(c.times[776],t*1.05),w=maxT/bins,cnt=[],i;
  for(i=0;i<bins;i++)cnt.push(0);
  c.times.forEach(function(x){cnt[Math.min(bins-1,Math.floor(x/w))]++});
  var mx=Math.max.apply(null,cnt),yb=Math.min(bins-1,Math.floor(t/w)),out='';
  for(var j=0;j<bins;j++){
    var h=Math.max(2,cnt[j]/mx*64);
    out+='<rect class="'+(j===yb?'me':'b')+'" x="'+(j*20+1)+'" y="'+(86-h).toFixed(1)+'" width="18" height="'+h.toFixed(1)+'" rx="2"/>';
  }
  out+='<text x="'+(yb*20+10)+'" y="'+(86-Math.max(2,cnt[yb]/mx*64)-4).toFixed(1)+'" text-anchor="middle">You</text>';
  var mxp=q.m/w*20;
  if(mxp>0&&mxp<320)out+='<line x1="'+mxp.toFixed(1)+'" x2="'+mxp.toFixed(1)+'" y1="14" y2="88"/>';
  out+='<text x="0" y="104">0 s</text><text x="160" y="104" text-anchor="middle">'+Math.round(maxT/2)+' s</text><text x="320" y="104" text-anchor="end">'+Math.round(maxT)+' s</text>';
  return '<svg class="hist" viewBox="0 0 320 110" role="img" aria-label="Solve times of other students. Your time is highlighted. Dashed line marks the median.">'+out+'</svg>';
}
function streaks(){
  var set={};S.att.forEach(function(a){var k=dayKey(a.ts);set[k]=(set[k]||0)+1});
  var cur=0,d=new Date();d.setHours(12,0,0,0);
  if(!set[dayKey(d)])d.setDate(d.getDate()-1);
  while(set[dayKey(d)]){cur++;d.setDate(d.getDate()-1)}
  var days=Object.keys(set).map(function(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2],12).getTime()}).sort(function(a,b){return a-b});
  var mx=0,run=0,prev=null;
  days.forEach(function(t){run=(prev!==null&&Math.round((t-prev)/864e5)===1)?run+1:1;if(run>mx)mx=run;prev=t});
  return {cur:cur,max:mx,set:set};
}

/* ---------- header ---------- */
function drawHeader(){
  $('#examseg').innerHTML=ALL.map(function(k){return '<button data-exam="'+k+'" aria-pressed="'+(S.exam===k)+'">'+EXAMS[k].name+'</button>'}).join('');
  $('#xpv').textContent='Lv '+levelInfo().lv;
  var ub=$('#userbox');
  if(U){
    var dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    ub.innerHTML='<button class="avatar" id="userbtn" aria-label="Account menu" aria-expanded="false">'+esc(Auth.initials(U.name))+'</button>'+
      '<div class="umenu" id="umenu"><div class="uwho"><b>'+esc(U.name)+'</b><small>'+esc(U.guest?'Guest · saved on this device':U.email)+'</small></div>'+
      '<a href="#dashboard">Dashboard</a><a href="#analytics">Analytics</a><a href="#profile">Profile & badges</a>'+
      '<button data-u="theme">Switch to '+(dark?'light':'dark')+' mode</button>'+
      (U.guest?'<button data-u="signup">Create an account</button>':'')+
      '<button class="udanger" data-u="logout">Log out</button></div>';
    $('#userbtn').addEventListener('click',function(){
      var m=$('#umenu');m.classList.toggle('open');this.setAttribute('aria-expanded',m.classList.contains('open'));
    });
    ub.querySelectorAll('[data-u]').forEach(function(b){b.addEventListener('click',function(){
      var m=$('#umenu');if(m)m.classList.remove('open');
      if(b.dataset.u==='theme'){
        var next=dark?'light':'dark';document.documentElement.setAttribute('data-theme',next);save('ail.theme',next);
        try{Analytics.track('theme',{to:next})}catch(e){}drawHeader();
      }else if(b.dataset.u==='logout'){
        Auth.logout();U=null;toast('Logged out. Your progress stays on this device.');route();
      }else if(b.dataset.u==='signup'){
        Auth.logout();U=null;Auth.render();
      }
    })});
  }else{
    ub.innerHTML='<button class="btn sm" id="signupbtn">Sign up</button>';
    $('#signupbtn').addEventListener('click',function(){Auth.render()});
  }
  updateChip();
}
function updateChip(){
  var a=forExam(S.exam),e=estFrom(sum(a,function(x){return x.m}),a.length,EXAMS[S.exam].pop);
  $('#chiplab').textContent=EXAMS[S.exam].label;
  $('#chipv').textContent=a.length?fmtIN(e.air):'-';
  $('#streakv').textContent=streaks().cur+'d';
  var x=$('#xpv');if(x)x.textContent='Lv '+levelInfo().lv;
}

/* ---------- problems list ---------- */
var CHECK='<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Solved"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function bestOf(id){
  var t=forExam(S.exam).filter(function(x){return x.q===id&&x.ok===true}).map(function(x){return x.t});
  return t.length?(Math.min.apply(null,t)/1000).toFixed(1)+'s':'-';
}
function dailyQ(){var p=pool();return p[hash(dayKey(Date.now())+S.exam)%p.length]}
function renderProblems(){
  var ex=EXAMS[S.exam],list=pool(),solved=list.filter(function(q){return stOf(q.id)==='s'}).length,dq=dailyQ();
  var circ=2*Math.PI*40,frac=list.length?solved/list.length:0;
  var byD=['E','M','H'].map(function(d){var t=list.filter(function(q){return q.d===d}),s=t.filter(function(q){return stOf(q.id)==='s'}).length;return '<div><span class="d-'+d+'">'+DN[d]+'</span><b>'+s+'/'+t.length+'</b></div>'}).join('');
  var st=streaks();
  $('#view').innerHTML='<div class="plist"><div>'+
    '<div class="filters"><input id="fq" type="search" placeholder="Search problems or topics" aria-label="Search" value="'+S.f.text+'">'+
    '<select id="fd" aria-label="Difficulty"><option value="">Difficulty</option><option value="E">Easy</option><option value="M">Medium</option><option value="H">Hard</option></select>'+
    '<select id="fst" aria-label="Status"><option value="">Status</option><option value="todo">Todo</option><option value="t">Attempted</option><option value="s">Solved</option></select>'+
    '<select id="fsub" aria-label="Subject"><option value="">Subject</option>'+ex.subjects.map(function(s){return '<option>'+s+'</option>'}).join('')+'</select>'+
    '<button class="btn ghost sm" data-act="random">Pick random</button></div>'+
    '<div class="card ptable" id="rows"></div><p class="hint" id="rcount"></p></div>'+
    '<aside class="side">'+
      '<div class="card daily"><div class="dt">Daily question · '+new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})+'</div>'+
      '<div class="nm">'+dq.t+'</div><div style="display:flex;gap:10px;align-items:center"><span class="badge d-'+dq.d+'">'+DN[dq.d]+'</span><a class="btn sm" href="#q-'+dq.id+'">'+(stOf(dq.id)==='s'?'Solve again':'Solve')+'</a></div></div>'+
      '<div class="card"><h3>Progress</h3><div class="prog"><svg class="donut" viewBox="0 0 100 100" role="img" aria-label="'+solved+' of '+list.length+' solved"><circle class="tr" cx="50" cy="50" r="40"/><circle class="fg" cx="50" cy="50" r="40" stroke-dasharray="'+(circ*frac).toFixed(1)+' '+circ.toFixed(1)+'"/><text x="50" y="52">'+solved+'</text><text class="sub" x="50" y="66">/ '+list.length+' solved</text></svg><div class="dstat">'+byD+'</div></div></div>'+
      '<div class="card"><h3>Streak</h3><div class="stats"><div class="stat"><small>Current</small><b>'+st.cur+'d</b></div><div class="stat"><small>Longest</small><b>'+st.max+'d</b></div></div><p class="insight">Submit at least one answer a day to keep it going.</p></div>'+
    '</aside></div>';
  $('#fd').value=S.f.diff;$('#fst').value=S.f.status;$('#fsub').value=S.f.subj;
  drawRows();
}
function drawRows(){
  var list=pool(),f=S.f,txt=f.text.trim().toLowerCase();
  var out='<div class="prow head"><span></span><span>Title</span><span>Topic</span><span style="text-align:right">Acceptance</span><span style="text-align:right">Best</span><span style="text-align:right">Level</span></div>',n=0;
  list.forEach(function(q,i){
    var st=stOf(q.id);
    if(f.diff&&q.d!==f.diff)return;
    if(f.subj&&q.s!==f.subj)return;
    if(f.status==='todo'&&st)return;
    if(f.status==='t'&&st!=='t')return;
    if(f.status==='s'&&st!=='s')return;
    if(txt&&(q.t+' '+q.tp+' '+q.s).toLowerCase().indexOf(txt)<0)return;
    n++;
    out+='<a class="prow" href="#q-'+q.id+'"><span class="st '+st+'">'+(st==='s'?CHECK:st==='t'?'<i></i>':'')+'</span><span class="ptt"><span class="pn">'+(i+1)+'.</span>'+q.t+'</span><span class="ptp">'+q.tp+'</span><span class="pac">'+(cohort(q).acc*100).toFixed(1)+'%</span><span class="pbest">'+bestOf(q.id)+'</span><span class="pdf d-'+q.d+'">'+DN[q.d]+'</span></a>';
  });
  if(!n)out+='<p class="empty">No problems match these filters.</p>';
  $('#rows').innerHTML=out;
  $('#rcount').textContent=n+' of '+list.length+' problems shown';
}

/* ---------- problem page ---------- */
function openQ(q){
  S.q=q;S.sel=-1;S.locked=false;S.res=null;S.tab='desc';S.t0=performance.now();
  try{Analytics.track('problem_open',{q:q.id,exam:S.exam})}catch(e){}
}
function nextId(){
  var list=pool(),idx=list.indexOf(S.q);
  for(var k=1;k<list.length;k++){var c=list[(idx+k)%list.length];if(stOf(c.id)!=='s')return c.id}
  return list[(idx+1)%list.length].id;
}
function renderProblem(){
  $('#view').innerHTML='<div class="crumb"><a href="#problems">← All problems</a></div><div class="split"><section class="card" id="lpane"></section><section class="card" id="rpane" aria-live="polite"></section></div>';
  drawLeft();drawRight();startTimer();
}
function drawLeft(){
  var q=S.q,num=pool().indexOf(q)+1,c=cohort(q),L='ABCD';
  var tabs=[['desc','Description'],['sol','Solution'],['sub','Submissions']].map(function(t){return '<button data-act="tab" data-v="'+t[0]+'" aria-pressed="'+(S.tab===t[0])+'">'+t[1]+'</button>'}).join('');
  var mine=forExam(S.exam).filter(function(a){return a.q===q.id}),body='';
  if(S.tab==='desc'){
    body='<h1 class="ptitle">'+num+'. '+q.t+'</h1><div class="badges"><span class="badge d-'+q.d+'">'+DN[q.d]+'</span><span class="tagc">'+q.s+'</span><span class="tagc">'+q.tp+'</span></div>'+
      '<p class="qtext">'+q.q+'</p>'+
      '<div class="kv"><div><small>Marking</small><b>+4 / −1 / 0</b></div><div><small>Median time</small><b>'+q.m+' s</b></div><div><small>Acceptance</small><b>'+(c.acc*100).toFixed(1)+'%</b></div><div><small>Submissions</small><b>'+fmtK(c.att)+'</b></div></div>'+
      '<p class="insight">A wrong answer costs 1 extra mark, so a guess breaks even at 20% confidence. <span class="sim">Simulated stats</span></p>'+(q.src?'<p class="insight">Source: '+q.src+'</p>':'');
  }else if(S.tab==='sol'){
    body=mine.length?'<h3>Answer</h3><div class="code">'+L[q.a]+'. '+q.o[q.a]+'</div><p class="qtext">'+q.e+'</p>':'<p class="empty">Submit an answer to unlock the solution.</p>';
  }else{
    body=mine.length?'<div class="tblwrap"><table><thead><tr><th>Status</th><th>Time</th><th>Marks</th><th>When</th></tr></thead><tbody>'+mine.slice().reverse().map(function(a){
      var s=a.ok===true?'<span class="pos">Accepted</span>':a.ok===false?'<span class="neg">Wrong Answer</span>':'Skipped';
      return '<tr><td>'+s+'</td><td>'+(a.t/1000).toFixed(1)+' s</td><td>'+(a.m>0?'+':'')+a.m+'</td><td>'+new Date(a.ts).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</td></tr>';
    }).join('')+'</tbody></table></div>':'<p class="empty">No submissions yet.</p>';
  }
  $('#lpane').innerHTML='<div class="ptabs" role="group" aria-label="Problem tabs">'+tabs+'</div>'+body;
  typeset($('#lpane'));
}
function resultHTML(){
  var q=S.q,r=S.res,L='ABCD',ts=(r.t/1000).toFixed(1),c=cohort(q);
  if(r.kind==='ok'){
    var cm=compare(q,r.t/1000);
    return '<div class="res ok"><div class="sub"><h2>Accepted</h2><span class="mk pos">+4 marks</span></div>'+
      '<div class="boxes"><div class="box"><small>Time</small><div class="v">'+ts+' s</div><div class="w">Beats '+Math.round(cm.slower*100)+'% of accepted submissions</div></div>'+
      '<div class="box"><small>Same second</small><div class="v">~'+fmtIN(cm.same)+'</div><div class="w">of '+fmtIN(c.correct)+' who solved it, at '+Math.floor(r.t/1000)+' s</div></div></div>'+
      '<div class="histbox">'+histSVG(q,r.t/1000)+'</div><p class="hint" style="margin:8px 0 0">Dashed line is the median ('+q.m+' s). <span class="sim">Simulated cohort</span></p>'+
      '<p class="why">'+q.e+'</p></div>';
  }
  if(r.kind==='bad'){
    return '<div class="res bad"><div class="sub"><h2>Wrong Answer</h2><span class="mk neg">−1 mark</span></div>'+
      '<div class="code"><small>Your answer</small>'+L[S.sel]+'. '+q.o[S.sel]+'</div><div class="code"><small>Expected</small>'+L[q.a]+'. '+q.o[q.a]+'</div>'+
      '<p class="why">'+q.e+'</p><p class="why">'+Math.round(c.acc*100)+'% of students get this right, and they take a median of '+q.m+' s. You spent '+ts+' s. <span class="sim">Simulated cohort</span></p></div>';
  }
  return '<div class="res"><div class="sub"><h2>Skipped</h2><span class="mk">0 marks</span></div><div class="code"><small>Expected</small>'+L[q.a]+'. '+q.o[q.a]+'</div><p class="why">'+q.e+'</p></div>';
}
function drawRight(){
  var q=S.q,L='ABCD';
  var opts=q.o.map(function(t,i){
    var cls='opt';
    if(S.locked){if(i===q.a)cls+=' right';else if(i===S.sel)cls+=' wrong'}
    return '<li><button class="'+cls+'" role="radio" aria-checked="'+(S.sel===i)+'" data-act="pick" data-i="'+i+'"'+(S.locked?' disabled':'')+'><span class="bub">'+L[i]+'</span><span>'+t+'</span></button></li>';
  }).join('');
  var actions=S.locked?'<a class="btn" id="nextbtn" href="#q-'+nextId()+'">Next problem →</a><a class="btn ghost" href="#problems">Problem list</a>':
    '<button class="btn" data-act="lock"'+(S.sel<0?' disabled':'')+'>Submit</button><button class="btn ghost" data-act="skip">Skip (0)</button><span class="hint">A–D or 1–4 to choose, Enter to submit</span>';
  $('#rpane').innerHTML='<div class="ahead"><b>Your answer</b><span class="scheme">+4 / −1</span><span class="timer" id="timer">'+(S.locked&&S.res?fmtT(S.res.t):'0.0 s')+'</span></div>'+
    '<ul class="opts" role="radiogroup" aria-label="Options">'+opts+'</ul><div class="actions">'+actions+'</div>'+(S.locked?resultHTML():'');
  typeset($('#rpane'));
}
function startTimer(){
  clearInterval(tm);
  if(S.locked)return;
  tm=setInterval(function(){var el=$('#timer');if(!el){clearInterval(tm);return}el.textContent=fmtT(performance.now()-S.t0)},100);
}
function pick(i){if(S.locked)return;S.sel=i;drawRight()}
function lockAns(skip){
  if(S.locked||(!skip&&S.sel<0))return;
  var before=badgeDefs().filter(function(b){return b.got}).map(function(b){return b.n});
  var t=performance.now()-S.t0,ok=skip?null:S.sel===S.q.a,m=skip?0:ok?4:-1;
  S.att.push({q:S.q.id,e:S.exam,s:S.q.s,c:skip?-1:S.sel,ok:ok,t:Math.round(t),m:m,ts:Date.now()});
  save('ail.att',S.att);
  S.locked=true;clearInterval(tm);
  S.res={kind:skip?'skip':ok?'ok':'bad',t:Math.round(t),m:m};
  drawLeft();drawRight();updateChip();
  try{Analytics.track('answer',{q:S.q.id,exam:S.exam,result:skip?'skip':ok?'correct':'wrong',time:Math.round(t)})}catch(e){}
  var fresh=badgeDefs().filter(function(b){return b.got&&before.indexOf(b.n)<0});
  if(fresh.length)toast('Badge unlocked: '+fresh.map(function(b){return b.n}).join(', '));
  var nb=$('#nextbtn');if(nb)nb.focus();
}

/* ---------- profile ---------- */
function chartSVG(e){
  var a=forExam(e),pop=EXAMS[e].pop;
  if(a.length<1)return '<p class="empty">Submit a few answers to start your rank journey.</p>';
  var W=640,H=230,pl=64,pr=16,pt=14,pb=30,net=0,pts=[{n:0,air:estFrom(0,0,pop).air}];
  a.forEach(function(x,i){net+=x.m;pts.push({n:i+1,air:estFrom(net,i+1,pop).air})});
  var N=pts.length-1,lo=Math.log10(100),hi=Math.log10(pop);
  var X=function(n){return pl+(n/N)*(W-pl-pr)},Y=function(v){return pt+(Math.log10(Math.max(100,v))-lo)/(hi-lo)*(H-pt-pb)};
  var g='';[100,1000,10000,100000,1000000].filter(function(v){return v<=pop}).forEach(function(v){
    g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text x="'+(pl-8)+'" y="'+(Y(v)+4).toFixed(1)+'" text-anchor="end">'+fmtIN(v)+'</text>';
  });
  var d=pts.map(function(p,i){return (i?'L':'M')+X(p.n).toFixed(1)+' '+Y(p.air).toFixed(1)}).join(' ');
  var base=H-pb,area=d+' L'+X(N).toFixed(1)+' '+base+' L'+X(0).toFixed(1)+' '+base+' Z',last=pts[pts.length-1];
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Estimated rank after each submission. Lower is better.">'+g+
    '<path class="area" d="'+area+'"/><path class="ln" d="'+d+'"/><circle class="dot" cx="'+X(N).toFixed(1)+'" cy="'+Y(last.air).toFixed(1)+'" r="5"/>'+
    '<text class="lbl" x="'+(X(N)-10).toFixed(1)+'" y="'+(Y(last.air)-10).toFixed(1)+'" text-anchor="end">'+fmtIN(last.air)+'</text>'+
    '<text x="'+pl+'" y="'+(H-8)+'">0</text><text x="'+(W-pr)+'" y="'+(H-8)+'" text-anchor="end">'+N+' submissions</text></svg>';
}
function heatSVG(set){
  var W=26,today=new Date();today.setHours(12,0,0,0);
  var start=new Date(today);start.setDate(start.getDate()-((today.getDay()+6)%7)-7*(W-1));
  var out='',total=0;
  for(var i=0;i<W*7;i++){
    var d=new Date(start);d.setDate(start.getDate()+i);
    if(d>today)break;
    var c=set[dayKey(d)]||0,lv=c===0?0:c<3?1:c<6?2:c<10?3:4;total+=c;
    out+='<rect class="h'+lv+'" x="'+(Math.floor(i/7)*14)+'" y="'+((i%7)*14)+'" width="11" height="11" rx="2"><title>'+c+' submissions on '+d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+'</title></rect>';
  }
  return {total:total,svg:'<svg class="heat" viewBox="0 0 '+(W*14-3)+' 95" role="img" aria-label="Submission activity over the last 26 weeks">'+out+'</svg>'};
}
function renderProfile(){
  var e=S.exam,ex=EXAMS[e],a=forExam(e),n=a.length,net=sum(a,function(x){return x.m}),es=estFrom(net,n,ex.pop),list=pool();
  var ok=a.filter(function(x){return x.ok===true}).length,wr=a.filter(function(x){return x.ok===false}).length;
  var acc=ok+wr?Math.round(ok/(ok+wr)*100)+'%':'-',avg=n?(sum(a,function(x){return x.t})/n/1000).toFixed(1)+' s':'-';
  var conf=n<5?'Low':n<20?'Medium':'Good',f=function(dn,dm){return fmtIN(estFrom(net+dm,n+dn,ex.pop).air)};
  var rows=ex.subjects.map(function(s){
    var x=a.filter(function(y){return y.s===s});
    if(!x.length)return '<tr><td>'+s+'</td><td>0</td><td>-</td><td>-</td><td>-</td></tr>';
    var o=x.filter(function(y){return y.ok===true}).length,w=x.filter(function(y){return y.ok===false}).length;
    var nt=sum(x,function(y){return y.m}),pace=sum(x,function(y){return y.t/1000/QBY[y.q].m})/x.length;
    return '<tr><td>'+s+'</td><td>'+x.length+'</td><td>'+(o+w?Math.round(o/(o+w)*100)+'%':'-')+'</td><td class="'+(nt>0?'pos':nt<0?'neg':'')+'">'+(nt>0?'+':'')+nt+'</td><td>'+pace.toFixed(2)+'×</td></tr>';
  }).join('');
  var bars=['E','M','H'].map(function(d){var t=list.filter(function(q){return q.d===d}),s=t.filter(function(q){return stOf(q.id)==='s'}).length;
    return '<div class="r"><span class="d-'+d+'">'+DN[d]+'</span><span class="t"><i style="width:'+(t.length?Math.round(s/t.length*100):0)+'%;background:var(--'+({E:'easy',M:'med',H:'hard'})[d]+')"></i></span><span>'+s+'/'+t.length+'</span></div>'}).join('');
  var st=streaks(),hm=heatSVG(st.set);
  $('#view').innerHTML='<div class="stack"><section class="card airhero"><span class="lab">'+ex.label+' · '+ex.full+'</span>'+
    '<div class="airnum">'+(n?'~'+fmtIN(es.air):'-')+'</div>'+
    '<div>'+(n?'Top '+fmtTop(es.top)+'% of about '+fmtIN(ex.pop)+' candidates (modelled pool)':'Submit your first answer to get an estimate.')+'</div>'+
    '<div class="conf"><span>Confidence: '+conf+' ('+n+' submitted)</span><span class="meter"><i style="width:'+Math.round(Math.min(n/30,1)*100)+'%"></i></span></div></section>'+
    '<div class="two"><section class="card"><h3>Solved</h3><div class="bars">'+bars+'</div><p class="insight">Counted per problem in '+ex.name+'. A problem is solved once you have an Accepted submission.</p></section>'+
    '<section class="card"><h3>Your numbers</h3><div class="stats">'+
      '<div class="stat"><small>Net marks</small><b class="'+(net>0?'pos':net<0?'neg':'')+'">'+(net>0?'+':'')+net+'</b></div>'+
      '<div class="stat"><small>Submitted</small><b>'+n+'</b></div>'+
      '<div class="stat"><small>Accuracy</small><b>'+acc+'</b></div>'+
      '<div class="stat"><small>Avg time</small><b>'+avg+'</b></div></div></section></div>'+
    '<section class="card"><h3>Activity</h3>'+hm.svg+'<div class="hm"><span><b>'+hm.total+'</b> submissions in 26 weeks</span><span>Current streak <b>'+st.cur+'d</b></span><span>Longest <b>'+st.max+'d</b></span></div></section>'+
    '<section class="card"><h3>Badges</h3><div class="badges-grid">'+badgeDefs().map(function(b){
      return '<div class="badge-card'+(b.got?' got':'')+'"><div class="bi">'+b.i+'</div><b>'+b.n+'</b><small>'+b.d+'</small></div>';
    }).join('')+'</div><p class="insight">Earned from your answers. Locked badges show what to aim for next.</p></section>'+
    '<div class="two"><section class="card"><h3>What moves your rank</h3><ul class="whatif">'+
      '<li><span>10 more correct</span><b class="pos">~'+f(10,40)+'</b></li>'+
      '<li><span>10 more wrong</span><b class="neg">~'+f(10,-10)+'</b></li>'+
      '<li><span>10 more skipped</span><b>~'+f(10,0)+'</b></li></ul>'+
      '<p class="insight">Skipping costs no marks but still dilutes your average, so accuracy and attempt rate both count.</p></section>'+
    '<section class="card"><h3>By subject</h3><div class="tblwrap"><table><thead><tr><th>Subject</th><th>Done</th><th>Acc</th><th>Net</th><th>Pace</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="insight">Pace under 1.00× means faster than the typical student who got it right.</p></section></div>'+
    '<section class="card"><h3>Rank journey</h3>'+chartSVG(e)+'</section>'+
    '<div class="actions">'+(S.confirm?'<span>Delete all your '+ex.name+' submissions on this device?</span><button class="btn danger" data-act="reset-yes">Delete</button><button class="btn ghost" data-act="reset-no">Cancel</button>':'<button class="btn ghost" data-act="reset">Reset my progress</button>')+'</div></div>';
}

/* ---------- dashboard ---------- */
function renderDashboard(){
  var ex=EXAMS[S.exam],a=forExam(S.exam),li=levelInfo(),st=streaks();
  var hr=new Date().getHours(),greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  var name=U&&!U.guest?String(U.name).trim().split(/\s+/)[0]:'there';
  var today=dayKey(Date.now()),todayN=a.filter(function(x){return dayKey(x.ts)===today}).length;
  var goal=(U&&U.goal)||10,pct=Math.min(100,Math.round(todayN/goal*100)),circ=2*Math.PI*30;
  var dq=dailyQ(),weak=weakTopics(3),recent=a.slice(-5).reverse();
  var ok=a.filter(function(x){return x.ok===true}).length,wr=a.filter(function(x){return x.ok===false}).length;
  var acc=ok+wr?Math.round(ok/(ok+wr)*100):0;
  var es=estFrom(sum(a,function(x){return x.m}),a.length,ex.pop);
  var target=U&&U.target?'AIR '+fmtIN(+U.target):'Set a target in Profile';
  var left=Math.max(0,goal-todayN);
  var focus=U&&U.focus&&U.focus.length?U.focus.join(' · '):ex.subjects.join(' · ');

  $('#view').innerHTML='<section class="hero">'+
    '<div class="hi">Dashboard · '+esc(ex.full)+'</div>'+
    '<h1>'+greet+', '+esc(name)+'.</h1>'+
    '<p>'+esc(target)+' &nbsp;·&nbsp; '+(left?left+' questions to hit today’s goal':'Daily goal complete — nice work')+'</p>'+
    '<div class="herogrid">'+
      '<div class="hstat"><small>Level</small><b>'+li.lv+'</b><span>'+li.cur+' / '+li.need+' XP</span></div>'+
      '<div class="hstat"><small>Streak</small><b>'+st.cur+'d</b><span>Longest '+st.max+'d</span></div>'+
      '<div class="hstat"><small>Est. rank</small><b>'+(a.length?'~'+fmtIN(es.air):'-')+'</b><span>'+(a.length?'Top '+fmtTop(es.top)+'%':'Answer to begin')+'</span></div>'+
    '</div></section>'+
    '<div class="dgrid"><div class="dstack">'+
      '<section class="card"><h3>Today’s goal</h3><div class="goalrow">'+
        '<svg class="ring" viewBox="0 0 74 74" role="img" aria-label="'+pct+'% of daily goal"><circle class="tr" cx="37" cy="37" r="30"/>'+
        '<circle class="fg" cx="37" cy="37" r="30" stroke-dasharray="'+(circ*pct/100).toFixed(1)+' '+circ.toFixed(1)+'"/><text x="37" y="42">'+pct+'%</text></svg>'+
        '<div class="goalmeta"><b>'+todayN+' / '+goal+' solved today</b><small>'+esc(focus)+'</small>'+
        '<small style="margin-top:6px">Keep a streak going: one answer a day counts.</small></div></div></section>'+
      '<section class="card"><h3>Today’s question</h3><div class="dtask"><div>'+
        '<span class="pill d-'+dq.d+'">'+DN[dq.d]+'</span><div class="nm">'+esc(dq.t)+'</div>'+
        '<p class="hint" style="margin:0">'+esc(dq.tp)+' · '+esc(dq.s)+' · median '+dq.m+' s</p></div>'+
        '<a class="btn" href="#q-'+dq.id+'">'+(stOf(dq.id)==='s'?'Solve again':'Solve now')+' →</a></div></section>'+
      '<section class="card"><h3>Focus next</h3>'+
        (weak.length?weak.map(function(w,i){
          return '<div class="focusitem"><span class="ix">'+(i+1)+'</span><div class="grow"><b>'+esc(w.tp)+'</b>'+
            '<small>'+Math.round(w.acc*100)+'% accuracy · '+w.total+' attempts · '+w.pace.toFixed(2)+'× pace</small></div>'+
            '<a href="#q-'+w.id+'">Review →</a></div>';
        }).join(''):'<p class="empty" style="padding:14px 0">Answer a few questions to get personal recommendations.</p>')+
      '</section>'+
    '</div><div class="dstack">'+
      '<section class="card"><h3>Your numbers</h3><div class="stats">'+
        '<div class="stat"><small>Accuracy</small><b>'+(ok+wr?acc+'%':'-')+'</b></div>'+
        '<div class="stat"><small>Submitted</small><b>'+a.length+'</b></div>'+
        '<div class="stat"><small>Net marks</small><b>'+sum(a,function(x){return x.m})+'</b></div>'+
        '<div class="stat"><small>XP earned</small><b>'+li.xp+'</b></div></div>'+
        '<p class="insight">'+esc(ex.name)+' only. Switch exams in the header to see that journey.</p></section>'+
      '<section class="card"><h3>Recent activity</h3>'+
        (recent.length?'<ul class="minilist">'+recent.map(function(x){
          var q=QBY[x.q]||{},s=x.ok===true?'<span class="pill ok">Correct</span>':x.ok===false?'<span class="pill bad">Wrong</span>':'<span class="pill">Skipped</span>';
          return '<li><span class="ix">'+(x.m>0?'+':x.m<0?'−':'0')+'</span><span class="grow">'+esc(q.t||x.q)+'</span>'+s+'<time>'+(x.t/1000).toFixed(0)+'s</time></li>';
        }).join('')+'</ul>':'<p class="empty" style="padding:14px 0">No submissions yet. Your last five answers will show here.</p>')+
      '</section>'+
      '<section class="card"><h3>Keep going</h3><p class="insight" style="margin:0">Small, steady sessions beat last-night cramming. Your daily goal is '+goal+' questions — about '+(goal*2)+' minutes a day.</p>'+
        '<div class="actions"><a class="btn ghost sm" href="#analytics">See my analytics</a></div></section>'+
    '</div></div>';
  try{Analytics.track('view',{name:'dashboard'})}catch(e){}
}

/* ---------- analytics ---------- */
function exportAttemptsCSV(){
  var rows=[['question','exam','subject','topic','choice','result','time_s','marks','timestamp']];
  forExam(S.exam).forEach(function(x){
    var q=QBY[x.q]||{};
    rows.push([q.t||x.q,x.e,x.s,q.tp||'',x.c<0?'skipped':'ABCD'[x.c],x.ok===true?'correct':x.ok===false?'wrong':'skipped',(x.t/1000).toFixed(1),x.m,new Date(x.ts).toISOString()]);
  });
  var csv=rows.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
  download('air-ladder-attempts-'+S.exam+'.csv',csv,'text/csv;charset=utf-8');
  try{Analytics.track('export',{type:'csv',exam:S.exam})}catch(e){}
  toast('Attempts exported as CSV.');
}
function exportDataJSON(){
  var safe={};if(U)for(var k in U)if(k!=='pw')safe[k]=U[k];
  var payload={exportedAt:new Date().toISOString(),user:safe,attempts:S.att,events:window.Analytics?Analytics.all():[]};
  download('air-ladder-data.json',JSON.stringify(payload,null,2),'application/json');
  try{Analytics.track('export',{type:'json'})}catch(e){}
  toast('Full data exported as JSON.');
}
function renderAnalytics(){
  var a=filteredAtt(),ex=EXAMS[S.exam];
  var ok=a.filter(function(x){return x.ok===true}).length,wr=a.filter(function(x){return x.ok===false}).length;
  var acc=ok+wr?Math.round(ok/(ok+wr)*100):0;
  var avg=a.length?(sum(a,function(x){return x.t})/a.length/1000).toFixed(1)+' s':'-';
  var net=sum(a,function(x){return x.m});
  var days=S.range==='all'?30:+S.range;
  var bar=function(label,val,color){return '<div class="r"><span>'+label+'</span><span class="t"><i style="width:'+val+'%;background:'+color+'"></i></span><span class="v">'+val+'%</span></div>'};
  var subj=ex.subjects.map(function(s){
    var x=a.filter(function(y){return y.s===s}),o=x.filter(function(y){return y.ok===true}).length,w=x.filter(function(y){return y.ok===false}).length;
    return bar(s+(x.length?' <span style="color:var(--ink-2)">('+x.length+')</span>':''),o+w?Math.round(o/(o+w)*100):0,'var(--accent)');
  }).join('');
  var diff=['E','M','H'].map(function(d){
    var x=a.filter(function(y){var q=QBY[y.q];return q&&q.d===d}),o=x.filter(function(y){return y.ok===true}).length,w=x.filter(function(y){return y.ok===false}).length;
    return bar(DN[d]+' <span style="color:var(--ink-2)">('+x.length+')</span>',o+w?Math.round(o/(o+w)*100):0,'var(--'+({E:'easy',M:'med',H:'hard'})[d]+')');
  }).join('');
  var tm={};
  a.forEach(function(x){var q=QBY[x.q];if(!q)return;var k=q.tp;if(!tm[k])tm[k]={tp:k,n:0,o:0,t:0};tm[k].n++;if(x.ok===true)tm[k].o++;tm[k].t+=x.t/1000/q.m});
  var topics=Object.keys(tm).map(function(k){var v=tm[k];v.acc=Math.round(v.o/v.n*100);v.pace=(v.t/v.n).toFixed(2);return v})
    .sort(function(x,y){return x.acc-y.acc||y.n-x.n}).slice(0,8);
  var topicRows=topics.length?topics.map(function(v){
    var cand=pool().filter(function(q){return q.tp===v.tp})[0];
    return '<tr><td>'+(cand?'<a href="#q-'+cand.id+'">'+esc(v.tp)+'</a>':esc(v.tp))+'</td><td class="n">'+v.n+'</td><td class="n">'+v.acc+'%</td><td class="n">'+v.pace+'×</td></tr>';
  }).join(''):'<tr><td colspan="4" style="text-align:center;color:var(--ink-2);padding:20px">No attempts in this period yet.</td></tr>';
  var weak=weakTopics(3);
  var focus=weak.length?weak.map(function(w,i){
    return '<div class="focusitem"><span class="ix">'+(i+1)+'</span><div class="grow"><b>'+esc(w.tp)+'</b><small>'+Math.round(w.acc*100)+'% accuracy · '+w.total+' attempts · '+w.pace.toFixed(2)+'× pace</small></div><a href="#q-'+w.id+'">Practise →</a></div>';
  }).join(''):'<p class="empty" style="padding:14px 0">Nothing flagged yet — answer more questions to unlock recommendations.</p>';
  var ev=window.Analytics?Analytics.all():[];
  var evBy={};ev.forEach(function(e){evBy[e.type]=(evBy[e.type]||0)+1});
  var topEvents=Object.keys(evBy).sort(function(x,y){return evBy[y]-evBy[x]}).slice(0,5)
    .map(function(k){return '<li><span class="grow">'+esc(k)+'</span><b>'+evBy[k]+'</b></li>'}).join('')||'<li><span class="grow">No events yet</span></li>';

  $('#view').innerHTML='<div class="anhead"><div><h2>Analytics</h2><p>'+esc(ex.full)+' · '+esc(S.range==='all'?'all time':'last '+S.range+' days')+' · '+a.length+' attempts</p></div>'+
    '<div class="seg" role="group" aria-label="Time range">'+
      [['7','7d'],['30','30d'],['all','All']].map(function(r){return '<button data-act="range" data-v="'+r[0]+'" aria-pressed="'+(S.range===r[0])+'">'+r[1]+'</button>'}).join('')+
    '</div></div>'+
    '<div class="kpis">'+
      '<div class="kpi"><small>Accuracy</small><b>'+(ok+wr?acc+'%':'-')+'</b><span>'+ok+' correct / '+wr+' wrong</span></div>'+
      '<div class="kpi"><small>Avg time</small><b>'+avg+'</b><span>per attempt</span></div>'+
      '<div class="kpi"><small>Net marks</small><b class="'+(net>0?'pos':net<0?'neg':'')+'">'+(net>0?'+':'')+net+'</b><span>+4 / −1 / 0</span></div>'+
      '<div class="kpi"><small>Est. rank</small><b>'+(a.length?'~'+fmtIN(estFrom(net,a.length,ex.pop).air):'-')+'</b><span>modelled estimate</span></div>'+
    '</div>'+
    '<div class="angrid">'+
      '<section class="card"><h3>Submissions over time</h3>'+trendSVG(days)+'<p class="datnote">Each dot is a day with at least one answer.</p></section>'+
      '<section class="card"><h3>Where you lose marks</h3>'+focus+'<p class="datnote">Ranked by accuracy, then by how often you attempt the topic.</p></section>'+
      '<section class="card"><h3>By subject</h3><div class="barlist">'+subj+'</div></section>'+
      '<section class="card"><h3>By difficulty</h3><div class="barlist">'+diff+'</div></section>'+
      '<section class="card" style="grid-column:1/-1"><h3>Topic breakdown</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Topic</th><th style="text-align:right">Attempts</th><th style="text-align:right">Accuracy</th><th style="text-align:right">Pace</th></tr></thead><tbody>'+topicRows+'</tbody></table></div><p class="datnote">Pace under 1.00× means faster than the typical student who got it right.</p></section>'+
      '<section class="card"><h3>How you use the app</h3><ul class="minilist">'+topEvents+'</ul><p class="datnote">'+ev.length+' local events recorded. Nothing is sent anywhere.</p></section>'+
      '<section class="card"><h3>Your data</h3><p class="insight" style="margin:0 0 4px">Download your attempts and activity to study them in a spreadsheet, or keep a full backup.</p>'+
        '<div class="exportrow"><button class="btn sm" data-act="csv">Download CSV</button><button class="btn ghost sm" data-act="json">Download JSON</button></div>'+
        '<p class="datnote">Stored in this browser only. Clearing site data removes it.</p></section>'+
    '</div>';
  try{Analytics.track('view',{name:'analytics',range:S.range})}catch(e){}
}

/* ---------- contest ---------- */
var FN=['Aarav','Ananya','Arjun','Diya','Ishaan','Kavya','Rohan','Sneha','Vihaan','Meera','Aditya','Riya','Kabir','Tanvi','Harsh','Naina','Yash','Pooja','Dev','Shreya','Aryan','Nidhi','Karan','Isha','Rahul','Simran','Varun','Prisha','Manav','Aisha'];
var LN=['S','V','I','N','R','P','G','M','D','J','K','C','B','T','Y'];
function weekStart(d){var x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function periodFor(kind,k){
  var now=new Date();
  if(kind==='w'){var s=weekStart(now);s.setDate(s.getDate()-7*k);var e=new Date(s);e.setDate(e.getDate()+7);return {s:s,e:e}}
  return {s:new Date(now.getFullYear(),now.getMonth()-k,1),e:new Date(now.getFullYear(),now.getMonth()-k+1,1)};
}
function simCohort(exam,kind,p,f){
  var r=rng(hash(exam+kind+p.s.toISOString().slice(0,10))),base=kind==='w'?70:260,cap=kind==='w'?900:3400,arr=[];
  for(var i=0;i<600;i++){
    var m=Math.min(cap,Math.max(0,Math.round(base*Math.exp(0.9*gauss(r))*f)));
    arr.push({name:FN[Math.floor(r()*FN.length)]+' '+LN[Math.floor(r()*LN.length)]+'.',marks:m,acc:Math.round(55+r()*40),avg:Math.round(20+r()*50)});
  }
  arr.sort(function(a,b){return b.marks-a.marks||(a.name<b.name?-1:1)});
  return arr;
}
function rowHTML(rk,nm,mk,ac,cls){return '<div class="row'+(cls?' '+cls:'')+'"><span class="rk">'+rk+'</span><span class="nmc">'+nm+'</span><span class="mk">'+mk+'</span><span class="ac">'+ac+'</span></div>'}
function renderContest(){
  var kind=S.period,e=S.exam,now=Date.now(),p=periodFor(kind,0);
  var f=Math.max(0.12,(now-p.s.getTime())/(p.e.getTime()-p.s.getTime())),sim=simCohort(e,kind,p,f),top=sim[0];
  var my=forExam(e).filter(function(a){return a.ts>=p.s.getTime()&&a.ts<p.e.getTime()});
  var net=sum(my,function(a){return a.m}),ok=my.filter(function(a){return a.ok===true}).length,wr=my.filter(function(a){return a.ok===false}).length;
  var myAc=(ok+wr?Math.round(ok/(ok+wr)*100)+'%':'-')+(my.length?' · '+Math.round(sum(my,function(a){return a.t})/my.length/1000)+'s':'');
  var left=p.e.getTime()-now,days=Math.floor(left/864e5),hrs=Math.floor(left%864e5/36e5);
  var cn=Math.floor((p.s.getTime()-new Date(2026,0,5).getTime())/604800000)+1;
  var title=kind==='w'?'Weekly Contest '+cn:'Monthly Contest';
  var lab=kind==='w'?(p.s.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' – '+new Date(p.e.getTime()-1).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})):p.s.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  var head=rowHTML('Rank','Student','Marks','Acc · Avg','head'),rows=head,rank=0,i;
  var sRow=function(s,rk){return rowHTML(rk,s.name,s.marks,s.acc+'% · '+s.avg+'s')};
  if(my.length){
    rank=sim.filter(function(s){return s.marks>net}).length+1;
    if(rank<=10){for(i=0;i<10;i++){if(i===rank-1)rows+=rowHTML(rank,'You',net,myAc,'you');rows+=sRow(sim[i],i<rank-1?i+1:i+2)}}
    else{
      for(i=0;i<10;i++)rows+=sRow(sim[i],i+1);
      rows+='<div class="row gap">⋯</div>';
      rows+=sRow(sim[rank-2],rank-1)+rowHTML(rank,'You',net,myAc,'you');
      if(sim[rank-1])rows+=sRow(sim[rank-1],rank+1);
    }
  }else{for(i=0;i<10;i++)rows+=sRow(sim[i],i+1)}
  var span=kind==='w'?'week':'month';
  var status=my.length?'<p class="insight">You are <b>#'+rank+'</b> of 601 active students this '+span+' with <b>'+net+'</b> net marks.</p>':'<p class="insight">Submit an answer this '+span+' to appear on the board.</p>';
  var hist=function(k2,n2){var out='';for(var j=1;j<=n2;j++){var pp=periodFor(k2,j),c=simCohort(e,k2,pp,1)[0];
    var l=k2==='w'?pp.s.toLocaleDateString('en-IN',{day:'numeric',month:'short'}):pp.s.toLocaleDateString('en-IN',{month:'short',year:'numeric'});
    out+='<li><span>'+l+' · '+c.name+'</span><b>'+c.marks+'</b></li>'}return out};
  $('#view').innerHTML='<div class="toolbar"><div class="seg" role="group" aria-label="Period"><button data-act="period" data-v="w" aria-pressed="'+(kind==='w')+'">Weekly</button><button data-act="period" data-v="m" aria-pressed="'+(kind==='m')+'">Monthly</button></div>'+
    '<div class="period"><b>'+title+'</b> · '+lab+' · ends in '+(days?days+'d ':'')+hrs+'h · '+EXAMS[e].name+'</div></div>'+
    '<section class="spot"><div><div class="crown">'+(kind==='w'?'Topper of the week':'Topper of the month')+'</div><div class="nm">'+top.name+'</div></div><div class="sc">'+top.marks+' <small>marks</small></div></section>'+
    '<section class="card lb">'+rows+'</section>'+status+'<p class="hint"><span class="sim">Simulated cohort</span> Names and scores are generated for this prototype.</p>'+
    '<div class="hist2"><section class="card"><h3>Previous weekly toppers</h3><ul class="past">'+hist('w',4)+'</ul></section><section class="card"><h3>Previous monthly toppers</h3><ul class="past">'+hist('m',3)+'</ul></section></div>';
}

/* ---------- routing and events ---------- */
function cur(){return location.hash.slice(1)}
function setTab(h){document.querySelectorAll('.tabs a').forEach(function(a){if(a.dataset.r===h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
function route(){
  var h=cur();clearInterval(tm);
  if(h.indexOf('q-')===0){
    var q=QBY[h.slice(2)];
    if(q&&q.x.indexOf(S.exam)>-1){openQ(q);setTab('problems');renderProblem();window.scrollTo(0,0);return}
    h='problems';
    if(location.hash!=='#problems'){location.hash='problems';return}
  }
  if(['dashboard','problems','analytics','contest','profile'].indexOf(h)<0)h='dashboard';
  setTab(h);
  if(h==='dashboard')renderDashboard();
  else if(h==='problems')renderProblems();
  else if(h==='analytics')renderAnalytics();
  else if(h==='contest')renderContest();
  else renderProfile();
}
window.addEventListener('hashchange',route);
$('#examseg').addEventListener('click',function(ev){
  var b=ev.target.closest('button[data-exam]');if(!b)return;
  S.exam=b.dataset.exam;save('ail.exam',S.exam);S.confirm=false;S.f.subj='';
  if(U&&!U.guest)Auth.update({exam:S.exam});
  try{Analytics.track('exam_switch',{to:S.exam})}catch(e){}
  drawHeader();route();
});
$('#view').addEventListener('click',function(ev){
  var b=ev.target.closest('[data-act]');if(!b)return;
  var act=b.dataset.act;
  if(act==='pick')pick(+b.dataset.i);
  else if(act==='lock')lockAns(false);
  else if(act==='skip')lockAns(true);
  else if(act==='tab'){S.tab=b.dataset.v;drawLeft()}
  else if(act==='random'){var p=pool(),u=p.filter(function(q){return stOf(q.id)!=='s'});u=u.length?u:p;location.hash='q-'+u[Math.floor(Math.random()*u.length)].id}
  else if(act==='period'){S.period=b.dataset.v;renderContest()}
  else if(act==='range'){S.range=b.dataset.v;renderAnalytics()}
  else if(act==='csv')exportAttemptsCSV();
  else if(act==='json')exportDataJSON();
  else if(act==='reset'){S.confirm=true;renderProfile()}
  else if(act==='reset-no'){S.confirm=false;renderProfile()}
  else if(act==='reset-yes'){S.att=S.att.filter(function(a){return a.e!==S.exam});save('ail.att',S.att);S.confirm=false;updateChip();renderProfile()}
});
$('#view').addEventListener('input',function(ev){if(ev.target.id==='fq'){S.f.text=ev.target.value;drawRows()}});
$('#view').addEventListener('change',function(ev){
  var id=ev.target.id;
  if(id==='fd')S.f.diff=ev.target.value;else if(id==='fst')S.f.status=ev.target.value;else if(id==='fsub')S.f.subj=ev.target.value;else return;
  drawRows();
});
document.addEventListener('keydown',function(ev){
  if(cur().indexOf('q-')!==0||ev.metaKey||ev.ctrlKey||ev.altKey||!S.q)return;
  var k=ev.key.toLowerCase(),i=-1;
  if(k.length===1){i='abcd'.indexOf(k);if(i<0)i='1234'.indexOf(k)}
  if(i>-1&&!S.locked){pick(i);return}
  if(ev.key==='Enter'&&ev.target.tagName!=='BUTTON'&&ev.target.tagName!=='A'){
    if(S.locked)location.hash='q-'+nextId();else lockAns(false);
  }
});

window.addEventListener('ail:auth',function(ev){
  U=ev.detail.user||null;
  if(U&&EXAMS[U.exam])S.exam=U.exam;
  drawHeader();route();
});
window.addEventListener('load',function(){typeset($('#view'))});
if(window.Auth)Auth.init();
drawHeader();route();
})();