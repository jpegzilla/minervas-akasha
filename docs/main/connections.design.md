# structure connections

-   feature name: structure connections
-   start date: 2020.04.02
-   source locations:
    -   `/src/utils/managers/Minerva.js`
    -   `/src/utils/structures/AkashicReocrd.js`
    -   `/src/components/DataStructure.js`
    -   `/src/components/windows/StructureData.js`
    -   `/src/components/windows/ConnectionList.js`

## summary

the core feature of minerva's akasha is the collection and connection of related data into data structures for research purposes. all structure connections are bidirectional, with a parent and a child. for example, a shard can be connected as a child of a node, but a node cannot be connected to a shard as a child. in this way, a parent structure may have multiple children, but a child structure can only be connected to one parent.

## motivation

the point of introducing bidirectional data connections to minerva's akasha is the main feature of the application: detailed organization and connection of related data as a research technique.

## guide-level explanation

a structure can be connected to anything that's in its `connectsTo` array. essentially, any structure can be connected to any larger structure. the exception is a hypostasis, whose only purpose is to reflect athenaea.

when a structure is connected to another, the structure's id is passed into the other structure's `connectedTo` object.

## reference-level explanation

when a user provides a piece of information to minerva using a shard containing a file, they can choose to collect related files into a larger structure. the best option for this is the next largest structure - a node. nodes can be collected into grimoires, and grimoires into athenaea, and athenaea into hypostases. again, any structure can go into a larger structure that is not a hypostasis.

a connection is formed when a user clicks the 'connect record' button and selects a record from the displayed list of connection options. the connection is created bidirectionally, meaning that once a structure is connected to another, both structures' ids are passed into each other's `connectedTo` objects.

```javascript
// connection is made
minerva.connectRecord(item, dest)

// resulting items
// item: {...item, connectedTo: {...item.connectedTo, [dest.id]: dest.id}}
// dest: {...dest, connectedTo: {...dest.connectedTo, [item.id]: item.id}}
```

when a disconnection is made, the destination id and the item id are simply removed from each other's `connectedTo` objects, and they no longer are able to reference each other's information. this functionality resides in `minerva.disconnectRecord`. when a record is deleted, another function is called, `minerva.disconnectFromAll`, which disconnects the deleted record from every record that holds a reference to it.

```javascript
item.connectedTo // => {[dest.id]: dest.id}
dest.connectedTo // => {[item.id]: item.id}

minerva.disconnectRecord(item, dest)

item.connectedTo // {}
dest.connectedTo // {}
```

```javascript
item.id // => 'foo'
item.connectedTo // => {quux: 'quux', bar: 'bar', baz: 'baz'}
des1.connectedTo // => {quux: 'quux', foo: 'foo', baz: 'baz'} (id: bar)
des2.connectedTo // => {quux: 'quux', foo: 'foo', bar: 'bar'} (id: baz)
des3.connectedTo // => {foo: 'foo', bar: 'bar', baz: 'baz'} (id: quux)

minerva.disconnectFromAll('foo')

item.connectedTo // => {}
des1.connectedTo // => {quux: 'quux', baz: 'baz'} (id: bar)
des2.connectedTo // => {quux: 'quux', bar: 'bar'} (id: baz)
des3.connectedTo // => {bar: 'bar', baz: 'baz'} (id: quux)
```

## drawbacks

I don't think this is a set of interactions / functionality that the average software user is used to. minerva's akasha may need some interactive tutorial / guide / better tooltips in order to be more accessible.

## rationale and alternatives

this was the main idea of minerva's akasha since inception, stemming from the blocks / collections of [are.na](https://are.na). it is currently the only way I've thought of implementing similar functionality.

## unresolved questions

-   what will a hypostasis connection look like? (coming in a separate design doc)
-   how will minerva's akasha interactively teach users how to use connections?
