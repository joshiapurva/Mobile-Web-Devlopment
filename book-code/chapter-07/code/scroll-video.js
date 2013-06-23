

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
  var video = null

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

    if( 'video' == current ) {
      if( !video ) {
        $("#jquery_jplayer_2").jPlayer({
          ready: function () {
            $(this).jPlayer("setMedia", {
              m4v: "Big_Buck_Bunny_Trailer_480x270_h264aac.m4v",
              poster: "Big_Buck_Bunny_Trailer_480x270.png"
            });
          },
          swfPath: "",
          supplied: "m4v",
          cssSelectorAncestor: '#jp_interface_2'
        });
        video = true;
      }

      $('#video').css({top:header.height()})
    }
    else {
      $('#video').css({top:9999})
    }




    content.height( $('body').height() - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})