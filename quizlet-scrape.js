#!/usr/bin/env node

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var siteurl = process.argv[2];

(function main(siteurl) {
  if(!siteurl){ return console.log('You must provide a url');}
  getPage(siteurl, function(err, page){
    if (err) reportErr("Could not get the page: " + siteurl ,err);
    parsePage(page, function(err, parsedPageObj){
      if (err) reportErr('There was a problem parsing the page', err);
      writeFile(siteurl, parsedPageObj, function(err){
        if (err) reportErr('failed to write the file', err);
        console.log('file written to ' + fileNameTitle(parsedPageObj.title));
      });
    });
  });
}(siteurl));

function getPage(siteurl, callback){
  request(siteurl, function(err, res, body){
    if (err) return callback(err);
    return callback(null, body);
  });
}

function parsePage(quizpage, callback){
  var $ = cheerio.load(quizpage);
  var questions = [];
  var answers = [];
  
  $('.qWord').each(function(index, element){
    questions.push($(this).text());
  });
  $('.qDef').each(function(index, element){
    answers.push($(this).text());
  });
  if (questions.length !== answers.length){
    return callback(new Error('The questions and answers do not match.'));
  }
  var title = $('.SetTitle-title').text();
  var parsedPageObj = {title: title, qaArray: zipQA(questions, answers)};
  return callback(null, parsedPageObj);
}

function writeFile(siteurl, parsedPageObj, callback){
  var NLC = "\n"; // new line
  // append to a file with its name as the quizlet title
  var fileTitle = fileNameTitle(parsedPageObj.title);
  // write the url and title at the top of the page
  fs.appendFileSync(fileTitle, siteurl + NLC + parsedPageObj.title + NLC);
  // iterate over qaArray and write out numbered qa pairs
  // using async because of errors 
  async.forEachOf(parsedPageObj.qaArray, function(qaPair, qaIndex, cb){
    try{
      fs.appendFileSync(fileTitle, NLC + qaIndex + ". " + qaPair.queston + NLC);
      fs.appendFileSync(fileTitle, qaPair.answer + NLC);
    }catch(ex){
      cb(ex);
      return;
    }
    cb(null);
  }, function(err){ if (err) return callback(err);});
  return callback(null);
}

// helpers
function zipQA(arr1, arr2){
  return arr1.map(function(arr1element, arr1index){
    return {queston: arr1element, answer: arr2[arr1index]};
  });
}

function fileNameTitle(title){
  return title.trim().replace(/\s/g, '_') + '.txt';
}

function reportErr(message, error) {
  console.log(message, error);
  process.exit(1);
}
