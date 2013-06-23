

document.ontouchmove = function(e){ e.preventDefault(); }

$(function(){
  
  var current = 'scroll'
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

  $("#tab_scroll").tap(handletab('scroll')).tap()
  $("#tab_audio").tap(handletab('audio'))
  $("#tab_video").tap(handletab('video'))
  $("#tab_launch").tap(handletab('launch'))
    

  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current,{hscroll:false})      
    }

    content.height( $('body').height() - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})