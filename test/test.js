import test from 'ava'
import { parseQuiz } from '../'
import { readFileSync } from 'fs'

const TITLE = 'c++ 1st test'
const QUESTIONS = [
  'Who discovered the first documented computer bug?',
  `Is the following statement legal: cout>>"Hello, my name is Bill\\";`,
  'You Should write your program before you write your algorithm. (True or False)',
  'It is considered better style to put the braces ([ ]) on separate lines. ( True or False)'
]

const ANSWERS = [
  'Grace Hopper',
  'No because arrows should be pointed the opposite way. <<',
  'False',
  'True'
]

const testHTML = readFileSync('./test/sample.html', 'utf8')

test("test", async t => {
  let quizObj = await parseQuiz(testHTML)

  t.is(quizObj.title, TITLE)
  t.deepEqual(quizObj.questions, QUESTIONS)
  t.deepEqual(quizObj.answers, ANSWERS)
})
