const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const randtoken = require('rand-token') 
const VerifyToken = require('./VerifyToken');
const logger = require('../../utils/Logger');
const User = require('../../model/user/User');
const Device = require('../../model/device/Device');

var refreshTokens = {} 
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * Configure JWT
 */
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const bcrypt = require('bcryptjs');
const config = require('../../config/Config'); // get config file
const common = require('../../utils/Common');

router.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  logger.info("Login " + email + ";" + password);
  User.findOne({email: email}, (err, user)=>{
	    if (err) {
	    	logger.error("Internal Server Error");
	    	return res.status(500).send({status_code: 500, message: "Internal Server Error"});
	    }
	    if (!user) {
	    	logger.error("No User Found");
	    	return res.status(404).send({status_code: 404, message:'No User Found'});
	    }
	    
	    // check if the password is valid
	    let passwordIsValid = (password==user.password)?true:false;//bcrypt.compareSync(req.body.password, user.password);
	    if (!passwordIsValid) {
	    	logger.error("Unauthorized");
	    	return res.status(401).send({ status_code:401, token: null, message: "Unauthorized" });
	    }

	    // if user is found and password is valid
	    // create a token
	    let token = jwt.sign({ id: user._id }, config.secret, {
	      expiresIn: 86400 // expires in 24 hours
	    });
	    let refreshToken = randtoken.uid(256);
	    refreshTokens[refreshToken] = email;
	    user.token = token;
	    user.refreshToken = refreshToken;
	    res.status(200).send(user);
	});
});

router.post('/token',  (req, res, next) => {
	  let email = req.body.email;
	  let refreshToken = req.body.refreshToken;
	  let userId = req.body._id;
	  if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == email)) {
	    let token = jwt.sign({ id: userId }, config.secret, { expiresIn: 86400 })
	    res.status(200).send({ auth: true, token: token});
	  }
	  else {
	    res.staus(401).send({ status_code:401, token: null, message: "Unauthorized" })
	  }
});
router.post('/token/reject', (req, res, next)=>{ 
	  let refreshToken = req.body.refreshToken;
	  if(refreshToken in refreshTokens) { 
	    delete refreshTokens[refreshToken]
	  } 
	  res.status(203).send({ status_code:203, token: null, message: "Non-Authoritative Information" });
});
router.get('/logout', (req, res)=> {
	let refreshToken = req.body.refreshToken;
	if(refreshToken in refreshTokens) { 
	    delete refreshTokens[refreshToken]
	} 
    res.status(200).send({ auth: false, token: null });
});

/**
 * Create new user ROOT
 */
router.post('/register', (req, res) =>{ 
	let email = req.body.email.trim();
	let user = User.findOne({email: email});
	user.then((result)=>{
			logger.info(result);
		 if(result != null){
			 return res.status(403).send({status_code: 403, message:"User Existed"});
		 }
		 return User.create({
	            name : req.body.name,
	            email : email,
	            password : req.body.password,
	            is_parent: true,
	        });
	}, (err)=>{
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
	.then((user)=>{
		 logger.info(user);
		// create a token
		 let token = jwt.sign({ id: user._id }, config.secret, {
		    expiresIn: 86400 // expires in 24 hours
		 });
		 let refreshToken = randtoken.uid(256);
		 refreshTokens[refreshToken] = email;
	     user.token = token;
	     user.refreshToken = refreshToken;
	     res.status(200).send(user);
	}, (err)=>{
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * LOGIN TABLET
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/device/login', function (req, res) {
	let email = req.body.email;
	let pwd = req.body.password;
	let mac = req.body.mac;
	logger.info("Tablet login:" + email + ";" + pwd);
	// check email exist
	let query = User.findOne({email: email}).populate('device').exec();
	query.then((user)=>{
		if (!user) {
			logger.error("No User Found");
	    	return res.status(401).send({status_code: 401, message:'Unauthorized. No User Found'});
	    }
		// check if the password is valid
	    let passwordIsValid = (pwd==user.password)?true:false;//bcrypt.compareSync(req.body.password, user.password);
	    if (!passwordIsValid) {
	    	logger.error("Unauthorized");
	    	return res.status(401).send({ status_code:401, token: null, message: "Unauthorized" });
	    }
	    logger.info(user);
		// create a token
		 let token = jwt.sign({ id: user._id }, config.secret, {
		    expiresIn: 86400 // expires in 24 hours
		 });
		 let refreshToken = randtoken.uid(256);
		 refreshTokens[refreshToken] = email;
		 let objResponse = {};
		 objResponse.token = token;
		 objResponse.refreshToken = refreshToken;
		 objResponse.name = user.name;
		 objResponse._id = user._id;
		 // get array device id of user
		 let device = user.device;
		 device = device.find(x=> x.mac === mac);
		 if(device === undefined ){
			 objResponse.status_code = 200;
			 objResponse.message = "Device Not Exist. Please Register Device";
			 return res.status(200).send(objResponse);
		 }
		 logger.info(device);
		 // get device detail
		 let query = Device.findById(device._id).populate('location_id', ['name', '_id']).populate('layout_id', ['_id', 'name', 'url']).exec();
		 query.then((device)=>{
			 logger.info(device);
			 objResponse.device = device;
			 objResponse.status_code = 200;
			 res.status(200).send(objResponse);
		 }, (err)=>{
			 logger.error(err);
		     res.status(500).send({status_code: 500, message: "Internal Server Error"});
		 });
	     
	}, (err)=>{
		logger.error(err);
    	res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * LOGOUT DEVICE
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/device/logout', function (req, res){
	let refreshToken = req.body.refreshToken;
	if(refreshToken in refreshTokens) { 
	    delete refreshTokens[refreshToken]
	} 
    res.status(200).send({ status_code:200, token: null });
});

/**
 * REGISTER TABLET
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/device/register', function (req, res) {
	let email = req.body.email;
	let pwd = req.body.password;
	let mac = req.body.mac;
	logger.info("Tablet register:" + email + ";" + password);
	// check email exist
	let query = User.findOne({email: email}).populate('zone').exec();
	query.then((user)=>{
		if (!user) {
	    	logger.error("No User Found");
	    	return res.status(401).send({status_code: 401, message:'Unauthorized. No User Found'});
	    }
		// check if the password is valid
	    let passwordIsValid = (pwd==user.password)?true:false;//bcrypt.compareSync(req.body.password, user.password);
	    if (!passwordIsValid) {
	    	logger.error("Unauthorized");
	    	return res.status(401).send({ status_code:401, token: null, message: "Unauthorized" });
	    }
	    logger.info(user);
		// create a token
		 let token = jwt.sign({ id: user._id }, config.secret, {
		    expiresIn: 86400 // expires in 24 hours
		 });
		 let refreshToken = randtoken.uid(256);
		 refreshTokens[refreshToken] = email;
		 let objResponse = {};
		 objResponse.token = token;
		 objResponse.refreshToken = refreshToken;
		 objResponse.name = user.name;
		 // get array device id of user
		 let device = user.device;
		 logger.info(device);
		 device = device.find(x=> x.mac === mac);
		 if(device != undefined ){
			 return res.status(409).send({status_code: 409, message: "Device Existed"});
		 }
		 // get device detail
		 let query = Device.findById(device._id).populate('location_id', ['name', '_id']).populate('layout_id', ['_id', 'name', 'url']).exec();
		 query.then((device)=>{
			 logger.info(device);
			 objResponse.device = device;
			 objResponse.status_code = 200;
			 res.status(200).send(objResponse);
		 }, (err)=>{
			 logger.error(err);
		     res.status(500).send({status_code: 500, message: "Internal Server Error"});
		 });
	     
	}, (err)=>{
		logger.error(err);
    	res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

module.exports = router;