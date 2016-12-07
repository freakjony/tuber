// Load required packages
var mongoose = require('mongoose');

// Define our Container schema
var ContainerSchema   = new mongoose.Schema({
  containerId: String,
  lat: Number,
  lng: Number,
  address: String,
  percentageFull: Number, // Number from 0 to 100
  timesCleared: {type: Number, default: 0 },
  status: {type: Boolean, default: true }
});

// Export the Mongoose model
module.exports = mongoose.model('Container', ContainerSchema);

