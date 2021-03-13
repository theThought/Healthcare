/* global hcNS fetch */

hcNS.Unicom = class {
  constructor () {
    console.log('Unicom constructor')

    this.ConnectionDetails = { server: '', project: '', test: '', id: '' }
    this.SessionVariables = { project: null, engine: null, savepoint: null, session: null, renderer: null }
    this.lastXMLResponse = null
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
  SetupConnection (theConnectionDetails) {
    if (theConnectionDetails.server !== undefined || theConnectionDetails.project !== undefined || theConnectionDetails.test !== undefined || theConnectionDetails.id !== undefined) return false

    this.ConnectionDetails = theConnectionDetails
    return true
  }

  InitialGet () {
    console.log('start initial get')
    const fullURL = this.ConnectionDetails.server + '?i.project=' + this.ConnectionDetails.project + '&i.test=' + this.ConnectionDetails.test + '&i.renderer=xmlplayer' + '&ID=' + this.ConnectionDetails.id
    fetch(fullURL, {
      method: 'GET'
    })
      .then(response => this.onResponse(response))
      .then(html => this.onReceiveGet(html))
  }
}
