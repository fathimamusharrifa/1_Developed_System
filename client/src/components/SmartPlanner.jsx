import {useState} from 'react';import {mins,fmt,travel,HOME_COORD,CAT} from '../utils.js';
const VISIT=60; // minutes spent at each place
// Smart Day Planner: nearest-neighbour route from home, only open places, fits the time window.
function plan(places,cats,start,hours){const end=start+hours*60,pool=places.filter(p=>cats.includes(p.category));
  let cur=HOME_COORD,t=start,out=[];const left=[...pool];
  while(left.length){left.sort((a,b)=>travel(cur,a)-travel(cur,b));let pick=-1;
    for(let i=0;i<left.length;i++){const p=left[i],arr=t+travel(cur,p),open=p.open_time?mins(p.open_time):0,close=p.close_time?mins(p.close_time):1440;
      const s=Math.max(arr,open);if(s+VISIT<=Math.min(end,close)){pick=i;break;}}
    if(pick<0)break;const p=left.splice(pick,1)[0],arr=t+travel(cur,p),s=Math.max(arr,p.open_time?mins(p.open_time):0);
    out.push({p,arrive:s,leave:s+VISIT,drive:travel(cur,p)});cur=p;t=s+VISIT;}
  return out;}
export default function SmartPlanner({places,cats,setItems,setTab}){
  const[sel,setSel]=useState(cats.map(c=>c.name)),[start,setStart]=useState('09:00'),[hrs,setHrs]=useState(8),[res,setRes]=useState(null);
  const tog=n=>setSel(sel.includes(n)?sel.filter(x=>x!==n):[...sel,n]);
  const go=()=>setRes(plan(places,sel.length?sel:cats.map(c=>c.name),mins(start),hrs));
  return(<div className="card"><h2>✨ Smart Day Planner</h2><p className="mut">Tell us your interests and time — we build an optimised one-day route from your home, skipping places that will be closed.</p>
    <div className="chips">{cats.map(c=>{const[col,ic]=CAT[c.name]||['#0b7a75','📍'],on=sel.includes(c.name);return <button key={c.category_id} className="chip" style={{background:on?col:'#fff',color:on?'#fff':col,borderColor:col}} onClick={()=>tog(c.name)}>{ic} {c.name}</button>;})}</div>
    <div className="row"><label>Start time <input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Hours available: <b>{hrs}</b> <input type="range" min="2" max="12" value={hrs} onChange={e=>setHrs(+e.target.value)}/></label></div>
    <button onClick={go}>🚀 Generate my day</button>
    {res&&(!res.length?<p className="err">No places fit that time window. Try more hours or an earlier start.</p>:<div className="tl">{res.map((r,i)=><div className="tli" key={r.p.place_id}><div className="tt">{fmt(r.arrive)}–{fmt(r.leave)}</div>
      <div><b>{i+1}. {r.p.name}</b><div className="mut">🚗 {r.drive} min drive · {r.p.category} · {r.p.entry_fee}</div></div></div>)}
      <p><b>Total:</b> {fmt(res[0].arrive)} → {fmt(res[res.length-1].leave)} · {res.length} places</p>
      <div className="row noprint"><button onClick={()=>{setItems(res.map(r=>r.p));setTab('plan')}}>Send to itinerary</button><button className="alt" onClick={()=>window.print()}>🖨️ Print / Save as PDF</button></div></div>)}</div>);}
