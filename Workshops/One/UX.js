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
    currentTag.addEventListener('click', this.onTestActionClick)
  }
  // event handlers

  onTestActionClick (theEvent) {
    var instructions = { type: null, name: null, parameters: null, after: null }
    var currentTag = document.getElementById('actiontype')
    instructions.type = currentTag.value

    currentTag = document.getElementById('actionname')
    instructions.name = currentTag.value

    currentTag = document.getElementById('actionask')
    instructions.parameter = (currentTag.value === 'ask')

    instructions.after = this.onTestActionEnd()
    this.Parent.Unicom.RequestActionFromIdle(instructions)
  }

  onTestActionEnd () {
    window.alert('Test Action Completed')
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
}
