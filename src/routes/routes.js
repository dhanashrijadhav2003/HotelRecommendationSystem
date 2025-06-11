let express=require("express");

let  controller=require("../controllers/usercontroller.js");

let router=express.Router();

router.get("/",controller.homeCtrl);

router.get("/reg",controller.regCtrl);

router.post("/savereg", controller.saveReg);

router.get("/login",controller.regLogin);

router.post("/validate", controller.validateUser);

module.exports=router;