
let regService=require("../services/userService.js");
const bcrypt = require("bcryptjs");
let jwt=require("jsonwebtoken");
let cookie=require("cookie-parser");

exports.homeCtrl=(req,res)=>{
    res.render("home.ejs");
}

exports.regCtrl=(req,res)=>{
    res.render("register.ejs",{message:""});
}


exports.saveReg = async (req, res) => {
  try {
    let { username, useremail, password, contact, type } = req.body;
    contact = Number(contact); 

    const result = await regService.regserviceLogic(username, useremail, password, contact, type);
    res.render("login",{message:"Register Successfully..."});
  } catch (err) {
    console.error("Controller error:", err);
   res.render("login",{message:"Registration Failed!..."})
  }
};

exports.regLogin=((req,res)=>{
    res.render("login.ejs",{message:""});
});

exports.validateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.send("Username and password are required");
    }
    const user = await regService.getOriginalPassword(username);
    if (!user) {
      return res.send("User not found");
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (isMatch){
      const token = jwt.sign({
         id: user.userid, 
         name: username 
        },"11$$$66&&&&4444", { expiresIn: "1h" }
      );
      //console.log("Generated Token:", token);
      return res.send({ message: "Login successful", token });
    } else {
      return res.send("Incorrect password");
    }
  } catch (err) {
    console.error("Error in validateUser:", err);
    res.status(500).send("Internal server error");
  }
};
