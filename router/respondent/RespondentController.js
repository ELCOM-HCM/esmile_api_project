const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Respondent = require('../../model/respondent/Respondent');
const Zone = require('../../model/zone/Zone');
const Layout = require('../../model/layout/Layout');
const Promise = require('promise');
const mongoose = require('mongoose');  
const moment = require('moment');
const Common = require('../../utils/Common');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


/**
 * 
 * @param req
 * @param res
 * @returns [ { "_id":"", name:"",  "date": "26-12-2017",  "csat":"2", ces:"2", "nps":"5", "taken_by": "web"}]
 */
router.get('/dashboard/:id', function(req, res){
	// get user id
	let userId = req.params.id;
	// get layout by user id
	let query = Zone.find({member:{$elemMatch:{$eq:mongoose.Types.ObjectId(userId)}}}, '_id name').populate({path:'layout', select:'_id name'}).exec();
	query.then(async result=>{
		let layout = result.map(x=>x.layout);
		// convert [[]]=>[]
		layout = [].concat.apply([], layout); 
		logger.info (layout);
		layout = layout.map(x=>x._id);
		logger.info (layout);
		return Respondent.find({layout: {$in: layout}}, 'name type created_on data.type data.page.properties').exec();
	})
	.then(respondent=>{
		let result = [];
		respondent = respondent.map(r =>{
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
				taken_by: ""
			};
			sum.response+=1;
			let today = moment().format("DD-MM-YYYY");
			let created = moment(r.created_on).format('DD-MM-YYYY');
			sum.date = created;
			sum.taken_by = r.type;
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
			let obj = {};
			obj.response = sum.reponse;
			// csat = sum(score except ces nps)/sum(respondent)
			obj.csat = sum.csat/(sum.response==0?1:sum.response);
			// ces = sum(ces)/ sum(respondent contain ces)
			obj.ces = sum.ces/(sum.ces_response==0?1:sum.ces_response);
			// nps = (promoter - detractor)/sum(respondent contain nps)
			obj.nps = (sum.nps_promoter - sum.nps_detractor)/(sum.nps_response==0?1:sum.nps_response);
			obj.date = sum.date;
			obj.taken_by = sum.taken_by;
			
			result.push(obj);
			return r;
		});
		res.status(200).send(result);
	})
	.catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * SAVE RESPONDENT
 * 
 * @author DangTM
 * @date 20/08/2018
 * @param req
 * @param res
 * @returns
 * 
 */
router.post('/:id',  function (req, res){
	let layoutId = mongoose.Types.ObjectId(req.params.id);
	let pages = [];
	let selected = [];
	let answer = [];
	let respondentId = "";
	let survey = [];
	logger.info(req.body);
	req.body.data.map((x) =>{ 
		selected.push(x.page.map(y=>y));
		answer.push(x.answer.map((y)=>{
			return y;
		}));
		if(x.survey != undefined){
			survey.push(x.survey.map(y=>y))
		}
		pages.push(x._id);
		return x._id;
	});
	// convert [[]] => []
	selected = [].concat.apply([], selected); 
	logger.info('ID PAGE');
	logger.info(pages);
	logger.info('ID SELECTED');
	logger.info(selected);
	// convert [[]] => []
	answer = [].concat.apply([], answer); 
	logger.info('ANSWER LIST');
	logger.info(answer);
	// convert [[]] => []
	survey = [].concat.apply([], survey); 
	logger.info('SURVEY LIST');
	logger.info(survey);
	// get pages by layout id
	let query = Layout.findById(layoutId).populate("pages", ['_id', 'type', 'page']).exec();
	query.then((layout)=>{
		 logger.info('SELECT LAYOUT ID = ' + layout._id);
		 if(!layout){
			 return res.status(404).send({status_code:404, message: "Layout Not Found"});
		 }
		 let obj = {
				name: "Respondent_"+ layoutId,
				type: req.body.type,
				start_at: moment(req.body.start_at, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
				stop_at: moment(req.body.stop_at, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
				send_by: req.body.send_by,
				layout: layoutId,
				data: layout.pages,
				tag: []//req.body.tag
		 }

		 // find page by id
		 let pageTmp = layout.pages.map(p=>{
			 if(pages.includes(p._id.toString())){ // select pages
				 p.page = p.page.map(m=>{ // select page
					 m.properties = m.properties.map(props=>{ // select properties
						 //logger.info("props.columns.length " +  props.columns.length);
						 if(props.columns.length > 0){
							 props.columns = props.columns.map(col=>{ // select columns
								 //logger.info("selected.includdes(col._id) " + selected.includes(col._id.toString()));
								 if(selected.includes(col._id.toString())){
									 //logger.info(col._id);
									 //logger.info('true');
									 col.selected = true;
								 }
								 return col; // columns
							 })
						 }
						 //logger.info("props.rows.length " +  props.rows.length);
						 if(props.rows.length > 0){ // select rows
							 props.rows = props.rows.map(row=>{
								 if(row.type == 'survey'){ 
									 survey.map(s=>{
										 if(s.row_id == row._id.toString()){
											 row.selected = true;
											 row.column_selected = s.column_id;
											 // get point
											 row.point = props.columns.find(col=>col._id.toString() === s.column_id).point;
											 logger.info("ROW INFO");
											 logger.info(row);
										 }
										 return s;
									 })
								 }
								 if(row.cell.length > 0){
									 row.cell = row.cell.map(cell =>{// select cell
										 //logger.info("selected.includes(cell._id) " + selected.includes(cell._id.toString()));
										 if(selected.includes(cell._id.toString())){
											 //logger.info(cell._id);
											 //logger.info('true');
											 cell.selected = true;
										 }
										 if(row.type == "question"){ // type question update answer 
											 answer.map(aws=>{
												 if(aws._id == cell._id.toString()){
													 cell.text_answer = aws.text;
												 }
												 return aws; // answer
											 });
										 }
										 
										 return cell; // cell
									 });
								 }
								 return row; // row
							 });
						 }
						 return props // properties
					 })
					 return m; // page
				 });
			 }
			 return p; // pages
		 })
		 // create respondent
		 obj.data = pageTmp;
		 return Respondent.create(obj);
	})
	.then((respondent)=>{
		logger.info({status_code: 200, _id: respondent._id, message:"Respondent Created"});
		// update respondent to layout
		Layout.findOneAndUpdate({_id:layoutId, respondent:{$ne: respondent._id}}, {$push: {respondent: respondent._id}}).exec();
		res.status(200).send({status_code: 200, _id: respondent._id, message:"Respondent Created"});
	})
	/*.then(async (respondent)=>{
		 respondentId = respondent._id;
		 logger.info(respondentId + " Respondent created success");
		 // add respondent to layout
		 await Layout.findByIdAndUpdate(layoutId, {$push:{respondent: respondentId}});
		 // update columns
		 logger.info({
			 	_id: respondentId, 
			 	'data._id':{in: pages}, 
			 	'data.page.properties.columns.0':{exists: true},
			 	'data.page.properties.columns._id': {in:selected}
			 });
		 return Respondent.update({
			 	_id: respondentId, 
			 	'data._id':{$in: pages}, 
			 	'data.page.properties.columns.0':{$exists: true},
			 	'data.page.properties.columns._id': {$in:selected}
			 }, {$set: {'data.page.properties.columns.selected': true}}).exec();
	 })
	 .then((respondent)=>{
		 logger.info({
			 _id: respondentId, 
			 'data._id':{$in: pages}, 
			 'data.page.properties.rows.0':{$exists: true},
		 	 'data.page.properties.rows.cell.0':{$exists: true},
			 'data.page.properties.rows.cell._id': {$in:selected}
		 });
		 // update rows
		 return Respondent.update({
			 _id: respondentId, 
			 'data._id':{$in: pages}, 
			 'data.page.properties.rows.0':{$exists: true},
		 	 'data.page.properties.rows.cell.0':{$exists: true},
			 'data.page.properties.rows.cell._id': {$in:selected}
		 }, {$set: {'data.page.properties.rows.cell.selected': true}}).exec();
	 })
	 .then((respondent)=>{
		 logger.info(respondent);
//		 res.status(200).send({status_code: 200, _id: respondentId, message:"Respondent Created"});
		 // update text answer
		 let updates = answer.map(async (x)=>{
		    return await Respondent.update({
		    	_id: respondentId, 
		    	'data._id':{$in: pages}, 
		    	'data.page.properties.rows.0':{$exists: true},
		    	'data.page.properties.rows.cell.0':{$exists: true},
		    	'data.page.properties.rows.cell._id': x._id
		    }, {$set: {"data.page.properties.rows.cell.text_answer": x.text}}).exec();       
		 });
		 Promise.all(updates).then((respondent)=>{
		    logger.info({status_code: 200, _id: respondentId, message:"Respondent Created"});
		    logger.info('Updated Text Answer');
			res.status(200).send({status_code: 200, _id: respondentId, message:"Respondent Created"});
		});
	 })*/
	 .catch(err=>{
		 logger.error(err);
		 res.status(500).send({status_code: 500, message: "Internal Server Error"});
	 });
});
/**
 * GET ALL RESPONDENT BY USER ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/', function (req, res) {
	logger.info(req.query);
	// user id
	let id = mongoose.Types.ObjectId(req.query._id);
	let dateFrom = moment(req.query.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
	let dateTo = moment(req.query.date_to + " 23:59:59", 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
	logger.info('date_from:' + dateFrom + ' date_to:' + dateTo);
	// get zone by user id
	let query = Zone.find({member: {$elemMatch:{$eq: id}}});
	let layoutIds = [];
	query.populate('layout', ['_id']).exec().then((zone)=>{
		if(!zone){
			return res.status(404).send({status_code:404, message: "Layout Not Found"});
		}
		// get layout id
		layoutIds = zone.map(x=>x.layout);
		layoutIds = [].concat.apply([], layoutIds);
		logger.info("Layout List " + layoutIds);
		// get respondent by layout id
//		return Respondent.find({layout: {$in: layoutIds}}).populate({path: 'layout', match: {modify_by: {$elemMatch:{$eq: id}}}, select: ['name', '_id', 'zone']}).exec();
		return Respondent.find({
			layout: {$in: layoutIds}, 
			created_on: {$gte: dateFrom, $lte: dateTo}}).populate('layout', ['name', '_id', 'zone']).populate('tag', ['name', '_id']).exec();
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
	.then((respondent)=>{
		if(!respondent){
			return res.status(404).send({status_code:404, message: "Respondent Not Found"});
		}
		let arrObj = respondent.map(x=>{
			// count score
			let score = 0;
			let startAt = moment(x.start_at).format('DD-MM-YYYY HH:mm:ss');
			let stopAt= moment(x.stop_at).format('DD-MM-YYYY HH:mm:ss');
			// years, months, weeks, days, hours, minutes, and seconds
			let duration = moment(stopAt).diff(moment(startAt), 'seconds'); // miliseconds default;
			return {
				_id: x._id,
				name: x.name,
				type: x.type,
				start_at: startAt,
				stop_at: stopAt,
				duration: duration + ' seconds',
				send_by: x.send_by,
				created_on: moment(x.created_on).format('DD-MM-YYYY HH:mm:ss'),
				layout: x.layout,
				tag: x.tag,
				flag: x.flag,
				important: x.important,
				score: score
			}
		});
		res.status(200).send(arrObj);
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * GET RESPONDENT BY RESPONDENT ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	// layout id
	let id = req.params.id;
	logger.info(id);
	let query = Respondent.findById(id).populate({path:'layout', select: ['name', '_id'], populate:{path:'zone', select:['name', '_id']} }).exec();
	query.then((respondent)=>{
		 if(!respondent){
			 logger.error(err);
			 return res.status(404).send({status_code:404, message: "Respondent Not Found"});
		 }
		 // count score
		 let score = 0;
		 let startAt = moment(respondent.start_at).format('DD-MM-YYYY HH:mm:ss');
		 let stopAt= moment(respondent.stop_at).format('DD-MM-YYYY HH:mm:ss');
	     // years, months, weeks, days, hours, minutes, and seconds
		 let duration = moment(stopAt).diff(moment(startAt), 'seconds'); // miliseconds default;
		 let obj =  {
				_id: respondent._id,
				name: respondent.name,
				type: respondent.type,
				start_at: startAt,
				stop_at: stopAt,
				duration: duration + ' seconds',
				send_by: respondent.send_by,
				created_on: moment(respondent.created_on).format('DD-MM-YYYY HH:mm:ss'),
				layout: respondent.layout,
				tag: respondent.tag,
				flag: respondent.flag,
				important: respondent.important,
				score: score,
				data: respondent.data.filter(x=>x.type ==='rating')
			}
		 res.status(200).send(obj);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});
/**
 * DELETES A RESPONDENT FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/:id', function (req, res) {
	let id = req.params.id;
    let query = Respondent.findById(id).exec();
    query.then(async (respondent)=>{
    	logger.info(respondent);
    	// remove page
    	if(!respondent){
    		return res.status(404).send({status_code: 404, message: "No Respondent Found"});
    	}
    	// delete respondent from layout
    	logger.info("Delete Respondent Id " + id + " In Layout");
    	let result = await Layout.findByIdAndUpdate(respondent._id, { $pull: { respondent:  id } });
    	logger.info("Delete Success");
    	result = await Respondent.findByIdAndRemove(id);
    	logger.info("Delete Respodent Success");
    	res.status(200).send({status_code: 200, message: "Respondent " + respondent.name + " was deleted"});
    }, (err)=>{
    	logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});

/**
 * DELETES LIST RESPONDENT FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/', function (req, res) {
	// array id
	let id = req.body._id.map(x=> mongoose.Types.ObjectId(x));
    let query = Respondent.find({
    	_id: {$in: id}
    }).exec();
    query.then(async (respondent)=>{
    	logger.info(respondent);
    	// remove page
    	if(!respondent){
    		return res.status(404).send({status_code: 404, message: "No Respondent Found"});
    	}
    	// delete respondent from layout
    	logger.info("Delete Respondent Id " + id + " In Layout");
    	let result = await Layout.findByIdAndUpdate(respondent._id, { $pullAll: { respondent:  id } });
    	logger.info("Delete Success");
    	result = await Respondent.deleteMany({_id:{$in: id}});
    	logger.info("Delete Respodent Success");
    	res.status(200).send({status_code: 200, message: "Respondent " + id + " was deleted"});
    }, (err)=>{
    	logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});
/**
 * UPDATES
 * 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	logger.info(req.body);
	let tag = req.body.tag.map(x=>mongoose.Types.ObjectId(x));
	let obj = {
			name: req.body.name,
			tag:tag,
			important: req.body.important,
			flag: req.body.flag
	}
	logger.info(obj);
    let query = Respondent.findByIdAndUpdate(req.params.id, {$set: obj}, {new: true});
    query.then((result)=>{
    	logger.info(result);
    	res.status(200).send({status_code: 200, message: "Updated Success"});
    }, (err)=>{
    	logger.error(err);
    	res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});

module.exports = router;