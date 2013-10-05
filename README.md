# transcribe


## motivation

Messing with video/audio transcriptions -
how to write and time them,
how to play and navigate them.

Using HTML5 Media Elements, Canvas, the Web Audio API and plain JavaScript.

Inspired by [hyperaud.io](http://hyperaud.io/).



## compatibility

Should work well in Chrome/Safari for MP4/MP3.
Firefox does not supports these formats due to licensing fees.
Internet Explorer does not yet support the Web Audio API.


## roadmap

* **timeIt**

    * step 1 works - supports loading an URL into video,
    countdown, supports changing the playback speed and call
    parse. loading and saving of the relevant fields is guaranteed
    via localStorage

    * step 2 lacking for now - waiting on user feedback to associate
    video times to words. The tokenization isn't done either. TODO


* **consume**

    * word tokens get created from an array of [time, word].

    * resulting spans get highlighted and when clicked move currentTime correctly

    * the timeupdate callback is buggy though. not all words get highlighted. TODO


## working samples online

* [timeIt](http://josepedrodias.github.io/transcribe/samples/timeIt.html)
* [consume](http://josepedrodias.github.io/transcribe/samples/consume.html)

The remaining samples have default local URLs for now. Must correct ASAP. TODO
