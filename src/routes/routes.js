let express=require("express");

let  controller=require("../controllers/usercontroller.js");

let router=express.Router();

router.get("/",controller.homeCtrl);

router.get("/savereg",controller.regCtrl);

router.post("/saveUser", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

router.post("/addHotel",controller.addhotelCtrl);



router.post("/addCity",controller.addCityCtrl);

router.get("/viewCity",controller.viewCityCtrl);

router.post("/addArea",controller.addAreaCtrl);

router.get("/viewArea",controller.viewAreaCtrl);

router.post("/addAmenityForm",controller.addAminitiesCtrl);

router.get("/viewAmenity",controller.viewAmenityCtrl);

router.get("/addHotelForm",controller.addHotelFormCtrl);

router.get("/viewHotelsTable",controller.viewHotelFormCtrl);

router.get("/showHotels",controller.viewHotelCtrl);

router.get("/admindash",controller.adminDashCtrl);

router.get("/hotelDash",controller.hotelDastCtrl);

router.get("/aminities",controller.aminitiesCtrl);

router.get("/city",controller.cityCtrl);

router.get("/area",controller.areaCtrl);

router.get("/customer",controller.customerCtrl);

router.get("/rating",controller.ratingCtrl);

router.get("/logout",controller.logoutCtrl);

module.exports=router;
//hi
