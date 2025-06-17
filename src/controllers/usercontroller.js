
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
  console.log("Request body:", req.body);
  console.log("Filename:", req.file?.filename || req.body.filename);
  console.log("Raw amenity_ids:", req.body.amenity_ids);

  let amenity_ids;

  try {
    // Safely parse amenity_ids from string or fallback to array from comma-separated string
    if (typeof req.body.amenity_ids === 'string') {
      try {
        amenity_ids = JSON.parse(req.body.amenity_ids);
      } catch (e) {
        // If JSON.parse fails, try splitting comma separated string
        amenity_ids = req.body.amenity_ids.split(',').map(id => id.trim());
      }
    } else {
      amenity_ids = req.body.amenity_ids || [];
    }
  } catch (parseErr) {
    console.error("Error parsing amenity_ids:", parseErr);
    amenity_ids = [];
  }

  const filename = req.file?.filename || req.body.filename || null;

  try {
    const cities = await regService.getAllCities();
    const areas = await regService.getAllArea();
    const amenities = await regService.getAllAmenities();

    const {
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact
    } = req.body;

    const result = await regService.hotelSaveLogic(
      hotel_name, hotel_address, city_id, area_id, hotel_email, hotel_contact, filename, amenity_ids
    );

    res.render("addHotel", { citymaster: cities, areamaster: areas, amenities: amenities, msg: "Hotel added successfully" });

  } catch (err) {
    console.error("Error adding hotel:", err);

    // In case of error, fetch data again to populate form dropdowns
    const cities = await regService.getAllCities();
    const areas = await regService.getAllArea();
    const amenities = await regService.getAllAmenities();

    res.status(500).render('addHotel', { citymaster: cities, areamaster: areas, amenities: amenities, msg: 'Error adding hotel' });
  }
};




exports.addCityCtrl=async(req,res)=>{
  try{
    const{city_name,pincode}=req.body;
    const result=await regService.citySaveLogic(city_name,pincode);
    res.render("city",{msg:"City added successfully"});
  }
  catch(err){
    console.error("Error adding city:",err);
    res.status(500).render('city', { msg: 'Error adding city'  });
  }
};

exports.addAreaCtrl = async (req, res) => {
  const cities = await regService.getAllCities();
  console.log(req.body);
  try {

    const { area_name ,city_id} = req.body;
    const result = await regService.areaSaveLogic(area_name,city_id);
    res.render("area",{citymaster:cities,msg:"Area added successfully"});
  } catch (err) {
    console.error("Error adding area:", err);
     res.status(500).render('area', {citymaster:cities,msg: 'Error adding area'  });
  }
};

exports.addAminitiesCtrl=async(req,res)=>{
  try{
    const{amenity_name}=req.body;
    const result = await regService.aminitySaveLogic(amenity_name);
    res.render("Amenities",{amenities: result, msg:"Amenity added successfully" });
  } catch (err) {
    console.error("Error adding aminity:", err);
     res.status(500).render('Amenities', {amenities:[], msg: 'Error adding amenity'  });
  }
};



exports.viewHotelFormCtrl = async (req, res) => {
  try {
    const hotels = await regService.getAllHotelsForView();
    const city=await regService.getAllCities();
    const area=await regService.getAllArea();
    console.table(hotels);
    //res.json(hotels); 
    res.render("viewHotel",{data:hotels,city,area});
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).render('viewHotel', {data:hotels, citymaster:cities,areamaster:areas,msg: 'Error adding amenity'  });
  }
};




exports.viewCityCtrl=async(req,res)=>{
  try{
    const city=await regService.getAllCities();
    console.log("Cities from db:");
    console.table(city);
    //res.json(city);
    res.render("viewCity",{data:city});
  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.viewCustomerCtrl=async(req,res)=>{
  try{
  const cust=await regService.getCustomer();
  console.log("Customer:");
  console.table(cust);
  //res.json(cust);
  res.render("viewUser",{data:cust});
  }
  catch(err){
    console.log("Failed to fetch customer error",err);
  }
};

exports.viewAreaCtrl=async(req,res)=>{
  try{
    const area=await regService.getAllArea();
    console.log("Area from db:");
    console.table(area);
    res.json(area);
  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.viewAreabyIdCtrl = async (req, res) => {
  try {
    const city_id = parseInt(req.query.city_id);
    if (isNaN(city_id)) {
      return res.status(400).send("Invalid or missing city_id");
    }
    const area = await regService.getAreabyId(city_id);
    res.json(area);
  } catch (err) {
    console.error("Error fetching area by city_id:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

exports.viewAreaWithCityCtrl=async(req,res)=>{
  try{
    const area=await regService.getAllArea();
    const city=await regService.getAllCities();
    const areacity=await regService.getCityArea();
    console.log("Area from db:");
    console.table(areacity);
   // res.json(areacity);
   res.render("viewArea",{data:areacity,city,area});
  }catch(err){
    console.log("Failed to feach erroe:",err);
  }
};


exports.viewAmenityCtrl=async(req,res)=>{
  try{
    const amenity=await regService.getAllAmenities();
    console.log("Amenity from db:");
    console.table(amenity);
    //res.json(amenity);
    res.render("viewAmenity",{data:amenity});

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
  console.log("Raw hotel_id:", req.query.hotel_id); // This will show undefined if not passed
  console.log("Parsed hotel_id:", hotel_id);

  if (isNaN(hotel_id)) {
    console.error("Invalid hotel_id:", req.query.hotel_id);
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

exports.deleteCityCtrl=async(req,res)=>{
  const city_id=parseInt(req.query.city_id);
  console.log(req.body);
  if(isNaN(city_id)){
    console.log("Inavlid city_id:",req.params.city_id);
    return res.status(400).send("Invalid city id");
  }
  try{
    await regService.deleteCityLogic(city_id);
    res.redirect("/viewCity");
  }
  catch(err){
    console.error("Error deleting city:",err);
    res.status(500).send("Failed to delete city");
  }
};


exports.deleteAreaCtrl=async(req,res)=>{
  const area_id=parseInt(req.query.area_id);
  console.log(req.body);
  if(isNaN(area_id)){
    console.log("Inavlid area_id_id:",req.params.area_id);
    return res.status(400).send("Invalid area id");
  }
  try{
    await regService.deleteAreaLogic(area_id);
    res.redirect("/viewArea");
  }
  catch(err){
    console.error("Error deleting area:",err);
    res.status(500).send("Failed to delete area");
  }
};


exports.deleteAmenityCtrl=async(req,res)=>{
  const amenity_id=parseInt(req.query.amenity_id);
  console.log(req.body);
  if(isNaN(amenity_id)){
    console.log("Inavlid amenity_id:",req.params.amenity_id);
    return res.status(400).send("Invalid amenity id");
  }
  try{
    await regService.deleteAmenityLogic(amenity_id);
    res.redirect("/viewAmenity");
  }
  catch(err){
    console.error("Error deleting amenity:",err);
    res.status(500).send("Failed to delete amenity");
  }
};


exports.loadHotelForUpdate = async (req, res) => {
  const hotel_id = parseInt(req.query.hotel_id);

  if (isNaN(hotel_id)) return res.status(400).send("Invalid hotel_id");

  try {
    const hotel = await regService.getHotelById(hotel_id);
    const cities = await regService.getAllCities();
    const areas = await regService.getAllArea();

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

exports.addHotelFormCtrl=async(req,res)=>{
   const cities = await regService.getAllCities();
    const areas = await regService.getAllArea();
    const amenities = await regService.getAllAmenities();

  res.render("addhotel.ejs",{citymaster:cities,areamaster:areas,amenities:amenities,msg:""});
}
/*
exports.viewHotelFormCtrl=(req,res)=>{
  res.render("viewHotel.ejs",{data:[]});
}*/


exports.renderAddAmenityForm = (req, res) => {
  res.render("Amenities",{msg:""}); // Renders Amenities.ejs
};

exports.addCityFormCtrl=(req,res)=>{
  res.render("city",{msg:""});
};

exports.addAreaFormCtrl=async(req,res)=>{
  const cities = await regService.getAllCities();
  res.render("area",{citymaster:cities,msg:""});
};


exports.loadUpdateCityForm = async (req, res) => {
  try {
    const city_id = parseInt(req.query.city_id);
    if (isNaN(city_id)) {
      return res.status(400).send("Invalid city ID.");
    }
    const city = await regService.getCityByIdLogic(city_id);
    console.log("city by id:");
    console.table(city);
  

    res.render("UpdateCity", { erecord: city, msg: "" });
  } catch (err) {
    console.error("Error loading city for update:", err);
    res.status(500).send("Failed to load city.");
  }
};


exports.finalCityUpdate = async (req, res) => {
  try {
    let { city_id, city_name, pincode } = req.body;

    city_id = parseInt(city_id);
    if (isNaN(city_id)) {
      return res.status(400).send("Invalid city ID.");
    }

    console.log("Update request:", city_id, city_name, pincode);

    await regService.updateCityLogic(city_id, city_name, pincode);

    const cities = await regService.getAllCities();
    res.json(cities);
    console.table(cities);
    //res.render("viewCity", { data: cities, msg: "✅ City updated successfully!" });

  } catch (err) {
    console.error("Error updating city:", err);
    res.status(500).send("Failed to update city.");
  }
};



exports.loadAmenityForUpdate = async (req, res) => {
  try {
    const amenity_id = parseInt(req.query.amenity_id);
    if (isNaN(amenity_id)) {
      return res.status(400).send("Invalid amenity ID.");
    }

    const amenity = await regService.getAmenityByIdLogic(amenity_id);

    if (!amenity) {
      return res.status(404).send("Amenity not found.");
    }


    res.render("UpdateAmenity", { erecord: amenity, msg: "" });
  } catch (err) {
    console.error("Error loading amenity:", err);
    res.status(500).send("Failed to load amenity.");
  }
};


exports.finalAmenityUpdate = async (req, res) => {
  try {
    const { amenity_id, amenity_name } = req.body;
    if (!amenity_id || !amenity_name) {
      return res.status(400).send("Missing fields");
    }
    const amenities = await regService.getAllAmenities();
    await regService.updateAmenityLogic(amenity_id, amenity_name);
    res.render("viewCity", { data: amenities, msg: "✅ amenity updated successfully!" });
  } catch (err) {
    console.error("Error updating amenity:", err);
    res.status(500).send("❌ Failed to update amenity");
  }
};


