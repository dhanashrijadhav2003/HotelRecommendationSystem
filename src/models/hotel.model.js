const db = require("../db");

exports.getCityId = (city_name) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT city_id FROM citymaster WHERE city_name = ?", [city_name], (err, result) => {
      if (err) return reject(err);
      if (result.length > 0) return resolve(result[0].city_id);

      // Insert new city if not found
      db.query("INSERT INTO citymaster (city_name) VALUES (?)", [city_name], (err, res2) => {
        if (err) return reject(err);
        resolve(res2.insertId);
      });
    });
  });
};

exports.getAreaId = (area_name) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT area_id FROM areamaster WHERE area_name = ?", [area_name], (err, result) => {
      if (err) return reject(err);
      if (result.length > 0) return resolve(result[0].area_id);

      db.query("INSERT INTO areamaster (area_name) VALUES (?)", [area_name], (err, res2) => {
        if (err) return reject(err);
        resolve(res2.insertId);
      });
    });
  });
};

exports.linkCityArea = (city_id, area_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM cityareajoin WHERE city_id = ? AND area_id = ?",
      [city_id, area_id],
      (err, result) => {
        if (err) return reject(err);
        if (result.length > 0) return resolve(); // already exists

        db.query(
          "INSERT INTO cityareajoin (city_id, area_id) VALUES (?, ?)",
          [city_id, area_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      }
    );
  });
};

exports.saveHotelData = (
  hotel_name,
  hotel_address,
  city_id,
  area_id,
  hotel_email,
  hotel_contact,
  rating
) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO hotelmaster (hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
};

exports.saveHotelImage = (hotel_id, filename) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO hotelpicjoin (hotel_id, filename) VALUES (?, ?)",
      [hotel_id, filename],
      (err, result) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};
