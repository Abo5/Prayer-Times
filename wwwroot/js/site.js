// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const order = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
let state = { timings:{}, next:null };

/* ---------- dates ---------- */
function initDates(){
  const now = new Date();
  $('gregorianDate').textContent = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  $('islamicDate').textContent   = now.toLocaleDateString('ar-SA-u-ca-islamic',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

/* ---------- geolocation + fetch ---------- */
function locateAndAskServer(){
  if(!navigator.geolocation) return alert('Geolocation not supported');
  navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude:lat, longitude:lon}=pos.coords;
      fetch(`/Prayer/Times?lat=${lat}&lon=${lon}`)
        .then(r=>r.ok?r.json():Promise.reject('HTTP '+r.status))
        .then(applyData)
        .catch(err=>alert(err));
    },
    err=>alert('Location error: '+err.message));
}

/* ---------- UI rendering ---------- */
function applyData(data){
  $('cityName').textContent = data.city;
  state.timings = data.timings;
  renderTimes();
  computeNext();
  tick();             // أول تحديث فوري
}

function renderTimes(){
  const map={Fajr:'timeFajr',Sunrise:'timeSunrise',Dhuhr:'timeDhuhr',Asr:'timeAsr',Maghrib:'timeMaghrib',Isha:'timeIsha'};
  Object.entries(map).forEach(([p,id])=>{
    $(id).textContent = state.timings[p]||'--:--';
  });
  $('currentPrayer').textContent = getCurrentPrayer();
}

function getCurrentPrayer(){
  const now=new Date(), today=now.toISOString().slice(0,10);
  let current=order[order.length-1];
  for(const p of order){
    const d=new Date(`${today}T${state.timings[p]}:00`);
    if(now>=d) current=p;
  }
  return current;
}

function computeNext(){
  const now=new Date(), today=now.toISOString().slice(0,10);
  let next=null;
  for(const p of order){
    const d=new Date(`${today}T${state.timings[p]}:00`);
    if(d>now){ next={name:p,time:d}; break;}
  }
  if(!next){
    const tomorrow=new Date(now.getTime()+864e5);
    next={name:'Fajr',time:new Date(`${tomorrow.toISOString().slice(0,10)}T${state.timings.Fajr}:00`)};
  }
  state.next=next;
  $('nextPrayerLabel').textContent=`Next (${next.name}) in`;
}

/* ---------- countdown ---------- */
function tick(){
  if(!state.next)return;
  const diff=state.next.time - new Date();
  if(diff<=0){computeNext(); return;}
  const h=Math.floor(diff/3600000);
  const m=Math.floor((diff%3600000)/60000);
  const s=Math.floor((diff%60000)/1000);
  $('countdown').textContent=`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

/* ---------- boostrap ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  lucide.createIcons();
  initDates();
  locateAndAskServer();
  setInterval(tick,1000);
});
