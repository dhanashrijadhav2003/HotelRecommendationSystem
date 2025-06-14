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

exports.hotelSaveLogic = async (hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact, rating) => {
  try {
    const result = await regModel.saveHotelData(
      hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact, rating
    );
    return result;
  } catch (err) {
    console.error("Service error:", err);
    throw new Error("Failed to add hotel");
  }
};

exports.citySaveLogic=async(city_name,pincode)=>{
  try{
    const result=await regModel.saveCity(city_name,pincode);
    return result;
  }catch(err){
    console.error("Error:",err);
    throw new Error("Failed to add city");
  }
};

exports.areaSaveLogic=async(area_name)=>{
  try{
    const result=await regModel.saveArea(area_name);
    return result;
  }catch(err){
    console.error("Error:",err);
    throw new Error("Eailed to add area");
  }
};

exports.aminitySaveLogic=async(amenity_name)=>{
   try{
    const result=await regModel.saveAminity(amenity_name);
    return result;
  }catch(err){
    console.error("Error:",err);
    throw new Error("Eailed to add aminity");
  }
};

exports.getAllHotels=()=>{
  return regModel.fetchAllHotels();
};


exports.getAllCities=()=>{
  return regModel.fetchAllCities();
};


exports.getAllArea=()=>{
  return regModel.fetchAllArea();
};

exports.getAllAmenities = () => {
  return regModel.fetchAllAmenities();
};
