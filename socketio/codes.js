var http = require('http');
var codes = '';
var curData = '';
var object = [];
var minMaxData;
var rank = [];
var rankPush = [];


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
			cb(codes);
		});
	}).end();
}

function getCurrentPrices(codes) {
	
	getLowestPrice();
	
	crawler(function () {
	compare(0, 7); 
	shilshigan((function() {
		for(i in object) {
			rankIndex = rank.indexOf(object[i].company);
			if(rankIndex >=  0)
				console.log(object[i]);
		}
	
	}));
	});
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

function getLowestPrice() {

	var mongodb = require("../mongodb.js");

	mongodb.findall("history_min_max", function (history) {
		minMaxData = history;
	});		


}

function crawler(cb) {
	var request = require('request');
	var code, price, company, change, fullcode;
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
					fullcode = getFullCode(codes, code);
				if(code.length < 7) 
					object.push({ company : company, price:price, change:change, code:code, fullcode:fullcode});	
				}
				
				company = $("td", this).eq(3).text();
		
				if(company) {
					price = $("td",this).eq(4).text();
					change = $("td",this).eq(5).text();
					code = $('a', this).eq(1).attr('href')
					code = code.substr(code.lastIndexOf('=')+1);
					fullcode = getFullCode(codes, code);

				if(code.length < 7)	
					object.push({ company : company, price:price, change:change, code:code, fullcode:fullcode });
				}
			});
			if(idx+1<length) 
				setTimeout(function() {
					execRequest(idx+1)}, 100);
			else
				return cb();
		});
	}
	
	execRequest(0);
	

}

function compare(percentage, year) {
	var theObj = [];
	for (i in object){
		for(j in minMaxData) {
			if(object[i].fullcode == minMaxData[j].code && parseInt(object[i].price.replace(/,/g,"")) < ((1+percentage)*parseInt(minMaxData[j].data[year].min))) {
				//console.log(parseInt(object[i].price.replace(/,/g, "")));
				//console.log(minMaxData[j].data[year].min);
				theObj.push({ obj:object[i], data:minMaxData[j] });
			}

		}	
	}
	//console.log(theObj);
//	console.log(object);
//	console.log(minMaxData);
}


getCodes(getCurrentPrices);


