

document.ontouchmove = function(e){ e.preventDefault(); }

$(function(){
  
  var current = ''
  var order   = -1
  var scrollers = {}

  var header  = $("#header")
  var footer  = $("#footer")

  header.css({zIndex:1000})
  footer.css({zIndex:1000})


  function handletab(tabname,taborder) {
    return function(){
      if( current != tabname ) {
        $("#content_"+current).hide()
        $("#content_"+tabname).show().addClass(order<taborder?'leftin':'rightin')

        current = tabname
        order = taborder
        refresh()
      }
    }
  }

  $("#tab_numbers").tap(handletab('numbers',0)).tap()
  $("#tab_letters").tap(handletab('letters',1))
  $("#tab_colors").tap(handletab('colors',2))
    

  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current)      
    }

    content.height( window.innerHeight - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})
