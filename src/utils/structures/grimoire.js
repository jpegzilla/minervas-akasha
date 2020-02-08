import { Structure } from "./structure";

export class Grimoire extends Structure {
  constructor(name) {
    super(name);

    // used to determine whether two structures can be connected. structures can only
    // connect to smaller structures.
    this.type = "grimoire";

    // a list of structures that this type of structure can connect to.
    this.connectableTo = ["node", "shard"];
  }
}
