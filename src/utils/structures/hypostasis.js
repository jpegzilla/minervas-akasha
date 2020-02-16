import { Structure, Athenaeum } from "./structure";

// the most complex data structure, this is meant to reflect existing athenea and allow similar,
// but not entirely identical collections of information to exist. it also allows for information
// to be shared across multiple collections through modification of only one collection.

// hypostasis - an underlying reality or substance, as opposed to
// attributes or to that which lacks substance. think of this structure as a parent to multiple
// other collections that is the 'underlying reality'.

export class Hypostasis extends Structure {
  constructor(name) {
    this.type = "hypostasis";

    this.name = name;

    this.accepts = [Athenaeum];

    this.reflections = {};
  }

  addReflection(ath, subname) {
    if (!ath instanceof Athenaeum)
      throw new SyntaxError("currently, only athenea can be reflected.");

    if (subname in this.reflections) {
      // warn user that they're about to overwrite something
    }

    this.reflections[subname] = { name: `${this.name}.${subname}`, ath };
  }

  removeReflection(subname) {
    if (subname in this.reflections) delete this.reflections[subname];
  }

  getReflection(subname) {
    if (subname in this.reflections) return this.reflections[subname];
  }
}
