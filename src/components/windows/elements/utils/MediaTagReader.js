import jDataView from "jdataview";
import jsmediatags from "jsmediatags";
import * as musicMetadata from "music-metadata-browser";
import { audioTagSchema, imageTagSchema } from "./mediaTagSchema";
import EXIF from "exif-js";

export default class MediaTagReader {
  constructor(mediaString) {
    this.mediaString = mediaString;
  }

  async dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    const mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString });
    const buf = await blob.arrayBuffer();

    return { blob, buffer: buf };
  }

  getAudioInfo() {
    const { mediaString } = this;

    return new Promise((resolve, reject) => {
      this.dataURItoBlob(mediaString).then(e => {
        this.view = new jDataView(e.buffer);

        const { view } = this;

        if (view.getString(3, view.byteLength - 128) === "TAG") {
          const title = view.getString(30, view.tell());
          const artist = view.getString(30, view.tell());
          const album = view.getString(30, view.tell());
          const year = view.getString(4, view.tell());

          const metadata = {
            title: title.trim(),
            artist: artist.trim(),
            album: album.trim(),
            year: year.trim()
          };

          ["title", "artist", "album", "year"].forEach(i => {
            // for some reason, this data sometimes has control characters in it. remove them

            metadata[i] = metadata[i]
              .replace(/[^\x00-\x7F]/g, "")
              .replace(/[\x00-\x1F\x7F-\x9F]/g, "");
          });

          resolve({ status: "success", message: metadata });
        } else {
          resolve({ status: "failure", message: "no id3v1 data found" });
        }
      });
    });
  }

  getFullAudioInfo(mime) {
    const { mediaString } = this;
    // fix this so that whatever lib is used to pull tags, the resulting tags
    // are formatted in identically structured objects

    return new Promise((resolve, reject) => {
      this.dataURItoBlob(mediaString)
        .then(res => {
          // console.log("reading a file with type", mime);
          // console.log("buffer is:", res.blob);

          const parseWithJSMedia = [/mp3/gi, /image/gi, /video/gi];

          if (parseWithJSMedia.some(e => e.test(mime))) {
            jsmediatags.read(res.blob, {
              onSuccess: meta => {
                audioTagSchema(meta).then(res => {
                  resolve({ status: "success", metadata: res });
                });
              },
              onError: err => {
                console.log(err);
              }
            });
          } else {
            // use this mainly for ogg / flac support
            musicMetadata.parseBlob(res.blob).then(meta => {
              audioTagSchema(meta).then(res => {
                resolve({ status: "success", metadata: res });
              });
            });
          }
        })
        .catch(err => {
          console.log(err);
          reject({ status: "failure", message: err });
        });
    });
  }

  getFullImageInfo() {
    const { mediaString } = this;
    // fix this so that whatever lib is used to pull tags, the resulting tags
    // are formatted in identically structured objects

    return new Promise((resolve, reject) => {
      this.dataURItoBlob(mediaString)
        .then(res => {
          // console.log("reading a file with type", mime);
          // console.log("buffer is:", res.blob);

          EXIF.getData(res.blob, function() {
            const tags = {};

            for (const [k, v] of Object.entries(this.exifdata)) {
              tags[k.toString().toLowerCase()] = v.toString().toLowerCase();
            }

            imageTagSchema(tags).then(res => {
              resolve(res);
            });
          });
        })
        .catch(err => {
          console.log(err);
          reject({ status: "failure", message: err });
        });
    });
  }

  static arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }
}
