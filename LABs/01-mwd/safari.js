
var contentElement


function changeColor() {
  var color = localStorage.contentColor || '#ccf'
  contentElement.style.backgroundColor = color
}


window.onload = function() {
  console.log('starting...')

  contentElement = document.getElementById("content")
  contentElement.innerText = 'Goodbye!'
}

