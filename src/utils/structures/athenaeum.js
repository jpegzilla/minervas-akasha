import { Structure } from "./structure";
// import { Shard } from "./shard";
// import { Grimoire } from "./grimoire";
// import { Node } from "./node";

// an athenaeum is meant to hold large amounts of grimoires, similar to an actual
// athenaeum.

/**
 * Athenaeum - largest normal data structure.
 * @extends Structure
 */
export class Athenaeum extends Structure {
  constructor(name, options) {
    super(name, options);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "athenaeum";

    // a list of structures that this type of structure can connect to.
    this.accepts = ["grimoire", "node", "shard"];

    this.connectsTo = ["hypostasis"];
  }
}
