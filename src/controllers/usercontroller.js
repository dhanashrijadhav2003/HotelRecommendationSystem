let bcrypt=require("bcryptjs");

exports.homeCtrl=(req,res)=>{
    res.send("Welcome in  Home Page..");
}

exports.regCtrl=(req,res)=>{

    let{userid,username,useremail,password,contact}=req.body;
    let hashedPassword=bcrypt.hashSync(password,8);
    console.log(hashedPassword);

    res.send("registration page.");
}