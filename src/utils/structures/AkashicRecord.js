import { uuidv4 } from "./../misc";
import { Structure } from "./structure";
// import { Shard } from "./shard";
// import { Grimoire } from "./grimoire";
// import { Node } from "./node";
// import { Hypostasis } from "./hypostasis";
// import { Athenaeum } from "./athenaeum";
import { Minerva } from "./../managers/MinervaInstance";

import StructureMap from "./../managers/StructureMap";

// the master structure, meant to represent a user's entire environment when working
// within the tool. bound to user id and is created for every new user.
export default class AkashicRecord {
  constructor(userId, dateCreated, id, name, records, database) {
    this.boundTo = userId;
    this.dateCreated = dateCreated || new Date().toISOString();
    this.id = id || uuidv4();
    this.name = name;
    this.database = database;

    // contains all of the data structures in an akashic record.
    this.records = records || {
      hypostasis: [],
      athenaeum: [],
      grimoire: [],
      node: [],
      shard: []
    };
  }

  parseStructures(data) {
    // parse and reconstruct data by iterating over the json object from localstorage

    for (let [k, v] of Object.entries(data)) {
      console.log({ key: k, value: v });
    }
  }

  setBoundTo(userId) {
    this.boundTo = userId;

    return this;
  }

  // how should I handle storing data structures in the record? should I store ids
  // and just retrieve the corresponding data structures from another store that
  // contains the actual objects? should I store the structures
  // in the records object?
  addToRecord(id, type, data, minerva) {
    const s = StructureMap[type];
    let t = type.toLowerCase();

    if (!s instanceof Structure)
      throw new TypeError(`${s} is not a proper structure.`);

    this.records[t].push({ id, data });
    minerva.record = this;

    return this;
  }

  editRecord(id, type, data, minerva) {
    const s = StructureMap[type];
    let t = type.toLowerCase();

    if (!s instanceof Structure)
      throw new TypeError(`${s} is not a proper structure.`);

    this.records[t].map(item => (item.id === id ? { data } : item));

    minerva.record = this;
  }

  removeFromRecord(id, type, data, minerva) {
    const s = StructureMap[type];
    let t = type.toLowerCase();

    if (!id || type)
      throw new TypeError(`${s} does not have the correct format`);

    this.records[t].filter(e => id === e.id);

    minerva.record = this;
  }

  exportRecord(db = false) {
    return db ? this : JSON.stringify(this);
  }

  static retrieveAkashicRecord(userId, name, dbObject, database = false) {
    if (database) {
      // retreive record for user with name from database
    } else {
      // retrieve from localStorage
      const record = Minerva._store[name];

      const { dateCreated, records } = record;

      return new AkashicRecord(
        userId,
        dateCreated,
        userId,
        name,
        records,
        database
      );
    }
  }

  static setAkashicRecord(userId, dateCreated, id, name, records) {
    if (!userId || !dateCreated || !id || !name || !records)
      throw new SyntaxError("retrieveAkashicRecord requires all arguments.");

    return new this(userId, dateCreated, id, name, records);
  }
}
