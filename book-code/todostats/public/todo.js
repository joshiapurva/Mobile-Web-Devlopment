
document.ontouchmove = function(e){ e.preventDefault(); }

var items = [];
var saveon = false;
var swipeon = false;

$(document).ready(function(){
  initapp();

  items = loaditemdata();
  for( var i = 0; i < items.length; i++ ) {
    additem(items[i],true);
  }


  $('#add').tap(function(){
    $('#add').hide();
    $('#cancel').show();
    $('#newitem').slideDown();
    saveon = false;
    activatesave();
  });

  $('#cancel').tap(function(){
    $('#add').show();
    $('#cancel').hide();
    $('#newitem').slideUp();
    $('div.delete').hide();
    swipeon = false;
  });

  $('#text').keyup(function(){
    activatesave();
  });

  $('#save').tap(function(){
    var text = $('#text').val();
    if( 0 == text.length ) {
      return;
    }
    $('#text').val('');

    var id = new Date().getTime();
    var itemdata = {id:id,text:text,done:false}; 
    items.push(itemdata);
    additem(itemdata);

    $('#newitem').slideUp();
    $('#add').show();
    $('#cancel').hide();

    // NOTE: BUG FIX: delete as unneeded - additem does the save
    //saveitemdata(items);
  });

});

function activatesave() {
  var textlen = $('#text').val().length;
  if( !saveon && 0 < textlen ) {
    $('#save').css('opacity',1);
    saveon = true;
  }
  else if( 0 == textlen ) {
    $('#save').css('opacity',0.3);
    saveon = false;
  }
}


function additem(itemdata,nosave) {
  var item = $('#item_tm').clone();
  item.attr({id:itemdata.id});
  item.find('span.text').text(itemdata.text);

  var delbutton = $('#delete_tm').clone().hide();
  item.append(delbutton);

  delbutton.attr('id','delete_'+itemdata.id).tap(function(){
    for( var i = 0; i < items.length; i++ ) {
      // BUG FIX should be == was =
      if( itemdata.id == items[i].id ) {
        items.splice(i,1);
      }
    }
    item.remove();
    $('#add').show();
    $('#cancel').hide();
    saveitemdata(items);
    return false;
  });

  markitem(item,itemdata.done,nosave);
  item.data('itemdata',itemdata);

  item.tap(function(){
    if( !swipeon ) {
      var itemdata = item.data('itemdata');
      markitem(item,itemdata.done = !itemdata.done);
    }
  });

  item.swipe(function(){
    var itemdata = item.data('itemdata');
    if( !swipeon ) {
      markitem(item,itemdata.done = !itemdata.done);

      $('#delete_'+itemdata.id).show();
      $('#add').hide();
      $('#cancel').show();
      swipeon = true;
    }
    else {
      $('#add').show();
      $('#cancel').hide();
      $('div.delete').hide();
      swipeon = false;
    }
  });

  $('#todolist').append(item).listview('refresh');
}

function markitem( item, done, nosave ) {
  item.find('span.check').html( done ? '&#10003;' : '&nbsp;' );
  item.find('span.text').css({'text-decoration': done ? 'line-through' : 'none' });
  if( !nosave ) {
    saveitemdata(items);
  }
}


// NEW BELOW
// also initapp call above

function saveitemdata(items) {
  localStorage.items = JSON.stringify(items);
  sendstats(items);
}

function loaditemdata() {
  var items = JSON.parse(localStorage.items || '[]');
  sendstats(items);
  return items;
}

window.applicationCache.addEventListener('updateready',function(){
  window.applicationCache.swapCache();
  location.reload();
});


function sendjson(urlsuffix,obj,win,fail) {
  $.ajax({
    url:'http://localhost/todo/'+urlsuffix,
    type:'POST',
    contentType:'applicationtext/json',
    dataType:'json',
    data:JSON.stringify(obj),
    success:function(result){
      win && win(result);
    },
    failure:function(){
      fail && fail();
    }
  });
}


var appinfo = {};
function initapp() {
  appinfo = JSON.parse(localStorage.appinfo || '{}');
  if( !appinfo.id ) {
    var id = ''+Math.floor(Math.abs(1000000000 * Math.random()));
    sendjson('stats/init',{id:id},function(){
      appinfo.id = id;
      localStorage.appinfo = JSON.stringify(appinfo);
    })
  }
}


function sendstats(items) {
  if( navigator.onLine ) {
    var total = 0;
    var done  = 0;
    items.forEach(function(item){
      total++;
      done += item.done?1:0;
    })
    var time = new Date().getTime();
    var send = {time:time,total:total,done:done};
    sendjson('stats/collect/'+appinfo.id,send);
  }
}