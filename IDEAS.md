# transcription process


## 1 - full transcription and karaoke

* write whole text
* play media and press key at every word start


## 2 - captcha chunks and reduce

* divide video into smaller chunks
* serve chunks to several people, store different sub-texts
* <somewhat point in time after criteria is met> reduce submitted proposals into highest ranked words


## 3 - speech recognition, human validation

* find and use good SR engine for PT, obtain words with timing
* replay transcription, allowing word change (CRUD) and respective time shift


## 4 - hybrid, from subtitles

* parse subtitles. use text and fill time-untagged words with interpolation between time-tagged words
* replay transcription, allowing word change (CRUD) and respective time shift
