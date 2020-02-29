export class XMLParser {
  /**
   * constructor - Description
   *
   * @param {string} path path to the rss resource
   *
   * @returns {undefined}
   */
  constructor(path) {
    this.path = path;
    this.document = null;
  }

  /**
   * parse - parses the xml at given path.
   *
   * @param {string} [type=text/xml] type of xml data to parse
   *
   * @returns {document} parsed xml document
   */
  async parse(type = "text/xml") {
    const f = await fetch(this.path);

    const res = await f.text();

    const parsed = new DOMParser().parseFromString(res, type);

    this.document = parsed;

    return parsed;
  }

  /**
   * parseItem - parses one xml element, given a list of tags.
   *
   * @param {element} item  element to read
   * @param {array} props list of tags to retrieve from item
   *
   * @returns {array} array of retrieved elements
   */
  parseItem(item, props) {
    const things = {};

    const tempItem = item;

    props.forEach(prop => {
      const o = tempItem.getElementsByTagName(prop);

      things[prop] = Array.from(o);
    });

    return things;
  }

  /**
   * getAllTags - retrieve an array of all tags matching a string.
   *
   * @param {string} tag name of tag to retrieve
   *
   * @returns {array} array of all tags matching a string
   */
  getAllTags(tag) {
    if (!this.document) throw new Error("invalid document provided");

    const allItems = this.document.getElementsByTagName(tag);

    return Array.from(allItems);
  }
}
