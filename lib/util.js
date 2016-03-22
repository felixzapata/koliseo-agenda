var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function transitionClassFunc({removeClass = false}={}) {
  return function(el, className = 'active') {
    if (removeClass) {
      if (!el.classList.contains(className)) return Promise.resolve();
    }
    else {
      if (el.classList.contains(className)) return Promise.resolve();
    }

    return new Promise(resolve => {
      var listener = event => {
        if (event.target != el) return;
        el.removeEventListener('webkitTransitionEnd', listener);
        el.removeEventListener('transitionend', listener);
        resolve();
      };

      el.addEventListener('webkitTransitionEnd', listener);
      el.addEventListener('transitionend', listener);
      requestAnimationFrame(_ => {
        el.classList[removeClass ? 'remove' : 'add'](className);
      });
    });
  }
};

export default {

  transitionTo: transitionClassFunc(),

  transitionFrom: transitionClassFunc({removeClass: true}),

  // transform a string into a single element
  strToEl: (function () {
    var tmpEl = document.createElement('div');
    return function (str) {
      var r;
      tmpEl.innerHTML = str;
      r = tmpEl.children[0];
      while (tmpEl.firstChild) {
        tmpEl.removeChild(tmpEl.firstChild);
      }
      return r;
    };
  }()),


  escapeHtml: function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  },

  escapeHtmlTag: function(strings, ...values) {
    values = values.map(exports.escapeHtml);
    return strings.reduce((str, val, i) => str += val + (values[i] || ''), '');
  },
  
  setTabIndex(obj, tabIdx) {
    const focusables = obj.querySelectorAll('a, button');
    const len = focusables.length;
    for(var i = 0; i < len; i++) {
      focusables[i].setAttribute('tabindex', tabIdx);
    }
  },

  closest: function(el, selector) {
    if (el.closest) {
      return el.closest(selector);
    }

    var matches = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;

    do {
      if (el.nodeType != 1) continue;
      if (matches.call(el, selector)) return el;
    } while (el = el.parentNode);

    return undefined;
  },

  debug: function() {
    console.log.apply(console, arguments);
  }


};
