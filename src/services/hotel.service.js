const hotelModel = require("../model/hotel.model");

exports.hotelSaveLogic = async (
  hotel_name,
  hotel_address,
  city_name,
  area_name,
  hotel_email,
  hotel_contact,
  rating,
  filename
) => {
  try {
    // Fetch or Insert city and area
    const city_id = await hotelModel.getCityId(city_name);
    const area_id = await hotelModel.getAreaId(area_name);

    await hotelModel.linkCityArea(city_id, area_id);

    const hotel_id = await hotelModel.saveHotelData(
      hotel_name,
      hotel_address,
      city_id,
      area_id,
      hotel_email,
      hotel_contact,
      rating
    );

    await hotelModel.saveHotelImage(hotel_id, filename);

    return "Hotel added successfully.";
  } catch (err) {
    console.error("Service Error:", err);
    throw err;
  }
};
