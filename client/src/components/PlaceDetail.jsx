import {useState,useEffect} from 'react';import Badge from './Badge.jsx';import PlaceImage from './PlaceImage.jsx';import Reviews,{Stars} from './Reviews.jsx';import {dir} from '../utils.js';
function Weather({p}){const[w,setW]=useState(null);
  useEffect(()=>{if(!p.is_outdoor)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current_weather=true`)
    .then(r=>r.json()).then(d=>setW(d.current_weather)).catch(()=>setW(null));},[p]);
  return w?<p>🌤 Weather now: {w.temperature}°C, wind {w.windspeed} km/h</p>:null;}
export default function PlaceDetail({p,onClose,onAdd,user,favs,toggleFav,onChange}){return(<div className="card"><button className="alt" onClick={onClose}>← Back</button>
  <PlaceImage p={p} className="hero-img"/><h2>{p.name} <Badge p={p}/> {p.review_count>0&&<span className="mut"><Stars v={p.avg_rating}/> {p.avg_rating}</span>}</h2><p>{p.description}</p>
  <p><b>Category:</b> {p.category} · <b>Distance:</b> {p.distance_km} km · <b>Hours:</b> {p.open_time&&p.close_time?`${p.open_time}–${p.close_time}`:'Not available'} · <b>Fee:</b> {p.entry_fee}</p>
  <p><b>Tips:</b> {p.tips||'—'}</p><Weather p={p}/>
  <p className="mut">🚨 Emergency: Police 119 · Ambulance 1990 · Tourist Police +94 11 242 1052</p>
  <div className="row"><a href={dir(p)} target="_blank" rel="noreferrer"><button>Route from home</button></a><button className="alt" onClick={()=>onAdd(p)}>+ Add to itinerary</button>
    <button className="alt" onClick={()=>toggleFav(p)}>{favs.includes(p.place_id)?'❤️ Saved':'🤍 Save to favourites'}</button></div>
  <Reviews p={p} user={user} onChange={onChange}/></div>);}
