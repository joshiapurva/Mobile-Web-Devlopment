
document.addEventListener("deviceready", ondeviceready)

function ondeviceready(){
  document.ontouchmove = function(e){ e.preventDefault(); }

  var msg = $('#msg')

  $('#nav_alert').tap(function(){
    navigator.notification.alert(
      'Alerting...', 
      function(){
        msg.text('alert')
      }, 
      'My Alert', 
      'DONE')
  })

  var colors = ['Red','Green','Blue','Dismiss']
  $('#nav_confirm').tap(function(){
    navigator.notification.confirm(
      'Pick a Color', 
      function(index){
        msg.text(colors[index-1])
      }, 
      'Colors', 
      colors.join(','))
  })

  $('#nav_beep').tap(function(){
    msg.text('beep')
    navigator.notification.beep(1);
  })

  $('#nav_vibrate').tap(function(){
    msg.text('vibrate')
    navigator.notification.vibrate(1000);
  })
}

