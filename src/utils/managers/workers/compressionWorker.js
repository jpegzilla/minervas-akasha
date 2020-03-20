import * as LZUTF8 from "./lzutf8.min";

self.addEventListener("message", message => {
  if (message.data === "ping") {
    self.postMessage("pong");
  }

  if (message.data.action) {
    let response;

    switch (message.data.action) {
      case "compress":
        response = LZUTF8.compress(message.data.toCompress, {
          outputEncoding: "StorageBinaryString"
        });

        break;

      case "decompress":
        response = LZUTF8.decompress(message.data.toDecompress, {
          inputEncoding: "StorageBinaryString"
        });
        break;

      default:
        throw new Error("unknown action passed to compressionWorker.");
    }

    self.postMessage(response);
  }
});
