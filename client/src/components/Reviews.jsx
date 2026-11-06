import {useState,useEffect} from 'react';import {api} from '../utils.js';
export const Stars=({v})=>{const n=Math.round(v||0);return <span className="stars">{'★'.repeat(n)}{'☆'.repeat(5-n)}</span>;};
export default function Reviews({p,user,onChange}){const[list,setList]=useState([]),[r,setR]=useState(5),[c,setC]=useState(''),[msg,setMsg]=useState('');
  const load=()=>api(`/api/places/${p.place_id}/reviews`).then(setList).catch(()=>{});
  useEffect(()=>{load();},[p.place_id]);
  const send=async()=>{try{await api(`/api/places/${p.place_id}/reviews`,{method:'POST',body:{rating:r,comment:c}},user.token);setC('');setMsg('Thanks for your review!');load();onChange&&onChange();}catch(e){setMsg(e.message);}};
  return(<div className="reviews"><h3>⭐ Reviews ({list.length})</h3>
    {list.map(x=><div className="rv" key={x.review_id}><b>{x.name}</b> <Stars v={x.rating}/><div className="mut">{x.comment}</div></div>)}
    {!list.length&&<p className="mut">No reviews yet — be the first!</p>}
    {user?<div className="rvform"><select value={r} onChange={e=>setR(+e.target.value)}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}</select>
      <input placeholder="Write your review" value={c} onChange={e=>setC(e.target.value)}/><button onClick={send}>Post review</button><p className="mut">{msg}</p></div>
    :<p className="mut">Log in from the Account tab to write a review.</p>}</div>);}
