var http = require('http');
var codes = '';
var curData = '';
var minMaxData;
var rank = [];
var rankPush = [];
var object = [];
var childProcess = require("child_process");
var retrieveChild;

module.exports = { 
/*	getCodes: function (cb, emit) {


	var options = {
		host: "45.32.18.89",
		path: '/codes',
		port: '3000',
	};

	http.request(options).on('response', function(response) {
		response.on('data', function(chunk) {
			codes += chunk;
		});

		response.on('end', function () {
			var obj = JSON.parse(codes);
			codes = [];
			fullcodes = [];
			for(i in obj)
				codes.push({ code: obj[i]['simple_code'].substr(1), fullcode: obj[i]['standard_code']});
			cb(codes, emit);
		});
	}).end();
},*/
	emit: function(emit) {
		emit(object);
	},	

	getCurrentPrices: function (emit) {
	
	getLowestPrice(function() { 
		
		this.retrieveChild.on('message', function(msg){
				console.log("Recv'd message from background.");
				object = msg.content;
//				combine2(object, minMaxData, function(bigObj) {
//				});
				
			/*else {
				if(object.length > 0)
					emit(object);
			}*/
				

		}.bind(this));	
//	combine(object, minMaxData);	
//	emit(object);
//	compare(0, 7, object);
/*	shilshigan((function() {
		for(i in object) {
			rankIndex = rank.indexOf(object[i].company);
			if(rankIndex >=  0)
				console.log(object[i]);
		}
	
	}));*/
	
	});
	}	

};

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
		minMaxData = history;
		cb();
	});		


}

/*function combine(object, cb) {
	var MongoClient = require('mongodb').MongoClient;
	var assert = require('assert');
	var bigObj = [];

	var url = 'mongodb://localhost:27017/sip';
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		var cursor = db.collection("history_min_max", function(err, collection) {
			
			for( i in object) {

				collection.find( { simple_code: 'A' + object[i].code }).toArray(function (err, data) {
					assert.equal(err, null);
					if(data)
						bigObj.push( { current: object[i], minmax: data } );
					else						db.close();
			});
			}
		});
		assert.equal(err, null);
		cb(bigObj);
	});
}*/



function compare(percentage, year ,object) {
	var theObj = [];
	for (i in object){
		for(j in minMaxData) {
			if(object[i].price != '0' && object[i].code == minMaxData[j].simple_code.substr(1) && parseInt(object[i].price.replace(/,/g,"")) < ((1+percentage)*parseInt(minMaxData[j].data[year].min))) {
				//console.log(parseInt(object[i].price.replace(/,/g, "")));
				//console.log(minMaxData[j].data[year].min);
				theObj.push({ obj:object[i], data:minMaxData[j] });
			}

		}	
	}
//	console.log(theObj);
//	console.log(object);
//	console.log(minMaxData);
}


//module.exports.getCurrentPrices();

start();
