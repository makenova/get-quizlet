#!/usr/bin/env node

'use strict'

let quiz = require('./index')

let siteurl = process.argv[2]

if(!siteurl) reportErr(new Error('You must provide a url'))

quiz.getQuiz(siteurl)
  .then(quiz.parseQuiz)
  .then(quiz.writeFile)
  .catch(err => reportErr(err))

function reportErr(error) {
  console.error(error.message)
  if(process.env.NODE_ENV === 'development') console.error(error)
  process.exit(1)
}
