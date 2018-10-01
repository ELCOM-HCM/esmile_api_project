const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Device = require('../../model/device/Device');
const Promise = require('promise');
const Config = require('../../model/config/Config');
const User = require('../../model/user/User');
const mongoose = require('mongoose');  
const moment = require('moment');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * @param req
 * @param res
 * @returns  [ {"_id": "1","name": "KIOS 1","ip": "172.16.9.59", "mac":"", "layout": "Layout Name", zone:"zone name", "info": {"pin": "0.95","cpu": "0.15", "ram": "0.15","storage": "0.5"}, location : { lat : '10.83482', long : '106.56' } } ]
 */
router.get('/dashboard/:id', function(req, res){
	// get user id
	let userId = req.params.id;
	// find device
	Device.find({manage_by: mongoose.Types.ObjectId(userId)}, '-manage_by').exec();
});
/**
 * CREATE NEW DEVICE
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/',  function (req, res){
	let promises = [];
	let obj = {
		name: req.body.name,
		coordinate: {long:req.body.long, lat: req.body.lat},
		ip: req.body.ip,
		mac: req.body.mac,
		location_id: mongoose.Types.ObjectId(req.body.location_id),
		layout_id: mongoose.Types.ObjectId(req.body.layout_id),
		manage_by: mongoose.Types.ObjectId(req.body._id)
	 }
	 logger.info(obj);
	let deviceId = "";
//	Device.create(obj);
	let query = Device.findOneAndUpdate({mac: obj.mac}, {$set:obj}, {new: true, upsert:true}).exec();
	query.then((device)=>{
		 logger.info(device);
		 deviceId = device._id;
		 // update device to user
		 return User.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body._id), device: {$ne: deviceId}},{$push:{device: deviceId}}).exec();
	 }, (err)=>{
		logger.info(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	 }).then((user)=>{
		 res.status(200).send({status_code: 200, _id: deviceId, message:"Device Created"});
	 },(err)=>{
		logger.info(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	 });
});
/**
 * ALL THE DEVICE IN THE DATABASE BY THIS USER ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	let id = req.params.id;
	let query = Device.find({manage_by: mongoose.Types.ObjectId(id)}).populate('layout_id', ['_id', 'name', 'url']).populate('location_id', ['_id', 'name']).exec();
	query.then((device)=>{
		res.status(200).send(device);
	}, (err)=>{
		logger.info(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * DELETES A DEVICE FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.delete('/:id', function (req, res) {
    Device.findByIdAndRemove(req.params.id, (err, zone)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message:"Internal Server Error"});
        }
        if(!user){
        	return res.status(404).send({status_code: 404, message: "Device Not Exist"});
        }
        res.status(200).send({message: "Device "+zone.name+" was delete"});
    });
});

/**
 * UPDATES A SINGLE DEVICE IN THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	let obj = {
		name: req.body.name,
		coordinate: {long:req.body.long, lat: req.body.lat},
		ip: req.body.ip,
		mac: req.body.mac,
		location_id: mongoose.Types.ObjectId(req.body.location_id),
		layout_id: mongoose.Types.ObjectId(req.body.layout_id),
		status: req.body.status
	}
	logger.info(obj);
    Device.findByIdAndUpdate(req.params.id, obj, {new: true}, (err, device)=>{
        if (err) {
        	logger.error(err);
        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
        }
        res.status(200).send({status_code: 200, message: "Device Updated Success"});
    });
});

/**
 * POST INFO DEVICE IN THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */

router.post('/info/:id', function (req, res) {
	logger.info(req.body);
	// get time device request
	let config  = Config.findOne().exec();
    let device = Device.findByIdAndUpdate(req.params.id, {$set: {info: req.body}}).exec();
    Promise.all([config, device])
    .then(result=>{
         res.status(200).send({status_code: 200, message: "OK", time: result[0].request_time});
    })
    .catch(err=>{
    	logger.error(err);
      	res.status(500).send({status_code: 500, message: "Internal Server Error"});
    });
});


module.exports = router;