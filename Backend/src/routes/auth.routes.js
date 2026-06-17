const express=require('express');
const authController=require("../controllers/auth.controller");
const router=express.Router();
const {verifyUser}=require('../middlewares/auth.middleware');

router.post('/register',authController.register);

router.post('/login',authController.login);

router.post('/logout',verifyUser,authController.logout);

module.exports=router;