
$(function(){
  
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
      $('#footer').show()
      $.mobile.fixedToolbars.show(true)
    }
  }

  $("#tab_numbers").tap(handletab('numbers')).tap()
  $("#tab_letters").tap(handletab('letters'))
  $("#tab_colors").tap(handletab('colors'))
})

