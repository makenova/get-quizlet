'use strict'

let fs = require('fs')
let cheerio = require('cheerio')
let request = require('request')
let async = require('async')

module.exports = {
  getQuiz: getPage,
  parseQuiz: parsePage,
  writeFile: writeFile
}

// helpers
function zipQA(arr1, arr2) {
  return arr1.map(function(arr1element, arr1index) {
    return {queston: arr1element, answer: arr2[arr1index]}
  })
}

// main functions
function getPage(siteurl) {
  return new Promise((resolve, reject) => {
    request(siteurl, function(err, res, body) {
      if (err) reject(err)
      return resolve(body)
    })
  })
}

function parsePage(quizpage) {
  let $ = cheerio.load(quizpage)
  let questions = []
  let answers = []

  $('.SetPageTerm-wordText').each(function(index, element) {
    questions.push($(this).text())
  })

  $('.SetPageTerm-definitionText').each(function(index, element) {
    answers.push($(this).text())
  })

  if (questions.length !== answers.length)
    return Promise.reject(new Error('The questions and answers do not match.'))

  let title = $('h1').first().text()
  let parsedPageObj = {title: title, questions: questions, answers:answers}
  return Promise.resolve(parsedPageObj)
}

function writeFile(siteurl, parsedPageObj) {
  if (parsedPageObj === undefined) {
    parsedPageObj = siteurl
    siteurl = null
  }

  let NLC = "\n" // new line
  let qaArray = zipQA(parsedPageObj.questions, parsedPageObj.answers)
  // append to a file with its name as the quizlet title
  let fileTitle = parsedPageObj.title.trim().replace(/\s/g, '_') + '.txt'
  // write the url and title at the top of the page
  fs.appendFileSync(fileTitle, (siteurl || '') + NLC + parsedPageObj.title + NLC)
  // iterate over qaArray and write out numbered qa pairs
  // using async because of errors
  async.forEachOf(qaArray, function(qaPair, qaIndex, callback) {
    try{
      fs.appendFileSync(fileTitle, NLC + qaIndex + ". " + qaPair.queston + NLC)
      fs.appendFileSync(fileTitle, qaPair.answer + NLC)
    }catch(ex) {
      return callback(ex)
    }
    callback(null)
  }, (err) => {
    if (err) return Promise.reject(err)
    console.log('file written to ' + fileTitle)
  })
  return Promise.resolve()
}
