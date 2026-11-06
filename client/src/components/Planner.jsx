import Badge from './Badge.jsx';import {travel,api} from '../utils.js';
export default function Planner({items,setItems,user,setTab}){
  const mv=(i,d)=>{const a=[...items],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setItems(a);};
  const save=async()=>{if(!user){setTab('account');return;}const t=prompt('Name your trip','My Kattankudy day');if(!t)return;await api('/api/trips',{method:'POST',body:{title:t,place_ids:items.map(p=>p.place_id).join(',')}},user.token);alert('Trip saved to your account!');};
  if(!items.length)return <p>Your itinerary is empty. Add places from the Places tab.</p>;
  const total=items.reduce((t,p,i)=>i?t+travel(items[i-1],p):0,0);
  return(<div className="card"><table><thead><tr><th>#</th><th>Place</th><th>Travel from previous</th><th></th></tr></thead><tbody>
    {items.map((p,i)=><tr key={p.place_id}><td>{i+1}</td><td>{p.name} <Badge p={p}/></td><td>{i?travel(items[i-1],p)+' min':'—'}</td>
      <td><button className="alt" onClick={()=>mv(i,-1)}>↑</button> <button className="alt" onClick={()=>mv(i,1)}>↓</button> <button className="red" onClick={()=>setItems(items.filter(x=>x!==p))}>✕</button></td></tr>)}</tbody></table>
    <p><b>Total estimated travel time:</b> {total} min</p>{items.length>6&&<p className="err">Caution: this may be too many stops for one day.</p>}
    <button className="noprint" onClick={save}>💾 Save trip</button> <button className="alt noprint" onClick={()=>window.print()}>🖨️ Print / Save as PDF</button><p className="mut">Estimates are indicative only (straight-line × 1.4 at ~30 km/h).</p></div>);}
