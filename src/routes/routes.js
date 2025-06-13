let express=require("express");

let  controller=require("../controllers/usercontroller.js");

let router=express.Router();

router.get("/",controller.homeCtrl);

router.get("/savereg",controller.regCtrl);

router.post("/saveUser", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

router.post("/addHotel",controller.addhotelCtrl);

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
