var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var siteurl = process.argv[2];

(function main(siteurl) {
  if(!siteurl){ return console.log('You must provide a url');}
  getPage(siteurl, function(err, page){
    if (err) throw err;
    parsePage(page, function(err, parsedPageObj){
      if (err) throw err;
      writeFile(parsedPageObj, function(err, success){
        if (err || !success){
          console.log('failed to write the file');
          throw err;
        }
        console.log('file written to ' + fileNameTitle(parsedPageObj.title));
      });
    });
  });
}(siteurl));

function getPage(siteurl, callback){
  if (process.env.NODE_ENV === 'development'){
    fs.readFile('./quiztest.html', 'utf8', function(err, file){
      if (err) return callback(err);
      console.log('read from disk');
      return callback(null, file);
    });
  }else {
    request(siteurl, function(err, res, body){
      if (err) return callback(err);
      return callback(null, body);
    });
  }
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

function writeFile(parsedPageObj, callback){
  // Write to a file with its name as the quizlet title
  var fileTitle = fileNameTitle(parsedPageObj.title);
  var NLN = "\n";
  // write the title at the top of the page
  fs.appendFileSync(fileTitle, parsedPageObj.title + NLN);
  // iterate over qaArray and write out numbered qa pairs
  async.forEachOf(parsedPageObj.qaArray, function(qaPair, qaIndex, cb){
    fs.appendFileSync(fileTitle, NLN + qaIndex + ". " + qaPair.queston + NLN);
    fs.appendFileSync(fileTitle, qaPair.answer + NLN);
    cb(null);
  });
  return callback(null, true);
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
