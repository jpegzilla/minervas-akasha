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

  updateTimeStamp() {
    this.updatedAt = new Date().toISOString()
  }

  /**
   * addTag - add a tag to the structure
   *
   * @param {string} name  name for the tag
   * @param {string} color color for the tag
   *
   * @returns {undefined} void
   */
  addTag(name, color) {
    if (!(color in ColorCodes))
      throw new SyntaxError('invalid color passed to addTag')

    if (this.tags.find(e => e.name === name))
      throw new SyntaxError('tag already exsists.')

    const tag = {
      name,
      id: uuidv4(),
      color: ColorCodes[color]
    }

    this.tags.push(tag)

    this.updateTimeStamp()
  }

  /**
   * removeTag - remove a tag from a structure
   *
   * @param {string} name name of tag to remove
   *
   * @returns {Structure} the current instance of the structure
   */
  removeTag(name) {
    this.tags.filter(e => e.name !== name)

    this.createdAt = new Date().toISOString()
    this.updateTimeStamp()

    return this
  }

  /**
   * changeColor - changes the color code of the structure
   *
   * @param {string} color color from the colorcodes object
   *
   * @returns {Structure} the current instance of the structure
   */
  changeColor(color) {
    if (!(color in ColorCodes))
      throw new SyntaxError('invalid color passed to changeColor')

    this.colorCode = ColorCodes[color]

    this.updateTimeStamp()

    return this
  }

  /**
   * reset - resets the properties of the current structure to default
   *
   * @returns {Structure} the current instance of the structure
   */
  reset() {
    this.connectedTo = []
    this.tags = []
    this.colorCode = ColorCodes.white
    this.updateTimeStamp()

    return this
  }

  connect(node) {
    if (!this.accepts.every(e => node instanceof e))
      throw new SyntaxError('invalid argument to connect.')

    this.connectedTo.push(node)

    this.data[node.constructor.id] = node.data

    this.updateTimeStamp()
  }

  disconnect(node) {
    if (!this.accepts.every(e => node instanceof e))
      throw new SyntaxError('invalid argument to disconnect.')

    this.connectedTo.filter(e => e.id !== node.id)

    this.updateTimeStamp()
  }
}
