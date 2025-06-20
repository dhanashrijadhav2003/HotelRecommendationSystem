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
                h.hotel_email, h.hotel_contact, hp.filename`,
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
    db.query("SELECT * FROM areamaster WHERE area_id = ?", [area_id], (err, result) => {
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
