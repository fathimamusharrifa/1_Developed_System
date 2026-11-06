import {status} from '../utils.js';
export default function Badge({p}){const[t,c]=status(p);return <span className={'badge '+c}>{t}</span>;}
