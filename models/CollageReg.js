const mongoose = require('mongoose');

const CollageRegSchema = new mongoose.Schema({
  collageName: {type :String , required:true },
  address: {type :String , required:true },
  contactPersonName: {type :String , required:true },
  email: {type :String , required:true, unique:true },
  designation: {type :String , required:true },
  contactNumber : {type :String , required:true},
  department: {type :String , required:true },
  website: {type :String  },
  socialMediaLinks: {type :String  },
  password: {type:String , required:true },
  profileImg: {type:String  },
  
    
    
  },{timestamps:true});


  export default mongoose.models.CollageReg ||mongoose.model("CollageReg",CollageRegSchema);

