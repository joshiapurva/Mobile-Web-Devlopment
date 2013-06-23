

document.addEventListener("deviceready", ondeviceready)

var server = 'YOUR_IP_ADDRESS:3009'
var s3prefix = 'https://s3.amazonaws.com/YOUR_S3_BUCKET/'
var app = null


function ondeviceready(){
  app = new App()
}


function App() {
  var imagedata = null

  var con = $('#con_lifestream')

  var lifestream_images = $('#lifestream_images')

  var post_pic = $('#post_pic')
  var post_msg = $('#post_msg')

  var btn_upload = $('#btn_upload')


  $('#nav_lifestream').tap(function(){
    showcon('lifestream')
    showimages()
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
    
      var padI = imagedata.length-1
      while( '=' == imagedata[padI] ) {
        padI--
      }
      var padding = imagedata.length - padI - 1


      $.ajax({
        url:'http://'+server+'/lifestream/api/upload', 
        type:'POST',
        contentType:'application/octet-stream',
        data:imagedata, 
        headers:{'X-LifeStream-Padding':''+padding},
        dataType:'json',
        success:function(data){
          post_msg.text('Picture uploaded.')
          
          appendimage(data.picid)
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

  function appendimage(picid) {
    var images = loadimages()
    images.unshift({picid:picid})
    localStorage.images = JSON.stringify(images)
  }
  
  function loadimages() {
    return JSON.parse(localStorage.images || '[]')
  }

  function showimages() {
    lifestream_images.empty();
    var images = loadimages()
    console.log(images)
    for( var i = 0; i < images.length; i++ ) {
      var li = $('<li>')
      var img = $('<img>').attr({src:s3prefix+images[i].picid+'.jpg'})
      li.append(img)
      lifestream_images.append(li)
    }
  }

  showimages()
}


