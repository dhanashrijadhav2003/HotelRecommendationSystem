let express = require("express");
let app = express();
let cookieParser = require("cookie-parser");
let cors = require("cors");
let dotenv = require("dotenv");
let db = require("./config/db.js");
let router = require("./routes/routes.js");

// Load env variables at the very top
dotenv.config();

// Enable CORS before routes
app.use(cors());

// Serve static files from "public" and "uploads"
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

// Parse JSON and urlencoded bodies before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies before routes
app.use(cookieParser());

// Set EJS view engine
app.set("view engine", "ejs");

// Use routes AFTER all middleware
app.use("/", router);

module.exports = app;