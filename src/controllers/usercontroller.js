let bcrypt=require("bcryptjs");

exports.homeCtrl=(req,res)=>{
    res.render("home.ejs");
}

exports.regCtrl=(req,res)=>{
    res.send("registration page.");
}


exports.saveReg=(req,res)=>{
    let{userid,username,useremail,password,contact}=req.body;
    let hashedPassword=bcrypt.hashSync(password,8);
    console.log(hashedPassword);
}