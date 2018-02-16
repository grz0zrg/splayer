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

var _audioStop = function (audio_buffer_node, audio_gain_node, onended) {
    var stop_time;
    
    if (onended !== undefined) {
        audio_buffer_node.onended = onended;
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
            seconds: 0.1,
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
};