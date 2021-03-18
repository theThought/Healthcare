var hcNS = {}

hcNS.Core = class {
  constructor () {
    console.log('Healthcare core constructor')

    this.ConnectionDetails = { server: 'https://corsstaging.ipsosinteractive.com/mriWeb/mriWeb.dll', project: '', test: '', id: '' }
    this.Unicom = new hcNS.Unicom(this)
    this.Dosage = new hcNS.Dosage(this)
    this.UX = new hcNS.UX(this)

    // sample url: https://media.ipsosinteractive.com/kevin.gray/healthcare/workshopone/index.html?Project=xxx&test=1&id=0000-5555-0000-0001
    this.ReadQueryString()
    if (this.Unicom.SetupConnection(this.ConnectionDetails) !== true) {
      console.log('Unicom connection not setup correctly')
    } else {
      this.Unicom.InitialGet(this.onInitialGetComplete)
    }
  }

  // constants

  // private variables

  // private functions

  ReadQueryString () {
    const query = window.location.search.substring(1)
    const variables = query.split('&')
    var pageVariables = { project: '', test: '', id: '' }
    if (query !== '') {
      for (let counter = 0; counter < variables.length; counter++) {
        const nameValuePair = variables[counter].split('=')

        if (nameValuePair[1].indexOf('[') > -1) pageVariables[nameValuePair[0].toLowerCase()] = JSON.parse(nameValuePair[1])
        else pageVariables[nameValuePair[0].toLowerCase()] = nameValuePair[1]
      }
    }
    this.DefineConnectionDetails(pageVariables)
  }

  DefineConnectionDetails (theDetails) {
    if (theDetails.project !== '') this.ConnectionDetails.project = theDetails.project
    else this.ConnectionDetails.project = 's2021211'

    if (theDetails.test !== '') this.ConnectionDetails.test = theDetails.test
    else this.ConnectionDetails.test = 1

    if (theDetails.id !== '') this.ConnectionDetails.id = theDetails.id
    else this.ConnectionDetails.id = '0000-5555-0000-0001'
  }

  // event handlers
  onInitialGetComplete () {
    myApp.UX.UpdateSessionPanel(myApp.Unicom.SessionVariables)
  }

  // methods:
}

var myApp
document.addEventListener('DOMContentLoaded', GetStarted)

function GetStarted (theEvent) {
  myApp = new hcNS.Core()
}
