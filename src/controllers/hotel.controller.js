const hotelService = require("../service/hotel.service");

exports.addHotelCtrl = async (req, res) => {
  try {
    const {
      hotel_name,
      hotel_address,
      city_name,
      area_name,
      hotel_email,
      hotel_contact,
      rating,
      filename
    } = req.body;

    const message = await hotelService.hotelSaveLogic(
      hotel_name,
      hotel_address,
      city_name,
      area_name,
      hotel_email,
      hotel_contact,
      rating,
      filename
    );

    res.status(200).send({ message });
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).send("Internal Server Error");
  }
};
