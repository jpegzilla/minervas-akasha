# minerva

-   feature name: minerva class
-   start date: 7.2.2020
-   source location: `/src/utils/managers/MinervaInstance.js`

## summary
[summary]: #summary

minerva is a class designed for managing everything that goes on within the application &mdash; logging users in and out, managing records, and controlling the general state of the application.

this is an ongoing design document, because minerva is yet in an incomplete state.

## motivation
[motivation]: #motivation

minerva is a critical piece of infrastructure that allows the application to communicate with other interfaces &mdash; such as the remote database, the indexedDB database, and localStorage.

the main reason for its creation is to abstract away database and storage communication.

## explanation
[explanation]: #explanation

interacts with: `AkashicRecord`, `DatabaseInterface`, `Structure`

explain the proposal as if it was already included in the project and you were teaching it to another stan programmer in the manual. that generally means:

### user login / logout

minerva has `login` and `logout` functions. `login` will retrieve the user's records and other information from the `AkashicRecord` class and save it in localStorage through a helper class. `logout` will remove the user's information from the running minerva instance and set the localStorage `logged_in` flag to false.

### indexedDB storage

another one of minerva's primary functions is retrieving file data from the indexedDB instance that is created when the application starts. large file information, such as images and audio, is stored in minerva's indexedDB. when a stored file must load from memory, minerva requests the encoded data from the database and the application decodes the information.

### record management

minerva also deals with controlling the records in the application. these are documented in `datastructure.design.md`. when a create, update, or delete operation must be performed on any record, minerva's methods `addToRecord`, `editInRecord`, and `removeFromRecord` are used. to read a record, minerva accesses its `record` property.

to do similar operations involving uploaded files, minerva uses `addFileToRecord`, `updateFileInRecord`, `removeFileInRecord`, and `findFileInRecord`. these all interact with indexedDB to store and retrieve the files in question.

### remote database management

not currently used, as minerva's akasha is local-first to mimic a native application as closely as possible.

in the future, inter-user communication will be implemented, as well as the ability to easily transfer local data between devices, necessitating a database to store user information. currently, [minerva's servant](https://github.com/jpegzilla/minerva-servant) is serving as the api for interacting with that database.  

## drawbacks
[drawbacks]: #drawbacks

minerva is somewhat complicated by design and by necessity.

## unresolved questions
[unresolved-questions]: #unresolved-questions

-   will minerva be used to manage webrtc communication?
-   will minerva be used to communicate with web workers?