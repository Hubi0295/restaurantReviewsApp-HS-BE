const mongoose = require("mongoose");
const { Schema, Types } = mongoose;


const reviewSchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
    restaurant: { type: Types.ObjectId, ref: "Restaurant", required: true },
    date: { type: Date, required: true, default: Date.now },
    review: { type: String, required: true },
    dishes: [{ type: String, required: true }],
    images: [{ type: String, required: true }],
    rating: { type: Number, min: 1, max: 10 }
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = {Review}
