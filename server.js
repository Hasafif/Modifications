const express = require('express')
const bodyParser = require('body-parser')
const asyncHandler = require('express-async-handler');
const app = express()
const xml = require('xml2js');
// Local libs

const { searchInArxiv } = require('./arxiv')
const { searchInArchive } = require('./archive')
const { searchInSemantic } = require('./semantic')
const { searchAndProcess, plagiarism } = require('./literature_utils')
const { searchAndDoc } = require('./literature_utils')
const { asyncRetryHandler } = require('./dep')
const { default: axios } = require('axios')
// Server Configuration
const PORT = 3000
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

// URLs
app.get('/', (req, res) => {
  res.render('home', { output: '' })
});

app.post('/search', (req, res) => {
  const buttonClicked = req.body.button;
  let query = req.body.inputText;
  console.log(`Searching for ${query}....`)
  console.log(`BUTTON: ${buttonClicked} is clicked!`)
  search(query,buttonClicked).then((sre) => {
    app.locals.searchResults = sre 
    let o = parse_results(sre)
    res.render('home', { output: o })
  }).catch((err) => {
    console.log(`Error :${err}`)
  })
})

app.post('/lr', async (req, res) => {
  const buttonClicked = req.body.button;
  let query = req.body.inputText;
  console.log(`Searching for ${query}....`);
  console.log(`BUTTON: ${buttonClicked} is clicked!`);
  try {
    const sre = await searchAndProcess(`${query}`, 'apa');
   
    res.render('home', { output: sre.data });
  } catch (error) {
    // Handle any errors that occur during the searchAndDoc call
    console.error(error);
   // res.status(500).send('An error occurred while searching and documenting.');
  }
});

/*
app.post('/lr', (req, res) => {
  const buttonClicked = req.body.button;
  let query = req.body.inputText;
  console.log(`Searching for ${query}....`)
  console.log(`BUTTON: ${buttonClicked} is clicked!`)
  search(query,buttonClicked).then((sre) => {
    res.render('home', { output:sre })
  }).catch((err) => {
    console.log(`Error :${err}`)
  })
})
*/
//Initializing the server
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
});


async function search(query, engine) {
  switch (engine) {
    case 'arxiv':
      var res = await searchInArxiv(`${query}`)
      break;
    case 'archive':
      var res = await searchInArchive(`${query}`)
      break;
    case 'semantic':
      var res = await searchInSemantic(`${query}`)
      break;
    case 'LR':
      var res = searchAndDoc(`${query}`,'apa')
        break;
   // default:
     // var res = await searchInArxiv(`${query}`)
  }
  return res
}

function parse_results(results) {
  var htmlRes = ''
  for (let r of results) {
    var item = `<div class='item'><h4>Title:${r.title}</h4><h4>Author:${r.authors}</h4><h4>Published:${r.published}</h4><h4>PDF:<a href='${r.pdf_url}'>Download</a></h4></div>`
    htmlRes += item
  }
  return htmlRes
}

/*
async function deliverSemanticResults(query) {
  let res = await searchInSemantic(query)
  let i = 0;
  var htmlRes = ''
  for (let r of res) {
    var item = `<div class='item'><h4>Title:${r.title}</h4><h4>Author:${r.author}</h4><h4>Published:${r.publish_year}</h4><h4>`
    item = (r.pdfLink == '')? item + '</div>' :item + `PDF:<a href='${r.pdfLink}'>Download</a></h4></div>`
    htmlRes += item
  }
  return htmlRes
}
*/


