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

exports.saveHotelData = (hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating) => {
  return new Promise((resolve, reject) => {
    // Check if city_id exists
    db.query("select city_name from citymaster where city_id=?", [city_id], (err, result) => {
      if (err) {
        console.log("City fetch error:", err);
        return reject("Failed to fetch city");
      }
      if (result.length === 0) {
        console.log("City not found for id:", city_id);
        return reject("Invalid city id");
      }

      // Check if area_id exists
      db.query("select area_name from areamaster where area_id=?", [area_id], (err, arearesult) => {
        if (err) {
          console.log("Area fetch error:", err);
          return reject("Failed to fetch area");
        }
        if (arearesult.length === 0) {
          console.log("Area not found for id:", area_id);
          return reject("Invalid area id");
        }

        // Insert into hotelmaster (fix typo here)
        db.query(
          "insert into hotelmaster (hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating) values (?, ?, ?, ?, ?, ?, ?)",
          [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating],
          (err, insertResult) => {
            if (err) {
              console.log("Insert hotel error:", err.sqlMessage || err);
              return reject("Insert hotel failed");
            }
            resolve("Hotel added successfully...");
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
      SELECT h.hotel_id, h.hotel_name, h.hotel_address, c.city_name, a.area_name,
             h.hotel_email, h.hotel_contact, h.rating
      FROM hotelmaster h
      JOIN citymaster c ON h.city_id = c.city_id
      JOIN areamaster a ON h.area_id = a.area_id;
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
        SELECT h.hotel_id, h.hotel_name, h.hotel_address, 
               c.city_name, a.area_name, h.hotel_email, 
               h.hotel_contact, h.rating 
        FROM hotelmaster h 
        JOIN citymaster c ON h.city_id = c.city_id 
        JOIN areamaster a ON h.area_id = a.area_id
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
      db.query("delete from citymaster where city_id-?",[city_id],(err,result)=>{
        if(err){
          console.log("Error during deleting city",err);
          return reject("delete failed");
        }
        if(result.affectedRows === 0){
          return reject(`No city found with id:"$(city_id)`);
        }
        console.log("City deleted successfully");
        db.query("select * from city",(err1,result1)=>{
            if(err1){
              console.error("DB error while fetching updated city list:", err1);
              return resolve("Hotel deleted, but failed to fetch updated city list.");
             }
             console.table(result1); // Logs to your Node.js console
        return resolve("city deleted successfully and city list updated in console.");
        });
      });
  });
};


exports.getHotelById = (hotel_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      " SELECT h.hotel_id, h.hotel_name, h.hotel_address, c.city_name, a.area_name, h.hotel_email,h.hotel_contact, h.rating FROM hotelmaster h JOIN citymaster c ON h.city_id = c.city_id JOIN areamaster a ON h.area_id = a.area_id WHERE hotel_id = ?",
      [hotel_id],
      (err, result) => {
        if (err) return reject(err);
        if (result.length === 0) return reject("No hotel found");
        resolve(result[0]);
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