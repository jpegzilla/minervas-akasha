# Minerva

-   feature name: `Minerva` class
-   start date: 2020.02.07
-   source location: `/src/utils/managers/MinervaInstance.js`

## summary
[summary]: #summary

`Minerva` is a class designed for managing everything that goes on within the application &mdash; logging users in and out, managing records, and controlling the general state of the application.

*this is an ongoing design document, because `Minerva` is yet in an incomplete state.*

## motivation
[motivation]: #motivation

`Minerva` is a critical piece of infrastructure that allows the application to communicate with other interfaces &mdash; such as the remote database, the indexedDB database, and localStorage.

the main reason for its creation is to abstract away database and storage communication.

## explanation
[explanation]: #explanation

interacts with: `AkashicRecord`, `DatabaseInterface`, `Structure`

explain the proposal as if it was already included in the project and you were teaching it to another stan programmer in the manual. that generally means:

### user login / logout

`Minerva` has `login` and `logout` functions. `login` will retrieve the user's records and other information from the `AkashicRecord` class and save it in localStorage through a helper class. `logout` will remove the user's information from the running `Minerva` instance and set the localStorage `logged_in` flag to false.

### indexedDB storage

another one of `Minerva`'s primary functions is retrieving file data from the indexedDB instance that is created when the application starts. large file information, such as images and audio, is stored in `Minerva`'s indexedDB. when a stored file must load from memory, `Minerva` requests the encoded data from the database and the application decodes the information.

### record management

`Minerva` also deals with controlling the records in the application. these are documented in `datastructure.design.md`. when a create, update, or delete operation must be performed on any record, `Minerva`'s methods `addToRecord`, `editInRecord`, and `removeFromRecord` are used. to read a record, `Minerva` accesses its `record` property.

to do similar operations involving uploaded files, `Minerva` uses `addFileToRecord`, `updateFileInRecord`, `removeFileInRecord`, and `findFileInRecord`. these all interact with indexedDB to store and retrieve the files in question.

### remote database management

not currently used, as `Minerva`'s akasha is local-first to mimic a native application as closely as possible.

in the future, inter-user communication will be implemented, as well as the ability to easily transfer local data between devices, necessitating a database to store user information. currently, [`Minerva`'s servant](https://github.com/jpegzilla/`Minerva`-servant) is serving as the api for interacting with that database.  

## drawbacks
[drawbacks]: #drawbacks

`Minerva` is somewhat complicated by design and by necessity.

## unresolved questions
[unresolved-questions]: #unresolved-questions

-   will `Minerva` be used to manage webrtc communication?
-   will `Minerva` be used to communicate with web workers?
