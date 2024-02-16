const {get,post} = require('axios');
const {SEMANTIC_CONFIG} = require('./config')
const {parse_year,parse_author_name} = require('./dep')
// Helper function to sleep for a specified amount of time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Search async function
async function searchInSemantic(query,maxResults=15, retries =  3, delay =  500){

// Searching for the query
try {
const response = await get(SEMANTIC_CONFIG.api_url,  {params:{
  'query': `${query}`,
  'limit': maxResults,
},
  headers:{
    'x-api-key':SEMANTIC_CONFIG.api_key
  }
});
// preparing Ids array
const Data = response.data.data
var Ids = []
Data.map(paper => {
  let id = `${paper['paperId']}`
  Ids.push(id)
});
// sending them to get paper Metadata
let detResponse = await post('https://api.semanticscholar.org/graph/v1/paper/batch?fields=title,year,authors,openAccessPdf,abstract', {
  ids: Ids,
  headers: {
    'x-api-key':SEMANTIC_CONFIG.api_key
  }
})
const Metadata = detResponse.data
let rs = []
  Metadata.forEach(paper => {
    let title = paper.title
    let year = parse_year(paper.year)
    // parsing author names
    let author_names = []
    if(paper.authors.length === 0){
      return
    } else{
      paper.authors.forEach((author)=>{
        author_names.push(author.name)
      })
    let author = parse_author_name(author_names)
    // Get pdf url
    let abstract = paper.abstract
    let pdf_url = (paper.openAccessPdf === null)?'':paper.openAccessPdf.url
    rs.push({'title':title,'author':author,'authors':author_names,'published':year,'pdf_url':pdf_url,'abstract':abstract})
    }
});
return rs
} catch (error) {
  if (retries >  0) {
    // Wait for the specified delay before retrying
    await sleep(delay);
    // Retry the request with one less retry attempt and double the delay
    return searchInSemantic(query, maxResults, retries -  1, delay *  2);
  } else {
    // If no more retries left, throw the error
    throw error;
  }
}
}
  
// Test it using the example below

let query = 'canada'
searchInSemantic(query).then(res => {
    // Handle the response data here
    console.log(res);
  })
  .catch(error => {
    // Handle errors here
    console.error('Error:', error);
  })

module.exports = {searchInSemantic}