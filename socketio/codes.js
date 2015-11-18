var http = require('http');
var codes = '';
var fullcodes = '';
var curData = '';
var object = [];
//var historyData = '';


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
			for(i in obj) {
				codes.push(obj[i]['simple_code'].substr(1));
				fullcodes.push(obj[i]['standard_code']);
			}
			cb(codes, fullcodes);
		});
	}).end();
}

function getCurrentPrices(codes, fullCode) {
	for(i in codes) {
		//getPrice(codes[i]);
		getLowestPrice(fullCode[i])
	}
	
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

function getLowestPrice(id) {

		var options = {
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
				console.log("CODE: " + options.ID + " : " + obj.history[0].code + " : ");

			});
		}).end();		


}

function crawler(cb) {
	var request = require('request');
	var codes, price, company, change, object = [];

	request({
		method: 'GET',
		url: 'http://finance.daum.net/quote/all.daum?type=S&stype=P'
	}, scrapeDaum);	
	
	request({
		method: 'GET',
		url: 'http://finance.daum.net/quote/all.daum?type=S&stype=Q'
	}, scrapeDaum);	

}

function scrapeDaum(err, response, body) {
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

			if(code.length < 7) 
				object.push({ company : company, price:price, change:change, code:code });	
		}
			
		company = $("td", this).eq(3).text();
		if(company) {
			price = $("td",this).eq(4).text();
			change = $("td",this).eq(5).text();
			code = $('a', this).eq(1).attr('href')
			code = code.substr(code.lastIndexOf('=')+1);

			if(code.length < 7)	
				object.push({ company : company, price:price, change:change, code:code });
		}
	});	
	console.log(object);
}

crawler();
getCodes(getCurrentPrices);



