

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
    

  var audio = null

  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current,{hscroll:false})      
    }

    if( 'audio' == current ) {
      if( !audio ) {
        $("#jquery_jplayer_1").jPlayer({
          ready: function () {
            $(this).jPlayer("setMedia", {
              mp3: "audio.mp3",
            });
          },
          swfPath:'',
          supplied: "mp3"
        });
        audio = true;
      }
      
      $('#audio').css({top:header.height()})
    }
    else {
      $('#audio').css({top:9999})
    }

    content.height( $('body').height() - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})