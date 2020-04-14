# structures

-   feature name: structures
-   start date: 2020.02.07

## summary

structures are one of the core features of minerva's akasha. they allow users to store, tag, categorize and connect pieces of data into meaningful structures. the five structure types (shard, node, grimoire, athenaeum, and hypostasis) all serve distinct purposes that give the user granular control over their research.

## motivation

in minerva's akasha, the main method of storing and organizing data is structures. it's one of the most vital parts of the software.

## guide-level explanation

structures come in five different categories. from lowest to highest level, they are: shard, node, grimoire, athenaeum, and hypostasis. each one serves a certain purpose.

any structure can be connected to another structure of a higher level. the exception is connections made to a hypostasis, which is only possible using athenaea structures.

### shard

shards are the lowest level structure, referred to as the 'smallest' because no structure can be connected to them, limiting their size to the one file they can store. their purpose is to store and provide overviews for files that are dropped into them.

### node

nodes are the second structure, and larger than nodes. these are meant to store collections of shards that share a common purpose or theme.

### grimoire

these are meant to hold collections of nodes, but can also hold shards.

### athenaeum

athenaea are structures that are meant to be able to represent and contain an entire research project - a large collection of subcollections, similar to an actual athenaeum. these are the only structures that are valid connection candidates to hypostases.

### hypostasis

these are special structures that are meant only to reflect athenaea. *reflection* is the process of duplicating a set of existing records to a new set of records, in order to provide a way to preserve information in a certain state, but also allow modification of that collection without disrupting the state of the original. **not yet implemented.**

explain the proposal as if it was already included in the project and you were teaching it to another stan programmer in the manual. that generally means:

-   introducing new named concepts.
-   explaining the feature largely in terms of examples.
-   explaining how stan programmers should *think* about the feature, and how it should impact the way they use the relevant package. it should explain the impact as concretely as possible.
-   if applicable, provide sample error messages, deprecation warnings, or migration guidance.
-   if applicable, describe the differences between teaching this to existing stan programmers and new stan programmers.

for implementation-oriented rfcs (e.g. for compiler internals), this section should focus on how compiler contributors should think about the change, and give examples of its concrete impact. for policy rfcs, this section should provide an example-driven introduction to the policy, and explain its impact in concrete terms.

## reference-level explanation

I'll explain the technical aspects of certain structures.

### shard

a shard has two main complex functions - storing / retrieving data, and previewing the file information of files it stores.

#### storage / retrieval

when a user adds a file to a shard, the file gets added to the indexeddb database. the actual file data is stored as a base64 encoded string.

when the file is retrieved, the base64 string is turned into a file object, which is used to create a lightweight object url within a web worker. the url is used to point to the file, rather than doing something like using a base64 string as an image or audio source.

when a file is first loaded into a shard, it will be processed. this involves retrieving metadata, file names, file extensions, and so forth. all this data will be displayed as part of the structure.

### node

a node is meant to hold references to shards. it displays connected shards in a list of items that the user can click on to open the corresponding shard in the desktop.

### hypostasis

coming soon
