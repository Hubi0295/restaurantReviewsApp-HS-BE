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

router.delete("/review/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params);
        const result = await Review.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Recenzja nie została znaleziona." });
        }

        res.status(200).json({ message: "Udało się usunąć recenzję." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Nie udało się usunąć recenzji." });
    }
});
router.put("/review",uploadReview.any(), async (req, res) => {
    try {
        console.log(req.body);
        const { restaurantName, review, rating, dishes } = req.body;
        const imagesUrl = [];

        const token = req.cookies.token;
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findOne({ _id: decoded._id }, { _id: 1 });
        const restaurant = await Restaurant.findOne({ name: restaurantName }, { _id: 1 });

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagesUrl.push(file.filename);
            });
        }

        const updateData = {
            user: user._id,
            restaurant: restaurant._id,
            review: review,
            dishes: dishes,
            images: imagesUrl,
            rating: rating
        };
        console.log(updateData)
        await Review.updateOne({ user: user._id }, { $set: updateData });

        res.status(200).json({ message: "Zaaktualizowano recenzję" });
    } catch (e) {
        res.status(500).json({ message: "Nie udało się edytować recenzji" });
    }
});


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
        const user = await User.findOne({_id:decodedID});
        const reviews = await Review.find({user:user._id});
        console.log(reviews);
        const resp = await Promise.all(
            reviews.map(async (x) => {
                const restaurant = await Restaurant.findOne({_id: x.restaurant});
                return {
                    user: user.firstName,
                    restaurant: restaurant.name,
                    review: x.review,
                    dishes: x.dishes,
                    images: x.images,
                    rating: x.rating,
                    date: x.date,
                    id: x._id
                };
            })
        );
        res.status(200).json({ data: resp });

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
        const { name, type, hasDelivery } = req.query;
        const filter = {};

        if (name) {
            filter.name = { $regex: new RegExp(name, "i") }; // case-insensitive
        }
        if (type) {
            filter.type = { $regex: new RegExp(type, "i") };
        }
        if (hasDelivery === "true" || hasDelivery === "false") {
            filter.hasDelivery = hasDelivery === "true";
        }

        const restaurants = await Restaurant.find(filter);
        res.status(200).json({ restaurants });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

router.get("/restaurantReview/:id", async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const reviews = await Review.find({ restaurant: restaurantId });
        const restaurant = await Restaurant.findOne({_id: restaurantId});
        const resp = await Promise.all(
            reviews.map(async (x) => {
                const user = await User.findOne({ _id: x.user });
                return {
                    user: user.firstName,
                    restaurant: restaurant.name,
                    review: x.review,
                    dishes: x.dishes,
                    images: x.images,
                    rating: x.rating,
                    date: x.date,
                    id: x._id
                };
            })
        );
        res.status(200).json({ data: resp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});
router.get("/reviewsForChart", async (req, res) => {
    try {
        const restaurantId = req.query.id;
        const my = req.query.my;
        let response = [];
        let reviews = [];
        if(restaurantId === "none"){
            if(my === "false"){
                reviews = await Review.find({},{rating:1, _id:0, restaurant:1});//wszystkie recenzje wszystkich restauracji dla Home
            }
            else{ //moje recenzja wszystkich resturacji dla myReview
                const token = req.cookies.token;
                const decodedID = jwt.verify(token,jwtSecret)._id;
                const user = await User.findOne({_id:decodedID});
                reviews = await Review.find({user:user._id},{rating:1, restaurant:1, _id:0});
            }
            response = await Promise.all(
                reviews.map(async (x) => {
                    const restaurant = await Restaurant.findOne({ _id: x.restaurant });
                    return {
                        restaurant: restaurant.name,
                        rating: x.rating,
                    };
                })
            );

        }
        else{
            response = await Review.find({ restaurant: restaurantId },{rating:1, _id:0});//Recenzje konkretnej restauracji dla restaurantReview
        }
        res.status(200).json({message: response})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
});
module.exports = router;
