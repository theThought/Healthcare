/* global hcNS fetch */

hcNS.Unicom = class {
  constructor (theServerURL, theProjectID, theIsTest) {
    console.log('Unicom constructor')

    this.sessionVariables = { project: theProjectID, engine: null, savepoint: null, session: null, renderer: null }
    this.serverURL = theServerURL
    this.lastXMLResponse = null
		this.LastPageContent = null
    this.isTest = theIsTest
    this.xmlTemplates = {}
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
  
  onResponseError(theError)
  {
console.log('Response Error:' + theError)
  }

  onReceiveGet (theHTML) {
    console.log('now grab information from Get')
    this.ReadFormInputs(theHTML)
    this.LoadTab(0)
  }

  // Methods
  InitialGet (theID, theWhenDone) {
    console.log('start initial get')
    const fullURL = this.ServerURL + '?i.project=' + this.SessionVariables.project + '&i.test=' + this.IsTest + '&i.renderer=xmlplayer' + '&ID=' + theID
    fetch(fullURL, {
      method: 'GET'
    })
    .then(response => this.onResponse(response))
	  .then(html => this.ReadFormInputs(html))
	  .then(html => this.ParseXMLBody(html))
    .then(success => theWhenDone(success))
	  .catch(error => this.onResponseError(error))
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
					if (currentValue !== '') {
						this.SessionDetails[currentRealName] = currentValue
					}
	      }
	    }
	  }
  }
  
  ParseXMLBody(theHTML) {
  if (theHTML === null) return false

  console.log('Request Response')
  console.log(theText)
  try {
    this.LastXMLResponse = new window.DOMParser().parseFromString(theText, 'text/xml')
  } catch (theError) {
    console.log('The XML response is not valid')
    return false
  }

	const xmlContentAreas = this.LastXMLResponse.getElementsByTagName('textarea')
	const howManyAreas = xmlContentAreas.length()
		if (howManyAreas > 0) {
			this.LastPageContent = xmlContentAreas[0]
		}
    return true
  }
}
