const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Tag = require('../../model/tag/Tag');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * CREATE NEW
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/', function(req, res){
	let name = req.body.name;
	Tag.create({name: name}).then((tag)=>{
		logger.info("Tag Created Success");
		res.status(200).send({status_code: 200, _id: tag._id, message:"Tag Created"});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * GET ALL
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/', function(req, res){
	Tag.find().exec().then((tag)=>{
		if(!tag){
			logger.error('Tag Not Found');
			return res.status(404).send({status_code: 404, message: "Tag Not Found"});
		}
		res.status(200).send(tag);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
});

/**
 * GET BY TAG ID
 * 
 * @param req
 * @param res
 * @returns
 */
router.get('/:id', function(req, res){ 
	Tag.findById(req.params.id).exec().then((tag)=>{
		if(!tag){
			logger.error('Tag Not Found');
			return res.status(404).send({status_code: 404, message: "Tag Not Found"});
		}
		res.status(200).send(tag);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * UPDATE
 * 
 * @param req
 * @param res
 * @returns
 */
router.put('/:id', function(req, res){
	Tag.findByIdAndUpdate(id, {new: true}).exec().then((result)=>{
		if(!result){
			logger.error('Error');
			return res.status(404).send({status_code: 404, message: "Update Error"});
		}
		res.status(200).send({status_code: 200, message: 'Tag ' + result.name + ' Updated'});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
});

/**
 * DELETE
 * 
 * @param req
 * @param res
 * @returns
 */
router.put('/:id', function(req, res){
	Tag.findByIdAndDelete(id, {new: true}).exec().then((result)=>{
		if(!result){
			logger.error('Error');
			return res.status(404).send({status_code: 404, message: "Update Error"});
		}
		res.status(200).send({status_code: 200, message: 'Tag ' + result.name + ' Deleted'});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	})
});
module.exports = router;