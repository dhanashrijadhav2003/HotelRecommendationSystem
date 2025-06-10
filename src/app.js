let express=require("express");
let app=express();
let cookieParser=require("cookie-parser");
let cors=require("cors");
let dotenv=require("dotenv");
let bodyParser=require("body-parser");
let db=require("./config/db.js");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(cookieParser());

dotenv.config();
module.exports=app;