
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
  console.log("Request body:",req.body);
  try {
    const {
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating
    } = req.body;

    const result = await regService.hotelSaveLogic(
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, rating
    );

    res.send({ message: result });
    res.redirect("/addHotel");
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
     res.status(500).render('Amenities', { 
      message: 'Error adding amenity', 
      error: err.message 
    });
  }
};



exports.viewHotelFormCtrl = async (req, res) => {
  try {
    const hotels = await regService.getAllHotelsForView();
    console.table(hotels);
    res.json(hotels);  // Send JSON response
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
};




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
    res.render("viewAmenity",{cities});

  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.getHotelByIdCtrl = async (req, res) => {
  try {
    const hotel_id = parseInt(req.query.hotel_id);
    if (isNaN(hotel_id)) {
      return res.status(400).send("Invalid or missing hotel_id");
    }
    const hotel = await regService.getHotelById(hotel_id);
    console.log("Hotel by id:");
    console.table(hotel);
    res.json(hotel);
  } catch (err) {
    console.error("Failed to fetch hotel by id:", err);
    res.status(500).send("Failed to fetch hotel by id");
  }
};


exports.deleteHotelCtrl = async (req, res) => {
  const hotel_id = parseInt(req.query.hotel_id);

  if (isNaN(hotel_id)) {
    console.error("Invalid hotel_id:", req.params.hotel_id);
    return res.status(400).send("Invalid hotel ID");
  }

  try {
    await regService.deleteHotelLogic(hotel_id);
    res.redirect("/viewHotels");
  } catch (err) {
    console.error("Error deleting hotel:", err);
    res.status(500).send("Failed to delete hotel");
  }
};


exports.loadHotelForUpdate = async (req, res) => {
  const hotel_id = parseInt(req.query.hotel_id);

  if (isNaN(hotel_id)) return res.status(400).send("Invalid hotel_id");

  try {
    const hotel = await regService.getHotelById(hotel_id);
    const cities = await regService.getAllCities();
    const areas = await regService.getAllAreas();

    //res.render("updatehotel.ejs", { hotel, cities, areas });
  } catch (err) {
    console.error("Error loading hotel:", err);
    res.status(500).send("Failed to load hotel for update");
  }
};

exports.finalHotelUpdate = async (req, res) => {
  const {hotel_id,hotel_name,hotel_address,hotel_email,hotel_contact,rating,city_id,area_id} = req.body;

  try {
    await regService.updateHotelLogic(hotel_id, {hotel_name,hotel_address,hotel_email,hotel_contact,rating,city_id,area_id });

    const hotels = await regService.getAllHotelsForView();
    //res.render("viewhotel.ejs", { data: hotels });
  } catch (err) {
    console.error("Error updating hotel:", err);
    res.status(500).send("Failed to update hotel");
  }
};




exports.hotelDastCtrl=(req,res)=>{
  res.render("Hotels.ejs");
}

exports.amenityDashCtrl=(req,res)=>{
  res.render("AmenityDash.ejs");
}

exports.aminitiesCtrl=(req,res)=>{
  res.render("Amenities.ejs");
}

exports.cityDashCtrl=(req,res)=>{
  res.render("CityDash.ejs");
}

exports.areaDashCtrl=(req,res)=>{
  res.render("AreaDash.ejs");
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

/*exports.addHotelFormCtrl=(req,res)=>{
  res.render("addhotel.ejs",{citymaster:[],areamaster:[]});
}*/
/*
exports.viewHotelFormCtrl=(req,res)=>{
  res.render("viewHotel.ejs",{data:[]});
}*/


exports.renderAddAmenityForm = (req, res) => {
  res.render("Amenities"); // Renders Amenities.ejs
};
