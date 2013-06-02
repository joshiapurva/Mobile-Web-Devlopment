
var log = function( title,what ) {
  console.log(title+': '+what)
}

function Dialog(title_in) {
  this.title = title_in
}
Dialog.prototype.show = function() {
  log(this.title,'show')
}

var dialog = new Dialog('dialog')
dialog.show()



function UserDialog(title_in) {
  this.title = title_in
}
UserDialog.prototype = new Dialog()

UserDialog.prototype.load = function() {
  log(this.title,'load')
}

var userdialog = new UserDialog('userdialog')
userdialog.show()
userdialog.load()



function LoginDialog(title_in) {
  this.title = title_in
}
LoginDialog.prototype = new UserDialog()

LoginDialog.prototype.validate = function() {
  log(this.title,'validate')
}

var logindialog = new LoginDialog('logindialog')
logindialog.show()
logindialog.load()
logindialog.validate()


