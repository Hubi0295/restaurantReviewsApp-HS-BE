const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const router = express.Router();
const { Restaurant } = require("../models/Restaurant");
const {Review} = require("../models/Review");
const { User } = require("../models/User");
const jwtSecret = process.env.JWT_SECRET;
const multer = require("multer");
const path = require('path');
const { createClient } = require("@supabase/supabase-js");
const {v4: uuidv4} = require("uuid");
const upload = multer({ storage: multer.memoryStorage() });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);



router.delete("/review/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const findRev = await Review.findOne({_id:id});
        const fileNames = findRev.images.map(url => url.split('/').pop());
        const { data, error } = await supabase.storage
        .from("pictures")
        .remove(fileNames);
        console.log(error);
        console.log(fileNames);

        if (error) {
            return res.status(404).json({ message: "Recenzja nie została znaleziona." });
        } else {
        }

        const result = await Review.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Recenzja nie została znaleziona." });
        }
        res.status(200).json({ message: "Udało się usunąć recenzję." });
    } catch (e) {
        res.status(500).json({ message: "Nie udało się usunąć recenzji." });
    }
});
router.put("/review",upload.array("images"),
    [
        body("restaurantName").isString().notEmpty().withMessage("Nazwa restauracji jest wymagana."),
        body("review").isString().notEmpty().withMessage("Treść recenzji jest wymagana."),
        body("rating").isFloat({ min: 1, max: 10 }).withMessage("Ocena musi być liczbą od 1 do 10."),
        body("dishes").isArray({ min: 1 }).withMessage("Wymagana jest lista dań."),
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        const { restaurantName, review, rating, dishes, reviewId } = req.body;
        const imagesUrl = [];

        const token = req.cookies.token;
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findOne({ _id: decoded._id }, { _id: 1 });
        const restaurant = await Restaurant.findOne({ name: restaurantName }, { _id: 1 });

        const findRev = await Review.findOne({_id:reviewId});
        const fileNames = findRev.images.map(url => url.split('/').pop());
        const { data, error } = await supabase.storage
        .from("pictures")
        .remove(fileNames);
        console.log(error);
        console.log(fileNames);

        for (const file of req.files) {
            const fileName = `${uuidv4()}-${file.originalname}`;
            const { error } = await supabase.storage
            .from("pictures")
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            });
            if (error) throw error;

            const { data } = supabase.storage
            .from("pictures")
            .getPublicUrl(fileName);

            imagesUrl.push(data.publicUrl);
        }

        const updateData = {
            user: user._id,
            restaurant: restaurant._id,
            review: review,
            dishes: dishes,
            images: imagesUrl,
            rating: rating
        };
        await Review.updateOne({ _id: reviewId }, { $set: updateData });

        res.status(200).json({ message: "Zaaktualizowano recenzję" });
    } catch (e) {
        res.status(500).json({ message: "Nie udało się edytować recenzji" });
    }
});


router.post("/review", upload.array("images"),
    [
        body("restaurantName").isString().notEmpty().withMessage("Nazwa restauracji jest wymagana."),
        body("review").isString().notEmpty().withMessage("Treść recenzji jest wymagana."),
        body("rating").isFloat({ min: 1, max: 10 }).withMessage("Ocena musi być liczbą od 1 do 10."),
        body("dishes").isArray({ min: 1 }).withMessage("Wymagana jest lista dań."),
    ],
    async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        const { restaurantName, review, rating, dishes  } = req.body;
        const imagesUrl = [];

        const token = req.cookies.token;
        const decoded = jwt.verify(token, jwtSecret);
        const userID = await User.find({_id: decoded._id},{_id:1});
        const restaurantID = await Restaurant.find({name: req.body.restaurantName},{_id:1});


        for (const file of req.files) {
            const fileName = `${uuidv4()}-${file.originalname}`;
            const { error } = await supabase.storage
            .from("pictures")
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            });
            if (error) throw error;

            const { data } = supabase.storage
            .from("pictures")
            .getPublicUrl(fileName);

            imagesUrl.push(data.publicUrl);
        }

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
        res.status(500).json({message:"Blad dodawania recenzji"});
    }
});
router.get("/review",async (req,res)=>{
    try{
        const token = req.cookies.token;
        const decodedID = jwt.verify(token,jwtSecret)._id;
        const user = await User.findOne({_id:decodedID});
        const reviews = await Review.find({user:user._id});
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
        res.status(500).json({message:"Blad serwera"});
    }

})

router.get("/listRestaurant",async (req,res)=>{
    try{
        const restaurants = await Restaurant.find({},{name:1,_id:0});
        res.status(200).json({ restaurants });
    } catch (err) {
        res.status(500).json({ message: "Błąd serwera" });
    }
})

router.post("/restaurant", upload.single("image"),
  [
    body("name").isString().notEmpty().withMessage("Nazwa jest wymagana."),
    body("address").isString().notEmpty().withMessage("Adres jest wymagany."),
    body("description").isString().notEmpty().withMessage("Opis jest wymagany."),
    body("type").isString().notEmpty().withMessage("Typ kuchni jest wymagany."),
    body("hasDelivery").isBoolean().withMessage("Pole hasDelivery musi być typu boolean."),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, address, description, type, hasDelivery } = req.body;

      if (!req.file) return res.status(400).json({ message: "Brak przesłanego pliku" });

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const { error } = await supabase.storage
        .from("pictures")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) throw error;

      const { data } = supabase.storage.from("pictures").getPublicUrl(fileName);

      const newRestaurant = new Restaurant({
        name,
        address,
        description,
        type,
        hasDelivery: hasDelivery === "true",
        image: data.publicUrl,
      });
      await newRestaurant.save();

      res.status(201).json({ message: "Restauracja dodana pomyślnie" });
    } catch (err) {
      res.status(500).json({ message: "Błąd serwera" });
    }
  }
);


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
        res.status(500).json({ message: "Błąd serwera" });
    }
});
module.exports = router;
