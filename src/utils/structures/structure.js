import { uuidv4 } from "./../misc";
import { colorcodes } from "./utils/colorcodes";

export class Structure {
  constructor(name) {
    // tags can be added by the user to describe the structure, and sort and group
    // different structures. you can also sort by tags.
    this.tags = [];

    // used to search for the structure and display a name.
    this.name = name;

    // used to internally to identify structures. used in the connections arrays.
    this.id = uuidv4();

    // shows what structures this structure is connected to. connections are all
    // directional, since connections can only be made from larger types of
    // structures to smaller types.
    this.connectedTo = [];

    // these color codes are applied to data structures' html representations as css
    // classes, which are used to apply colors to the elements.
    this.colorCode = colorcodes.pink;
  }

  destroy() {}
}
