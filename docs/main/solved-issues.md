# minerva's akasha solved issues log

* * *

## minerva performance issues when loading multiple large files

-   _logged on 2020.03.20_
-   _marked as solved on 2020.03.20_

minerva's ui becomes noticeably slow when a large amount of space is being taken up by files in memory (~50mb). closing datastructures (and thereby removing the large files from the render) restores normal performance.

I am currently loading the files — such as images, videos, and audio — into containers using base64 encoding, which is pretty large. this means that if multiple large files are loaded in the ui quickly starts to lag. this happens mostly with high quality audio and most video files.

**SOLVED:** convert retrieved base64 into blobs, then create an object url and use that as the media source.

* * *

## minerva performace issues when decompressing base64 strings / creating object urls

-   _logged on 2020.03.20_
-   _marked as solved on 2020.03.21_

when loading large files, the main thread waits for a worker to decompress the compressed data that's stored in the database. or, it has to wait to convert a base64 string into an object url. this causes the ui to be completely non-interactible for however long it takes to load the file.

**SOLVED:** moved decompression / object url conversion to a dynamically created web worker thread.

* * *

## the imageviewer component is slow

-   _logged on 2020.03.28_
-   _marked as solved on 2020.04.01_

the imageviewer component is slow  because it has to store a base64 encoded image in its state currently to prevent itself from losing the reference to the original image in the datastructure that it was opened from. this could be solved by telling the imageviewer to find the correct datastructure and get the image from it every time the application loads.

**SOLVED:** stored imageviewer images in indexeddb as base64 strings. when an imageviewer window is loaded, it automatically retrieves the base64 file, uses a worker to convert that into a blob url, and sets that url as the image source.

* * *

## minerva can recreate data that's been deleted from `localStorage`.

-   _logged on 2020.05.11_
-   _marked as solved on 2020.05.12_

**old details follow - no longer accurate:**

to reproduce:

-   pull the `ui-overhaul` branch of this repository.

-   start minerva's akasha using `npm install` and then `npm start` in the project directory.

-   on the signup screen, create a new user. name / password does not matter.

-   once logged in, open developer tools and clear `localStorage`, or use
    your console to call `window.localStorage.clear()`.

-   then, refresh the page.

-   upon looking in localstorage, you'll see some of the old data - the
    `minerva_store` object, the `shut_down` key, and the `logged_in` key have
    somehow returned.

-   if you pipe the input of all `Storage.prototype.setItem()` calls into the console,
    you will _not_ see these three items being created.

how are those items returning?

**SOLVED:** it turns out that I was writing data to `minerva_store` in an `onunload` handler that I forgot about, causing old data to be written back into localstorage as soon as the page closed or reloaded.

* * *

## various performance issues regarding ui and window movement.

-   _logged on 2020.03.23_
-   _marked as solved on 2020.05.30_

-   dragging a window with the mouse results in the window being slightly offset from the correct position (under the mouse). this causes visual dissonance.

-   the ui is subject to frame drops when rapidly moving a window, despite using `requestAnimationFrame()` in conjunction with `transform3d()`, throttling the mouse move event, and `will-change` (the effect of which is most likely negligible).

-   most of the time, the ui seems to run around 24fps. the goal is to achieve a smooth 60fps. there may still be too much work going on in the main thread. I'm still not sure of all the things to offload into a worker and what not to offload.

**SOLVED:** solved by using better window movement code. currently using a library called react-draggable.
