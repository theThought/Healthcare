/* global hcNS */

hcNS.UX = class {
  constructor (theParent) {
    this.Parent = theParent
    this.TransactionCount = 0
    this.CurrentTransactionHighlight = null
    console.log('UX Constructor')
    this.SetupEventHandlers()
//    this.Parent.UX.InitialiseDosageProducts()
  }

  // constants

  // private variables

  // private functions
  SetupEventHandlers () {
    var currentTag = document.getElementById('TestAction')
    currentTag.addEventListener('click', () => this.onTestActionClick())

    currentTag = document.getElementById('NewDosageButton')
    currentTag.addEventListener('click', () => this.onDosageModalOpen())

    currentTag = document.getElementById('dosagemodalcancel')
    currentTag.addEventListener('click', () => this.onDosageModalCancel())

    currentTag = document.getElementById('dosagemodalok')
    currentTag.addEventListener('click', () => this.onDosageModalOk())

    currentTag = document.getElementById('DosageProducts')
    currentTag.addEventListener('change', (event) => this.onDosageProductChange(event))

    currentTag = document.getElementById('DosageUnits')
    currentTag.addEventListener('change', (event) => this.onDosageUnitChange(event))

    currentTag = document.getElementById('DosageRoutes')
    currentTag.addEventListener('change', (event) => this.onDosageRouteChange(event))

    currentTag = document.getElementById('DosageValue')
    currentTag.addEventListener('change', (event) => this.onDosageValueChange(event))
    currentTag.addEventListener('keypress', (event) => this.onDosageValueChange(event))

    document.addEventListener('DosageEntryValidation', (event) => this.onDosageValidation(event))
  }
  // event handlers

  onDosageValidation (theEvent) {
    console.log(theEvent)
    const currentOkButton = document.getElementById('dosagemodalok')
    currentOkButton.disabled = (!theEvent.detail.validentry)
  }

  onDosageModalOpen (theEvent) {
    this.InitialiseDosageProducts()
    document.location = '#DosageModal'
  }

  onDosageModalOk (theEvent) {
    document.location = '#existingrecords'
  }

  onDosageModalCancel (theEvent) {
    document.location = '#existingrecords'
  }

  onDosageProductChange (theEvent) {
    const currentProductValue = theEvent.target.value
    this.Parent.Dosage.SetProduct(currentProductValue)
    const productRules = this.Parent.Dosage.FindProductRules()
    this.InitialiseDosageUnits(productRules)
  }

  onDosageUnitChange (theEvent) {
    const currentUnitValue = theEvent.target.value
    this.Parent.Dosage.SetUnit(currentUnitValue)
    const unitRules = this.Parent.Dosage.FindUnitRules()
    this.InitialiseDosageRoutes(unitRules)
  }

  onDosageRouteChange (theEvent) {
    const currentRouteValue = theEvent.target.value
    this.Parent.Dosage.SetRoute(currentRouteValue)
    const routeRules = this.Parent.Dosage.FindRouteRules()
    this.InitialiseDosageValues(routeRules)
  }

  onDosageValueChange (theEvent) {
    const currentRouteValue = theEvent.target.value
    this.Parent.Dosage.SetValue(currentRouteValue)
  }

  onTestActionClick (theEvent) {
    var instructions = { type: null, name: null, parameters: null, response: null, source: null, after: null }
    var currentTag = document.getElementById('actiontype')
    instructions.type = currentTag.value

    currentTag = document.getElementById('actionname')
    if (currentTag.value !== '') instructions.name = currentTag.value
    else instructions.name = 'Idle'

    currentTag = document.getElementById('actionask')
    instructions.parameters = (currentTag.value === 'ask')

    currentTag = document.getElementById('actionresponse')
    instructions.response = currentTag.value

    this.Parent.SubmitResponse(instructions)
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

  InitialiseDosageProducts () {
    const validationRules = this.Parent.Dosage.ValidationRules
    const productList = validationRules.products
    const howManyProducts = productList.length
    const selectProducts = document.getElementById('DosageProducts')

    this.RemoveAllSelects(selectProducts)

    const newSelect = document.createElement('option')
    newSelect.setAttribute('value', 'noselection')
    newSelect.textContent = 'Select a Product'
    selectProducts.appendChild(newSelect)

    for (var counter = 0; counter < howManyProducts; counter++) {
      const currentProduct = productList[counter]
      const newSelect = document.createElement('option')
      newSelect.setAttribute('value', currentProduct.quantumid)
      newSelect.textContent = currentProduct.name
      selectProducts.appendChild(newSelect)
    }
  }

  InitialiseDosageUnits (theProductRules) {
    const unitList = theProductRules.doseunits
    const howManyUnits = unitList.length
    const selectUnits = document.getElementById('DosageUnits')

    this.RemoveAllSelects(selectUnits)

    const newSelect = document.createElement('option')
    newSelect.setAttribute('value', 'noselection')
    newSelect.textContent = 'Select a Unit'
    selectUnits.appendChild(newSelect)

    for (var counter = 0; counter < howManyUnits; counter++) {
      const currentUnit = unitList[counter]
      const newSelect = document.createElement('option')
      newSelect.setAttribute('value', currentUnit.unit)
      newSelect.textContent = currentUnit.unit
      selectUnits.appendChild(newSelect)
    }
  }

  InitialiseDosageRoutes (theUnitRules) {
    const routeList = theUnitRules.routes
    const howManyRoutes = routeList.length
    const selectRoutes = document.getElementById('DosageRoutes')

    this.RemoveAllSelects(selectRoutes)

    const newSelect = document.createElement('option')
    newSelect.setAttribute('value', 'noselection')
    newSelect.textContent = 'Select a Route'
    selectRoutes.appendChild(newSelect)

    for (var counter = 0; counter < howManyRoutes; counter++) {
      const currentUnit = routeList[counter]
      const newSelect = document.createElement('option')
      newSelect.setAttribute('value', currentUnit.id)
      newSelect.textContent = currentUnit.id
      selectRoutes.appendChild(newSelect)
    }
  }

  InitialiseDosageValues (theRouteRules) {
    const doseNumbers = theRouteRules.dosenumbers
    const howManyValues = doseNumbers.values.length
    const inputValues = document.getElementById('DosageValue')
    const dataListValues = document.getElementById('DosageValueList')

    if (howManyValues > 0) {
      this.RemoveAllDataLists(dataListValues)
      inputValues.setAttribute('placeholder', 'Select a dose')

      for (var counter = 0; counter < howManyValues; counter++) {
        const currentValue = doseNumbers.values[counter]
        const newOption = document.createElement('option')
        newOption.setAttribute('value', currentValue)
        dataListValues.appendChild(newOption)
      }
      inputValues.setAttribute('list', 'DosageValueList')
      inputValues.removeAttribute('min')
      inputValues.removeAttribute('max')
      inputValues.removeAttribute('type')
      inputValues.value = null
    } else {
      inputValues.setAttribute('placeholder', 'enter a dose between' + doseNumbers.range.min + ' and ' + doseNumbers.range.max)
      inputValues.removeAttribute('list')
      inputValues.setAttribute('min', doseNumbers.range.min)
      inputValues.setAttribute('max', doseNumbers.range.max)
      inputValues.setAttribute('type', 'number')
      inputValues.value = null
    }
  }

  RemoveAllSelects (theControl) {
    while (theControl.options.length > 0) {
      theControl.remove(theControl.options.length - 1)
    }
  }

  RemoveAllDataLists (theControl) {
    while (theControl.options.length > 0) {
      theControl.remove(theControl.options.length - 1)
    }
  }
}
