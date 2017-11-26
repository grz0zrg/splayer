/*#include filesaver/FileSaver.min.js*/
/*#include spin.js/spin.js*/
/*#include wui/wui.min.js*/

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
    
    /*#include audio.js*/
    /*#include check.js*/

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
