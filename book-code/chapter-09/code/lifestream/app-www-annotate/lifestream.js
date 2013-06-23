
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

  var work_pic = $('#work_pic')
  var work_sheet = $('#work_sheet');


  $('#nav_lifestream').tap(function(){
    showcon('lifestream')
  })

  $('#nav_post').tap(function(){
    showcon('post')
  })

  $('#btn_takepic').tap(picTake)
  $('#btn_upload').tap(picUpload)


  function annotate() {
    function inserttext(heading) {
      var direction = ''
      if( null != heading ) {
        heading = Math.floor((heading+22.5)/45) % 8;
        var directions = [
          'North','North East',
          'East','South East',
          'South','South West',
          'West','North West'
        ];
        direction = directions[heading];
      }

      var width = work_pic.width();
      var height = work_pic.height();

      work_sheet[0].width  = width;
      work_sheet[0].height = height;

      var context = work_sheet[0].getContext('2d');
      context.drawImage(work_pic[0],0,0,width,height);
    
      context.font = "bold 48px sans-serif";
      context.fillStyle = "rgb(255,0,0)";
      context.fillText(''+new Date().toISOString(), 10, height-200);

      if( direction ) {
        context.fillText('Facing: '+direction, 10, height-100);
      }

      var imagesrc = work_sheet[0].toDataURL('image/jpeg');
      post_pic.attr({src:imagesrc});
      imagedata = imagesrc.substring("data:image/jpeg;base64,".length);
    }
    
    navigator.compass.getCurrentHeading(
      function(heading){
        inserttext(heading);
      },
      function(){
        inserttext(null);
      },
      {}
    );
  }


  function picTake(){
    navigator.camera.getPicture(
      function(base64) {
        imagedata = base64
        post_pic.attr({src:"data:image/jpeg;base64,"+imagedata})

        work_pic.attr({src:"data:image/jpeg;base64,"+imagedata})
        annotate()

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
        headers:{'X-Lifestream-Padding':''+padding},
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


