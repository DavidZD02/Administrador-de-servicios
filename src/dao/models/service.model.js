import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, required: true },
});

const Service =
  mongoose.models.services|| mongoose.model("services", serviceSchema);

export default Service;
