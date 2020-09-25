# feature-name

-   feature name: media viewers
-   start date: 2020 03 27
-   source locations:
    -   `/src/components/windows/**Viewer.js`

## summary

the audio, video, image, and text viewers are all ways to look at and manipulate various forms of media.

## motivation

the viewers give users a quick and easy read-only way to visualize whatever data they're collecting. it also offers a way to gather further information on files that have been gathered during the research process.

## guide-level explanation

the viewers are needed to enable the main functionality of minerva's akasha - viewing and analysis of data in a visual-first manner.

there are several types of viewers:

-   the audio viewer
-   the text viewer
-   the image viewer
-   the video viewer

## reference-level explanation

viewers are spawned independently, typically triggered by a double click on the data that they are meant to display. for example, double clicking an audio file in a `shard` will bring up an audio viewer for that file. the file is 'copied' and stored in a dedicated entry within `indexeddb`. this way, even if the original file in the `shard` is removed from memory, the viewer can continue to exist.

when a viewer is closed, their `indexeddb` entry is removed.

## unresolved questions

-   what other types of media, if any, would require viewers in the future?
