const axios = require('axios')
const xml = require('xml2js');
const { parse_author_name, parse_year } = require('./dep');
// Helper function to sleep for a specified amount of time
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
 }

async function searchInArxiv(query, maxResults = 5,retries =  3, delay =  500) {
 try {
 const baseUrl = 'http://export.arxiv.org/api/query?';
 const params = `search_query=${encodeURIComponent(query)}&max_results=${maxResults}`;
 const url = `${baseUrl}${params}`;
 const response = await axios.get(url);
 const parser = new xml.Parser();
 const result = await parser.parseStringPromise(response.data);

 // Extract entries from the parsed XML
 const entries = result.feed.entry;

 // Convert entries to a simpler format
 const simplifiedEntries = entries.map((entry) => ({
    id: entry.id[0],
    title: entry.title[0],
    summary: entry.summary[0],
    updated: entry.updated[0],
    author: entry.author[0].name[0],
    category: entry['arxiv:primary_category'][0]['$'].term,
    pdfLink: entry.link[1]['$'].href + '.pdf',
 }));
 let res = [];
 simplifiedEntries.forEach(e => {
  let author = (typeof e.author == 'string')? [e.author]:e.author
   let r = {'title':e.title,'authors':parse_author_name(author),'pdf_url':e.pdfLink,'published':parse_year(e.updated)}
   res.push(r);
 });
 return res
}catch (error) {
   if (retries >  0) {
     // Wait for the specified delay before retrying
     await sleep(delay);
     // Retry the request with one less retry attempt and double the delay
     return searchInArxiv(query, maxResults, retries -  1, delay *  2);
   } else {
     // If no more retries left, throw the error
     throw error;
   }
 }
 }
// Define the query and maximum results
let query = 'quantum mechanics';
let maxResults = 5;
searchInArxiv(query).then(res => {
   // Handle the response data here
   console.log(res);
 })
 .catch(error => {
   // Handle errors here
   console.error('Error:', error);
 })
// Call the function with the defined parameters


 module.exports = {searchInArxiv}

