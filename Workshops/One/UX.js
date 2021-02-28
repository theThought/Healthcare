/* global hcNS */

hcNS.UX = class {
  constructor () {
    console.log('UX Constructor')
  }

  // constants

  // private variables

  // private functions

  // event handlers
}

var myApp
document.addEventListener('DOMContentLoaded', GetStarted)

function GetStarted (theEvent) {
  myApp = new hcNS.Core()
}
