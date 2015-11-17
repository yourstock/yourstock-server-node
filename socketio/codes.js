var http = require('http');
var codes = '';
var curData = '';


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
			for(i in obj)
				codes.push(obj[i]['simple_code'].substr(1));

			cb(codes);
		});
	}).end();
}

function getCurrentPrices(codes) {
	for(i in codes) 
		getPrice(codes[i]);
	
}

function getPrice(id) {

	var options = {
			host: "api.finance.naver.com",
			path: "/service/itemSummary.nhn?itemcode=" + codes[i],
			port: '80',
			id: codes[i]
		};
		var curCode = codes[i];

		http.get(options, function(response) {

			response.on('data', function(chunk) {
				curData = chunk;
		});
			response.on('end', function () {
				var obj = JSON.parse(curData);
				console.log("CODE: " + options.id + " : " + obj.now);

			});
		}).end();
}

getCodes(getCurrentPrices);



