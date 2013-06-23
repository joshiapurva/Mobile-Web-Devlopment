
document.addEventListener("deviceready", ondeviceready)

var server = 'YOUR_IP_ADDRESS:3009'
var app = null


function ondeviceready(){
  app = new App()
}


function App() {
  var imagedata = null
  var con = $('#con_lifestream')

  var post_pic = $('#post_pic')
  var post_msg = $('#post_msg')

  var btn_upload = $('#btn_upload')


  $('#nav_lifestream').tap(function(){
    showcon('lifestream')
  })

  $('#nav_post').tap(function(){
    showcon('post')
  })

  $('#btn_takepic').tap(picTake)
  $('#btn_upload').tap(picUpload)


  function picTake(){
    navigator.camera.getPicture(
      function(base64) {
        imagedata = base64
        post_pic.attr({src:"data:image/jpeg;base64,"+imagedata})
      }, 
      function(){
        post_msg.text('Could not take picture')
      },
      { quality: 50 }
    ) 
  }

  function picUpload(){
    if( imagedata ) {
      post_msg.text('Uploading...')
    
      $.ajax({
        url:'http://'+server+'/lifestream/api/upload', 
        type:'POST',
        contentType:'application/octet-stream',
        data:imagedata, 
        success:function(){
          post_msg.text('Picture uploaded.')
        },
        error:function(err){
          console.log(err)
          post_msg.text('Could not upload picture')
        },
      })
    }
    else {
      post_msg.text('Take a picture first')
    }
  }

  function showcon(name) {
    if( con ) {
      con.hide()
    }
    con = $('#con_'+name)
    con.show()
  }
}


