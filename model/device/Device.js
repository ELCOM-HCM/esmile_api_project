const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Device = new Schema({
	name:{type: String, trim: true},
	coordinate: {long:String, lat: String},
	status: {type: Boolean, default: true},
	ip: {type: String, default: "0.0.0.0"},
	mac: {type: String, default: "00-00-00-00-00-00"},
	location_id: {type: Schema.Types.ObjectId, ref: 'tb_location'},
	zone_id: {type: Schema.Types.ObjectId, ref: 'tb_zone'},
	layout_id: {type: Schema.Types.ObjectId, ref: 'tb_layout'},
	last_update: {type: Date, default: Date.now()},
	manage_by: {type: Schema.Types.ObjectId, ref: 'tb_user'},
	info: {
		ram: {type: Number, default: 0},
		ram_used: {type: Number, default: 0},
		cpu_used: {type: Number, default: 0},
		hdd: {type: Number, default: 0},
		hdd_used: {type: Number, default: 0},
		pin: {type: Number, default: 0}
	}
});
mongoose.model('tb_device', Device);
module.exports = mongoose.model('tb_device');