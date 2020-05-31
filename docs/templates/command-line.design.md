# minerva's akasha command line

-   feature name: command line
-   start date: 2020-02-22
-   source locations:
    -   `/src/components/windows/Console.js`
    -   `/src/utils/commands/**/**`

**_the command line is a work in progress._**

## summary

the minerva's akasha command line is an interface for controlling minerva's akasha in a non-gui fashion. features such as record creation, record searching, and more are available with added control through command parameters.

## motivation

the main idea was to give users who are used to command line interfaces an environment to manage minerva's akasha in a way that they're used to working.

## guide-level explanation

the command line has a variety of different commands for interacting with minerva's akasha:

    > help: show this list.

    > reset records: permanently remove all data structures.

    > add <type> [name]: add a new structure of a certain type, with an optional name.

    acceptable structure types:
    shard		node		grimoire
    athenaeum	hypostasis

    > find [--type <structure type>] [--mime <mime type>] [query]: find a structure

    using a search string, optionally using a mime type and / or structure type.

    example: find music --type shard --mime audio/wav

    > clear (aliases: clr): clears the console window.

    > exit (aliases: logout, close): closes the current console session.

## unresolved questions

-   should I implement tab auto-completion?
