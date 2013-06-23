
$(function(){
  
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
    }
  }

  $("#tab_scroll").tap(handletab('scroll')).tap()
  $("#tab_audio").tap(handletab('audio'))
  $("#tab_video").tap(handletab('video'))
  $("#tab_launch").tap(handletab('launch'))
})

