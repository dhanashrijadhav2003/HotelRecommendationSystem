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

exports.getPriceRoom=()=>{
  return regModel.getPriceRoomHotel();
}

exports.saveRoomPrice = (hotel_id, room_id, price) => {
  return regModel.insertRoomPrice(hotel_id, room_id, price);
};

//search
/*exports.searchHotelsByCity = async (city) => {
  // Here you can add extra business logic if needed
  if (!city || city.trim() === '') {
    return [];
  }
  
  const hotels = await regModel.getHotelsByCity(city.trim());
  return hotels;
};*/



/*exports.searchHotelsByCityAndArea = async (city, area) => {
  if ((!city || city.trim() === '') && (!area || area.trim() === '')) {
    return []; 
  }
  const cityTrimmed = city.trim();
  const areaTrimmed = area.trim();

  const hotels = await regModel.getHotelsByCityAndArea(cityTrimmed, areaTrimmed);
  return hotels;
};*/

exports.searchHotelsByCityAndArea = async (city, area) => {
  if (!city.trim() && !area.trim()) {
    return await regModel.getAllHotels(); // Show all if blank
  }
  return await regModel.getHotelsByCityAndArea(city.trim(), area.trim());
};

exports.getCityByIdLogic = (city_id) => {
  return regModel.getCityById(city_id);
};

exports.updateCityLogic = (city_id, city_name, pincode) => {
  return regModel.updateCity(city_id, city_name, pincode);
};

exports.getAmenityByIdLogic = (amenity_id) => {
  return regModel.getAmenityById(amenity_id);
};

exports.updateAmenityLogic = (amenity_id, amenity_name) => {
  return regModel.updateAmenity(amenity_id, amenity_name);
};

exports.getAreaByIdLogic = (area_id) => {
  return regModel.getAreaById(area_id);
};

exports.updateAreaLogic = (area_id, area_name, city_id) => {
  return regModel.updateArea(area_id, area_name, city_id);
};


exports.updateHotelLogic = (
  hotel_id, hotel_name, hotel_address,city_id, area_id, hotel_email, hotel_contact, filename,amenity_ids
) => {
  return regModel.updateHotelData(
    hotel_id, hotel_name,hotel_address,city_id,area_id,hotel_email,hotel_contact,filename,amenity_ids
  );
};

exports.getAllRooms=()=>{
  return regModel.fetchAllRoom();
};

exports.getRoomWithPrice=(hotel_id)=>{
  return regModel.getRoomHotelById(hotel_id);
};

exports.saveBooking = async (bookingData) => {
  const {userid,hotel_id,checkin_date,checkout_date,checkin_time,checkout_time} = bookingData;

  const booking_date = new Date(); 

  return await regModel.insertBooking({ userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time
  });
};

exports.getAllBookingAdmin = () => {
  return regModel.getAllBookingAdmin();
};

/*exports.getUserById=(userid)=>{
  regModel.getUserById(userid);
};*/

exports.checkInUser = async (userid) => {
  await regModel.updateCheckIn(userid);
};

/*exports.checkOutUser = async (userid) => {
  await regModel.updateCheckOut(userid);
  await regModel.enableReview(userid);
};*/

exports.getAllBookingByUserId=(userid)=>{
  console.log("service user id:",userid);
  return regModel.getAllBookingByUserId(userid);
};

exports.addReview = async (userid, hotel_id, rev_text, rating, review_date) => {
  try {
    userid = Number(userid);
    hotel_id = Number(hotel_id);

    // Optional: Validate IDs
    const [user] = await db.query("SELECT userid FROM usermaster WHERE userid = ?", [userid]);
    const [hotel] = await db.query("SELECT hotel_id FROM hotelmaster WHERE hotel_id = ?", [hotel_id]);

    if (!user.length || !hotel.length) {
      throw new Error("Invalid user or hotel ID.");
    }

    const revResult = await regModel.saveReview(rev_text, rating, review_date);
    const rev_id = revResult.insertId;

    console.log("Inserted review ID:", rev_id);

    await regModel.saveHotelReviewJoin(userid, hotel_id, rev_id);
    console.log("Inserted join row with user:", userid, "hotel:", hotel_id, "review:", rev_id);

    return "Review added.";
  } catch (err) {
    console.log("❌ Error in addReview service:", err);
    throw err;
  }
};


exports.getRecommendedHotels = (userid) => {
  return regModel.getRecommendedHotels(userid);
};


exports.getAllHotelsWithImages = async () => {
  try {
    return await regModel.getAllHotelsWithImages();
  } catch (err) {
    console.error('Service Error - getAllHotelsWithImages:', err);
    throw err;
  }
};


exports.shouldShowReviewTab = async (userId) => {
  const latest = await regModel.getLatestBooking(userId);
  if (!latest) return false;
  return latest.checkin_flag === 1 && latest.checkout_flag === 1;
};

exports.checkIn = async (userId, hotelId) => {
  await regModel.updateBookingFlag(userId, hotelId, 'checkin_flag', 1);
};

exports.checkOut = async (userId, hotelId) => {
  await regModel.updateBookingFlag(userId, hotelId, 'checkout_flag', 1);
};



exports.getUserById = async (userId) => {
  try {
    const user = await regModel.getUserById(userId);
    return user;
  } catch (error) {
    console.error('Error in getUserById service:', error);
    throw error;
  }
};


exports.getLatestBooking = (userId) => {
  return regModel.getLatestBooking(userId);
};




