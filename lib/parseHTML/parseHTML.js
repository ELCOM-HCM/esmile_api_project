$(function(){
	report.init();
	window.addEventListener("orientationchange", function() {
	  	//alert('orientationchange');
		report.width = $(document).width();
		report.height = $(document).height();
		report.size = report.getSize();
		report.drawObject();
	}, false);
})

report = {
	color: ['#ff0000', '#ff4000', '#ff6633', '#ff8000', '#ffbf00', '#ffd966', '#ace600', '#80ff00', '#40ff00', '#00ff40', '#00ff80', '#00ffbf', '#00ffff', '#00bfff', '#0080ff', '#0040ff', '#0000ff', '#4000ff', '#8000ff', '#bf00ff'],
	color_ces: ['#E23936', '#FC664B', '#FDA83E', '#FFC21F', '#E3C41B', '#9FCC0A', '#38B001'],
	index: 0,
	item: '#content',
	header: '#header',
	btn_prev: '#btn-prev',
	btn_next: '#btn-next',
	max: 0,
	selected: [],
	layout_id: null,
	object_id: null,
	timeoutID: null,
	timer: 60000,
	isStartTimer: false,
	reloadTimeoutID: null,
	modalTimeout: null,
	isSendRating: false,
	width: null,
	height: null,
	size: {
		width: 135,
		height: 175
	},
	start_time: null,
	stop_time: null,
	avatar: 'http://172.16.9.141:3002/client/content/logo-1514278419850.png',
	avatar_text: 'Trần Minh Trung',
	history: [],
	tags: {
		negative: 1,
		positive: 2,
		neutral: 3
	},
	countdown: 0,
	sendData:[],
	selected_survey:[]
}

report.init = function(){
	var _ = this;
	_.width = $(document).width();
	_.height = $(document).height();
	_.size = report.getSize();
	_.history = [];
	var url = $('body').attr('data-url');
	$.ajax({
	  	url : url,
	  	data: {},
	  	type : 'GET',
	  	success : function(data) {
	  		_.data = data;
	  		var sheet = document.createElement('style')
			sheet.innerHTML = 	'.slide li .caption {background: '+_.data.color.caption.unselect.background+';}'+
			  					' .slide li .caption h4 {color: '+_.data.color.caption.unselect.color+'}'+
			  					' .slide li.selected .caption {background: '+_.data.color.caption.select.background+' !important}'+
			  					' .slide li.selected .caption h4 {color: '+_.data.color.caption.select.color+' !important}'+
			  					' .slide li.selected .thumbnail {box-shadow: 0 0 10px 5px '+_.data.color.text.heading+' !important;}'+
			  					' .multiple li .caption {background: '+_.data.color.caption.unselect.background+';}'+
			  					' .multiple li .caption h4 {color: '+_.data.color.caption.unselect.color+'}'+
			  					' .multiple li.selected .caption {background: '+_.data.color.caption.select.background+' !important}'+
			  					' .multiple li.selected .caption h4 {color: '+_.data.color.caption.select.color+' !important}'+
			  					' .multiple li.selected .thumbnail {box-shadow: 0 0 10px 5px '+_.data.color.text.heading+' !important;}';
			document.body.appendChild(sheet);
	  		_.layout_id = _.data._id;
	  		_.timer = Number(_.data.setting.device.timeout)*1000;
	  		//_.setup();
	  		//_.drawHeader();
	  		report.setup();
	  		for (var i = 0; i < _.data.pages.length; i++) {
	  			if (_.data.pages[i].type == 'rating'){
	  				_.selected.push({
						  page_id: _.data.pages[i].page_id, 
						  _id: _.data.pages[i]._id, 
		  				selected: []
		  			});
	  			}
	  		}
	  		_.index = 0;
	  		report.drawObject();
	  	},
	  	error: function(){
	  		//console.log('error');
	  	}
	});
}

report.drawHeader = function(){
	var _ = this;
	if (_.data.header.type == 'color'){
		$(_.header).css({'background': _.data.header.value});
	} else {
		$(_.header).css({
			'background-image': 'url('+_.data.header.value+')',
			'background-position': 'center center',
		    'background-repeat': 'no-repeat',
		    'background-attachment': 'fixed',
		    'background-size': 'cover',
		    'background-color': '#fff'
		});
	}
}

report.getDate = function(){
	var date = new Date();
	var d = date.getDate();
	var mm = date.getMonth()+1;
	var y = date.getFullYear();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();

	if (d < 10){
		d = '0'+d;
	}
	if (mm < 10){
		mm = '0'+mm;
	}
	if (h < 10){
		h = '0'+h;
	}
	if (m < 10){
		m = '0'+m;
	}
	if (s < 10){
		s = '0'+s;
	}
	return d+'-'+mm+'-'+y+' '+h+':'+m+':'+s
}

report.drawObject = function(isSend){
	var _ = this;
	var pages = _.data.pages;
	var page = pages[_.index];	
	if (page.type == 'intro' && !_.data.setting.screen.intro){
		report.nextPage();
		return;
	}
	if (page.type == 'exit'){
		if (!_.data.setting.screen.exit){
			window.location.reload();
			return;
		} else if (!_.isSendRating && isSend == null){
			return;
		} else if (!_.isSendRating){
			report.sendRating();
		}
	} else {
		if (_.history.indexOf(_.index) < 0)
			_.history.push(_.index);
	}
	if ($(report.item).find('div').length > 0){
		$(report.item).animate({opacity: 0}, 500, function(){			
			$(_.item).empty();			
			if (page.type == 'rating'){
				_.max = 0;
				_.start_time = _.getDate();
				if (_.data.background.type == 'color'){
					$('body').css({'background': _.data.background.value});
				} else {
					$('body').css({
						'background-image': 'url('+_.data.background.value+')',
						'background-position': 'center center',
					    'background-repeat': 'no-repeat',
					    'background-attachment': 'fixed',
					    'background-size': 'cover',
					    'background-color': '#fff'
					});
				}
				$('#top-left').empty();
				$('#top-center').empty();
				$('#top-right').empty();
				$('#bottom-left').empty();
				$('#bottom-center').empty();
				$('#bottom-right').empty();
				if (page.widget.logo.status){
					var y = page.widget.logo.position.y;
					var x = page.widget.logo.position.x;
					var width = page.widget.logo.width;
					var height = page.widget.logo.height;
					$('#layout-'+y).css({'height': height+'px'});
					$('#'+y+'-'+x).append('<img id="logo" class="logo" style="height: '+height+'px;" src="'+_.data.background.logo+'">');
					$('#layout-'+y).removeClass('hidden');
				}
				if (page.widget.image.status){
					var y = page.widget.image.position.y;
					var x = page.widget.image.position.x;
					$('#layout-'+y).css({'height': height+'px'});
					var avatar = '<div class="avatar" style="width: '+_.size.width+'px; height: '+_.size.height+'px;">'+
									'<img id="avatar" style="width: '+_.size.width+'px; height: '+_.size.height+'px;"  src="'+_.avatar+'">'+
									'<div class="caption" style="width: '+_.size.width+'px;">'+
										'<div style="display: table-cell; vertical-align: middle;">'+
											'<h4>'+_.avatar_text+'</h4>'+
										'</div>'+
									'</div>'+
								'</div>';
					$('#'+y+'-'+x).append(avatar);			
					$('#layout-'+y).removeClass('hidden');
				}
				if (page.widget.home.status){
					var btn =   '<div class="btn-group" onclick="window.location.reload()">'+
							        '<button class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';"><i class="'+page.widget.home.icon+'"></i> '+page.widget.home.text+'</button>'+
							    '</div>';
					var y = page.widget.home.position.y;
					var x = page.widget.home.position.x;
					$('#'+y+'-'+x).append(btn);
					$('#layout-'+y).removeClass('hidden');
				}
				if (page.widget.send.status){
					var disabled = report.checkPage() ? 'disabled="disabled"' : '';
					var btn =   '<button id="btn-send" class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';" '+disabled+' onclick="report.sendRating()"><i class="'+page.widget.send.icon+'"></i> '+page.widget.send.text+'</button>';
					var y = page.widget.send.position.y;
					var x = page.widget.send.position.x;
					$('#'+y+'-'+x).append(btn);
					$('#layout-'+y).removeClass('hidden');
				}
				if (page.widget.back.status){
					var btn =   '<div class="btn-group" onclick="report.prevPage()">'+
							        '<button class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';"><i class="'+page.widget.back.icon+'"></i> '+page.widget.back.text+'</button>'+
							    '</div>';
					var y = page.widget.back.position.y;
					var x = page.widget.back.position.x;
					$('#'+y+'-'+x).append(btn);
					$('#layout-'+y).removeClass('hidden');
				}
				var top = 0, bottom = 0;
				if ($('#layout-top.hidden').length == 0) top = 75;
				if ($('#layout-bottom.hidden').length == 0) bottom = 60;
				$('.content').css({
					'height': (_.height - top - bottom)+'px',
					'margin-top': top+'px'
				});
				_.isStartTimer = _.data.setting.device.isTimeout;
			} else {
				_.isStartTimer = false;
			}
			_.resetTimer();		
			for (var j = 0; j < page.page.length; j++) {
				if (page.page[j].properties != null){
					var properties = page.page[j].properties[0];
					var logics = page.page[j].logics;
					switch (properties.type){
						case 'choose':
							$(_.item).append(_.Choose(properties, logics, page.page[j].object_id));
						break;
						case 'icon':
							$(_.item).append(_.Icon(properties, logics, page.page[j].object_id));
						break;
						case 'score':
							$(_.item).append(_.Score(properties, logics, page.page[j].object_id));
						break;
						case 'nps':
							$(_.item).append(_.NPS(properties, logics, page.page[j].object_id));
						break;
						case 'ces':
							$(_.item).append(_.CES(properties, logics, page.page[j].object_id));
						break;
						case 'smile':
							$(_.item).append(_.Smile(properties, logics, page.page[j].object_id));
						break;
						case 'survey':
							$(_.item).append(_.Survey(properties, logics, page.page[j].object_id));
						break;
						case 'star':
							$(_.item).append(_.Star(properties, logics, page.page[j].object_id));
						break;
						case 'multiple':
							$(_.item).append(_.Multiple(properties, logics, page.page[j].object_id));
						break;
						case 'question':
							$(_.item).append(_.Question(properties, logics, page.page[j].object_id));
						break;
						case 'intro':
							$('.content').removeAttr('style');
							$('#layout-top').addClass('hidden');
							$('#layout-bottom').addClass('hidden');
							$(_.item).append(_.Welcome(properties));
							$(_.header).addClass('hidden');
							if (properties.columns[0].background_type == 'color'){
								$('body').css({'background': properties.columns[0].background});
							} else {
								$('body').css({
									'background-image': 'url('+properties.columns[0].background+')',
									'background-position': 'center center',
								    'background-repeat': 'no-repeat',
								    'background-attachment': 'fixed',
								    'background-size': 'cover',
								    'background-color': '#fff'
								});
							}
						break;
						case 'exit':
							$('.content').removeAttr('style');
							$('#layout-top').addClass('hidden');
							$('#layout-bottom').addClass('hidden');
							$(_.item).append(_.Exit(properties));
							$(_.header).addClass('hidden');
							if (properties.columns[0].background_type == 'color'){
								$('body').css({'background': properties.columns[0].background});
							} else {
								$('body').css({
									'background-image': 'url('+properties.columns[0].background+')',
									'background-position': 'center center',
								    'background-repeat': 'no-repeat',
								    'background-attachment': 'fixed',
								    'background-size': 'cover',
								    'background-color': '#fff'
								});
							}
						break;
					}
				}
			}
			//$(report.item).css({left: report.width+'px'});
			$(report.item).animate({opacity: 1}, 500);
		});	
	} else {
		$(_.item).empty();
		if (page.type == 'rating'){
			_.max = 0;
			_.start_time = _.getDate();
			if (_.data.background.type == 'color'){
				$('body').css({'background': _.data.background.value});
			} else {
				$('body').css({
					'background-image': 'url('+_.data.background.value+')',
					'background-position': 'center center',
				    'background-repeat': 'no-repeat',
				    'background-attachment': 'fixed',
				    'background-size': 'cover',
				    'background-color': '#fff'
				});
			}
			$('#top-left').empty();
			$('#top-center').empty();
			$('#top-right').empty();
			$('#bottom-left').empty();
			$('#bottom-center').empty();
			$('#bottom-right').empty();		

			if (page.widget.logo.status){
				var y = page.widget.logo.position.y;
				var x = page.widget.logo.position.x;
				var width = page.widget.logo.width;
				var height = page.widget.logo.height;
				$('#layout-'+y).css({'height': height+'px'});
				$('#'+y+'-'+x).append('<img id="logo" class="logo" style="height: '+height+'px;" src="'+_.data.background.logo+'">');
				/*$('.content').css({
					'height': (_.height - height - 60)+'px',
					'margin-top': (Number(height)+10)+'px'
				});*/
				$('#layout-'+y).removeClass('hidden');
			}

			if (page.widget.image.status){
				var y = page.widget.image.position.y;
				var x = page.widget.image.position.x;
				$('#layout-'+y).css({'height': height+'px'});
				var avatar = '<div class="avatar" style="width: '+_.size.width+'px; height: '+_.size.height+'px;">'+
								'<img id="avatar" style="width: '+_.size.width+'px; height: '+_.size.height+'px;"  src="'+_.avatar+'">'+
								'<div class="caption" style="width: '+_.size.width+'px;">'+
									'<div style="display: table-cell; vertical-align: middle;">'+
										'<h4>'+_.avatar_text+'</h4>'+
									'</div>'+
								'</div>'+
							'</div>';
				$('#'+y+'-'+x).append(avatar);			
				$('#layout-'+y).removeClass('hidden');
			}

			if (page.widget.home.status){
				var btn =   '<div class="btn-group" onclick="window.location.reload()">'+
						        '<button class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';"><i class="'+page.widget.home.icon+'"></i> '+page.widget.home.text+'</button>'+
						    '</div>';
				var y = page.widget.home.position.y;
				var x = page.widget.home.position.x;
				$('#'+y+'-'+x).append(btn);
				$('#layout-'+y).removeClass('hidden');
			}
			if (page.widget.send.status){
				var disabled = report.checkPage() ? 'disabled="disabled"' : '';
				var btn =   '<button id="btn-send" class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';" '+disabled+' onclick="report.sendRating()"><i class="'+page.widget.send.icon+'"></i> '+page.widget.send.text+'</button>';
				var y = page.widget.send.position.y;
				var x = page.widget.send.position.x;
				$('#'+y+'-'+x).append(btn);
				$('#layout-'+y).removeClass('hidden');
			}
			if (page.widget.back.status){
				var btn =   '<div class="btn-group" onclick="report.prevPage()">'+
						        '<button class="btn btn-default btn-xs" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+';"><i class="'+page.widget.back.icon+'"></i> '+page.widget.back.text+'</button>'+
						    '</div>';
				var y = page.widget.back.position.y;
				var x = page.widget.back.position.x;
				$('#'+y+'-'+x).append(btn);
				$('#layout-'+y).removeClass('hidden');
			}
			var top = 0, bottom = 0;
			if ($('#layout-top.hidden').length == 0) top = 75;
			if ($('#layout-bottom.hidden').length == 0) bottom = 60;

			$('.content').css({
				'height': (_.height - top - bottom)+'px',
				'margin-top': top+'px'
			});
			/*if (page.button.cancel.status){
				
			}
			if (page.button.comment.status){
				
			}*/
			_.isStartTimer = _.data.setting.device.isTimeout;
		} else {
			_.isStartTimer = false;
		}
		_.resetTimer();		
		for (var j = 0; j < page.page.length; j++) {
			if (page.page[j].properties != null){
				var properties = page.page[j].properties[0];
				var logics = page.logics;
				switch (properties.type){
					case 'choose':
						$(_.item).append(_.Choose(properties, logics, page.page[j].object_id));
					break;
					case 'icon':
						$(_.item).append(_.Icon(properties, logics, page.page[j].object_id));
					break;
					case 'score':
						$(_.item).append(_.Score(properties, logics, page.page[j].object_id));
					break;
					case 'nps':
						$(_.item).append(_.NPS(properties, logics, page.page[j].object_id));
					break;
					case 'ces':
						$(_.item).append(_.CES(properties, logics, page.page[j].object_id));
					break;
					case 'smile':
						$(_.item).append(_.Smile(properties, logics, page.page[j].object_id));
					break;
					case 'survey':
						$(_.item).append(_.Survey(properties, logics, page.page[j].object_id));
					break;
					case 'star':
						$(_.item).append(_.Star(properties, logics, page.page[j].object_id));
					break;
					case 'multiple':
						$(_.item).append(_.Multiple(properties, logics, page.page[j].object_id));
					break;
					case 'question':
						$(_.item).append(_.Question(properties, logics, page.page[j].object_id));
					break;
					case 'intro':
						$('.content').removeAttr('style');
						$('#layout-top').addClass('hidden');
						$('#layout-bottom').addClass('hidden');
						$(_.item).append(_.Welcome(properties));
						$(_.header).addClass('hidden');
						if (properties.columns[0].background_type == 'color'){
							$('body').css({'background': properties.columns[0].background});
						} else {
							$('body').css({
								'background-image': 'url('+properties.columns[0].background+')',
								'background-position': 'center center',
							    'background-repeat': 'no-repeat',
							    'background-attachment': 'fixed',
							    'background-size': 'cover',
							    'background-color': '#fff'
							});
						}
					break;
					case 'exit':
						$('.content').removeAttr('style');
						$('#layout-top').addClass('hidden');
						$('#layout-bottom').addClass('hidden');
						$(_.item).append(_.Exit(properties));
						$(_.header).addClass('hidden');
						if (properties.columns[0].background_type == 'color'){
							$('body').css({'background': properties.columns[0].background});
						} else {
							$('body').css({
								'background-image': 'url('+properties.columns[0].background+')',
								'background-position': 'center center',
							    'background-repeat': 'no-repeat',
							    'background-attachment': 'fixed',
							    'background-size': 'cover',
							    'background-color': '#fff'
							});
						}
					break;
				}
			}
		}
	}
	//$(_.item).show('slow');
}

report.Choose = function(data, logics, id){
	var _ = this;
	count = data.rows[0].cell.length;
	var result = '';
	var text = '';
	var icon = '';
	var rating_row = '';
	var rows_selected = '';
	if (data.rows[0].text != null && data.rows[0].text != ''){
		var width = (80/count)+'%';
		var text_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+							
						'</div>';
		var icon_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+
							'<h4 style="color: '+_.data.color.text.option+';" class="help-text">'+data.rows[0].text+'</h4>'+
						'</div>';
	} else {
		var width = (100/count)+'%';
		var text_left = '';
		var icon_left = '';
	}
	for (var i = 0; i < count; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var selected = 'selected';
			var checked = 'checked';
			rows_selected = 'data-selected="selected"';
		} else {
			var selected = '';
			var checked = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		text += '<div class="col-md-2 col-xs-2 text '+selected+'" style="color: '+_.data.color.text.option+'; width: '+width+';" name="text-'+i+'">'+data.rows[0].cell[i].text+'</div>';
		icon += '<div class="col-md-2 col-xs-2 icon" style="width: '+width+';"><label><input type="'+data.rows[0].type+'" name="'+id+'" data-index="text-'+i+'" data-type="choose" id="'+data.rows[0].cell[i]._id+'" data-target="'+id+'" data-point="'+data.rows[0].cell[i].point+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)" '+checked+'></label></div>';
		/*var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		text += '<div class="col-md-2 col-xs-2 text '+selected+'" style="width: '+width+'; text-align: '+_.data.setting.device.align+';" name="text-'+i+'">'+data.rows[0].cell[i].text+'</div>';
		icon += '<div class="col-md-2 col-xs-2 icon" style="width: '+width+'; text-align: '+_.data.setting.device.align+';"><label><input type="'+data.rows[0].type+'" name="'+id+'" data-index="text-'+i+'" '+logic.next_page+' '+logic.hide+' data-type="choose" id="'+data.rows[0].cell[i]._id+'" data-target="'+id+'" onClick="report.onClickObject(this)" '+checked+'></label></div>';*/
	}
	var left = '';
	var right = '';
	if (data.rows[0].display == 'top'){
		rating_row = '<div class="row col-md-12 form-group">'+
						text_left+
						text+
					 '</div>'+
					 '<div class="row col-md-12 form-group">'+
						icon_left+
						icon+
					 '</div>';	
	} else /*if (data.rows[0].display == 'bottom')*/{
		rating_row = '<div class="row col-md-12 form-group">'+
						icon_left+
						icon+
					 '</div>'+
					 '<div class="row col-md-12 form-group">'+
						text_left+
						text+
					 '</div>';
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+						
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+'; text-align: '+_.data.setting.device.align+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="col-md-12 form-group">'+
								rating_row+
							'</div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Icon = function(data, logics, id){
	var _ = this;	
	var result = '';
	var text = '';
	var icon = '';
	var rating_row = '';
	var rows_selected = '';
	count = data.rows[0].cell.length;
	if (data.rows[0].text != null && data.rows[0].text != ''){
		var width = (80/count)+'%';
		var text_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+							
						'</div>';
		var icon_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+
							'<h4 style="color: '+_.data.color.text.option+';" class="help-text">'+data.rows[0].text+'</h4>'+
						'</div>';
	} else {
		var width = (100/count)+'%';
		var text_left = '';
		var icon_left = '';
	}
	for (var i = 0; i < count; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var image = report.buildName(data.rows[0].cell[i].image);			
			rows_selected = 'data-selected="selected"';
			var selected = 'selected';
		} else {
			var image = data.rows[0].cell[i].image;
			var selected = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		text += '<div class="col-md-2 col-xs-2 text '+selected+'" style="color: '+_.data.color.text.option+'; width: '+width+';" name="text-'+i+'">'+data.rows[0].cell[i].text+'</div>';
		icon += '<div class="col-md-2 col-xs-2 icon" style="width: '+width+';"><img src="'+image+'" class="rating-icon" data-index="text-'+i+'" data-type="icon" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)"></div>';
	}
	
	if (data.rows[0].display == 'top'){
		rating_row = '<div class="row col-md-12 form-group">'+
						text_left+
						text+
					 '</div>'+
					 '<div class="row col-md-12 form-group">'+
						icon_left+
						icon+
					 '</div>';	
	} else if (data.rows[0].display == 'bottom'){
		rating_row = '<div class="row col-md-12 form-group">'+
						icon_left+
						icon+
					 '</div>'+
					 '<div class="row col-md-12 form-group">'+
						text_left+
						text+
					 '</div>';
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+						
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="col-md-12 form-group">'+
								rating_row+
							'</div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Score = function(data, logics, id){
	var _ = this;
	var gradient = data.rows[0].gradient;
	var btn_type = data.rows[0].display;
	var rows_selected = '';
	if (btn_type == 'square'){
		var btn_class = 'rating-square';
	} else {
		var btn_class = 'rating-round';
	}
	var result = '';
	var rating_row = '';
	for (var i = 0; i < data.rows[0].cell.length; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var selected = 'selected';
			rows_selected = 'data-selected="selected"';
		} else {
			var selected = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		if (gradient){
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color[i]+'" data-type="score" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		} else {
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color[0]+'" data-type="score" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		}
	}
	//rating_row += '</div>';

	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+						
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="col-md-12 form-group rating-score-row">'+
								rating_row
							'</div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.NPS = function(data, logics, id){
	var _ = this;
	var gradient = data.rows[0].gradient;
	var btn_type = data.rows[0].display;
	var rows_selected = '';
	if (btn_type == 'square'){
		var btn_class = 'rating-square';
	} else {
		var btn_class = 'rating-round';
	}
	var result = '';
	var rating_row = '';
	for (var i = 0; i < data.rows[0].cell.length; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var selected = 'selected';
			rows_selected = 'data-selected="selected"';
		} else {
			var selected = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		if (gradient){
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color[i]+'" data-type="score" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		} else {
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color[0]+'" data-type="score" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		}
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
	        		'<div class="centering text-center">'+
						'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
					'</div>'+
	            	'<div class="col-md-12 form-group rating-score-row">'+
						rating_row
					'</div>'+
				'</div>';
	return result;
}

report.CES = function(data, logics, id){
	var _ = this;
	var gradient = data.rows[0].gradient;
	var btn_type = data.rows[0].display;
	var rows_selected = '';
	var btn_class = 'ces';
	var result = '';
	var rating_row = '';
	for (var i = 0; i < data.rows[0].cell.length; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var selected = 'selected';
			rows_selected = 'data-selected="selected"';
		} else {
			var selected = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		if (gradient){
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color_ces[i]+'" data-type="ces" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		} else {
			rating_row += '<div class="'+btn_class+' '+selected+'" style="background: '+_.color_ces[0]+'" data-type="ces" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+data.rows[0].cell[i].text+'</div>';
		}
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
	        		'<div class="centering text-center">'+
						'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
					'</div>'+
	            	'<div class="col-md-12 form-group rating-ces-row">'+
						rating_row
					'</div>'+
				'</div>';
	return result;
}

report.Smile = function(data, logics, id){
	var _ = this;
	count = data.rows[0].cell.length;
	var result = '';
	var li = '';
	var rows_selected = '';
	for (var i = 0; i < count; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var active = 'selected';
			rows_selected = 'data-selected="selected"';
		} else {
			var active = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		li +=  '<li class="'+active+'" style="width: '+_.size.width+'px; height: '+_.size.height+'px;" data-index="text-'+i+'" data-type="smile" id="'+data.rows[0].cell[i]._id+'" data-point="'+data.rows[0].cell[i].point+'" data-target="'+id+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+
					'<div class="thumbnail" data-title="'+data.rows[0].cell[i].text+'">'+
					    '<img src="'+data.rows[0].cell[i].image+'" style="width: '+_.size.width+'px; height: '+_.size.height+'px;">'+
			        '</div>'+
					'<div class="caption" style="width: '+_.size.width+'px;">'+
					    '<div style="display: table-cell; vertical-align: middle;">'+
					    	'<h4>'+data.rows[0].cell[i].text+'</h4>'+
					    '</div>'+
				    '</div>'+
			    '</li>';
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="rating-row-content form-group" style="width: '+_.width+'px; overflow: auto;"><ul class="row slide" style="width: '+((_.size.width+40)*count)+'px;">'+
								li+
							'</ul></div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Survey = function(data, logics, id){
	var _ = this;
	var result = '';
	var rating_row = '';
	var rows_selected = '';
	for (var i = 0; i < data.rows.length; i++) {
		var text = '';
		var icon = '';		
		count = data.columns.length;
		//var width = (100/count)+'%';
		if ((data.rows[i].text != null && data.rows[i].text != '') 
			|| (data.rows[i].image != null && data.rows[i].image != '')){
			var width = (80/count)+'%';
			var text_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+							
							'</div>';
			var icon_left = '<div class="col-md-3 col-xs-3 row-left" style="width: 20%;">'+
								'<h4 style="color: '+_.data.color.text.option+';" class="survey-text"><img src="'+data.rows[i].image+'" class="rating-survey-icon"> '+data.rows[i].text+'</h4>'+
							'</div>';
		} else {
			var width = (100/count)+'%';
			var text_left = '';
			var icon_left = '';
		}
		
		//var width = (100/count)+'%';
		for (var j = 0; j < count; j++) {
			var value = report.getSelected(id, data.columns[j]._id);
			if (value != null){
				var selected = 'selected';
				rows_selected = 'data-selected="selected"';
			} else {
				var selected = '';
			}
			var logic = _.getLogic(logics, data.rows[i]._id+'-'+data.columns[j]._id);
			icon += '<div class="col-md-2 col-xs-2 icon" style="width: '+width+';"><img src="'+data.columns[j].image+'" class="rating-smile-icon '+selected+'" data-index="text-'+i+'-'+j+'" data-row-id="'+data.rows[i]._id+'" id="'+data.columns[j]._id+'" data-point="'+data.columns[i].point+'" data-target="'+id+'" data-type="survey" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)"></div>';
			text += '<div class="col-md-2 col-xs-2 text '+selected+'" style="color: '+_.data.color.text.option+'; width: '+width+';" name="text-'+i+'-'+j+'">'+data.columns[j].text+'</div>';
		}
		if (data.rows[i].display == 'top'){
			rating_row += '<div class="row col-md-12 form-group">'+
							text_left+
							text+
						 '</div>'+
						 '<div class="row col-md-12 form-group">'+
							icon_left+
							icon+
						 '</div>';	
		} else if (data.rows[i].display == 'bottom'){
			rating_row += '<div class="row col-md-12 form-group">'+
							icon_left+
							icon+
						 '</div>'+
						 '<div class="row col-md-12 form-group">'+
							text_left+
							text+
						 '</div>';
		}
	}

	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="col-md-12 form-group">'+
								rating_row+
							'</div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Star = function(data, logics, id){
	var _ = this;
	var result = '';
	var rating_row = '';
	var rows_selected = '';
	for (var i = 0; i < data.rows.length; i++) {
		var text = '';
		var icon = '';		
		count = data.columns.length;
		if ((data.rows[i].text != null && data.rows[i].text != '') 
			|| (data.rows[i].image != null && data.rows[i].image != '')){
			var width = (60/count)+'%';			
			var icon_left = '<div class="col-md-3 col-xs-3 row-left">'+
								'<h4 style="color: '+_.data.color.text.option+';" class="survey-text">'+data.rows[i].text+'</h4>'+
							'</div>';
		} else {
			var width = (100/count)+'%';
			var icon_left = '';
		}
		for (var j = count-1; j >= 0; j--) {
			var value = report.getSelected(id, data.columns[j]._id);
			if (value != null){
				var selected = 'selected';
				rows_selected = 'data-selected="selected"';
			} else {
				var selected = '';
			}
			var logic = _.getLogic(logics, data.rows[i]._id+'-'+data.columns[j]._id);
			icon += '<input type="radio" id="star-'+i+'-'+(j+1)+'" name="star-'+id+'-'+i+'" value="'+(j+1)+'"/><label class="full" for="star-'+i+'-'+(j+1)+'" title="'+data.columns[j].text+'" data-type="star" data-index="text-'+i+'" id="'+id+'" data-target="'+id+'" data-point="'+(j+1)*2+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)"></label>';			
		}
		rating_row += '<div class="row col-md-12 form-group" style="display: flex; justify-content: center;">'+
						icon_left+
						'<div class="star" name="text-'+i+'">'+
							icon+
						'</div>'+
					  '</div>';
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
	        		'<div class="centering text-center">'+
						'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
					'</div>'+
	            	'<div class="col-md-12 form-group">'+
						rating_row+
					'</div>'+
				'</div>';
	return result;
}

report.Multiple = function(data, logics, id){	
	var _ = this;
	count = data.rows[0].cell.length;
	var max = Math.floor(report.width/(report.size.width+60));
	if (max > 4){
		max = 4;
	}

	if (count > max){
		count = max;
	}
	var result = '';
	var li = '';
	var rows_selected = '';
	/*var margin_left = _.width/2 - 195*count/2;
	if (margin_left < 0){
		margin_left = 0;
	}*/
	for (var i = 0; i < data.rows[0].cell.length; i++) {
		var value = report.getSelected(id, data.rows[0].cell[i]._id);
		if (value != null){
			var active = 'selected';
			rows_selected = 'data-selected="selected"';
		} else {
			var active = '';
		}
		var logic = _.getLogic(logics, data.rows[0].cell[i]._id);
		li +=  '<li class="'+active+'" style="width: '+_.size.width+'px; height: '+_.size.height+'px;" data-type="multiple" data-index="text-'+i+'" id="'+data.rows[0].cell[i]._id+'" data-target="'+id+'" data-point="'+data.rows[0].cell[i].point+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+
					'<div class="thumbnail" data-title="'+data.rows[0].cell[i].text+'">'+
					    '<img src="'+data.rows[0].cell[i].image+'" style="width: '+_.size.width+'px; height: '+_.size.height+'px;">'+
			        '</div>'+
					'<div class="caption" style="width: '+_.size.width+'px;">'+
					    '<div style="display: table-cell; vertical-align: middle;">'+
					    	'<h4>'+data.rows[0].cell[i].text+'</h4>'+
					    '</div>'+
				    '</div>'+
			    '</li>';
	}
	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+
							'</div>'+
			            	'<div class="rating-row-content form-group" style="width: '+_.width+'px; overflow: auto;"><ul class="row multiple" style="width: '+((_.size.width+60)*count)+'px">'+
								li+
							'</ul></div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Question = function(data, logics, id){
	var _ = this;
	var result = '';
	var rows_selected = '';
	var selected = report.getSelected(id, data.rows[0].cell[0]._id);
	if (selected != null){
		var value = selected;
		rows_selected = 'data-selected="selected"';
	} else {
		var value = data.rows[0].cell[0].text;
	}
	var logic = _.getLogic(logics, data.rows[0].cell[0]._id);
	var rating_row = '<div>'
					//+	'<div class="form-group">'
					+		'<textarea class="form-control" rows="5" placeholder="'+data.rows[0].cell[0].placeholder+'" id="question-'+data.rows[0].cell[0]._id+'" data-target="'+data.rows[0].cell[0]._id+'" onKeyup="report.onChangeQuestion(this)">'+value+'</textarea>'
					//+	'</div>'
					+'</div>';

	var mandatory = data.mandatory ? '<span style="color: red;"> (*)</span>' : '';
	result +=  '<div class="rating-row" id="'+id+'" '+rows_selected+' data-mandatory="'+data.mandatory+'">'+
					/*'<div class="container-fluid">'+
			        	'<div class="row-fluid">'+*/
			        		'<div class="centering text-center">'+
								'<h4 style="text-align: '+_.data.setting.device.align+'; color: '+_.data.color.text.heading+'; font-size: '+_.data.fonts.font_size+'; font-family: '+_.data.fonts.font_style+';">'+data.heading_text+mandatory+'</h4>'+								
							'</div>'+
			            	'<div class="col-md-12 form-group text-center">'+			            		
								rating_row+
								'<div class="btn-group hidden" style="position: absolute; top: 5px; right: 20px;" data-index="0" data-type="question" id="'+data.rows[0].cell[0]._id+'" data-target="'+id+'" data-point="'+data.rows[0].cell[0].point+'" '+logic.next_page+' '+logic.hide+' '+logic.send+' onClick="report.onClickObject(this)">'+
									//'<button class="btn btn-default btn-xs" style="background: '+_.data.color.button.select.background+'; color: '+_.data.color.button.select.color+'"><i class="fa fa-check"></i></button>'+
									'<button class="btn btn-default" style="background: '+_.data.color.button.background+'; color: '+_.data.color.button.color+'"><i class="fa fa-check"></i> Confirm</button>'+
								'</div>'+
							'</div>'+
						/*'</div>'+
					'</div>'+*/
				'</div>';
	return result;
}

report.Welcome = function(data){
	var _ = this;
	var result = '';	
	var top = '<div class="header-logo">';
	var middle = '<div class="col-md-12 col-xs-12">';
	var bottom = '<div class="col-md-12 col-xs-12">';
	for (var i = 0; i < data.columns.length; i++) {
		var type = data.columns[i].type;
		var display = data.columns[i].display;
		var html = '';
		switch (type){
			case 'image':
				html = 	 '<img src="'+data.columns[i].image+'">';
				break;
			case 'button':
				if (data.columns[i].background_type == 'round'){
					var border_radius = 'border-radius: 50px;';
				} else {
					var border_radius = '';
				}
				html = 	 '<div class="form-group">'
						+ 	'<button class="btn btn-default" style="'+border_radius+' color: '+data.columns[i].font_color+'; font-family: '+data.columns[i].font_style+'; font-size: '+data.columns[i].font_size+'; background: '+data.columns[i].background+';" onClick="report.nextPage()">'+data.columns[i].text+'</button>'
						+'</div>';
				break;
			case 'text':
				html = 	 '<div class="form-group">'
						+ 	'<span style="color: '+data.columns[i].font_color+'; font-family: '+data.columns[i].font_style+'; font-size: '+data.columns[i].font_size+'">'+data.columns[i].text+'</span>'
						+'</div>';
				break;
		}
		switch (display){
			case 'top':
				top += html;
				break;
			case 'middle':
				middle += html;
				break;
			case 'bottom':
				bottom += html;
				break;
		}
	}
	top += '</div>';
	middle += '</div>';
	bottom += '</div>';

	result +=    '<div>'+
					'<div class="container-fluid">'+
						top+
			        	'<div class="row-fluid">'+
			            	'<div class="centering text-center">'+
			            		'<div class="container-welcome">'+
									middle+
									bottom+
								'</div>'+
			            	'</div>'+
			        	'</div>'+
			      	'</div>'+
					/*'<div class="rating-row">'+
						
					'</div>'+*/
                '</div>';    
	return result;
}

report.Exit = function(data){
	var _ = this;
	var result = '<div>'+
					'<div class="container-fluid">'+
						'<div class="header-logo">'+
				 			'<img src="'+data.columns[0].image+'">'+
				 		'</div>'+
						'<div class="row-fluid">'+
					 		'<div class="centering text-center">'+
			            		'<div class="container-welcome">'+
									'<div class="form-group">'+
							 			'<span style="color: '+data.columns[0].font_color+'; font-family: '+data.columns[0].font_style+'; font-size: '+data.columns[0].font_size+'">'+data.columns[0].text+'</span>'+
							 		'</div>'+
									'<div class="form-group">'+
							 			'<span>'+data.columns[0].placeholder+'</span>'+
							 		'</div>'+
							 	'</div>'+
						'</div>'+
					'</div>'+						
                '</div>';	
	return result;
}

report.getSize = function(){
	var _ = this;
	if (_.width <= 736){
		return {width: 115, height: 155};
	}

	if (_.width > 736 && _.width < 1024){
		return {width: 135, height: 175};
	}

	if (_.width >= 1024){
		return {width: 145, height: 185};
	}
}

report.nextObject = function(isSelected){
	/*var _ = this;
	var rows = $('.rating-row');
	for (var i = 0; i < rows.length; i++) {
		if (isSelected){
			if ($(rows[i]).attr('data-selected') != 'selected'){
				var top = $(rows[i]).offset().top;
				$('.content').scrollTo(top, 300);
				break;
			}
		} else {
			if ($(rows[i]).attr('id') == _.object_id){
				var index = i + 1;
				if (index >= rows.length){
					index = rows.length - 1;
				}
				var top = $(rows[index]).offset().top;
				$('.content').scrollTo(top, 300);
				break;
			}
			
		}
		
	}	*/
}

report.getDevice = function(){
    var unknown = '-';

    // screen
    var screenSize = '';
    if (screen.width) {
        width = (screen.width) ? screen.width : '';
        height = (screen.height) ? screen.height : '';
        screenSize += '' + width + " x " + height;
    }

    // browser
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browser = navigator.appName;
    var version = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Opera Next
    if ((verOffset = nAgt.indexOf('OPR')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 4);
    }
    // Edge
    else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
        browser = 'Microsoft Edge';
        version = nAgt.substring(verOffset + 5);
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(verOffset + 5);
    }
    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
        browser = 'Chrome';
        version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
        browser = 'Safari';
        version = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
        browser = 'Firefox';
        version = nAgt.substring(verOffset + 8);
    }
    // MSIE 11+
    else if (nAgt.indexOf('Trident/') != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browser = nAgt.substring(nameOffset, verOffset);
        version = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

    majorVersion = parseInt('' + version, 10);
    if (isNaN(majorVersion)) {
        version = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    // mobile version
    var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
    }

    // system
    var os = unknown;
    var clientStrings = [
        {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
        {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
        {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
        {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
        {s:'Windows Vista', r:/Windows NT 6.0/},
        {s:'Windows Server 2003', r:/Windows NT 5.2/},
        {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
        {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
        {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
        {s:'Windows 98', r:/(Windows 98|Win98)/},
        {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
        {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s:'Windows CE', r:/Windows CE/},
        {s:'Windows 3.11', r:/Win16/},
        {s:'Android', r:/Android/},
        {s:'Open BSD', r:/OpenBSD/},
        {s:'Sun OS', r:/SunOS/},
        {s:'Linux', r:/(Linux|X11)/},
        {s:'iOS', r:/(iPhone|iPad|iPod)/},
        {s:'Mac OS X', r:/Mac OS X/},
        {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {s:'QNX', r:/QNX/},
        {s:'UNIX', r:/UNIX/},
        {s:'BeOS', r:/BeOS/},
        {s:'OS/2', r:/OS\/2/},
        {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];
    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }

    var osVersion = unknown;

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = 'Windows';
    }

    switch (os) {
        case 'Mac OS X':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
            break;

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            break;
    }

    // flash (you'll need to include swfobject)
    /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
    var flashVersion = 'no check';
    if (typeof swfobject != 'undefined') {
        var fv = swfobject.getFlashPlayerVersion();
        if (fv.major > 0) {
            flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
        }
        else  {
            flashVersion = unknown;
        }
    }

    var jscd = {
        screen: screenSize,
        browser: browser,
        browserVersion: version,
        browserMajorVersion: majorVersion,
        mobile: mobile,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled,
        flashVersion: flashVersion
    };
    /*var debug = '';
    debug += 'OS: ' + jscd.os +' '+ jscd.osVersion + '<br/>';
    debug += 'Browser: ' + jscd.browser +' ' + jscd.browserVersion + '<br/>';
    
    document.getElementById('log').innerHTML = debug;*/
    //console.log(JSON.stringify(jscd));
    var md = new MobileDetect(window.navigator.userAgent);
    var type = 'Other';
    if (md.phone() != null)
    	type = 'Phone'
    else if (md.tablet() != null) 
    	type = 'Tablet'
    return type+'/'+jscd.os + ' ' + jscd.osVersion + '/' + jscd.browser + ' ' + jscd.browserVersion;
}

report.sendRating = function(timeout){
	var _ = this;
	var count = $('[data-mandatory="true"][data-selected="selected"]').length;
	var max = $('[data-mandatory="true"]').length;
	console.log(_.selected);
	for(var i=0;i<_.selected.length;i++){
		var itemData={
			_id:'',
			answer:[],
			survey: _.selected_survey,
			page:[]
		}
		itemData._id=_.selected[i]._id;
		for(var j=0;j<_.selected[i].selected.length;j++){
			for(var k=0;k<_.selected[i].selected[j].selected_id.length;k++){
				itemData.page.push(_.selected[i].selected[j].selected_id[k]);
			}	
			for(var l=0;l<_.selected[i].selected[j].selected_value.length;l++){
				if(_.selected[i].selected[j].selected_value[l]!=""){
					var ans={
						_id:_.selected[i].selected[j].selected_id[l],
						text:_.selected[i].selected[j].selected_value[l]
					}
					itemData.answer.push(ans);
				}			
			}	
		}
		_.sendData.push(itemData);
	}
	console.log(_.sendData);
	if (count == max){
		_.stop_time = _.getDate();
		var tags = [];
		if (_.data.setting.tags.isAutoTag){
			var point = report.getSelectedPoint();
			if (point <= _.data.setting.feedback.negative){
				tags = [_.tags.negative];
			} else if (point <= _.data.setting.feedback.neutral){
				tags = [_.tags.neutral];
			} else{
				tags = [_.tags.positive];
			}
		}
		var data = report.data;
		console.log(_.selected);
		$.ajax({
		  	url : 'http://172.16.9.141:3000/api/respondent/'+_.layout_id,
		  	data:JSON.stringify({
				type:"URL",
				send_by:_.getDevice(),
				start_at:_.start_time,
				stop_at:_.stop_time,
				tag:tags,
				data: _.sendData,

			}),
		  	contentType: 'application/json',
		  	dataType: 'json',
		  	type : 'POST',
		  	success : function(data) {
		  		$('#btn-send').attr('disabled','disabled');
		  		if (timeout == null){
					timeout = Number(_.data.setting.screen.timeout)*1000;
				}
				_.isSendRating = true;
				//_.index = _.data.pages.length - 1;
				report.nextPage(null, true);
				setTimeout(function(){
					window.location.reload();
				}, timeout);
		  	},
		  	error: function(){
		  	}
		});
	} else {
		var row = $('.rating-row[data-mandatory="true"][data-selected!="selected"]')[0];
		if (row != null) {
			var top = $(row).offset().top;
			$('.content').scrollTo(top, 300);
		}
	}
}

/*report.createJson = function(){
	var data = report.data;
	data.pages.splice(data.pages.length-1,1);
	data.pages.splice(0,1);
	for (var i = 0; i < report.selected.length; i++) {
		report.selected[i]
	}
}*/

report.getSelectedPoint = function(){
	var _ = this;
	var totalPoint = 0;
	var count = 0;
	for (var i = 0; i < _.selected.length; i++) {
		var selected = _.selected[i].selected;
		for (var j = 0; j < selected.length; j++) {
			var point = 0;
			for (var x = 0; x < selected[j].point.length; x++) {
				point += Number(selected[j].point[x]);
			}
			if (selected[j].point.length != 0){
				point = point/selected[j].point.length;
			}
			totalPoint += point;
			count++;
		}
	}
	if (count != 0){
		totalPoint = totalPoint/count;
	}
	return Number(totalPoint);
}

report.nextPage = function(page_id, isSend){
	var _ = this;
	if (report.checkPage()){
		$('#btn-send').removeAttr('disabled');
		if (page_id != null && page_id != ''){
			for (var i = 0; i < _.data.pages.length; i++) {
				if (_.data.pages[i].page_id == page_id){
					_.index = i;
					break;
				}
			}
		} else {
			var count = $('.rating-row[data-selected="selected"]').length;
			var max = _.data.pages[_.index].page.length;
			if (count < max && _.data.pages[_.index].type != 'intro') {
				report.nextObject(false);
				return;
			} else {
				if (_.data.pages[_.index].type == 'exit' && _.data.setting.screen.exit){
					_.drawObject(isSend);
				} else if (_.data.pages[_.index].type == 'intro' || !_.data.pages[_.index].widget.send.status){
					_.index++;
					if (_.index >= _.data.pages.length){
						_.index = _.data.pages.length - 1;
					}
					if (_.data.pages[_.index].type == 'exit' && _.data.setting.screen.exit){
						report.sendRating();
					}
				} else {
					if (isSend){
						if (_.data.setting.screen.exit){
							_.index = _.data.pages.length - 1;
							_.drawObject(isSend);
						} else window.location.reload();
					}
					return;
				}
			}
		}
		if (_.data.pages[_.index].type == 'exit' && _.data.pages[_.history.length-1].widget.send.status){
			_.index--;
		} else {
			_.drawObject(isSend);
		}
		//_.drawObject(isSend);
	} else {
		report.nextObject(false);
	}
}

report.prevPage = function(){
	var _ = this;	
	var page_id = _.data.pages[_.index].page_id;
	for (var i = 0; i < _.selected.length; i++) {
		if (_.selected[i].page_id == page_id){
			_.selected[i].selected = [];
			break;
		}
	}
	_.history.splice(_.history.length - 1, 1);
	_.index = _.history.pop();
	_.drawObject();
}

report.checkPage = function(){
	var _ = this;
	var pages = _.data.pages[_.index];
	if (pages.type == 'intro' || pages.type == 'exit'){
		return true;
	} else {
		var count = $('[data-mandatory="true"][data-selected="selected"]').length;
		var max = $('[data-mandatory="true"]').length;
		if (count >= max){
			return true;
		} else {
			return false;
		}
	}
}

report.onClickObject = function($this){
	var _ = this;	
	var target = $($this).attr('data-target');	
	//var object_type = $($this).attr('data-object-type');
	var id = $($this).attr('id');
	var type = $($this).attr('data-type');
	var index = $($this).attr('data-index');
	var point = $($this).attr('data-point');
	var isMultiple = false;
	if (type == 'question'){
		var value = $('#question-'+id).val();
		$($this).addClass('hidden');
	} else if(type == 'survey') {
		var survey = {
			row_id : $($this).attr('data-row-id'),
			column_id: $($this).attr('id')
		}
		_.selected_survey.push(survey);
		var value = '';
		id = $($this).attr('data-row-id');
	} else {
		var value = '';
	}
	if (type == 'multiple'){
		$($this).fadeOut();
		$($this).toggleClass('selected');
		isMultiple = true;
	} else if (type == 'star'){
		$('#'+target).find('.selected').removeClass('selected');
		$('#'+target).find('[name="'+index+'"]').fadeOut();
		$($this).toggleClass('selected');
	} else {
		$('#'+target).find('.selected').removeClass('selected');
		$($this).fadeOut();
		$($this).addClass('selected');
	}
	$('#'+target).find('[name="'+index+'"]').fadeOut();
	$('#'+target).find('[name="'+index+'"]').addClass('selected');
	
	
	if (type == 'icon'){
		/*$('#'+target).find('.selected').removeClass('selected');
		$($this).addClass('selected');*/
		var imgs = $('#'+target).find('img');
		for (var i = 0; i < imgs.length; i++) {
			var img = $(imgs[i]).attr('src').split('-select');
			if (img.length > 1){
				$(imgs[i]).attr('src', img[0]+img[1]);
			} else {
				$(imgs[i]).attr('src', img[0]);
			}
		}
		var src = $($this).attr('src');
		src = report.buildName(src);
		$($this).attr('src', src);
	}
	
	$('#'+target).attr('data-selected', 'selected');
	_.object_id = target;
	report.addSelect(target, type, id, value, point, isMultiple);

	var hide = $($this).attr('data-hide');
	var send = $($this).attr('data-send');
	if (send == "true"){
		report.sendRating();
	} else if (hide == null){
		var next_page = $($this).attr('data-next-page');
		//if (next_page != null || !_.data.pages[_.index].widget.send.status)
		report.nextPage(next_page);
	} else {
		$('#'+target).hide('slow');
	}
	$('#'+target).find('[name="'+index+'"]').fadeIn();
	$($this).fadeIn();
}

report.addSelect = function(object_id, object_type, id, value, point, isMultiple){
	var _ = this;
	var page_id = _.data.pages[_.index].page_id;
	for (var i = 0; i < _.selected.length; i++) {
		if (_.selected[i].page_id == page_id){
			var selected = _.selected[i].selected;
			for (var j = 0; j < selected.length; j++) {
				if (selected[j].object_id == object_id){
					if (isMultiple){
						var index = selected[j].selected_id.indexOf(id);
						if (index !== -1){
							selected[j].selected_id.splice(index, 1);
							selected[j].selected_value.splice(index, 1);
							selected[j].point.splice(index, 1);
						} else {
							selected[j].selected_id.push(id);
							selected[j].selected_value.push(value);
							selected[j].point.push(point);
						}

					} else {
						selected[j].selected_id = [id];
						selected[j].selected_value = [value];
						selected[j].point = [point];
					}
					return;
				}
			}
			selected.push({
				object_id: object_id,
				object_type: object_type,
				selected_id: [id],
				selected_value: [value],
				point: [point]
			});
			break;
		}
	}
}

report.getSelected = function(object_id, id){
	var _ = this;
	var page_id = _.data.pages[_.index].page_id;
	for (var i = 0; i < _.selected.length; i++) {
		if (_.selected[i].page_id == page_id){
			var selected = _.selected[i].selected;
			for (var j = 0; j < selected.length; j++) {
				if (selected[j].object_id == object_id && selected[j].selected_id == id){
					return selected[j].selected_value;
				}
			}
		}
	}
	return null;
}

report.buildName = function(image){
	var ext = '.'+image.split('.').pop();
	var result = image.split(ext);
	result = result[0]+'-select'+ext;
	return result;
}

report.onChangeQuestion = function($this){
	var value = $($this).val();
	var target = $($this).attr('data-target');
	if (value.trim().length > 0){
		$('#'+target).removeClass('hidden');
	} else {
		$('#'+target).addClass('hidden');
	}
}

report.getLogic = function(logics, object_id){
	var result = {
		next_page: '',
		hide: '',
		send: ''
	}
	for (var i = 0; i < logics.next_page.length; i++) {
		if (logics.next_page[i].selected.indexOf(object_id) > -1){
			result = {
				next_page: 'data-next-page="'+logics.next_page[i].next_to+'"',
				hide: '',
				send: ''
			}
			return result;
		}
	}
	if (logics.hide.indexOf(object_id) > -1){
		result = {
			next_page: '',
			hide: 'data-hide="true"',
			send: ''
		}
		return result;
	}
	if (logics.send.indexOf(object_id) > -1){
		result = {
			next_page: '',
			hide: '',
			send: 'data-send="true"'
		}
		return result;
	}
	return result;
}

report.hexToRGB = function(hex, alpha) {
	if (hex.length == 7){
		var r = parseInt(hex.slice(1, 3), 16),
	        g = parseInt(hex.slice(3, 5), 16),
	        b = parseInt(hex.slice(5, 7), 16);
	} else {
		var r = parseInt(hex.slice(1, 2)+hex.slice(1, 2), 16),
	        g = parseInt(hex.slice(2, 3)+hex.slice(2, 3), 16),
	        b = parseInt(hex.slice(3, 4)+hex.slice(3, 4), 16);
	}
    

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

report.showHideDoneButton = function(){
	var _ = this;
	var length = _.data.pages.length - 1;
	if (!_.data.setting.screen.intro){
		length--;
	}
	if (!_.data.setting.screen.exit){
		length--;
	}
	if (length == _.data.pages.length){
		length--;
	}
	if (_.index >= length && !_.data.setting.general.isHideButton){
		$('#layout-bottom').removeClass('hidden');
	} else if (_.index >= length){
		//report.sendRating(Number(_.data.setting.screen.timeout)*1000);
	}
}
 
report.setup = function() {
	var _ = this;
	_.isStartTimer = false;
    document.addEventListener("mousemove", function(){_.resetTimer();}, false);
    document.addEventListener("mousedown", function(){_.resetTimer();}, false);
    document.addEventListener("keypress", function(){_.resetTimer();}, false);
    document.addEventListener("DOMMouseScroll", function(){_.resetTimer();}, false);
    document.addEventListener("mousewheel", function(){_.resetTimer();}, false);
    document.addEventListener("touchmove", function(){_.resetTimer();}, false);
    document.addEventListener("MSPointerMove", function(){_.resetTimer();}, false);
}
 
report.startTimer = function () {
	var _ = this;
	_.isStartTimer = true;
    _.timeoutID = setTimeout(function(){_.goInactive();}, _.timer);
}
 
report.resetTimer = function() {
	var _ = this;
    clearTimeout(_.timeoutID);
    clearTimeout(_.reloadTimeoutID);
    if (_.isStartTimer){
    	_.goActive();
    }
}
 
report.goInactive = function() {
	var _ = this;
	clearTimeout(_.timeoutID);
	_.reloadTimeoutID = setTimeout(function(){
		var countMandatory = $('[data-mandatory="true"][data-selected="selected"]').length;
		var count = $('[data-selected="selected"]').length;
		var max = $('[data-mandatory="true"]').length;
		if (_.data.setting.device.restart == undefined) _.data.setting.device.restart = 0;
		if (countMandatory == max && count > 0){
			var html = '<div class="modal-header">'+
							'<h4 class="modal-title">Your session is about to expire!</h4>'+
						'</div>'+
						'<div class="modal-body">'+
							'<div class="row">'+
								'<div class="col-md-12 form-group" style="text-align: center;">'+
									'<h4>Your rating will be sent in '+_.data.setting.device.restart+' seconds.<br/>Do you want to continute your rating?</h4>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="modal-footer">'+
							'<button class="btn btn-primary" onClick="report.sendRatingModal()"><i class="fa fa-paper-plane"></i> Send Rating <span id="countdown">'+_.data.setting.device.restart+'s</span></button>'+
							'<button class="btn btn-default" onClick="report.continuteRating()">Continute</button>'+
						'</div>';
			$('#modal-content').html(html);
			$('#popup').modal({backdrop:'static', show: true});
			_.countdown = _.data.setting.device.restart;
			_.modalTimeout = setInterval(function(){
				if (_.countdown == 0){
					$('#popup').modal('hide');
					_.sendRating();
					clearInterval(_.modalTimeout);
					return;
				}
				_.countdown--;
				$('#countdown').text(_.countdown+'s');
			}, 1000);
		} else {
			var html = '<div class="modal-header">'+
							'<h4 class="modal-title">Your session is about to expire!</h4>'+
						'</div>'+
						'<div class="modal-body">'+
							'<div class="row">'+
								'<div class="col-md-12 form-group" style="text-align: center;">'+
									'<h4>Your rating will be cancelled in '+_.data.setting.device.restart+' seconds.<br/>Do you want to continute your rating?</h4>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="modal-footer">'+
							'<button class="btn btn-primary" onClick="window.location.reload()"><i class="fa fa-home"></i> Home <span id="countdown">'+_.data.setting.device.restart+'s</span></button>'+
							'<button class="btn btn-default" onClick="report.continuteRating()">Continute</button>'+
						'</div>';
			$('#modal-content').html(html);
			$('#popup').modal({backdrop:'static', show: true});
			_.countdown = _.data.setting.device.restart;
			_.modalTimeout = setInterval(function(){
				if (_.countdown == 0){
					$('#popup').modal('hide');
					window.location.reload();
					return;
				}
				_.countdown--;
				$('#countdown').text(_.countdown+'s');
			}, 1000);
		}
		
		//window.location.reload();
	}, 500);
    //console.log('Inactive');
}

report.sendRatingModal = function(){
	var _ = this;
	$('#popup').modal('hide');
	_.sendRating();
	clearInterval(_.modalTimeout);
}

report.continuteRating = function(){
	var _ = this;
	clearInterval(_.modalTimeout);
	$('#popup').modal('hide');
	_.resetTimer();
}
 
report.goActive = function() {
	var _ = this;
    _.startTimer();
}