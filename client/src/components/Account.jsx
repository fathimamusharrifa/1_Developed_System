import {useState,useEffect} from 'react';import {api} from '../utils.js';
export default function Account({user,setUser,places,setItems,setTab}){
  const[mode,setMode]=useState('login'),[f,setF]=useState({name:'',email:'',password:''}),[err,setErr]=useState(''),[trips,setTrips]=useState([]);
  const loadTrips=()=>user&&api('/api/trips',{},user.token).then(setTrips).catch(()=>{});
  useEffect(()=>{loadTrips();},[user]);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const submit=async()=>{try{const d=await api(mode==='login'?'/api/user/login':'/api/register',{method:'POST',body:f});setUser({token:d.token,name:d.name});setErr('');}catch(e){setErr(e.message);}};
  if(!user)return(<div className="card" style={{maxWidth:380}}><h2>{mode==='login'?'👋 Welcome back':'🎉 Create your account'}</h2>
    {mode==='register'&&<input placeholder="Your name" value={f.name} onChange={set('name')}/>}
    <input placeholder="Email" value={f.email} onChange={set('email')}/><input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')}/>
    <button onClick={submit}>{mode==='login'?'Log in':'Sign up'}</button><p className="err">{err}</p>
    <p className="mut">{mode==='login'?'New here?':'Already registered?'} <a href="#" onClick={e=>{e.preventDefault();setMode(mode==='login'?'register':'login');setErr('');}}>{mode==='login'?'Create an account':'Log in'}</a></p>
    <p className="mut">An account lets you save favourites, write reviews and keep your trips.</p></div>);
  const open=t=>{setItems(t.place_ids.split(',').map(Number).map(id=>places.find(p=>p.place_id===id)).filter(Boolean));setTab('plan');};
  const del=async t=>{await api('/api/trips/'+t.trip_id,{method:'DELETE'},user.token);loadTrips();};
  return(<div className="card"><div className="row" style={{justifyContent:'space-between'}}><h2>👤 Hello, {user.name}</h2><button className="alt" onClick={()=>setUser(null)}>Log out</button></div>
    <h3>💼 My saved trips</h3>{!trips.length&&<p className="mut">No saved trips yet. Build an itinerary and press “Save trip”.</p>}
    {trips.map(t=><div className="tli" key={t.trip_id}><div style={{flex:1}}><b>{t.title}</b><div className="mut">{t.place_ids.split(',').length} places · {new Date(t.created_at).toLocaleDateString()}</div></div>
      <button onClick={()=>open(t)}>Open</button><button className="red" onClick={()=>del(t)}>Delete</button></div>)}</div>);}
