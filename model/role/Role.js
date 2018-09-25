const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Privilege = new Schema({
	name: {type: String, require: true},
	code: {type: String, require: true}
});
let Role = new Schema({
	name: {type: String, trim: true, require: true},
	privileges:[{type: Schema.Types.ObjectId, ref: 'tb_privilege'}],
});
mongoose.model('tb_privilege', Privilege);
mongoose.model('tb_role', Role);
let privilege = mongoose.model('tb_privilege');
let role = mongoose.model('tb_role');
module.exports = {privilege, role};

