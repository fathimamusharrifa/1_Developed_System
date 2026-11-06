import {useState} from 'react';import Badge from './Badge.jsx';import PlaceDetail from './PlaceDetail.jsx';import PlaceImage from './PlaceImage.jsx';import {Stars} from './Reviews.jsx';import {CAT} from '../utils.js';
export default function PlaceList({places,cats,onAdd,user,favs,toggleFav,onChange}){const[f,setF]=useState([]),[sel,setSel]=useState(null),[q,setQ]=useState('');
  const shown=places.filter(p=>(!f.length||f.includes(p.category))&&p.name.toLowerCase().includes(q.toLowerCase()));
  if(sel)return <PlaceDetail p={places.find(x=>x.place_id===sel.place_id)||sel} onClose={()=>setSel(null)} onAdd={onAdd} user={user} favs={favs} toggleFav={toggleFav} onChange={onChange}/>;
  const toggle=n=>setF(f.includes(n)?f.filter(x=>x!==n):[...f,n]);
  return(<div><div className="chips">{cats.map(c=>{const[col,ic]=CAT[c.name]||['#1f6f5c','📍'];const on=f.includes(c.name);
    return <button key={c.category_id} className="chip" style={{background:on?col:'#fff',color:on?'#fff':col,borderColor:col}} onClick={()=>toggle(c.name)}>{ic} {c.name}</button>;})}
    <input className="search" placeholder="🔎 Search places…" value={q} onChange={e=>setQ(e.target.value)}/></div>
  {!shown.length?<p>No places match your search or filter.</p>:<div className="grid">{shown.map(p=>{const col=(CAT[p.category]||['#1f6f5c'])[0];return(<div className="pcard" key={p.place_id}>
    <div className="imgwrap"><PlaceImage p={p}/><span className="tag" style={{background:col}}>{(CAT[p.category]||['','📍'])[1]} {p.category}</span><span className="dist">📍 {p.distance_km} km</span>
      <button className="heart" onClick={()=>toggleFav(p)}>{favs.includes(p.place_id)?'❤️':'🤍'}</button></div>
    <div className="pbody"><h3>{p.name}</h3>{p.review_count>0&&<div><Stars v={p.avg_rating}/> <span className="mut">{p.avg_rating} ({p.review_count})</span></div>}<p className="mut">{p.description}</p><Badge p={p}/>
    <div className="row" style={{marginTop:12}}><button onClick={()=>setSel(p)}>Details</button><button className="alt" onClick={()=>onAdd(p)}>+ Itinerary</button></div></div></div>);})}</div>}</div>);}
