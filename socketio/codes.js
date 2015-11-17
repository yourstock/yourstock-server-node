var http = require('http');
var codes = '';
var curData = '';
var objs = [];

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
		for(i in codes) {
		var options = {
			host: "api.finance.naver.com",
			path: "/service/itemSummary.nhn?itemcode=" + codes[i],
			port: '80',
		};
		var curCode = codes[i];

		http.request(options).on('response', function(response) {
			response.on('data', function(chunk) {
				curData = chunk;
		});
			console.log(options);
			response.on('end', function () {
				objs.push(JSON.parse(curData));
				console.log("CODE: " + options['path'] + " : " + objs[objs.length-1]['now']);

			});
		}).end();
		  
	}
}

getCodes(getCurrentPrices);



