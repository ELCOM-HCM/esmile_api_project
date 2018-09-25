const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Config = new Schema({
	day: [{
		_id: {type: Number, default: 1},
		name: {type: String, trim: true}
	}],
	time: [{
		_id: {type: Number, default: 1},
		name: {type: String, trim: true},
		code: {type: String, trim: true}
	}],
	device:[{type: String, trim: true}],
	type: [{
		_id: {type: Number, default: 1},
		name: {type: String, trim: true},
		icon: {type: String, trim: true}
	}],
	source: [{
		_id: {type: Number, default: 1},
		name: {type: String, trim: true}
	}],
	tag: [{type: Schema.Types.ObjectId, ref: 'tb_tag'}],
	request_time: {type: Number, default: 30}
});
mongoose.model('tb_config', Config);
module.exports = mongoose.model('tb_config');