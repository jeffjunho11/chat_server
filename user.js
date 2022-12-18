const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    ip: String,
    time: String,
    data: Object,
});
module.exports = mongoose.model('User', userSchema);