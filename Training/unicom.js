console.log('loaded')
var submitButton
submitButton = document.getElementById('GenderSubmit')
submitButton.addEventListener('click', RequestQuestion)

function InitialGet (theProject, theTest) {
// http://staging01.ipsosinteractive.com/mrIWeb/mrIWeb.dll?I.Project=S2021211&i.test=1
  console.log('start get')
  var urlStem = 'https://corsstaging.ipsosinteractive.com/mrIWeb/mrIWeb.dll'
  var urlFull
  urlFull = urlStem + '?i.project=' + theProject + '&i.test=' + theTest

  console.log('full url' + urlFull)
  fetch (urlFull,
    {
      method: 'GET'
    })
    .then(theResponse => CheckResponse(theResponse))
    .then(theData => EvaluateResponse(theData))
}

function CheckResponse (theResponse) {
  console.log('Check Response')
  console.log(theResponse)

  return theResponse
}

function EvaluateResponse (theData) {
  console.log('Evaluate Response')
  console.log(theData)
}

function RequestQuestion () {
  // http://staging01.ipsosinteractive.com/mrIWeb/mrIWeb.dll?I.Project=S2021211&i.test=1
  console.log('start request question')
  var urlStem = 'https://corsstaging.ipsosinteractive.com/mrIWeb/mrIWeb.dll'

  console.log('full url' + urlStem)
  fetch (urlStem,
    {
      method: 'POST',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      body: 'I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=%3CPage%20SavePoint%3D%22Idle%22%20Project%3D%22s2021211%22%3E%3CQuestion%20QuestionName%3D%22%40DynamicPage%22%20QuestionFullName%3D%22%40DynamicPage%22%20QuestionType%3D%22Page%22%3E%3CQuestion%20QuestionName%3D%22Idle%22%20QuestionFullName%3D%22Idle%22%3E%3CResponse%3E%3CValue%20%2F%3E%3C%2FResponse%3E%3C%2FQuestion%3E%3CQuestion%20QuestionName%3D%22WhatsNext%22%20QuestionFullName%3D%22WhatsNext%22%20QuestionDataType%3D%22Text%22%20MustAnswer%3D%22false%22%3E%3CResponse%3E%3CValue%3E%7B%22WhatsNext%22%3A%5B%7B%22Action%22%3A%22Question%22%2C%22Name%22%3A%22Gender%22%2C%22Parameters%22%3A%22%22%7D%5D%7D%3C%2FValue%3E%3C%2FResponse%3E%3C%2FQuestion%3E%3C%2FQuestion%3E%3CNavigation%20Type%3D%22Next%22%20IsSelected%3D%22true%22%20%2F%3E%3C%2FPage%3E%0D%0A%09%09%09'
    })
    .then(theResponse => CheckResponse(theResponse))
    .then(theData => onRequestSuccess(theData))
    .catch(theData => onRequestFailure(theData))
}

function onRequestSuccess (theData) {
  console.log('RequestSuccess')
  console.log(theData)
}

function onRequestFailure () {

}

function SubmitAnswer () {

}

function onSubmitSuccess () {

}

function onSumbitFailure () {

}
