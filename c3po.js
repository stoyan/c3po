var c3po = (function() {
  var providers = {};
  var classNames = [];
  var parsed = {};
  var hasOwn = Object.prototype.hasOwnProperty;
  var anchor = document.createElement('a');
  
  var frame_attr = {
    scrolling: 'no',
    allowTransparency: 'true',
    frameborder: 0
  };
  
  function getOrigin(url) {
    anchor.href = url;
    return anchor.protocol + '//' + anchor.host;
  } 

  function getIframe(el) {
    var data = el.dataset;
    var qs = [];
    var guid = (1e20 * Math.random()).toString(16);

    for (var i in data) {
      if (hasOwn.call(data, i)) {
        qs.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
      }
    }
    qs.push('c3po-guid=' + guid);
    
    var ifr = document.createElement('iframe');
    ifr.src = providers[el.className] + qs.join('&');
    for (var i in frame_attr) {
      ifr.setAttribute(i, frame_attr[i]);
    }

    parsed[guid] = {
      flow: el,
      frame: ifr,
      origin: getOrigin(ifr.src)
    };

    return ifr;
  }

  return {
    // register 3rd party providers
    register: function (map) {
      for (var i in map) {
        if (hasOwn.call(map, i)) {
          providers[i] = map[i];
          classNames.push(i);
        }
      }
      return this;
    },

    // find appropriate tags and insert an iframe
    parse: function () {
      var els = document.querySelectorAll('.' + classNames.join(', .'));
      for (var i = 0, len = els.length; i < len; i++) {
        els[i].appendChild(getIframe(els[i]));
      }
      window.addEventListener("message", c3po.onMessage, false);
    },

    // handle messages from iframes
    onMessage: function (msg) {
      var data;
      try {
        data = JSON.parse(msg.data);
      } catch (e) {
        return;
      }
      
      var plugin = data.guid && parsed[data.guid];
      if (plugin && msg.origin === plugin.origin) {
        switch (data.type) {
          case 'resize':
            plugin.frame.style.width  = data.width  + 'px';
            plugin.frame.style.height = data.height + 'px';
            plugin.flow.style.width   = data.width  + 'px';
            plugin.flow.style.height  = data.height + 'px';
            break;
          default:
            // meh
        }
      }
      
    }
  };
}());