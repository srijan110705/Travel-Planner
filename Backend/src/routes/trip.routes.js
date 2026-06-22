const express=require('express');
const tripController=require("../controllers/trip.controller");
const router=express.Router();
const {verifyUser}=require('../middlewares/auth.middleware');
const {verifyTrip}=require('../middlewares/trip.middleware');

router.post('/create_trip',verifyUser,tripController.create);

router.post('/login_trip',verifyUser,tripController.access);

router.post('/logout_trip',verifyUser,verifyTrip,tripController.logout);

router.post('/add_destination', verifyUser, verifyTrip, tripController.addDestination);

router.post('/add_expense', verifyUser,verifyTrip, tripController.addExpense);

router.get('/my_trips', verifyUser, tripController.getMyTrips);

router.post('/optimize_route', verifyUser, verifyTrip, tripController.getOptimalRoute);

module.exports=router;