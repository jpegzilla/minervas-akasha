import { Structure } from "./structure";
// import { Node } from "./node";
// import { Shard } from "./shard";

/**
 * Grimoire - second to largest normal structure.
 * @extends Structure
 */
export class Grimoire extends Structure {
  constructor(name, options) {
    super(name, options);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "grimoire";

    // a list of structures that this type of structure can connect to.
    this.accepts = ["shard", "node"];

    this.connectsTo = "athenaeum";
  }
}
