import { Structure } from "./structure";

/**
 * Shard - the smallest normal data structure.
 * @extends Structure
 */
export class Shard extends Structure {
  constructor(name, options) {
    super(name, options);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "shard";

    this.data = {};

    // a list of structures that this type of structure can connect to.
    this.accepts = [];
  }

  addData(data, type) {
    this.data[type] = data;
  }
}
