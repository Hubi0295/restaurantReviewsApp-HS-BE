const mongoose = require("mongoose")
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    hasDelivery: { type: Boolean, required: true },
    image: String
})
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = {Restaurant};
