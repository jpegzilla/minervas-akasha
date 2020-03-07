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

  /**
   * addToRecord - add a new structure to the record
   *
   * @param {string}    id        unique id for the class
   * @param {Structure} structure instance of a structure to be added
   * @param {Minerva}   minerva   current instance of minerva
   *
   * @returns {object} instance of akashicrecord
   */
  addToRecord(id, structure, minerva) {
    if (!structure instanceof Structure)
      throw new TypeError(`${structure} is not a proper structure.`);

    this.records[structure.type].push({
      id,
      name: structure.name,
      data: structure.data
    });

    minerva.record = this;

    return this;
  }

  /**
   * editRecord - edit a record in the akashicrecord instance
   *
   * @param {string}    id        unique id belonging to the record
   * @param {string}    type      type of structure to be edited
   * @param {object}    data      object containing the new data for the structure
   * @param {Minerva}   minerva   current instance of minerva
   *
   * @returns {undefined} void
   */
  editRecord(id, type, key, value, minerva) {
    if (!id || !type || !key || !value || !minerva)
      throw new SyntaxError("editRecord missing params");
    if (!StructureMap[type] instanceof Structure)
      throw new TypeError(`${id} is not a proper structure.`);

    const newTypeRecords = this.records[type].map(item => {
      if (item.id === id) item[key] = value;

      return item;
    });

    this.records = { ...this.records, [type]: newTypeRecords };

    minerva.record = this;

    return this;
  }

  /**
   * removeRecord - remove a record from akasha
   *
   * @param {string} id       unique id for the record to remove
   * @param {string} type     type of record to be removed
   * @param {Minerva} minerva current instance of minerva
   *
   * @returns {undefined} void
   */
  removeRecord(id, type, minerva) {
    if (!StructureMap[type] instanceof Structure)
      throw new TypeError(`${id} is not a proper structure.`);

    const newTypeRecords = this.records[type].filter(item => id !== item.id);

    this.records = { ...this.records, [type]: newTypeRecords };

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
