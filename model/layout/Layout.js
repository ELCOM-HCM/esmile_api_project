const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Layout = new Schema({
	_id: {type: Schema.Types.ObjectId, require: true},
	name: {type: String, trim: true},
	url: {type: String, trim: true, default: ""},
	zone:{type: Schema.Types.ObjectId, ref:"tb_zone"},
	status: {type: Boolean, default: true},
	respondent: [{type: Schema.Types.ObjectId, ref: "tb_respondent"}],
	pages: [{type: Schema.Types.ObjectId, ref: "tb_page"}],
	last_update: {type: Date, default: Date.now()},
	modify_by: {type: Schema.Types.ObjectId, ref: 'tb_user'},
	create_by: {type: Schema.Types.ObjectId, ref: 'tb_user'},
	
	description: {type:String, default: ""},
	header: {
		type: {type:String, default: ""},
		value: {type:String, default: ""}
	},
	background: {
		type: {type:String, default: ""},
		value: {type:String, default: ""},
		logo: {type:String, default: ""}
	},
	fonts: {
		font_size: {type:String, default: ""},
		font_style: {type:String, default: ""}
	},
	color: {
		text: {
				heading: {type:String, default: ""},
				option: {type:String, default: ""}
		},
		button: {
			background: {type:String, default: ""},
			color: {type:String, default: ""}
		},
		caption: {
			unselect: {
				background: {type:String, default: ""},
				color: {type:String, default: ""}
			},
			select: {
				background: {type:String, default: ""},
				color: {type:String, default: ""}
			}
		}
	},
	setting: {
		general: {
			isHideButton: {type: Boolean, default: true},
			hideButton: {type: String, default: "None"},
		},
		device: {
			isTimeout: {type: Boolean, default: false},
			timeout: {type: Number, default: 60},
			align: {type: String, default: "center"}
		},
		screen: {
			intro: {type: Boolean, default: false},
			exit: {type: Boolean, default: true},
			timeout: {type: Number, default: 10},
		},
		feedback: {
			min: {type: Number, default: 0},
			max: {type: Number, default: 10},
			positive: {type: Number, default: 10},
			neutral: {type: Number, default: 7},
			negative: {type: Number, default: 5}
		},
		tags: {
			isAutoTag: {type: Boolean, default: true},
		},
		language: {
			option: {type: String, default: "button"},
			button: {type: String, default: "intro"},
			popup: {type: String,  default: "after"},
			default: {
				id: {type: Number, default: 1},
				name: {type: String, default: "English"},
				code: {type: String, default: "en"},
			},
			languages: [
				{
					id: {type: Number, default: 1},
					name: {type: String, default: "English"},
					code: {type: String, default: "en"},
				},
				{
					id: {type: Number, default: 2},
					name: {type: String, default: "Vietnamese"},
					code: {type: String, default: "vn"},
				}
			],
			selected: [
				{
					id: {type: Number, default: 1},
					name: {type: String, default: "English"},
					code: {type: String, default: "en"},
				}
			]
		},
		notification: {
			newResponse: {type: Boolean, default: true},
			badFeedback: {type: Boolean, default: true},
		}
	}
}, {_id: false});
mongoose.model('tb_layout', Layout);
module.exports = mongoose.model('tb_layout');