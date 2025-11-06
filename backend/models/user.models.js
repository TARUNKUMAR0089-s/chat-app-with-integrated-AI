import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,   
    unique: true,
   min: [10, "Email must be at least 10 characters long"],
   max: [50, "Email must not exceed 50 characters"],
  },
  password: {
    type: String,
    required: true,   
    select: false,   
  },
});


userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { email: this.email, id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } 
  );
};

const User = mongoose.model("User", userSchema);
export default User;
