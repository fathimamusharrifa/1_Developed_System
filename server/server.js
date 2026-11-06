require('dotenv').config();
const express=require('express'),mysql=require('mysql2/promise'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),path=require('path');
const app=express();app.use(express.json());app.use(express.static(path.join(__dirname,'../client/dist')));
const SECRET=process.env.JWT_SECRET||'change-me';
const pool=mysql.createPool({host:process.env.DB_HOST||'localhost',user:process.env.DB_USER||'root',password:process.env.DB_PASS||'',database:process.env.DB_NAME||'day_visit_planner'});
const wrap=f=>(q,s)=>f(q,s).catch(e=>{console.error(e);s.status(500).json({error:'Server error'})});
const need=role=>(q,s,n)=>{try{const d=jwt.verify((q.headers.authorization||'').replace('Bearer ',''),SECRET);if(d.role!==role)throw 0;q.uid=d.id;n()}catch{s.status(401).json({error:'Unauthorised'})}};
const admin=need('admin'),user=need('user');
const sign=(id,role,exp)=>jwt.sign({id,role},SECRET,{expiresIn:exp});
const Q=`SELECT p.*,c.name AS category,(SELECT ROUND(AVG(rating),1) FROM review r WHERE r.place_id=p.place_id) avg_rating,(SELECT COUNT(*) FROM review r WHERE r.place_id=p.place_id) review_count FROM place p JOIN category c USING(category_id)`;
app.get('/api/categories',wrap(async(q,s)=>s.json((await pool.query('SELECT * FROM category'))[0])));
app.get('/api/places',wrap(async(q,s)=>s.json((await pool.query(Q+' ORDER BY distance_km'))[0])));
app.get('/api/places/:id',wrap(async(q,s)=>{const[r]=await pool.query(Q+' WHERE p.place_id=?',[q.params.id]);r.length?s.json(r[0]):s.status(404).json({error:'Place no longer available'})}));
// ---- admin auth + CRUD
app.post('/api/login',wrap(async(q,s)=>{const[r]=await pool.query('SELECT * FROM admin_user WHERE username=?',[q.body.username]);
if(!r.length||!await bcrypt.compare(q.body.password||'',r[0].password_hash))return s.status(401).json({error:'Invalid credentials'});s.json({token:sign(r[0].admin_id,'admin','2h')})}));
const F=['category_id','name','description','distance_km','open_time','close_time','entry_fee','tips','latitude','longitude','is_outdoor'];
const valid=b=>b.name&&b.category_id&&b.distance_km!==''&&b.latitude!==''&&b.longitude!==''&&b.distance_km<=25;
app.post('/api/places',admin,wrap(async(q,s)=>{if(!valid(q.body))return s.status(400).json({error:'Missing/invalid fields (distance must be <= 25 km)'});
const[r]=await pool.query(`INSERT INTO place(${F}) VALUES(?)`,[F.map(k=>q.body[k]??null)]);s.json({id:r.insertId})}));
app.put('/api/places/:id',admin,wrap(async(q,s)=>{if(!valid(q.body))return s.status(400).json({error:'Missing/invalid fields'});
await pool.query(`UPDATE place SET ${F.map(k=>k+'=?')} WHERE place_id=?`,[...F.map(k=>q.body[k]??null),q.params.id]);s.json({ok:true})}));
app.delete('/api/places/:id',admin,wrap(async(q,s)=>{await pool.query('DELETE FROM place WHERE place_id=?',[q.params.id]);s.json({ok:true})}));
app.get('/api/admin/stats',admin,wrap(async(q,s)=>{
const[[t]]=await pool.query('SELECT (SELECT COUNT(*) FROM place) places,(SELECT COUNT(*) FROM tourist) users,(SELECT COUNT(*) FROM review) reviews,(SELECT ROUND(AVG(rating),1) FROM review) avg_rating,(SELECT COUNT(*) FROM saved_trip) trips');
const[byCat]=await pool.query('SELECT c.name,COUNT(p.place_id) n FROM category c LEFT JOIN place p USING(category_id) GROUP BY c.category_id,c.name');
const[top]=await pool.query('SELECT p.name,(SELECT COUNT(*) FROM favourite f WHERE f.place_id=p.place_id) favs,(SELECT ROUND(AVG(rating),1) FROM review r WHERE r.place_id=p.place_id) rating FROM place p ORDER BY favs DESC,rating DESC LIMIT 5');
s.json({t,byCat,top})}));
// ---- tourist accounts
app.post('/api/register',wrap(async(q,s)=>{const{name,email,password}=q.body;
if(!name||!/^\S+@\S+\.\S+$/.test(email||'')||(password||'').length<6)return s.status(400).json({error:'Enter a name, valid email and a password of 6+ characters'});
const[e]=await pool.query('SELECT 1 FROM tourist WHERE email=?',[email]);if(e.length)return s.status(400).json({error:'Email already registered'});
const[r]=await pool.query('INSERT INTO tourist(name,email,password_hash) VALUES(?,?,?)',[name,email,await bcrypt.hash(password,10)]);s.json({token:sign(r.insertId,'user','7d'),name})}));
app.post('/api/user/login',wrap(async(q,s)=>{const[r]=await pool.query('SELECT * FROM tourist WHERE email=?',[q.body.email]);
if(!r.length||!await bcrypt.compare(q.body.password||'',r[0].password_hash))return s.status(401).json({error:'Invalid email or password'});s.json({token:sign(r[0].tourist_id,'user','7d'),name:r[0].name})}));
app.get('/api/places/:id/reviews',wrap(async(q,s)=>s.json((await pool.query('SELECT r.*,t.name FROM review r JOIN tourist t USING(tourist_id) WHERE place_id=? ORDER BY created_at DESC',[q.params.id]))[0])));
app.post('/api/places/:id/reviews',user,wrap(async(q,s)=>{const r=+q.body.rating;if(!(r>=1&&r<=5))return s.status(400).json({error:'Rating must be 1-5'});
await pool.query('INSERT INTO review(place_id,tourist_id,rating,comment) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating),comment=VALUES(comment)',[q.params.id,q.uid,r,(q.body.comment||'').slice(0,500)]);s.json({ok:true})}));
app.get('/api/favourites',user,wrap(async(q,s)=>s.json((await pool.query('SELECT place_id FROM favourite WHERE tourist_id=?',[q.uid]))[0].map(x=>x.place_id))));
app.post('/api/favourites/:id',user,wrap(async(q,s)=>{const[r]=await pool.query('DELETE FROM favourite WHERE tourist_id=? AND place_id=?',[q.uid,q.params.id]);
if(!r.affectedRows)await pool.query('INSERT INTO favourite VALUES(?,?)',[q.uid,q.params.id]);s.json({saved:!r.affectedRows})}));
app.get('/api/trips',user,wrap(async(q,s)=>s.json((await pool.query('SELECT * FROM saved_trip WHERE tourist_id=? ORDER BY created_at DESC',[q.uid]))[0])));
app.post('/api/trips',user,wrap(async(q,s)=>{await pool.query('INSERT INTO saved_trip(tourist_id,title,place_ids) VALUES(?,?,?)',[q.uid,(q.body.title||'My trip').slice(0,80),String(q.body.place_ids||'').slice(0,200)]);s.json({ok:true})}));
app.delete('/api/trips/:id',user,wrap(async(q,s)=>{await pool.query('DELETE FROM saved_trip WHERE trip_id=? AND tourist_id=?',[q.params.id,q.uid]);s.json({ok:true})}));
const DDL=[`CREATE TABLE IF NOT EXISTS tourist(tourist_id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(60) NOT NULL,email VARCHAR(100) NOT NULL UNIQUE,password_hash VARCHAR(100) NOT NULL)`,
`CREATE TABLE IF NOT EXISTS review(review_id INT AUTO_INCREMENT PRIMARY KEY,place_id INT NOT NULL,tourist_id INT NOT NULL,rating TINYINT NOT NULL,comment VARCHAR(500),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE(place_id,tourist_id),FOREIGN KEY(place_id) REFERENCES place(place_id) ON DELETE CASCADE,FOREIGN KEY(tourist_id) REFERENCES tourist(tourist_id) ON DELETE CASCADE)`,
`CREATE TABLE IF NOT EXISTS favourite(tourist_id INT,place_id INT,PRIMARY KEY(tourist_id,place_id),FOREIGN KEY(place_id) REFERENCES place(place_id) ON DELETE CASCADE,FOREIGN KEY(tourist_id) REFERENCES tourist(tourist_id) ON DELETE CASCADE)`,
`CREATE TABLE IF NOT EXISTS saved_trip(trip_id INT AUTO_INCREMENT PRIMARY KEY,tourist_id INT NOT NULL,title VARCHAR(80),place_ids VARCHAR(200),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(tourist_id) REFERENCES tourist(tourist_id) ON DELETE CASCADE)`];
(async()=>{for(const d of DDL)await pool.query(d); // new tables are created automatically on start
const[r]=await pool.query('SELECT 1 FROM admin_user LIMIT 1');
if(!r.length){await pool.query('INSERT INTO admin_user(username,password_hash) VALUES(?,?)',['admin',await bcrypt.hash('admin123',10)]);console.log('Default admin created: admin / admin123 (change it!)')}
app.listen(3000,()=>console.log('http://localhost:3000'))})();
