/**
 * DatabaseInterface - a class for interacting with the server-side database.
 */
export default class DatabaseInterface {
  constructor(path) {
    this.path = path;
  }

  insert(items, type) {
    if (!items || !type) throw new SyntaxError("missing arguments to insert.");

    if (!["user", "data"].includes(type))
      throw new SyntaxError("incorrect type passed to insert.");
    else if (!items instanceof Object)
      throw new SyntaxError("incorrect format of items passed to insert.");

    const url = `${this.path}/insert/${type}`;

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "post",
        body: items
      })
        .then(_res => _res.json())
        .then(json => resolve(json))
        .catch(err => reject(err));
    });
  }

  find(type, item) {
    if (!item || !type) throw new SyntaxError("missing arguments to find.");

    if (!["user", "data"].includes(type))
      throw new SyntaxError("incorrect type passed to find.");
    else if (!item instanceof Object)
      throw new SyntaxError("incorrect format of items passed to find.");

    const url = `${this.path}/find/${type}`;

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "post",
        body: item
      })
        .then(_res => _res.json())
        .then(json => resolve(json))
        .catch(err => reject(err));
    });
  }

  update(type, item, prop, newVal) {
    if (!item || !type || !prop || !newVal)
      throw new SyntaxError("missing arguments to update.");

    if (!["user", "data"].includes(type))
      throw new SyntaxError("incorrect type passed to update.");
    else if (!item instanceof Object)
      throw new SyntaxError("incorrect format of items passed to update.");
  }

  delete(type, item) {
    if (!item || !type) throw new SyntaxError("missing arguments to delete.");

    if (!["user", "data"].includes(type))
      throw new SyntaxError("incorrect type passed to delete.");
    else if (!item instanceof Object)
      throw new SyntaxError("incorrect format of items passed to delete.");
  }

  empty(type) {
    if (!type) throw new SyntaxError("missing arguments to empty.");

    if (!["user", "data"].includes(type))
      throw new SyntaxError("incorrect type passed to empty.");
  }
}
