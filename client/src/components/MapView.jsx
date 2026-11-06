import {useEffect,useRef} from 'react';import L from 'leaflet';import icon from 'leaflet/dist/images/marker-icon.png';import shadow from 'leaflet/dist/images/marker-shadow.png';
import {dir} from '../utils.js';
const pin=L.icon({iconUrl:icon,shadowUrl:shadow,iconAnchor:[12,41],popupAnchor:[1,-34]});
export default function MapView({places}){const ref=useRef();
  useEffect(()=>{const m=L.map(ref.current).setView([7.69,81.71],12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(m);
    places.forEach(p=>L.marker([p.latitude,p.longitude],{icon:pin}).addTo(m).bindPopup(`<b>${p.name}</b><br>${p.category}<br><a target="_blank" href="${dir(p)}">Route from home</a>`));
    return()=>m.remove();},[places]);
  return <div id="map" ref={ref}></div>;}
