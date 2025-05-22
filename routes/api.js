const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {json} = require("express");
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

router.post("/review",(req,res)=>{
    console.log(req.body)
    res.status(200)
    res.json({message:"Dodano pomyslnie recenzje"})
})
router.post("/restaurant",(req,res)=>{
    console.log(req.body)
    res.status(200)
    res.json({message:"Dodano pomyslnie recenzje"})
})


module.exports = router;