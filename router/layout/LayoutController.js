const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Layout = require('../../model/layout/Layout');
const Zone = require('../../model/zone/Zone');
const Promise = require('promise');
const Page = require('../../model/page/Page');
const mongoose = require('mongoose');  
const moment = require('moment');
const groupArray = require('group-array');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * @param req
 * @param res
 * @returns  [{"_id": "1",  "name": "Layout 1", "responses":[ {"date": "26-12-2017", "num": "1"  }, { "date": "27-12-2017",  "num": "3"  }, {"date": "28/12/2017", "num": "5"  } ]
 */
router.get('/dashboard/:id', function(req, res){
	// initial 1 week
	let dateTo = moment().format('YYYY-MM-DD HH:mm:ss');
	let dateFrom = moment().subtract(7,'d').format('YYYY-MM-DD HH:mm:ss');
	// get user id
	let userId = req.params.id;
	// get layout by user id
	let query = Zone.find({member:{$elemMatch:{$eq:mongoose.Types.ObjectId(userId)}}}, '_id')
				.populate({path:'layout', select:'_id name', populate:{path: 'respondent', match:{created_on:{$gte: dateFrom, $lte: dateTo}}, select:'-_id created_on'}}).exec();
	query.then(result=>{
		let layout = result.map(x=>x.layout);
		let allDate = [];
		// convert [[]]=>[]
		layout = [].concat.apply([], layout); 
		layout = layout.map(x=>{
			let dateArr = [];
			let respondent = x.respondent.map(r=>{
				let obj = {};
				obj.created_on = moment(r.created_on).format('DD-MM-YYYY');
				obj.num = 0;
				if(!dateArr.includes(obj.created_on.toString())){
					dateArr.push(obj.created_on.toString());
				}
				if(!allDate.includes(obj.created_on.toString())){
					allDate.push(obj.created_on.toString());
				}
				return obj;
			});
			let groupDate = groupArray(respondent, "created_on");
			let obj = {};
			obj._id = x._id;
			obj.name = x.name;
			obj.date = dateArr;
			obj.respondent = dateArr.map((d, indx)=>{
				return {
					date: d,
					num: groupDate[d].length
				}
			});
			return obj;
		});
		
		res.status(200).send({dateBetween: allDate, layout: layout});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * GET SEQUENCE NUMBER FOR LAYOUT
 * 
 * @param req
 * @param res
 * @returns
 * 
 */
router.get('/seq', function(req, res){
	let seq = mongoose.Types.ObjectId();
	logger.info('Generate sequence id: ' + seq);
	res.status(200).send({"_id": seq});
});

/**
 * 
 * CREATE NEW LAYOUT
 * 
 */
router.post('/',  function (req, res){
	logger.info("Create New Layout");
	let pages = req.body.pages;
	let pageId = [];
	let layoutId = mongoose.Types.ObjectId(req.body._id);
	let userId = mongoose.Types.ObjectId(req.body.create_by);
	pages = pages.map(x=>{ 
		if(!mongoose.Types.ObjectId.isValid(x._id)){
			x._id = mongoose.Types.ObjectId(); 
		}
		x._id = mongoose.Types.ObjectId(x._id);
		logger.info(x._id);
		pageId.push(x._id);
		return x;
	});
	// find zone by user id
	let query = Zone.findOne({member: {$elemMatch:{$eq: mongoose.Types.ObjectId(req.body.create_by)}}},'_id').exec();
	query.then(z =>{
		let obj = {
			_id: layoutId,
			name: req.body.name,
			pages: pageId,
			zone: z._id,
			url: req.body.url,
			modify_by: userId,
			create_by: userId,
			description: req.body.description,
			header: req.body.header,
			background: req.body.background,
			fonts: req.body.fonts,
			color: req.body.color,
			setting: req.body.setting
		}
		// create layout
		let layout = Layout.create(obj);
		// add pages
		let page = Page.insertMany(pages);
		// push only layout not in layout of zone
		let zone = Zone.findOneAndUpdate({_id: z._id, layout:{$ne:layoutId}},{$push:{layout: layoutId}}, {new: true}).exec();
		Promise.all([layout,page, zone]).then(result=>{
			res.status(200).send({status_code: 200, _id: result[1]._id, message:"Layout Created"});
		}).catch(err=>{
			logger.error(err);
			return res.status(500).send({status_code: 500, message: "Internal Server Error"});
		});
	})
//	 .then((layout)=>{ // add to table pages
//		 logger.info(layout._id);
//		 logger.info("Layout created success");
//		 // create page
//		 return Page.insertMany(pages);
//	 })
//	 .then((page)=>{ 
//		 logger.info(page._id);
//		 logger.info("Page created success");
//		 res.status(200).send({status_code: 200, message:"Layout Created"});
//	 })
	 .catch(err=>{
			logger.error(err);
			return res.status(500).send({status_code: 500, message: "Internal Server Error"});
	 });
});
/**
 * GET ALL LAYOUT BY USER ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/', function (req, res) {  
	// user id
	let userId = mongoose.Types.ObjectId(req.query._id);
	logger.info(req.query._id);
	// get zone by user id
	let query = Zone.findOne({member:{$elemMatch:{$eq: userId}}}, '_id').populate('layout', ['_id', 'url', 'pages', 'last_update', 'name', 'create_by', 'modify_by', 'status']).exec();
	//let query = Layout.find({}, '_id url pages last_update name create_by modify_by status').populate({path: 'zone', match: {member: {$elemMatch:{$eq: id}}}, select: ['name', '_id', 'member']}).exec();
	query.then((zone)=>{
		if(!zone){
			return res.status(404).send({status_code:404, message: "Layout Not Found"});
		}
		 res.status(200).send(zone.layout);
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * GET LAYOUT BY LAYOUT ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	// layout id
	let id = req.params.id;
	let query = Layout.findById(id).populate("pages").exec();
	query.then((layout)=>{
		 if(!layout){
			 return res.status(404).send({status_code:404, message: "Layout Not Found"});
		 }
		 logger.info("GET LAYOUT " + layout.id);
		 res.status(200).send(layout);
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});
/**
 * DELETES A LAYOUT FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/:id', function (req, res) {
    let query = Layout.findById(req.params.id).exec();
    query.then(async (layout)=>{
    	logger.info(layout);
    	// remove page
    	if(!layout){
    		return res.status(404).send({status_code: 404, message: "No Layout Found"});
    	}
    	let pageId = layout.page;
    	let result = await Page.deleteMany({_id:{$in: pageId}});
    	logger.info("Delete Page Success");
    	result = await Layout.findByIdAndRemove(req.params.id);
    	logger.info("Delete Layout Success");
    	res.status(200).send({status_code: 200, message: "Layout " + layout.name + " was deleted"});
    }, (err)=>{
    	logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});

/**
 * UPDATES A SINGLE LAYOUT IN THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	logger.info("UPDATE LAYOUT PAGE ID:");
	logger.info(req.body.pages);
	let pages = req.body.pages;
	pages = pages.map(x=>{ 
		if(!mongoose.Types.ObjectId.isValid(x._id)){
			x._id = mongoose.Types.ObjectId();
		} 
		return x;
	});
	let obj = {
			_id: mongoose.Types.ObjectId(req.body._id),
			name: req.body.name,
			pages: pages.map(x=>{return x._id}),
			url: req.body.url,
			modify_by: mongoose.Types.ObjectId(req.body.create_by),
			description: req.body.description,
			header: req.body.header,
			background: req.body.background,
			fonts: req.body.fonts,
			color: req.body.color,
			setting: req.body.setting
	}
	logger.info(obj);
    let query = Layout.findByIdAndUpdate(req.params.id, obj, {new: true});
    query.then(async (result)=>{
    	logger.info(result);
    	for(let i = 0; i < pages.length; i++){    		
    		await Page.findByIdAndUpdate(pages[i], pages[i], {new: true, upsert: true});
    	}
    	res.status(200).send({message: "Updated Success"});
    }, (err)=>{
    	logger.error(err);
    	res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});


module.exports = router;