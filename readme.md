# minerva's akasha.

this is an offline-first, local-storage-first application for collection, connection, analysis and organization of research data.

for archivists, researchers, internet archaeologists, and other information addicts.

the main idea is to provide a canvas on which to construct and connect webs of information of any type. I hope to give researchers an interesting and intuitive interface to conduct any level of research of any topic. minerva's akasha gives you very granular control over pieces of data called "shards", which you can then structure in as complex or simple of a method as you'd like.

includes data reflection (the ability to separate but connect collections of data that branch off of one parent), note taking utility, data tagging, automatic metadata retrieval, cross-user connection, and more...all contained within a pleasant and intuitive user interface.

## running

built with react / `create-react-app`.

1.  clone this repo
2.  in your clone, run `npm i` and `npm start`
3.  there you go

## features:

-   drag and drop functionality allows you to add any file of any type to a record to be prepared for research

-   data can be structured in as simple or complex a system as you'd like.

-   deep interconnection, tagging system, search system, and cross-instance multi-user connections allow for powerful cross-referencing of complex data

-   hypostasis structure allows for reflection of data collections into similar, but different structures so old data can be modified and rearranged without tampering with the original data

-   minerva system tracks and takes care of all the heavy lifting of data organization.

## screenshots / recordings

![the login screen.](./docs/images/login-screen.png "the login screen.")

![some windows on the desktop.](./docs/images/bunch-of-images.png "some windows on the desktop.")

![some more windows on the desktop.](./docs/images/more-windows.png "some more windows on the desktop.")

## contributing:

minerva's akasha is very well commented and soon to be very well documented. I aim to make it extremely easy to create additions / modifications to this application (given you know javascript / sass / html). once this software reaches beta, I hope that some people will develop useful additions / plugins for it.

### current issues that I don't know how to fix:

-   dragging a window with the mouse results in the window being slightly offset from the correct position (under the mouse). this causes visual dissonance.

-   the ui is subject to frame drops when rapidly moving a window, despite using `requestAnimationFrame()` in conjunction with `transform3d()`, throttling the mouse move event, and `will-change` (the effect of which is most likely negligible).

-   the imageviewer component is slow because it has to store a base64 encoded image in its state currently to prevent itself from losing the reference to the original image in the datastructure that it was opened from. this could be solved by telling the imageviewer to find the correct datastructure and get the image from it every time the application loads.

-   most of the time, the ui seems to run around 24fps. the goal is to achieve a smooth 60fps. there may still be too much work going on in the main thread. I'm still not sure of all the things to offload into a worker and what not to offload.

for solved issues see /docs/main/solved-issues.md.

***\~ more contribution info coming soon\~***
