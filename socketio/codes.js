var http = require('http');
var codes = '';
var curData = '';
var object = [];
var minMaxData;


function getCodes(cb) {


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
			cb(codes);;
		});
	}).end();
}

function getCurrentPrices(codes) {
	
	getLowestPrice();
	
	crawler(function () { 
	compare(1);  
	});

	
}


function getFullCode(codes, code) {

	for (var i = 0, codelength = codes.length; i < codelength; i++)
		if(codes[i].code == code)
			return codes[i].fullcode;
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

function getLowestPrice() {

/*		var options = {
			host: "45.32.18.89",
			path: '/history?code=' + id + '&range=365',
			port: '3000',
			ID: id
		};
		
		http.get(options, function(response) {
			var historyData = '';
			response.on('data', function(chunk) {
				historyData += chunk;
		});
		
			response.on('end', function () {
				var obj = JSON.parse(historyData);
				console.log("CODE: " + options.ID + " : " + obj.lowest + " : ");

			});
//			response.on('error', function(e) {
  //  			console.log("Got error: " + e.message);
	//	    request.abort();
    	//		setTimeout(getLowestPrice(id), 50);
  	//		});
		}).on('error', function(e) {
			setTimeout(getLowestPrice(id), 50);
		});	*/

	var mongodb = require("../mongodb.js");

	mongodb.findall("history_min_max", function (history) {
		minMaxData = history;
	});		


}

function crawler(cb) {
	var request = require('request');
	var codes, price, company, change, fullcode;
	var urls = [
		'http://finance.daum.net/quote/all.daum?type=S&stype=P',
		'http://finance.daum.net/quote/all.daum?type=S&stype=Q'
	];
	var length = urls.length;
	var url;

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
					fullcode = getCode(codes, code);
				if(code.length < 7) 
					object.push({ company : company, price:price, change:change, code:code, fullcode:fullcode});	
				}
				
				company = $("td", this).eq(3).text();
		
				if(company) {
					price = $("td",this).eq(4).text();
					change = $("td",this).eq(5).text();
					code = $('a', this).eq(1).attr('href')
					code = code.substr(code.lastIndexOf('=')+1);
					fullcode = getCode(codes, code);

				if(code.length < 7)	
					object.push({ company : company, price:price, change:change, code:code, fullcode:fullcode });
				}
			});
			if(idx+1<length) 
				setTimeout(function() {
					execRequest(idx+1)}, 1000);
			else
				return cb();
		});
	}
	
	execRequest(0);
	

}

function compare(type) {
	for (i in object){
	//	if(object[i][code])
	}
	console.log(object);
	//console.log(minMaxData);
}

getCodes(getCurrentPrices);


