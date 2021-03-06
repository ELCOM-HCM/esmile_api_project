const logger = require(__root + 'utils/Logger');
let mongoose = require('mongoose');  
let Schema = mongoose.Schema;
let Respondent = new Schema({
	name: {type:String, default: "", trim: true},
	type: {type: String, default: ""},
	start_at: {type: Date, default: Date.now},
	stop_at: {type: Date, default: Date.now},
	send_by: {type: String, default: "Unknown"},
	created_on: {type: Date, default: Date.now},
	layout: {type: Schema.Types.ObjectId, ref: "tb_layout"},
	tag:[{type: Schema.Types.ObjectId, ref: "tb_tag"}],
	flag: {type: Boolean, default: false},
	important: {type: Boolean, default: false},
	data:[{
			_id: {type: Schema.Types.ObjectId, ref: "tb_page"},
			name: {type:String, default: "", trim: true},
			type: {type:String, default: "", trim: true},
			page:[
				{
					object_id: {type:String, default: ""},
					object_name: {type:String, default: ""},
					properties:[
						{
							heading_text: {type:String, default: ""},
							mandatory: {type:Boolean, default: false},
							scoring: {type:Boolean, default: true},
							gradient: {type:Boolean, default: false},
							type: {type:String, default: ""},
							columns: [
								{
									id: {type:String, default: ""},
									text: {type:String, default: ""},
									point: {type: Number, default: 0},
									image: {type:String, default: ""},
									display: {type:String, default: ""},
									gradient: {type:Boolean, default: false},
									placeholder: {type:String, default: ""},
									point: {type:Number, default: 0},
									type: {type:String, default: ""},
									background: {type:String, default: ""},
									background_type: {type:String, default: ""},
									font_size: {type:String, default: ""},
									font_style: {type:String, default: ""},
									font_color: {type:String, default: ""},
									selected: {type:Boolean, default: false}
								}
							],
							rows:[
								{
									type: {type:String, default: ""},
									display: {type:String, default: ""},
									image: {type:String, default: ""},
									text: {type:String, default: ""},
									point: {type:Number, default: 0}, // apply for case type = survey
									selected: {type:Boolean, default: false}, // apply for case type = survey
									column_selected: {type:String, default: ""},
									cell: [
										{
											id: {type:String, default: ""},
											text: {type:String, default: ""},
											placeholder: {type:String, default: ""},
											point: {type:Number, default: 0},
											image: {type:String, default: ""},
											gradient: {type:Number, default: false},
											type: {type:String, default: ""},
											display: {type:String, default: ""},
											help_text: {type:String, default: ""},
											selected: {type:Boolean, default: false},
											text_answer: {type:String, default: ""}
										}
									]
								}
							]
						}
					],
					
					logics: {
						next_page: [ ],
						hide: [ ],
						send: [ ]
					}
				}
			],
			widget: {
					logo: {
						status: {type:Boolean, default: true},
						position: {
							x: {type:String, default: "center"},
							y: {type:String, default: "top"}
						},
						width: {type:Number, default: 0},
						height: {type:Number, default: 0},
					},
					image: {
						status: {type:Boolean, default: false},
						position: {
							x: {type:String, default: "left"},
							y: {type:String, default: "top"}
						},
						width: {type:Number, default: 0},
						height: {type:Number, default: 0},
					},
					home: {
						status: {type:Boolean, default: true},
						position: {
							x: {type:String, default: "left"},
							y: {type:String, default: "bottom"}
						},
						text: {type:String, default: ""},
						icon: {type:String, default: "fa fa-home fa-2x"},
					},
					back: {
						status: {type:Boolean, default: true},
						position: {
							x: {type:String, default: "right"},
							y: {type:String, default: "bottom"}
						},
						text: {type:String, default: "Back"},
						icon: {type:String, default: "fa fa-reply fa-2x"},
					},
					send: {
						status: {type:Boolean, default: true},
						position: {
							x: {type:String, default: "center"},
							y: {type:String, default: "bottom"}
						},
						text: {type:String, default: "Send"},
						icon: {type:String, default: "fa fa-paper-plane fa-2x"}
					},
					cancel: {
						status: {type:Boolean, default: true},
						position: {
							x: {type:String, default: "center"},
							y: {type:String, default: "bottom"}
						},
						text: {type:String, default: "Cancel"},
						icon: {type:String, default: "fa fa-time fa-2x"},
					},
					comment: {
						status: {type:Boolean, default: false},
						position: {
							x: {type:String, default: "left"},
							y: {type:String, default: "bottom"}
						},
						text: {type:String, default: "Home"},
						icon: {type:String, default: ""},
					}
			}
		}
	]
	
});
mongoose.model('tb_respondent', Respondent);
module.exports = mongoose.model('tb_respondent');