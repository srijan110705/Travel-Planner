const express=require('express');
const tripController=require("../controllers/trip.controller");
const router=express.Router();
const {verifyUser}=require('../middlewares/auth.middleware');

router.post('/create_trip',verifyUser,tripController.create);

router.post('/login_trip',verifyUser,tripController.access);

router.post('/add_destination', verifyUser, tripController.addDestination);

router.post('/remove_destination', verifyUser, tripController.removeDestination);

router.post('/add_expense', verifyUser, tripController.addExpense);

router.get('/my_trips', verifyUser, tripController.getMyTrips);

module.exports=router;