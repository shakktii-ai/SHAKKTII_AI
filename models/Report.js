const mongoose = require('mongoose');

const ReportsSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  collageName: {
    type: String,
    required: true,
  },
  reportAnalysis: {
    type: String,
    required: true,
  },
},{timestamps:true});



module.exports = mongoose.models.Reports || mongoose.model('Reports', ReportsSchema);
