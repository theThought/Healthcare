var hcNS = {}

hcNS.Core = class {
  constructor () {
    console.log('Healthcare core constructor')

    this.Unicom = new hcNS.Unicom()
    this.Dosage = new hcNS.Dosage()
    this.UX = new hcNS.UX()

    this.Unicom.InitialGet()
  }

  // constants

  // private variables

  // private functions

  // event handlers
}
