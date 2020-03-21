# minerva's akasha solved issues log

---

## minerva performance issues when loading multiple large files


-   *logged on 20 / 3 / 2020*
-   *marked as solved on 20 / 3 / 2020*

minerva's ui becomes noticeably slow when a large amount of space is being taken up by files in memory (~50mb). closing datastructures (and thereby removing the large files from the render) restores normal performance.

I am currently loading the files &mdash; such as images, videos, and audio &mdash; into containers using base64 encoding, which is pretty large. this means that if multiple large files are loaded in the ui quickly starts to lag. this happens mostly with high quality audio and most video files.

**SOLVED:** convert retrieved base64 into blobs, then create an object url and use that as the media source.

---