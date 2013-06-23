
document.ontouchmove = function(e){ e.preventDefault() }

var items = []
var saveon = false
var swipeon = false
var serveroffset = 0

$(document).ready(function(){
  initapp()

  items = loaditemdata()
  for( var i = 0; i < items.length; i++ ) {
    additem(items[i],true)
  }

  $('#add').tap(function(){
    $('#add').hide()
    $('#cancel').show()
    $('#newitem').slideDown()
    saveon = false
    activatesave()
  })

  $('#cancel').tap(function(){
    $('#add').show()
    $('#cancel').hide()
    $('#newitem').slideUp()
    $('div.delete').hide()
    swipeon = false
  })

  $('#text').keyup(function(){
    activatesave()
  })

  $('#save').tap(function(){
    var text = $('#text').val()
    if( 0 == text.length ) {
      return
    }
    $('#text').val('')

    var created = new Date().getTime() + serveroffset
    var updated = created
    var itemdata = {id:makeid(),text:text,done:false,created:created,updated:updated} 

    items.push(itemdata)
    additem(itemdata)
    uploaditem(itemdata,true)    

    $('#newitem').slideUp()
    $('#add').show()
    $('#cancel').hide()
  })

})

function activatesave() {
  var textlen = $('#text').val().length
  if( !saveon && 0 < textlen ) {
    $('#save').css('opacity',1)
    saveon = true
  }
  else if( 0 == textlen ) {
    $('#save').css('opacity',0.3)
    saveon = false
  }
}


function additem(itemdata,nosave) {
  var item = $('#item_tm').clone()
  item.attr({id:itemdata.id})
  item.find('span.text').text(itemdata.text)


  var itemtext = item.find('span.text')
  itemtext.text(itemdata.text).tap(function(){
    var edit = item.find('input.edit')
    itemtext.hide()

    function updatetext() {
      itemdata.text = edit.val()
      itemdata.updated = new Date().getTime() + serveroffset
      itemtext.text(itemdata.text)
      edit.hide()
      itemtext.show()
      saveitemdata(items)
      uploaditem(itemdata)
    }

    edit.val(itemdata.text).show().focus().blur(updatetext).tap(updatetext)
  })


  var delbutton = $('#delete_tm').clone().hide()
  item.append(delbutton)

  delbutton.attr('id','delete_'+itemdata.id).tap(function(){
    for( var i = 0; i < items.length; i++ ) {
      if( itemdata.id == items[i].id ) {
        items.splice(i,1)
      }
    }
    item.remove()
    $('#add').show()
    $('#cancel').hide()
    saveitemdata(items)

    if( navigator.onLine ) {
      sendjson(
        'DELETE','sync/api/app/'+appinfo.id+'/item/'+itemdata.id
      )
    }
    else {
      var deleted = JSON.parse(localStorage.deleted || '[]')      
      itemdata.updated = new Date().getTime() + serveroffset
      deleted.push(itemdata)
      localStorage.deleted = JSON.stringify(deleted)
    }


    return false
  })

  markitem(item,itemdata.done,nosave)
  item.data('itemdata',itemdata)

  item.find('span.check').tap(function(){
    if( !swipeon ) {
      var itemdata = item.data('itemdata')
      itemdata.updated = new Date().getTime() + serveroffset
      itemdata.done = !itemdata.done
      markitem(item,itemdata.done)
      uploaditem(itemdata,false)    
    }
  })

  item.swipe(function(){
    var itemdata = item.data('itemdata')
    if( !swipeon ) {
      markitem(item,itemdata.done = !itemdata.done)

      $('#delete_'+itemdata.id).show()
      $('#add').hide()
      $('#cancel').show()
      swipeon = true
    }
    else {
      $('#add').show()
      $('#cancel').hide()
      $('div.delete').hide()
      swipeon = false
    }
  })

  $('#todolist').append(item).listview('refresh')
}


function markitem( item, done, nosave ) {
  item.find('span.check').html( done ? '&#10003;' : '&nbsp;' )
  item.find('span.text').css({'text-decoration': done ? 'line-through' : 'none' })
  if( !nosave ) {
    saveitemdata(items)
  }
}




function saveitemdata(items) {
  localStorage.items = JSON.stringify(items)
}

function loaditemdata() {
  var items = JSON.parse(localStorage.items || '[]')
  return items
}

window.applicationCache.addEventListener('updateready',function(){
  window.applicationCache.swapCache()
  location.reload()
})



function sendjson(method,urlsuffix,obj,win,fail) {
  $.ajax({
    url:'http://YOUR_SERVER/todo/'+urlsuffix,
    type:method,
    contentType:'application/json',
    dataType:'json',
    data:'GET'==method?null:JSON.stringify(obj),
    success:function(result){
      win && win(result)
    },
    error:function(xhr){
      fail && fail(xhr.status)
    }
  })
}


var appinfo = {}
function initapp() {
  appinfo = JSON.parse(localStorage.appinfo || '{}')
  if( !appinfo.id ) {
    var id = makeid()
    appinfo.id = id
    localStorage.appinfo = JSON.stringify(appinfo)
  }


  function putapp(status){
    if( 404 == status ) {
      sendjson(
        'PUT','sync/api/app/'+appinfo.id,{},
        function(result){
          // app created
        },
        function(status){
          // app not created
        } 
      ) 
    }
  }


  if( navigator.onLine ) {
    var clienttime = new Date().getTime()
    sendjson(
      'GET','sync/api/time/'+clienttime,null,
      function(result){       
        result.clientreturn = new Date().getTime()
        handletime(result)
        sendjson(
          'GET','sync/api/app/'+appinfo.id,null,
          function(result){
            syncitems(result.items)
          },
          putapp
        )
      }
    )
  }
}


function makeid() {
  return uuid()
}

function handletime(timesync) {
  serveroffset = 
    Math.floor(
      0.5 *
        ( ( timesync.arrivaltime - timesync.clienttime ) +
          ( timesync.sendtime    - timesync.clientreturn ) ) )
}


function uploaditem(itemdata,isnew) {
  if( navigator.onLine ) {
    sendjson(
      isnew?'PUT':'POST','sync/api/app/'+appinfo.id+'/item/'+itemdata.id,itemdata
    )
  }
  else {
    var uploads = JSON.parse(localStorage.uploads || '[]')      
    uploads.push(itemdata)
    localStorage.uploads = JSON.stringify(uploads)
  }
}


function syncitems(serveritems) {
  if( !navigator.onLine ) {
    return
  }

  var localitems = items
  var localmap = {}
  localitems.forEach(function(item){
    localmap[item.id] = item
  })

  var servermap = {}
  serveritems.forEach(function(item){
    servermap[item.id] = item
  })


  var deleted = JSON.parse(localStorage.deleted || '[]')      
  deleted.forEach(function(delitem){
    if( servermap[delitem.id] ) {
      if( delitem.updated < servermap[delitem.id].updated ) {     
        additem( servermap[delitem.id] )
      }
      else {
        sendjson(
          'DELETE','sync/api/app/'+appinfo.id+'/item/'+delitem.id
        )
      }
    }
  })
  localStorage.deleted = '[]'


  serveritems.forEach(function(serveritem){
    var localitem = localmap[serveritem.id]
    if( localitem ) {
      if( localitem.updated < serveritem.updated ) {

        localmap[serveritem.id].created = serveritem.created
        localmap[serveritem.id].updated = serveritem.updated
        localmap[serveritem.id].done = serveritem.done
        localmap[serveritem.id].text = serveritem.text

        var itemelem = $('#'+serveritem.id)
        itemelem.find('span.text').text(serveritem.text)
        markitem(itemelem,serveritem.done)
      }
    }
    else {
      items.push(serveritem)
      additem(serveritem)
    }
  })


  var uploads = JSON.parse(localStorage.uploads || '[]')      
  var newitems = []
  var existingitems = []

  uploads.forEach(function(upload){
    if( servermap[upload.id] ) {
      if( servermap[upload.id].updated < upload.updated ) {
        existingitems.push(upload)
      }
    }
    else {
      newitems.push(upload)
    }
  }) 

  newitems.forEach(function(item){
    sendjson(
      'PUT','sync/api/app/'+appinfo.id+'/item/'+item.id,upload
    )
  })

  existingitems.forEach(function(item){
    sendjson(
      'POST','sync/api/app/'+appinfo.id+'/item/'+upload.id,upload
    )
  })

  localStorage.uploads = '[]'

  localitems.forEach(function(localitem){
    if( !servermap[localitem.id] && 
        !newitems[localitem.id] && 
        !existingitems[localitem.id] 
      ) {
      $('#'+localitem.id).remove()
      for( var i = 0; i < items.length; i++ ) {
        if( localitem.id == items[i].id ) {
          items.splice(i,1)
        }
      }
    }
  })
  saveitemdata(items)
}