/* global hcNS */

hcNS.UX = class {
  constructor (theParent) {
    this.Parent = theParent
    console.log('UX Constructor')
    this.SetupEventHandlers()
  }

  // constants

  // private variables

  // private functions
  SetupEventHandlers () {
    var currentTag = document.getElementById('TestAction')
    currentTag.addEventListener('click', () => this.onTestActionClick())

  }
  // event handlers

  onTestActionClick (theEvent) {
    var instructions = { type: null, name: null, parameters: null, source: this, after: null }
    var currentTag = document.getElementById('actiontype')
    instructions.type = currentTag.value

    currentTag = document.getElementById('actionname')
    if (currentTag.value !== '') instructions.name = currentTag.value
    else instructions.name = 'Idle'

    currentTag = document.getElementById('actionask')
    instructions.parameters = (currentTag.value === 'ask')

    instructions.after = this.onTestActionEnd
    this.Parent.Unicom.RequestActionFromIdle(instructions)
  }

  onTestActionEnd (theSource, theLastXML) {
    theSource.UpdateResponseText(theLastXML)
  }

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

  UpdateResponseText (theLastXML) {
    const responseInput = document.getElementById('xmlResponse')
    responseInput.textContent = theLastXML
  }
}
