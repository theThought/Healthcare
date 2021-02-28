var hcNS = {}

hcNS.Core = class {
  constructor () {
    console.log('Healthcare core constructor')

    this.Unicom = new hcNS.Unicom('https://corsstaging.ipsosinteractive.com/mriWeb/mriWeb.dll', 's2021211' ,true)
    this.Dosage = new hcNS.Dosage()
    this.UX = new hcNS.UX()

    this.Unicom.InitialGet('111',this.onInitialGetResponse)
  }

  // constants

  // private variables

  // private functions

  // event handlers
	onInitialGetResponse (theSuccess) {
		if (!theSuccess) return null
		
	}
}
