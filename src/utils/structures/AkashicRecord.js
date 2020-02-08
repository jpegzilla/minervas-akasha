import { uuidv4 } from "./../misc";
import { Structure } from "./structure";
import { Minerva } from "./../managers/MinervaInstance";

// the master structure, meant to represent a user's entire environment when working
// within the tool. bound to user id and is created for every new user.
export default class AkashicRecord {
  constructor(userId, dateCreated, id, name, records) {
    this.boundTo = userId;
    this.dateCreated = dateCreated || new Date().toISOString();
    this.id = id || uuidv4();
    this.name = name;

    // contains all of the data structures in an akashic record.
    this.records = records || {
      hypostasis: [],
      atheneum: [],
      grimoire: [],
      node: [],
      shard: []
    };
  }

  setBoundTo(userId) {
    this.boundTo = userId;

    return this;
  }

  // how should I handle storing data structures in the record? should I store ids
  // and just retrieve the corresponding data structures from another store that
  // contains the actual objects? should I store the structures
  // in the records object?
  addToRecord(structure) {
    if (!structure instanceof Structure)
      throw new TypeError(`${structure} is not a proper structure.`);

    this.records[structure.type].push(structure);

    return this;
  }

  removeFromRecord(id) {}

  static retrieveAkashicRecord(userId, name, database = false) {
    if (database) {
      // retreive record for user with name from database
    } else {
      // retrieve from localStorage
      return JSON.parse(Minerva._store[name]);
    }
  }

  static setAkashicRecord(userId, dateCreated, id, name, records) {
    if (!userId || !dateCreated || !id || !name || !records)
      throw new SyntaxError("retrieveAkashicRecord requires all arguments.");

    return new this(userId, dateCreated, id, name, records);
  }
}
