var http = require('http');
var codes = '';
var fullcodes = '';
var curData = '';
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
			//obj = JSON.parse(codes);
			//console.log(obj);
			codes = [];
			fullcodes = [];
			for(i in obj) {
				codes.push(obj[i]['simple_code'].substr(1));
				fullcodes.push(obj[i]['code']);
			}
			cb(codes, fullcodes);
		});
	}).end();
}

function getCurrentPrices(codes, fullCode) {
	for(i in codes) {
		getPrice(codes[i]);
		//getLowestPrice(fullCode[i])
	}
	
}

function getPrice(id) {

	var options = {
			host: "api.finance.naver.com",
			path: "/service/itemSummary.nhn?itemcode=" + id,
			port: '80',
			ID: id
		};
		//var curCode = codes[i];

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
			path: '/history?code=' + id + "&range=365",
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
				//console.log("CODE: " + options.ID + " : " + obj.now + " : ");

			});
		}).end();		


}

function crawler() {
	var cheerio = require('cheerio');
	var request = require('request');
	var code, price, company, change;

	request({
		method: 'GET',
		url: 'http://finance.daum.net/quote/all.daum?type=S&stype=P'
		//url: 'https://github.com/showcases'
	}, function(err, response, body) {
		if(err) return console.error(err);

		$ = cheerio.load(body);
		$("table.gTable td").each(function() {

			console.log($(this).attr());


			//console.log($(this)._root.text());
			//console.log($('td.num', this).children().text());
			/*code = $('a', this).attr('href')


			code = code.substr(code.lastIndexOf('=')+1);

			if(code.length < 7)
				company = $('a', this).text();

			price = */

			

			//if (href.lastIndexOf('/') > 0) {
		//		console.log($('h3', this).text());
		//	}
		})
	})
}

crawler();
//getCodes(getCurrentPrices);



