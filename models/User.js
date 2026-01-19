// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     fullName: {type :String , required:true },
//     email: {type :String , required:true, unique:true },
//     DOB: {type :String , required:true },
//     address: {type :String , required:true},
//     mobileNo: {type :String , required:true, unique:true },
//     education: {type :String , required:true },
//     collageName: {type :String , required:true },
//     password: {type:String , required:true },
//     profileImg: {type:String },
//     resetToken: { type: String },
//     resetTokenExpiry: { type: Date },
//     no_of_interviews: {type :Number , required:true, default:1 },
//     no_of_interviews_completed: {type :Number , required:true, default:0 },
    
//   },{timestamps:true});


//   export default mongoose.models.User ||mongoose.model("User",UserSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, sparse: true,unique:true },
    DOB: { type: String, default: "" },
    address: { type: String, default: "" },
    mobileNo: { type: String, default: "" ,unique:true},
    education: { type: String, default: "" },
    collageName: { type: String, default: "" },
    password: { type: String, default: "" },
    profileImg: { type: String, default: "" },
    no_of_interviews: { type: Number, default: 0 },
    no_of_interviews_completed: { type: Number, default: 0 },
    permanentLoginToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

mongoose.models = {};

export default mongoose.model("User", UserSchema);
