import { uuidv4 } from './../misc'
import ColorCodes from './utils/colorcodes'

/**
 * Structure - main structure class from which other substructures are extended
 */
export class Structure {
  /**
   * creates a new structure object
   *
   * @param {string} name    name of structure, used mainly for searching / organizing
   * @param {object} options object containing keys for tags, id, connectedTo array
   * colorCode, and accepts.
   *
   * @returns {undefined} void
   */
  constructor(name, options) {
    // tags can be added by the user to describe the structure, and sort and group
    // different structures. you can also sort by tags.
    this.tags = (options && options.tags) || []

    // used to search for the structure and display a name.
    this.name = name

    // used to internally to identify structures. used in the connections arrays.
    this.id = (options && options.id) || uuidv4()

    // shows what structures this structure is connected to. connections are all
    // directional, since connections can only be made from larger types of
    // structures to smaller types.
    this.connectedTo = (options && options.connectedTo) || {}

    // shows what user the structure belongs to.
    this.belongsTo = (options && options.belongsTo) || null

    // shows the data within the structure such as notes
    this.data = (options && options.data) || {
      notes: ''
    }

    // these color codes are applied to data structures' html representations as css
    // classes, which are used to apply colors to the elements.
    this.colorCode = (options && options.colorCode) || ColorCodes.white

    // the inputs that each structure connects to are defined on the child classes
    this.accepts = (options && options.accepts) || []

    this.connectsTo = (options && options.connectsTo) || null

    this.createdAt = new Date().toISOString()

    this.updatedAt = new Date().toISOString()
  }
}
