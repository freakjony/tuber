// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var ContainerSchema   = new mongoose.Schema({
  address: String,
  percentageFull: Number // Number from 0 to 100
});

// Export the Mongoose model
module.exports = mongoose.model('Container', ContainerSchema);

