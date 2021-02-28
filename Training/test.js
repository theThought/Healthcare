function AppClass () {
  const me = this
  this.ServerStem = 'https://corsstaging.ipsosinteractive.com/mrIWeb/mrIWeb.dll'
  this.ProjectID = 'S2021211'
  this.ProjectIsTest = '1'
  this.GetURL = this.ServerStem + '?i.project=' + this.ProjectID + '&i.test=' + this.ProjectIsTest + '&i.renderer=xmlPlayer'
  this.SessionDetails = { project: null, engine: null, savepoint: null, session: null, renderer: null }
  this.RequestQuestionXML = null
  this.SubmitResponseXML = null
  this.WhatsNextQuestionRequest = { WhatsNext: [{ Action: 'Question', Name: '', Parameters: '' }] }

  // Internal Variables

  me.onDocumentReady = function (theEvent) {

  }

  me.onTest1_Click = function (theEvent) {
    me.PerformInitialGet()
  }

  me.onTest2_Click = function (theEvent) {
    me.RequestQuestion('Gender')
  }

  me.onUnicomError = function (theError) {
    console.log(theError)
  }

  me.onUnicomResponse = function (theResponse) {
    console.log(theResponse)

    switch (theResponse.status) {
      case 200:
      // everything is good
        return theResponse.text()

      case 400:
        return null
      default:
    }
  }

  me.onRecieveGet = function (theText) {
    var xmlContent
    if (theText == null) return

    console.log(theText)

    try {
      xmlContent = new window.DOMParser().parseFromString(theText, 'text/xml')
    } catch (theError) {
      console.log(theError)
    }
    me.GetFormDetails(xmlContent)
  }

  me.onRequestXML_Response = function (theResponse) {
    switch (theResponse.status) {
      case 200:
        return theResponse.text()
      default:
        return null
    }
  }

  me.onRequestQuestionXML_Data = function (theText) {
    var xmlContent
    if (theText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(theText, 'text/xml')
    } catch (theError) {
      console.log(theError)
    }
    this.RequestQuestionXML = xmlContent
  }

  me.onRequestQuestionXML_Error = function (theError) {
    console.log('Something went very wrong trying to get the XML for a Question Request')
    console.log(theError)
  }

  me.onRequextQuestion_Validate = function (theText) {
    if (theText === null) return null

    console.log(theText)
  }

  me.onRequestQuestion_Error = function (theError) {
    console.log('something went horribly wrong when trying to request a question')
    console.log(theError)
  }
  this.Setup()
}

AppClass.prototype.Setup = function () {
  this.GetQuestionRequestXML()

  document.getElementById('testGet').addEventListener('click', this.onTest1_Click)
  document.getElementById('testRequest').addEventListener('click', this.onTest2_Click)
}

AppClass.prototype.PerformInitialGet = function () {
  fetch (this.GetURL)
    .then(response => this.onUnicomResponse(response))
    .then(html => this.onRecieveGet(html))
    .catch(error => this.onUnicomError(error))
}

AppClass.prototype.GetFormDetails = function (theXML) {
  const formTags = theXML.getElementsByTagName('form')
  const onlyForm = formTags[0]
  const formInputTags = onlyForm.getElementsByTagName('input')
  const howmanyInputTags = formInputTags.length
  for (var counter = 0; counter < howmanyInputTags; counter++) {
    const currentTag = formInputTags[counter]
    const currentName = currentTag.getAttribute('name')

    if (currentName !== null) {
      if (currentName.substring(0,2) === 'I.') {
        const realName = currentName.substring(2).toLowerCase()
        const realValue = currentTag.getAttribute('value')
        this.SessionDetails[realName] = realValue
      }
    }
  }
}

AppClass.prototype.RequestQuestion = function (theQuestion) {
  const requestBody = this.BuildBodyData(theQuestion)
  fetch(this.ServerStem,
    {
      method: 'POST',
      body: requestBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(response => this.onUnicomResponse(response))
    .then(text => this.onRequextQuestion_Validate(text))
    .catch(error => this.onRequestQuestion_Error(error))
}

AppClass.prototype.BuildBodyData = function (theQuestion) {
  const xmlRequest = this.BuildPlayerXml(theQuestion)
  console.log(xmlRequest)
  const encodedRequest = encodeURI(xmlRequest)
  const bodyData = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.SessionDetails.project,
    '&I.SavePoint=',
    theQuestion,
    '&I.Renderer=XMLPlayer',
    '&PlayerXml=',
    encodedRequest,
    '%0D%0A%09%09%09'
  ].join('')

  return bodyData
}

AppClass.prototype.BuildPlayerXml = function (theQuestion) {
  var jsonWhatsNext = this.WhatsNextQuestionRequest
  jsonWhatsNext.WhatsNext[0].Question = theQuestion

  const rootNode = this.RequestQuestionXML.documentElement
  var newNode = rootNode.cloneNode(true)

  newNode.setAttribute('Project', this.ProjectID)
  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length

  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    if (currentNode.getAttribute('QuestionName') === 'WhatsNext') {
      const responseNode = currentNode.childNodes[0]
      const valueNode = responseNode.childNodes[0]
      valueNode.textContent = JSON.stringify(jsonWhatsNext)

      const serializer = new XMLSerializer()
      return serializer.serializeToString(newNode)
    }
  }
}

AppClass.prototype.GetQuestionRequestXML = function () {
  fetch('RequestQuestion.xml')
    .then(response => this.onRequestXML_Response(response))
    .then(xmlText => this.onRequestQuestionXML_Data(xmlText))
    .catch(error => this.onRequestQuestionXML_Error(error))
}

var myApp = new AppClass()
document.addEventListener('DOMContentLoaded', myApp.onDocumentReady)
