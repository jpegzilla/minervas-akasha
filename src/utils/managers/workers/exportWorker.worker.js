self.addEventListener("message", e => {
  const { data, action } = e.data;

  switch (action) {
    case "stringify":
      const dbString = JSON.stringify(data);

      const exportObject = {
        minerva_db: dbString
      };

      self.postMessage(exportObject);
      break;
    case "stringifyandblob":
      const exportString = JSON.stringify(data);

      const blob = new Blob([exportString], { type: "application/json" });

      const reader = new FileReader();

      reader.addEventListener("load", e => {
        const dataUrl = e.target.result;

        self.postMessage(dataUrl);
      });

      reader.readAsDataURL(blob);
      break;
    case "parse":
      break;
    default:
      throw new Error("unknown action passed to compressionWorker.");
  }
});
