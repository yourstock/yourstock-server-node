var timers = require("timers"), http = require("http"),backgroundTimer;
var final_object = [];

process.on('message', function(msg) {
	 function Task() {
		crawler(sendit, final_object);
		
		function sendit(final_object) {
		if(final_object.length > 0){
			var data = {
				"error": null,
				"content":final_object,
				"crawl": true
			}
			
			try {
				process.send(data);
				final_object = [];
			}
			catch(err) {
				console.log("crawler.js: problem with process.send",  err.message);
			}
		}
		else
			console.log("crawler.js: no data processed");
		}
	}

	this._startTimer = function() {
		var count = 0;
		
		backgroundTimer = timers.setInterval(function() {
			
			try {
				var date = new Date();
				console.log("crawler.js: datetime tick: " + date.toUTCString());
            			Task();
			}
            catch(err){
                count++;
                if(count == 3){
                    console.log("crawler.js: shutdown timer...too many errors. " + err.message);
                    clearInterval(backgroundTimer);
                    process.disconnect();
                }
                else{
                    console.log("crawler.js error: " + err.message + "\n" + err.stack);
                }
            }
        },msg.interval);
    	}
	
    this._init = function(){
        if(msg.start == true){
            this._startTimer();
        }
        else{
            console.log("crawler.js: content empty. Unable to start timer.");
        }
    }.bind(this)()



})

process.on('uncaughtException',function(err){
    console.log("crawler.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
    clearInterval(backgroundTimer);
})

function crawler(cb, object) {
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
//					fullcode = getFullCode(codes, code);
				if(code.length < 7) 
					object.push({ company : company, price:price, change:change, code:code });	
				}
				
				company = $("td", this).eq(3).text();
		
				if(company) {
					price = $("td",this).eq(4).text();
					change = $("td",this).eq(5).text();
					code = $('a', this).eq(1).attr('href')
					code = code.substr(code.lastIndexOf('=')+1);
//					fullcode = getFullCode(codes, code);

				if(code.length < 7)	
					object.push({ company : company, price:price, change:change, code:code });
				}
			});
			if(idx+1<length) 
				setTimeout(function() {
					execRequest(idx+1)}, 100);
			else
				return cb(object);
		});
	}
	
	execRequest(0);
	

}
