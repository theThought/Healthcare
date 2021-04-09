/* global hcNS */

hcNS.Dosage = class {
  constructor (theParent) {
    this.ValidationRules = null
    this.CurrentEntry = { product: null, unit: null, route: null, value: null, valid: false }
    this.Parent = theParent
    this.Entries = []

    console.log('Dosage Constructor')
    this.LoadValidationRules()

    this.CurrentEntryValidate()
  }
  // constants

  // private variables

  // private functions

  // event handlers
  onJSONResponse (theResponse) {
    switch (theResponse.status) {
      case 200:
        return theResponse.json()
      default:
        console.log('there was a response errror when requesting xml')
        return null
    }
  }

  onValidJSON (theJSON) {
    if (theJSON !== null) this.ValidationRules = theJSON
  }

  onRequestError (theError) {
    console.log('something went horribly wrong with requesting xml')
    console.log(theError)
  }

  // methods:
  SetProduct (theProduct) {
    this.CurrentEntry.product = theProduct
    this.CurrentEntry.unit = null
    this.CurrentEntry.route = null
    this.CurrentEntry.value = null

    this.CurrentEntryValidate()
  }

  GetProduct () {
    return this.CurrentEntry.product
  }

  SetUnit (theUnit) {
    this.CurrentEntry.unit = theUnit
    this.CurrentEntry.route = null
    this.CurrentEntry.value = null

    this.CurrentEntryValidate()
  }

  GetUnit () {
    return this.CurrentEntry.unit
  }

  SetRoute (theRoute) {
    this.CurrentEntry.route = theRoute
    this.CurrentEntry.value = null

    this.CurrentEntryValidate()
  }

  GetRoute () {
    return this.CurrentEntry.route
  }

  SetValue (theValue) {
    this.CurrentEntry.value = theValue
    this.CurrentEntryValidate()
  }

  GetValue () {
    return this.CurrentEntry.value
  }

  LoadValidationRules () {
    fetch ('ValidationRules.json', {
      method: 'GET'
    })
      .then(response => this.onJSONResponse(response))
      .then(jsonValidation => this.onValidJSON(jsonValidation))
      .catch(error => this.onRequestError(error))
  }

  FindProductRules () {
    const productList = this.ValidationRules.products
    const howManyProducts = productList.length
    for (var counter = 0; counter < howManyProducts; counter++) {
      const currentProduct = productList[counter]
      if (currentProduct.quantumid === this.CurrentEntry.product) {
        return currentProduct
      }
    }
    return null
  }

  FindUnitRules () {
    const unitList = this.FindProductRules().doseunits
    const howManyUnits = unitList.length
    for (var counter = 0; counter < howManyUnits; counter++) {
      const currentUnit = unitList[counter]
      if (currentUnit.unit === this.CurrentEntry.unit) {
        return currentUnit
      }
    }
    return null
  }

  FindRouteRules () {
    const routeList = this.FindUnitRules().routes
    const howManyRoutes = routeList.length
    for (var counter = 0; counter < howManyRoutes; counter++) {
      const currentRoute = routeList[counter]
      if (currentRoute.id === this.CurrentEntry.route) {
        return currentRoute
      }
    }
    return null
  }

  CurrentEntryValidate () {
    // if (this.CurrentEntry.product !== null && this.CurrentEntry.unit !== null && this.CurrentEntry.route !== null && this.CurrentEntry.value !==null) this.CurrentEntry.valid = true
    // else this.CurrentEntry.value = false

    this.CurrentEntry.valid = (this.CurrentEntry.product !== null && this.CurrentEntry.unit !== null && this.CurrentEntry.route !== null && this.CurrentEntry.value !== null)

    const newEvent = new Event('DosageEntryValidation')
    newEvent.detail = { validentry: this.CurrentEntry.valid }
    document.dispatchEvent(newEvent)
  }
}
