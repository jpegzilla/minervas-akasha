import { Structure } from "./structure";

// an athenaeum is meant to hold large amounts of grimoires, similar to an actual
// athenaeum.
export class Athenaeum extends Structure {
  constructor(name) {
    super(name);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "athenaeum";

    // a list of structures that this type of structure can connect to.
    this.connectableTo = ["grimoire", "node", "shard"];
  }
}
