const logger = require('../utils/Logger');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/esmiledb');
const db = mongoose.connection;
db.on('error', (err)=>{
	logger.error(err);
});
db.once('open', ()=>{
  logger.info("Connect Database Success!");
});
module.exports = mongoose;