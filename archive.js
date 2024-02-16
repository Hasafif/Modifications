const axios = require('axios')
const { parse_author_name, parse_year } = require('./dep');
// Helper function to sleep for a specified amount of time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchInArchive(query,maxResults=10,retries =  3, delay =  500) {
  try {
    const response = await axios.get("https://archive.org/advancedsearch.php", {
      params: {
        q: `"${query}" AND collection:(journals) AND format:(Text PDF) AND mediatype:(texts)`,
        fl: ["identifier"],
        rows: maxResults,
        output: "json",
      }
    });
    const res = [];
    
    for (let e of response.data.response.docs) {
      let details = await getInternetArchiveItemDetails(e.identifier);
      let r = {'title':details.title,'authors':parse_author_name([details.authors]),'pdf_url':details.pdf_url,'published':parse_year(details.published)}
      res.push(r);
    }
  return res;
}catch (error) {
  if (retries >  0) {
    // Wait for the specified delay before retrying
    await sleep(delay);
    // Retry the request with one less retry attempt and double the delay
    return searchInArchive(query, maxResults, retries -  1, delay *  2);
  } else {
    // If no more retries left, throw the error
    throw error;
  }
}
}

async function getInternetArchiveItemDetails(identifier) {
  const filesMetadataUrl = `https://archive.org/metadata/${identifier}`;
  const response = await axios.get(filesMetadataUrl);
  // adjusting author name
  const MetaData = response.data.metadata
  if('creator' in MetaData){
    var author =  MetaData.creator
  }
  else if('journaltitle' in MetaData){
    var author = MetaData.journaltitle;
  }
  else if('contributor' in MetaData){
    var author = MetaData.contributor;
  }
  else{
    var author = 'Unknown'
  }
  const year = MetaData.publicdate
  const title = MetaData.title
  var details = {"title":title,"authors":author,"published":year}
  const filesMetaData = response.data['files'];
  for (let fileData of filesMetaData) {
    if (fileData.format === "Text PDF") {
      const pdfdownloadUrl = `https://archive.org/download/${identifier}/${fileData.name}`;
      details['pdf_url'] = pdfdownloadUrl;
    }
  }
  return details
}
let query = 'canada'
searchInArchive(query).then(res => {
    // Handle the response data here
    console.log(res);
  })
  .catch(error => {
    // Handle errors here
    console.error('Error:', error);
  })

module.exports = {searchInArchive}