/* global hcNS */

hcNS.UX = class {
  constructor () {
    console.log('UX Constructor')
  }

  // constants

  // private variables

  // private functions

  // event handlers

  // Methods
  UpdateSessionPanel (theSessionVariables) {
    console.log('setup panel')
    var currentStatusDiv = document.getElementById('sessionstatus')
    if (currentStatusDiv !== null) {
      if (theSessionVariables.session !== '') currentStatusDiv.textContent = 'Connected'
      else currentStatusDiv.textContent = 'disconnected'
    }

    currentStatusDiv = document.getElementById('statussession')
    if (currentStatusDiv !== null) currentStatusDiv.textContent = theSessionVariables.session

    currentStatusDiv = document.getElementById('statusengine')
    if (currentStatusDiv !== null) currentStatusDiv.textContent = theSessionVariables.engine
  }
}
