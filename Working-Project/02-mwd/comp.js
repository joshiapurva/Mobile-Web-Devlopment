
// run npm install underscore
var _ = require('underscore')

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




var userdialog = _.extend(
  dialog,
  {
    title:'userdialog',
    load: function() {
      log(this.title,'load')
    }
  }
)

userdialog.show()
userdialog.load()



var logindialog = _.extend(
  userdialog,
  {
    title:'logindialog',
    validate: function() {
      log(this.title,'validate')
    }
  }
)


logindialog.show()
logindialog.load()
logindialog.validate()



console.log( dialog === userdialog )
console.log( userdialog === logindialog )
console.log( logindialog === dialog )