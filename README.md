# Local Tourist Day-Visit Planner (Kattankudy) – IT2953 Final Project
Web application: **React.js (Vite) + Node.js/Express REST API + MySQL**. Reference location: 17B, Kulafaur Rashidheen Mosque Lane, Old Road, Kattankudy.

## Requirements
Node.js 18+ (LTS), MySQL 8, VS Code (optional).

## Run (5 steps)
1. Start MySQL, then create the database:  `mysql -u root -p < server/schema.sql`
   (PowerShell: `cmd /c "mysql -u root -p < server\schema.sql"`)
2. Copy `server/.env.example` to `server/.env` and set `DB_PASS` to your MySQL root password.
3. `npm run install:all`
4. `npm run dev`
5. Open http://localhost:5173

Default admin login: **admin / admin123** (created on first start). Tourists can register on the "Log in" tab.
The extra tables (tourist, review, favourite, saved_trip) are created automatically when the server starts.

## Features
Explore/filter/search · Open-Now status · place details with weather & safety info · interactive map & Google Maps routes · Smart Day Planner (timed route that respects opening hours) · itinerary with travel times, save, print/PDF · tourist accounts, favourites, reviews & ratings, saved trips · admin CRUD + statistics dashboard · 4 colour themes.

## Real photos (optional)
See `client/public/images/PHOTOS-README.txt`. Production build: `npm run build` then `npm start` → http://localhost:3000

## API
GET /api/places, /api/places/:id, /api/categories, /api/places/:id/reviews · POST /api/login, /api/register, /api/user/login · POST /api/places/:id/reviews, /api/favourites/:id, /api/trips (tourist JWT) · POST/PUT/DELETE /api/places, GET /api/admin/stats (admin JWT)
