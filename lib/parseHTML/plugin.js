var ESMILE = {
	version: 'v2.0',
	getPluginById: 'http://172.16.9.188:8123/api_management/content/getpluginbyid',
	postRating: 'http://172.16.9.188:8123/api_management/content/postplugin',
	element_id: null,
	app_id: null,
	color: ['#ff0000', '#ff4000', '#ff6633', '#ff8000', '#ffbf00', '#ffd966', '#ace600', '#80ff00', '#40ff00', '#00ff40', '#00ff80', '#00ffbf', '#00ffff', '#00bfff', '#0080ff', '#0040ff', '#0000ff', '#4000ff', '#8000ff', '#bf00ff']
}

ESMILE.init = function(app_id, element_id, version){
	var _ = this;
	_.element_id = element_id;
	var element = document.getElementById(element_id);
	if (version != _.version){		
		element.innerHTML = "Please update to the latest version "+_.version;
	} else {
		/*var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
		    if (request.readyState === 4) {
		        if (request.status === 200) {
		            document.body.className = 'ok';
		            console.log(request.responseText);
		        } else if (!isValid(this.response) && this.status == 0) {
		            document.body.className = 'error offline';
		            console.log("The computer appears to be offline.");                
		        } else {
		            document.body.className = 'error';
		        }
		    }
		};
		request.open("GET", _.getPluginById+element_id, true);
		request.send(null);*/
		/*var data = {
			"app_text":"test add 2 type = choose",
			"app_name":"test add 2",
			"website":"http://e-smile.vn",
			"app_type":"choose",
			"app_object":[
				{"object_image":null,"object_name":"Excelent","object_id":"g90fan3mcdn"},
				{"object_image":null,"object_name":"Good","object_id":"zbyfphk2gx"},
				{"object_image":null,"object_name":"Average","object_id":"53uw83w4mmj"},
				{"object_image":null,"object_name":"Poor","object_id":"crqs419tjk5"},
				{"object_image":null,"object_name":"Very Poor","object_id":"q2edduiaa9"}
			],
			"app_id":"981485104781966",
			"app_image":"http://172.16.9.141:3002/client/content/app-981485104781966-1520840012906.png",
			"contact_email":null,
			"status":"1"
		}*/
		/*var data = {
			"app_text":"type = smile",
			"app_name":"test add and reload",
			"website":"http://e-smile.vn",
			"app_type":"smile",
			"app_object":[
				{"object_image":"http://172.16.9.70:8383/eSmile_Admin_V2/ELCModule/images/icon/Excellent.png","object_name":"Excelent","object_id":"ulgtc4xlf78"},
				{"object_image":"http://172.16.9.70:8383/eSmile_Admin_V2/ELCModule/images/icon/Good.png","object_name":"Good","object_id":"z25k9bve24m"},
				{"object_image":"http://172.16.9.70:8383/eSmile_Admin_V2/ELCModule/images/icon/Average.png","object_name":"Average","object_id":"69qu62i4zgr"},
				{"object_image":"http://172.16.9.70:8383/eSmile_Admin_V2/ELCModule/images/icon/Poor.png","object_name":"Poor","object_id":"09a2qkfelwl6"},
				{"object_image":"http://172.16.9.70:8383/eSmile_Admin_V2/ELCModule/images/icon/VeryPoor.png","object_name":"Very Poor","object_id":"y7znt9cfage"}
			],
			"app_id":"674136683710556",
			"app_image":"http://172.16.9.141:3002/client/content/app-674136683710556-1520840327065.png",
			"contact_email":null,
			"status":"1"
		}*/

		//var data = {"app_text":"Bạn có hài lòng?","app_name":"Test app score","website":null,"app_type":"score","app_object":[{"object_image":null,"object_name":"0","object_id":"rexu3bijuu"},{"object_image":null,"object_name":"1","object_id":"mg74ny21cih"},{"object_image":null,"object_name":"2","object_id":"f7g9431di0w"},{"object_image":null,"object_name":"3","object_id":"ubg60rqc6u8"},{"object_image":null,"object_name":"4","object_id":"0ekrlngdj18"},{"object_image":null,"object_name":"5","object_id":"48lwaa2051a"},{"object_image":null,"object_name":"6","object_id":"pw0u8nndeb8"},{"object_image":null,"object_name":"7","object_id":"7mst001van3"},{"object_image":null,"object_name":"8","object_id":"frorho02h0a"},{"object_image":null,"object_name":"9","object_id":"91atwcrmw8"},{"object_image":null,"object_name":"10","object_id":"ybb89n58r7r"}],"app_id":"464376997241189","app_image":"http://172.16.9.141:3002/client/content/app-464376997241189-1521002002264.png","contact_email":null,"status":"1"}
		//{"session_id": "", user_id: '', app_id: ''}
		var json = {
			"app_id": app_id
		};
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
		    if (request.readyState === 4) {
		        if (request.status === 200) {
		        	var data = JSON.parse(request.response);
		        	data = data.plugin;
                    if (data.app_id == undefined){
                        element.innerHTML = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><h4 style="text-align: center;">No Content</h4></div></div>';
                    } else {
                        var html = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><div style="text-align: center;"><h4 style="color: #139c32;">'+_.encodeHTML(data.app_text)+'</h4></div>';
                    if (data.app_type == 'choose'){
                        var icon = '<div style="margin-bottom: 10px;">';
                        var text = '<div style="margin-bottom: 10px;">';
                        var app_object = data.app_object;
                        var width = 100/app_object.length+'%';
                        for (var i = 0; i < app_object.length; i++) {
                            icon += '<div style="width: '+width+'; text-align: center; float: left;">'+
                                            '<input type="radio" name="app-rating-radio" data-id="'+app_object[i].object_id+'" data-name="'+app_object[i].object_name+'" data-app-id="'+data.app_id+'" data-text="'+data.app_text+'" data-image="'+app_object[i].image+'" data-type="'+data.app_type+'" onClick="ESMILE.sendRating(this)"/>'+
                                        '</div>';
                            text += '<div style="width: '+width+'; text-align: center; float: left;">'+app_object[i].object_name+'</div>';
                        }
                        icon += '</div>';
                        text += '</div>';
                    } else if (data.app_type == 'smile'){
                        var icon = '<div style="margin-bottom: 10px;">';
                        var text = '<div style="margin-bottom: 10px;">';
                        var app_object = data.app_object;
                        var width = 100/app_object.length+'%';
                        for (var i = 0; i < app_object.length; i++) {
                            icon += '<div style="width: '+width+'; text-align: center; float: left;">'+
                                            '<img src="'+app_object[i].object_image+'" style="max-width: 45px; max-height: 45px;" data-id="'+app_object[i].object_id+'" data-name="'+app_object[i].object_name+'" data-app-id="'+data.app_id+'" data-text="'+data.app_text+'" data-image="'+app_object[i].image+'" data-type="'+data.app_type+'" onClick="ESMILE.sendRating(this)"/>'+
                                        '</div>';
                            text += '<div style="width: '+width+'; text-align: center; float: left;">'+_.encodeHTML(app_object[i].object_name)+'</div>';
                        }
                        icon += '</div>';
                        text += '</div>';
                    } else {
                        var icon = '<div style="display: flex; justify-content: center;">';
                        var text = '';
                        var app_object = data.app_object;
                        var width = 100/app_object.length+'%';
                        for (var i = 0; i < app_object.length; i++) {
                            icon += '<div style="background: '+_.color[i]+'; color: #fff; float: left; margin: 1px !important; margin-bottom: 10px !important; display: flex; align-items: center; justify-content: center; width: 45px; height: 45px;" '+
                                        'data-id="'+app_object[i].object_id+'" data-name="'+app_object[i].object_name+'" '+
                                        'data-app-id="'+data.app_id+'" data-text="'+data.app_text+'" '+
                                        'data-image="'+app_object[i].image+'" data-type="'+data.app_type+'" '+
                                        'onClick="ESMILE.sendRating(this)">'+
                                        _.encodeHTML(app_object[i].object_name)+
                                    '</div>';
                            //text += '<div style="width: '+width+'; text-align: center; float: left;">'+app_object[i].object_name+'</div>';
                        }
                        icon += '</div>';
                        text += '';
                    }
                    html += icon+text+'</div></div>';
                    element.innerHTML = html;
                    }
		        } else {
		            element.innerHTML = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><h4 style="text-align: center;">No Content</h4></div></div>';
		            //console.log("The computer appears to be offline.");                
		        } /*else {
		            element.innerHTML = '<h4 style="text-align: center;">Error</h4>';
		        }*/
		    }
		};
		request.open("POST", _.getPluginById, true);
		request.setRequestHeader("Content-type", "application/json");
		request.send(JSON.stringify(json));
	}
}

ESMILE.getDevice = function(){
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
    return jscd.os + ' ' + jscd.osVersion + '/' + jscd.browser + ' ' + jscd.browserVersion;
}

ESMILE.sendRating = function($this){
	var _ = this;
	var app_id = $this.getAttribute('data-app-id');
	var text = $this.getAttribute('data-text');
	var id = $this.getAttribute('data-id');
	var name = $this.getAttribute('data-name');
	var image = $this.getAttribute('data-image');
	var type = $this.getAttribute('data-type');
	var device = ESMILE.getDevice();
	var data = {
		"device": device,
		"app_id": app_id,
		"type": type,
		'text': text,
		"selected": [
			{"id": id, "name": name, "image": image}
		]
	};
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
	    if (request.readyState === 4) {
	        if (request.status === 200) {
	            document.getElementById(_.element_id).innerHTML = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><h4 style="text-align: center;">Thank you for taking the time to provide us with your feedback.</h4></div></div>';
	            console.log(request.responseText);
	        } else if (!isValid(this.response) && this.status == 0) {
	            document.getElementById(_.element_id).innerHTML = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><h4 style="text-align: center;">Cannot connect to server</h4></div></div>';
	            //console.log("The computer appears to be offline.");                
	        } else {
	            document.getElementById(_.element_id).innerHTML = '<div style="display: table; width: 100%; height: 100%;"><div style="display: table-cell; vertical-align: middle;"><h4 style="text-align: center;">Cannot connect to server</h4></div></div>';
	        }
	    }
	};
	request.open("POST", _.postRating, true);
	request.setRequestHeader("Content-type", "application/json");
	request.send(JSON.stringify(data));
}

ESMILE.encodeHTML = function(input) {
	var output = '';
	if (input != null && input != ''){
		for (i = 0; i < input.length; i++) {
			if (input.charCodeAt(i) > 127) {
				output += '&#' + input.charCodeAt(i) + ';';
			} else {
				output += input.charAt(i);
			}
		}
	}
	return output;
}