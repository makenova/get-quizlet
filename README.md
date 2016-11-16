# Get Quizlet

[![Build Status](https://travis-ci.org/makenova/get-quizlet.svg?branch=master)](https://travis-ci.org/makenova/get-quizlet)

Grab a quiz from [quizlet](https://quizlet.com) in plain text format.

## Install

```sh
npm install --save get-quizlet

# OR install it globally for cli use

npm install -g get-quizlet
```

## Use

```js
let quiz = require('./get-quizlet')

let quizURL = 'https://quizlet.com/26463057/c-1st-test-flash-cards'

quiz.getQuiz(quizURL).then(quiz.parseQuiz)
```

or if you installed it globally, the cli command will fetch it and write it out
to the current directory.

```sh
getquizlet https://quizlet.com/26463057/c-1st-test-flash-cards
```

## API

### `quiz.getQuiz(quizletURL)`

Fetches a quizlet.

This is just a helper for the cli, you can fetch the quiz however you want.

### `quiz.parseQuiz(quizletHtml)`

Parse a HTML page from quizlet into an quiz object.

The quiz object will have the following properties:

  * title - The title of the quiz as a string
  * questions - an array of the questions as strings
  * answers - an array of the answers as strings

### `quiz.writeFile([siteurl], parsedPageObj)`

Writes a quizlet to the to a file in the current working directory.

This is another helper for the cli.

## Bugs

Please report any bugs to: https://github.com/makenova/get-quizlet/issues

## License

Licensed under the MIT License: https://opensource.org/licenses/MIT
