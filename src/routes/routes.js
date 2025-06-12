let express=require("express");

let  controller=require("../controllers/usercontroller.js");

let router=express.Router();

router.get("/",controller.homeCtrl);

router.get("/savereg",controller.regCtrl);

router.post("/saveUser", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

//router.post("/addHotel",controller.addhotelCtrl);

router.get("/admindash",controller.adminDashCtrl);

module.exports=router;

//comment
