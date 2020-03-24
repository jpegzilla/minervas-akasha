# minerva's akasha solved issues log

---

## minerva performance issues when loading multiple large files

-   *logged on 20 / 3 / 2020*
-   *marked as solved on 20 / 3 / 2020*

minerva's ui becomes noticeably slow when a large amount of space is being taken up by files in memory (~50mb). closing datastructures (and thereby removing the large files from the render) restores normal performance.

I am currently loading the files &mdash; such as images, videos, and audio &mdash; into containers using base64 encoding, which is pretty large. this means that if multiple large files are loaded in the ui quickly starts to lag. this happens mostly with high quality audio and most video files.

**SOLVED:** convert retrieved base64 into blobs, then create an object url and use that as the media source.

---

## minerva performace issues when decompressing base64 strings / creating object urls

-   *logged on 20 / 3 / 2020*
-   *marked as solved on 21 / 3 / 2020*

when loading large files, the main thread waits for a worker to decompress the compressed data that's stored in the database. or, it has to wait to convert a base64 string into an object url. this causes the ui to be completely non-interactible for however long it takes to load the file.

**SOLVED:** moved decompression / object url conversion to a dynamically created web worker thread.

---
