/* global hcNS fetch */

hcNS.Unicom = class {
  constructor (theServerURL, theProjectID, theIsTest) {
    console.log('Unicom constructor')

    this.sessionVariables = { project: theProjectID, engine: null, savepoint: null, session: null, renderer: null }
    this.serverURL = theServerURL
    this.lastXMLResponse = null
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
      .then(html => theWhenDone(html))
  }
}
