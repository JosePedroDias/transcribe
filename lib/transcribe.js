(function() {

	'use strict';


	// fix up for prefixing
	window.AudioContext =			window.AudioContext ||
									window.webkitAudioContext;

	window.requestAnimationFrame =	window.requestAnimationFrame ||
									window.webkitRequestAnimationFrame;



	var createMedia = function(isAudio) {
		var mediaEl = document.createElement(isAudio ? 'audio' : 'video');
		document.body.appendChild(mediaEl);
		//mediaEl.setAttribute('preload', 'metadata');
		mediaEl.setAttribute('preload', 'metadata');
		return mediaEl;
	};


	var createAudioContext = function() {
		try {
			return new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}
	};


	var fillSpans = function(tags, divEl) {
		var f = tags.length;
		var spanEls = [];

		var i, tag, spanEl;

		for (i = 0; i < f; ++i) {
            tag = tags[i];
            if (typeof tag === 'string') {
                divEl.appendChild( document.createTextNode( tag ) );
                continue;
            }
			spanEl = document.createElement('span');
			spanEl.appendChild( document.createTextNode( tag[1] ) );
			divEl.appendChild(spanEl);
			spanEls.push(spanEl);
		}

		return spanEls;
	};


	var inspect = function(mediaUrl, isAudio) {
		var mediaEl,
			analyser,
			data,
			duration,
			extract,
			timer;


		var context = createAudioContext();
		var fps = 30;
		var old = -1;


		var graph = function() {
			var w = extract.length;
			var h = 128;
			//var canvasEl = document.createElement('canvas');
			//document.body.appendChild(canvasEl);
			var canvasEl = document.querySelector('canvas');
			canvasEl.setAttribute('width',  w);
			canvasEl.setAttribute('height', h);
			var ctx = canvasEl.getContext('2d');

			var i, v, max = -1;
			for (i = 0; i < w; ++i) {
				v = extract[i];
                if (isNaN(v)) { continue; }
				if (v > max) {
					max = i;
				}
			}

			var s = h / max;
			//console.log('max', max, 's', s);

			for (i = 0; i < w; ++i) {
				v = extract[i] * s;
				ctx.fillRect(i, h-v, 1, v);
			}
		};


		var onFrame = function() {
			if (!data) {
				data = new Uint8Array(analyser.frequencyBinCount);
			}

			analyser.getByteFrequencyData(data);

			/*var v, max = -1;
			for (var i = 0, f = data.length; i < f; ++i) {
				v = data[i];
				if (v > max) {
					max = v;
				}
			}*/

			var f = data[0];
			var t = mediaEl.currentTime;
			var df = f - old;
			old = f;

			/*if (t > duration) { // TODO HACK
				return onEnded();
			}*/

			//console.log(max);
			//console.log(t.toFixed(2), df);
			var p = (t / duration * 100).toFixed(1) + '%';
			console.log(t.toFixed(2), df, p);

			extract[ Math.floor( t * fps ) ] = f;

			//requestAnimationFrame(onFrame);
		};


		var onEnded = function() {
			mediaEl.removeEventListener('ended', onEnded);

			clearInterval(timer);

			console.log('ended');//, extract);

			graph();

			mediaEl.pause();
			mediaEl.currentTime = 0;

			var spanEl = document.querySelector('span');

			mediaEl.addEventListener('timeupdate', function() {
				var t = mediaEl.currentTime;
				spanEl.style.left = (t / duration * 100).toFixed(1) + '%';
			});

			mediaEl.play();
		};


		mediaEl = createMedia(isAudio);


		mediaEl.addEventListener('durationchange', function() {
			duration = mediaEl.duration;
			//duration = 12; // TODO HACK
			console.log('duration', duration);

			extract = new Uint8Array( Math.ceil(duration) * fps);

			timer = setInterval(onFrame, 1000 / fps);
			//onFrame();

			mediaEl.play();
		});


		mediaEl.addEventListener('ended', onEnded);

		var source = context.createMediaElementSource(mediaEl);

        //var buffer = context.createBufferSource();

		// band filter
		/*var filter = context.createBiquadFilter();
		filter.type = 2; // band pass filter (200-400Hz)
		filter.frequency.value = 300; // 300 Hz
		filter.Q.value = 1; // erm...
		filter.gain.value = 4;*/

		// analyser
		analyser = context.createAnalyser();
		analyser.fftSize.value = 2;
        analyser.smoothingTimeConstant = 0;

		//source.connect(filter);
		//filter.connect(analyser);

        source.connect(analyser);

		analyser.connect(context.destination);

		mediaEl.setAttribute('src', mediaUrl);
		mediaEl.load();

		return mediaEl;
	};



	var fft = function(mediaUrl, isAudio) {
		// TODO fft spectrum analyser
		var context = createAudioContext();

		var mediaEl = createMedia(isAudio);
        //mediaEl.playbackRate = 2;

		var source = context.createMediaElementSource(mediaEl);

		/*var filter = context.createBiquadFilter();
		filter.type = 2; // band pass filter (200-400Hz)
		filter.frequency.value = 350; // 300 Hz
		filter.Q.value = 20; // erm...
		//filter.gain.value = 40;*/

		// analyser
		var analyser = context.createAnalyser();
		analyser.fftSize.value = 128;
        analyser.smoothingTimeConstant = 0;

		source.connect(analyser);

		//source.connect(filter);
		//filter.connect(analyser);

		analyser.connect(context.destination);

		var data = new Uint8Array(analyser.frequencyBinCount);

		var w = 512;
		var h = 128;
		var canvasEl = document.querySelector('canvas');
		canvasEl.setAttribute('width',  w);
		canvasEl.setAttribute('height', h);
		var ctx = canvasEl.getContext('2d');

		var I = 0;
		var timer = setInterval(
			function() {
				//var id = ctx.getImageData(0, 0, w-1, h);
				//ctx.drawImage(id, 1, 0);

				var v;
				analyser.getByteFrequencyData(data);
				for (var i = 0, f = data.length; i < f; ++i) {
					v = data[i];
					//ctx.fillStyle = ['rgb(', v, ',', v, ',', v, ')'].join('');
                    ctx.fillStyle = ['rgb(', v * 2, ',', v, ',', 0, ')'].join('');
					ctx.fillRect(I, i, 1, 1);
				}
				++I;
				I = I % w;
			},
			50
		);

		mediaEl.setAttribute('src', mediaUrl);
		mediaEl.load();
		mediaEl.play();

		return mediaEl;
	};



	var consume = function(mediaUrl, isAudio, transcribeUrl) {
		var context = createAudioContext();

		// get transcript data
		var fetcher = window[ (transcribeUrl.indexOf('://') === -1) ? 'ajax' : 'jsonp' ];
		fetcher(transcribeUrl, function(err, tags) {
			if (err) {
				return alert('problem fetching transcribe ' + transcribeUrl);
			}

			//console.log('tags', tags);

			var divEl = document.createElement('div');
			document.body.appendChild(divEl);

			// tags
			var f = tags.length;
			var spanEls = fillSpans(tags, divEl);

			var lastT;
			var lastTagI = -1;
			var currTagI;
			var currTag;
			var nextTag;

			var reset = function() {
				currTag = undefined;
				nextTag = tags[0];
				currTagI = -1;
				lastT = -1;
			};

			reset();

			mediaEl.addEventListener('timeupdate', function() {
				var t = mediaEl.currentTime;

				var lastTagI = currTagI; // TODO HUMM??

				while (t > lastT && (!currTag || currTag[0] < t)) {
					if (currTagI >= f) {
						reset();
						lastT = t;
						return;
					}

					++currTagI;
					currTag = nextTag;
					nextTag = tags[currTagI];
				}

				if (currTagI !== lastTagI) {
					var el = spanEls[lastTagI];
					if (el) {
						el.classList.remove('current');
					}
					el = spanEls[currTagI];
					if (el) {
						el.classList.add('current');
						console.log('* %s', tags[currTagI][1]);
					}
				}

				lastT = t;
				lastTagI = currTagI;
			});

			divEl.addEventListener('click', function(ev) {
				var el = ev.target;
				console.log(el);
				if (el.nodeName.toLowerCase() !== 'span') {
					return;
				}
				ev.preventDefault();
				var i = spanEls.indexOf(el);
				console.log(i);

				if (i > -1 && i < f) {
					reset();

					var el = spanEls[lastTagI];
					if (el) {
						el.classList.remove('current');
					}

					var tag = tags[i];
					console.log('moving to t=%f (%s)...', tag[0], tag[1]);
					lastT = tag[0] - 0.1;
					mediaEl.pause();
					mediaEl.currentTime = tag[0];
					mediaEl.play();
				}
			});

			console.log('playing...');
			mediaEl.setAttribute('controls', '');
			mediaEl.play();
		});


		// create media element
		var mediaEl = createMedia(isAudio);

		mediaEl.classList.add('show');

		mediaEl.setAttribute('src', mediaUrl);
		mediaEl.load();
		//mediaEl.play();
	};



    var timeIt = function(txt, divEl) {
        // txt to tags
        var t = 0;
        var tags = txt.match(/(\s+)|(\S+)/g);
        tags = tags.map(function(w) {
            if ((/\s+/).test(w)) { return w; }
            t += 0.1;
            return [t, w];
        })
        console.log(tags);

        // fill markup
        fillSpans(tags, divEl);;

        return function() {
            var r = ['[\n'];
            tags.forEach(function(t) {
                if (typeof t === 'string') {
                    r.push('  ');
                    r.push( JSON.stringify(t) );
                    return r.push(',\n');
                }
                r.push('  [');
                r.push(t[0].toFixed(2));
                r.push(', ')
                r.push( JSON.stringify(t[1]) );
                r.push('],\n');
            });
            var wasStr = r.pop()[0] === '"';
            if (!wasStr) {
                r.push(']');
            }
            r.push('\n]');
            return r.join('');
        };
    };



    var shoot = function(videoUrl, s, takePictureCb) {
        // create video element
		var mediaEl = createMedia();
		mediaEl.classList.add('show');

        mediaEl.addEventListener('durationchange', function() {
            var duration = mediaEl.duration;

            var w = mediaEl.videoWidth;
            var h = mediaEl.videoHeight;

            var cw = Math.round(w*s);
            var ch = Math.round(h*s);

            var canvasEl = document.createElement('canvas');
            canvasEl.setAttribute('width',  cw);
            canvasEl.setAttribute('height', ch);
            var ctx = canvasEl.getContext('2d');

            var takePicture = function(skipImg) {
                ctx.drawImage(mediaEl, 0, 0, cw, ch);
                var src = canvasEl.toDataURL('image/png');

                if (!skipImg) {
                    var imgEl = document.createElement('img');
                    imgEl.setAttribute('src', src);
                    document.body.appendChild(imgEl);
                }

                return src;
            };

            takePictureCb(null, duration, [w, h], takePicture);
        });

		mediaEl.setAttribute('src', videoUrl);
		mediaEl.load();

        return mediaEl;
    };



	window.Transcribe = {
		inspect: inspect,
		fft:     fft,
        timeIt:  timeIt,
        shoot:   shoot,
		consume: consume
	};

})();
