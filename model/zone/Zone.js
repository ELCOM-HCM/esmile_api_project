const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;

//let autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose.connection);
let Zone = new Schema({
	name:{type: String, trim: true},
	location:[{type: Schema.Types.ObjectId, ref: 'tb_location'}],
	device:[{type: Schema.Types.ObjectId, ref: 'tb_device'}],
	layout: [{type: Schema.Types.ObjectId, ref: 'tb_layout'}],
	status: {type: Schema.Types.Boolean, default: true},
	image:{type: String, default:""},
	member: [{type: Schema.Types.ObjectId, ref:'tb_user'}],
	parent_id: {type: Schema.Types.ObjectId, ref:'tb_user'},
	create_by: {type: Schema.Types.ObjectId, ref: 'tb_user'},
	last_update:{type: Date, default: Date.now}
});
//Zone.plugin(autoIncrement.plugin, {
//    model: 'Zone',
////    field: 'zone_id', // change _id -> zone_id
//    startAt: 100
//});
mongoose.model('tb_zone', Zone);
module.exports = mongoose.model('tb_zone');