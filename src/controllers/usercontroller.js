
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
      } else if(user.type && user.type.toLowerCase().trim()==="user") {
        console.log(user);
        return res.redirect("/userdash");
       
      }
    } else {
      return res.send("Incorrect password");
    }
  } catch (err) {
    console.error("Error in validateUser:", err);
    res.send("Internal server error");
  }
};

exports.adminDashCtrl=(req,res)=>{
  res.render("Admindashboard.ejs");
}

/*exports.userDashCtrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const showReviewTab = await regService.shouldShowReviewTab(userId);
    res.render('userdashboard.ejs', { user: req.user, showReviewTab });
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong.');
  }
};*/


/*exports.userDashCtrl = async (req, res) => {
  const userId = req.user.id;  // or however you get user id
  const user = await regService.getUserById(userId);
  const latestBooking = await regModel.getLatestBooking(userId);

  // Extract hotelId if booking exists, else null
  const hotelId = latestBooking ? latestBooking.hotel_id : null;

  // Also check if review tab should show based on checkin & checkout flags
  const showReviewTab = latestBooking && latestBooking.checkin_flag === 1 && latestBooking.checkout_flag === 1;

  res.render('userdashboard', { user, showReviewTab, hotelId });
};*/

exports.userDashCtrl = async (req, res) => {
  try {
    const userId = req.user.id; // assuming req.user is set by your auth middleware

    // Fetch user details using service
    const user = await regService.getUserById(userId);

    // Fetch latest booking using service (NOT directly regModel)
    const latestBooking = await regService.getLatestBooking(userId);

    // Extract hotelId if booking exists
    const hotelId = latestBooking ? latestBooking.hotel_id : null;

    // Decide whether to show review tab
    const showReviewTab = latestBooking &&
                          latestBooking.checkin_flag === 1 &&
                          latestBooking.checkout_flag === 1;

    // Render dashboard view
    res.render('userdashboard', {
      user,
      showReviewTab,
      hotelId
    });

  } catch (err) {
    console.error("❌ Error in userDashCtrl:", err);
    res.status(500).send("Internal Server Error");
  }
};







exports.addhotelCtrl = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Filename:", req.file?.filename || req.body.filename);
  console.log("Raw amenity_ids:", req.body.amenity_ids);

  let amenity_ids;

  try {

    if (typeof req.body.amenity_ids === 'string') {
      try {
        amenity_ids = JSON.parse(req.body.amenity_ids);
      } catch (e) {

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

    
    const cities = await regService.getAllCities();
    const areas = await regService.getAllArea();
    const amenities = await regService.getAllAmenities();

    res.render('addHotel', { citymaster: cities, areamaster: areas, amenities: amenities, msg: 'Error adding hotel' });
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
    res.render('city', { msg: 'Error adding city'  });
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
     res.render('area', {citymaster:cities,msg: 'Error adding area'  });
  }
};

exports.addAminitiesCtrl=async(req,res)=>{
  try{
    const{amenity_name}=req.body;
    const result = await regService.aminitySaveLogic(amenity_name);
    res.render("Amenities",{amenities: result, msg:"Amenity added successfully" });
  } catch (err) {
    console.error("Error adding aminity:", err);
     res.render('Amenities', {amenities:[], msg: 'Error adding amenity'  });
  }
};



exports.viewHotelFormCtrl = async (req, res) => {
  try {
    const hotels = await regService.getAllHotelsForView();
    const city=await regService.getAllCities();
    const area=await regService.getAllArea();
    console.table(hotels);
    //res.json(hotels); 
    res.render("NewviewHotel",{data:hotels,city,area});
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.render('NewviewHotel', {data:hotels, citymaster:cities,areamaster:areas,msg: 'Error adding amenity'  });
  }
};




exports.viewCityCtrl=async(req,res)=>{
  try{
    const city=await regService.getAllCities();
    console.log("Cities from db:");
    console.table(city);
    //res.json(city);
    res.render("NewviewCity",{data:city});
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
    res.render("newviewArea",{area});
  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.viewAreabyIdCtrl = async (req, res) => {
  try {
    const city_id = parseInt(req.query.city_id);
    if (isNaN(city_id)) {
      return res.send("Invalid or missing city_id");
    }
    const area = await regService.getAreabyId(city_id);
    res.json(area);
  } catch (err) {
    console.error("Error fetching area by city_id:", err);
    res.json({ error: err.message || "Internal Server Error" });
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
   res.render("newviewArea",{data:areacity,city,area});
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
    res.render("newviewAmenity",{data:amenity});

  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};

exports.getHotelByIdCtrl = async (req, res) => {
  try {
    const hotel_id = parseInt(req.query.hotel_id);

    if (isNaN(hotel_id)) {
      return res.status(400).send("Invalid hotel ID.");
    }

    const hotel = await regService.getHotelById(hotel_id); // returns hotel details with city_name and area_name
    const city = await regService.getAllCities();        // fetch all cities for dropdown
    const area = await regService.getAllArea();          // fetch all areas for dropdown
    const amenity = await regService.getAllAmenities(); // for checkboxes

    if (!hotel) {
      return res.status(404).send("Hotel not found.");
    }

    res.render("NewUpdateHotel", {hotel,city,area,amenity,msg: ""});

  } catch (err) {
    console.error("Error loading hotel:", err);
    res.send("Failed to load hotel.");
  }
};


exports.deleteHotelCtrl = async (req, res) => {
  const hotel_id = parseInt(req.query.hotel_id);
  console.log("Raw hotel_id:", req.query.hotel_id); // This will show undefined if not passed
  console.log("Parsed hotel_id:", hotel_id);

  if (isNaN(hotel_id)) {
    console.error("Invalid hotel_id:", req.query.hotel_id);
    return res.send("Invalid hotel ID");
  }

  try {
    await regService.deleteHotelLogic(hotel_id);
    res.redirect("/viewHotels");
  } catch (err) {
    console.error("Error deleting hotel:", err);
    res.send("Failed to delete hotel");
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
     const city=await regService.getAllCities();
    res.render("newViewCity",{data:city});
  }
  catch(err){
    console.log("Error deleting city:",err);
    res.send("Failed to delete city");
  }
};


exports.deleteAreaCtrl=async(req,res)=>{
  const area_id=parseInt(req.query.area_id);
  console.log(req.body);
  if(isNaN(area_id)){
    console.log("Inavlid area_id_id:",req.params.area_id);
    return res.send("Invalid area id");
  }
  try{
    await regService.deleteAreaLogic(area_id);
    const areacity=await regService.getCityArea();
    res.render("newViewArea",{data:areacity});
  }
  catch(err){
    console.error("Error deleting area:",err);
    res.send("Failed to delete area");
  }
};


exports.deleteAmenityCtrl=async(req,res)=>{
  const amenity_id=parseInt(req.query.amenity_id);
  console.log(req.body);
  if(isNaN(amenity_id)){
    console.log("Inavlid amenity_id:",req.params.amenity_id);
    return res.send("Invalid amenity id");
  }
  try{
    await regService.deleteAmenityLogic(amenity_id);
    res.redirect("/viewAmenity");
  }
  catch(err){
    console.error("Error deleting amenity:",err);
    res.send("Failed to delete amenity");
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
    console.log("update",city_id);
    if (isNaN(city_id)) {
      return res.send("Invalid city ID.");
    }
    const city = await regService.getCityByIdLogic(city_id);
    console.log(city);
    res.render("NewUpdateCity", {city:city[0], msg: "" });
  } catch (err) {
    console.error("Error loading city for update:", err);
    res.send("Failed to load city.");
  }
};


exports.finalCityUpdate = async (req, res) => {
  try {
    let { city_id, city_name, pincode } = req.body;

    city_id = parseInt(city_id);
    console.log("final",city_id);
    if (isNaN(city_id)) {
      return res.send("Invalid city ID.");
    }



    await regService.updateCityLogic(city_id, city_name, pincode);

    const city = await regService.getAllCities();

    res.render("NewviewCity", { data:city, msg: "✅ City updated successfully!" });

  } catch (err) {
    console.error("Error updating city:", err);
    res.send("Failed to update city.");
  }
};



exports.loadAmenityForUpdate = async (req, res) => {
  try {
    const amenity_id = parseInt(req.query.amenity_id);
    if (isNaN(amenity_id)) {
      return res.send("Invalid amenity ID.");
    }

    const amenity = await regService.getAmenityByIdLogic(amenity_id);
    const amenities = await regService.getAllAmenities();
    if (!amenity) {
      return res.send("Amenity not found.");
    }


    res.render("NewUpdateAmenity", { amenity, msg: "" });
  } catch (err) {
    console.error("Error loading amenity:", err);
    res.send("Failed to load amenity.");
  }
};


exports.finalAmenityUpdate = async (req, res) => {
  try {
    const { amenity_id, amenity_name } = req.body;
    if (!amenity_id || !amenity_name) {
      return res.send("Missing fields");
    }
   
    await regService.updateAmenityLogic(amenity_id, amenity_name);
     const amenities = await regService.getAllAmenities();
    res.render("viewAmenity", { data: amenities, msg: "✅ amenity updated successfully!" });
  } catch (err) {
    console.error("Error updating amenity:", err);
    res.send("❌ Failed to update amenity");
  }
};


exports.loadAreaForUpdate = async (req, res) => {
  try {
    const area_id = parseInt(req.query.area_id);
    if (isNaN(area_id)) {
      return res.send("Invalid area ID.");
    }

    const area = await regService.getAreaByIdLogic(area_id);
    const city = await regService.getAllCities(); // optional: if you want to show city dropdown

    if (!area) {
      return res.send("Area not found.");
    }
    const areacity=await regService.getCityArea();
   // res.json(areacity);
    console.table(areacity);
  
    res.render("NewUpdateArea", { area, city:city, msg: "" });
  } catch (err) {
    console.error("Error loading area:", err);
    res.send("Failed to load area.");
  }
};

exports.finalAreaUpdate = async (req, res) => {
  try {
    const { area_id, area_name, city_id } = req.body;
    if (!area_id || !area_name || !city_id) {
      return res.send("Missing fields");
    }

    await regService.updateAreaLogic(area_id, area_name, city_id);
    const areas = await regService.getAllArea(); // for updated list
     const areacity=await regService.getCityArea();
   // res.json(areacity);
    console.table(areacity);
    console.log("Area updated");
    res.render("viewArea", { data:areacity, msg: "✅ Area updated successfully!" });
  } catch (err) {
    console.error("Error updating area:", err);
    res.send("❌ Failed to update area");
  }
};


exports.finalHotelUpdate = async (req, res) => {
  try {
    let {
      hotel_id, hotel_name, hotel_address,
      city_id, area_id, hotel_email, hotel_contact
    } = req.body;

    hotel_id = parseInt(hotel_id);
    city_id = parseInt(city_id);
    area_id = parseInt(area_id);
    hotel_contact = parseInt(hotel_contact);

    if (isNaN(hotel_id) || isNaN(city_id) || isNaN(area_id)) {
      return res.json({ msg: "Invalid hotel_id, city_id, or area_id" });
    }

    const filename = req.file ? req.file.filename : null;

    const amenity_ids = Array.isArray(req.body.amenity_ids)
      ? req.body.amenity_ids
      : req.body.amenity_ids
        ? [req.body.amenity_ids]
        : [];

    const updatedHotel = await regService.updateHotelLogic(
      hotel_id, hotel_name, hotel_address,
      city_id, area_id, hotel_email, hotel_contact,
      filename, amenity_ids
    );

    if (!updatedHotel) {
      throw new Error("Failed to fetch updated hotel");
    }
    console.log(updatedHotel);
   const hotel = await regService.getHotelById(hotel_id); // returns hotel details with city_name and area_name
    const city = await regService.getAllCities();        // fetch all cities for dropdown
    const area = await regService.getAllArea();          // fetch all areas for dropdown
    const amenity = await regService.getAllAmenities(); 
   // res.json({ msg: "✅ Hotel updated", data: updatedHotel });
    //res.render("NewviewHotel",{data:updatedHotel,msg:"✅ Hotel updated"});
    res.redirect("/viewHotels");
  } catch (err) {
    console.error("❌ Error updating hotel:", err);
    res.json({ msg: "❌ Failed to update hotel", error: err.message });
  }
};



exports.userHoteViewCtrl=(req,res)=>{
  res.render("userHotelView.ejs");
}


exports.logoutAPI = (req, res) => {
  res.clearCookie("token"); // Clear the JWT cookie
  console.log({ message: "Logout successful" });
  res.render("login.ejs",{message:""});
};

exports.roomCtrl=async(req,res)=>{
  try{
    const room=await regService.getAllRooms();
    console.log("Room from db:");
    console.table(room);
    res.json(room);
   // res.render("viewAmenity",{data:amenity});

  }catch(err){
    console.log("Failed to fetch error:",err);
  }
};




exports.addPriceCtrl = async (req, res) => {
  try {
    const hotels = await regService.getAllHotelsForView(); 
    const rooms = await regService.getAllRooms(); 
    const priceroom=await regService.getPriceRoom();
    //res.json(priceroom);
    res.render("viewRoomType", {data:priceroom, hotels,rooms });
  } catch (err) {
    console.error("Error loading price form:", err);
    res.render("viewRoomType", { data:priceroom, hotels,rooms });
  }
};


exports.savePriceCtrl = async (req, res) => {
  try {
    const { hotel_id, room_id, price } = req.body;

    if (!hotel_id || !room_id || !price) {
      return res.send("All fields are required");
    }

    const priceroom=await regService.saveRoomPrice(hotel_id, room_id, price);
    const hotels = await regService.getAllHotelsForView();
    const rooms = await regService.getAllRooms();
    //res.json(priceroom);
    console.table(priceroom);
    res.render("HotelRoom.ejs", { hotels:[], rooms:[], msg: "✅ Price save successfully." });
   
  } catch (err) {
    console.error("Error saving price:", err);
    res.render("HotelRoom.ejs", { hotels:[], rooms:[], msg: "❌ Failed to save price" });
  }
};

exports.roomDashCtrl=(req,res)=>{
  res.render("RoomTypeDash.ejs");
}

exports.savePriceFormCtrl = async (req, res) => {
  try {
    const hotels = await regService.getAllHotelsForView();
    const rooms = await regService.getAllRooms();
    res.render("HotelRoom.ejs", { hotels, rooms, msg: "" });
  } catch (err) {
    console.error("Error loading HotelRoom form:", err);
    res.render("HotelRoom.ejs", { hotels: [], rooms: [], msg: "❌ Failed to load form" });
  }
};



exports.getRoomPriceByHotelCtrl = async (req, res) => {
  try {
    const hotel_id = req.params.hotel_id || req.query.hotel_id;  

    if (!hotel_id) {
      return res.json({ error: "hotel_id is required" });
    }

    const rooms = await regService.getRoomWithPrice(hotel_id);
    res.json(rooms);
    console.table(rooms);
  } catch (err) {
    console.log("Error loading room price :", err);
    res.send("Failed to load data");
  }
};

exports.bookHotelCtrl = async (req, res) => {
  try {
    const hotel_id = parseInt(req.query.hotel_id, 10);
    if (isNaN(hotel_id)) {
      return res.send("Invalid hotel_id");
    }

    
    const user = req.user;
    console.log("req.user =", req.user);

    if (!user) {
      return res.send("Unauthorized: Please log in");
    }

   
    const hotel = await regService.getHotelById(hotel_id);
    if (!hotel) {
      return res.send("Hotel not found");
    }

    const rooms = await regService.getRoomWithPrice(hotel_id);

    
    res.render("bookingForm.ejs", { hotel, user, rooms });
  } catch (err) {
    console.error("Error in bookHotelCtrl:", err);
    res.send("Internal server error");
  }
};


exports.saveBookingFormCtrl = async (req, res) => {
  try {
    const {userid, hotel_id, checkin_date, checkout_date, checkin_time, checkout_time} = req.body;

    if (!userid || isNaN(Number(userid))) {
      return res.send("Invalid or missing userid");
    }

    await regService.saveBooking({ userid: Number(userid),  hotel_id, checkin_date, checkout_date, checkin_time, checkout_time });
    res.redirect("/userdash");
  } catch (err) {
    console.error("Booking insert error:", err);
    alert("❌ Error while booking");
  }
};



/*exports.hotelBoxCtrl = async (req, res) => {
  const city = req.query.city || '';
  const area = req.query.area || '';

  try {
    const data = await regService.searchHotelsByCityAndArea(city, area);
    res.render('HotelBox', { data });
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.send('Internal Server Error');
  }
};
*/

exports.hotelBoxCtrl = async (req, res) => {
  const city = req.query.city || '';
  const area = req.query.area || '';

  try {
    const hotel_id = req.query.hotel_id; 
    const cityarea = await regService.searchHotelsByCityAndArea(city, area);
      const hotel = await regService.getHotelById(hotel_id);
    res.render('HotelBox', { data:cityarea,hotel });
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.send('<p style="color:red;">Internal Server Error</p>');
  }
};

exports.backBtnInSpeHotelCtrl=(req,res)=>{
  res.redirect("/userhotelview");
};


exports.allHotelsCtrl = async (req, res) => {
  try {
    // Query params from URL
    const city = req.query.city ? req.query.city.toLowerCase() : '';
    const area = req.query.area ? req.query.area.toLowerCase() : '';

    // Get all hotels from service
    const allHotels = await regService.getAllHotelsWithImages();

    // Filter hotels based on city and area query params (if provided)
    const filteredHotels = allHotels.filter(hotel => {
      const hotelCity = hotel.city_name ? hotel.city_name.toLowerCase() : '';
      const hotelArea = hotel.area_name ? hotel.area_name.toLowerCase() : '';

      const cityMatch = city === '' || hotelCity.includes(city);
      const areaMatch = area === '' || hotelArea.includes(area);

      return cityMatch && areaMatch;
    });

    // Render EJS template with filtered data
    res.render('HotelBox', { data: filteredHotels });
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).send('<p style="color:red;">Internal Server Error</p>');
  }
};




exports.viewSpecHotelByUserCtrl = async (req, res) => {
  try {
    const hotel_id = req.query.hotel_id; 

    if (!hotel_id) {
      return res.send("Hotel ID is missing");
    }

    const hotel = await regService.getHotelById(hotel_id);

    if (!hotel) {
      return res.send("Hotel not found");
    }

    res.render("specificHotelView.ejs", { hotel });
  } catch (error) {
    console.error("Error fetching specific hotel:", error);
    res.send("Internal Server Error");
  }
};

exports.bookingDetailsCtrl=async(req,res)=>{
  try{
    const hotel = await regService.getAllHotelsForView();
    const user = req.user;
    const booking=await regService.getAllBookingAdmin();
    console.table(booking);
    //res.json(booking);
    res.render("BookingDetailsForAdmin.ejs",{booking});
  }
  catch(err){
    console.log("Error fetching booking:",err);
    //res.send("internal err");
    res.render("BookingDetailsForAdmin.ejs",{booking:[]});
  }
};




exports.bookingHistroryCtrl = async (req, res) => {
  console.log("Inside reviewCtrl");
  const userid = req.user.id; 
  console.log("ueserid:",userid);
  try {
    const booking = await regService.getAllBookingByUserId(userid); 
    //res.json(booking);
    res.render("LoginUserBookingDetails.ejs",{data:userid,booking});
  } catch (err) {
    console.error("Error fetching booking:", err);
    //res.json({ message: "Internal Server Error" });
  }
};


exports.recommendHotelsCtrl = async (req, res) => {
  const userid = req.user.id;
  try {
    const recommendedHotels = await regService.getRecommendedHotels(userid);
    res.render("recommendHotels.ejs", { recommendedHotels });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.reviewFormCtrl = (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized: No user found in request.");
  }

  const userId = req.user.id;
  const hotelId = parseInt(req.query.hotel_id);

  if (!hotelId) {
    console.log("Hotel ID not found in query:", req.query);
    return res.status(400).send("Hotel ID is missing.");
  }

  res.render("ReviewRatingForm.ejs", {
    userId,
    hotelId,
    msg: ''
  });
};


exports.reviewRatingFormCtrl = async (req, res) => {
  try {
    const userid = req.user.id; 
    const { hotel_id, rev_text, rating } = req.body;
    const review_date = new Date();

    await regService.addReview(userid, hotel_id, rev_text, rating, review_date);

    res.render("ReviewRatingForm.ejs", {
      msg: "✅ Review & rating added successfully!",
      userId: userid,
      hotelId: hotel_id
    });
  } catch (err) {
    console.log("Error adding review:", err);
    res.render("ReviewRatingForm.ejs", {
      msg: "❌ Failed to add review.",
      userId: req.user.userid,
      hotelId: req.body.hotel_id
    });
  }
};


exports.recomendationBackBtnCtrl=(req,res)=>{
  res.redirect("/recommendHotels");
};


exports.recommSpecHotelCtrl = async (req, res) => {
  try {
    const hotel_id = req.query.hotel_id; 

    if (!hotel_id) {
      return res.send("Hotel ID is missing");
    }

    const hotel = await regService.getHotelById(hotel_id);

    if (!hotel) {
      return res.send("Hotel not found");
    }

    res.render("recomentadationSpecHotel.ejs", { hotel });
  } catch (error) {
    console.error("Error fetching specific hotel:", error);
    res.send("Internal Server Error");
  }
};

exports.checkInCtrl = async (req, res) => {
  try {
    const userId = req.query.userid;
    const hotelId = req.query.hotel_id;

    console.log('Check-in route hit with:', { userId, hotelId }); // <-- Add this
    if (!hotelId) {
      return res.status(400).send('Hotel ID is required');
    }

    await regService.checkIn(userId, hotelId);
    res.redirect('/bookingDetailsAdmin');
  } catch (e) {
    console.error(e);
    res.status(500).send('Check-in failed.');
  }
};


/*exports.checkOutCtrl = async (req, res) => {
  try {
    const userId = req.query.userid;
    const hotelId = req.query.hotel_id;
    await regService.checkOut(userId, hotelId);
    res.redirect('/bookingDetailsAdmin');
  } catch (e) {
    console.error(e);
    res.status(500).send('Check-out failed.');
  }
};*/


exports.checkOutCtrl = async (req, res) => {
  console.log('🟢 checkOutCtrl reached'); 
  try {
    const userId = req.query.userid;
    const hotelId = req.query.hotel_id;

    console.log('✅ /usercheckout called with:', { userId, hotelId });

    await regService.checkOut(userId, hotelId);

    res.redirect('/bookingDetailsAdmin');
  } catch (e) {
    console.error('❌ checkOutCtrl error:', e);
    res.status(500).send('Check-out failed.');
  }
};



