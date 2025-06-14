let express=require("express");
let app=express();
let cookieParser=require("cookie-parser");
let cors=require("cors");
let dotenv=require("dotenv");
let bodyParser=require("body-parser");
let db=require("./config/db.js");
let router=require("./routes/routes.js");
let hotelRoutes=require("./routes/hotel.routes");

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use("/",router);

app.use(cors());
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(cookieParser());

app.use("/api",hotelRoutes);


dotenv.config();
module.exports=app;