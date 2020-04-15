export default minerva => {
  let recordMessage = "list of all records:\r\n";

  Object.entries(minerva.record.records).forEach(([k, v], i, a) => {
    if (i !== a.length - 1) recordMessage += `\r\n  ${k}:`;
    else recordMessage += `  ${k}:\n`;

    if (v.length > 0) {
      v.forEach(record => {
        const { name, id, createdAt, updatedAt, connectedTo } = record;
        const created = new Date(createdAt).toLocaleString(
          minerva.settings.dateFormat
        );
        const updated = new Date(updatedAt).toLocaleString(
          minerva.settings.dateFormat
        );

        recordMessage += `\n    name: ${name} (${id.substring(
          0,
          8
        )})\n    created at: ${created}\n    updated: ${updated}\n    connected to ${
          Object.keys(connectedTo).length
        } ${
          Object.keys(connectedTo).length === 1 ? "record" : "records"
        }\r\n\n`;

        recordMessage += `

        \n`;
      });
    } else
      recordMessage += ` none.

    \n`;
  });

  return recordMessage;
};
