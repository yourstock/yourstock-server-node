// getcodes.js

module.exports = {
  getcodes: getCodes
}

function getCodes() {
  var httprequest = require('./httprequest.js').httpgetrequest;
  httprequest("krx.co.kr", "/por_kor/popup/JHPKOR13008.jsp?charOrder=0&mkt_typ=S&isu_cd=&shrt_isu_cd=&kor_isu_nm=&indx_ind_cd=&market_gubun=allVal&word=&x=27&y=10", parseCodes);
}

function parseCodes(htmldata) {
  var cheerio = require('cheerio'), $ = cheerio.load(htmldata);
  var tds = $("td.tal").each(function(i, elem) {
    console.log($(this).children().attr('onclick'));
  });

}
/*
function parseCodes(htmldata) {
  var xpath = require('xpath');
  var parse5 = require('parse5');
  var xmlser = require('xmlserializer');
  var dom = require('xmldom').DOMParser;
  var parser = new parse5.Parser();
  var document = parser.parse(htmldata);
  var xhtml = xmlser.serializeToString(document);
  console.log(xhtml);
  var doc = new dom().parseFromString(xhtml);
  var select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
  var nodes = select("//x:td/[@class='tal']", doc);
  console.log(nodes);
}
*/
