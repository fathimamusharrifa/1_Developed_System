import {useState,useEffect} from 'react';import {api} from '../utils.js';
const blank={category_id:'',name:'',description:'',distance_km:'',open_time:'',close_time:'',entry_fee:'Free',tips:'',latitude:'',longitude:'',is_outdoor:false};
const FIELDS=['name','description','distance_km','open_time','close_time','entry_fee','tips','latitude','longitude'];
function Stats({tok}){const[s,setS]=useState(null);useEffect(()=>{api('/api/admin/stats',{},tok).then(setS).catch(()=>{});},[tok]);if(!s)return null;
  const max=Math.max(1,...s.byCat.map(c=>c.n));
  return(<div className="card" style={{marginBottom:16}}><h3>📊 Dashboard</h3><div className="kpis">{[['Places',s.t.places],['Tourists',s.t.users],['Reviews',s.t.reviews],['Avg rating',s.t.avg_rating||'–'],['Saved trips',s.t.trips]].map(([k,v])=><div className="kpi" key={k}><b>{v}</b><span>{k}</span></div>)}</div>
  <h4>Places per category</h4>{s.byCat.map(c=><div className="bar" key={c.name}><span>{c.name}</span><div><i style={{width:(c.n/max*100)+'%'}}/></div><b>{c.n}</b></div>)}
  <h4>Most favourited</h4>{s.top.map(p=><div className="bar" key={p.name}><span>{p.name}</span><div/><b>❤️ {p.favs} · ⭐ {p.rating||'–'}</b></div>)}</div>);}
export default function Admin({places,cats,reload}){
  const[tok,setTok]=useState(''),[u,setU]=useState(''),[pw,setPw]=useState(''),[err,setErr]=useState(''),[form,setForm]=useState(null);
  const login=async()=>{try{setTok((await api('/api/login',{method:'POST',body:{username:u,password:pw}})).token);setErr('');}catch{setErr('Authentication failed');}};
  if(!tok)return(<div className="card" style={{maxWidth:340}}><h3>Admin login</h3><input placeholder="Username" value={u} onChange={e=>setU(e.target.value)}/>
    <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/><button onClick={login}>Login</button><p className="err">{err}</p></div>);
  const save=async()=>{try{await api(form.place_id?'/api/places/'+form.place_id:'/api/places',{method:form.place_id?'PUT':'POST',body:form},tok);setForm(null);setErr('');reload();}catch(e){setErr(e.message);}};
  const del=async p=>{if(confirm(`Delete "${p.name}" permanently?`)){await api('/api/places/'+p.place_id,{method:'DELETE'},tok);reload();}};
  const set=k=>e=>setForm({...form,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
  if(form)return(<div className="card"><h3>{form.place_id?'Edit':'Add'} place</h3>
    <select value={form.category_id} onChange={set('category_id')}><option value="">Category…</option>{cats.map(c=><option key={c.category_id} value={c.category_id}>{c.name}</option>)}</select>
    {FIELDS.map(k=><input key={k} placeholder={k+(k.includes('time')?' (HH:MM)':'')} value={form[k]??''} onChange={set(k)}/>)}
    <label><input type="checkbox" style={{width:'auto'}} checked={!!form.is_outdoor} onChange={set('is_outdoor')}/> Outdoor attraction</label>
    <p className="err">{err}</p><div className="row"><button onClick={save}>Save</button><button className="alt" onClick={()=>setForm(null)}>Cancel</button></div></div>);
  return(<div><Stats tok={tok}/><div className="card"><button onClick={()=>setForm({...blank})}>+ Add place</button><table><tbody>{places.map(p=><tr key={p.place_id}><td>{p.name}</td><td>{p.category}</td>
    <td><button className="alt" onClick={()=>setForm({...p})}>Edit</button> <button className="red" onClick={()=>del(p)}>Delete</button></td></tr>)}</tbody></table></div></div>);}