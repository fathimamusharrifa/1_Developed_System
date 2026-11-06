CREATE DATABASE IF NOT EXISTS day_visit_planner;
USE day_visit_planner;
CREATE TABLE IF NOT EXISTS category(category_id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50) NOT NULL UNIQUE,description VARCHAR(200));
CREATE TABLE IF NOT EXISTS admin_user(admin_id INT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(50) NOT NULL UNIQUE,password_hash VARCHAR(100) NOT NULL);
CREATE TABLE IF NOT EXISTS place(place_id INT AUTO_INCREMENT PRIMARY KEY,category_id INT NOT NULL,name VARCHAR(100) NOT NULL,
description TEXT,distance_km DECIMAL(5,1) NOT NULL,open_time CHAR(5),close_time CHAR(5),entry_fee VARCHAR(40) DEFAULT 'Free',
tips VARCHAR(300),latitude DECIMAL(9,6) NOT NULL,longitude DECIMAL(9,6) NOT NULL,is_outdoor BOOLEAN DEFAULT FALSE,
FOREIGN KEY(category_id) REFERENCES category(category_id));
INSERT IGNORE INTO category(name,description) VALUES('Religious','Mosques and churches'),('Cultural / Heritage','Museums, forts, lighthouses'),('Natural','Beaches and lagoons'),('Recreational','Markets and leisure');
INSERT INTO place(category_id,name,description,distance_km,open_time,close_time,entry_fee,tips,latitude,longitude,is_outdoor)
SELECT * FROM (
SELECT 1,'Al-Aqsa Grand Jumma Masjid','Landmark mosque and spiritual centre of Kattankudy.',0.3,'05:00','21:00','Free','Modest dress required; avoid prayer times.',7.6830,81.7290,FALSE UNION ALL
SELECT 2,'Heritage Museum of Kattankudy','Three-storey museum on the Muslim and Arab heritage of the coast.',1.2,'09:00','17:00','Small fee','Closed some public holidays; limited parking.',7.6785,81.7240,FALSE UNION ALL
SELECT 3,'Kattankudy Beach','Quiet coastal stretch, good for sunsets.',2.5,'00:00','23:59','Free','Best at sunset; swim with caution.',7.6850,81.7370,TRUE UNION ALL
SELECT 2,'Batticaloa Dutch Fort','Fort built by the Portuguese in 1628, later Dutch.',4.5,'08:00','18:00','Free','Wear sun protection.',7.7125,81.7000,TRUE UNION ALL
SELECT 2,'Batticaloa Museum','History and heritage of Batticaloa district.',4.3,'09:00','16:30','Small fee','Closed Sundays.',7.7110,81.6990,FALSE UNION ALL
SELECT 4,'Batticaloa Central Market','Busy market for produce, spices and crafts.',4.0,'06:00','18:00','Free','Go early to avoid crowds.',7.7100,81.6930,FALSE UNION ALL
SELECT 2,'Batticaloa Lighthouse','Colonial-era lighthouse with panoramic views.',5.5,'08:00','17:00','Free','Check access hours before travelling.',7.7180,81.7080,TRUE UNION ALL
SELECT 1,'St. Mary''s Cathedral','Gothic-style Catholic cathedral built in 1808.',5.2,'06:00','18:00','Free','Dress modestly.',7.7090,81.6935,FALSE UNION ALL
SELECT 3,'Batticaloa Lagoon & Lady Manning Bridge','Large lagoon known for boating and "singing fish".',5.3,'00:00','23:59','Free','Boat rides best in the morning.',7.7160,81.7010,TRUE UNION ALL
SELECT 3,'Kallady Beach','Scenic beach across Kallady Bridge.',6.5,'00:00','23:59','Free','Parking limited at weekends.',7.7000,81.7150,TRUE
) t WHERE NOT EXISTS (SELECT 1 FROM place);
