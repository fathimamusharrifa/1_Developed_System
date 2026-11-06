import {useState} from 'react';import {slug} from '../utils.js';
// Tries your own photo (public/images/<name>.jpg), then the bundled illustration, then a category colour.
export default function PlaceImage({p,className=''}){const s=slug(p.name),[i,setI]=useState(0);
  const srcs=[`/images/${s}.jpg`,`/images/${s}.svg`,`/images/cat-${slug(p.category)}.svg`];
  return <img className={'pimg '+className} src={srcs[Math.min(i,2)]} alt={p.name} onError={()=>setI(i+1)}/>;}
