// crawler.js

module.exports = {
  getcodes: getCodes,
  getyearvalues: getYearValues
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
  mongodb.removeall('codes');
  mongodb.insertmany('codes', sip_codes);
}

function getYearValues() {
  var mongodb = require('./mongodb.js');
  mongodb.findall('codes', function(codes) {
    for (codeItem in codes) {
      getYearValuesOfItem(codes[codeItem].standard_code);
    }
  });
}

function getYearValuesOfItem(code) {
  var httprequest = require('./httprequest.js').httpgetrequest;
  var now = new Date();
  var today = '' + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
  var targetPath = "/por_kor/m2/m2_1/m2_1_4/JHPKOR02001_04_chart.jsp?param=" + code + ",20141101," + today + ",s"
  console.log(targetPath);
  httprequest("krx.co.kr", targetPath, parseYearValues, code);
}

function parseYearValues(htmldata, code) {
  htmldata = htmldata.trim();
  console.log(htmldata);
  var cheerio = require('cheerio'), $ = cheerio.load(htmldata);
  var date_item = [];
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
  mongodb.insertmany('price_history', date_item);
}
