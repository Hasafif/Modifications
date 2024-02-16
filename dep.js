const axios = require('axios');
const cheerio = require('cheerio');
const axiosRateLimit = require('axios-rate-limit');

const api = axiosRateLimit(axios.create(), { maxRequests: 100, perMilliseconds: 300000});

function parse_year(year) {
  let y = year.toString()
  return y.slice(0, 4)
}

function parse_author_name(author_name) {
  var author = author_name[0].toString()
  let comma = author.match(/\s*,/)
  if(comma){
    author = author.substring(comma.index - author.length,comma.index)
    var pos = author.lastIndexOf(' ')
    author = author.substring(pos + 1)
    return ` ${author} et al ` 
  } 
  else{
    var pos = author.lastIndexOf(' ')
  author = author.substring(pos + 1)
  if (author_name.length == 1) {
    return author
  }
  else {
    return ` ${author} et al `
  }
  }
}

function get_pdf_url_from_arxiv(arxivId) {
  return `http://arxiv.org/pdf/${arxivId}.pdf`
}


module.exports = { get_pdf_url_from_arxiv, parse_author_name, parse_year}