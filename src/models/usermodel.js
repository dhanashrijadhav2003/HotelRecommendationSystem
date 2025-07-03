let db=require("../config/db.js");

let type="user";
exports.saveRegData = (...regData) => {
  return new Promise((resolve, reject) => {
    db.query(
      "insert into usermaster (username, useremail, password, contact, type) values (?, ?, ?, ?, ?)",
      [regData[0], regData[1], regData[2], regData[3], regData[4]],
      (err, result) => {
        if (err) {
          console.error("DB error:", err);
          reject(err);
        } else {
          resolve("success.");
        }
      }
    );
  });
};

exports.getPasswordFromDB=(username)=>{
    return new Promise((resolve, reject) => {
        db.query("select userid,password,username,type from usermaster where username=?",
            [username],(err,result)=>{
                    if(err){
                        reject(err);
                    }
                    else if(result.length===0){
                        resolve(null);
                    }
                    else {
                        let user=result[0];
                        resolve(user);
                    }
            });
  });
}

exports.saveCity=(...citydata)=>{
  return new Promise((resolve,reject)=>{
    db.query(
      "insert into citymaster(city_name,pincode) values(?,?)",
      [citydata[0],citydata[1]],
      (err)=>{
        if(err){
          console.error("Error:",err);
          reject(err);
        }
        else{
          resolve("City added successfully...");
        }
      }
    );
  });
};

exports.saveHotelData = (
  hotel_name,hotel_address,city_id,area_id,hotel_email,hotel_contact,filename,amenity_ids) => {
  return new Promise((resolve, reject) => {
    // Validate city
    db.query("SELECT city_name FROM citymaster WHERE city_id = ?", [city_id], (err, result) => {
      if (err) return reject("Failed to fetch city");
      if (result.length === 0) return reject("Invalid city ID");

      // Validate area
      db.query("SELECT area_name FROM areamaster WHERE area_id = ?", [area_id], (err, areaResult) => {
        if (err) return reject("Failed to fetch area");
        if (areaResult.length === 0) return reject("Invalid area ID");

        // Insert into hotelmaster
        db.query(
          "INSERT INTO hotelmaster (hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact) VALUES (?, ?, ?, ?, ?, ?)",
          [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact],
          (err, insertResult) => {
            if (err) {
              console.error("Hotel insert error:", err.sqlMessage || err);
              return reject("Insert hotel failed");
            }

            const hotel_id = insertResult.insertId; 

            // Insert image
            db.query(
              "INSERT INTO hotelpicjoin (hotel_id, filename) VALUES (?, ?)",
              [hotel_id, filename],
              (err) => {
                if (err) return reject("File not uploaded, hotel not added");

                // Insert amenities (loop)
                const insertAmenityPromises = amenity_ids.map((amenityId) => {
                  return new Promise((res, rej) => {
                    db.query(
                      "INSERT INTO hotelamenitiesjoin (hotel_id, amenity_id) VALUES (?, ?)",
                      [hotel_id, amenityId],
                      (err) => {
                        if (err) return rej(err); // Use rej, not reject from outer scope
                        res();
                      }
                    );
                  });
                });

                Promise.all(insertAmenityPromises)
                  .then(() => resolve("Hotel and amenities added successfully"))
                  .catch((err) => {
                    console.error("Amenities insert error:", err);
                    reject("Some amenities could not be inserted");
                  });
              }
            );
          }
        );
      });
    });
  });
};



exports.saveArea = (area_name,city_id) => {
  console.log(area_name);
  return new Promise((resolve, reject) => {
    db.query(
      "insert into  areamaster (area_name) VALUES (?)",
      [area_name],
      (err, result) => {
        if (err) {
          console.error("DB error:", err);
          reject(err);
        } else {
          db.query("select area_id from areamaster where area_name=? order by area_id desc limit 1",[area_name],(err,result2)=>{
                if(err){
                  reject("area not added");
                }
                else{
                 db.query("insert into cityareajoin values (?,?)",[city_id,result2[0].area_id],(err,result3)=>{
                    if(err){
                      reject("Area adddition failed..")
                    }
                    else{
                       resolve("Area added successfully...");
                    }
                 });
                }
          });
        }
      }
    );
  });
};


exports.saveAminity=(amenity_name) => {
  console.log(amenity_name);
  return new Promise((resolve, reject) => {
    db.query(
      "insert into  amenities (amenity_name) VALUES (?)",
      [amenity_name],
      (err, result) => {
        if (err) {
          console.error("DB error:", err);
          reject(err);
        } else {
          resolve("Aminity added successfully...");
        }
      }
    );
  });
};


exports.fetchAllHotelsWithCityAndArea = () => {
  return new Promise((resolve, reject) => {
    const query = `
       SELECT  h.hotel_id,h.hotel_name, h.hotel_address,c.city_name,a.area_name,h.hotel_email,h.hotel_contact,
    GROUP_CONCAT(DISTINCT am.amenity_name ORDER BY am.amenity_name SEPARATOR ', ') AS amenity_names,
    hp.filename
FROM hotelmaster h
LEFT JOIN citymaster c ON h.city_id = c.city_id
LEFT JOIN areamaster a ON h.area_id = a.area_id
LEFT JOIN hotelamenitiesjoin ha ON h.hotel_id = ha.hotel_id
LEFT JOIN amenities am ON ha.amenity_id = am.amenity_id
LEFT JOIN hotelpicjoin hp ON h.hotel_id = hp.hotel_id
GROUP BY 
    h.hotel_id, h.hotel_name, h.hotel_address, c.city_name, a.area_name,
    h.hotel_email, h.hotel_contact, h.rating, hp.filename;

    `;

    db.query(query, (err, result) => {
      if (err) {
        console.error("DB error:", err);
        reject(err);
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
};

exports.fetchAllCities=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select * from citymaster",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
};

exports.fetchAllAreaWithCity=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select a.area_id,a.area_name,c.city_name,c.pincode from areamaster a inner join cityareajoin ca on ca.area_id=a.area_id inner join citymaster c on ca.city_id=c.city_id",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  });
};

exports.fetchAllArea=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select * from areamaster",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  });
};



exports.fetchAllAmenities=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select * from amenities",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  });
};

exports.fetchAllCustomer=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select u.userid,u.username,u.useremail,u.contact from usermaster u where u.type=?",["user"],(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
};

exports.deleteHotelFromDB = (hotel_id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM hotelmaster WHERE hotel_id = ?", [hotel_id], (err, result) => {
      if (err) {
        console.error("DB error during delete:", err);
        return reject("Delete failed");
      }

      if (result.affectedRows === 0) {
        return reject(`No hotel found with this id: ${hotel_id}`);
      }

      console.log("Hotel deleted successfully...");

      // Optional: fetch updated hotel list (for debugging or logging)
      db.query(`
        SELECT  h.hotel_id,h.hotel_name, h.hotel_address,c.city_name,a.area_name,h.hotel_email,h.hotel_contact,
    GROUP_CONCAT(DISTINCT am.amenity_name ORDER BY am.amenity_name SEPARATOR ', ') AS amenity_names,
    hp.filename
FROM hotelmaster h
LEFT JOIN citymaster c ON h.city_id = c.city_id
LEFT JOIN areamaster a ON h.area_id = a.area_id
LEFT JOIN hotelamenitiesjoin ha ON h.hotel_id = ha.hotel_id
LEFT JOIN amenities am ON ha.amenity_id = am.amenity_id
LEFT JOIN hotelpicjoin hp ON h.hotel_id = hp.hotel_id
GROUP BY 
    h.hotel_id, h.hotel_name, h.hotel_address, c.city_name, a.area_name,
    h.hotel_email, h.hotel_contact, h.rating, hp.filename;

      `, (err1, result1) => {
        if (err1) {
          console.error("DB error while fetching updated hotel list:", err1);
          return resolve("Hotel deleted, but failed to fetch updated hotel list.");
        }

        console.table(result1); // Logs to your Node.js console
        return resolve("Hotel deleted successfully and hotel list updated in console.");
      });
    });
  });
};


exports.deleteCity=(city_id)=>{
  return new Promise((resolve,reject)=>{
    console.log(city_id);
      db.query("delete from citymaster where city_id=?",[city_id],(err,result)=>{
        if(err){
          console.log("Error during deleting city",err);
          return reject("delete failed");
        }
        if(result.affectedRows === 0){
          return reject(`No city found with id: ${city_id}`);
        }
        console.log("City deleted successfully");
        db.query("select * from citymaster",(err1,result1)=>{
            if(err1){
              console.error("DB error while fetching updated city list:", err1);
              return resolve("City deleted, but failed to fetch updated city list.");
             }
             console.table(result1); // Logs to your Node.js console
        return resolve("city deleted successfully and city list updated in console.");
        });
      });
  });
};

exports.deleteAreaLogic = (area_id) => {
  return new Promise((resolve, reject) => {
    console.log("Area ID:", area_id); 

    db.query("DELETE FROM areamaster WHERE area_id = ?", [area_id], (err, result) => {
      if (err) {
        console.log("Error during deleting area:", err);
        return reject("Delete failed");
      }

      if (result.affectedRows === 0) {
        return reject(`No area found with id: ${area_id}`);
      }

      console.log("Area deleted successfully");
      return resolve("Area deleted successfully");
    });
  });
};



exports.deleteAmenityLogic = (amenity_id) => {
  return new Promise((resolve, reject) => {
    console.log("Amenity ID:", amenity_id); 

    db.query("DELETE FROM  amenities WHERE amenity_id = ?", [amenity_id], (err, result) => {
      if (err) {
        console.log("Error during deleting amenity:", err);
        return reject("Delete failed");
      }

      if (result.affectedRows === 0) {
        return reject(`No amenity found with id: ${amenity_id}`);
      }

      console.log("Amenity deleted successfully");
      return resolve("Amenity deleted successfully");
    });
  });
};



exports.getHotelById = (hotel_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT h.hotel_id, h.hotel_name, h.hotel_address,
              c.city_name, a.area_name,
              h.hotel_email, h.hotel_contact,
              GROUP_CONCAT(DISTINCT am.amenity_name ORDER BY am.amenity_name SEPARATOR ', ') AS amenity_names,
              hp.filename 
       FROM hotelmaster h
       LEFT JOIN citymaster c ON h.city_id = c.city_id
       LEFT JOIN areamaster a ON h.area_id = a.area_id
       LEFT JOIN hotelamenitiesjoin ha ON h.hotel_id = ha.hotel_id
       LEFT JOIN amenities am ON ha.amenity_id = am.amenity_id
       LEFT JOIN hotelpicjoin hp ON h.hotel_id = hp.hotel_id
       WHERE h.hotel_id = ?
       GROUP BY h.hotel_id, h.hotel_name, h.hotel_address,
                c.city_name, a.area_name,
                h.hotel_email, h.hotel_contact,hp.filename`,
      [hotel_id],
      (err, result) => {
        if (err) {
          console.error("SQL error while fetching hotel:", err);
          return reject(err);
        }

        if (result.length === 0) {
          console.warn("Hotel not found for ID:", hotel_id);
          return resolve(null); // or reject("Hotel not found");
        }
        console.log(result);
        resolve(result[0]);
      }
    );
  });
};


exports. getAreaByIdLogic= (city_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "  select a.area_id,a.area_name from areamaster a inner join cityareajoin c on a.area_id=c.area_id where c.city_id=?",
      [city_id],
      (err, result) => {
        if (err) return reject(err);
        if (result.length === 0) return reject("No city found");
        resolve(result);
      }
    );
  });
};




exports.updateHotelInDB = (hotel_id, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE hotelmaster SET 
        hotel_name = ?, hotel_address = ?, hotel_email = ?, 
        hotel_contact = ?, rating = ?, city_id = ?, area_id = ?
      WHERE hotel_id = ?
    `;
    const params = [data.hotel_name,data.hotel_address,data.hotel_email,data.hotel_contact,
      data.rating,data.city_id,data.area_id,hotel_id];
      db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.getCityById = (city_id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM citymaster WHERE city_id = ?", [city_id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.updateCity = (city_id, city_name, pincode) => {
  return new Promise((resolve, reject) => {
    // First, update the city
    db.query(
      "UPDATE citymaster SET city_name = ?, pincode = ? WHERE city_id = ?",
      [city_name, pincode, city_id],
      (err, result) => {
        if (err) return reject(err);

        // Now, fetch the updated city data
        db.query(
          "SELECT * FROM citymaster WHERE city_id = ?",
          [city_id],
          (err2, result2) => {
            if (err2) return reject(err2);
            resolve(result2[0]); // Return the updated city record
          }
        );
      }
    );
  });
};


exports.getAmenityById = (amenity_id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM amenities WHERE amenity_id = ?", [amenity_id], (err, result) => {
      if (err) return reject(err);
      resolve(result[0]); // return single amenity record
    });
  });
};

exports.updateAmenity = (amenity_id, amenity_name) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE amenities SET amenity_name = ? WHERE amenity_id = ?",
      [amenity_name, amenity_id],
      (err, result) => {
        if (err) return reject(err);

        // Fetch updated amenity
        db.query(
          "SELECT * FROM amenities WHERE amenity_id = ?",
          [amenity_id],
          (err2, result2) => {
            if (err2) return reject(err2);
            resolve(result2[0]);
          }
        );
      }
    );
  });
};



exports.getAreaById = (area_id) => {
  return new Promise((resolve, reject) => {
    db.query("select a.area_id,a.area_name,c.city_id from areamaster a left join cityareajoin c on a.area_id=c.area_id  WHERE a.area_id = ?", [area_id], (err, result) => {
      if (err) return reject(err);
      resolve(result[0]);
    });
  });
};

exports.updateArea = (area_id, area_name, city_id) => {
  return new Promise((resolve, reject) => {
    // Step 1: Update area name
    db.query("UPDATE areamaster SET area_name = ? WHERE area_id = ?", [area_name, area_id], (err, result) => {
      if (err) return reject(err);

      // Step 2: Update city-area join
      db.query("UPDATE cityareajoin SET city_id = ? WHERE area_id = ?", [city_id, area_id], (err2) => {
        if (err2) return reject(err2);

        // Step 3: Fetch updated area record (including city)
        const query = `
          SELECT a.area_id, a.area_name, c.city_id, c.city_name
          FROM areamaster a
          JOIN cityareajoin ca ON a.area_id = ca.area_id
          JOIN citymaster c ON ca.city_id = c.city_id
          WHERE a.area_id = ?
        `;
        db.query(query, [area_id], (err3, result3) => {
          if (err3) return reject(err3);
          resolve(result3[0]); // return the updated area record with city
        });
      });
    });
  });
};


exports.updateHotelData = (
  hotel_id, hotel_name, hotel_address, city_id, area_id,
  hotel_email, hotel_contact, filename, amenity_ids
) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM citymaster WHERE city_id = ?", [city_id], (err, cityResult) => {
      if (err) return reject("Failed to fetch city");
      if (cityResult.length === 0) return reject("Invalid city ID");

      db.query("SELECT * FROM areamaster WHERE area_id = ?", [area_id], (err, areaResult) => {
        if (err) return reject("Failed to fetch area");
        if (areaResult.length === 0) return reject("Invalid area ID");

        db.query(
          "UPDATE hotelmaster SET hotel_name = ?, hotel_address = ?, city_id = ?, area_id = ?, hotel_email = ?, hotel_contact = ? WHERE hotel_id = ?",
          [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, hotel_id],
          (err) => {
            if (err) return reject("Failed to update hotel");

            const imageUpdate = filename
              ? new Promise((res, rej) => {
                  db.query("UPDATE hotelpicjoin SET filename = ? WHERE hotel_id = ?", [filename, hotel_id], (err) => {
                    if (err) return rej("Failed to update hotel image");
                    res();
                  });
                })
              : Promise.resolve();

            const amenityUpdate = new Promise((res, rej) => {
              db.query("DELETE FROM hotelamenitiesjoin WHERE hotel_id = ?", [hotel_id], (err) => {
                if (err) return rej("Failed to clear old amenities");

                const promises = amenity_ids.map((aid) => {
                  return new Promise((r, rj) => {
                    db.query(
                      "INSERT INTO hotelamenitiesjoin (hotel_id, amenity_id) VALUES (?, ?)",
                      [hotel_id, aid],
                      (err) => {
                        if (err) return rj(err);
                        r();
                      }
                    );
                  });
                });

                Promise.all(promises)
                  .then(() => res())
                  .catch(() => rej("❌ Some amenities failed to update"));
              });
            });

            Promise.all([imageUpdate, amenityUpdate])
              .then(() => {
                const query = `
                  SELECT h.hotel_id, h.hotel_name, h.hotel_address, h.hotel_email, h.hotel_contact,
                         c.city_name, a.area_name, MAX(p.filename) AS filename,
                         GROUP_CONCAT(am.amenity_name) AS amenities
                  FROM hotelmaster h
                  JOIN citymaster c ON h.city_id = c.city_id
                  JOIN areamaster a ON h.area_id = a.area_id
                  LEFT JOIN hotelpicjoin p ON h.hotel_id = p.hotel_id
                  LEFT JOIN hotelamenitiesjoin ha ON h.hotel_id = ha.hotel_id
                  LEFT JOIN amenities am ON ha.amenity_id = am.amenity_id
                  WHERE h.hotel_id = ?
                  GROUP BY h.hotel_id;
                `;

                db.query(query, [hotel_id], (err, result) => {
                  if (err) return reject("Failed to fetch updated hotel");
                  resolve(result[0]);
                });
              })
              .catch(reject);
          }
        );
      });
    });
  });
};


exports.fetchAllRoom=()=>{
  return new Promise((resolve,reject)=>{
    db.query("select * from roomsmaster",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
};


exports.getPriceRoomHotel=()=>{
  return new Promise((resolve,reject)=>{
    db.query(" select h.hotel_name,r.room_type,hr.price from hotelmaster h inner join hotelroomjoin hr on h.hotel_id=hr.hotel_id inner join roomsmaster r on hr.room_id=r.room_id",(err,result)=>{
      if(err){
        console.log("Error:",err);
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  });
};


exports.insertRoomPrice = (hotel_id, room_id, price) => {
  return new Promise((resolve, reject) => {
    // Validate that hotel_id exists
    db.query("SELECT * FROM hotelmaster WHERE hotel_id = ?", [hotel_id], (err, hotelResult) => {
      if (err) {
        console.error("DB error checking hotel:", err);
        return reject("Database error checking hotel.");
      }

      if (hotelResult.length === 0) {
        return reject("Hotel ID not found.");
      }

      // Validate that room_id exists
      db.query("SELECT * FROM roomsmaster WHERE room_id = ?", [room_id], (err, roomResult) => {
        if (err) {
          console.error("DB error checking room:", err);
          return reject("Database error checking room.");
        }

        if (roomResult.length === 0) {
          return reject("Room ID not found.");
        }

        // Check if combination already exists
        db.query(
          "SELECT * FROM hotelroomjoin WHERE hotel_id = ? AND room_id = ?",
          [hotel_id, room_id],
          (err, existingResult) => {
            if (err) {
              return reject("Error checking existing room price.");
            }

            if (existingResult.length > 0) {
              return reject("This hotel-room combination already has a price.");
            }

            // Finally insert
            db.query(
              "INSERT INTO hotelroomjoin (hotel_id, room_id, price) VALUES (?, ?, ?)",
              [hotel_id, room_id, price],
              (err, insertResult) => {
                if (err) {
                  console.error("Insert error:", err);
                  return reject("Failed to insert room price.");
                }

                resolve("Room price added successfully.");
              }
            );
          }
        );
      });
    });
  });
};


//search
/*exports.getHotelsByCity = (city) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT hm.*, cm.city_name, am.area_name
       FROM hotelmaster hm
       JOIN citymaster cm ON hm.city_id = cm.city_id
       JOIN areamaster am ON hm.area_id = am.area_id
       WHERE cm.city_name LIKE ?`,
      [`%${city}%`],
      (err, results) => {
        if (err) {
          console.error("DB error:", err);
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
};*/




/*exports.getHotelsByCityAndArea = (city, area) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT hm.*, cm.city_name, am.area_name
      FROM hotelmaster hm
      JOIN citymaster cm ON hm.city_id = cm.city_id
      JOIN areamaster am ON hm.area_id = am.area_id
      WHERE 1=1
    `;

    const params = [];

    if (city) {
      query += ` AND cm.city_name LIKE ?`;
      params.push(`%${city}%`);
    }

    if (area) {
      query += ` AND am.area_name LIKE ?`;
      params.push(`%${area}%`);
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return reject(err);
      }
      resolve(results);
    });
  });
};*/

exports.getAllHotels = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT hm.*, cm.city_name, am.area_name, hp.filename
      FROM hotelmaster hm
      JOIN citymaster cm ON hm.city_id = cm.city_id
      JOIN areamaster am ON hm.area_id = am.area_id
      LEFT JOIN hotelpicjoin hp ON hm.hotel_id = hp.hotel_id
    `;
    db.query(query, [], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


exports.getAllHotelsWithImages = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        hm.hotel_id,
        hm.hotel_name,
        hm.hotel_address,
        hm.hotel_email,
        hm.hotel_contact,
        cm.city_name,
        am.area_name,
        hpj.filename
      FROM hotelmaster hm
      JOIN citymaster cm ON hm.city_id = cm.city_id
      JOIN areamaster am ON hm.area_id = am.area_id
      LEFT JOIN hotelpicjoin hpj ON hm.hotel_id = hpj.hotel_id
    `;
    db.query(query, [], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getRoomHotelById = (hotel_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT h.hotel_name, r.room_type, hr.price 
      FROM hotelmaster h 
      INNER JOIN hotelroomjoin hr ON h.hotel_id = hr.hotel_id 
      INNER JOIN roomsmaster r ON r.room_id = hr.room_id 
      WHERE h.hotel_id = ?`;

    db.query(sql, [hotel_id], (err, result) => {
      if (err) {
        console.log("Error:", err);
        return reject(err);
      }
      if (result.length === 0) {
        console.log("Hotel not found for id:", hotel_id);
        return resolve([]);
      }
      resolve(result); 
    });
  });
};



exports.insertBooking = (bookingData) => {
  const {
    userid,
    hotel_id,
    booking_date,
    checkin_date,
    checkin_time,
    checkout_date,
    checkout_time,
  } = bookingData;

  const query = `
    INSERT INTO bookingmaster
    (userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userid,
    hotel_id,
    booking_date,
    checkin_date,
    checkin_time,
    checkout_date,
    checkout_time
  ];

  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error inserting booking:', err);
        return reject(err);
      }
      resolve(result);
    });
  });
};


exports.getAllBookingAdmin=()=>{
  return new Promise((resolve,reject)=>{
    const query=`
    select b.booking_id,b.hotel_id,u.userid,u.username,u.useremail,
    h.hotel_name,b.booking_date,b.checkin_date,
    b.checkin_time,b.checkout_date,b.checkout_time
     from bookingmaster b inner join usermaster u 
     on u.userid=b.userid inner join hotelmaster h
      on b.hotel_id=h.hotel_id
      `;

      db.query(query,(err,result)=>{
        if(err){
          console.log(err);
          reject(err);
        }
        else{
          console.log("Model:",result);
          resolve(result);
        }
      });
  });
};


exports.enableReview=(userid)=>{
  return new Promise((resolve,reject)=>{
    db.query("UPDATE usermaster SET can_review = TRUE WHERE userid = ?"
      [userid],
      (err,result)=>{
        if(err){
          console.log(err);
          reject(err);
        }
        else{
          console.log("enable review");
          resolve(result);
        }
      }
    );
  });
};

/*exports.getUserById = (userid) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM usermaster WHERE userid = ?',
      [userid],
      (err, results) => {
        if (err) return reject(err);
        
        console.log('Query results:', results);

        // ✅ Return first result if available
        if (results.length === 0) return resolve(null);
        
        resolve(results[0]); // Return user object
      }
    );
  });
};*/



exports.updateCheckIn = (userid) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE bookingmaster 
      SET checkin_flag = TRUE 
      WHERE booking_id = (
        SELECT booking_id FROM (
          SELECT booking_id FROM bookingmaster 
          WHERE userid = ? AND checkin_flag = FALSE 
          ORDER BY booking_date DESC 
          LIMIT 1
        ) AS sub
      )`;

    db.query(query, [userid], (err, result) => {
      if (err) {
        console.log("Check-in error:", err);
        return reject(err);
      }
      console.log("Check-in success:", result);
      resolve(result);
    });
  });
};



/*exports.updateCheckOut = (userid) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE bookingmaster 
      SET checkin_flag = FALSE 
      WHERE booking_id = (
        SELECT booking_id FROM (
          SELECT booking_id FROM bookingmaster 
          WHERE userid = ? AND checkin_flag = TRUE 
          ORDER BY booking_date DESC 
          LIMIT 1
        ) AS sub
      )`;

      
    console.log("Executing updateCheckOut query:", query);
    console.log("userid:", userid);

    db.query(query, [userid], (err, result) => {
      if (err) {
        console.log("Check-out error:", err);
        return reject(err);
      }
      console.log("Check-out success:", result);
      resolve(result);
    });
  });
};*/


exports.getAllBookingByUserId = (userid) => {
  return new Promise((resolve, reject) => {
    console.log("model user id:",userid);
    const query = `SELECT b.booking_id, userid,h.hotel_name, b.booking_date, b.checkin_date,b.checkin_time, b.checkout_date, b.checkout_time FROM bookingmaster b INNER JOIN hotelmaster h ON b.hotel_id = h.hotel_id WHERE userid = ?`;

    db.query(query, [userid], (err, result) => {
      if (err) {
        console.log("DB error:", err);
        reject(err);
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
};

exports.saveReview = (rev_text, rating, review_date) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO reviewmaster (rev_text, rating, rev_date) VALUES (?, ?, ?)",
      [rev_text, rating, review_date],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

exports.saveHotelReviewJoin = (userid, hotel_id, rev_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO hotelreviewjoin (userid, hotel_id, rev_id) VALUES (?, ?, ?)",
      [userid, hotel_id, rev_id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};




exports.getRecommendedHotels = (userid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
  h.hotel_id,
  h.hotel_name,
  h.hotel_address,
  h.hotel_email,
  h.hotel_contact,
  a2.area_name,
  c.city_name,
  ROUND(AVG(r.rating), 1) AS avg_rating,
  GROUP_CONCAT(DISTINCT a.amenity_name ORDER BY a.amenity_name SEPARATOR ', ') AS amenities,
  hp.filename AS image_filename
FROM hotelmaster h
JOIN citymaster c ON h.city_id = c.city_id
JOIN areamaster a2 ON h.area_id = a2.area_id
LEFT JOIN hotelamenitiesjoin ha ON ha.hotel_id = h.hotel_id
LEFT JOIN amenities a ON a.amenity_id = ha.amenity_id
LEFT JOIN hotelreviewjoin hrj ON hrj.hotel_id = h.hotel_id
LEFT JOIN reviewmaster r ON r.rev_id = hrj.rev_id
LEFT JOIN hotelpicjoin hp ON hp.hotel_id = h.hotel_id
WHERE h.city_id IN (
    SELECT DISTINCT h2.city_id
    FROM bookingmaster b2
    JOIN hotelmaster h2 ON b2.hotel_id = h2.hotel_id
    WHERE b2.userid = ?
)
AND h.hotel_id NOT IN (
    SELECT b3.hotel_id
    FROM bookingmaster b3
    WHERE b3.userid = ?
)
GROUP BY h.hotel_id, h.hotel_name, h.hotel_address, h.hotel_email, h.hotel_contact, a2.area_name, c.city_name, hp.filename
ORDER BY avg_rating DESC
LIMIT 10;

    `;

    db.query(query, [userid, userid], (err, result) => {
      if (err) {
        console.error("DB error in getRecommendedHotels:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


exports.getLatestBooking = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT checkin_flag, checkout_flag FROM bookingmaster
       WHERE userid = ?
       ORDER BY booking_id DESC LIMIT 1`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
};

exports.updateBookingFlag = (userId, hotelId, flagKey, flagValue) => {
  return new Promise((resolve, reject) => {
    console.log('➡️ Updating flag:', { userId, hotelId, flagKey, flagValue });

    db.query(
      `SELECT booking_id FROM bookingmaster
       WHERE userid = ? AND hotel_id = ?
       ORDER BY booking_id DESC LIMIT 1`,
      [userId, hotelId],
      (err, results) => {
        if (err) {
          console.error('❌ SELECT error:', err);
          return reject(err);
        }

        if (results.length === 0) {
          console.warn('⚠️ No booking found for:', { userId, hotelId });
          return reject(new Error('No booking found'));
        }

        const bookingId = results[0].booking_id;
        console.log('✅ Found bookingId:', bookingId);

        // Escape column name safely
        const query = `UPDATE bookingmaster SET \`${flagKey}\` = ? WHERE booking_id = ?`;
        db.query(query, [flagValue, bookingId], (err, result) => {
          if (err) {
            console.error('❌ UPDATE error:', err);
            return reject(err);
          }

          console.log('✅ UPDATE result:', result);

          if (result.affectedRows === 0) {
            console.warn('⚠️ No rows updated. Was the flag already set?');
            return reject(new Error('Update affected 0 rows.'));
          }

          resolve();
        });
      }
    );
  });
};

// regModel.js (or userModel.js)
exports.getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM usermaster WHERE userid = ?', [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};





