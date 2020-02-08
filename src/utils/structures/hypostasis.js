// the most complex data structure, this is meant to reflect existing athenea and allow similar,
// but not entirely identical collections of information to exist. it also allows for information
// to be shared across multiple collections through modification of only one collection.

// hypostasis - an underlying reality or substance, as opposed to
// attributes or to that which lacks substance. think of this structure as a parent to multiple
// other collections that is the 'underlying reality'.

class Hypostasis {
  constructor(children) {
    this.children = children;
  }
}
