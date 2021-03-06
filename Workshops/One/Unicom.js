/* global hcNS fetch */

hcNS.Unicom = class {
  constructor (theParent) {
    console.log('Unicom constructor')
    this.Parent = theParent
    this.ConnectionDetails = { server: '', project: '', test: '', id: '' }
    this.SessionVariables = { project: null, engine: null, savepoint: null, session: null, renderer: null }
    this.LastXMLResponse = null
    this.LastXMLResponseString = null
    this.xmlTemplates = { requestquestionfromidle: null, submitresponsefromaction: null }
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

  onResponseParse (theText) {
    if (theText === null) return false

    console.log('Request Response')
    console.log(theText)
    try {
      this.LastXMLResponseString = theText
      this.LastXMLResponse = new window.DOMParser().parseFromString(theText, 'text/xml')
    } catch (theError) {
      console.log('The XML response is not valid')
      return false
    }
    return true
  }

  onResponseNextStep (theValidation, theInformation) {
    console.log('ready to perform next action')
    theInformation.after(theInformation)
  }

  onResponseError (theError) {
    console.log('something went wrong talking to Unicom')
    console.log(theError)
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

  onXMLRequestParse (xmlText, theSlot) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlTemplates[theSlot] = xmlContent
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
      .then(xmlText => this.onXMLRequestParse(xmlText, 'requestquestionfromidle'))
      .catch(error => this.onXMLRequestError(error))

    fetch ('SubmitQuestion.xml', {
      method: 'GET'
    })
      .then(response => this.onXMLRequestResponse(response))
      .then(xmlText => this.onXMLRequestParse(xmlText, 'submitresponsefromaction'))
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
    const bodyXML = this.BuildBodyForRequestFromIdle(whatsNextJSON)

    // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
    const bodyContent = [
      'I.Engine=',
      this.SessionVariables.engine,
      '&I.Session=',
      this.SessionVariables.session,
      '&I.Project=',
      this.ConnectionDetails.project,
      '&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=',
      encodeURIComponent(bodyXML),
      '%0D%0A%09%09%09'
    ].join('')

    fetch(this.ConnectionDetails.server,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyContent
      })
      .then(response => this.onResponse(response))
      .then(xmlText => this.onResponseParse(xmlText))
      .then((isValid) => this.Parent.UX.onTransactionLogUpdate(isValid, this.LastXMLResponse))
      .then(isValid => this.onResponseNextStep(isValid, theDetails))
      .catch(error => this.onResponseError(error))
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
    const serializer = new XMLSerializer()
    console.log('Request XML: ' + serializer.serializeToString(newNode))
    return serializer.serializeToString(newNode)
  }

  SubmitResponseForAction (theInstructions) {
    // { type: 'Question', name: 'QuestionName', parameters: false, after: NextFuction }
    const content = this.BuildSubmitContent(theInstructions.name, theInstructions.response)
    // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
    const bodyContent = [
      'I.Engine=',
      this.SessionVariables.engine,
      '&I.Session=',
      this.SessionVariables.session,
      '&I.Project=',
      this.ProjectId,
      '&I.SavePoint=',
      theInstructions.name,
      '&I.Renderer=XMLPlayer&PlayerXml=',
      encodeURIComponent(content),
      '%0D%0A%09%09%09'
    ].join('')

    fetch(this.ConnectionDetails.server,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyContent
      })
      .then(response => this.onResponse(response))
      .then(xmlText => this.onResponseParse(xmlText))
      .then((isValid) => this.Parent.UX.onTransactionLogUpdate(isValid, this.LastXMLResponse))
      .then(isValid => this.onResponseNextStep(isValid, theInstructions))
      .catch(error => this.onResponseError(error))
  }

  BuildSubmitContent (theQuestion, theAnswer) {
    //  <Page SavePoint="Gender" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Gender" QuestionFullName="Gender"><Response><Value>{Male}</Value></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Idle","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

    const root = this.xmlTemplates.submitresponsefromaction.documentElement
    const newNode = root.cloneNode(true)

    newNode.setAttribute('Project', this.ConnectionDetails.project)
    newNode.setAttribute('SavePoint', theQuestion)
    const questionNodes = newNode.getElementsByTagName('Question')

    const questionNode = questionNodes[1]
    questionNode.setAttribute('QuestionName', theQuestion)
    questionNode.setAttribute('QuestionFullName', theQuestion)

    const responseNode = questionNode.childNodes[0]
    const valueNode = responseNode.childNodes[0]
    valueNode.textContent = theAnswer

    const serializer = new XMLSerializer()
    console.log('Submit XML: ' + serializer.serializeToString(newNode))
    return serializer.serializeToString(newNode)
  }
}
