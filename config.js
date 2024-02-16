// APIs Credintals

// GPT API
const GPT_api_key = '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'
const GPT_CONFIG = {
  api_url: 'https://api.openai.com/v1/chat/completions',
  api_key:GPT_api_key,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GPT_api_key}`
              }
}

// AskYourPdf API
const ASK_CONFIG = {
  headers1:{
    'x-api-key': 'ask_091df11bd8bb8d924465b10e464ffffe'
  },
  headers2:{
    'Content-Type': 'application/json',
    'x-api-key': 'ask_091df11bd8bb8d924465b10e464ffffe'
  }
}

// Scholar API
const SCHOLAR_CONFIG = {
  api_key:"74tprW6GKdTpz1VoTxfw3vkC"
}


// Semantic Scholar API
const SEM_api_key = 'fXtwPJIYby5MEMOJdrN067O7rtfDrs3O7TKZbzMt'
const SEMANTIC_CONFIG = {
  api_url:'https://api.semanticscholar.org/graph/v1/paper/search',
  api_key:SEM_api_key,
  headers:{
    'x-api-key': SEM_api_key
  }
}

module.exports = {GPT_CONFIG, ASK_CONFIG, SCHOLAR_CONFIG , SEMANTIC_CONFIG}