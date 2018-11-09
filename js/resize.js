
function resizeImg($tar)
{
    var src = $tar.attr('src');
    var $newEl = $('<div>');
    var $img = $('<img>');
    var $black = $('<div>');
    
    $img.attr('src', src);
    $img.css({position:'absolute', left:'50%', top:'50%'});
    $black.css({background:'rgba(0,0,0,0.3)', position:'absolute', left:0, top:0, width:'100%', height:'100%'});
    $newEl.css({position:'fixed', left:0, top:0, width:'100%', height:'100%', opacity:0});
    
    $newEl.append($black);
    $newEl.append($img);
    
    $img.on('load', function(){
        var w = $img.width();
        var h = $img.height();
        $img.css({marginLeft:-w/2, marginTop:-h/2});
    });
    
    $(document.body).append($newEl);
    $newEl.animate({opacity:1}, 300);
    $newEl.on('click', function(){
        $newEl.remove();
    });
}
