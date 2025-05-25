const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const router = express.Router();
const { Restaurant } = require("../models/Restaurant");
const {Review} = require("../models/Review");
const { User } = require("../models/User");
const jwtSecret = process.env.JWT_SECRET;
const multer = require("multer");
const path = require('path');
const storageReview = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/reviews/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadReview = multer({ storage: storageReview });
const storageRestaurant = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/restaurants/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadRestaurant = multer({ storage: storageRestaurant });
router.post("/review", uploadReview.any(), async (req, res) => {
    try{
        const {restaurantName, review, rating, dishes} = req.body;
        const imagesUrl = [];

        const token = req.cookies.token;
        const decoded = jwt.verify(token, jwtSecret);
        const userID = await User.find({_id: decoded._id},{_id:1});
        const restaurantID = await Restaurant.find({name: req.body.restaurantName},{_id:1});


        req.files.forEach(file => {
            imagesUrl.push(file.filename);
        });
        console.log(userID[0]._id)
        console.log(restaurantID[0]._id)
        console.log(restaurantName)
        console.log(review)
        console.log(rating)
        console.log(dishes)
        console.log(imagesUrl);
        const newReview = new Review({
            user: userID[0]._id,
            restaurant: restaurantID[0]._id,
            review,
            dishes,
            images: imagesUrl,
            rating
        });

        await newReview.save();
            res.status(201).json({message:"Dodano recenzje"});
        }
    catch(e){
        console.log(e);
        res.status(500).json({message:"Blad dodawania recenzji"});
    }
});
router.get("/review",async (req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedID = jwt.verify(token,jwtSecret)._id;
        const userID = await User.find({_id:decodedID});
        const reviews = await Review.find({user:userID[0]._id});
        res.status(200).json({data: reviews});
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:"Blad serwera"});
    }

})

router.get("/listRestaurant",async (req,res)=>{
    try{
        const restaurants = await Restaurant.find({},{name:1,_id:0});
        res.status(200).json({ restaurants });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
})

router.post("/restaurant", uploadRestaurant.single("image"), async (req, res) => {
    try {
        const { name, address, description, type, hasDelivery } = req.body;
        const imagePath = req.file ? req.file.filename : null;

        const newRestaurant = new Restaurant({
            name,
            address,
            description,
            type,
            hasDelivery: hasDelivery === "true",
            image: imagePath,
        });
        await newRestaurant.save();
        res.status(201).json({ message: "Restauracja dodana pomyślnie" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

router.get("/restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.status(200).json({ restaurants });
    } catch (err) {
        res.status(500).json({ message: "Błąd serwera" });
    }
});
router.get("/restaurantReview/:id", async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const reviews = await Review.find({ restaurant: restaurantId });
        res.status(200).json({ reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

module.exports = router;
