
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
    if (isMatch) {
      const token = jwt.sign(
        { id: user.userid, name: username, type: user.type },
        "11$$$66&&&&4444",
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      if (user.type && user.type.toLowerCase().trim()==="admin" ) {
        return res.redirect("/admindash");
      } else {
        console.log(user);
        return res.send("Login successful. You are not admin.");
        // Or redirect to a user dashboard
      }
    } else {
      return res.send("Incorrect password");
    }
  } catch (err) {
    console.error("Error in validateUser:", err);
    res.status(500).send("Internal server error");
  }
};

exports.adminDashCtrl=(req,res)=>{
  res.render("Admindashboard.ejs");
}

exports.addhotelCtrl = async (req, res) => {
  try {
    const {
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating,filename
    } = req.body;

    const result = await regService.hotelSaveLogic(
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating,filename
    );

    res.send({ message: result });
  } catch (err) {
    console.error("Error adding hotel:", err);
    res.status(500).send("Error adding hotel");
  }
};



exports.addCityCtrl=async(req,res)=>{
  try{
    const{city_name,pincode}=req.body;
    const result=await regService.citySaveLogic(city_name,pincode);
    res.send({message:result});
  }
  catch(err){
    console.error("Error adding city:",err);
    res.status(500).send("Error adding city",err);
  }
};

exports.addAreaCtrl = async (req, res) => {
  try {
    
    const { area_name } = req.body;
    const result = await regService.areaSaveLogic(area_name);
    res.send({ message: result });
  } catch (err) {
    console.error("Error adding area:", err);
    res.status(500).send({ message: "Error adding area", error: err.message });
  }
};

exports.addAminitiesCtrl=async(req,res)=>{
  try{
    const{amenity_name}=req.body;
    const result = await regService.aminitySaveLogic(amenity_name);
    res.send({ message: result });
  } catch (err) {
    console.error("Error adding aminity:", err);
    res.status(500).send({ message: "Error adding aminity", error: err.message });
  }
};



exports.viewHotelCtrl=async(req,res)=>{
  try{
    const hotels=await regService.getAllHotels();
    console.log("hotels  from db:");
    console.table(hotels);
    res.json(hotels);
   
  }
  catch(err){
    console.log("failed to fetch err:",err);
  }
}

exports.viewCityCtrl=async(req,res)=>{
  try{
    const city=await regService.getAllCities();
    console.log("Cities from db:");
    console.table(city);
    res.json(city);
  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.viewAreaCtrl=async(req,res)=>{
  try{
    const area=await regService.getAllArea();
    console.log("Area from db:");
    console.table(area);
    res.json(area);
  }catch(err){
    console.log("Failed to feach erroe:",err);
  }
};


exports.viewAmenityCtrl=async(req,res)=>{
  try{
    const amenity=await regService.getAllAmenities();
    console.log("Amenity from db:");
    console.table(amenity);
    res.json(amenity);
  }catch(err){
    console.log("Failed to feach erroe:",err);
  }
};



exports.hotelDastCtrl=(req,res)=>{
  res.render("Hotels.ejs");
}

exports.aminitiesCtrl=(req,res)=>{
  res.render("Amenities.ejs");
}

exports.cityCtrl=(req,res)=>{
  res.render("City.ejs");
}

exports.areaCtrl=(req,res)=>{
  res.render("Area.ejs");
}

exports.customerCtrl=(req,res)=>{
  res.render("Customer.ejs");
}

exports.ratingCtrl=(req,res)=>{
  res.render("Rating.ejs");
}

exports.logoutCtrl=(req,res)=>{
  res.render("logout.ejs");
}

exports.addHotelFormCtrl=(req,res)=>{
  res.render("addhotel.ejs",{citymaster:[],areamaster:[]});
}

exports.viewHotelFormCtrl=(req,res)=>{
  res.render("viewHotel.ejs",{data:[]});
}
