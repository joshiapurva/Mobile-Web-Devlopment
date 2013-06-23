

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
    

  var counter = 0
  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {

      var config = { hscroll:false }
      if( 'scroll' == current ) {
	      config.pullToRefresh='down'
	      config.onPullDown = function () {
          counter++
          var ul = $('#content_'+current+' ul')
          ul.prepend('<li class="ui-li ui-li-static ui-body-c">'+counter+'</li>')
          setTimeout(function(){
            scrollers[current].refresh()
            scrollers[current].scrollTo(0,0,50,false)
          },50)
        }
      } 
      scrollers[current] = new iScroll("content_"+current,config)     
    }

    content.height( $('body').height() - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})