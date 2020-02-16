import { uuidv4 } from "./../misc";
import { colorcodes } from "./utils/colorcodes";

export class Structure {
  constructor(name, options) {
    // tags can be added by the user to describe the structure, and sort and group
    // different structures. you can also sort by tags.
    this.tags = (options && options.tags) || [];

    // determines state of display
    this.display = (options && options.display) || "visible";

    // determines screen position
    this.position = (options && options.position) || { x: 0, y: 0 };

    // used to search for the structure and display a name.
    this.name = name;

    // used to internally to identify structures. used in the connections arrays.
    this.id = (options && options.id) || uuidv4();

    // shows what structures this structure is connected to. connections are all
    // directional, since connections can only be made from larger types of
    // structures to smaller types.
    this.connectedTo = (options && options.connectedTo) || [];

    // these color codes are applied to data structures' html representations as css
    // classes, which are used to apply colors to the elements.
    this.colorCode = (options && options.colorCode) || colorcodes.white;

    // the inputs that each structure connects to are defined on the child classes
    this.accepts = (options && options.accepts) || [];
  }

  addTag(name, color) {
    if (!(color in colorcodes))
      throw new SyntaxError("invalid color passed to addTag");

    if (this.tags.find(e => e.name === name))
      throw new SyntaxError("tag already exsists.");

    const tag = {
      name,
      id: uuidv4(),
      color: colorcodes[color]
    };

    this.tags.push(tag);
  }

  removeTag(name) {
    this.tags.filter(e => e.name === name);
  }

  changeColor(color) {
    if (!(color in colorcodes))
      throw new SyntaxError("invalid color passed to addTag");

    this.colorCode = colorcodes[color];
  }

  destroy() {
    this.connectedTo = [];
    this.tags = [];
    this.colorCode = colorcodes.white;
  }

  connect(node) {
    if (!this.accepts.every(e => node instanceof e))
      throw new SyntaxError("invalid argument to connect.");

    this.connectedTo.push(node);
  }

  disconnect(node) {
    if (!this.accepts.every(e => node instanceof e))
      throw new SyntaxError("invalid argument to disconnect.");

    this.connectedTo.filter(e => e.id === node.id);
  }
}
