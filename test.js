import test from 'ava'
import { parseQuiz } from './'

const TITLE = 'Test Title'
const QUESTION = 'Why is the sky blue?'
const ANSWER = 'Rayleigh Scattering'

const testHTML = `
<h1>${TITLE}</h1>
<div class="SetPageTerm-wordText">${QUESTION}</div>
<div class="SetPageTerm-definition">${ANSWER}</div>
`

test("test", async t => {
  let quizObj = await parseQuiz(testHTML)

  t.is(quizObj.title, TITLE)
  t.deepEqual(quizObj.questions, [QUESTION])
  t.deepEqual(quizObj.answers, [ANSWER])
})
