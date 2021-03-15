/* global hcNS fetch */

hcNS.Unicom = class {
  constructor () {
    console.log('Unicom constructor')

    this.ConnectionDetails = { server: '', project: '', test: '', id: '' }
    this.SessionVariables = { project: null, engine: null, savepoint: null, session: null, renderer: null }
    this.lastXMLResponse = null
    this.xmlTemplates = { requestquestionfromidle: null }
    this.LoadXMLTemplates()
  }

  // Properties

  // Events
  onResponse (theResponse) {
    switch (theResponse.status) {
      case 200 :
        return theResponse.text()

      case 503 :
        console.log('Submitted and incorrect answer or performed something illegal')
        return null

      default:
        console.log('unicom did not respond properly')
        return null
    }
  }

  onReceiveGet (theHTML) {
    console.log('now grab information from Get')
    this.ReadFormInputs(theHTML)
  }

  onXMLRequestResponse (theResponse) {
    switch (theResponse.status) {
      case 200:
        return theResponse.text()
      default:
        console.log('there was a response errror when requesting xml')
        return null
    }
  }

  onXMLRequestParse (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlTemplates.requestquestionfromidle = xmlContent
  }

  onXMLRequestError (theError) {
    console.log('something went horribly wrong with requesting xml')
    console.log(theError)
  }
  // Methods

  LoadXMLTemplates () {
    fetch ('RequestQuestion.xml', {
      method: 'GET'
    })
      .then(response => this.onXMLRequestResponse(response))
      .then(xmlText => this.onXMLRequestParse(xmlText))
      .catch(error => this.onXMLRequestError(error))
  }

  SetupConnection (theConnectionDetails) {
    if (theConnectionDetails.server === undefined || theConnectionDetails.project === undefined || theConnectionDetails.test === undefined || theConnectionDetails.id === undefined) return false

    this.ConnectionDetails = theConnectionDetails
    return true
  }

  InitialGet (theAfterAction) {
    console.log('start initial get')
    const fullURL = this.ConnectionDetails.server + '?i.project=' + this.ConnectionDetails.project + '&i.test=' + this.ConnectionDetails.test + '&i.renderer=xmlplayer' + '&ID=' + this.ConnectionDetails.id
    fetch(fullURL, {
      method: 'GET'
    })
      .then(response => this.onResponse(response))
      .then(html => this.onReceiveGet(html))
      .then(html => theAfterAction(html))
  }

  ReadFormInputs (theHTML) {
    var xmlContent
    try {
      xmlContent = new window.DOMParser().parseFromString(theHTML, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }

    const formTags = xmlContent.getElementsByTagName('form')
    const onlyForm = formTags[0]
    const inputTags = onlyForm.getElementsByTagName('input')
    const howManyInputTags = inputTags.length

    for (var counter = 0; counter < howManyInputTags; counter++) {
      const currentInput = inputTags[counter]
      const currentName = currentInput.getAttribute('name')
      const currentValue = currentInput.getAttribute('value')

      if (currentName !== null) {
        if (currentName.substring(0, 2) === 'I.') {
          const currentRealName = currentName.substring(2).toLowerCase()
          this.SessionVariables[currentRealName] = currentValue
        }
      }
    }
  }

  RequestActionFromIdle (theDetails) {
    // { type: 'Question', name: 'QuestionName', parameters: false, after: NextFuction }
    const whatsNextJSON = this.BuildWhatsNextforBasicRequest(theDetails.name, theDetails.parameters)
    this.BuildBodyForRequestFromIdle(whatsNextJSON)
  }

  BuildWhatsNextforBasicRequest (theQuestion, theDoAsk) {
  // {"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}
    const jsonWhatsNext = { WhatsNext: [{ Action: 'Question', Name: '', Parameters: '' }] }
    jsonWhatsNext.WhatsNext[0].Name = theQuestion
    jsonWhatsNext.WhatsNext[0].Parameters = theDoAsk
    console.log('JSON: ' + JSON.stringify(jsonWhatsNext))
    return JSON.stringify(jsonWhatsNext)
  }

  BuildBodyForRequestFromIdle (theWhatsNextJSON) {
    const root = this.xmlTemplates.requestquestionfromidle.documentElement
    const newNode = root.cloneNode(true)

    newNode.setAttribute('Project', this.ConnectionDetails.project)
    const questionNodes = newNode.getElementsByTagName('Question')
    const howManyQuestionNodes = questionNodes.length
    for (var counter = 0; counter < howManyQuestionNodes; counter++) {
      const currentNode = questionNodes[counter]
      const questionName = currentNode.getAttribute('QuestionName')
      if (questionName === 'WhatsNext') {
        const responseNode = currentNode.childNodes[0]
        const valueNode = responseNode.childNodes[0]
        valueNode.textContent = theWhatsNextJSON
      }
    }
    return newNode
  }
}
