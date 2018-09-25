const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Tag = new Schema({
	name: {type: String, trim: true}
});
mongoose.model('tb_tag', Tag);
module.exports = mongoose.model('tb_tag');