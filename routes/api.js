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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post("/review", upload.any(), async (req, res) => {
    try {
        const { restaurantName, review, rating } = req.body;
        const uploadedFiles = req.files;
        const dishes = [];
        uploadedFiles.forEach((file) => {
            const indexMatch = file.fieldname.match(/dishes\[(\d+)\]\[image\]/);
            if (indexMatch) {
                const index = indexMatch[1];
                const nameKey = `dishes[${index}][name]`;
                const dishName = req.body[nameKey];  // <-- poprawnie odczytany
                dishes.push({
                    name: dishName,
                    image: file.filename
                });
            }
        });
        console.log("Dishes:", dishes);
        res.status(200).json({ message: "Recenzja zapisana.", dishes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Błąd serwera." });
    }
});

router.get("/listRestaurant",async (req,res)=>{
    try{
        const restaurants = await Restaurant.find({},{name:1,_id:0});
        res.status(200).json({ restaurants });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Błąd serwera" });
    }
})

router.post("/restaurant", upload.single("image"), async (req, res) => {
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
