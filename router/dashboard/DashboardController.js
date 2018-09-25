const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../auth/VerifyToken');
const logger = require('../../utils/Logger');
const common = require('../../utils/Common');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/overview', /* VerifyToken, */  (req, res)=>{
	let obj = {
			"session_id": req.query.session_id,
			"user_id": req.query.user_id,
			"date_from": req.query.data_from,
			"date_to":  req.query.date_to,
	}
	logger.info(obj);
	common.request({url:"getdashboardoverview", 
					method:"POST", 
		data:obj}).then((result)=>{
			res.status(200).send(result);			
	}, (err)=>{
		res.status(500).send(err);
	});
});

module.exports = router;