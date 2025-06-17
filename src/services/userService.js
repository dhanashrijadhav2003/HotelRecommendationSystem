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

exports.hotelSaveLogic = async (hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact,filename,amenity_ids) => {
  try {
    const result = await regModel.saveHotelData(
      hotel_name, hotel_address, city_id, area_id,hotel_email, hotel_contact, filename,
      Array.isArray(amenity_ids) ? amenity_ids : [amenity_ids]
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

exports.areaSaveLogic=async(area_name,city_id)=>{
  try{
    const result=await regModel.saveArea(area_name,city_id);
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

exports.getAllHotelsForView = () => {
  return regModel.fetchAllHotelsWithCityAndArea();
};


exports.getAllCities=()=>{
  return regModel.fetchAllCities();
};


exports.getAllArea=()=>{
  return regModel.fetchAllArea();
};

exports.getCityArea=()=>{
  return regModel.fetchAllAreaWithCity();
};

exports.getAllAmenities = () => {
  return regModel.fetchAllAmenities();
};

exports.getCustomer=()=>{
  return regModel.fetchAllCustomer();
};

exports.deleteHotelLogic = (hotel_id) => {
  return regModel.deleteHotelFromDB(hotel_id);
};

exports.deleteCityLogic=(city_id)=>{
  return regModel.deleteCity(city_id);
};

exports.deleteAreaLogic=(area_id)=>{
  return regModel.deleteAreaLogic(area_id);
};

exports.deleteAmenityLogic=(amenity_id)=>{
  return regModel.deleteAmenityLogic(amenity_id);
};

exports.getHotelById = (hotel_id) => {
  return regModel.getHotelById(hotel_id);
};

exports.getAreabyId=(city_id) => {
  return regModel.getAreaByIdLogic(city_id);
};


exports.updateHotelLogic = (hotel_id, data) => {
  return regModel.updateHotelInDB(hotel_id, data);

};



