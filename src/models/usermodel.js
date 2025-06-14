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

exports.saveHotelData=(...hoteldata)=>{
    return new Promise((resolve,reject)=>{
        db.query(
          "insert into hotelmaster(hotel_name,hotel_address,city_id,area_id ,hotel_email,hotel_contact,rating) values(?,?,?,?,?,?,?)",
          [hoteldata[0],hoteldata[1],hoteldata[2],hoteldata[3],hoteldata[4],hoteldata[5],hoteldata[6]],
          (err,result)=>{
            if(err){
              console.error("DB error:",err);
              reject(err);
            }
            else{
              resolve("hotel added successfully...");
            }
          }
        );
    });
};

exports.saveArea = (area_name) => {
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
          resolve("Area added successfully...");
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


exports.fetchAllHotels=()=>{
  return new Promise((resolve,reject)=>{
      db.query("select * from hotelmaster",(err,result)=>{
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
