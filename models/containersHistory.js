// Load required packages
var mongoose = require('mongoose');

// Define our Container schema
var ContainersHistorySchema   = new mongoose.Schema({
  containerId: String,
  date: { type: Date, default: Date.now}
});

// Export the Mongoose model
module.exports = mongoose.model('ContainersHistory', ContainersHistorySchema);