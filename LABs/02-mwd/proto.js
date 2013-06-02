
var log = function( title,what ) {
  console.log(title+': '+what)
}


var dialog = Object.create({
  show: function() {
    log(this.title,'show')
  }
})
dialog.title = 'dialog'

dialog.show()



var userdialog = Object.create(dialog)
userdialog.title = 'userdialog'
userdialog.load = function() {
  log(this.title,'load')
}

userdialog.show()
userdialog.load()



var logindialog = Object.create(userdialog)
logindialog.title = 'logindialog'
logindialog.validate = function() {
  log(this.title,'validate')
}

logindialog.show()
logindialog.load()
logindialog.validate()
