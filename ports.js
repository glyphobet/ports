function d2xy(size, d, debug) {
  var x, y, r, sidelen, min, max;
  for (r = 1; r <= size / 2; r += 1) {
    max = Math.pow(r * 2, 2);
    if (d < max) {
      min = Math.pow((r - 1) * 2, 2);
      sidelen = 2 * r -1;
      if (d < min + sidelen * 1) {
        if (debug) console.log(d+' is in section 1 of ring '+r+' with side length '+sidelen);
        y = r;
        x = -(r - 1) + d - min;
        y -= 1;
      } else if (d < min + sidelen * 2) {
        if (debug) console.log(d+' is in section 2 of ring '+r+' with side length '+sidelen);
        y = (r - 1) - (d - min - sidelen * 1);
        x = r;
        y -= 1;
        x -= 1;
      } else if (d < min + sidelen * 3) {
        if (debug) console.log(d+' is in section 3 of ring '+r+' with side length '+sidelen);
        y = -(r);
        x = (r - 1) - (d - min - sidelen * 2);
        x -= 1;
      } else if (d < min + sidelen * 4) {
        if (debug) console.log(d+' is in section 4 of ring '+r+' with side length '+sidelen);
        y = -(r - 1) + (d - min - sidelen * 3);
        x = -(r);
      }
      if (debug) console.log(x, y);
      return {x: x + size / 2, y: y + size / 2};
    }
  }
}

function xy2d(size, x, y, debug) {
  var d, r, min, max, sidelen;
  ox = x = x - size/2;
  oy = y = y - size/2;

  if (oy >= Math.abs(ox)) {
    y += 1;
  } else if (ox >= Math.abs(oy+1)) {
    x += 1;
    y += 1;
  } else if (-oy >= Math.abs(ox)) {
    x += 1;
  }

  var xabs = Math.abs(x), yabs = Math.abs(y);

  for (r = 1; r <= size / 2; r += 1) {
    if (Math.max(xabs, yabs) <= r) {
      min = Math.pow((r - 1) * 2, 2);
      max = Math.pow(r * 2, 2);
      sidelen = 2 * r -1;
      d = min;
      if (y > 0 && yabs > xabs) {
        d += r - 1 + x;
        if (debug) console.log('('+x+','+y+') is in section 1 of ring '+r);
      } else if (x > 0 && xabs > yabs) {
        d += sidelen * 1;
        d += r - 1 - y;
        if (debug) console.log('('+x+','+y+') is in section 2 of ring '+r);
      } else if (y < 0 && yabs > xabs) {
        d += sidelen * 2;
        d += r - 1 - x;
        if (debug) console.log('('+x+','+y+') is in section 3 of ring '+r);
      } else if (x < 0 && xabs > yabs) {
        d += sidelen * 3;
        d += r - 1 + y;
        if (debug) console.log('('+x+','+y+') is in section 4 of ring '+r);
      } else {
        d = undefined;
      }
      return d;
    }
  }
}

var size = 256;
var max = Math.pow(size, 2);
var scale = 4;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function show_caption(mousePos) {
  var caption = document.getElementsByTagName('figcaption')[0];
  var d = xy2d(size, Math.round(mousePos.x/scale-0.5), Math.round(mousePos.y/scale-0.5));

  if (mousePos.x/scale > size/2) {
    caption.style.left = 'initial';
    caption.style.right = (size*scale - mousePos.x + scale*2 - 80) + 'px';
  } else {
    caption.style.left = mousePos.x + scale*2 + 'px';
    caption.style.right = 'initial';
  }
  if (mousePos.y/scale > size/2) {
    caption.style.top = 'initial';
    caption.style.bottom = (size*scale - mousePos.y + scale*2) + 'px';
  } else {
    caption.style.top = mousePos.y + scale*2 + 'px';
    caption.style.bottom = 'initial';
  }

  caption.innerHTML = '';
  caption.appendChild(document.createElement('h1')).appendChild(document.createTextNode('Port\u00A0' + d));
  if (ports[d]) {
    var plist = ports[d];
    var ul = caption.appendChild(document.createElement('ul'));
    for (var p=0; p<plist.length; p++) {
      var li = ul.appendChild(document.createElement('li'));
      if (plist[p].tcp && plist[p].udp) {
        var t = li.appendChild(document.createElement('span'))
        t.setAttribute('class', 'tag udptcp ' + (plist[p].official ? 'official' : 'unofficial'))
        t.appendChild(document.createTextNode('tcp/udp'));
      } else if (plist[p].tcp) {
        var t = li.appendChild(document.createElement('span'))
        t.setAttribute('class', 'tag tcp ' + (plist[p].official ? 'official' : 'unofficial'))
        t.appendChild(document.createTextNode('tcp'));
      } else if (plist[p].udp) {
        var u = li.appendChild(document.createElement('span'))
        u.setAttribute('class', 'tag udp ' + (plist[p].official ? 'official' : 'unofficial'))
        u.appendChild(document.createTextNode('udp'));
      }
      li.appendChild(document.createTextNode(plist[p].label));
    }
  } else {
    var p = caption.appendChild(document.createElement('p'));
    p.appendChild(document.createTextNode('Unassigned.'));
  }
}

function draw() {
  var canvas = document.getElementsByTagName('canvas')[0];
  canvas.addEventListener('mousemove', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    show_caption(mousePos);
  }, false);

  document.getElementsByTagName('body')[0].style.width = (size * scale) + 'px';
  canvas.width = size * scale;
  canvas.height = size * scale;
  var context = canvas.getContext('2d');
  var xy;
  for (var d=0; d<max; d+=1) {
    xy = d2xy(size, d);

    // background
    if (d < 1024) {
      context.fillStyle = 'hsl(0,0%,100%)';
    } else if (d < 49152) {
      context.fillStyle = 'hsl(0,0%,95%)';
    } else {
      context.fillStyle = 'hsl(0,0%,90%)';
    }
    context.fillRect(xy.x*scale, xy.y*scale, scale, scale);

    // draw ports
    if (ports[d]) {
      var official_count = 0, tcp_count = 0, udp_count = 0;
      var plist = ports[d];
      for (var p=0; p<plist.length; p++) {
        if (plist[p].label === 'Unassigned') { continue; }
        if (plist[p].official) { official_count += 1; }
        if (plist[p].tcp) { tcp_count += 1; }
        if (plist[p].udp) { udp_count += 1; }
      }
      var opacity = (official_count / plist.length) / 3 + 0.667;

      if (tcp_count + udp_count) {
        var hue = 298 + 51 * (tcp_count - udp_count) / (tcp_count + udp_count);
      } else {
        var hue = 65;
      }
      context.fillStyle = 'hsla(' + hue.toFixed() + ', 90%, 40%,'+ opacity + ')';
      context.fillRect(xy.x*scale, xy.y*scale, scale, scale);
      // context.fillStyle = 'black';
      // context.fillRect(xy.x*scale+1, xy.y*scale+1, 1, 1);
    }
  }
}