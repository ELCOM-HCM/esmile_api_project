/**
 * date 23/03/2017
 * @author DangTM
 * 
 */
const Promise = require('promise');
const logger = require('./Logger');
const config = require('../config/Config');
const request = require('request');
const moment = require('moment');
const Common = function(){	
}
/**
 * getDateTime 
 * @return string format: DD/MM/YYYY HH:MM:SS
 */
Common.prototype.getDateTime = function() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec  = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day  = date.getDate();
	day = (day < 10 ? "0" : "") + day;

	return day + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;

}
/**
* get IP address 
* @param req object
* @return IP
*/
Common.prototype.getIPAdress = function(req){
	var ip = req.headers['x-forwarded-for'] ||
	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress || "0.0.0.0";
	return ip.replace("::ffff:", "");
}
/**
 * Analyst CX(Customer Experience) Respondent
 * @return {response: 0, nps: 0, ces: 0, csat: 0}
 * 
 */
/*Common.prototype.customerExperienceAnalysis = async (respondent)=>{
	let sum = {
		response: 0,
		nps:0,
		nps_promoter:0,
		nps_detractor:0,
		nps_response: 0,
		ces: 0,
		ces_response: 0,
		csat: 0,
		date: "",
		taken_by: "",
	};
	respondent = respondent.map(r =>{
		sum.response+=1;
		// get list pages
		r.data = r.data.map(data=>{
			if(data.type === "rating"){
				// get list page per pages 
				data.page = data.page.map(page=>{
					// get list object per page
					page.properties = page.properties.map(props=>{ 
						//get type
						if(props.type === "survey"){
							// [{id:'question id', name: 'question name', type:'question type', option:'', status: true, sum:'', sum_score:'', columns: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'], data: [{id:'', name:'', num:[1,2,3,4,5], score:[1,2,3,4,5]}]}]
							props.rows.filter(row=>{
								logger.info("row.point " + row.point);
								sum.csat+= row.point;
								return row.selected;
							});
						} else if (props.type === "nps"){
							if(props.rows.length > 0) {
								sum.nps_response+=1;
								props.rows = props.rows.map(row=> {
									row.cell = row.cell.find(cell=> {
										if(cell.selected){
											logger.info("cell.point " + cell.point);
											if(cell.point > 8){
												sum.nps_promoter+= cell.point;
											} else if(cell.point < 7){
												sum.nps_detractor+= cell.point;
											}
										}
										return cell.selected;
									});
									return row;
								});
							}
						} else if (props.type === "ces"){
							if(props.rows.length > 0) {
								sum.ces_response +=1;
								props.rows = props.rows.map(row=>{
									row.cell = row.cell.find(cell=> {
										if(cell.selected){
											sum.ces+= cell.point;
										}
										return cell.selected;
									});
									return row;
								});
							}
						} else { // type: icon, smile, choose, score, multiple 
							// rows
							if(props.rows.length > 0) {
								props.rows = props.rows.map(row=>{
									row.cell = row.cell.find(cell=> {
										if(cell.selected){
											sum.csat+=cell.point
										}
										return cell.selected;
									});
									return row;
								});
							}
						}
						return props;
					});
					return page;
				});
			}
			return data.type==="rating"; // get page not intro and exit type
		}); 
		return r;
	});
	let obj = {};
	obj.response = sum.reponse;
	// csat = sum(score except ces nps)/sum(respondent)
	obj.csat = sum.csat/(sum.response==0?1:sum.response);
	// ces = sum(ces)/ sum(respondent contain ces)
	obj.ces = sum.ces/(sum.ces_response==0?1:sum.ces_response);
	// nps = (promoter - detractor)/sum(respondent contain nps)
	obj.nps = (sum.nps_promoter - sum.nps_detractor)/(sum.nps_response==0?1:sum.nps_response);
	return obj;
}*/
Common.prototype.CXAnalysis = async (respondent)=>{
	try {
		let sum = {
				response: 0,
				nps:0,
				nps_promoter:0,
				nps_detractor:0,
				nps_response: 0,
				ces: 0,
				ces_response: 0,
				csat: 0
			};
			let dataAnalysis = [];
			respondent = respondent.map(r =>{
				sum.response+=1;
				let startAt = moment(r.start_at).format('DD-MM-YYYY HH:mm:ss');
				let stopAt= moment(r.stop_at).format('DD-MM-YYYY HH:mm:ss');
				let duration = moment(stopAt).diff(moment(startAt), 'seconds'); // miliseconds default;
				logger.info("logger.info(startAt);");
				logger.info(startAt);
				logger.info(stopAt);
				let tmp = {
					question: 0, 
					answer: 0,
					nps:0,
					nps_promoter:0,
					nps_detractor:0,
					nps_response: 0,
					ces_response: 0,
					ces: 0,
					csat: 0,
					date: "",
					taken_by: "",
					start_at: startAt,
					stop_at: stopAt,
					duration: duration
				};
				tmp.date = moment(r.created_on).format('DD-MM-YYYY HH:mm:ss');
				tmp.taken_by = r.type;
				let result = [];
				// get list pages
				r.data = r.data.map(data=>{
					if(data.type === "rating"){
						logger.info("get page");
						// get page
						data.page = data.page.map(page=>{
							logger.info("get list object per page");
							// get list object per page
							page.properties = page.properties.map(props=>{ 
								tmp.question+=1;
								//get type
								if(props.type === "survey"){
									// columns
									let obj = {};
									obj._id = props._id;
									obj.type = props.type;
									obj.name = props.heading_text;
									obj.data = [];
									obj.column = props.columns.map(col=>{
										return {name: col.text, image: col.image, score: col.point, _id: col._id};
									});
									props.rows.map(row=>{
										if(row.selected){
											logger.info("row.point " + row.point);
											let column = props.columns.find(col=>{
												return col._id.toString() == row.column_selected;
											});
											obj.data.push({
												name: row.text,
												response: 1,
												column_selected: row.column_selected,
												column: column,
												date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), 
												score: row.point
											});
											sum.csat+= row.point;
											tmp.csat+= row.point;
											tmp.answer+=1;
										} else {
											obj.data.push({
												response: 0,
												name: row.text,
												column_selected: row.column_selected,
												date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), 
												score: 0
											});
										}
										return row;//row.selected;
									});
									result.push(obj);
								} else if(props.type === "question"){
									// rows
									logger.info("type=" + props.type);
									if(props.rows.length > 0) {
										let obj = {};
										obj._id = props._id;
										obj.type = props.type;
										obj.name = props.heading_text;
										obj.data = [];
										props.rows = props.rows.map(row=>{
											row.cell = row.cell.find(cell=> {
												if(cell.selected){
													obj.data.push({date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), text: cell.text_answer});
													tmp.answer+=1;
												}
												return cell.selected;
											});
											return row;
										});
										result.push(obj);
									}
								} else if (props.type === "nps"){
									logger.info("props.rows.length " + props.rows.length);
									if(props.rows.length > 0) {
										let obj = {};
										obj._id = props._id;
										obj.type = props.type;
										obj.name = props.heading_text;
										obj.data = [];
										sum.nps_response+=1;
										tmp.nps_response+=1;
										props.rows = props.rows.map(row=> {
											row.cell = row.cell.map(cell=> {
												logger.info("cell.selected " + cell.selected);
												if(cell.selected){
													tmp.answer+=1;
													if(cell.point > 8){
														sum.nps_promoter+= 1;
														tmp.nps_promoter+= 1;
													} else if(cell.point < 7){
														sum.nps_detractor+= 1;
														tmp.nps_detractor+= 1;
														
													}
													obj.data.push({name: cell.text, _id:cell._id, response: 1, date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), score: cell.point});
												} else {
													obj.data.push({name: cell.text, _id:cell._id, response:0, date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), score: 0});
												}
												return cell;//cell.selected;
											});
											return row;
										});
										result.push(obj);
									}
								} else if (props.type === "ces"){
									if(props.rows.length > 0) {
										let obj = {};
										obj._id = props._id;
										obj.type = props.type;
										obj.name = props.heading_text;
										obj.data = [];
										sum.ces_response +=1;
										tmp.ces_response +=1;
										props.rows = props.rows.map(row=>{
											row.cell = row.cell.map(cell=> {
												if(cell.selected){
													sum.ces+= cell.point;
													tmp.ces+= cell.point;
													tmp.answer+=1;
													obj.data.push({name: cell.text , response: 1, _id:cell._id,date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), score: cell.point});
												} else {
													obj.data.push({name: cell.text , response: 0, _id:cell._id,date: moment(r.created_on).format('DD-MM-YYYY HH:mm:ss'), score: 0});
												}
												return cell;//cell.selected;
											});
											return row;
										});
										result.push(obj);
									}
								} else { // type: icon, smile, choose, score, multiple 
									// rows
									if(props.rows.length > 0) {
										let obj = {};
										obj._id = props._id;
										obj.type = props.type;
										obj.name = props.heading_text;
										obj.data = [];
										obj.sum = 0;
										props.rows = props.rows.map(row=>{
											row.cell = row.cell.map(cell=> {
												if(cell.selected) {
													sum.csat+=cell.point;
													tmp.csat+=cell.point;
													tmp.answer+=1;
													obj.data.push({_id: cell._id, response: 1, name_row: row.text, name: cell.text, score: cell.point});
												} else {
													obj.data.push({_id: cell._id, response: 0, name_row: row.text, name: cell.text, score: 0});
												}
												return cell;//cell.selected;
											});
											return row;
										});
										result.push(obj);
									}
								}
								return props;
							});
							return page;
						});
					}
					return data.type==="rating"; // get page not intro and exit type
				}); 
				dataAnalysis.push( {
					_id: r._id,
					question: tmp.question,
					answer: tmp.answer,
					nps_promoter: tmp.nps_promoter,
					nps_detractor:tmp.nps_detractor,
					nps_response: tmp.nps_response,
					ces_response: tmp.ces_response,
					csat: tmp.csat,
					ces: tmp.ces,
					created_on: tmp.date,
					taken_by: tmp.taken_by,
					start_at: startAt,
					stop_at: stopAt,
					duration: duration,
					respondent: result
				})
				return r;
			});
			let obj = {};
			obj.response = sum.response;
			// csat = sum(score except ces nps)/sum(respondent)
			obj.csat = sum.csat/(sum.response==0?1:sum.response);
			// ces = sum(ces)/ sum(respondent contain ces)
			obj.ces = sum.ces/(sum.ces_response==0?1:sum.ces_response);
			// nps = (promoter - detractor)/sum(respondent contain nps)
			obj.nps = (sum.nps_promoter - sum.nps_detractor)/(sum.nps_response==0?1:sum.nps_response);
			return {
				csat: obj.csat.toFixed(2),
				ces: obj.ces.toFixed(2),
				nps: obj.nps.toFixed(2),
				response: obj.response,
				analysis: dataAnalysis
			}
	} catch(err){
		logger.error(err);
		return null;
	}
	
}
Common.prototype.request = function(obj){
	return new Promise((resolve, reject) => {
		request({
					method: obj.method || 'GET', 
					uri: config.host + config.context + obj.url, 
					body: obj.data,
					json: true,
					headers: {
						'Content-Type':'application/json'
					}
				}, 
				(error, res, body) =>{
					if(error || body.status_code != "200"){
						reject(error);
					} else {
						resolve(body);
					}
	    		})
		})
}
/**
 * get time YYYYMMDD.HHMMSS
 */
Common.prototype.getTime = function() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec  = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day  = date.getDate();
	day = (day < 10 ? "0" : "") + day;

	return year + month + day + "." + hour + min + sec;

}
Common.prototype.random = function(){
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
Common.prototype.log = function(message){
	console.log('__________>> DangTM ELCOM logger >>>___', this.getDateTime(), message);
}
module.exports = new Common();