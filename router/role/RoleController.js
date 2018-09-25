const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const {Privilege, Role} = require('../../model/role/Role');
const Promise = require('promise');
const mongoose = require('mongoose');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * CREATE NEW ROLE
 * 
 * @param req
 * @param res
 * @returns
 */

router.post('/', function(req, res){
	
});