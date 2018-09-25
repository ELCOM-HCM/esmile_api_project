const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const logger = require('../../utils/Logger');
const Layout = require('../../model/layout/Layout');
const Zone = require('../../model/zone/Zone');
const Config = require('../../model/config/Config');
const Respondent = require('../../model/respondent/Respondent');
const User = require('../../model/user/User');
const Promise = require('promise');
const Tag = require('../../model/tag/Tag');
const mongoose = require('mongoose');  
const moment = require('moment');
const Common = require('../../utils/Common');
const groupArray = require('group-array');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * GET FILTER
 * @author Win-Win
 * @date 
 * @param req
 * @param res
 * @returns
 */
router.get('/filter', function(req, res){
	let promises = [];
	let tags = [];
	// get tag
	promises.push(Tag.find().exec());
	// get config
	promises.push(Config.findOne().exec());
	// get device send respodent
	promises.push(Respondent.find({}, 'send_by -_id').exec()); // not select _id
	
	Promise.all(promises).then(([tag, config, device])=>{
		device = device.map(x=>x.send_by); // array device
		device = device.filter((x,i)=>device.indexOf(x)===i);// filter device unique
		config.tag = tag;
		config.device = device;
	    res.status(200).send(config);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * 
 * @param req
 * @param res
 * @returns  {"response": "1", "csat": "10", nps: "20", ces:"10", "storage": {"used": "10", "total": "20" }, "account": {"used": "10",   "total": "20" } }
 */
router.get('/dashboard/:id', function(req, res){
	// get user id
	let userId = req.params.id;
	// get layout by user id
	let query = Zone.find({member:{$elemMatch:{$eq:mongoose.Types.ObjectId(userId)}}}, '_id name').populate({path:'layout', select:'_id name'}).exec();
	query.then(result=>{
		let layout = result.map(x=>x.layout);
		// convert [[]]=>[]
		layout = [].concat.apply([], layout); 
		//logger.info (layout);
		layout = layout.map(x=>x._id);
		//logger.info (layout);
		respondent = Respondent.find({layout: {$in: layout}}, 'name type start_at stop_at created_on data.type data.page.properties').exec();
		storage = User.findById(userId, 'storage').exec();
		return Promise.all([respondent, storage]);
	})
	.then(async result=>{
		let respondent = result[0];
		let storage = result[1].storage;
		let cx = await Common.CXAnalysis(respondent);
		let obj= {};
		obj.response = cx.response;
		obj.csat = cx.csat;
		obj.ces = cx.ces;
		obj.nps = cx.nps;
		
		// get storage
		obj.storage = {used: 0, total: storage};
		// get account
		obj.account = {used: 0,  total: 3 };
		//logger.info("OBJ");
		//logger.info(obj);
		res.status(200).send(obj);
	})
	.catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * CREATE CONFIG
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/', function(req, res){
	Config.create(req.body).then((config)=>{
		logger.info(config);
	    res.status(200).send({status_code: 200, _id: config._id, message:"Config Created"});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/overview', function(req, res){
	logger.info(req.body);
	let promises = [];
	let layoutId = mongoose.Types.ObjectId(req.body._id);
	let dateFrom =  moment(req.body.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
	let dateTo = moment(`${req.body.date_to} 23:59:59`, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
	let time = req.body.time;
	let day = req.body.day;
	let tag = req.body.tag;
	let source = req.body.source;
	let device = req.body.device;
	let type = req.body.type;
	logger.info('INPUT');
	logger.info(dateFrom +' ' +  dateTo);
	// get respondent by filter
	query = Respondent.find({
		 layout: layoutId, 
		 created_on:{$gte: dateFrom, $lt: dateTo},
		 //'data.page.properties.rows.cell.selected':true
	    }, 
		'name type created_on data.type data.page.properties',
	    ).exec();
	promises.push(query);
	Promise.all(promises).then(async ([respondent])=>{
		let cx = await Common.CXAnalysis(respondent);
		let analysis = []; 
		let dateFrom =  moment(req.body.date_from, 'DD-MM-YYYY');
		let dateTo = moment(req.body.date_to, 'DD-MM-YYYY');
		let dateBetween = [];
		let response  = {
			type:"response",
			name: "Responses",
			status: true,
			data:[
			]
		};
		let nps = {
				type:"nps",
				name: "NPS",
				status: true,
				data:[
				]
		};
		let ces = {
			type:"ces",
			status: true,
			name: "CES",
			data:[
			]
		};
		let csat = {
			type:"csat",
			status: true,
			name: "CSAT",
			data:[
			]
		}
		while(dateFrom.diff(dateTo) < 1) {
	        logger.info(moment(dateFrom).format('DD-MM-YYYY'));
	        dateBetween.push(moment(dateFrom).format('DD-MM-YYYY').toString());
	        let date = moment(dateFrom).format('DD-MM-YYYY');
	        let isChecked = false;
	        let obj = {};
    		obj.response = 0;
    		obj.csat = 0;
    		obj.ces = 0;
    		obj.ces_response = 0;
    		obj.nps_detractor = 0;
    		obj.nps_promoter = 0;
    		obj.nps_response = 0;
	        cx.analysis.map(r=>{
	        	if(date == moment(r.created_on, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY')){
	        		obj.response+=1;
	        		obj.csat+= r.csat;
	        		obj.ces += r.ces;
	        		obj.ces_response+=r.ces_response;
	        		obj.nps_response+= r.nps_response;
	        		obj.nps_promoter+= r.nps_promoter;
	        		obj.nps_detractor+= r.nps_detractor;
	        		isChecked = true;
	        	}
				return r;
			});
	        if(isChecked){
	        	let tmp = {};
	        	tmp.response = obj.response;
	        	// csat = sum(score except ces nps)/sum(respondent)
	        	tmp.csat = obj.csat/(obj.response==0?1:obj.response);
	        	// ces = sum-point(ces)/ sum(respondent contain ces)
	        	tmp.ces = obj.ces/(obj.ces_response==0?1:obj.ces_response);
	        	// nps = (promoter - detractor)/sum(respondent contain nps)
	        	tmp.nps = (obj.nps_promoter - obj.nps_detractor)/(obj.nps_response==0?1:obj.nps_response);
	        	response.data.push({date: date, num: tmp.response});
	        	nps.data.push({date: date, num: tmp.nps.toFixed(2)});
	        	ces.data.push({date: date, num: tmp.ces.toFixed(2)});
	        	csat.data.push({date:date, num: tmp.csat.toFixed(2)});
	        }
	        dateFrom = dateFrom.add(1, 'days');
	    }
		let result = {};
		result.overview = {response: cx.response, question: 0, answer: 0, csat: cx.csat, nps: cx.nps, ces: cx.ces};
		result.response = response;
		result.csat = csat;
		result.ces = ces;
		result.nps = nps;
	    res.status(200).send(result);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/response', function(req, res){
	let promises = [];
	let layoutId = mongoose.Types.ObjectId(req.body._id);
	let dateFrom =  moment(req.body.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
	let dateTo = moment(`${req.body.date_to} 23:59:59`, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
	let time = req.body.time;
	let day = req.body.day;
	let tag = req.body.tag;
	let source = req.body.source;
	let device = req.body.device;
	let type = req.body.type;
	logger.info('INPUT');
	logger.info(req.body);
	logger.info(dateFrom +' ' +  dateTo);
	// get respondent by filter
	query = Respondent.find({
		 layout: layoutId, 
		 created_on:{$gte: dateFrom, $lte: dateTo},
		 //'data.page.properties.rows.cell.selected':true
	    }, 
		'name type start_at stop_at created_on data.type data.page.properties',
	    ).exec();
	promises.push(query);
	Promise.all(promises).then(async([respondent])=>{
		let cx = await Common.CXAnalysis(respondent);
		let result = {};
		result.overview = {response: cx.response, question: 0, answer: 0, csat: cx.csat, nps: cx.nps, ces: cx.ces};
		result.analysis = [];
		result.respondent = [];
		cx.analysis.map(r=>{
			r.respondent.map(x=>{
				let obj = {
						_id: x._id,
						type: x.type,
						name: x.name,
						data: x.data,
						column: x.column || [],
						checked: true
				}
				result.analysis.push(obj); 
				return x;
			});
			result.respondent.push({
				"_id": r._id,
	            "question": r.question,
	            "answer": r.answer,
	            "nps_promoter": r.nps_promoter,
	            "nps_detractor": r.detractor,
	            "nps_response": r.nps_response,
	            "ces_response": r.ces_response,
	            "csat": r.csat,
	            "ces": r.ces
            });
			return r;
		});
		// type icon,choose,
		// type smile
		// type nps
		// type ces
		let nameArr = [];
		result.analysis.map(n=>{
			if(nameArr.indexOf(n.name) < 0){
				nameArr.push(n.name);
			}			
			return n;
		});
		// group by Name
		let groupByName = groupArray(result.analysis, "name");
		let tmp = [];
		tmp = nameArr.map(n=>{
			let obj = {_id:"", type:"", name: n, data:[], column:[], sum: 0, sum_response: 0};
			let objIdArr = [];
			groupByName[n].map(s=>{
				obj._id = s._id;
				obj.type = s.type;
				obj.name = s.name;
				obj.column = s.column;
				obj.checked = s.checked;
				if(obj.type == 'survey'){
					s.data.map(o=>{
						obj.data.push({name: o.name, column_selected: o.column_selected,  date: o.date, score: o.score});
						return o;
					});
				} else {
					s.data.map(o=>{
						// check same name
						let index = objIdArr.indexOf(o.name);
						if(index < 0){
							objIdArr.push(o.name);
							obj.data.push(o);
							obj.sum+= o.score;
							obj.sum_response+= o.response;
						} else {
							obj.sum+= o.score;
							obj.data[index].score+= o.score;
							obj.sum_response+= o.response;
							obj.data[index].response+= o.response || 0;
						}
						return o;
					});
				}
				return s;
			});
			if(obj.type=="survey"){
				// get name option
				let names = [];
				let data = [];
				obj.data.map(d=>{
					if(names.indexOf(d.name) < 0){
						names.push(d.name);
					}
					return d;
				});
				obj.data = groupArray(obj.data, "name");
				data = names.map(x=>{
					let row = {};
					row.name = x;
					row.column = obj.column.map(c=>{
						let col = {};
						col.name = c.name;
						col.image = c.image;
						col.score = 0;
						col.response = 0;
						obj.data[x].map(s=>{
							if(s.column_selected == c._id){
								col.score+= c.score;
								col.response+=1;
							}
							return s;
						});
						return col;
					});
					return row;
				});
				obj.data = data;
			}
			return obj;
		});
		result.analysis = tmp;
	    res.status(200).send(result);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});

/**
 * 
 * @param req
 * @param res
 * @returns
 */
router.post('/feedback', function(req, res){
	let promises = [];
	let layoutId = mongoose.Types.ObjectId(req.body._id);
	let dateFrom =  moment(req.body.date_from, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
	let dateTo = moment(`${req.body.date_to} 23:59:59`, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
	let time = req.body.time;
	let day = req.body.day;
	let tag = req.body.tag;
	let source = req.body.source;
	let device = req.body.device;
	let type = req.body.type;
	logger.info('INPUT');
	logger.info(req.body);
	logger.info(dateFrom +' ' +  dateTo);
	// get respondent by filter
	query = Respondent.find({
		 layout: layoutId, 
		 created_on:{$gte: dateFrom, $lte: dateTo}
	    }, 'name start_at stop_at created_on data.type data.page.properties'
	    ).exec();
	promises.push(query);
	Promise.all(promises).then(async ([respondent])=>{
		let score = {
				name:"Survey Score",
				_id: 1,
				type:"score",
				checked: true,
				data:[]
		};
		let time = {
			name:"Time taken to complete the survey",
			_id: 2,
			type:"time",
			checked: true,
			data:[]
		};
		let survey = {
				name:"Survey completeness",
				_id: 3,
				type:"percentage",
				checked: true,
				data: []
		};
		// list time minute
		let listTime = [{num: 0, start:0, end: 1}, {num: 0, start:1, end: 2}, {num: 0, start:2, end: 3}, {num: 0, start:3, end: 4}, {num: 0, start:4, end: 5}, {num: 0, start:5, end: 6}, {num: 0, start:6, end: 7}, {num: 0, start:7, end: 8}, {num: 0, start:8, end: 9}, {num: 0, start:9, end: 10}, {num: 0, start:10, end: 99999}];
		// list score
		let listScore = [{num: 0, start:0, end: 10}, {num: 0, start:10, end: 20}, {num: 0, start:20, end: 30}, {num: 0, start:30, end: 40}, {num: 0, start:40, end: 50}, {num: 0, start:50, end: 60}, {num: 0, start:60, end: 70}, {num: 0, start:70, end: 80}, {num: 0, start:80, end: 90}, {num: 0, start:90, end: 100}, {num: 0, start:100, end: 99999}];
		// list complete
		let listPercent = [{num: 0, start:0, end: 10}, {num: 0, start:10, end: 20}, {num: 0, start:20, end: 30}, {num: 0, start:30, end: 40}, {num: 0, start:40, end: 50}, {num: 0, start:50, end: 60}, {num: 0, start:60, end: 70}, {num: 0, start:70, end: 80}, {num: 0, start:80, end: 90}, {num: 0, start:90, end: 100}];
		let cx = await Common.CXAnalysis(respondent); 
		let result = {};
		result.overview = {response: cx.response, question: 0, answer: 0, csat: cx.csat, nps: cx.nps, ces: cx.ces};
		cx.analysis.map(r=>{
			// compare time
			listTime = listTime.map(t=>{
				if(t.end*60 >= r.duration && r.duration > t.start*60){ // start <= duration < end
					t.num+=1;
				}
				return t;
			});
			// compare score 
			listScore = listScore.map(s=>{
				if(r.csat > s.start && s.end >= r.csat){ // start <= csat <= end
					s.num+=1;
				}
				return s;
			});
			// compare percentage
			listPercent = listPercent.map(p=>{
				let percent = (r.answer*100/r.question).toFixed(2);
				if(percent > p.start && p.end >= percent){ // start <= csat <= end
					p.num+=1;
				}
				return p;
			});
			return r;
		});
		score.data = listScore.map(s=> {
			// {"num":"0","name":"0 - 100 point"}
			let obj = {
					name: `${s.start==100?'>100':s.start}${s.end === 99999?'': '-' + s.end} point`,
					num: s.num
			}
			return obj;
		})
		time.data = listTime.map(t=>{
			// {"num":"0","name":"0 - 10 minute"}
			let obj = {
					name: `${t.start==10?'>10':t.start}${t.end === 99999?'': '-' + t.end} minute`,
					num: t.num
			}
			return obj;
		});
		survey.data = listPercent.map(p=>{
			// {"num":"0","name":"0 - 10 percent"}
			let obj = {
					name: `${p.start}-${p.end}%`,
					num: p.num
			}
			return obj;
		});
		result.analysis = [score, time, survey];
		res.status(200).send(result);
	}).catch(err=>{
		logger.error(err);
		res.status(500).send({status_code: 500, message: "Internal Server Error"});
	});
});


module.exports = router;

