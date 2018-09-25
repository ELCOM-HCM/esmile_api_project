const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let User = new Schema({  
	  name: { type:String, trim:true },
	  email: { type:String, trim:true },
	  password: { type:String, trim:true },
	  last_update: {type: Date, default: Date.now},
	  status: {type: Number, default: 1}, // 0: inactive, 1: active, 2: pending..., 3: trial
	  trial: {date: {type: Date, default: Date.now}, num_date: {type: Number, default: 30}},
	  address: String,
	  is_parent: {type: Boolean, default: false},
	  avatar: {type: String, default:""},
	  role: {type: Schema.Types.ObjectId, ref: 'tb_role'},
	  zone: [{type: Schema.Types.ObjectId, ref: 'tb_zone'}],
	  device:[{type: Schema.Types.ObjectId, ref: 'tb_device'}],
	  create_by: {type: String, default: "root"},
	  folder:{type: String, default: mongoose.Types.ObjectId().toString()},
	  parent_id: String,
	  token: String,
	  refreshToken: String,
	  storage: {type: Number, default: 1} // default init 1GB
});
mongoose.model('tb_user', User);
module.exports = mongoose.model('tb_user');