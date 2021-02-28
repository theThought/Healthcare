function AppClass () {
  var me = this

  // Properties
  this.ServerURL = 'https://corsstaging.ipsosinteractive.com/mriWeb/mriWeb.dll'
  this.ProjectId = 'S2021211'
  this.IsTest = '1'
  this.SessionDetails = { project: null, engine: null, savepoint: null, session: null, renderer: null }
  this.xmlRequestQuestionTemplate = null
  this.xmlSubmitQuestionTemplate = null
  this.xmlSubmitPage1Template = null
  this.xmlProcessRequestQuestionTemplate = null
  this.FormValidationPanel = { rating: false, comment: true, gender: false }
  this.LastXMLResponse = null
  this.PageVariables = { id: '' }
  this.LoadPanel = [false, false]

  // Events
  me.onDocument_Ready = function () {
    console.log('document ready')
    me.ReadQueryString()
    me.PerformInitialGet()
  }

  /*
  me.onGetUnicom_Click = function (theEvent) {
    console.log(theEvent.target.id)
    me.PerformInitialGet()
  }
  */

  me.onPage1Submit_Click = function (theEvent) {
    me.RequestPage1()
  }

  me.onPage2Submit_Click = function (theEvent) {
    me.RequestPage2()
  }

  me.onMultiChoiceList_Blur = function (theEvent) {
    const multipleChoiceArticle = document.querySelector('.multiplechoices')
    const jsonSubmitAnswer = { question: 'ChooseTwoOptions', answer: me.FindSelectedOptions(multipleChoiceArticle), after: me.onMultiChoice_Saved }
    me.GenerateRequest(jsonSubmitAnswer)
  }

  me.onSingleChoiceInput_Focus = function (theEvent) {
    console.log(theEvent)
    me.ProcessFunction('Process_ApplyChooseOneOptionFilter', 'ChooseOneOption', false)
    // me.RequestQuestionDetails('ChooseOneOption')
  }

  me.onMultiChoice_Saved = function (theEvent) {
    console.log('multichoice saved, ready to get single choice list')
    me.ProcessFunction('Process_ApplyChooseOneOptionFilter', 'ChooseOneOption', false)
  }
  /*
  me.onGenderSubmit_Click = function (theEvent) {
    const jsonSubmitAnswer = { question: 'Gender', answer: me.CaptureRadioResponse('genderoptions') }
    me.GenerateRequest(jsonSubmitAnswer)
  }
  */

  /*
  me.onRatingSubmit_Click = function (theEvent) {
    const jsonSubmitAnswer = { question: 'Rating', answer: me.CaptureRatingResponse() }
    me.GenerateRequest(jsonSubmitAnswer)
  }
  */

  /*
  me.onGenderOptions_Click = function (theEvent) {
    document.getElementById('GenderSubmit').disabled = false
  }
  */
  /*
  me.onRating_Change = function (theEvent) {
    console.log(theEvent.target.value)
    if (theEvent.target.value !== null && theEvent.target.value !== '') {
      me.FormValidationPanel.rating = true
    } else {
      me.FormValidationPanel.rating = false
    }
    me.CheckValidationPanel()
  }
  */

  /*
  me.onComments_Change = function (theEvent) {
    console.log(theEvent.target.value)
    if (theEvent.target.value !== null && theEvent.target.value !== '') {
      me.FormValidationPanel.comment = true
    } else {
      me.FormValidationPanel.comment = true
    }
    me.CheckValidationPanel()
  }
  */

  me.onUnicom_Response = function (theResponse) {
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

  me.onUnicom_ReceiveGet = function (theHTML) {
    console.log('now grab information from Get')
    me.ReadFormInputs(theHTML)
    me.LoadTab(0)
  }

  me.onXMLRequest_Response = function (theResponse) {
    switch (theResponse.status) {
      case 200:
        return theResponse.text()
      default:
        console.log('there was a response errror when requesting xml')
        return null
    }
  }

  me.onXMLRequest_Parse = function (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlRequestQuestionTemplate = xmlContent
  }

  me.onXMLSubmit_Parse = function (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlSubmitQuestionTemplate = xmlContent
  }

  me.onXMLPage1_Parse = function (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlSubmitPage1Template = xmlContent
  }

  me.onXMLPage2_Parse = function (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlSubmitPage2Template = xmlContent
  }

  me.onXMLRequestProcess_Parse = function (xmlText) {
    var xmlContent
    if (xmlText === null) return null

    try {
      xmlContent = new window.DOMParser().parseFromString(xmlText, 'text/xml')
    } catch (theError) {
      console.log('the html did not parse correctly')
      return null
    }
    this.xmlProcessRequestQuestionTemplate = xmlContent
  }

  me.onXMLRequest_Error = function (theError) {
    console.log('something went horribly wrong with requesting xml')
    console.log(theError)
  }

  me.onGenerateRequest_Parse = function (theText) {
    if (theText === null) return false

    console.log('Request Response')
    console.log(theText)
    try {
      me.LastXMLResponse = new window.DOMParser().parseFromString(theText, 'text/xml')
    } catch (theError) {
      console.log('The XML response is not valid')
      return false
    }
    return true
  }

  me.onGenerateRequest_NextStep = function (theValidation, theInformation) {
    if (!theValidation) return null

    me.GenerateSubmit(theInformation)
  }

  me.onGeneratePageRequest_NextStep = function (theValidation, theInformation) {
    if (!theValidation) return null

    me.LoadPage1()
  }

  me.onGenerateDetailsRequest_NextStep = function (theValidation, theInformation) {
    if (!theValidation) return null

    me.GenerateNullSubmit(theInformation.question, theInformation.answer)
  }

  me.onGenerateRequest_Error = function (theError) {
    console.log('something went wrong requesting a question')
    console.log(theError)
  }

  me.onGenerateSubmit_Parse = function (theText) {
    if (theText === null) return null
    console.log('Submit Response')
    console.log(theText)
  }

  me.onPreformFunction_NextStep = function (theValidation, theInformation) {
    console.log(theValidation)
    const categoryList = me.ExtractCategoriestoDropDown(theInformation)
    me.RefereshDropdownList(categoryList, 'singlechoiceinput')
    me.RequestIdleState('ChooseOneOption')
  }

  me.onRequestPage1_Parse = function (theText) {
    console.log(theText)
    me.SubmitPage1()
  }

  me.onRequestPage2_Parse = function (theText) {
    console.log(theText)
    me.SubmitPage2()
  }

  this.Setup()

}

AppClass.prototype.Setup = function () {
  const buttonPage1 = document.getElementById('FormSubmit')
  const buttonPage2 = document.getElementById('FormSubmit2')
  const selectMultiple = document.getElementById('multichoicelist')
  const selectSingle = document.getElementById('singlechoiceinput')

  this.GetRequestQuestionTemplate()
  this.GetSubmitQuestionTemplate()
  this.GetSubmitPage1Template()
  this.GetSubmitPage2Template()
  this.GetProcessRequestQuestionTemplate()

  // document.getElementById('getunicom').addEventListener('click', this.onGetUnicom_Click)

  buttonPage1.addEventListener('click', this.onPage1Submit_Click)
  buttonPage2.addEventListener('click', this.onPage2Submit_Click)
  selectMultiple.addEventListener('blur', this.onMultiChoiceList_Blur)

  // selectSingle.addEventListener('focus', this.onSingleChoiceInput_Focus)

  // This code was used to defined when the submit buttons should be enabled when we were using single question submission
  // buttonGender.disabled = true
  // this.CheckValidationPanel()

  // this.SetupGenderButtons()

  // document.getElementById('rating').addEventListener('change', this.onRating_Change)
  // document.getElementById('comments').addEventListener('change', this.onComments_Change)
}

AppClass.prototype.ReadQueryString = function () {
  const query = window.location.search.substring(1)
  const variables = query.split('&')
  if (query !== '') {
    for (let counter = 0; counter < variables.length; counter++) {
      const nameValuePair = variables[counter].split('=')

      if (nameValuePair[1].indexOf('[') > -1) this.PageVariables[nameValuePair[0].toLowerCase()] = JSON.parse(nameValuePair[1])
      else this.PageVariables[nameValuePair[0].toLowerCase()] = nameValuePair[1]
    }
  }
}
/*
AppClass.prototype.SetupGenderButtons = function () {
  const inputNodes = document.getElementsByTagName('input')
  const howManyInputNodes = inputNodes.length
  for (var counter = 0; counter < howManyInputNodes; counter++) {
    const currentNode = inputNodes[counter]
    const currentClass = currentNode.getAttribute('Class').toLowerCase()
    if (currentClass === 'genderoptions') currentNode.addEventListener('click', this.onGenderOptions_Click)
  }
}
*/

AppClass.prototype.PerformInitialGet = function () {
  console.log('start initial get')
  const fullURL = this.ServerURL + '?i.project=' + this.ProjectId + '&i.test=' + this.IsTest + '&i.renderer=xmlplayer' + '&ID=' + this.PageVariables.id
  fetch (fullURL, {
    method: 'GET'
  })
    .then(response => this.onUnicom_Response(response))
    .then(html => this.onUnicom_ReceiveGet(html))
}

AppClass.prototype.ReadFormInputs = function (theHTML) {
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
        this.SessionDetails[currentRealName] = currentValue
      }
    }
  }
}

AppClass.prototype.GenerateRequest = function (theJSON) {
  const postBody = this.BuildRequestBody(theJSON.question)
  console.log(postBody)
  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateRequest_Parse(xmlText))
    .then(isValid => this.onGenerateRequest_NextStep(isValid, theJSON))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.GeneratePageRequest = function (theJSON) {
  const postBody = this.BuildPageRequestBody(theJSON.question, theJSON.ask)
  console.log(postBody)
  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateRequest_Parse(xmlText))
    .then(isValid => this.onGeneratePageRequest_NextStep(isValid, theJSON))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.GenerateSubmit = function (theInformation) {
  console.log('Question: ' + theInformation.question)
  console.log('Answer' + theInformation.answer)

  const postBody = this.BuildSubmitBody(theInformation.question, theInformation.answer)

  if (theInformation.after !== null) {
    fetch(this.ServerURL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postBody
      })
      .then(response => this.onUnicom_Response(response))
      .then(xmlText => this.onGenerateSubmit_Parse(xmlText))
      .then(isValid => theInformation.after())
      .catch(error => this.onGenerateRequest_Error(error))
  } else {
    fetch(this.ServerURL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postBody
      })
      .then(response => this.onUnicom_Response(response))
      .then(xmlText => this.onGenerateSubmit_Parse(xmlText))
      .catch(error => this.onGenerateRequest_Error(error))
  }
}

AppClass.prototype.BuildRequestBody = function (theQuestion, theDoAsk) {
  var isAsk

  if (theDoAsk === undefined) isAsk = true
  else isAsk = theDoAsk

  const content = this.BuildEncodedRequestContent(theQuestion, isAsk)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildPageRequestBody = function (theQuestion, theDoAsk) {
  var isAsk

  if (theDoAsk === undefined) isAsk = true
  else isAsk = theDoAsk

  const content = this.BuildEncodedPageRequestContent(theQuestion, isAsk)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildSubmitBody = function (theQuestion, theAnswer) {
  const content = this.BuildEncodedSubmitContent(theQuestion, theAnswer)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=',
    theQuestion,
    '&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}
AppClass.prototype.BuildEncodedRequestContent = function (theQuestion, theDoAsk) {
  //  <Page SavePoint="Idle" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Idle" QuestionFullName="Idle"><Response><Value /></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = this.xmlRequestQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)
  const whatsNextJSON = this.BuildWhatsNextforQuestionRequest(theQuestion, theDoAsk)

  newNode.setAttribute('Project', this.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length
  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const questionName = currentNode.getAttribute('QuestionName')
    if (questionName === 'WhatsNext') {
      const responseNode = currentNode.childNodes[0]
      const valueNode = responseNode.childNodes[0]
      valueNode.textContent = whatsNextJSON
    }
  }
  const serializer = new XMLSerializer()
  console.log('Request XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.BuildEncodedPageRequestContent = function (theQuestion, theDoAsk) {
  //  <Page SavePoint="Idle" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Idle" QuestionFullName="Idle"><Response><Value /></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = this.xmlRequestQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)
  const whatsNextJSON = this.BuildWhatsNextforPageRequest(theQuestion, theDoAsk)

  newNode.setAttribute('Project', this.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length
  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const questionName = currentNode.getAttribute('QuestionName')
    if (questionName === 'WhatsNext') {
      const responseNode = currentNode.childNodes[0]
      const valueNode = responseNode.childNodes[0]
      valueNode.textContent = whatsNextJSON
    }
  }
  const serializer = new XMLSerializer()
  console.log('Request XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.BuildEncodedSubmitContent = function (theQuestion, theAnswer) {
  //  <Page SavePoint="Gender" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Gender" QuestionFullName="Gender"><Response><Value>{Male}</Value></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Idle","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = this.xmlSubmitQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)

  newNode.setAttribute('Project', this.ProjectId)
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

AppClass.prototype.BuildWhatsNextforQuestionRequest = function (theQuestion, theDoAsk) {
// {"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}
  const jsonWhatsNext = { WhatsNext: [{ Action: 'Question', Name: '', Parameters: '' }] }
  jsonWhatsNext.WhatsNext[0].Name = theQuestion
  jsonWhatsNext.WhatsNext[0].Parameters = theDoAsk
  console.log('JSON: ' + JSON.stringify(jsonWhatsNext))
  return JSON.stringify(jsonWhatsNext)
}

AppClass.prototype.BuildWhatsNextforPageRequest = function (theQuestion, theDoAsk) {
// {"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}
  const jsonWhatsNext = { WhatsNext: [{ Action: 'Page', Name: '', Parameters: '' }] }
  jsonWhatsNext.WhatsNext[0].Name = theQuestion
  jsonWhatsNext.WhatsNext[0].Parameters = theDoAsk
  console.log('JSON: ' + JSON.stringify(jsonWhatsNext))
  return JSON.stringify(jsonWhatsNext)
}

AppClass.prototype.GetRequestQuestionTemplate = function () {
  fetch ('RequestQuestion.xml', {
    method: 'GET'
  })
    .then(response => this.onXMLRequest_Response(response))
    .then(xmlText => this.onXMLRequest_Parse(xmlText))
    .catch(error => this.onXMLRequest_Error(error))
}

AppClass.prototype.GetSubmitQuestionTemplate = function () {
  fetch ('SubmitQuestion.xml', {
    method: 'GET'
  })
    .then(response => this.onXMLRequest_Response(response))
    .then(xmlText => this.onXMLSubmit_Parse(xmlText))
    .catch(error => this.onXMLRequest_Error(error))
}

AppClass.prototype.GetSubmitPage1Template = function () {
  fetch ('Page1.xml', {
    method: 'GET'
  })
    .then(response => this.onXMLRequest_Response(response))
    .then(xmlText => this.onXMLPage1_Parse(xmlText))
    .catch(error => this.onXMLRequest_Error(error))
}

AppClass.prototype.GetSubmitPage2Template = function () {
  fetch ('Page2.xml', {
    method: 'GET'
  })
    .then(response => this.onXMLRequest_Response(response))
    .then(xmlText => this.onXMLPage2_Parse(xmlText))
    .catch(error => this.onXMLRequest_Error(error))
}

AppClass.prototype.GetProcessRequestQuestionTemplate = function () {
  fetch ('RequestProcess.xml', {
    method: 'GET'
  })
    .then(response => this.onXMLRequest_Response(response))
    .then(xmlText => this.onXMLRequestProcess_Parse(xmlText))
    .catch(error => this.onXMLRequest_Error(error))
}
AppClass.prototype.CaptureRadioResponse = function (theName) {
  const inputTags = document.getElementsByTagName('input')
  const howManyInputTags = inputTags.length
  for (var counter = 0; counter < howManyInputTags; counter++) {
    const currentTag = inputTags[counter]
    const currentClass = currentTag.getAttribute('name')
    if (currentClass === theName) {
      const currentValue = currentTag.checked
      if (currentValue) {
        // check this change
        const tagName = currentTag.getAttribute('id')
        const returnAnswer = '{' + tagName + '}'
        return returnAnswer
      }
    }
  }
}

AppClass.prototype.ExtractCategoriestoDropDown = function (theQuestionName) {
  const xmlCurrentResponse = this.LastXMLResponse
  const rootNode = xmlCurrentResponse.documentElement
  const foundNode = this.FindXMLQuestionNode(theQuestionName, rootNode)
  var categoryList = { list: [] }
  var categoryCount = 0
  if (foundNode !== null) {
    const categoryNodes = foundNode.getElementsByTagName('Category')
    const howManyCategories = categoryNodes.length
    for (var counter = 0; counter < howManyCategories; counter++) {
      const currentCategory = categoryNodes[counter]
      const currentName = currentCategory.getAttribute('Name')
      const currentLabelNode = currentCategory.getElementsByTagName('Label')[0]
      const currentLabel = currentLabelNode.textContent
      var jsonCategory = { name: currentName, label: currentLabel }
      categoryList.list[categoryCount] = jsonCategory
      categoryCount++
    }
  }
  return categoryList
}

AppClass.prototype.FindXMLQuestionNode = function (theQuestion, theRootNode) {
  const questionNodes = theRootNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length
  const checkforName = theQuestion.toLowerCase()

  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const currentQuestionName = currentNode.getAttribute('QuestionName').toLowerCase()
    if (currentQuestionName === checkforName) return currentNode
  }
  return null
}

AppClass.prototype.FindXMLValue = function (theRootNode) {
  const responseNodes = theRootNode.getElementsByTagName('Response')
  const howManyResponses = responseNodes.length
  if (howManyResponses > 0) {
    const valueNodes = responseNodes[0].getElementsByTagName('Value')
    const howManyValues = valueNodes.length
    if (howManyValues > 0) {
      return valueNodes[0].textContent
    } else {
      return null
    }
  } else {
    return null
  }
}

AppClass.prototype.FindArticleClass = function (theQuestionName) {
  const articleTags = document.getElementsByTagName('article')
  const howManyArticleTags = articleTags.length

  for (var counter = 0; counter < howManyArticleTags; counter++) {
    const currentTag = articleTags[counter]
    const currentTagClasses = currentTag.classList
    const howManyClasses = currentTagClasses.length
    for (var looper = 0; looper < howManyClasses; looper++) {
      const currentClass = currentTagClasses[looper]
      if (currentClass === theQuestionName) {
        return currentTag
      }
    }
  }
}

AppClass.prototype.FindSelectedInputs = function (theArticle) {
  const inputTags = theArticle.getElementsByTagName('input')
  const howManyInputTags = inputTags.length
  var selectedInputs = []

  for (var counter = 0; counter < howManyInputTags; counter++) {
    const currentTag = inputTags[counter]
    if (currentTag.checked) {
      selectedInputs.push(currentTag.getAttribute('id'))
    }
  }

  var arrayString = selectedInputs.join(',')
  arrayString = '{' + arrayString + '}'
  return arrayString
}

AppClass.prototype.FindSelectedOptions = function (theArticle) {
  const inputTags = theArticle.getElementsByTagName('option')
  const howManyInputTags = inputTags.length
  var selectedInputs = []

  for (var counter = 0; counter < howManyInputTags; counter++) {
    const currentTag = inputTags[counter]
    if (currentTag.selected) {
      selectedInputs.push(currentTag.getAttribute('value'))
    }
  }

  var arrayString = selectedInputs.join(',')
  arrayString = '{' + arrayString + '}'
  return arrayString
}

AppClass.prototype.CaptureRatingResponse = function () {
  const ratingNode = document.getElementById('rating')
  return ratingNode.value
}

AppClass.prototype.RefereshDropdownList = function (theList, theDestination) {
  const currentSelect = document.getElementById(theDestination)
  const optionList = currentSelect.getElementsByTagName('option')
  const numberOfOptions = optionList.length
  for (var counter = numberOfOptions - 1; counter > 0; counter--) {
    const currentChild = optionList[counter]
    currentSelect.removeChild(currentChild)
  }

  const howManyOptions = theList.list.length
  for (counter = 0; counter < howManyOptions; counter++) {
    const currentOption = theList.list[counter]
    const newOption = document.createElement('option')
    newOption.setAttribute('value', currentOption.name)
    newOption.textContent = currentOption.label
    currentSelect.appendChild(newOption)
  }
}
/*
AppClass.prototype.CheckValidationPanel = function () {
  var panelStatus = false

  if (this.FormValidationPanel.rating && this.FormValidationPanel.comment) {
    panelStatus = true
  }

  document.getElementById('FormSubmit').disabled = !panelStatus
}
*/

AppClass.prototype.RequestPage1 = function () {
  const postBody = this.BuildPageRequestBody('Page1')

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onRequestPage1_Parse(xmlText))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.RequestPage2 = function () {
  const postBody = this.BuildPageRequestBody('Page2')

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onRequestPage2_Parse(xmlText))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.BuildPageRequestBody = function (thePage, theDoAsk) {

  if (theDoAsk === undefined) isAsk = true
  else isAsk = theDoAsk

  const content = this.BuildEncodedPageContent(thePage, isAsk)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildEncodedPageContent = function (thePage, theDoAsk) {
  //  <Page SavePoint="Idle" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Idle" QuestionFullName="Idle"><Response><Value /></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Page","Name":"Page1","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const whatsNextJSON = this.BuildWhatsNextforPageRequest(thePage, theDoAsk)
  const root = this.xmlRequestQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)

  newNode.setAttribute('Project', this.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuuestionNodes = questionNodes.length
  for (var counter = 0; counter < howManyQuuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const questionName = currentNode.getAttribute('QuestionName')
    if (questionName === 'WhatsNext') {
      const responseNode = currentNode.childNodes[0]
      const valueNode = responseNode.childNodes[0]
      valueNode.textContent = whatsNextJSON
    }
  }
  const serializer = new XMLSerializer()
  console.log('Request XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.SubmitPage1 = function () {
  const postBody = this.BuildSubmitPageBody('Page1', this.BuildEncodedSubmitPage1Content)

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateSubmit_Parse(xmlText))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.SubmitPage2 = function () {
  const postBody = this.BuildSubmitPageBody('Page2', this.BuildEncodedSubmitPage2Content)

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateSubmit_Parse(xmlText))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.BuildSubmitPageBody = function (thePage, theHandle) {
  const content = theHandle()
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=',
    thePage,
    '&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildEncodedSubmitPage1Content = function () {
  //  <Page SavePoint="Page1" Project="S2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Page1" QuestionFullName="Page1"><Question QuestionName="gender" QuestionFullName="gender" QuestionDataType="Categorical"><Response><Value>{male}</Value></Response></Question><Question QuestionName="Rating" QuestionFullName="Rating" QuestionDataType="Long"><Response><Value>2</Value></Response></Question><Question QuestionName="Comment" QuestionFullName="Comment" QuestionDataType="Text"><Response><Value>This is the comment</Value></Response></Question></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Idle","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = myApp.xmlSubmitPage1Template.documentElement
  const newNode = root.cloneNode(true)

  newNode.setAttribute('Project', myApp.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')

  var questionNode = questionNodes[2] // Gender Question

  var responseNode = questionNode.childNodes[0]
  var valueNode = responseNode.childNodes[0]

  var currentQuestionArticle = myApp.FindArticleClass('gender')
  var currentResponse = myApp.FindSelectedInputs(currentQuestionArticle)
  valueNode.textContent = currentResponse

  questionNode = questionNodes[3] // Rating Question
  responseNode = questionNode.childNodes[0]
  valueNode = responseNode.childNodes[0]

  currentResponse = document.getElementById('rating').value
  valueNode.textContent = currentResponse

  questionNode = questionNodes[4] // Comments Question
  responseNode = questionNode.childNodes[0]
  valueNode = responseNode.childNodes[0]

  currentResponse = document.getElementById('comments').value
  valueNode.textContent = currentResponse

  const serializer = new XMLSerializer()
  console.log('Submit XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.BuildEncodedSubmitPage2Content = function () {
  //  <Page SavePoint="Page1" Project="S2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Page1" QuestionFullName="Page1"><Question QuestionName="gender" QuestionFullName="gender" QuestionDataType="Categorical"><Response><Value>{male}</Value></Response></Question><Question QuestionName="Rating" QuestionFullName="Rating" QuestionDataType="Long"><Response><Value>2</Value></Response></Question><Question QuestionName="Comment" QuestionFullName="Comment" QuestionDataType="Text"><Response><Value>This is the comment</Value></Response></Question></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Idle","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = myApp.xmlSubmitPage2Template.documentElement
  const newNode = root.cloneNode(true)

  newNode.setAttribute('Project', myApp.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')

  var questionNode = questionNodes[2] // ChooseTwoOptions Question
  var responseNode = questionNode.childNodes[0]
  var valueNode = responseNode.childNodes[0]

  var currentQuestionArticle = myApp.FindArticleClass('multiplechoices')
  var currentResponse = myApp.FindSelectedOptions(currentQuestionArticle)
  valueNode.textContent = currentResponse

  questionNode = questionNodes[3] // ChooseOneOption Question
  responseNode = questionNode.childNodes[0]
  valueNode = responseNode.childNodes[0]

  currentQuestionArticle = myApp.FindArticleClass('multiplechoices')
  currentResponse = myApp.FindSelectedOptions(currentQuestionArticle)
  valueNode.textContent = currentResponse

  const serializer = new XMLSerializer()
  console.log('Submit XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}


// Requesting Details of a page
AppClass.prototype.RequestQuestionDetails = function (theQuestion) {
  const postBody = this.BuildRequestBody(theQuestion, false)
  console.log(postBody)

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateRequest_Parse(xmlText))
    .then(isValid => this.onGenerateDetailsRequest_NextStep(isValid, theQuestion))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.ProcessFunction = function (theAction, theQuestion, theIsShown) {
  const postBody = this.BuildProcessRequestBody(theAction, theQuestion, theIsShown)
  console.log(postBody)

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateRequest_Parse(xmlText))
    .then(isValid => this.onPreformFunction_NextStep(isValid, theQuestion))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.BuildProcessRequestBody = function (theAction, theQuestion, theIsShown) {
  const content = this.BuildEncodedFunctionRequestContent(theAction, theQuestion, theIsShown)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildEncodedFunctionRequestContent = function (theAction, theQuestion, theIsShown) {
  //  <Page SavePoint="Idle" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Idle" QuestionFullName="Idle"><Response><Value /></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Process","Name":"Process_ApplyChooseOneOptionFilter","Parameters:""},{"Action":"Question","Name":"ChooseOneOption","Parameters:""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = this.xmlProcessRequestQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)
  const whatsNextJSON = this.BuildWhatsNextforProcessRequest(theAction, theQuestion, theIsShown)

  newNode.setAttribute('Project', this.ProjectId)
  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length
  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const questionName = currentNode.getAttribute('QuestionName')
    if (questionName === 'WhatsNext') {
      const responseNode = currentNode.childNodes[0]
      const valueNode = responseNode.childNodes[0]
      valueNode.textContent = whatsNextJSON
    }
  }

  const serializer = new XMLSerializer()
  console.log('Request XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.BuildWhatsNextforProcessRequest = function (theAction, theQuestion, theIsShown) {
// {"WhatsNext":[{"Action":"Process","Name":"Process_ApplyChooseOneOptionFilter","Parameters:""},{"Action":"Question","Name":"Idle","Parameters:""}]}
  const jsonWhatsNext = { WhatsNext: [{ Action: 'Process', Name: '', Parameters: '' }, { Action: 'Question', Name: '', Parameters: '' }] }
  jsonWhatsNext.WhatsNext[0].Name = theAction
  // jsonWhatsNext.WhatsNext[0].Parameters = theDoAsk
  jsonWhatsNext.WhatsNext[1].Name = theQuestion
  jsonWhatsNext.WhatsNext[1].Parameters = theIsShown
  console.log('JSON: ' + JSON.stringify(jsonWhatsNext))
  return JSON.stringify(jsonWhatsNext)
}

AppClass.prototype.RequestIdleState = function (theQuestion) {
  const postBody = this.BuildReturnToIdleBody(theQuestion)
  console.log(postBody)

  fetch(this.ServerURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody
    })
    .then(response => this.onUnicom_Response(response))
    .then(xmlText => this.onGenerateRequest_Parse(xmlText))
    .catch(error => this.onGenerateRequest_Error(error))
}

AppClass.prototype.BuildReturnToIdleBody = function (theQuestion, theDoAsk) {
  var isAsk

  if (theDoAsk === undefined) isAsk = true
  else isAsk = theDoAsk

  const content = this.BuildEncodedReturnToIdleContent(theQuestion, isAsk)
  // I.Engine={{EngineID}}&I.Session={{SessionID}}&I.Project=S2021211&I.SavePoint=Idle&I.Renderer=XMLPlayer&PlayerXml=
  const bodyContent = [
    'I.Engine=',
    this.SessionDetails.engine,
    '&I.Session=',
    this.SessionDetails.session,
    '&I.Project=',
    this.ProjectId,
    '&I.SavePoint=',
    theQuestion,
    '&I.Renderer=XMLPlayer&PlayerXml=',
    encodeURIComponent(content),
    '%0D%0A%09%09%09'
  ].join('')

  return bodyContent
}

AppClass.prototype.BuildEncodedReturnToIdleContent = function (theQuestion, theDoAsk) {
  //  <Page SavePoint="Idle" Project="s2021211"><Question QuestionName="@DynamicPage" QuestionFullName="@DynamicPage" QuestionType="Page"><Question QuestionName="Idle" QuestionFullName="Idle"><Response><Value /></Response></Question><Question QuestionName="WhatsNext" QuestionFullName="WhatsNext" QuestionDataType="Text" MustAnswer="false"><Response><Value>{"WhatsNext":[{"Action":"Question","Name":"Gender","Parameters":""}]}</Value></Response></Question></Question><Navigation Type="Next" IsSelected="true" /></Page>

  const root = this.xmlRequestQuestionTemplate.documentElement
  const newNode = root.cloneNode(true)
  const whatsNextJSON = JSON.stringify({ WhatsNext: [{ Action: 'Question', Name: 'Idle', Parameters: '' }] })

  newNode.setAttribute('Project', this.ProjectId)
  newNode.setAttribute('SavePoint', theQuestion)
  newNode.setAttribute('ShowOnly', 'true')

  const questionNodes = newNode.getElementsByTagName('Question')
  const howManyQuestionNodes = questionNodes.length
  for (var counter = 0; counter < howManyQuestionNodes; counter++) {
    const currentNode = questionNodes[counter]
    const questionName = currentNode.getAttribute('QuestionName')
    if (questionName === 'Idle') {
      currentNode.setAttribute('QuestionName', theQuestion)
      currentNode.setAttribute('QuestionFullName', theQuestion)
    }
  }

  const serializer = new XMLSerializer()
  console.log('Request XML: ' + serializer.serializeToString(newNode))
  return serializer.serializeToString(newNode)
}

AppClass.prototype.LoadTab = function (theTab) {
  if (this.LoadPanel[theTab]) return null
  const jsonSubmitAnswer = { question: 'Page1', answer: null, ask: false }
  this.GeneratePageRequest(jsonSubmitAnswer)
}

AppClass.prototype.LoadPage1 = function () {
  console.log('load page 1')
  const xmlCurrentResponse = this.LastXMLResponse
  const rootNode = xmlCurrentResponse.documentElement
  var foundNode = this.FindXMLQuestionNode('Gender', rootNode)
  var currentValue = this.FindXMLValue(foundNode)

  foundNode = this.FindXMLQuestionNode('Rating', rootNode)
  currentValue = this.FindXMLValue(foundNode)
  document.getElementById('rating').value = currentValue

  foundNode = this.FindXMLQuestionNode('Comment', rootNode)
  currentValue = this.FindXMLValue(foundNode)
  document.getElementById('comments').value = currentValue
}

var myApp = new AppClass()
document.addEventListener('DOMContentLoaded', myApp.onDocument_Ready)
