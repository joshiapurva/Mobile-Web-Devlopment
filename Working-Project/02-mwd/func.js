
var log = function( title,what ) {
  console.log(title+': '+what)
}


function Dialog(title_in) {
  var self = {}

  var title = title_in

  self.show = function() {
    log(title,'show')
  }

  self.title = function() {
    return title
  }

  return self
}

var dialog = Dialog('dialog')
dialog.show()



function UserDialog(title_in) {
  var self = Dialog(title_in)

  self.load = function() {
    log(self.title(),'load')
  }

  return self
}

var userdialog = UserDialog('userdialog')
userdialog.show()
userdialog.load()



function LoginDialog(title_in) {
  var self = UserDialog(title_in)

  self.validate = function() {
    log(self.title(),'validate')
  }

  return self
}


var logindialog = LoginDialog('logindialog')
logindialog.show()
logindialog.load()
logindialog.validate()
