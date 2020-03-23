const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });

  return blob;
};

self.addEventListener("message", async message => {
  const { action, src, mime } = message.data;

  let response;

  switch (action) {
    case "getObjectUrl":
      response = URL.createObjectURL(b64toBlob(src.split(",")[1], mime));

      break;
    default:
      throw new Error("unknown action passed to metadataWorker.");
  }

  if (response) self.postMessage(response);
});
