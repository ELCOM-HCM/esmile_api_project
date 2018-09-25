const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const User = require('../../model/user/User');
const Zone = require('../../model/zone/Zone');
const Location = require('../../model/location/Location');
const Promise = require('promise');
const mongoose = require('mongoose');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * CREATE NEW ACCOUNT ROOT
 * 
 */
router.post('/root',  (req, res)=> {
	let email = req.body.email;
	let query = User.findOne({email: email});
	let user = query.exec();
	user.then((result)=>{
		 if(result){
			 return res.status(403).send({status_code: 403, message:"User Existed"});
		 }
		 let zoneId = mongoose.Types.ObjectId();
		 let locationId = mongoose.Types.ObjectId();
		 let userId = mongoose.Types.ObjectId();
		 // create location default
		 let obj = {
				 _id: locationId,
				 zone: zoneId,
		         name: "location_default",
		         image: "default_location.png",
		         address: "162/12 Binh Loi",
		 }
		 let location = Location.create(obj);
		 // create zone default 
		 obj = {
				 _id: zoneId,
				member:[userId],
				name: "zone_default", 
				image: "default_zone.png", 
				location:[locationId], 
				parent_id: userId,
				create_by: userId, 
		 }
		 let zone = Zone.create(obj);
		 // create user
		 obj = {
				_id: userId,
	            name : req.body.name,
	            email : req.body.email,
	            password : req.body.password,
	            zone: [zoneId],
	            address: req.body.address,
	            avatar: req.body.avatar,
	            create_by: req.body._id
		 }
		 let user = User.create(obj);
		 logger.info("Promise All");
		 Promise.all([location, zone, user]).then(result=>{
			 logger.info(result);
		     res.status(200).send({_id: result[2]._id, message:"User created"});
		 }).catch(err=>{
			 logger.error(err);
			 res.status(500).send({status_code: 500, message: "Internal Server Error"});
		 });
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
});

/**
 * 
 * CREATE NEW ACCOUNT
 * 
 */
router.post('/',  (req, res)=> {
	let email = req.body.email;
	let query = User.findOne({email: email});
	let user = query.exec();
	user.then((result)=>{
		 if(result){
			 return res.status(403).send({status_code: 403, message:"User Existed"});
		 }
		 let id = req.body._id || "";
		 let obj = {
	            name : req.body.name,
	            email : req.body.email,
	            password : req.body.password,
	            zone: req.body.zone_id != ""? mongoose.Types.ObjectId(req.body.zone_id):"",
	            address: req.body.address,
	            role: req.body.role_id != ""? mongoose.Types.ObjectId(req.body.role_id):"",
	            avatar: req.body.avatar,
	            create_by: req.body._id
		 }
		 logger.info(obj);
		 // create user
		 return User.create(obj);
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
	.then((user)=>{
		 logger.info(user);
	     res.status(200).send({_id: user._id, message:"User created"});
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});
/**
 * ALL THE USERS IN THE DATABASE WHO CREATED BY THIS USER ID
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
	let id = req.params.id;
	User.find({create_by:id}, (err, user)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
        }
        if (!user) {
        	return res.status(404).send({status_code: 404, message: "No User Found"});
        }
        res.status(200).send(user);
    });
});
/**
 * GETS A SINGLE USER FROM THE DATABASE
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
    	if (err) {
        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
        }
        if (!zone) {
        	return res.status(404).send({status_code: 404, message: "No User Found"});
        }
        res.status(200).send(user);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, (err, user)=>{
        if (err) {
        	return res.status(500).send({status_code: 500, message:"Internal Server Error"});
        }
        if(!user){
        	return res.status(404).send({status_code: 404, message: "User not exist"});
        }
        res.status(200).send({status_code: 200, message: "User "+user.name+" was delete"});
    });
});

/**
 * UPDATES A SINGLE USER IN THE DATABASE 
 * @param req
 * @param res
 * @returns
 */

router.put('/:id', /* VerifyToken, */ function (req, res) {
	logger.info(req.body);
	let query =  User.findById(req.params.id).exec();
	query.then((user)=>{
		let zone = user.zone;
		if(user.is_parent){
			let zoneId = mongoose.Types.ObjectId(req.body.zone_id);
			zone.includes(zoneId)=== false? zone.push(zoneId): zone; 
		} else {
			zone = [mongoose.Types.ObjectId(req.body.zone_id)];
		}
		let obj = {
			name : req.body.name,
	        email : req.body.email,
	        password : req.body.password,
	        status: req.body.status,
	        zone: zone,
	        address: req.body.address,
	        device: req.body.device.map(x=>{return mongoose.Types.ObjectId(x)}),
	        //role: req.body.role_id != ""? mongoose.Types.ObjectId(req.body.role_id):"",
	        avatar: req.body.avatar
		}
	    User.findByIdAndUpdate(req.params.id, obj, {new: true}, (err, user)=>{
	        if (err) {
	        	logger.error(err);
	        	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
	        }
	        res.status(200).send({status_code: 200, message: "User Updated Success"});
	    });
	}, (err)=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
	
});


module.exports = router;