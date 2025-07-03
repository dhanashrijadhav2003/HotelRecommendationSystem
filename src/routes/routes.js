let express=require("express");

let  controller=require("../controllers/usercontroller.js");

const authenticateToken = require("../middlewares/authMiddleware");

let router=express.Router();

const path = require('path');

const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage }); 
 


router.get("/",controller.homeCtrl);

router.get("/savereg",controller.regCtrl);

router.post("/saveUser", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

router.post("/addHotel", upload.single('filename'),controller.addhotelCtrl);//

router.get("/getareadata",controller.viewAreabyIdCtrl);



router.get("/deleteHotel", controller.deleteHotelCtrl);











router.get("/addCity",controller.addCityFormCtrl);

router.post("/addCity",controller.addCityCtrl);//

router.get("/viewCustomer",controller.viewCustomerCtrl);



router.get("/deleteCity", controller.deleteCityCtrl);

router.get("/newViewCity",controller.viewCityCtrl);//

router.get("/deleteArea", controller.deleteAreaCtrl);

router.get("/addArea",controller.addAreaFormCtrl);

router.post("/addArea",controller.addAreaCtrl);//

router.get("/viewArea",controller.viewAreaCtrl);//

router.get("/viewCityArea",controller.viewAreaWithCityCtrl);

router.post("/addAmenityForm",controller.addAminitiesCtrl);//

router.get("/addAmenityForm", controller.renderAddAmenityForm);


router.get("/viewAmenity",controller.viewAmenityCtrl);//

router.get("/deleteAmenity", controller.deleteAmenityCtrl);

router.get("/addHotel",controller.addHotelFormCtrl);

router.get("/viewHotels",controller.viewHotelFormCtrl);

//router.get("/showHotels",controller.viewHotelCtrl);

router.get("/admindash",controller.adminDashCtrl);

router.get("/hotelDash",controller.hotelDastCtrl);//

router.get("/amenityDash",controller.amenityDashCtrl);//

router.get("/cityDash",controller.cityDashCtrl);//

router.get("/areaDash",controller.areaDashCtrl);//

router.get("/aminities",controller.aminitiesCtrl);

router.get("/city",controller.cityCtrl);

router.get("/area",controller.areaCtrl);

router.get("/customer",controller.customerCtrl);

router.get("/rating",controller.ratingCtrl);



router.get('/updateCities',controller.loadUpdateCityForm);
router.post('/finalCityUpdate',controller.finalCityUpdate);

router.get("/updateAmenity", controller.loadAmenityForUpdate);
router.post("/finalAmenityUpdate", controller.finalAmenityUpdate);

router.get("/updateArea", controller.loadAreaForUpdate);
router.post("/finalAreaUpdate", controller.finalAreaUpdate);

router.get("/updateHotel",controller.getHotelByIdCtrl);
router.post("/finalHotelUpdate", upload.single("filename"), controller.finalHotelUpdate);


//usesr routers
router.get("/userdash",authenticateToken,controller.userDashCtrl);

router.get("/userhotelview",controller.userHoteViewCtrl);

//room
router.get("/viewPrice", controller.addPriceCtrl);//table
router.post("/savePrice", controller.savePriceCtrl);//add
router.get("/savePriceForm",controller.savePriceFormCtrl);//form
router.get("/roomDash",controller.roomDashCtrl);//dash
router.get("/room",controller.roomCtrl);
router.get("/roomPricesByHotel",controller.getRoomPriceByHotelCtrl);

//search by city

//router.get("/hotelBox",controller.hotelBoxCtrl);

router.get("/hotelBox",controller.allHotelsCtrl);


//book hotel
router.get("/bookHotelForm",authenticateToken,controller.bookHotelCtrl);
router.post("/saveBookingForm",controller.saveBookingFormCtrl);

router.get("/viewSpeHotelUser",controller.viewSpecHotelByUserCtrl);

router.get("/backBtnInSpeHotel",controller.backBtnInSpeHotelCtrl);


router.get("/bookingHistoryByUserId", authenticateToken, controller.bookingHistroryCtrl);

router.post("/reviewRatingForm",authenticateToken,controller.reviewRatingFormCtrl);

router.get("/reviewForm",authenticateToken,controller.reviewFormCtrl);

router.get("/bookingDetailsAdmin",controller.bookingDetailsCtrl);

//recommendation

router.get("/recommendHotels", authenticateToken, controller.recommendHotelsCtrl);

router.get("/recommSpecificHotel",controller.recommSpecHotelCtrl);

router.get("/recommendationBackBtn",controller.recomendationBackBtnCtrl);


//check in check out
router.get('/usercheckin', authenticateToken, controller.checkInCtrl);
router.get('/usercheckout', authenticateToken, controller.checkOutCtrl);



router.post("/logout", controller.logoutAPI);

module.exports=router;
//hi
