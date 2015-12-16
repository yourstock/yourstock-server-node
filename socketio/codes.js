var http = require('http');
var codes = '';
var curData = '';
var minMaxData = {};
var rank = [];
var rankPush = [];
var object = [];
var childProcess = require("child_process");
var retrieveChild;
var jogun = [];
var bigObj = [], deviceList = [];
module.exports = { 
	emit: function(emit) {
		emit(object);
	},
	
	emitHistory: function(emit) {
		emit(minMaxData);
	},	

	getCurrentPrices: function (emit) {
	
	getLowestPrice(function() { 
		
		this.retrieveChild.on('message', function(msg){
				console.log("Recv'd message from background.");
				object = msg.content;
				

		}.bind(this));	
	
	});
	},
	
	deviceRegister: function (id) {
		if(deviceList[id[0]]) 
			 deviceUnregister(id[0]);	
//		console.log(id);
	 	deviceList[id[0]] = { repush: -1,  iid : setInterval(function () {
			if(deviceList[id[0]].repush == -1) {
			compare(id[1], id[2] , id[3], object, function(theO) {
					for(i in theO) 
						push(theO[i].obj.company, theO[i].obj.price, id[1], id[0]);
					if(theO) 
						deviceList[id[0]].repush = 1;
			}) 
			}},  20000) };
	}
	

};



/* token, min(0)/max(1), percentage, duration(0~7) */
registerInfo = [ 'diUYi3UIAWc:APA91bHHpM3_0hv9x9OvrHVy-H9Dh2CDdF0l-js7Cn69XZiFyl5giRTFweAUfhb01DhUf9RwB2H__zckxfyOoPawbp5ef0q3TCUARXpdZ5MkArPwIvPZfiXy9MhFHfWGtcNjK8h7yW8B' , 0, 0, 7];

registerInfo2 = [ 'blahblah' , 0, 0, 6 ];


function deviceUnregister(id) {
	clearInterval(deviceList[id].iid);
	deviceList[id].iid = null;
	deviceList[id].repush = -1;
}

setInterval(function () {
	for(i in deviceList) 
		deviceList[i].repush = -1;
	}, 60 * 60 * 1000);
	 

function start() {
	this.retrieveChild = childProcess.fork("./crawler");

	var data = {
		"start":true,
		"interval": 10 * 1000,
	}

	this.retrieveChild.send(data);
	
	module.exports.getCurrentPrices();
}

function combine2(object, minMaxData, cb) {
	var bigObj = []

	for (i in object) 
		for (j in minMaxData) 
			if(object[i].code == minMaxData[j].simple_code.substr(1))
				bigObj.push( { current: object[i], minmax: minMaxData[j] });
		
	cb(bigObj);
}

function shilshigan(cb) {
	var request = require('request');
	var url = 'http://www.naver.com';
	
	function execNaver() {
		request(url, function(err, response, body) {
			var cheerio = require('cheerio');
			
			if(err) return console.error(err);
			
			$ = cheerio.load(body);
			$("ol li").each(function() {
				rank.push($("a", this).attr("title"));
			});
			
			request("http://www.daum.net", function(err, response, body) {
			var cheerio = require('cheerio');
			
			if(err) return console.error(err);
			
			$ = cheerio.load(body);
			$("ol.list_issue span.txt_issue").each(function() {
				if(rank.indexOf($("a", this).text().trim()) == -1)
					rank.push($("a", this).text().trim());
			});
			cb();
			});
		});
	}
			
	execNaver();
}

function getFullCode(codes, code) {

	for (var i = 0, codelength = codes.length; i < codelength; i++) {
		if(codes[i].code == code){
			return codes[i].fullcode;
		}
	}
}

function getCode(codes, fullcode) {
	for (var i = 0, codelength = codes.length; i < codelength; i++) 
		if(codes[i].fullcode == fullcode)
			return codes[i].code;
	
}	


function getPrice(id) {

	var options = {
			host: "api.finance.naver.com",
			path: "/service/itemSummary.nhn?itemcode=" + id,
			port: '80',
			ID: id
		};

		http.get(options, function(response) {

			response.on('data', function(chunk) {
				curData = chunk;
		});
			response.on('end', function () {
				var obj = JSON.parse(curData);
				console.log("CODE: " + options.ID + " : " + obj.now + " : ");

			});
		}).end();
}

function getLowestPrice(cb) {

	var mongodb = require("../mongodb.js");

	mongodb.findall("history_min_max", function (history) {
		for(i in history) 
			minMaxData[history[i].simple_code.substr(1)] = history[i];
		cb();
	});		


}


function compare(type, percentage, year ,object, cb) {
	var theObj = [];
	if(type == 0) { //LOWEST PRICE
		for (i in object){
				if(object[i].price != '0' && minMaxData[object[i].code] &&  parseInt(object[i].price.replace(/,/g,"")) <= ((1+((percentage-100)/100))*parseInt(minMaxData[object[i].code].data[year].min))) 
				theObj.push({ obj:object[i], data:minMaxData[object[i].code] });
		}
	}
	else //HIGHEST PRICE 
	{
		for (i in object) {
			if(object[i].price != '0' && minMaxData[object[i].code] && parseInt(object[i].price.replace(/,/g,"")) >= ((1-(percentage/100))*parseInt(minMaxData[object[i].code].data[year].max)))
				theObj.push({ obj: object[i], data:minMaxData[object[i].code] });
		}
	}
	cb(theObj);
}


//module.exports.getCurrentPrices();
function crawler(cb) {
	var request = require('request');
	var code, price, company, change, fullcode, type;
	var urls = [
		'http://finance.daum.net/quote/all.daum?type=S&stype=P',
		'http://finance.daum.net/quote/all.daum?type=S&stype=Q'
	];
	var length = urls.length;
	var url;
	var objee = [];
	function execRequest(idx) {
		url = urls[idx];
		request(url, function(err, response, body) {
			var cheerio = require('cheerio');

			if(err) return console.error(err);

			$ = cheerio.load(body);
			$("table.gTable tr").each(function() {

				company = $("td", this).eq(0).text();
				if(company) {
					price = $("td",this).eq(1).text();
					change = $("td",this).eq(2).text();
					code = $('a', this).eq(0).attr('href')
					code = code.substr(code.lastIndexOf('=')+1);
					if(idx == 0)
						type = "KOSPI";
					else
						type = "KOSDAQ";
			
				if(code.length < 7) 
					objee.push({ company : company, price:price, change:change, code:code, type:type });	
				}
				
				company = $("td", this).eq(3).text();
		
				if(company) {
					price = $("td",this).eq(4).text();
					change = $("td",this).eq(5).text();
					code = $('a', this).eq(1).attr('href')
					code = code.substr(code.lastIndexOf('=')+1);
					if(idx == 0)
						type = "KOSPI";
					else
						type = "KOSDAQ";

				if(code.length < 7)	
					objee.push({ company : company, price:price, change:change, code:code, type:type });
				}
			});
			if(idx+1<length) 
				setTimeout(function() {
					execRequest(idx+1)}, 1);
			else
				return cb(objee);
		});
	}
	
	execRequest(0);
}

getLowestPrice(function() {});
setInterval(crawler, 10000, function (objee) { object = objee;}); 
//deviceRegister(registerInfo);
//deviceRegister(registerInfo2);

/*	setInterval(function () { compare(0, 0, 7, object, function(theO) {
	for(i in theO)
		push(theO[i].obj.company, theO[i].obj.price, 0);
	}) },  10000);*/


function push(companyName, price, type, token) {

	var gcm = require('node-gcm');
	var fs = require('fs');

	if(type == 0) 
		var message = new gcm.Message({
		    collapseKey: 'demo',
		    delayWhileIdle: true,
		    timeToLive: 3,
		    data: {
		        title: 'Low Price!',
		        message: 'Low Price!',
		    },
		   notification: {
			title: "Lowest Price!",
			icon: "ic_launcher",
			body: companyName + " is lowest price " + price
		   }
		});
	else
		var message = new gcm.Message({
		    collapseKey: 'demo',
		    delayWhileIdle: true,
		    timeToLive: 3,
		    data: {
		        title: 'High Price!!',
		        message: 'High price!',
		    },
		   notification: {
			title: "Highest Price!",
			icon: "ic_launcher",
			body: companyName + " is highest price " + price
		   }
		});

	

	var server_api_key = 'AIzaSyCJ5pS1rQE3bmcuGo_Ix4VmrFB5vatnKgk';
	var sender = new gcm.Sender(server_api_key);
	var registrationIds = [];

	registrationIds.push(token);
	sender.send(message, registrationIds, 4, function (err, result) {
	});

}

