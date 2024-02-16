const { searchInSemantic } = require('./semantic')
const { default: axios } = require('axios')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function searchAndProcess(query,style,retries =  3, delay =  500) {
htmlRes = []
try {
    res = await searchInSemantic(query)
    // Handle the response data here
    //console.log(res);
    const filteredResults = res.filter(r => r.abstract!== null);
    filteredResults.forEach(r => {
      const item = {
        'title': r.title,
        'authors': r.authors,
        'pdf_url': '',
        'published': r.published,
        'abstract': r.abstract
      };
      htmlRes.push(item);
    });
    console.log(htmlRes);
    res = await literature(htmlRes,style,query);
    console.log(res);
    return res;
  } catch (error) {
    if (retries >  0) {
      // Wait for the specified delay before retrying
      await sleep(delay);
      // Retry the request with one less retry attempt and double the delay
      return searchAndProcess(query, style, retries -  1, delay *  2);
    } else {
      // If no more retries left, throw the error
      throw error;
    }
  }
}
async function literature(items,style,query,retries = 3,delay = 500) {
    console.log(items)
    const djUrl = 'http://127.0.0.1:8000/';
    reqData = {
      'Researches': items,
      'style': style,
      'subject':query
    }
    let endpoint = 'literature/'
    try{
    return axios.post(`${djUrl}/${endpoint}`,reqData).then((res) =>{
      console.log(res);
      return res;
    })}catch (error) {
      if (retries >  0) {
        // Wait for the specified delay before retrying
        await sleep(delay);
        // Retry the request with one less retry attempt and double the delay
        return literature(items,style,query, retries -  1, delay *  2);
      } else {
        // If no more retries left, throw the error
        throw error;
      }
    }}

    async function documentation(items, style, retries =  3, delay =  500) {
      console.log(items);
      const djUrl = 'http://127.0.0.1:8000/';
      const reqData = {
        'Researches': items,
        'style': style
      };
      const endpoint = 'documentation/';
    
      try {
        // Return the Promise chain from the Axios POST request
        return axios.post(`${djUrl}${endpoint}`, reqData)
          .then(res => {
            console.log(res);
            return res;
          });
      } catch (error) {
        if (retries >  0) {
          // Ensure sleep is awaited
          await sleep(delay);
          // Retry the request with one less retry attempt and double the delay
          return documentation(items, style, retries -  1, delay *  2);
        } else {
          // If no more retries left, throw the error
          throw error;
        }
      }
    }
    
    // Define the sleep function if it's not already defined elsewhere
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
      async function plagiarism(text,retries=3,delay=500) {
        console.log(text)
        const djUrl = 'http://127.0.0.1:8000/';
        reqData = {
          'text': text
        }
        let endpoint = 'plagiarism/'
       try {
        return axios.post(`${djUrl}/${endpoint}`,reqData).then((res) =>{
          console.log(res);
          return res;
        })}catch (error) {
          if (retries >  0) {
            // Wait for the specified delay before retrying
            await sleep(delay);
            // Retry the request with one less retry attempt and double the delay
            return plagiarism(text,retries -  1, delay *  2);
          } else {
            // If no more retries left, throw the error
            throw error;
          }}}
        
          async function searchAndDoc(query, style, retries =  3, delay =  500) {
            let htmlRes = [];
            try {
              const res = await searchInSemantic(query);
              const filteredResults = res.filter(r => r.pdf_url !== '');
              filteredResults.forEach(r => {
                const item = {
                  'title': r.title,
                  'authors': r.authors,
                  'pdf_url': r.pdf_url,
                  'published': r.published,
                };
                htmlRes.push(item);
              });
              console.log(htmlRes);
              const re = await documentation(htmlRes, style);
              console.log(re);
              return re;
            } catch (error) {
              if (retries >  0) {
                // Use setTimeout to create a delay and make it awaitable
                await sleep(delay)
                // Retry the request with one less retry attempt and double the delay
                return searchAndDoc(query, style, retries -  1, delay *  2);
              } else {
                // If no more retries left, throw the error
                throw error;
              }
            }
          }
          
let query = 'numerical analysis applications'
/*
plagiarism(query).then(res => {
  // Handle the response data here
  console.log(res);
})
.catch(error => {
  // Handle errors here
  console.error('Error:', error);
})*/
module.exports = {searchAndProcess,searchAndDoc,literature,plagiarism,documentation}