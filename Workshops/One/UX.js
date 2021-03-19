/* global hcNS */

hcNS.UX = class {
  constructor (theParent) {
    this.Parent = theParent
    this.TransactionCount = 0
    this.CurrentTransactionHighlight = null
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

  onTransactionLogUpdate (theValid, theXML) {
    const existingTableLastNode = document.getElementById('transactiondetails')

    const newRow = document.getElementById('transactiontemplate').cloneNode(true)
    newRow.classList.remove('notvisible')
    newRow.querySelector('.detailtime').textContent = this.MakeTimeString(new Date())
    newRow.querySelector('.detailsavepoint').textContent = this.GetSavePointFromXML(theXML)
    newRow.querySelector('.detailxml').appendChild(this.GetXMLBodyFromResponse(theXML))
    newRow.setAttribute('id', 'transactiondetail' + this.TransactionCount)
    existingTableLastNode.prepend(newRow)
    document.getElementById('transactiondetail' + this.TransactionCount).addEventListener('click', theEvent => this.onTransactionRowClick(theEvent))
    this.TransactionCount++
    return true
  }

  onTestActionEnd (theSource, theLastXML) {
    console.log('ready for the next step')
  }

  onTransactionRowClick (theEvent) {
    const currentRow = theEvent.currentTarget
    if (this.CurrentTransactionHighlight !== null) this.CurrentTransactionHighlight.classList.remove('transactionhighlight')
    currentRow.classList.add('transactionhighlight')
    this.CurrentTransactionHighlight = currentRow
    this.UpdateResponseText(currentRow.querySelector('.detailxml').firstChild)
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

  UpdateResponseText (theXML) {
    const responseInput = document.getElementById('xmlInsert')
    const xmlCopy = theXML.cloneNode(true)
    while (responseInput.childNodes.length > 0) {
      responseInput.removeChild(responseInput.lastChild)
    }
    // responseInput.append(xmlCopy)
    const serializer = new XMLSerializer()
    responseInput.append(serializer.serializeToString(xmlCopy))
  }

  MakeTimeString (theTime) {
    var currentSeconds = theTime.getSeconds()
    var currentHours = theTime.getHours()
    var currentMinutes = theTime.getMinutes()
    var timeString = ''
    if (currentHours < 10) currentHours = '0' + currentHours
    if (currentMinutes < 10) currentMinutes = '0' + currentMinutes
    if (currentSeconds < 10) currentSeconds = '0' + currentSeconds
    timeString = currentHours + ':' + currentMinutes + ':' + currentSeconds
    return timeString
  }

  GetSavePointFromXML (theXML) {
    const inputs = theXML.getElementsByTagName('input')
    const inputsCount = inputs.length
    for (var counter = 0; counter < inputsCount; counter++) {
      const currentInput = inputs[counter]
      if (currentInput.getAttribute('name') === 'I.SavePoint') return currentInput.getAttribute('value')
    }
  }

  GetXMLBodyFromResponse (theXML) {
    const root = theXML.documentElement
    const coreContent = root.getElementsByTagName('Page')[0]
    if (coreContent !== undefined) return coreContent
    return null
  }
}
