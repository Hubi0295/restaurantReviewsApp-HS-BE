const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const dishSchema = new Schema({
    meal: { type: String, required: true },
    review: { type: String, required: true }
});

const reviewSchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
    restaurant: { type: Types.ObjectId, ref: "Restaurant", required: true },
    date: { type: Date, required: true, default: Date.now },
    review: { type: String, required: true },
    dishes: [dishSchema],
    rating: { type: Number, min: 1, max: 10 }
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = {Review}
