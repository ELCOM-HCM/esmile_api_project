const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Location = require('../../model/location/Location');
const Zone = require('../../model/zone/Zone');
const Promise = require('promise');
const mongoose = require('mongoose');  

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


/**
 * 
 * CREATE NEW LOCATION
 * 
 */
router.post('/',  (req, res)=> {
	let obj = {
         name: req.body.name,
         image: req.body.image,
         address: req.body.address,
         zone: mongoose.Types.ObjectId(req.body.zone_id),
         device: req.body.device.map(x=>mongoose.Types.ObjectId(x))
	 }
	logger.info("INPUT");
	logger.info(req.body);
	let query = Location.create(obj);
	query.then((location)=>{
		 logger.info(location);
	     res.status(200).send({status_code: 200, _id: location._id, message:"Location created"});
	}, (err)=>{
		logger.info(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});
/**
 * ALL THE LOCATION BY USER ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	// user id
	let id = req.params.id; 
	// find Zone by User ID
	let query = Zone.find({member: {$elemMatch:{$eq: id}}}).exec();
	query.then((zone)=>{
		if (!zone) {
        	return res.status(404).send({status_code: 404, message: "No Zone Found"});
        }
		logger.info(zone._id);
		let zoneIds = zone.map(x=>{return (x._id)});
		// location = [].concat.apply([], location);[[]] => []
		// get location by zone id
		logger.info(zoneIds);
		return Location.find({zone: {$in: zoneIds}}).populate('device',['_id', 'name']).populate('zone', ['_id', 'name']).exec();
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	}).then((location)=>{
		if(!location){
			return res.status(404).send({status_code: 404, message: "No Location Found"});
		}
		res.status(200).send(location);
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
});
/**
 * DELETES A LOCATION FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/:id', function (req, res) {
    Location.findByIdAndRemove(req.params.id, (err, loc)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message:"Internal Server Error"});
        }
        if(!loc){
        	return res.status(404).send({status_code: 404, message: "Location not exist"});
        }
        res.status(200).send({status_code: 200, message: "Location "+loc.name+" was delete"});
    });
});

/**
 * UPDATES A SINGLE LOCATION IN THE DATABASE 
 * 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	let obj = {
	         name: req.body.name,
	         image: req.body.image,
	         address: req.body.address,
	         zone: req.body.zone_id != ""?mongoose.Types.ObjectId(req.body.zone_id):"",
	         //status: req.body.status,
	         device:  req.body.device.map(x=>{return mongoose.Types.ObjectId(x)})
	}
    Location.findByIdAndUpdate(req.params.id, obj, {new: true}, (err, loc)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
        }
        res.status(200).send({status_code: 200, message: "Location Updated Success"});
    });
});


module.exports = router;