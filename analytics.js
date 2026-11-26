/* Lightweight local event log. Used by the Analytics view and for CSV/JSON export.
   No data leaves the device in this prototype. */
(function(){
'use strict';
var KEY='ail.events',MAX=5000;
function load(){try{var v=localStorage.getItem(KEY);return v?JSON.parse(v):[]}catch(e){return []}}
var ev=load();
function track(type,data){
  ev.push({ts:Date.now(),type:type,data:data||{}});
  if(ev.length>MAX)ev=ev.slice(-MAX);
  try{localStorage.setItem(KEY,JSON.stringify(ev))}catch(e){}
}
function all(){return ev}
function clear(){ev=[];try{localStorage.removeItem(KEY)}catch(e){}}
window.Analytics={track:track,all:all,clear:clear};
})();
