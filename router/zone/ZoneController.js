const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Zone = require('../../model/zone/Zone');
const Common = require('../../utils/Common');
const Respondent = require('../../model/respondent/Respondent');
const Promise = require('promise');
const mongoose = require('mongoose');  
const moment = require('moment');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * @param req
 * @param res
 * @returns [{ "_id": "2", "name": "Zone 1","csat": "1", ces:5, nps:3}, { "_id": "1", "name": "Zone 2", "csat": "1", ces:5, nps:3}]
 */
router.get('/dashboard/:id', function(req, res){
	// get user id
	let userId = req.params.id;
	// get layout by user id
	let query = Zone.find({member:{$elemMatch:{$eq:mongoose.Types.ObjectId(userId)}}}, '_id name').populate({path:'layout', select:'_id name'}).exec();
	query.then(async result=>{
		let zone = await Promise.all(result.map(async z=>{
			let arrLayoutId = z.layout.map(x=>x._id);
			//logger.info('LAYOUT');
			//logger.info (arrLayoutId);
			let respondent = await Respondent.find({layout: {$in: arrLayoutId}}, 'name type created_on data.type data.page.properties').exec();
			let data = await Common.CXAnalysis(respondent);
			let obj = {
				_id: z._id,
				name: z.name,
				csat: data.csat,
				ces: data.ces,
				nps: data.nps
			}
			//logger.info('DATA');
			//logger.info(obj);
			return obj;
		}));
		//logger.info('ZONE');
		//logger.info(zone);
		res.status(200).send(zone);
	})
	.catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * 
 * CREATE NEW ZONE
 * 
 */
router.post('/',  (req, res)=> {
	let obj = {
			name: req.body.name, 
			image: req.body.image, 
			location:req.body.location.map(x=> {return mongoose.Types.ObjectId(x)}), 
			parent_id: mongoose.Types.ObjectId(req.body._id),
			create_by: mongoose.Types.ObjectId(req.body._id), 
	}
	logger.info(obj);
	let query = Zone.create(obj);
	query.then((zone)=>{
		 logger.info(zone);
	     res.status(200).send({status_code: 200, _id: zone._id, message:"Zone Created"});
	}, (err)=>{
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});
/**
 * ALL THE ZONE IN THE DATABASE BY THIS USER ID
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	let id = mongoose.Types.ObjectId(req.params.id);
	let query = Zone.find({member: {$elemMatch:{$eq: id}}});
	query.populate('layout', ['_id', 'name', 'url']).populate('device', ['_id', 'name']).populate('location', ['_id', 'name']).exec().then((zone)=>{
        if (!zone) {
        	return res.status(404).send({status_code: 404, message: "No Zone Found"});
        }
        res.status(200).send(zone);
    }, (err)=>{
    	logger.error(err);
    	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
    })
});

/**
 * DELETES A ZONE FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/:id', function (req, res) { 
    Zone.findByIdAndRemove(req.params.id, (err, zone)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message:"Internal Server Error"});
        }
        if(!zone){
        	return res.status(404).send({status_code: 404, message: "Zone not exist"});
        }
        res.status(200).send({status_code: 200, message: "Zone "+zone.name+" was delete"});
    });
});

/**
 * UPDATES A SINGLE ZONE IN THE DATABASE 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	let obj = {
		name: req.body.name, 
		image: req.body.image, 
		location:req.body.location.map(x=> {return mongoose.Types.ObjectId(x)}), 
		member: req.body.member.map(x=> {return mongoose.Types.ObjectId(x)}),
		status: req.body.status,
		layout: req.body.layout.map(x=> {return mongoose.Types.ObjectId(x)})
	}
	logger.info(obj);
    Zone.findByIdAndUpdate(req.params.id, obj, {new: true}, (err, zone)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
        }
        res.status(200).send({status_code: 200, message: "Zone Updated Success"});
    });
});


module.exports = router;