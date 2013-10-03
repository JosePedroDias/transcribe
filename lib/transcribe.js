(function() {

	'use strict';


	// fix up for prefixing
	window.AudioContext =			window.AudioContext ||
									window.webkitAudioContext;
	
	window.requestAnimationFrame =	window.requestAnimationFrame ||
									window.webkitRequestAnimationFrame;



	var inspect = function(videoUrl) {
		var context,
			videoEl,
			analyser,
			data;


		try {
			context = new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}

		var duration;
		var fps = 20;

		var extract;

		var old = -1;

		var timer;


		var graph = function() {
			var w = extract.length;
			var h = 128;
			//var canvasEl = document.createElement('canvas');
			//document.body.appendChild(canvasEl);
			var canvasEl = document.querySelector('canvas');
			canvasEl.setAttribute('width',  w);
			canvasEl.setAttribute('height', h);
			var ctx = canvasEl.getContext('2d');

			var i, v;
			for (i = 0; i < w; ++i) {
				v = extract[i];// * 0.25;
				//ctx.fillRect(i, h - v, i, h);
				ctx.fillRect(i, h-v, i, h-v);
			}
		};


		var onFrame = function() {
			if (!data) {
				//data = new Uint8Array(analyser.frequencyBinCount);
				//data = new Uint8Array(8);
				data = new Uint8Array(1);
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
			var t = videoEl.currentTime;
			var df = f - old;
			old = f;

			//console.log(max);
			//console.log(t.toFixed(2), df);
			var p = (t / duration * 100).toFixed(1) + '%';
			console.log(t.toFixed(2), df, p);
			
			extract[ Math.floor( t * fps ) ] = f;

			//requestAnimationFrame(onFrame);
		};


		var onEnded = function() {
			videoEl.removeEventListener('ended', onEnded);

			clearInterval(timer);

			console.log('ended');//, extract);

			graph();

			videoEl.pause();
			videoEl.currentTime = 0;

			var spanEl = document.querySelector('span');

			videoEl.addEventListener('timeupdate', function() {
				var t = videoEl.currentTime;
				spanEl.style.left = (t / duration * 100).toFixed(1) + '%';
			});

			videoEl.play();
		};


		videoEl = document.createElement('video');
		document.body.appendChild(videoEl);
		videoEl.setAttribute('preload', 'metadata');
		

		videoEl.addEventListener('durationchange', function() {
			duration = videoEl.duration;
			console.log('duration', duration);

			extract = new Uint8Array( Math.ceil(duration) * fps); // 43s at 20fps

			timer = setInterval(onFrame, 1000 / fps); // every 20fps
			//onFrame();
			
			videoEl.play();
		});


		videoEl.addEventListener('ended', onEnded);

		var source = context.createMediaElementSource(videoEl);

		// band filter
		var filter = context.createBiquadFilter();
		filter.type = 2; // band pass filter (200-400Hz)
		filter.frequency.value = 300; // 440 Hz
		filter.Q.value = 0.5; // +- 10 Hz?
		filter.gain.value = 4;

		// gain
		//var gain = context.createGainNode(); // Generate GainNode
		//gain.gain.value = 2; // 2x
		
		// analyser
		analyser = context.createAnalyser();
		analyser.fftSize.value = 1;

		source.connect(filter);
		filter.connect(analyser);
		//gain.connect(analyser);
		analyser.connect(context.destination);

		var sourceEl = document.createElement('source');
		sourceEl.setAttribute('src', videoUrl);
		videoEl.appendChild(sourceEl);
		videoEl.load();
	};

	

	window.Transcribe = {
		inspect: inspect
	};

})();
