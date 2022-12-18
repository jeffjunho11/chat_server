const mongoose = require('mongoose');
module.exports = () => {
  function connect() {
    mongoose.connect('mongodb+srv://jeffjunho11:<password>@cluster0.icypy3l.mongodb.net/?retryWrites=true&w=majority', function(err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }
  connect();
  mongoose.connection.on('disconnected', connect);
  require('./user.js');
};