// crawler.js

module.exports = {
  getcodes: getCodes,
  getyearvalues: getYearValues,
  calculateminmax: calculateMinMax
}

function getCodes() {
  var httprequest = require('./httprequest.js').httpgetrequest;
  // all
  //httprequest("krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=allVal&word=&x=27&y=10", parseCodes, 0);
  // Kospi(?) only
  httprequest("krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=kospiVal&word=&x=27&y=10", parseCodes, 0);
}

function parseCodes(htmldata, param) {
  var cheerio = require('cheerio'), $ = cheerio.load(htmldata);
  var sip_codes = [];
  var tds = $("td.tal").each(function(i, elem) {
    var onclick = $(this).children().attr('onclick').split("'");
    var standard_code = onclick[5];
    var simple_code = onclick[1];
    var name = onclick[3];
    sip_codes[i] = {standard_code: standard_code,
                    simple_code: simple_code,
                    name: name};
  });
  var mongodb = require('./mongodb.js');
  mongodb.removeall('codes', function() {
    mongodb.insertmany('codes', sip_codes);
  });
}

function getYearValues() {
  var mongodb = require('./mongodb.js');
  mongodb.findall('codes', function(codes) {
    getYearValuesOfItem(codes);
  });
}

function getYearValuesOfItem(codes) {
  if (codes.length == 0) {
    console.log("Crawl all data finished");
    return;
  }
  var httprequest = require('./httprequest.js').httpgetrequest;
  var now = new Date();
  var today = '' + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
  var code = codes[0].standard_code;
  var targetPath = "/por_kor/m2/m2_1/m2_1_4/JHPKOR02001_04_chart.jsp?param=" + code + ",20141101," + today + ",s"
  console.log(targetPath);
  httprequest("krx.co.kr", targetPath, parseYearValues, codes);
}

function parseYearValues(htmldata, codes) {
  htmldata = htmldata.trim();
  //console.log(htmldata);
  console.log("Data retrieved " + codes.length + " items left");
  var cheerio = require('cheerio'), $ = cheerio.load(htmldata);
  var date_item = [];
  var code = codes[0].standard_code;
  codes = codes.slice(1);
  var tds = $("item").each(function(i, elem) {
    date_item[i] = {code: code,
                    date: new Date($(this).attr('work_dt')),
                    date_str: $(this).attr('work_dt'),
                    opn_pr: $(this).attr('isu_opn_pr'),
                    hg_pr: $(this).attr('isu_hg_pr'),
                    lw_pr: $(this).attr('isu_lw_pr'),
                    end_pr: $(this).attr('isu_end_pr'),
                    tot_tr_vl: $(this).attr('tot_tr_vl')};
  });
  var mongodb = require('./mongodb.js');
  mongodb.remove('price_history', {code: code}, function() {
    mongodb.insertmany('price_history', date_item);
    getYearValuesOfItem(codes);
  });
}

function calculateMinMax() {
  var mongodb = require('./mongodb.js');
  var year_begin = new Date();
  year_begin.setDate(year_begin.getDate() - 365);
  var month_begin = new Date();
  month_begin.setDate(month_begin.getDate() - 30);
  var week_begin = new Date();
  week_begin.setDate(week_begin.getDate() - 7);
  mongodb.removeall('history_min_max', function() {
    mongodb.findall('price_history', function(history) {
      // at most 2000 * 365 items
      var minmaxItem = {};
      for (i in history) {
        var code = history[i].code;
        if (minmaxItem[code] == undefined) {
          minmaxItem[code] = {
            max_year: 0,
            min_year: 99999999999,
            max_month: 0,
            min_month: 99999999999,
            max_week: 0,
            min_week: 99999999999
          };
        }
        if (history[i].date > year_begin) {
          if (minmaxItem[code].max_year < history[i].hg_pr) {
            minmaxItem[code].max_year = history[i].hg_pr;
          }
          if (minmaxItem[code].min_year > history[i].lw_pr) {
            minmaxItem[code].min_year = history[i].lw_pr;
          }
        }
        if (history[i].date > month_begin) {
          if (minmaxItem[code].max_month < history[i].hg_pr) {
            minmaxItem[code].max_month = history[i].hg_pr;
          }
          if (minmaxItem[code].min_month > history[i].lw_pr) {
            minmaxItem[code].min_month = history[i].lw_pr;
          }
        }
        if (history[i].date > week_begin) {
          if (minmaxItem[code].max_week < history[i].hg_pr) {
            minmaxItem[code].max_week = history[i].hg_pr;
          }
          if (minmaxItem[code].min_week > history[i].lw_pr) {
            minmaxItem[code].min_week = history[i].lw_pr;
          }
        }
      }
      var resultArr = [];
      for (i in minmaxItem) {
        minmaxItem[i].code = i;
        resultArr.push(minmaxItem[i]);
      }
      console.log("ResultArr length: " + resultArr.length);
      mongodb.insertmany('history_min_max', resultArr);
    });
  });
}
