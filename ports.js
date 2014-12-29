//convert (x,y) to d
function xy2d (n, x, y) {
    var rx, ry, s, d=0;
    for (s=n/2; s>0; s/=2) {
        rx = (x & s) > 0;
        ry = (y & s) > 0;
        d += s * s * ((3 * rx) ^ ry);
        var rrr = rotate(s, x, y, rx, ry);
        x = rrr.x;
        y = rrr.y;
    }
    return d;
}

//convert d to (x,y)
function d2xy(n, d) {
    var rx, ry, s, t=d;
    var x = 0, y = 0;
    for (s=1; s<n; s*=2) {
        rx = 1 & (t/2);
        ry = 1 & (t ^ rx);
        var rrr = rotate(s, x, y, rx, ry);
        x = rrr.x;
        y = rrr.y;
        x += s * rx;
        y += s * ry;
        t /= 4;
    }
    return {x:x, y:y};
}

//rotate/flip a quadrant appropriately
function rotate(n, x, y, rx, ry) {
    if (ry == 0) {
        if (rx == 1) {
            x = n-1 - x;
            y = n-1 - y;
        }
        //Swap x and y
        t  = x;
        x = y;
        y = t;
    }
    return {x:x,y:y};
}

var size = 256;
var max = Math.pow(size, 2);
var scale = 3;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function show_caption(mousePos) {
  var caption = document.getElementsByTagName('figcaption')[0];
  var d = xy2d(size, (mousePos.x/scale).toFixed(), (mousePos.y/scale).toFixed());
  caption.innerHTML = '';
  caption.appendChild(document.createElement('h1')).appendChild(document.createTextNode('Port: ' + d));
  if (ports[d]) {
    var plist = ports[d];
    var ul = caption.appendChild(document.createElement('ul'));
    for (var p=0; p<plist.length; p++) {
      var li = ul.appendChild(document.createElement('li'));
      li.appendChild(document.createTextNode(plist[p].label));
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
    }
  } else {
    caption.appendChild(document.createTextNode('Unassigned.'));
  }
}

function draw() {
  var canvas = document.getElementsByTagName('canvas')[0];
  canvas.addEventListener('mousemove', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    show_caption(mousePos);
  }, false);

  canvas.width = size * scale;
  canvas.height = size * scale;
  var context = canvas.getContext('2d');
  var xy;
  for (var d=0; d<max; d+=1) {
    xy = d2xy(size, d);

    // background
    if (d < 1024) {
      context.fillStyle = 'rgb(255,255,255)';
    } else if (d < 49152) {
      context.fillStyle = 'rgb(240,240,244)';
    } else {
      context.fillStyle = 'rgb(224,224,228)';
    }
    context.fillRect(xy.x*scale, xy.y*scale, scale, scale);

    // draw ports
    if (ports[d]) {
      var official_count = 0, tcp_count = 0, udp_count = 0;
      var plist = ports[d];
      for (var p=0; p<plist.length; p++) {
        if (plist[p].official) { official_count += 1; }
        if (plist[p].tcp) { tcp_count += 1; }
        if (plist[p].udp) { udp_count += 1; }
      }
      var opacity = (official_count / plist.length) / 2 + 0.5;

      if (tcp_count + udp_count) {
        var hue = 300 + 60 * (tcp_count - udp_count) / (tcp_count + udp_count);
      } else {
        var hue = 120;
      }

      context.fillStyle = 'hsla(' + hue.toFixed() + ', 50%, 50%,'+ opacity + ')';
      context.fillRect(xy.x*scale, xy.y*scale, scale, scale);

      // context.fillStyle = 'black';
      // context.fillRect(xy.x*scale+1, xy.y*scale+1, 1, 1);
    }
  }
}