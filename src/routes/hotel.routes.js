const express = require("express");
const router = express.Router();
const hotelController = require("../controller/hotel.controller");

router.post("/addHotel", hotelController.addHotelCtrl);

module.exports = router;
