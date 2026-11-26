/* Local-first account layer for AIR Ladder.
   NOTE: this is a prototype. Passwords are only hashed with a non-cryptographic
   hash and stored in localStorage. A real product needs a server-side auth
   service (HTTPS, bcrypt/argon2, sessions, rate limits) before collecting
   real student data. */
(function(){
'use strict';
var KEY='ail.user',SESS='ail.session';
function hash(s){var h=2166136261;for(var i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function load(){try{var v=localStorage.getItem(KEY);return v?JSON.parse(v):null}catch(e){return null}}
function save(u){try{localStorage.setItem(KEY,JSON.stringify(u))}catch(e){}}
function session(){try{return localStorage.getItem(SESS)==='1'?load():null}catch(e){return null}}
function signin(){try{localStorage.setItem(SESS,'1')}catch(e){}}
function validEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e||'')}
function initials(n){return String(n||'Guest').trim().split(/\s+/).slice(0,2).map(function(x){return x.charAt(0).toUpperCase()}).join('')||'G'}
var user=session();

function emit(){try{window.dispatchEvent(new CustomEvent('ail:auth',{detail:{user:user}}))}catch(e){}}
function signup(d){
  if(!d.name||d.name.trim().length<2)return {ok:false,error:'Please enter your name (at least 2 characters).'};
  if(!validEmail(d.email))return {ok:false,error:'Please enter a valid email address.'};
  if(!d.pw||d.pw.length<6)return {ok:false,error:'Password must be at least 6 characters.'};
  user={id:'u'+Date.now().toString(36),name:d.name.trim(),email:d.email.trim().toLowerCase(),pw:hash(d.pw),
    exam:d.exam||'jee',grade:d.grade||'12',target:String(d.target||'').trim(),goal:+d.goal||10,
    focus:d.focus||[],created:Date.now(),guest:false};
  save(user);signin();render();emit();return {ok:true,user:user};
}
function login(email,pw){
  var u=load();
  if(!u||u.guest)return {ok:false,error:'No account exists on this device yet. Create one first.'};
  if(u.email!==String(email||'').trim().toLowerCase()||u.pw!==hash(pw||''))return {ok:false,error:'Email or password is incorrect.'};
  user=u;signin();render();emit();return {ok:true,user:user};
}
function guest(){
  user={id:'guest',name:'Guest',email:'',exam:(user&&user.exam)||'jee',grade:'12',target:'',goal:10,focus:[],created:Date.now(),guest:true};
  save(user);signin();render();emit();return user;
}
function logout(){user=null;try{localStorage.removeItem(SESS)}catch(e){}render();emit()}
function update(patch){if(!user)return;for(var k in patch)if(Object.prototype.hasOwnProperty.call(patch,k))user[k]=patch[k];save(user);emit()}

/* ---------- onboarding UI ---------- */
var mode='signup', pickExam='jee', pickGoal=10, pickFocus=[];
var draft={name:'',email:'',pw:'',grade:'12',target:''};
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function segExam(){
  return [['jee','JEE'],['neet','NEET'],['boards','Boards']].map(function(x){
    return '<button type="button" class="achip'+(pickExam===x[0]?' on':'')+'" data-exam="'+x[0]+'">'+x[1]+'</button>';
  }).join('');
}
function segGoal(){
  return [5,10,20,30].map(function(n){
    return '<button type="button" class="achip'+(pickGoal===n?' on':'')+'" data-goal="'+n+'">'+n+'/day</button>';
  }).join('');
}
function focusChips(){
  var subs=['Physics','Chemistry','Maths','Biology'];
  return subs.map(function(s){
    return '<button type="button" class="achip'+(pickFocus.indexOf(s)>-1?' on':'')+'" data-focus="'+s+'">'+s+'</button>';
  }).join('');
}
function formHTML(){
  if(mode==='login'){
    return '<h2>Welcome back.</h2><p class="asub">Pick up right where you left off.</p>'+
      '<label>Email<input id="li-email" type="email" autocomplete="email" placeholder="you@example.com" value="'+esc(draft.email)+'"></label>'+
      '<label>Password<input id="li-pw" type="password" autocomplete="current-password" placeholder="Your password" value="'+esc(draft.pw)+'"></label>'+
      '<p class="aerr" id="aerr" role="alert"></p>'+
      '<button class="btn abtn" type="submit">Log in</button>'+
      '<p class="aswitch">New here? <button type="button" data-mode="signup">Create an account</button></p>';
  }
  return '<h2>Let’s build your rank.</h2><p class="asub">A few details so your plan actually fits you.</p>'+
    '<label>Full name<input id="su-name" type="text" autocomplete="name" placeholder="e.g. Aarav Sharma" value="'+esc(draft.name)+'"></label>'+
    '<label>Email<input id="su-email" type="email" autocomplete="email" placeholder="you@example.com" value="'+esc(draft.email)+'"></label>'+
    '<label>Password<input id="su-pw" type="password" autocomplete="new-password" placeholder="At least 6 characters" value="'+esc(draft.pw)+'"></label>'+
    '<div class="afield"><span>Target exam</span><div class="achips" id="su-exam">'+segExam()+'</div></div>'+
    '<div class="arow"><label>Class<select id="su-grade"><option value="11"'+(draft.grade==='11'?' selected':'')+'>Class 11</option><option value="12"'+(draft.grade==='12'?' selected':'')+'>Class 12</option><option value="drop"'+(draft.grade==='drop'?' selected':'')+'>Dropper / repeat</option></select></label>'+
    '<label>Target rank<input id="su-target" type="text" inputmode="numeric" placeholder="e.g. 1000" value="'+esc(draft.target)+'"></label></div>'+
    '<div class="afield"><span>Daily goal</span><div class="achips" id="su-goal">'+segGoal()+'</div></div>'+
    '<div class="afield"><span>Focus subjects <small>(optional)</small></span><div class="achips" id="su-focus">'+focusChips()+'</div></div>'+
    '<p class="aerr" id="aerr" role="alert"></p>'+
    '<button class="btn abtn" type="submit">Create my account</button>'+
    '<p class="aswitch">Already have an account? <button type="button" data-mode="login">Log in</button></p>';
}
function render(){
  var root=document.getElementById('authroot');if(!root)return;
  if(user){root.innerHTML='';document.body.classList.remove('authopen');return}
  document.body.classList.add('authopen');
  root.innerHTML='<div class="authovl" role="dialog" aria-modal="true" aria-label="Create your account">'+
    '<div class="authcard">'+
      '<section class="authside">'+
        '<div class="brand abrand"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 2v20M19 2v20"/><path d="M5 7h14M5 12h14M5 17h14"/></svg>AIR Ladder</div>'+
        '<div class="acopy"><span class="akicker">YOUR RANK. YOUR ROADMAP.</span>'+
        '<h1>Every answer<br>moves you up.</h1>'+
        '<p>Know exactly where you stand, what to fix next, and how far you’ve come.</p></div>'+
        '<ul class="afeats">'+
          '<li><span class="ai">01</span><div><b>A plan built around you</b><small>Your exam, your target, your pace.</small></div></li>'+
          '<li><span class="ai">02</span><div><b>Find your weak spots</b><small>See the topics quietly costing you marks.</small></div></li>'+
          '<li><span class="ai">03</span><div><b>Proof you showed up</b><small>Streaks, levels and badges that add up.</small></div></li>'+
        '</ul>'+
        '<div class="afoot">Prototype · your data stays on this device</div>'+
      '</section>'+
      '<section class="authform">'+
        '<div class="atabs" role="group" aria-label="Account mode">'+
          '<button type="button" data-mode="signup" aria-pressed="'+(mode==='signup')+'">Sign up</button>'+
          '<button type="button" data-mode="login" aria-pressed="'+(mode==='login')+'">Log in</button>'+
        '</div>'+
        '<form id="authform" novalidate>'+formHTML()+'</form>'+
        '<button type="button" class="aguest" id="aguest">Continue as guest →</button>'+
      '</section>'+
    '</div>'+
  '</div>';
  wire();
}
function wire(){
  var root=document.getElementById('authroot');
  root.querySelectorAll('[data-mode]').forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.mode;render()})});
  root.querySelectorAll('[data-exam]').forEach(function(b){b.addEventListener('click',function(){
    pickExam=b.dataset.exam;root.querySelectorAll('[data-exam]').forEach(function(x){x.classList.toggle('on',x===b)});
  })});
  root.querySelectorAll('[data-goal]').forEach(function(b){b.addEventListener('click',function(){
    pickGoal=+b.dataset.goal;root.querySelectorAll('[data-goal]').forEach(function(x){x.classList.toggle('on',x===b)});
  })});
  root.querySelectorAll('[data-focus]').forEach(function(b){b.addEventListener('click',function(){
    var s=b.dataset.focus,i=pickFocus.indexOf(s);if(i>-1)pickFocus.splice(i,1);else pickFocus.push(s);b.classList.toggle('on',i<0);
  })});
  var g=document.getElementById('aguest');if(g)g.addEventListener('click',function(){guest()});
  var f=document.getElementById('authform');
  if(f)f.addEventListener('input',function(ev){
    var id=ev.target.id;
    if(id==='su-name')draft.name=ev.target.value;
    else if(id==='su-email'||id==='li-email')draft.email=ev.target.value;
    else if(id==='su-pw'||id==='li-pw')draft.pw=ev.target.value;
    else if(id==='su-target')draft.target=ev.target.value;
  });
  if(f)f.addEventListener('change',function(ev){if(ev.target.id==='su-grade')draft.grade=ev.target.value});
  if(f)f.addEventListener('submit',function(ev){
    ev.preventDefault();var r;
    if(mode==='login'){
      r=login(document.getElementById('li-email').value,document.getElementById('li-pw').value);
    }else{
      r=signup({name:document.getElementById('su-name').value,email:document.getElementById('su-email').value,
        pw:document.getElementById('su-pw').value,exam:pickExam,grade:document.getElementById('su-grade').value,
        target:document.getElementById('su-target').value,goal:pickGoal,focus:pickFocus.slice()});
    }
    if(!r.ok){var e=document.getElementById('aerr');if(e)e.textContent=r.error;return}
    draft.pw='';
    try{window.Analytics&&Analytics.track(mode==='login'?'login':'signup',{exam:r.user.exam,goal:r.user.goal})}catch(e){}
  });
}
function init(){render()}
window.Auth={get:function(){return user},signup:signup,login:login,guest:guest,logout:logout,update:update,init:init,render:render,initials:initials};
})();
