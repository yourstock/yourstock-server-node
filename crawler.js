// crawler.js

module.exports = {
  getcodes: getCodes,
  getyearvalues: getYearValues,
  calculateminmax: calculateMinMax,
  dbfix: dbfix,
  updatedayvalue: updateDayValue,
  isdateexist: isDateExist,
}

function getCodes() {
  var httprequest = require('./httprequest.js').httpgetrequest;
  var mongodb = require('./mongodb.js');
  mongodb.removeall('codes', function() {
    // all
    //httprequest("www.krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=allVal&word=&x=27&y=10", parseCodes, 0);
    // Kospi(?) only
    httprequest("www.krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=kospiVal&word=&x=27&y=10", parseCodes, 0);
    // Kosdaq only
    httprequest("www.krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=kosdaqVal&word=&x=27&y=10", parseCodes, 0);
  });
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
  mongodb.insertmany('codes', sip_codes);
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
  var targetPath = "/por_kor/m2/m2_1/m2_1_4/JHPKOR02001_04_chart.jsp?param=" + code + ",20101101," + today + ",s"
  console.log(targetPath);
  httprequest("www.krx.co.kr", targetPath, parseYearValues, codes);
}

function parseYearValues(htmldata, codes) {
  htmldata = htmldata.trim();
  //console.log(htmldata);
  console.log("Data retrieved " + codes.length + " items left");
  var cheerio = require('cheerio'), $ = cheerio.load(htmldata);
  var date_item = [];
  var code = codes[0].standard_code;
  var simple_code = codes[0].simple_code;
  codes = codes.slice(1);
  var tds = $("item").each(function(i, elem) {
    date_item[i] = {code: code,
                    simple_code: simple_code,
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
  var date_range_index = [{title:"aweek",
                           value: 7},
                          {title:"2weeks",
                           value: 14},
                          {title:"amonth",
                           value: 30},
                          {title:"6months",
                           value: 180},
                          {title:"ayear",
                           value: 365},
                          {title:"2years",
                           value: 730},
                          {title:"3years",
                           value: 1095},
                          {title:"5years",
                           value: 1825}];
  var date_range = [];
  for (i in date_range_index) {
    var the_date = new Date();
    the_date.setDate(the_date.getDate() - date_range_index[i].value);
    date_range[i] = the_date;
  }
  mongodb.removeall('history_min_max', function() {
    mongodb.findall('price_history', function(history) {
      // at most 2000 * 365 items
      var minmaxItem = {};
      for (i in history) {
        var code = history[i].code;
        var simple_code = history[i].simple_code;
        history[i].hg_pr = parseInt(history[i].hg_pr);
        history[i].lw_pr = parseInt(history[i].lw_pr);
        if (history[i].hg_pr == 0) {
          // invalid data
          continue;
        }
        if (minmaxItem[code] == undefined) {
          minmaxItem[code] = {};
          minmaxItem[code].data = [];
          minmaxItem[code].simple_code = simple_code;
          for (j in date_range_index) {
            minmaxItem[code].data[j] = {};
            minmaxItem[code].data[j].min = 9999999999;
            minmaxItem[code].data[j].max = 0;
            minmaxItem[code].data[j].range = date_range_index[j].title;
          }
        }
        for (j in date_range_index) {
          if (history[i].date > date_range[j]) {
            if (minmaxItem[code].data[j].max < history[i].hg_pr) {
              minmaxItem[code].data[j].max = history[i].hg_pr;
            }
            if (minmaxItem[code].data[j].min > history[i].lw_pr) {
              minmaxItem[code].data[j].min = history[i].lw_pr;
            }
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

function dbfix() {
  var mongodb = require('./mongodb.js');
  mongodb.findall('codes', function(codes) {
    mongodb.findall('history_min_max', function(history) {
      for (i in history) {
        delete history[i]._id;
        for (j in codes) {
          if (codes[j].standard_code == history[i].code) {
            history[i].simple_code = codes[j].simple_code;
          }
        }
      }
      mongodb.removeall('history_min_max', function() {
        mongodb.insertmany('history_min_max', history);
      });
    });
  });
}

function updateDayValue(date, cb) {
  var mongodb = require('./mongodb.js');
  mongodb.findall('codes', function(codes) {
    var param = {date: date,
                 cb: cb,
                };
    getDayValuesOfItem(codes, param);
  });
}

function getDayValuesOfItem(codes, param) {
  if (codes.length == 0) {
    console.log("Crawl all data finished");
    param.cb();
    return;
  }
  param.codes = codes;
  var date = param.date;
  var httprequest = require('./httprequest.js').httpgetrequest;
  var code = codes[0].simple_code;
  var targetPath = "/api/item/getPriceDayList.nhn?code=" + code.substr(1,6);
  console.log(targetPath);
  httprequest("m.stock.naver.com", targetPath, parseDayValues, param);
}

function parseDayValues(htmldata, param) {
  var codes = param.codes;
  var date = param.date;
  htmldata = htmldata.trim();
  htmldata = "(" + htmldata + ")";
  htmldata = eval(htmldata).result.list;
  console.log("Data retrieved " + codes.length + " items left");
  var daydata = 0;
  for (i in htmldata) {
    if (htmldata[i].dt == date) {
      daydata = htmldata[i];
      break;
    }
  }
  var code = codes[0].standard_code;
  var simple_code = codes[0].simple_code;
  var date_str = date.substr(0,4) + "/" + date.substr(4,2) + "/" + date.substr(6,2);
  if (daydata != 0) {
    var date_item = {code: code,
                     simple_code: simple_code,
                     date: new Date(date_str),
                     date_str: date_str,
                     opn_pr: parseInt(daydata.ov),
                     hg_pr: parseInt(daydata.hv),
                     lw_pr: parseInt(daydata.lv),
                     end_pr: parseInt(daydata.ncv),
                     tot_tr_vl: parseInt(daydata.aq),
                    };
  }
  param.codes = codes.slice(1);
  var mongodb = require('./mongodb.js');
  mongodb.remove('price_history', {code: code, date_str: date_str}, function() {
    mongodb.insertmany('price_history', [date_item]);
    getDayValuesOfItem(param.codes, param);
  });
  return;
}

function isDateExist(date, cb) {
  var httprequest = require('./httprequest.js').httpgetrequest;
  var targetPath = "/api/item/getPriceDayList.nhn?code=005930";
  console.log(targetPath);
  var param = {date:date, cb:cb};
  httprequest("m.stock.naver.com", targetPath, checkDateExist, param);
}

function checkDateExist(htmldata, param) {
  var date = param.date;
  htmldata = htmldata.trim();
  htmldata = "(" + htmldata + ")";
  htmldata = eval(htmldata).result.list;
  var daydata = 0;
  for (i in htmldata) {
    if (htmldata[i].dt == date) {
      daydata = htmldata[i];
      break;
    }
  }
  if (daydata != 0) {
    param.cb();
  }
}
