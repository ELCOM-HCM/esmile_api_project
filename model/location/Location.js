const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Location = new Schema({
	name: {type: String, trim: true},
	image: String,
	device: [{type: Schema.Types.ObjectId, ref: 'tb_device'}],
	zone: {type: Schema.Types.ObjectId, ref: 'tb_zone'},
	address: {type: String, default:"162/12 Bình Lợi"},
	status: {type: Boolean, default: true},
	last_update: {type: Date, default: Date.now()},
});
mongoose.model('tb_location', Location);
module.exports = mongoose.model('tb_location');