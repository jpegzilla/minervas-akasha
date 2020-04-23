export default (minerva, search, options) => {
  const { usingMimeOption, usingTypeOption } = options;
  const { query, type } = search;

  const foundRecords = {
    count: 0,
    records: []
  };

  const allRecords = Object.values(minerva.record.records).flat(Infinity);

  // construct the search results object
  allRecords.forEach(record => {
    const { id, tags, type: recType, data: recData, name } = record;
    const { file, metadata, notes } = recData;

    // search results object
    const foundInObject = {};
    // found location string, mainly for debugging
    let foundIn = "";

    // make sure only the records with the correct type are found
    if (type === "any" || type === recType) {
      // check for --mime / --type options being used
      if (!usingMimeOption) {
        foundIn += `\nfound type: true`;
        foundInObject.type = true;
      } else if (usingTypeOption) {
        foundIn += `\nfound type: true`;
        foundInObject.type = true;
      }

      // if there's a file in the record, check for mime and title search parameter matches
      if (file) {
        const { mime, title } = file;

        if (title && query) {
          foundIn += `\nfound in title: ${title.includes(query)}`;
          foundInObject.title = title.includes(query);
        }

        if (mime) {
          // if using --mime option
          if (usingMimeOption) {
            foundIn += `\nfound mime using mime option: ${mime.includes(
              search.mime
            )}`;
            foundInObject.mime = mime.includes(search.mime);
          }

          // look for query in mime type
          if (query) {
            foundIn += `\nfound mime in query: ${mime.includes(query)}`;
            foundInObject.mimeQuery = mime.includes(query);
          }
        }
      }

      // if a query string exists
      if (query) {
        // find query in metadata
        if (metadata) {
          const metadataString = Object.values(metadata).join(", ");

          const matchingMetadata = metadataString.toLowerCase().includes(query);

          if (matchingMetadata) {
            foundIn += `\nfound in metadata: ${matchingMetadata}`;
            foundInObject.metadata = matchingMetadata;
          }
        }

        // find in name
        foundIn += `\nfound in name: ${name.includes(query)}`;
        foundInObject.name = name.includes(query);

        // find in notes
        if (notes) {
          foundIn += `\nfound in notes: ${notes.includes(query)}`;
          foundInObject.notes = notes.includes(query);
        }

        // find in id
        foundIn += `\nfound in id: ${id.includes(query)}`;
        foundInObject.id = id.includes(query);

        // find in tags
        if (tags.some(item => item.name.includes(query))) {
          const matchingTags = tags
            .map(item => item.name.toLowerCase().includes(query) && item.name)
            .filter(Boolean)
            .join(", ");

          if (matchingTags) {
            foundIn += `\nfound in tags: ${!!matchingTags}`;
            foundInObject.tags = !!matchingTags;
          }
        }
      }

      if (foundIn) {
        const { type, mime } = foundInObject;

        if (usingMimeOption && usingTypeOption) {
          if (
            ("type" in foundInObject && !type) ||
            ("mime" in foundInObject && !mime)
          ) {
            return;
          }
        }

        // if there's a query string, look in the results object to make sure the
        // results (other than the type match) are not false, if they are all false,
        // then the current record doesn't cound as a valid result.
        // find --type shard --mime audio music
        if (query) {
          let c = 0;

          for (let [k, v] of Object.entries(foundInObject)) {
            if (k === "mime" || k === "type" || !v) continue;
            else c++;
          }

          if (c === 0) return;
        }

        if (
          (usingMimeOption && !foundInObject.mime) ||
          (usingTypeOption && !foundInObject.type)
        ) {
          return;
        }

        foundIn = foundIn.trim().replace(/^\s+|\s+$/g, "");

        foundRecords.records.push({ ...record, foundInObject });
        foundRecords.count++;
      }
    }
  });

  return foundRecords;
};
