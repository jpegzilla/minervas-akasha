# minerva's akasha.

contents:
-   [running](#running)
-   [features](#features)
-   [screenshots](#screenshots)
-   [contributing](#contributing)
-   [issues](#issues)

this is an offline-first, local-storage-first application for collection, connection, analysis and organization of research data.

for archivists, researchers, internet archaeologists, and other information addicts.

the main idea is to provide a canvas on which to construct and connect webs of information and files. I hope to give researchers an interesting and intuitive interface to conduct any level of research of any topic. minerva's akasha gives you very granular control over pieces of data called "shards", which you can then structure in as complex or simple of a method as you'd like using the other data structures.

from smallest to largest, the structures are:

1.  **shard:** used to store files and tags / metadata / notes relating to the file.

2.  **node:** used to store collections of related (or unrelated, up to you) shards.

3.  **grimoire:** used to store 'libraries' of nodes, like a file folder.

4.  **athenaeum:** used as a large collection of grimoires. useful for storing an entire research project and keeping it separate from other projects.

5.  **hypostasis:** used to reflect athenaea. if you want to start a similar collection of data to one you already have, then you can 'reflect' it using a hypostate. this way, you now have a place to store two similar, but different complex collections of data.

includes data reflection (the ability to separate but connect collections of data that branch off of one parent), note taking utility, data tagging, automatic metadata retrieval, cross-user connection, and more...all contained within a pleasant and intuitive user interface.

_if you want to see more detailed information, dig into `./docs/main` and read the design docs._

<a name="#running"></a>
## running:

built with react / `create-react-app`.

1.  clone this repo
2.  in your clone, run `npm i` and `npm start`
3.  there you go

<a id="features"></a>
## features:

-   drag and drop functionality allows you to add any file of any type to a record to be prepared for research

-   data can be structured in as simple or complex a system as you'd like.

-   deep interconnection, tagging system, search system, and cross-instance multi-user connections allow for powerful cross-referencing of complex data

-   hypostasis structure allows for reflection of data collections into similar, but different structures so old data can be modified and rearranged without tampering with the original data

-   minerva system tracks and takes care of all the heavy lifting of data organization.

<a id="screenshots"></a>
## screenshots:

![the login screen.](./docs/images/login-screen.png "the login screen.")

![some windows on the desktop.](./docs/images/bunch-of-images.png "some windows on the desktop.")

![some more windows on the desktop.](./docs/images/more-windows.png "some more windows on the desktop.")

<a id="contributing"></a>
## contributing:

minerva's akasha is very well commented and soon to be very well documented. I aim to make it extremely easy to create additions / modifications to this application (given you know javascript / sass / html). once this software reaches beta, I hope that some people will develop useful additions / plugins for it.

if you want to contribute to minerva's akasha, do this 8-step process:

1.  fork this repository and clone the repo onto your computer
2.  add this repo as an upstream to that repo: `https://github.com/jpegzilla/minervas-akasha.git`
3.  get latest changes:
```
git checkout master
git fetch --all
git merge upstream/master
```
4.  install all deps: `yarn install`
5.  create a feature branch from my master branch
6.  make the feature / fix / whatever and commit the changes to your own branch
7.  make a pr from your branch to my master.
8.  I will review it and merge it if the change is acceptable. done!

also, it doesn't hurt to talk to me about things you want to add to minerva's akasha. I can easily be contacted on discord at `jpegzilla#6969` or on twitter `@jpegzilla`, or email me.

_\~ more contribution info coming soon\~_



<a id="issues"></a>
## current issues that I don't know how to fix:

-   dragging a window with the mouse results in the window being slightly offset from the correct position (under the mouse). this causes visual dissonance.

-   the ui is subject to frame drops when rapidly moving a window, despite using `requestAnimationFrame()` in conjunction with `transform3d()`, throttling the mouse move event, and `will-change` (the effect of which is most likely negligible).

-   most of the time, the ui seems to run around 24fps. the goal is to achieve a smooth 60fps. there may still be too much work going on in the main thread. I'm still not sure of all the things to offload into a worker and what not to offload.

for solved issues see /docs/main/solved-issues.md.
