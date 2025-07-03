const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.cookies.token; // read token from cookie
  if (!token) {
    return res.redirect("/login"); // if no token, redirect to login
  }

  try {
    const user = jwt.verify(token, "11$$$66&&&&4444"); // verify token
    req.user = user; // attach user info to req
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.redirect("/login"); // invalid token, redirect to login
  }
}

module.exports = authenticateToken;
