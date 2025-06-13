// src/services/userService.js
let bcrypt = require("bcryptjs");
let regModel = require("../models/usermodel.js");

exports.regserviceLogic = async (username, useremail, password, contact, type) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const result = await regModel.saveRegData(username, useremail, hashedPassword, contact, type);
    return result;
  } catch (err) {
    console.error("Service error:", err);
    throw new Error("Failed to register user");
  }
};

exports.getOriginalPassword = (username) => {
  return regModel.getPasswordFromDB(username);
};

exports.hotelSaveLogic = async (hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact, rating, reviewcount) => {
  try {
    const result = await regModel.saveHotelData(
      hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact, rating, reviewcount
    );
    return result;
  } catch (err) {
    console.error("Service error:", err);
    throw new Error("Failed to add hotel");
  }
};

exports.getAllHotels=()=>{
  return regModel.fetchAllHotels();
};
