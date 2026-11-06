export const HOME='17B, Kulafaur Rashidheen Mosque Lane, Old Road, Kattankudy';
export async function api(url,{method='GET',body}={},token){
  const r=await fetch(url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body&&JSON.stringify(body)});
  const d=await r.json();if(!r.ok)throw new Error(d.error||'Request failed');return d;}
export const mins=s=>{const[h,m]=s.split(':');return +h*60+ +m};
export function status(p){if(!p.open_time||!p.close_time)return['Hours not available','na'];
  const n=new Date(),c=n.getHours()*60+n.getMinutes();return c>=mins(p.open_time)&&c<=mins(p.close_time)?['Open Now','open']:['Closed','closed'];}
const km=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.latitude-a.latitude),dg=r(b.longitude-a.longitude);
  const h=Math.sin(dl/2)**2+Math.cos(r(a.latitude))*Math.cos(r(b.latitude))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h));};
export const travel=(a,b)=>Math.max(1,Math.round(km(a,b)*1.4/30*60)); // straight-line x1.4 at ~30 km/h
export const dir=p=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(HOME)}&destination=${p.latitude},${p.longitude}&travelmode=driving`;
export const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const CAT={'Religious':['#7b2cbf','🕌'],'Cultural / Heritage':['#f77f00','🏛️'],'Natural':['#06a77d','🌊'],'Recreational':['#f72585','🛍️']};
export const HOME_COORD={latitude:7.6823,longitude:81.7276}; // approximate – edit to your exact home coordinates
export const fmt=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
