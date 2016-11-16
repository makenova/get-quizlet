#!/usr/bin/env node
'use strict'

let fs = require('fs')
let cheerio = require('cheerio')
let request = require('request')
let async = require('async')

let siteurl = process.argv[2]

if(!siteurl) reportErr(new Error('You must provide a url'))

getPage(siteurl)
  .then(parsePage)
  .then(writeFile.bind(null, siteurl))
  .catch(err => reportErr(err))

// helpers
function zipQA(arr1, arr2) {
  return arr1.map(function(arr1element, arr1index) {
    return {queston: arr1element, answer: arr2[arr1index]}
  })
}

function fileNameTitle(title) {
  return title.trim().replace(/\s/g, '_') + '.txt'
}

function reportErr(error) {
  console.error(error.message)
  if(process.env.NODE_ENV === 'development') console.error(error)
  process.exit(1)
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

  $('.SetPageTerm-definition').each(function(index, element) {
    answers.push($(this).text())
  })

  if (questions.length !== answers.length)
    return Promise.reject(new Error('The questions and answers do not match.'))

  var title = $('h1').first().text()
  var parsedPageObj = {title: title, qaArray: zipQA(questions, answers)}
  return Promise.resolve(parsedPageObj)
}

function writeFile(siteurl, parsedPageObj) {
  var NLC = "\n" // new line
  // append to a file with its name as the quizlet title
  var fileTitle = fileNameTitle(parsedPageObj.title)
  // write the url and title at the top of the page
  fs.appendFileSync(fileTitle, siteurl + NLC + parsedPageObj.title + NLC)
  // iterate over qaArray and write out numbered qa pairs
  // using async because of errors
  async.forEachOf(parsedPageObj.qaArray, function(qaPair, qaIndex, callback) {
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
