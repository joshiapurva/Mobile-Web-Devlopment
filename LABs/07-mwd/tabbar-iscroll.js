

document.ontouchmove = function(e){ e.preventDefault(); }

$(function(){
  
  var current = 'numbers'
  var scrollers = {}

  var header  = $("#header")
  var footer  = $("#footer")

  header.css({zIndex:1000})
  footer.css({zIndex:1000})


  function handletab(tabname) {
    return function(){
      $("#content_"+current).hide()
      current = tabname
      $("#content_"+tabname).show()
      refresh()
    }
  }

  $("#tab_numbers").tap(handletab('numbers')).tap()
  $("#tab_letters").tap(handletab('letters'))
  $("#tab_colors").tap(handletab('colors'))
    

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