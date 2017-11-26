/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    opacity: 0.25,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 100,
    fps: 20,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: false,
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign({}, defaults, opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        var _this = this;
        this.stop();
        this.el = createEl('div', { className: this.opts.className });
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        var animator;
        var getNow;
        if (typeof requestAnimationFrame !== 'undefined') {
            animator = requestAnimationFrame;
            getNow = function () { return performance.now(); };
        }
        else {
            // fallback for IE 9
            animator = function (callback) { return setTimeout(callback, 1000 / _this.opts.fps); };
            getNow = function () { return Date.now(); };
        }
        var lastFrameTime;
        var state = 0; // state is rotation percentage (between 0 and 1)
        var animate = function () {
            var time = getNow();
            if (lastFrameTime === undefined) {
                lastFrameTime = time - 1;
            }
            state += getAdvancePercentage(time - lastFrameTime, _this.opts.speed);
            lastFrameTime = time;
            if (state > 1) {
                state -= Math.floor(state);
            }
            for (var line = 0; line < _this.opts.lines; line++) {
                if (line < _this.el.childNodes.length) {
                    var opacity = getLineOpacity(line, state, _this.opts);
                    _this.el.childNodes[line].style.opacity = opacity.toString();
                }
            }
            _this.animateId = _this.el ? animator(animate) : undefined;
        };
        drawLines(this.el, this.opts);
        animate();
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());

function getAdvancePercentage(msSinceLastFrame, roundsPerSecond) {
    return msSinceLastFrame / 1000 * roundsPerSecond;
}
function getLineOpacity(line, state, opts) {
    var linePercent = (line + 1) / opts.lines;
    var diff = state - (linePercent * opts.direction);
    if (diff < 0 || diff > 1) {
        diff += opts.direction;
    }
    // opacity should start at 1, and approach opacity option as diff reaches trail percentage
    var trailPercent = opts.trail / 100;
    var opacityPercent = 1 - diff / trailPercent;
    if (opacityPercent < 0) {
        return opts.opacity;
    }
    var opacityDiff = 1 - opts.opacity;
    return opacityPercent * opacityDiff + opts.opacity;
}
/**
 * Utility function to create elements. Optionally properties can be passed.
 */
function createEl(tag, prop) {
    if (prop === void 0) { prop = {}; }
    var el = document.createElement(tag);
    for (var n in prop) {
        el[n] = prop[n];
    }
    return el;
}
/**
 * Tries various vendor prefixes and returns the first supported property.
 */
function vendor(el, prop) {
    if (el.style[prop] !== undefined) {
        return prop;
    }
    // needed for transform properties in IE 9
    var prefixed = 'ms' + prop.charAt(0).toUpperCase() + prop.slice(1);
    if (el.style[prefixed] !== undefined) {
        return prefixed;
    }
    return '';
}
/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[vendor(el, prop) || prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    for (var i = 0; i < opts.lines; i++) {
        var seg = css(createEl('div'), {
            position: 'absolute',
            top: 1 + ~(opts.scale * opts.width / 2) + 'px',
            opacity: opts.opacity,
        });
        if (opts.shadow) {
            seg.appendChild(css(fill('#000', '0 0 4px #000', opts, i), { top: '2px' }));
        }
        seg.appendChild(fill(getColor(opts.color, i), '0 0 1px rgba(0,0,0,.1)', opts, i));
        el.appendChild(seg);
    }
    return el;
}
function fill(color, shadow, opts, i) {
    return css(createEl('div'), {
        position: 'absolute',
        width: opts.scale * (opts.length + opts.width) + 'px',
        height: opts.scale * opts.width + 'px',
        background: color,
        boxShadow: shadow,
        transformOrigin: 'left',
        transform: 'rotate(' + ~~(360 / opts.lines * i + opts.rotate) + 'deg) translate(' + opts.scale * opts.radius + 'px' + ',0)',
        borderRadius: (opts.corners * opts.scale * opts.width >> 1) + 'px'
    });
}var WUI_Dialog=new function(){"use strict";var a=this,b={},c=null,d=null,e=null,f=0,g=0,h=0,i=0,j=null,k=[],l={dialog:"wui-dialog",content:"wui-dialog-content",btn:"wui-dialog-btn",btn_close:"wui-dialog-close",detach:"wui-dialog-detach",minimized:"wui-dialog-minimized",minimize:"wui-dialog-minimize",maximize:"wui-dialog-maximize",header:"wui-dialog-header",open:"wui-dialog-open",closed:"wui-dialog-closed",draggable:"wui-dialog-draggable",transition:"wui-dialog-transition",dim_transition:"wui-dialog-dim-transition",modal:"wui-dialog-modal",status_bar:"wui-dialog-status-bar"},m={title:"",width:"80%",height:"40%",open:!0,closable:!0,minimizable:!1,draggable:!1,resizable:!1,detachable:!1,min_width:"title",min_height:32,header_btn:null,status_bar:!1,status_bar_content:"",keep_align_when_resized:!1,halign:"left",valign:"top",top:0,left:0,modal:!1,minimized:!1,on_close:null,on_detach:null,on_pre_detach:null,on_resize:null},n=function(a){for(var b=a.parentElement;null!=b;){if(b.classList.contains(l.dialog))return!0;b=b.parentElement}return!1};Element.prototype._addEventListener||(Element.prototype._addEventListener=Element.prototype.addEventListener,Element.prototype.addEventListener=function(a,b,c){this._addEventListener(a,b,c),n(this)&&(this.eventListenerList||(this.eventListenerList={}),this.eventListenerList[a]||(this.eventListenerList[a]=[]),this.eventListenerList[a].push(b))},Element.prototype._removeEventListener=Element.prototype.removeEventListener,Element.prototype.removeEventListener=function(a,b,c){if(this.eventListenerList){var d,e=this.eventListenerList[a];if(e)for(d=0;d<e.length;d+=1)if(e[d]===b){e.splice(d,1);break}}this._removeEventListener(a,b,c)});var o=function(a){var b=0;for(b=0;b<k.length;b+=1)if(k[b]===a.detachable_ref){k.splice(b,1);break}},p=function(a,c,d,e){var f,g,h,i,j=b[a.id];if(j&&(c&&j.detachable_ref&&(j.detachable_ref.closed||j.detachable_ref.close(),o(j)),!j.dialog.classList.contains(l.closed))){if(e&&j.modal_element)for(document.body.removeChild(j.modal_element),g=0;g<k.length;g+=1)for(i=k[g],f=i.document.body.getElementsByClassName(l.modal),h=0;h<f.length;h+=1)i.document.body.removeChild(f[h]);j.dialog.classList.contains(l.open)&&(a.classList.add(l.closed),a.classList.remove(l.open),d&&null!==j.opts.on_close&&j.opts.on_close())}},q=function(a){var c=0,d=null,e=null,f=b[a.id];if(!f.opts.modal){for(var g in b)b.hasOwnProperty(g)&&(d=b[g].dialog,isNaN(d.style.zIndex)||(c=parseInt(d.style.zIndex,10),c>100&&(d.style.zIndex=100)));for(e=f.dialog.parentElement;null!==e;)e.classList.contains(l.dialog)&&(e.style.zIndex=101),e=e.parentElement;a.style.zIndex=101}},r=function(a){var b=document.createElement("div");return b.className="wui-dialog-modal",b.addEventListener("click",function(b){b.preventDefault(),p(a,!0,!0,!0)}),b.style.zIndex=16777270,b},s=function(a){var c=b[a.id],d=c.opts,e=a.parentElement.offsetWidth,f=a.parentElement.offsetHeight,g=a.offsetWidth,h=a.offsetHeight;a.style.left="center"===d.halign?Math.round((e-g)/2+d.left)+"px":"right"===d.halign?e-g+d.left+"px":d.left+"px",a.style.top="center"===d.valign?Math.round((f-h)/2+d.top)+"px":"bottom"===d.valign?f-h+d.top+"px":d.top+"px"},t=function(a,c){var d=b[c.id],e=d.resize_handler;d.dialog!==c&&t(d.header_minimaxi_btn,d.dialog),a.classList.toggle(l.minimize),a.classList.toggle(l.maximize),c.classList.toggle(l.minimized),c.classList.contains(l.minimized)?(c.style.borderStyle="solid",c.style.borderColor="#808080",c.style.borderWidth="1px"):(c.style.borderStyle="",c.style.borderColor="",c.style.borderWidth=""),e&&e.classList.toggle(l.open),d.status_bar&&d.status_bar.classList.toggle(l.open)},u=function(a){null===j&&(j=setTimeout(function(){j=null;var c,d,e,f,g,h,i,k=document;if(a)for(k=a.document,c=k.getElementsByClassName(l.content),i=0;i<c.length;i+=1)e=c[i],f=e.parentElement,d=b[f.id],g=f.getElementsByClassName(l.status_bar),e.style.height=g.length>0?a.innerHeight-32+"px":a.innerHeight+"px",h=e.getBoundingClientRect(),d.opts.on_resize&&d.opts.on_resize(h.width,h.height);else for(c=k.getElementsByClassName(l.content),i=0;i<c.length;i+=1)e=c[i],f=e.parentElement,g=f.getElementsByClassName(l.status_bar),e.style.height=g.length>0?f.offsetHeight-64+"px":f.offsetHeight-32+"px",s(f),h=e.getBoundingClientRect(),d=b[f.id],d.opts.on_resize&&d.opts.on_resize(h.width,h.height)},125))},v=function(a,b){var c,d;do{if(1==a.nodeType&&a.eventListenerList)for(c in a.eventListenerList)if("length"!==c&&a.eventListenerList.hasOwnProperty(c))for(d=0;d<a.eventListenerList[c].length;d+=1)b.addEventListener(c,a.eventListenerList[c][d],!1);a.hasChildNodes()&&v(a.firstChild,b.firstChild),a=a.nextSibling,b=b.nextSibling}while(a&&b)},w=function(a){var c,d,e,f,g,h,i,j=b[a.id],m=a.firstElementChild.firstElementChild.firstElementChild,n=m.textContent||m.innerText||"",o=j.detachable_ref,q=a.getBoundingClientRect();for(j.opts.on_pre_detach&&j.opts.on_pre_detach(),a.classList.contains(l.minimized)?(c=parseInt(a.style.width,10),d=parseInt(a.style.height,10)-32):(c=q.width,d=q.height-32),e=void 0!==window.screenLeft?window.screenLeft:screen.left,f=void 0!==window.screenTop?window.screenTop:screen.top,p(a,!0,!1,!1),o=window.open("",n,["toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes","width="+c,"height="+d,"top="+(q.top+f+32),"left="+(q.left+e)].join(",")),j.detachable_ref=o,h="",g=document.head.getElementsByTagName("link"),i=0;i<g.length;i+=1)"text/css"===g[i].type&&"stylesheet"===g[i].rel&&(h+=g[i].outerHTML);for(g=document.head.getElementsByTagName("style"),i=0;i<g.length;i+=1)h+=g[i].outerHTML;o.document.open(),o.document.write("<html><head>"+("<title>"+n+"</title>")+h+"</head>"+('<body id="'+a.id+'" class="wui-dialog-detach-window-body" onload="parent.opener.WUI_Dialog.childWindowLoaded(document.body.id)">')+"</body></html>"),o.document.close(),o.document.body.appendChild(a.children[1].cloneNode(!0));var r=a.getElementsByClassName(l.status_bar);if(r.length>0){var s=r[0].cloneNode(!0);s.classList.add(l.open),o.document.body.appendChild(s)}o.addEventListener("keyup",function(b){27===b.keyCode&&p(a,!0,!0,!0)},!1),o.addEventListener("resize",function(){u(o)},!1),o.addEventListener("beforeunload",function(){p(a,!0,!0,!0)},!1),k.push(o)},x=function(a){a.preventDefault();var b=a.target,c=null;b.classList.contains(l.btn_close)?(c=b.parentElement.parentElement,p(c,!1,!0,!0)):b.classList.contains(l.maximize)||b.classList.contains(l.minimize)?(c=b.parentElement.parentElement,t(b,c)):b.classList.contains(l.detach)&&(c=b.parentElement.parentElement,w(c))},y=function(c){if(27===c.keyCode){var d,e;for(d in b)if(b.hasOwnProperty(d)&&(e=b[d],e.opts.closable&&"101"===e.dialog.style.zIndex&&e.dialog.classList.contains(l.open)))return void a.close(d,!0)}},z=function(a){if(c){a.preventDefault();var d,h,i,j=b[c.id],k=a.clientX,l=a.clientY,m=a.changedTouches,n=null;if(m)for(d=0;d<m.length;d+=1)if(n=m[d],n.identifier===e){k=m[d].clientX,l=m[d].clientY;break}h=k-f,i=l-g,c.style.left=h+"px",c.style.top=i+"px",j.dialog!==c&&(j.dialog.style.left=h+"px",j.dialog.style.top=i+"px")}},A=function(a){if(c){var b,d=a.changedTouches,f=null,g=c.ownerDocument,h=g.defaultView||g.parentWindow;if(d){for(b=0;b<d.length;b+=1)if(f=d[b],f.identifier===e){c=null,g.body.style.cursor="default",h.removeEventListener("touchmove",z,!1),h.removeEventListener("touchend",A,!1);break}}else c=null,g.body.style.cursor="default",h.removeEventListener("mousemove",z,!1),h.removeEventListener("mouseup",A,!1)}},B=function(a){var b,d,h,i=a.clientX,j=a.clientY,k=0,m=0,n=a.changedTouches;if(a.preventDefault(),null===c)if(n)e=n[0].identifier,i=n[0].clientX,j=n[0].clientY;else if(0!==a.button)return;h=a.target.parentElement,!h.classList.contains(l.maximize)&&h.classList.contains(l.draggable)&&(c=h,b=c.ownerDocument,d=b.defaultView||b.parentWindow,q(c),b.body.style.cursor="move",k=parseInt(c.style.left,10),m=parseInt(c.style.top,10),f=i-k,g=j-m,d.addEventListener("mousemove",z,!1),d.addEventListener("touchmove",z,!1),d.addEventListener("mouseup",A,!1),d.addEventListener("touchend",A,!1))},C=function(a){a.preventDefault(),a.stopPropagation();var b=a.target.parentElement,c=b.offsetLeft,f=b.offsetTop,g=a.changedTouches,j=b.ownerDocument,k=j.defaultView||j.parentWindow;g&&(e=g[0].identifier),h=c,i=f,b.classList.remove(l.dim_transition),k.addEventListener("mousemove",D,!1),k.addEventListener("touchmove",D,!1),k.addEventListener("mouseup",E,!1),k.addEventListener("touchend",E,!1),d=b},D=function(a){a.preventDefault();var c,f,g=a.clientX,j=a.clientY,k=a.changedTouches,m=null,n=b[d.id],o=null,p=null,q=0,r=0,t=0;if(k)for(r=0;r<k.length;r+=1)if(m=k[r],m.identifier===e){g=k[r].clientX,j=k[r].clientY;break}for(c=g-h,f=j-i,p=d.firstElementChild.firstElementChild.firstElementChild,q=p.offsetWidth+148,"title"===n.opts.min_width&&c<q?c=q:c<n.opts.min_width&&(c=n.opts.min_width),n.opts.status_bar&&(t=32),f<n.opts.min_height+t&&(f=n.opts.min_height+t),d.style.width=c+"px",d.classList.contains(l.minimized)||(d.style.height=f+"px"),o=d.getElementsByClassName(l.content),r=0;r<o.length;r+=1){var u,v=o[r],w=b[v.parentElement.id];v.style.height=d.offsetHeight-32-t+"px",u=v.getBoundingClientRect(),w.opts.on_resize&&w.opts.on_resize(u.width,u.height),n.opts.keep_align_when_resized&&s(d)}},E=function(a){var b=d.ownerDocument,c=b.defaultView||b.parentWindow;a.preventDefault(),d.classList.add(l.dim_transition),c.removeEventListener("mousemove",D,!1),c.removeEventListener("touchmove",D,!1),c.removeEventListener("mouseup",E,!1),c.removeEventListener("touchend",E,!1),d=null},F=function(){for(var a in b)b.hasOwnProperty(a)&&p(b[a].dialog,!0,!1,!0)},G=function(){console.log("WUI_RangeSlider 'create' failed, first argument not an id nor a DOM element.")};this.create=function(a,c){var d,e,f=document.createElement("div"),g=null,h=null,i=null,j=null,k=null,n=null,o=null,p=null,r=null,v={},w=0;if("string"==typeof a)d=document.getElementById(a);else{if("object"!=typeof a)return void G();if("string"!=typeof a.innerHTML)return void G();d=a,a=d.id}if(void 0!==b[a])return void console.log("WUI_Dialog id '"+a+"' already created, aborting.");for(e in m)m.hasOwnProperty(e)&&(v[e]=m[e]);if(void 0!==c)for(e in c)c.hasOwnProperty(e)&&void 0!==m[e]&&(v[e]=c[e]);var y=d.firstElementChild;if(null===y&&(y=document.createElement("div"),d.appendChild(y)),d.style.width=v.width,d.style.height=v.height,d.classList.add(l.dialog),y.classList.add(l.content),f.className=l.header,"auto"!==v.height&&"100%"!==v.height&&(y.style.height=v.status_bar?d.offsetHeight-64+"px":d.offsetHeight-32+"px"),n=document.createElement("div"),k=document.createElement("div"),n.style.display="inline-block",k.className="wui-dialog-title",n.innerHTML=v.title,k.appendChild(n),f.appendChild(k),v.draggable&&(d.classList.toggle(l.draggable),f.addEventListener("mousedown",B,!1),f.addEventListener("touchstart",B,!1)),v.closable&&(i=document.createElement("div"),i.className=l.btn+" "+l.btn_close,i.title="Close",f.appendChild(i)),v.minimizable&&(j=document.createElement("div"),j.className=l.btn+" "+l.minimize,v.minimized&&t(j,d),f.appendChild(j)),v.detachable&&(h=document.createElement("div"),h.className=l.btn+" "+l.detach,h.title="Detach",f.appendChild(h)),v.header_btn)for(w=0;w<v.header_btn.length;w+=1)p=v.header_btn[w],o=document.createElement("div"),void 0!==p.title&&(o.title=p.title),void 0!==p.on_click&&(o.addEventListener("touchstart",p.on_click,!1),o.addEventListener("mousedown",p.on_click,!1),void 0!==p.class_name&&(o.className=l.btn+" "+p.class_name,f.appendChild(o)));return v.status_bar&&(r=document.createElement("div"),r.classList.add(l.status_bar),r.classList.add(l.transition),r.classList.add(l.open),r.innerHTML=v.status_bar_content,d.appendChild(r)),f.addEventListener("click",x,!1),f.addEventListener("touchstart",x,!1),window.addEventListener("resize",function(){u(!1)},!1),window.addEventListener("beforeunload",F,!1),d.classList.add(l.transition),d.classList.add(l.dim_transition),d.insertBefore(f,y),v.resizable&&(g=document.createElement("div"),g.addEventListener("mousedown",C,!1),g.addEventListener("touchstart",C,!1),g.classList.add("wui-dialog-resize"),g.classList.add(l.transition),g.classList.add(l.open),d.appendChild(g)),b[a]={dialog:d,minimized_id:-1,resize_handler:g,header_minimaxi_btn:j,opts:v,detachable_ref:null,modal_element:null,status_bar:r},s(d),q(d),v.open?this.open(a,!1):d.classList.add(l.closed),a},this.setStatusBarContent=function(a,c){var d,e,f=b[a];return void 0===f?void("undefined"!=typeof console&&console.log('Cannot setStatusBarContent of WUI dialog "'+a+'".')):void(f.status_bar&&(f.status_bar.innerHTML=c,e=f.detachable_ref,e&&(e.closed||(d=e.document.body.getElementsByClassName(l.status_bar),d.length>0&&(d[0].innerHTML=c)))))},this.open=function(a,c){var d,e,f,g=b[a];if(void 0===g)return void("undefined"!=typeof console&&console.log('Cannot open WUI dialog "'+a+'".'));if(g.detachable_ref&&!g.detachable_ref.closed)return void g.detachable_ref.focus();if(f=g.dialog,g.opts.modal)for(d=r(f),g.dialog.style.zIndex=16777271,g.modal_element=d,document.body.appendChild(d),e=0;e<k.length;e+=1)d=r(f),k[e].document.body.appendChild(d);return c?void w(f):(f.classList.remove(l.closed),f.classList.add(l.open),void q(f))},this.focus=function(a){var c=b[a];return void 0===c?void("undefined"!=typeof console&&console.log('Cannot focus WUI dialog "'+a+'".')):void q(c.dialog)},this.close=function(a,c){var d=b[a];return void 0===d?void("undefined"!=typeof console&&console.log('Cannot close WUI dialog "'+a+'".')):void p(d.dialog,!0,c,!0)},this.destroy=function(a){var c,d=b[a];return void 0===d?void console.log("Element id '"+a+"' is not a WUI_Dialog, destroying aborted."):(p(d.dialog,!0,!1,!0),c=d.dialog,c.parentElement.removeChild(c),void delete b[a])},this.childWindowLoaded=function(a){var c=b[a],d=c.detachable_ref;d&&(d.document.body.firstElementChild?(v(c.dialog.children[1],d.document.body.firstElementChild),c.opts.on_detach&&c.opts.on_detach(d)):window.setTimeout(function(){WUI_Dialog.childWindowLoaded(a)},500))},this.getDetachedDialog=function(a){var c=b[a],d=0;if(void 0===c)return void 0!==a&&console.log("WUI_Dialog.getDetachedDialog: Element id '"+a+"' is not a WUI_Dialog."),null;for(d=0;d<k.length;d+=1)if(k[d]===c.detachable_ref)return c.detachable_ref;return null},document.addEventListener("keyup",y,!1)},WUI_DropDown=new function(){"use strict";var a={},b={dropdown:"wui-dropdown",item:"wui-dropdown-item",content:"wui-dropdown-content",selected:"wui-dropdown-selected",open:"wui-dropdown-open",on:"wui-dropdown-on"},c={width:"auto",height:24,ms_before_hiding:2e3,vertical:!1,vspacing:0,selected_id:0,on_item_selected:null},d=function(a){var b=a.ownerDocument,c=a.getBoundingClientRect(),d=b.body,e=b.documentElement,f=b.defaultView||b.parentWindow,g=f.pageYOffset||e.scrollTop||d.scrollTop,h=f.pageXOffset||e.scrollLeft||d.scrollLeft,i=e.clientTop||d.clientTop||0,j=e.clientLeft||d.clientLeft||0,k=c.top+g-i,l=c.left+h-j;return{top:Math.round(k),left:Math.round(l)}},e=function(a,c){var d,e=a.createElement("div"),f=null,g="";for(d=0;d<c.content_array.length;d+=1)g=c.content_array[d],f=a.createElement("div"),c.opts.vertical||f.classList.add("wui-dropdown-horizontal"),f.classList.add(b.item),f.innerHTML=g,f.dataset.index=d,e.appendChild(f),f.addEventListener("click",h,!1),g===c.content_array[c.selected_id]&&f.classList.add(b.selected);e.addEventListener("mouseover",i,!1),e.classList.add(b.content),e.dataset.linkedto=c.element.id,a.body.appendChild(e),c.floating_content=e},f=function(a,c,d){c.classList.remove(b.on),d.floating_content&&d.floating_content.parentElement===a.body&&a.body.removeChild(d.floating_content),d.floating_content=null,d.close_timeout=null},g=function(c){c.preventDefault(),c.stopPropagation();var d=c.target,e=null,g=null;d.classList.contains(b.dropdown)&&(e=a[d.id],g=e.floating_content,g?g.classList.contains(b.open)&&f(c.target.ownerDocument,d,e):i(c))},h=function(c){c.preventDefault(),c.stopPropagation();var d,e,g=c.target,h=null,i=null;if(g.classList.contains(b.item)){for(h=g.parentElement,d=a[h.dataset.linkedto],i=h.getElementsByTagName("div"),e=0;e<i.length;e+=1)i[e].classList.remove(b.selected);g.classList.add(b.selected),d.selected_id=parseInt(g.dataset.index,10),d.target_element.lastElementChild.innerHTML=g.textContent,d.element!==d.target_element&&(d.element.lastElementChild.innerHTML=g.textContent),void 0!==d.opts.on_item_selected&&d.opts.on_item_selected(g.dataset.index),f(g.ownerDocument,d.target_element,d)}},i=function(c){c.preventDefault(),c.stopPropagation();var f=c.target,g=null,h=null,i=null,k=f.ownerDocument,l=k.defaultView||k.parentWindow;if(f.classList.contains(b.dropdown))g=a[f.id],null===g.floating_content&&(f.classList.add(b.on),e(k,g),i=g.floating_content,h=d(f),i.style.top=h.top-i.offsetHeight-g.opts.vspacing+"px",i.style.left=h.left+"px",i.classList.add(b.open),g.target_element=f);else if(f.classList.contains(b.content))g=a[f.dataset.linkedto];else{if(!f.classList.contains(b.item))return;g=a[f.parentElement.dataset.linkedto]}l.clearTimeout(g.close_timeout),f.addEventListener("mouseleave",j,!1)},j=function(c){c.preventDefault();var d=c.target,e=null,g=d.ownerDocument,h=g.defaultView||g.parentWindow;e=d.classList.contains(b.content)?a[d.dataset.linkedto]:d.classList.contains(b.item)?a[d.parentElement.dataset.linkedto]:a[d.id],e.close_timeout=h.setTimeout(f,e.opts.ms_before_hiding,g,e.target_element,e),d.removeEventListener("mouseleave",j,!1)},k=function(){console.log("WUI_RangeSlider 'create' failed, first argument not an id nor a DOM element.")};this.create=function(d,e,f){var h,j,l={};if("string"==typeof d)h=document.getElementById(d);else{if("object"!=typeof d)return void k();if("string"!=typeof d.innerHTML)return void k();h=d,d=h.id}if(void 0!==a[d])return void console.log("WUI_DropDown id '"+d+"' already created, aborting.");for(j in c)c.hasOwnProperty(j)&&(l[j]=c[j]);if(void 0!==e)for(j in e)e.hasOwnProperty(j)&&void 0!==c[j]&&(l[j]=e[j]);h.classList.add(b.dropdown),h.style.width=l.width,h.style.height=l.height;var m=document.createElement("div");m.classList.add("wui-dropdown-icon"),h.appendChild(m);var n=document.createElement("div");n.classList.add("wui-dropdown-text"),0!==f.length&&(n.innerHTML=f[l.selected_id]),h.appendChild(n),h.addEventListener("click",g,!1),h.addEventListener("mouseover",i,!1);var o={element:h,floating_content:null,selected_id:l.selected_id,content_array:f,opts:l,button_item:n,hover_count:0,target_element:null,close_timeout:null};return a[d]=o,d},this.destroy=function(b){var c,d=a[b];return void 0===d?void console.log("Element id '"+b+"' is not a WUI_DropDown, destroying aborted."):(c=d.element,f(document,c,d),c.parentElement.removeChild(c),void delete a[b])}},WUI_RangeSlider=new function(){"use strict";var a={},b=null,c=null,d=null,e=null,f="_wui_container",g="background-color: #00ff00",h=null,i={},j={midi_learn_btn:"MIDI learn"},k={hook:"wui-rangeslider-hook",bar:"wui-rangeslider-bar",filler:"wui-rangeslider-filler",hook_focus:"wui-rangeslider-hook-focus",value_input:"wui-rangeslider-input",midi_learn_btn:"wui-rangeslider-midi-learn-btn"},l={width:148,height:8,title:"",title_min_width:0,value_min_width:0,min:0,max:1,decimals:4,step:.01,scroll_step:.01,vertical:!1,title_on_top:!1,on_change:null,default_value:0,value:0,bar:!0,midi:null,configurable:null},m={min:0,max:0,step:0,scroll_step:0},n={opts:{},endless:!1,midi:{},value:0},o=function(a){for(var b,c,d=document.getElementById(a);d;){if(d.classList&&d.classList.contains("wui-dialog")){b=d.id;break}d=d.parentNode}return WUI_Dialog&&(c=WUI_Dialog.getDetachedDialog(b))?c.document.getElementById(a):null},p=function(a){var b=a.ownerDocument,c=a.getBoundingClientRect(),d=b.body,e=b.documentElement,f=b.defaultView||b.parentWindow,g=f.pageYOffset||e.scrollTop||d.scrollTop,h=f.pageXOffset||e.scrollLeft||d.scrollLeft,i=e.clientTop||d.clientTop||0,j=e.clientLeft||d.clientLeft||0,k=c.top+g-i,l=c.left+h-j;return{top:Math.round(k),left:Math.round(l)}},q=function(a,b){null!==a&&a(b)},r=function(a,b){var c=(+a).toFixed(b+1);return+c.slice(0,c.length-1)},s=function(a){return a.classList.contains(k.hook)?a:a.classList.contains(k.filler)?a.firstElementChild:a.firstElementChild?a.firstElementChild.firstElementChild:null},t=function(b,c,d){var e,f,g,h,i=b,j=a[i.id],l=c.opts.width,m=c.opts.height,n=Math.abs((d-c.opts.min)/c.opts.range);e=i.getElementsByClassName(k.bar)[0],f=e.firstElementChild,g=f.firstElementChild,h=e.nextElementSibling,d=r(d,j.opts.decimals),c.opts.vertical?(n=Math.round(n*e.offsetHeight),f.style.position="absolute",f.style.bottom="0",f.style.width="100%",f.style.height=n+"px",g.style.marginTop=-l+"px",g.style.marginLeft=-l/2-1+"px",g.style.width=2*l+"px",g.style.height=2*l+"px",h.style.marginTop="13px",j.element!==i&&(j.filler.style.position="absolute",j.filler.style.bottom="0",j.filler.style.width="100%",j.filler.style.height=n+"px",j.hook.style.marginTop=-l+"px",j.hook.style.marginLeft=-l/2-1+"px",j.hook.style.width=2*l+"px",j.hook.style.height=2*l+"px",j.value_input.style.marginTop="13px")):(n=Math.round(n*l),f.style.width=n+"px",f.style.height="100%",g.style.left=n+"px",g.style.marginTop=-m/2+"px",g.style.marginLeft=-m+"px",g.style.width=2*m+"px",g.style.height=2*m+"px",j.element!==i&&(j.filler.style.width=n+"px",j.filler.style.height="100%",j.hook.style.left=n+"px",j.hook.style.marginTop=-m/2+"px",j.hook.style.marginLeft=-m+"px",j.hook.style.width=2*m+"px",j.hook.style.height=2*m+"px")),j.value_input.value=d,h.value=d,c.value=d},u=function(a){if(a.preventDefault(),null!==d){var f,g,h=d.parentElement,i=h.parentElement,j=i.nextElementSibling,k=p(i),l=i.offsetWidth,m=0,n=a.clientX,o=a.clientY,s=a.changedTouches,t=null;if(s)for(f=0;f<s.length;f+=1)if(t=s[f],t.identifier===e){n=s[f].clientX,o=s[f].clientY;break}if(c.opts.vertical?(l=i.offsetHeight,m=Math.round((k.top+i.offsetHeight-o)/c.opts.step)*c.opts.step):m=Math.round((n-k.left)/c.opts.step)*c.opts.step,m>l?(m=l,b=c.opts.max):m<0?(m=0,b=c.opts.min):b=Math.round((c.opts.min+m/l*c.opts.range)/c.opts.step)*c.opts.step,c.value===b)return;c.value=b,g=r(b,c.opts.decimals),j.value=g,c.value_input.value=g,c.opts.vertical?(h.style.height=m+"px",c.filler.style.height=m+"px"):(h.style.width=m+"px",c.filler.style.width=m+"px",d.style.left=m+"px",c.hook.style.left=m+"px"),q(c.opts.on_change,b)}},v=function(a){if(d){a.preventDefault();var b,f=a.changedTouches,g=null,h=!1,i=d.ownerDocument,j=i.defaultView||i.parentWindow;if(f){for(b=0;b<f.length;b+=1)if(g=f[b],g.identifier===e){h=!0,j.removeEventListener("touchend",v,!1),j.removeEventListener("touchmove",u,!1);break}}else h=!0,j.removeEventListener("mouseup",v,!1),j.removeEventListener("mousemove",u,!1);h&&(d.classList.remove(k.hook_focus),d=null,c=null,i.body.style.cursor="default")}},w=function(b){b.stopPropagation();var f,g,h=null,i=!1,j=b.changedTouches;null===c&&j&&(e=j[0].identifier,i=!0),0===b.button&&(i=!0),i&&(d=s(b.target),d.classList.add(k.hook_focus),h=d.parentElement.parentElement.parentElement,c=a[h.id],f=h.ownerDocument,g=f.defaultView||f.parentWindow,f.body.style.cursor="pointer",u(b),g.addEventListener("mousemove",u,!1),g.addEventListener("touchmove",u,!1),g.addEventListener("mouseup",v,!1),g.addEventListener("touchend",v,!1))},x=function(b){b.preventDefault(),b.stopPropagation();var c=b.target,d=c.parentElement.parentElement.parentElement,e=a[d.id],f=e.opts.default_value;t(d,e,f),q(e.opts.on_change,f)},y=function(b){b.preventDefault(),b.stopPropagation();var c,d,e,f,g=b.wheelDelta?b.wheelDelta/40:b.detail?-b.detail:0;b.deltaY&&(g=-b.deltaY),c=s(b.target),null===c?(d=b.target.parentElement,e=a[d.id]):(d=c.parentElement.parentElement.parentElement,e=a[d.id]),f=parseFloat(e.value),g>=0?f+=e.opts.scroll_step:f-=e.opts.scroll_step,e.endless||(e.opts.max&&f>e.opts.max?f=e.opts.max:f<e.opts.min&&(f=e.opts.min)),t(d,e,f),q(e.opts.on_change,f)},z=function(b){if(!b.target.validity||b.target.validity.valid){var c=b.target.parentElement,d=a[c.id];t(c,d,b.target.value),q(d.opts.on_change,b.target.value)}},A=function(a,b,c){return function(a){var d=a.target,e=b.opts;return d.validity&&!d.validity.valid?void("min"===c||"max"===c?b.endless=!0:"step"===c&&(b.value_input.step="any")):("min"===c?(e.min=r(d.value,e.decimals),b.value_input.min=e.min,e.range=e.max-e.min,b.endless=!1):"max"===c?(e.max=r(d.value,e.decimals),b.value_input.max=e.max,e.range=e.max-e.min,b.endless=!1):"step"===c?(e.step=r(d.value,e.decimals),b.value_input.step=e.step):"scroll_step"===c&&(e.scroll_step=r(d.value,e.decimals)),void(void 0!==e.configurable[c]&&(e.configurable[c].val=d.value)))}},B=function(a){var b,c,d,e,f;if(a)for(b in i)for(c in i[b])for(d=i[b][c],f=0;f<d.widgets.length;f+=1)if(e=d.widgets[f],e===a)return void d.widgets.splice(f,1)},C=function(b){b.preventDefault(),b.stopPropagation();var c,d,e,f,i=b.target,l=i.parentElement,m=a[l.id];if(m.learn)return m.learn=!1,i.style="",i.title=j.midi_learn_btn,m.learn_elem.title=j.midi_learn_btn,h=null,m.midi.device=null,m.midi.controller=null,void B(l.id);for(d in a)a.hasOwnProperty(d)&&(e=a[d],e.learn=!1,c=o(d),c&&(f=c.getElementsByClassName(k.midi_learn_btn),f.length>0&&(f[0].style="")),e.learn_elem&&(e.learn_elem.style=""));m.learn=!0,i.style=g,h=l.id},D=function(b){b.preventDefault(),b.stopPropagation();var c,d,e,g,h,i,j,l,n=b.target,o=n.parentElement,q=a[o.id],r=q.opts,s=n.ownerDocument,t=q.element.id+f,u=1;if(document.getElementById(t)||(q.configure_panel_open=!1),q.configure_panel_open!==!0){h=s.createElement("div"),h.className="wui-rangeslider-configure-container",l=s.createElement("div"),l.className="wui-rangeslider-configure-close",c=function(a){q.configure_panel_open=!1;var b=document.getElementById(t),c=a.target.ownerDocument.getElementById(t);b&&b.parentElement&&b.parentElement.removeChild(b),c&&c.parentElement&&c.parentElement.removeChild(c)},l.addEventListener("click",c,!1),l.addEventListener("touchstart",c,!1),h.id=t,h.appendChild(l);for(e in r.configurable)r.configurable.hasOwnProperty(e)&&void 0!==m[e]&&(g=r.configurable[e],i=s.createElement("div"),i.style.display="inline-block",i.style.marginRight="8px",i.style.width="80px",i.style.textAlign="right",i.innerHTML=e.replace("_"," ")+" : ",j=s.createElement("input"),j.className=k.value_input,h.appendChild(i),h.appendChild(j),u%2===0&&h.appendChild(s.createElement("div")),j.setAttribute("type","number"),j.setAttribute("step","any"),void 0!==g&&(void 0!==g.min&&(j.setAttribute("min",g.min),j.title=j.title+" min: "+g.min),void 0!==g.max&&(j.setAttribute("max",g.max),j.title=j.title+" max: "+g.max),void 0!==g.val?j.setAttribute("value",g.val):"min"===e?j.setAttribute("value",r.min):"max"===e?j.setAttribute("value",r.max):"step"===e?j.setAttribute("value",r.step):"scroll_step"===e&&j.setAttribute("value",r.scroll_step)),j.addEventListener("input",A(b,q,e),!1),u+=1);d=p(n),o.insertBefore(h,n),q.configure_panel_open=!0}},E=function(){console.log("WUI_RangeSlider 'create' failed, first argument not an id nor a DOM element.")};this.create=function(b,c){var d,e,f,g={};if("string"==typeof b)d=document.getElementById(b);else{if("object"!=typeof b)return void E();if("string"!=typeof b.innerHTML)return void E();d=b,b=d.id}if(void 0!==a[b])return void console.log("WUI_RangeSlider id '"+b+"' already created, aborting.");for(f in l)l.hasOwnProperty(f)&&(g[f]=l[f]);if(void 0!==c){for(f in c)c.hasOwnProperty(f)&&void 0!==l[f]&&(g[f]=c[f]);void 0!==c.max&&(g.range=c.max),void 0!==c.step&&(g.step=c.step,void 0===c.scroll_step&&(g.scroll_step=g.step)),void 0!==c.title_on_top?g.title_on_top=c.title_on_top:g.vertical&&(g.title_on_top=!0),void 0!==c.default_value?g.default_value=c.default_value:void 0!==c.min&&void 0!==c.max&&(g.default_value=g.min+g.max/2)}g.min<0&&(g.range=g.max-g.min),a[b]=null,d.classList.add("wui-rangeslider"),g.title_on_top&&d.classList.add("wui-rangeslider-title-ontop");var h=document.createElement("div"),i=document.createElement("div"),n=document.createElement("div"),o=document.createElement("div"),p=document.createElement("div"),r=document.createElement("input"),s={element:d,opts:g,bar:null,filler:null,hook:null,endless:!1,midi:{device:null,controller:null,ctrl_type:"abs"},learn:!1,learn_elem:null,value_input:r,default_value:g.default_value,value:g.value};if(h.innerHTML=g.title,r.setAttribute("value",g.value),r.setAttribute("type","number"),r.setAttribute("step",g.step),r.classList.add(k.value_input),p.classList.add("wui-rangeslider-value"),h.classList.add("wui-rangeslider-title"),i.classList.add(k.bar),n.classList.add(k.filler),o.classList.add(k.hook),g.vertical&&(h.style.textAlign="center"),h.style.minWidth=g.title_min_width+"px",p.style.minWidth=g.value_min_width+"px",r.style.minWidth=g.value_min_width+"px",i.style.width=g.width+"px",i.style.height=g.height+"px",d.appendChild(h),g.bar||(i.style.display="none",r.style.marginTop="6px"),c.hasOwnProperty("min")?r.setAttribute("min",g.min):g.min=void 0,c.hasOwnProperty("max")?r.setAttribute("max",g.max):(g.max=void 0,void 0===g.min&&(s.endless=!0)),i.appendChild(n),n.appendChild(o),d.appendChild(i),s.bar=i,s.filler=n,s.hook=o,d.appendChild(r),g.configurable){var u=0;for(f in g.configurable)g.configurable.hasOwnProperty(f)&&void 0!==m[f]&&(u+=1);if(u>0){var v=document.createElement("div");v.classList.add("wui-rangeslider-configurable-btn"),v.addEventListener("click",D,!1),v.addEventListener("touchstart",D,!1),g.title_on_top&&!g.vertical?(v.style.bottom="0",h.style.marginBottom="4px"):g.title_on_top&&g.vertical?(h.style.marginLeft="16px",h.style.marginRight="16px",v.style.top="0"):(h.style.marginLeft="16px",v.style.top="0"),g.vertical?d.appendChild(v):d.insertBefore(v,h)}}if(g.midi)if(navigator.requestMIDIAccess){var A=document.createElement("div");A.classList.add(k.midi_learn_btn),A.title=j.midi_learn_btn,A.addEventListener("click",C,!1),A.addEventListener("touchstart",C,!1),s.learn_elem=A,g.midi.type&&(s.midi.ctrl_type=g.midi.type),d.appendChild(A)}else console.log("WUI_RangeSlider id '"+b+"' : Web MIDI API is disabled. (not supported by your browser?)");return e="onwheel"in document.createElement("div")?"wheel":void 0!==document.onmousewheel?"mousewheel":"DOMMouseScroll",g.bar?(i.addEventListener("mousedown",w,!1),i.addEventListener("touchstart",w,!1),i.addEventListener(e,y,!1),o.addEventListener("dblclick",x,!1)):r.addEventListener(e,y,!1),r.addEventListener("input",z,!1),a[b]=s,t(d,s,g.value),q(s.opts.on_change,s.value),b},this.destroy=function(b){var c,d,e,g=a[b];return void 0===g?void console.log("Element id '"+b+"' is not a WUI_RangeSlider, destroying aborted."):(h===b&&(midi_learn_current=null),B(b),c=g.element,c.parentElement.removeChild(c),d=c.ownerDocument,e=d.getElementById(b+f),e&&d.removeChild(e),void delete a[b])},this.getParameters=function(b){var c,d=a[b],e={};if(void 0===d)return console.log("Element id '"+b+"' is not a WUI_RangeSlider, getParameters aborted."),null;for(c in d)d.hasOwnProperty(c)&&void 0!==n[c]&&(e[c]=d[c]);return e},this.setParameters=function(b,c,d){var e,f=a[b];if(void 0===f)return void console.log("Element id '"+b+"' is not a WUI_RangeSlider, setParameters aborted.");if(c){for(e in f)f.hasOwnProperty(e)&&void 0!==c[e]&&(f[e]=c[e]);f.midi.device&&f.midi.controller&&i["d"+f.midi.device]["c"+f.midi.controller].widgets.push(b),t(f.element,f,f.value),d&&q(f.opts.on_change,f.value)}},this.setValue=function(b,c,d){var e=a[b];return void 0===e?void console.log("Element id '"+b+"' is not a WUI_RangeSlider, setParameters aborted."):(t(e.element,e,c),void(d&&q(e.opts.on_change,c)))},this.submitMIDIMessage=function(b){var c,d,e,f,g,j,l=h,m=b.data[0],n=b.data[1],p=parseInt(b.data[2],10),r="d"+m,s="c"+n,u=0;if(h)return c=a[l],i[r]||(i[r]={}),i[r][s]||(i[r][s]={prev_value:p,widgets:[],increments:1}),i[r][s].widgets.push(l),g=o(l),g&&(e=g.getElementsByClassName(k.midi_learn_btn),e.length>0&&(e[0].style="",e[0].title=r+" "+s)),c.midi.device=m,c.midi.controller=n,c.learn=!1,c.learn_elem.style="",c.learn_elem.title=r+" "+s,void(h=null);if(i[r]&&i[r][s])for(d=i[r][s],u=0;u<d.widgets.length;u+=1)if(l=d.widgets[u],c=a[l],g=o(l),f=g?g:c.element,"abs"===c.midi.ctrl_type)j=c.opts.min+c.opts.range*(p/127),t(f,c,j),q(c.opts.on_change,j);else if("rel"===c.midi.ctrl_type){var v=c.opts.step;if("any"===v&&(v=.5),d.prev_value>p){if(d.increments=-v,j=c.value-v,j<c.opts.min&&!c.endless)continue;d.prev_value=p}else if(d.prev_value<p){if(d.increments=v,j=c.value+v,j>c.opts.max&&!c.endless)continue;d.prev_value=p}else if(j=c.value+d.increments,!c.endless){if(j>c.opts.max)continue;if(j<c.opts.min)continue}t(f,c,j),q(c.opts.on_change,j)}}},WUI_Input=WUI_RangeSlider,WUI_Tabs=new function(){"use strict";var a={},b={enabled:"wui-tab-enabled",disabled:"wui-tab-disabled",display_none:"wui-tab-display-none",tabs:"wui-tabs",tab:"wui-tab",tabs_content:"wui-tabs-content",tab_content:"wui-tab-content",underline:"wui-tabs-underline"},c={on_tab_click:null,height:"calc(100% - 30px)"},d=function(c){c.preventDefault(),c.stopPropagation();var d=c.target,e=d.parentElement,f=e.nextElementSibling.nextElementSibling,g=e.parentElement.id,h=a[g],i=0,j=null,k=0;for(k=0;k<e.childElementCount;k+=1)j=e.children[k],j.classList.remove(b.enabled),j.classList.add(b.disabled),h.tabs[k].classList.remove(b.enabled),h.tabs[k].classList.add(b.disabled),j===d&&(i=k);for(k=0;k<f.childElementCount;k+=1)j=f.children[k],j.classList.remove(b.display_none),h.contents[k].classList.remove(b.display_none),i!==k&&(j.classList.add(b.display_none),h.contents[k].classList.add(b.display_none));h.tabs[i].classList.remove(b.disabled),h.tabs[i].classList.add(b.enabled),c.target.classList.remove(b.disabled),c.target.classList.add(b.enabled),h.opts.on_tab_click&&h.opts.on_tab_click(i)},e=function(){console.log("WUI_RangeSlider 'create' failed, first argument not an id nor a DOM element.")};this.create=function(f,g){var h,i,j,k,l,m=document.createElement("div"),n={},o=0;if("string"==typeof f)h=document.getElementById(f);else{if("object"!=typeof f)return void e();if("string"!=typeof f.innerHTML)return void e();h=f,f=h.id}if(i=h.firstElementChild,j=i.nextElementSibling,k=i.children[0],void 0!==a[f])return void console.log("WUI_Tabs id '"+f+"' already created, aborting.");for(l in c)c.hasOwnProperty(l)&&(n[l]=c[l]);if(void 0!==g)for(l in g)g.hasOwnProperty(l)&&void 0!==c[l]&&(n[l]=g[l]);h.style.overflow="hidden",m.className="wui-tabs-underline",h.insertBefore(m,j),i.classList.add(b.tabs);var p=i.childElementCount,q=[];for(o=0;o<p;o+=1){var r=i.children[o];r.classList.add("wui-tab"),r!==k&&r.classList.add(b.disabled),r.addEventListener("click",d,!1),r.addEventListener("touchstart",d,!1),q.push(r)}k.classList.add(b.enabled),k.classList.add("wui-first-tab"),j.classList.add("wui-tabs-content");var s=j.childElementCount,t=[j.children[0]];for(j.style.height=n.height,j.children[0].classList.add(b.tab_content),o=1;o<s;o+=1){var u=j.children[o];u.classList.add(b.tab_content),u.classList.add(b.display_none),t.push(u)}return a[f]={element:h,tabs:q,contents:t,opts:n},f},this.getContentElement=function(a,b){var c=document.getElementById(a),d=c.firstElementChild.nextElementSibling.nextElementSibling;return d.children[b]},this.getTabName=function(a,b){var c=this.getContentElement(a,b);return c.getAttribute("data-group-name")},this.destroy=function(c){var d,e,f,g,h,i=a[c];if(void 0===i)return void console.log("Element id '"+c+"' is not a WUI_Tabs, destroying aborted.");if(d=i.element,d.classList.contains("wui-dialog-content"))for(e=d.getElementsByClassName(b.tabs),f=d.getElementsByClassName(b.underline),g=d.getElementsByClassName(b.tabs_content),h=0;h<e.length;h+=1)d.removeChild(e[h]),d.removeChild(f[h]),d.removeChild(g[h]);else d.parentElement.removeChild(d);delete a[c]}},WUI_ToolBar=new function(){"use strict";var a={},b={minimize_icon:"wui-toolbar-minimize-icon",maximize_icon:"wui-toolbar-maximize-icon",button:"wui-toolbar-button",minimize_group:"wui-toolbar-minimize-group",minimize_gr_v:"wui-toolbar-minimize-group-vertical",toggle:"wui-toolbar-toggle",toggle_on:"wui-toolbar-toggle-on",item:"wui-toolbar-item",group:"wui-toolbar-group",vertical_group:"wui-toolbar-group-vertical",tb:"wui-toolbar",dd_content:"wui-toolbar-dropdown-content",dd_item:"wui-toolbar-dropdown-item",dd_open:"wui-toolbar-dropdown-open"},c={item_hmargin:null,item_vmargin:null,item_width:32,item_height:32,icon_width:32,icon_height:32,allow_groups_minimize:!1,vertical:!1},d=function(b){var c=a[b];return void 0===c?("undefined"!=typeof console&&console.log('_getWidget failed, the element id "'+b+'" is not a WUI_ToolBar.'),null):c},e=function(a){var b=a.ownerDocument,c=a.getBoundingClientRect(),d=b.body,e=b.documentElement,f=b.defaultView||b.parentWindow,g=f.pageYOffset||e.scrollTop||d.scrollTop,h=f.pageXOffset||e.scrollLeft||d.scrollLeft,i=e.clientTop||d.clientTop||0,j=e.clientLeft||d.clientLeft||0,k=c.top+g-i,l=c.left+h-j;return{top:Math.round(k),left:Math.round(l)}},f=function(c,d){return void 0!==d?a[d]:c.classList.contains(b.tb)?a[c.id]:c.classList.contains(b.minimize_icon)||c.classList.contains(b.maximize_icon)||c.classList.contains(b.vertical_group)||c.classList.contains(b.group)?a[c.parentElement.id]:a[c.parentElement.parentElement.id]},g=function(a,b,c){if(void 0!==a.on_click&&null!==a.on_click){var d={id:a.id,type:b};void 0!==c&&(d.state=c),a.on_click(d)}},h=function(a,c,d){var e,f=a.createElement("div");if(void 0!==c.items)for(e=0;e<c.items.length;e+=1){var g=c.items[e],h=a.createElement("div");c.vertical||h.classList.add("wui-toolbar-dropdown-horizontal"),h.classList.add(b.dd_item),h.innerHTML=g.title,h.dataset.index=e,f.appendChild(h)}return f.addEventListener("click",j,!1),f.style.width=d.dd_items_width+"px",f.classList.add(b.dd_content),f.dataset.linkedto_tb=d.element.id,f.dataset.linkedto_tool_index=c.id,a.body.appendChild(f),f},i=function(a,c,d){var e,h,i,j=null,k=!1,l=0;j=f(a,c),h=j.element,a.parentElement&&a.parentElement.parentElement&&(h=a.parentElement.parentElement);var m=j.tools[parseInt(a.dataset.tool_id,10)];if("1"===m.element.dataset.on?(m.element.dataset.on=0,a.dataset.on=0,m.element.title=m.tooltip,a.title=m.tooltip,void 0!==m.icon&&(m.element.classList.add(m.icon),m.element.classList.remove(m.toggled_icon),a.classList.add(m.icon),a.classList.remove(m.toggled_icon))):(m.element.dataset.on=1,a.dataset.on=1,void 0!==m.tooltip_toggled&&(m.element.title=m.tooltip_toggled,a.title=m.tooltip_toggled),void 0!==m.toggled_icon&&(m.element.classList.add(m.toggled_icon),m.element.classList.remove(m.icon),a.classList.add(m.toggled_icon),a.classList.remove(m.icon)),k=!0),"none"!==m.toggled_style&&(a.classList.contains(b.toggle_on)?(m.element.classList.remove(b.toggle_on),a.classList.remove(b.toggle_on)):(m.element.classList.add(b.toggle_on),a.classList.add(b.toggle_on))),e=a.dataset.toggle_group,void 0!==e)for(i=h.getElementsByClassName(b.item),l=0;l<i.length;l+=1){var n=i[l],o=j.tools[parseInt(n.dataset.tool_id,10)];if(e===n.dataset.toggle_group&&n.dataset.tool_id!==a.dataset.tool_id){if("0"===n.dataset.on)continue;n.dataset.on="0",o.element.dataset.on="0",n.classList.remove(b.toggle_on),o.element.classList.remove(b.toggle_on),void 0!==m.toggled_icon&&(n.classList.remove(o.toggled_icon),o.element.classList.remove(o.toggled_icon)),void 0!==m.icon&&(n.classList.add(o.icon),o.element.classList.add(o.icon)),(d||void 0===d)&&g(o,"toggle",!1)}}d!==!0&&void 0!==d||g(m,"toggle",k)},j=function(c){c.preventDefault(),c.stopPropagation();var d=c.target,e=d.ownerDocument,f=d.parentElement,g=a[f.dataset.linkedto_tb],h=parseInt(f.dataset.linkedto_tool_index,10),i=g.tools[h],j=parseInt(d.dataset.index,10),l=i.items[j],m=e.getElementById(f.dataset.linkedto_tb),n=m.getElementsByClassName(b.item),o=n[h];void 0!==l.on_click&&(l.on_click(),o.classList.remove(b.toggle_on),i.element.classList.remove(b.toggle_on),k(i,o))},k=function(a,c){var d,e,f=c.ownerDocument,g=f.body.getElementsByClassName(b.dd_content);for(e=0;e<g.length;e+=1)d=g[e],d.removeEventListener("click",j,!1),d.parentElement.removeChild(d);a.element.classList.remove(b.toggle_on),c.classList.remove(b.toggle_on)},l=function(a,b){var c=function(){var d=b.ownerDocument,e=d.defaultView||d.parentWindow;k(a,b),e.removeEventListener("click",c)};return c},m=function(a){a.preventDefault(),a.stopPropagation();var c=a.target;if(c.classList.contains(b.minimize_group)||c.classList.contains(b.minimize_gr_v))return void n(c);if(c.classList.contains(b.toggle))return void i(c);if(!(c.classList.contains(b.tb)||c.classList.contains(b.group)||c.classList.contains(b.vertical_group))){var d=null,j=null,m=null,o=null,p=c.ownerDocument,q=p.defaultView||p.parentWindow;if(o=f(c),d=o.tools[c.dataset.tool_id],"dropdown"===d.type){if(c.classList.contains(b.toggle_on))return void k(d,c);j=h(p,d,o);var r=d.element;c.classList.add(b.toggle_on),r.classList.add(b.toggle_on),m=e(c),"tb_item"===d.dd_items_width&&(j.style.width=c.offsetWidth+"px"),"s"===d.orientation?(j.style.top=m.top+c.offsetHeight+"px",j.style.left=m.left+"px"):"sw"===d.orientation?(j.style.top=m.top+c.offsetHeight+"px",j.style.left=m.left-j.offsetWidth+"px"):"nw"===d.orientation?(j.style.top=m.top-j.offsetHeight+c.offsetHeight+"px",j.style.left=m.left-j.offsetWidth+"px"):"se"===d.orientation?(j.style.top=m.top+c.offsetHeight+"px",j.style.left=m.left+c.offsetWidth+"px"):"ne"===d.orientation?(j.style.top=m.top-j.offsetHeight+c.offsetHeight+"px",j.style.left=m.left+c.offsetWidth+"px"):(j.style.top=m.top-j.offsetHeight+"px",j.style.left=m.left+"px"),j.classList.add(b.dd_open),a.stopPropagation&&a.stopPropagation(),q.addEventListener("click",l(d,c),!1)}else g(d,"click")}},n=function(a){var c=a.nextSibling;a.classList.contains(b.minimize_icon)?(a.classList.add(b.maximize_icon),a.classList.remove(b.minimize_icon),a.title="Maximize group",c.style.display="none"):(a.classList.add(b.minimize_icon),a.classList.remove(b.maximize_icon),a.title="Minimize group",c.style.display="")},o=function(){console.log("WUI_RangeSlider 'create' failed, first argument not an id nor a DOM element.")};this.create=function(d,e,g){var h,j,k=null,l=null,n=null,p=null,q={};if("string"==typeof d)h=document.getElementById(d);else{if("object"!=typeof d)return void o();if("string"!=typeof d.innerHTML)return void o();h=d,d=h.id}if(void 0!==a[d])return void console.log("WUI_Toolbar id '"+d+"' already created, aborting.");for(j in c)c.hasOwnProperty(j)&&(q[j]=c[j]);if(void 0!==e)for(j in e)e.hasOwnProperty(j)&&void 0!==c[j]&&(q[j]=e[j]);a[d]={element:h,tools:[],opts:q},h.classList.add(b.tb);var r=b.group,s=b.item,t="wui-toolbar-spacer",u=b.minimize_group;q.vertical?(h.classList.add("wui-toolbar-vertical"),r=b.vertical_group,s+=" wui-toolbar-item-vertical",t="wui-toolbar-spacer-vertical",u=b.minimize_gr_v,h.style.maxWidth=q.item_width+4+"px",null===q.item_hmargin&&(q.item_hmargin=3),null===q.item_vmargin&&(q.item_vmargin=8)):(h.style.maxHeight=q.item_height+4+"px",null===q.item_hmargin&&(q.item_hmargin=3),null===q.item_vmargin&&(q.item_vmargin=0)),u=b.button+" "+b.minimize_icon+" "+u,h.addEventListener("click",m,!1);var v;for(n in g)if(g.hasOwnProperty(n)){null!==p&&(l=document.createElement("div"),l.className=t,h.appendChild(l)),q.allow_groups_minimize&&(l=document.createElement("div"),l.className=u,l.title="Minimize group",h.appendChild(l)),k=g[n];var w=document.createElement("div");for(w.className=r,q.vertical?w.style.maxWidth=q.item_width+"px":w.style.maxHeight=q.item_height+"px",v=0;v<k.length;v+=1){var x,y=k[v],z=document.createElement("div"),A=a[d].tools.length,B={element:z,on_click:y.on_click,on_rclick:y.on_rclick,icon:y.icon,items:[],tooltip:"",type:y.type,dd_items_width:y.dropdown_items_width,orientation:y.orientation,id:A};if(B.on_rclick&&z.addEventListener("contextmenu",function(a){var b=f(a.target),c=b.tools[a.target.dataset.tool_id];a.preventDefault(),c.on_rclick()}),z.className=s,z.style.minWidth=q.item_width+"px",z.style.minHeight=q.item_height+"px",z.style.marginLeft=q.item_hmargin+"px",z.style.marginRight=q.item_hmargin+"px",z.style.marginTop=q.item_vmargin+"px",z.style.marginBottom=q.item_vmargin+"px",z.style.backgroundSize=q.icon_width-4+"px "+(q.icon_height-4)+"px",w.appendChild(z),a[d].tools.push(B),z.dataset.tool_id=A,B.tooltip=y.tooltip,void 0!==y.tooltip&&(z.title=y.tooltip),void 0!==y.text&&(z.innerHTML=y.text,z.style.lineHeight=q.item_height+"px",z.classList.add("wui-toolbar-text"),void 0!==y.icon&&(z.style.paddingLeft=q.icon_width+2+"px",z.style.backgroundPosition="left center")),void 0!==y.icon&&z.classList.add(y.icon),"toggle"===y.type)z.classList.add(b.toggle),B.toggled_icon=y.toggled_icon,B.tooltip_toggled=y.tooltip_toggled,B.toggled_style=y.toggled_style,void 0!==y.toggle_group&&(z.dataset.toggle_group=y.toggle_group),y.toggle_state&&(z.dataset.on="1");else if("dropdown"===y.type){if(z.classList.add(b.button),void 0!==y.items)for(x=0;x<y.items.length;x+=1){var C=y.items[x];B.items.push({title:C.title,on_click:C.on_click})}}else z.classList.add(b.button)}h.appendChild(w),p=k}var D=h.getElementsByClassName(b.item);for(v=0;v<D.length;v+=1){var E=D[v];"1"===E.dataset.on&&(E.dataset.on="0",i(E,d,!0))}return d},this.hideGroup=function(a,c){var e,f,g,h=d(a);if(h){if(e=h.element.getElementsByClassName(h.opts.vertical?b.vertical_group:b.group),0===e.length)return;f=e[c],g=f.previousElementSibling,(g.classList.contains(b.minimize_group)||g.classList.contains(b.minimize_gr_v))&&(g.style.display="none"),f.style.display="none"}},this.showGroup=function(a,c){var e,f,g,h=d(a);if(h){if(e=h.element.getElementsByClassName(h.opts.vertical?b.vertical_group:b.group),0===e.length)return;f=e[c],g=f.previousElementSibling,(g.classList.contains(b.minimize_group)||g.classList.contains(b.minimize_gr_v))&&(g.style.display=""),e[c].style.display=""}},this.toggle=function(a,b,c){var e=d(a);e&&i(e.tools[b].element,a,c)},this.getItemElement=function(a,b){var c=d(a);if(c)return c.tools[b].element},this.destroy=function(b){var c,d,e,f,g,h,i,j=a[b];if(void 0===j)return void console.log("Element id '"+b+"' is not a WUI_ToolBar, destroying aborted.");for(c=j.toolbar,d=j.tools,c.parentElement.removeChild(c),i=0;i<d.length;i+=1)e=d[i],"dropdown"===e.type&&(f=e.items,f.length>0&&(g=f[0],h=g.element,h.parentElement.removeChild(h)));delete a[b]}},WUI_CircularMenu=new function(){"use strict";var a=[],b=0,c={item:"wui-circularmenu-item",show:"wui-circularmenu-show",content:"wui-circularmenu-content"},d={x:null,y:null,rx:64,ry:48,angle:0,item_width:32,item_height:32,window:null,element:null},e=function(b){var c,d;for(d=0;d<a.length;d+=1)c=a[d],b.body.contains(c)&&b.body.removeChild(c)},f=function(a,d){var f=function(g){g.preventDefault();var h=(new Date).getTime();h-b<=500||g.target.classList.contains(c.item)||(e(d),a.removeEventListener("mousedown",f))};return f},g=function(a,b,c){var d=function(d){d.preventDefault(),c(),e(b),a.removeEventListener("mousedown",f(a,b))};return d},h=function(a){var b=a.getBoundingClientRect(),c=document.body,d=document.documentElement,e=window.pageYOffset||d.scrollTop||c.scrollTop,f=window.pageXOffset||d.scrollLeft||c.scrollLeft,g=d.clientTop||c.clientTop||0,h=d.clientLeft||c.clientLeft||0,i=b.top+e-g,j=b.left+f-h;return{top:Math.round(i),left:Math.round(j),width:b.width,height:b.height}},i=function(a){return a*(Math.PI/180)},j=function(d,h,j,k,l,m){e(k);var n,o,p,q,r,s=-(Math.PI/2)+i(d.angle),t=h.length,u=2*Math.PI/t;for(q=0;q<t;q+=1)p=h[q],n=document.createElement("div"),n.classList.add(c.item),n.style.width=d.item_width+"px",n.style.height=d.item_height+"px",n.style.backgroundSize=d.item_width-4+"px "+(d.item_height-4)+"px",n.style.left=l+d.rx*Math.cos(s)+"px",n.style.top=m+d.ry*Math.sin(s)+"px",n.classList.add(p.icon),p.tooltip&&(n.title=p.tooltip),p.content&&(o=document.createElement("div"),o.style.width=d.item_width+"px",o.style.height=d.item_height+"px",o.classList.add(c.content),o.innerHTML=p.content,n.appendChild(o)),k.body.appendChild(n),j.getComputedStyle(n).width,a.push(n),p.on_click&&n.addEventListener("click",g(j,k,p.on_click)),n.classList.add(c.show),s+=u;r=f(j,k),b=(new Date).getTime(),j.addEventListener("mousedown",r)};this.create=function(a,b){var c,e,f,g,i,k={},l=document,m=window;for(c in d)d.hasOwnProperty(c)&&(k[c]=d[c]);if(void 0!==a)for(c in a)a.hasOwnProperty(c)&&void 0!==d[c]&&(k[c]=a[c]);g=k.element,null!==g?(i=h(g),l=g.ownerDocument,m=l.defaultView||l.parentWindow,e=i.left+(i.width-k.item_width)/2,f=i.top+(i.height-k.item_height)/2,j(k,b,m,l,e,f)):null!==e&&null!==f&&(null!==k.window&&(m=k.window,l=m.document),e=k.x-k.item_width/2,f=k.y-k.item_height/2,j(k,b,m,l,e,f))}},WUI=new function(){"use strict";var a={display_none:"wui-display-none",hide_fi_500:"wui-hide-fi-500",hide_show_500:"wui-show-fi-500",draggable:"wui-draggable"},b=[],c=null,d=null,e=null,f=0,g=0,h=function(b,c,d){var e=function(){d&&b.classList.add(a.display_none),c&&c(),b.removeEventListener("transitionend",e)};return e},i=function(h){h.preventDefault();var i,l=h.clientX,m=h.clientY,n=h.changedTouches;if(h.target.classList.contains(a.draggable)){if(null===c)if(n)e=n[0].identifier,l=n[0].clientX,m=n[0].clientY;else if(0!==h.button)return;i=b[parseInt(h.target.dataset.wui_draggable_id,10)],c=void 0!==i.target_element?i.target_element:h.target,d=parseInt(c.dataset.wui_draggable_id,10),document.body.style.cursor="move",i.virtual?(i=b[d],f=l-parseInt(i.x,10),g=m-parseInt(i.y,10)):(f=l-parseInt(c.style.left,10),g=m-parseInt(c.style.top,10)),window.addEventListener("mousemove",j,!1),window.addEventListener("touchmove",j,!1),window.addEventListener("mouseup",k,!1),window.addEventListener("touchend",k,!1)}},j=function(a){a.preventDefault();var h,i=a.clientX,j=a.clientY,k=a.changedTouches,l=null,m=b[d],n=m.x,o=m.y;if(k)for(h=0;h<k.length;h+=1)if(l=k[h],l.identifier===e){i=k[h].clientX,j=k[h].clientY;break}0!==m.axisLock&&(n=i-f,m.virtual||(c.style.left=n+"px"),m.x=n),1!==m.axisLock&&(o=j-g,m.virtual||(c.style.top=o+"px"),m.y=o),m&&void 0!==m.cb&&m.cb(c,n,o)},k=function(a){a.preventDefault();var d,f=a.changedTouches,g=null;if(0!==b.length)if(f){for(d=0;d<f.length;d+=1)if(g=f[d],g.identifier===e){c=null,document.body.style.cursor="default",window.removeEventListener("touchmove",j,!1),window.removeEventListener("touchend",k,!1);break}}else c=null,document.body.style.cursor="default",window.removeEventListener("mousemove",j,!1),window.removeEventListener("mouseup",k,!1)};this.fadeOut=function(b,c,d,e){var f;void 0!==c&&null!==c||(c=500),f="visibility 0s ease-in-out "+c+"ms, opacity "+c+"ms ease-in-out",void 0===b.style.WebkitTransition?b.style.transition=f:b.style.WebkitTransition=f,b.addEventListener("transitionend",h(b,d,e),!1),b.classList.add(a.hide_fi_500),b.classList.remove(a.hide_show_500)},this.fadeIn=function(b,c){var d;void 0!==c&&null!==c||(c=500),d="visibility 0s ease-in-out 0s, opacity "+c+"ms ease-in-out",void 0===b.style.WebkitTransition?b.style.transition=d:b.style.WebkitTransition=d,b.classList.remove(a.hide_fi_500),b.classList.add(a.hide_show_500),b.classList.remove(a.display_none)},this.draggable=function(c,d,e,f){c.classList.contains(a.draggable)||(c.classList.add(a.draggable),c.addEventListener("mousedown",i,!1),c.addEventListener("touchstart",i,!1),c.dataset.wui_draggable_id=b.length,b.push({cb:d,element:c,target_element:f,axisLock:null,virtual:e,x:parseInt(c.style.left,10),y:parseInt(c.style.top,10)}))},this.undraggable=function(c){if(c.classList.contains(a.draggable)){c.classList.remove(a.draggable),c.removeEventListener("mousedown",i,!1),c.removeEventListener("touchstart",i,!1);var d,e=parseInt(c.dataset.wui_draggable_id,10);for(b.splice(e,1),d=0;d<b.length;d+=1){var f=b[d];f.element.dataset.wui_draggable_id=d}}},this.lockDraggable=function(c,d){if(c.classList.contains(a.draggable)){var e=b[parseInt(c.dataset.wui_draggable_id,10)];e.axisLock="x"===d?0:"y"===d?1:null}}};
var SPlayer = new (function() {
    "use strict";

    /***********************************************************
        Globals.
    ************************************************************/
    
    window.requestAnimationFrame =  window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    /***********************************************************
        Fields.
    ************************************************************/

    var _uid = 0,
        
        _render_jobs = [],
        _render_jobs_curr = 0,
        _render_timeout = null,
    
        _players = [],
        
        _selected_player = null,
        
        _known_options = {
            width: 400,
            height: 200,
            
            octaves: 10,
            baseFrequency: 16.34,
            
            gainBarSideMargin: 1,
            gainContainerWidth: 16,
            gainContainerHeight: 12,
            gainLevel: 1,
            gainLevels: 3,
            
            acceptDrop: true,
            acceptDownload: true,
            
            sps: 60,
            
            gain: 1.5,
            gainMultiplier: 0.5,
            
            backgroundColor: "#000000" // or "transparent"
        },
        
        _css = {
            hook_class: "hplayer",
            loader_class: "sloader",
            marker_class: "smarker",
            past_marker_class: "smarker-past",
            main_class: "splayer",
            gain_class: "sgain",
            gain_bar_class: "sgain-bar",
            gain_unused_bar_class: "sgain-unused-bar",
            toolbar_class: "stoolbar",
            osd_class: "sosd"
        },
        
        _failure = false,
        
        _options = {},
        
        _raf;

    /***********************************************************
        Includes.
    ************************************************************/
    
/***********************************************************
    Fields.
************************************************************/

window.AudioContext = window.AudioContext || window.webkitAudioContext || false;

var _audio_ctx = new window.AudioContext(),
    
    _audio_gain_node,
    
    _audio_convolver_node,
    
    _stop_timeout = null,
    
    _notes_renderer = new Worker("dist/worker/notes_renderer.js"),
    _audio_renderer = new Worker("dist/worker/audio_renderer.js"),
    _audio_recorder = new Worker("dist/worker/recorder.js");

/***********************************************************
    Functions.
************************************************************/

var _audioGetData = function (uid, data, width, height, options) {
    _notes_renderer.postMessage({
            uid: uid,
            data: data,
            width: width,
            height: height,
            options: options
        }, [data.buffer]);
};

var _audioCreateGainNode = function (context, gain, dst) {
    var gain_node = context.createGain();
    gain_node.gain.value = gain;
    gain_node.connect(dst);

    return gain_node;
};

var _audioSetGain = function (audio_gain_node, gain) {
    audio_gain_node.gain.value = gain;
};

var _audioGetGainNode = function (gain) {
    return _audioCreateGainNode(_audio_ctx, gain, _audio_convolver_node);
};

var _audioCreateBufferSource = function (audio_gain_node, buffer) {
    var bs = _audio_ctx.createBufferSource();
    
    if (buffer) {
        bs.buffer = buffer;
    } else {
        bs.buffer = null;
    }
    
    //bs.connect(_audio_gain_node);
    //bs.connect(_audio_convolver_node);  
    bs.connect(audio_gain_node);
    
    return bs;
};

var _audioGetTime = function () {
    return _audio_ctx.currentTime;
};

var _audioPlay = function (audio_buffer_node, audio_gain_node, gain, offset, onended) {
    if (audio_buffer_node.buffer) {
        audio_buffer_node.onended = onended;
        
        audio_gain_node.gain.cancelScheduledValues(_audio_ctx.currentTime);
    
        audio_buffer_node.start(0, offset);
        
        audio_gain_node.gain.exponentialRampToValueAtTime(gain, _audio_ctx.currentTime + 0.005);
        
        return _audio_ctx.currentTime;
    }
    
    return null;
};

var _audioStopCb = function (buffer_node, end_time) {
    return function () {
        if (_audio_ctx.currentTime > end_time) {
            buffer_node.stop();
            buffer_node.stopped = true;
        } else {
            setTimeout(_audioStopCb(buffer_node, end_time), 100);
        }
    };
};

var _getExpEndTime = function (start, target, t_start) {
    var diff = Math.log(target) - Math.log(start),
        time = (10 / Math.log(0.00001) * diff);

    return t_start + time;
};

var _audioStop = function (audio_buffer_node, audio_gain_node, untrigger_onended) {
    var stop_time;
    
    if (untrigger_onended) {
        audio_buffer_node.onended = null;
    }
    
    if (audio_buffer_node.buffer) {
        stop_time = _audio_ctx.currentTime + 0.005;
        
        //audio_buffer_node.stop();
        audio_gain_node.gain.cancelScheduledValues(_audio_ctx.currentTime);
        audio_gain_node.gain.exponentialRampToValueAtTime(0.00001, stop_time);
        
        setTimeout(_audioStopCb(audio_buffer_node, stop_time), 100);
    }
    
    return _audio_ctx.currentTime;
};

var _audioCreateImpulse = function (context, options) {
    var rate = context.sampleRate,
        length = rate * options.seconds,
        decay = options.decay,
        impulse = context.createBuffer(2, length, rate),
        impulseL = impulse.getChannelData(0),
        impulseR = impulse.getChannelData(1),
        n, i;

    for (i = 0; i < length; i++) {
        n = options.reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    
    return impulse;
};

var _audioCreateConvolver = function (context, dst, options) {
    var convolver_node = context.createConvolver();
    
    convolver_node.buffer = _audioCreateImpulse(context, options);
    
    convolver_node.connect(dst);
    
    return convolver_node;
};

var _audioRecordToWav = function (audio_buffer_node, filename) {
    if (!audio_buffer_node.buffer) {
        return;
    }
    
    if (!filename) {
        filename = "output";
    }
    
    _audio_recorder.postMessage({
        command: 'record',
        buffer: [
                audio_buffer_node.buffer.getChannelData(0), 
                audio_buffer_node.buffer.getChannelData(1)
            ]
        });  
    
    _audio_recorder.postMessage({
            command: 'exportWAV',
            type: 'audio/wav',
            filename: filename
        });
};

/***********************************************************
    Initialization.
************************************************************/

var _audioInit = function () {
    _audio_recorder.postMessage({
            command: 'init',
            config: {
                sampleRate: _audio_ctx.sampleRate,
                numChannels: 2,
                gain: _options.gain
            }
        });
    
    _audio_recorder.onmessage = function (e) {
        var wav_blob = e.data.blob,
            
            file = new File([wav_blob], e.data.filename + ".wav", {
                    type: "audio/wav"
                });
        
        saveAs(file);
        
        _audio_recorder.postMessage({
                command: 'clear'
            });
    };
    
    _audio_gain_node = _audioCreateGainNode(_audio_ctx, 1.0, _audio_ctx.destination);
    
    _audio_convolver_node = _audioCreateConvolver(_audio_ctx, _audio_gain_node, {
            seconds: 0.08,
            decay: 1.0,
            reverse: false
        });
    
    _notes_renderer.addEventListener("message", function (m) {
            var w = m.data;
        
            w.sample_rate = _audio_ctx.sampleRate;
        
            _audio_renderer.postMessage(w);
        }, false);
    
    _audio_renderer.addEventListener("message", function (m) {
            var w = m.data,
                
                data_l = new Float32Array(w.data_l),
                data_r = new Float32Array(w.data_r),
                
                audio_buffer;

            audio_buffer = _audio_ctx.createBuffer(2, w.length, _audio_ctx.sampleRate);
        
            audio_buffer.copyToChannel(data_l, 0, 0);
            audio_buffer.copyToChannel(data_r, 1, 0);
        
            _updateAudioBufferFinal(w.uid, audio_buffer, Math.max(w.avg_l, w.avg_r));
        }, false);
};if (!window.AudioContext) {
    _fail("The Web Audio API is not available, please use a Web Audio capable browser.");
}

if (typeof(Worker) === "undefined") {
    _fail("Web Workers are not available, please use a web browser with Web Workers support.");
}

if (!window.FileReader) { 
    _fail("The FileReader API is not available, please use a FileReader capable browser.");
}
    /***********************************************************
        Functions.
    ************************************************************/
    
    var _fail = function (message) {
        _failure = true;
    };
    
    var _truncateDecimals = function (num, digits) {
        var n = (+num).toFixed(digits + 1);
        return +(n.slice(0, n.length - 1));
    };
    
    var _getElementOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            body = document.body,
            docEl = document.documentElement,

            scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
            scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,

            clientTop = docEl.clientTop || body.clientTop || 0,
            clientLeft = docEl.clientLeft || body.clientLeft || 0,

            top  = box.top +  scrollTop - clientTop,
            left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left), width: box.width, height: box.height };
    };
    
    var _getPlayerFromUID = function (uid) {
        var i = 0;
        for (i = 0; i < _players.length; i += 1) {
            if (_players[i].id === uid) {
                return _players[i];
            }
        }
    };
    
    var _updateOsd = function (player, current) {
        if (current) {
            player.osd_div.innerHTML = _truncateDecimals(current, 1) + "/" + _truncateDecimals(player.audio_buffer.duration, 1) + "s";
        } else {
            player.osd_div.innerHTML = _truncateDecimals(player.audio_buffer.duration, 1) + "s";
        }
    };
    
    var _updateAudioBufferFinal = function (uid, buffer, gain_level) {
        var player = _getPlayerFromUID(uid);
        
        player.audio_buffer = buffer;
        
        player.audio_buffer_source = _audioCreateBufferSource(player.audio_gain_node, player.audio_buffer);
        
        if (player.spinner_div.parentNode === player.div) {
            player.div.removeChild(player.spinner_div);
            player.div.removeChild(player.spinner.el);
        }

        // do something with computed average volume
        
        _updateOsd(player);
        
        _render_jobs_curr -= 1;
        if (_render_jobs_curr < 0) {
            clearTimeout(_render_timeout);
        }
    };
    
    var _updateAudioBuffer = function (player) {
        player.audio_buffer_source = _audioCreateBufferSource(player.audio_gain_node, player.audio_buffer);
    };
    
    var _getImageAsBlob = function (image_element, blob_cb) {
        var tmp_canvas = document.createElement('canvas'),
            tmp_canvas_ctx = tmp_canvas.getContext('2d');

        tmp_canvas.width  = image_element.width;
        tmp_canvas.height = image_element.height;

        tmp_canvas_ctx.fillStyle = "#000000";
        tmp_canvas_ctx.fillRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        tmp_canvas_ctx.drawImage(image_element, 0, 0);
        
        tmp_canvas.toBlob(blob_cb, "image/png");
    }
    
    var _getImageData = function (image_element) {
        var tmp_canvas = document.createElement('canvas'),
            tmp_canvas_ctx = tmp_canvas.getContext('2d');

        tmp_canvas.width  = image_element.width;
        tmp_canvas.height = image_element.height;

        tmp_canvas_ctx.fillStyle = "#000000";
        tmp_canvas_ctx.fillRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        tmp_canvas_ctx.drawImage(image_element, 0, 0);
        
        return tmp_canvas_ctx.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height).data;
    };
    
    var _onPlaybackEnd = function (player) {
        return function () {
                _updateAudioBuffer(player);
            
                player.audio_buffer_source.loop = player.audio_loop;
            
                if (player.stopped) {
                    _hideMarker(player);
                }
            
                player.paused = true;
                player.stopped = true;
            
                if (!player.audio_loop) {
                    WUI_ToolBar.toggle(player.toolbar, 0, false);
                } 
            };
    };
    
    var _frame = function (raf_time) {
        var i = 0,
            t = 0,
            p = 0,
            v,
            player;
        
        for (i = 0; i < _players.length; i += 1) {
            player = _players[i];
            
            if (!player.stopped && !player.paused) {
                t = _audioGetTime() - player.audio_started_at;
                
                p = t / player.audio_buffer.duration;
                
                v = Math.round(_known_options.width * p) + "px";

                player.marker_div.style.left = v;
                
                player.past_marker_div.style.width = v;
                
                _updateOsd(player, t);
            }
        }
        
        _raf = window.requestAnimationFrame(_frame);
    };
    
    var _displayMarker = function (player) {
        player.marker_div.style.display = "";
        player.past_marker_div.style.display = "";
    }
    
    var _hideMarker = function (player) {
        if (player.marker_div.style.display === "" && 
           player.past_marker_div.style.display === "") {
            player.marker_div.style.display = "none";
            player.past_marker_div.style.display = "none";
        }
    }
    
    var _play = function (player, pos) {
        var current_time = 0,
            position = pos;
        
        if (player.paused) {
            if (position === undefined) {
                position = player.audio_paused_at;
            }
            
            current_time = _audioPlay(player.audio_buffer_source, player.audio_gain_node, _getGain(player), position, _onPlaybackEnd(player));
            if (current_time !== null) {
                player.paused = false;
                player.stopped = false;
                player.audio_started_at = current_time - position;
                player.audio_paused_at = 0;
                
                player.marker_div.style.left = "0";
            }
            
            _displayMarker(player);
        }
    };
    
    var _pause = function (player) {
        if (!player.paused) {
            player.audio_paused_at = _audioStop(player.audio_buffer_source, player.audio_gain_node) - player.audio_started_at;
        }
    };
    
    var _stop = function (player, no_update, untrigger_end_event) {
        player.audio_paused_at = 0;
        
        if (!no_update) {
            _hideMarker(player);
            _updateOsd(player);
        }
        
        if (player.stopped) {
            return;
        }
        
        _audioStop(player.audio_buffer_source, player.audio_gain_node, untrigger_end_event);
        
        player.stopped = true;
    };
    
    var _setPlayPosition = function (player, percent) {
        if (player.audio_buffer) {
            _stop(player, true, true);
            
            _updateAudioBuffer(player);
            
            player.paused = true;
            
            _play(player, player.audio_buffer.duration * percent);
            
            _updateOsd(player);
        }
    };
    
    var _getTbPlayCb = function (player) {
        return function (toggle_ev) {
            if (player.div === player.spinner_div.parentNode) { // loading stuff
                WUI_ToolBar.toggle(player.toolbar, 0, false);
                
                return;   
            }
            
            if (toggle_ev.state) {
                if (!player.audio_buffer) {
                    WUI_ToolBar.toggle(player.toolbar, 0, false);
                    
                    return;
                }
                
                _play(player);
            } else {
                _pause(player);
                
                WUI_ToolBar.toggle(player.toolbar, 0, false);
            }
        };
    };
    
    var _getTbStopCb = function (player) {
        return function () {
            if (player.div === player.spinner_div.parentNode) { // loading stuff
                return;   
            }
            
            if (!player.audio_buffer) {
                return;
            }
            
            _stop(player);
            
            if (!player.stopped) {
                WUI_ToolBar.toggle(player.toolbar, 0, false);
            }
        };
    };
    
    var _getTbLoopCb = function (player) {
        return function (toggle_ev) {
            player.audio_loop = toggle_ev;
            player.audio_buffer_source.loop = player.audio_loop;
        };
    };
    
    var _getTbDownloadCb = function (player) {
        return function () {
            _audioRecordToWav(player.audio_buffer_source, player.filename);
        };
    };
    
    var _downloadImageBlob = function (player) {
        return function (blob) {
                var file = new File([blob], player.filename + ".png", {
                        type: "image/png"
                    });
            
                saveAs(file);
            };
    };
    
    var _getTbDownloadImageCb = function (player) {
        return function () {
            _getImageAsBlob(player.image, _downloadImageBlob(player));
        };
    };
    
    var _fillBackground = function (player) {
        var canvas = player.canvas,
            ctx = player.canvas_ctx,
            options = player.options;
        
        if (options.backgroundColor === "transparent") {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    var _drawUpdate = function (player) {
        var canvas = player.canvas,
            ctx = player.canvas_ctx,
            options = player.options;
        
        ctx.globalCompositeOperation = "source-over";
        
        _fillBackground(player);

        if (player.magnify) {
            ctx.globalCompositeOperation = "lighter";
            ctx.drawImage(player.image, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(player.image, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(player.image, 0, 0, canvas.width, canvas.height);
        } else { 
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(player.image, 0, 0, canvas.width, canvas.height);
        }
    };
    
    var _getTbMagnifyCb = function (player) {
        return function (toggle_ev) {
            player.magnify = toggle_ev.state;
            
            _drawUpdate(player);
        };  
    };
    
    var _buildToolbar = function (player) {
        var div = player.div,
            uid = player.uid,
            
            toolbar,
            
            toolbar_div = document.createElement("div");
        
        div.appendChild(toolbar_div);
        
        toolbar_div.id = "t" + div.id;
        
        toolbar = WUI_ToolBar.create(toolbar_div, {
                    allow_groups_minimize: false,
                    icon_width: 24,
                    icon_height: 24,
                    item_width: 28,
                    item_height: 28,
                    item_hmargin: 2
                },
                {
                    transport: [
                        {
                            icon: "sp-play-icon",
                            toggled_icon: "sp-pause-icon",
                            type: "toggle",
                            on_click: _getTbPlayCb(player),
                            tooltip: "play",
                            tooltip_toggled: "pause"
                        },
                        {
                            icon: "sp-stop-icon",
                            on_click: _getTbStopCb(player),
                            tooltip: "stop"
                        }/*,
                        {
                            icon: "sp-loop-icon",
                            type: "toggle",
                            on_click: _getTbLoopCb(player),
                            tooltip: "loop"
                        }*/
                    ],
                    tools: [
                        {
                            icon: "sp-magnify-icon",
                            on_click: _getTbMagnifyCb(player),
                            tooltip: "magnify",
                            type: "toggle",
                        }
                    ],
                    acts: [
                        {
                            icon: "sp-image-icon",
                            on_click: _getTbDownloadImageCb(player),
                            tooltip: "download as a .png file"
                        },
                        {
                            icon: "sp-download-icon",
                            on_click: _getTbDownloadCb(player),
                            tooltip: "download as a .wav file"
                        }
                    ]
                });
        
        toolbar_div.classList.add(_css.toolbar_class);
        
        player.toolbar = toolbar;
        player.toolbar_div = toolbar_div;
    };
    
    var _renderWatch = function () {
        var concurrency = navigator.hardwareConcurrency,
            render_job;
        
        if (!concurrency) {
            concurrency = 1;
        }

        if (_render_jobs_curr >= concurrency) {
            clearTimeout(_render_timeout);
            _render_timeout = setTimeout(_renderWatch, 1000);
            
            return;
        }
        
        render_job = _render_jobs.shift();

        if (render_job) {
            _audioGetData(render_job.uid, _getImageData(render_job.image), render_job.image.naturalWidth, render_job.image.naturalHeight, render_job.options);

            _render_jobs_curr += 1;

            clearTimeout(_render_timeout);
            _render_timeout = setTimeout(_renderWatch, 1000);
        }
    };
    
    var _addRenderJob = function (uid, image, options) {
        var player = _getPlayerFromUID(uid);
        
        if (player.div.parentNode !== player.spinner) {
            player.div.appendChild(player.spinner_div);
            player.div.appendChild(player.spinner.el);
        }
        
        _render_jobs.push({
                uid: uid,
                image: image,
                options: options
            });

        clearTimeout(_render_timeout);
        _render_timeout = setTimeout(_renderWatch, 100);
    };
    
    var _mouseMoveEvent = function (ev) {
        var x = 0,
            y = 0,
            
            box;
        
        if (_selected_player) {
            box = _getElementOffset(_selected_player.div);
            
            x = Math.max(Math.min(ev.clientX - box.left, _selected_player.options.width), 0.);
            
            _setPlayPosition(_selected_player, x / _selected_player.options.width);
        }
    };
    
    var _getMdEvent = function (uid) {
        return function (ev) {
            var target = ev.target,
                player,
                box,
                x;
            
            if (ev.button !== 0) {
                return;
            }

            if (target.tagName !== "CANVAS" &&
               !target.classList.contains("smarker-past")) {
                return;
            }
            
            if (_selected_player) {
                return;
            }
            
            player = _getPlayerFromUID(uid);
            
            box = _getElementOffset(player.div);
            
            _selected_player = player;
            
            _selected_player.div.addEventListener("mousemove", _mouseMoveEvent);
            
            WUI_ToolBar.toggle(player.toolbar, 0, true);
            
            x = ev.clientX - box.left

            _setPlayPosition(_selected_player, x / _selected_player.options.width);
        };
    };
    
    var _getMuEvent = function () {
        return function (ev) {
            if (_selected_player) {
                _selected_player.div.removeEventListener("mousemove", _mouseMoveEvent);
            }
            
            _selected_player = null;
        };
    };
    
    var _getGain = function (player) {
        return player.options.gain * (1.0 + player.options.gainMultiplier * (player.audio_gain_level - 1));  
    };
    
    var _getGainDivClickEvent = function (uid) {
        return function (ev) {
            var player = _getPlayerFromUID(uid),
                
                i;
            
            player.audio_gain_level += 1;
            player.audio_gain_level %= (player.options.gainLevels + 1);
            
            if (player.audio_gain_level === 0) {
                player.audio_gain_level += 1;
            }
            
            for (i = 0; i < player.options.gainLevels; i += 1) {
                if (i >= player.audio_gain_level) {
                    player.gains_div_arr[i].classList.add(_css.gain_unused_bar_class);
                } else {
                    player.gains_div_arr[i].classList.remove(_css.gain_unused_bar_class);
                }
            }

            _audioSetGain(player.audio_gain_node, _getGain(player));
        };
    };
    
    var _cancelEvent = function (ev) {
        ev.preventDefault();
        
        return false;
    };
    
    var _getImageOnLoadEvent = function (player) {
        return function () {
            var img = this;
            
            _addRenderJob(player.id, img, player.options);
            
            player.image = img;

            _drawUpdate(player);
/*
            _imageDataToInput(tmp_image_data);
*/
            img.onload = null;
        };
    };
    
    var _loadImageFromFile = function (player, file) {
        var img = new Image(),

            tmp_canvas = document.createElement('canvas'),
            tmp_canvas_context = tmp_canvas.getContext('2d'),

            tmp_image_data;
        
        _getTbStopCb(player)();
        
        img.onload = _getImageOnLoadEvent(player);
        
        player.filename = file.name;
        
        img.src = window.URL.createObjectURL(file);
    };
    
    var _getDropDivEvent = function (uid) {
        return function (ev) {
                var player = _getPlayerFromUID(uid),
                    
                    data = ev.dataTransfer,
                    file,
                    
                    i;
            
                ev.preventDefault();
            
                for (i = 0; i < data.files.length; i += 1) {
                    file = data.files[i];

                    if (file.type.match('image.*')) {
                        _loadImageFromFile(player, file);
                    } else if (file.type.match('audio.*')) {
                        // TODO
                    } else {
                        _fail("Could not load the file '" + file.name + "', the filetype is unknown.");
                    }
                }
            
                return false;
            };
    };
    
    var _getDragEvent = function (uid) {
        return function (ev) {
            var player = _getPlayerFromUID(uid);
            
            _getImageAsBlob(player.image, function (blob) {
                    var url = window.URL.createObjectURL(blob);
                    ev.dataTransfer.setData("DownloadURL", "image/png:" + player.filename + ":" + url);  
                });
        };
    };
    
    var _buildPlayer = function (image, options) {
        var canvas,
            ctx,
            div,
            spinner,
            spinner_div,
            marker_div,
            gain_div,
            gain_bar_width,
            gains_div_arr = [],
            tmp_div,
            osd_div,
            past_marker_div,
            gain_node,
            audio_buffer,
            w_ratio = image.naturalWidth / options.width,
            h_ratio = image.naturalHeight / options.height,
            a_ratio = w_ratio > 1 ? w_ratio : h_ratio > 1 ? h_ratio : 1,
            new_width = image.naturalWidth / w_ratio,
            new_height = image.naturalHeight / h_ratio,
            filename,
            player,
            i;
        
        gain_div = document.createElement("div");
        gain_div.style.width = options.gainContainerWidth + "px";
        gain_div.style.height = options.gainContainerHeight + "px";
        gain_div.classList.add(_css.gain_class);
        
        gain_bar_width = Math.floor(options.gainContainerWidth / options.gainLevels) - (options.gainBarSideMargin * options.gainLevels);
        
        for (i = 0; i < options.gainLevels; i += 1) {
            tmp_div = document.createElement("div");
            
            tmp_div.classList.add(_css.gain_bar_class);
            tmp_div.style.width = gain_bar_width + "px";
            tmp_div.style.height = Math.round((i + 1) / options.gainLevels * 100, 10) + "%";
            tmp_div.style.marginLeft = options.gainBarSideMargin + "px";
            tmp_div.style.marginRight = options.gainBarSideMargin + "px";
            
            if (i >= options.gainLevel) {
                tmp_div.classList.add(_css.gain_unused_bar_class);
            }
            
            gain_div.appendChild(tmp_div);
            
            gains_div_arr.push(tmp_div);
        }
        
        gain_div.addEventListener("click", _getGainDivClickEvent(_uid));
        
        spinner_div = document.createElement("div");
        spinner_div.classList.add(_css.loader_class);
        
        marker_div = document.createElement("div");
        marker_div.classList.add(_css.marker_class);
        
        past_marker_div = document.createElement("div");
        past_marker_div.classList.add(_css.past_marker_class);
        
        osd_div = document.createElement("div");
        osd_div.classList.add(_css.osd_class);
        
        osd_div.title = "playtime/duration";
        
        spinner = new Spinner({
                lines: 2, // The number of lines to draw
                length: 2, // The length of each line
                width: 1, // The line thickness
                radius: 2, // The radius of the inner circle
                scale: 8, // Scales overall size of the spinner
                corners: 1.0, // Corner roundness (0..1)
                color: '#fff', // #rgb or #rrggbb or array of colors
                opacity: 0, // Opacity of the lines
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                speed: 1.5, // Rounds per second
                trail: 83, // Afterglow percentage
                fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                className: 'spinner', // The CSS class to assign to the spinner
                top: '50%', // Top position relative to parent
                left: '50%', // Left position relative to parent
                shadow: true, // Whether to render a shadow
                position: 'absolute' // Element positioning
            }).spin();
        
        div = document.createElement("div");
        
        div.id = "sp_" + _uid;
        div.classList.add(_css.main_class);

        div.style.width = options.width + "px";
        div.style.height = options.height + "px";

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        canvas.width = new_width;
        canvas.height = new_height;
        
        _fillBackground({
                canvas: canvas,
                canvas_ctx: ctx,
                options: options
            });
        
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        div.appendChild(canvas);
        div.appendChild(gain_div);
        div.appendChild(marker_div);
        div.appendChild(past_marker_div);
        div.appendChild(osd_div);

        div.dataset.player = _uid;
        
        filename = image.src.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "");
        
        gain_node = _audioGetGainNode(options.gain * (1.0 + options.gainMultiplier * (options.gainLevel - 1)));
        
        player = {
            id: _uid,
            div: div,
            canvas: canvas,
            canvas_ctx: ctx,
            image: image,
            options: options,
            paused: true,
            stopped: true,
            
            audio_buffer: null,
            audio_buffer_source: _audioCreateBufferSource(gain_node),
            audio_gain_node: gain_node,
            audio_started_at: 0,
            audio_paused_at: 0,
            audio_loop: false,
            audio_gain_level: options.gainLevel,
            
            gains_div_arr: gains_div_arr,
            
            spinner_div: spinner_div,
            spinner: spinner,
            
            filename: filename,
            
            magnify: false,
            
            toolbar: null,
            toolbar_div: null,
            marker_div: marker_div,
            past_marker_div: past_marker_div,
            osd_div: osd_div
        };
        
        _hideMarker(player);
        
        _players.push(player);

        div.addEventListener("mousedown", _getMdEvent(_uid));
        
        _addRenderJob(_uid, image, options);
        
        if (options.acceptDrop) {
            div.addEventListener("dragover", _cancelEvent);
            div.addEventListener("dragenter", _cancelEvent);
            div.addEventListener("drop", _getDropDivEvent(_uid));
        }
        
        _uid += 1;
        
        return player;
    };
    
    this.apply = function () {
        if (_failure) {
            return;
        }
        
        var elements = Array.prototype.slice.call(document.getElementsByClassName(_css.hook_class)), 
            element,
            image,
            options = {},
            player,
            key,
            keys,
            
            i = 0;
        
        if (!elements.length) {
            return;
        }
        
        for (i = 0; i < elements.length; i += 1) {
            element = elements[i];

            if (element.tagName === "IMG") {
                image = element;
                
                if (image.naturalWidth === 0 || image.naturalHeight === 0) {
                    continue;
                }
                
                for (key in image.dataset) {
                    if (image.dataset.hasOwnProperty(key)) {
                        if (_known_options[key] !== undefined) {
                            options[key] = image.dataset[key];
                            
                            keys += 1;
                        }
                    }
                }
                
                for (key in _known_options) {
                    if (_known_options.hasOwnProperty(key)) {
                        if (options[key] === undefined) {
                            options[key] = _known_options[key];
                        }
                    }
                }
                
                player = _buildPlayer(image, options);
                
                if (player) {
                    image.parentElement.insertBefore(player.div, image);

                    image.parentElement.removeChild(image);

                    _buildToolbar(player);
                }
            }
        }
    };
    
    this.setOptions = function (options) {
        if (!options) {
            return;
        }
        
        var key;
        
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                if (_known_options[key] !== undefined) {
                    _options[key] = parseFloat(options[key]);
                }
            }
        }
        
        this.apply();
    };
    
    /***********************************************************
        Initialization.
    ************************************************************/
    
    for (var k in _known_options) {
        if (_known_options.hasOwnProperty(k)) {
            _options[k] = _known_options[k];
        }
    }
    
    _audioInit();
    
    document.body.addEventListener("mouseup", _getMuEvent());
    
    _raf = window.requestAnimationFrame(_frame);
})();

window.onload = function () {
    SPlayer.apply();
};
