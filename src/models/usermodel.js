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
