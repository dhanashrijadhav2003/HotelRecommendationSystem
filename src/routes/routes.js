let express=require("express");

let  controller=require("../controllers/usercontroller.js");

let router=express.Router();

router.get("/",controller.homeCtrl);

router.get("/savereg",controller.regCtrl);

router.post("/saveUser", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

router.post("/addHotel",controller.addhotelCtrl);//



router.get("/deleteHotel", controller.deleteHotelCtrl);

router.get("/updatehotel", controller.loadHotelForUpdate);

router.post("/finalupdatehotel", controller.finalHotelUpdate);

router.get("/getHotelById",controller.getHotelByIdCtrl);

router.get("/addCity",controller.addCityFormCtrl);

router.post("/addCity",controller.addCityCtrl);//





router.get("/viewCity",controller.viewCityCtrl);//

router.get("/addArea",controller.addAreaFormCtrl);

router.post("/addArea",controller.addAreaCtrl);//

router.get("/viewArea",controller.viewAreaCtrl);//

router.get("/viewCityArea",controller.viewAreaWithCityCtrl);

router.post("/addAmenityForm",controller.addAminitiesCtrl);//

router.get("/addAmenityForm", controller.renderAddAmenityForm);


router.get("/viewAmenity",controller.viewAmenityCtrl);//

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

router.get("/logout",controller.logoutCtrl);

module.exports=router;
//hi
