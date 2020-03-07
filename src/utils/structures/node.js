import { Structure } from "./structure";
import { Shard } from "./shard";

export class Node extends Structure {
  constructor(name, options) {
    super(name, options);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "node";

    // a list of structures that this type of structure can connect to.
    this.accepts = ["shard"];
  }
}
