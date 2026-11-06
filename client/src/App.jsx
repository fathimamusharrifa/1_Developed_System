import {useState,useEffect} from 'react';import {api,HOME} from './utils.js';
import PlaceList from './components/PlaceList.jsx';import MapView from './components/MapView.jsx';import Planner from './components/Planner.jsx';import Admin from './components/Admin.jsx';import SmartPlanner from './components/SmartPlanner.jsx';import Account from './components/Account.jsx';
const THEMES=[['ocean','#0b7a75'],['sunset','#d6336c'],['forest','#2b8a3e'],['berry','#7048e8']];
export default function App(){
  const[tab,setTab]=useState('places'),[places,setPlaces]=useState([]),[cats,setCats]=useState([]),[items,setItems]=useState([]),[err,setErr]=useState(''),[favs,setFavs]=useState([]);
  const[theme,setTheme]=useState(()=>localStorage.getItem('theme')||'ocean');
  const[user,setUserS]=useState(()=>{try{return JSON.parse(localStorage.getItem('u'))}catch{return null}});
  const setUser=u=>{setUserS(u);u?localStorage.setItem('u',JSON.stringify(u)):localStorage.removeItem('u');if(!u)setFavs([]);};
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('theme',theme);},[theme]);
  const load=()=>Promise.all([api('/api/places'),api('/api/categories')]).then(([p,c])=>{setPlaces(p);setCats(c);setErr('');}).catch(()=>setErr('Could not reach the server. Retrying…'));
  useEffect(()=>{load();const t=setInterval(()=>{if(err)load();},5000);return()=>clearInterval(t);},[err]);
  useEffect(()=>{if(user)api('/api/favourites',{},user.token).then(setFavs).catch(()=>setUser(null));},[user&&user.token]);
  const toggleFav=async p=>{if(!user){setTab('account');return;}await api('/api/favourites/'+p.place_id,{method:'POST'},user.token);setFavs(favs.includes(p.place_id)?favs.filter(x=>x!==p.place_id):[...favs,p.place_id]);};
  const add=p=>{if(!items.find(x=>x.place_id===p.place_id))setItems([...items,p]);setTab('plan');};
  const tabs=[['places','🏝️ Explore'],['favs',`❤️ Favourites (${favs.length})`],['smart','✨ Smart Planner'],['map','📍 Map'],['plan',`🗺️ My Itinerary (${items.length})`],['account',user?`👤 ${user.name}`:'👤 Log in'],['admin','🔐 Admin']];
  const common={places,cats,onAdd:add,user,favs,toggleFav,onChange:load};
  return(<div><header><div className="hero"><span className="eyebrow">KATTANKUDY · BATTICALOA · EASTERN SRI LANKA</span><h1>Discover your perfect day</h1>
    <p>Mosques, museums, forts, lagoons and golden beaches — all within 25 km. Pick your interests and let us plan your day.</p>
    <div className="stats"><div><b>{places.length||10}</b><span>Places</span></div><div><b>{cats.length||4}</b><span>Categories</span></div><div><b>25 km</b><span>Radius</span></div></div></div>
    <nav>{tabs.map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}
      <span className="themes">{THEMES.map(([n,c])=><button key={n} title={n+' theme'} className={'dot'+(theme===n?' sel':'')} style={{background:c}} onClick={()=>setTheme(n)}/>)}</span></nav></header>
  <main>{err&&<p className="err">{err}</p>}
    {tab==='places'&&<><h2 className="sec">Top places to visit</h2><PlaceList {...common}/></>}
    {tab==='favs'&&<><h2 className="sec">❤️ Your favourites</h2>{!user?<p>Please <a href="#" onClick={e=>{e.preventDefault();setTab('account')}}>log in</a> to save favourites.</p>:favs.length?<PlaceList {...common} places={places.filter(p=>favs.includes(p.place_id))}/>:<p>No favourites yet — tap the 🤍 on any place.</p>}</>}
    {tab==='smart'&&<SmartPlanner places={places} cats={cats} setItems={setItems} setTab={setTab}/>}{tab==='map'&&<MapView places={places}/>}
    {tab==='plan'&&<Planner items={items} setItems={setItems} user={user} setTab={setTab}/>}
    {tab==='account'&&<Account user={user} setUser={setUser} places={places} setItems={setItems} setTab={setTab}/>}{tab==='admin'&&<Admin places={places} cats={cats} reload={load}/>}</main>
  <footer><p>Local Tourist Day-Visit Planner · IT2953 · BIT, University of Moratuwa</p><p className="note">Distances, travel times and opening hours are indicative only — please verify before travelling. Reference location: {HOME}.</p></footer></div>);}
