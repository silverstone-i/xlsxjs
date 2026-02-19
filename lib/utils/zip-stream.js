const events = require("events");
const fs = require("fs");
const JSZip = require("jszip");

const StreamBuf = require("./stream-buf");
const { stringToBuffer } = require("./browser-buffer-encode");

// =============================================================================
// The ZipWriter class
// Packs streamed data into an output zip stream
class ZipWriter extends events.EventEmitter {
  constructor(options) {
    super();

    // Map archiver-style zlib options to JSZip compressionOptions
    const zlibLevel = options && options.zlib && options.zlib.level;
    this.options = {
      type: "nodebuffer",
      compression: "DEFLATE",
      ...(zlibLevel != null
        ? { compressionOptions: { level: zlibLevel } }
        : {}),
    };

    this.zip = new JSZip();
    this.stream = new StreamBuf();
  }

  append(data, options) {
    if (options.hasOwnProperty("base64") && options.base64) {
      this.zip.file(options.name, data, { base64: true });
    } else {
      // https://www.npmjs.com/package/process
      if (process.browser && typeof data === "string") {
        // use TextEncoder in browser
        data = stringToBuffer(data);
      }
      this.zip.file(options.name, data);
    }
  }

  // Read a file from disk and add it to the archive
  file(filename, options) {
    const data = fs.readFileSync(filename);
    this.zip.file(options.name, data);
  }

  async finalize() {
    const content = await this.zip.generateAsync(this.options);
    this.stream.end(content);
    this.emit("finish");
  }

  // ==========================================================================
  // Stream.Readable interface
  read(size) {
    return this.stream.read(size);
  }

  setEncoding(encoding) {
    return this.stream.setEncoding(encoding);
  }

  pause() {
    return this.stream.pause();
  }

  resume() {
    return this.stream.resume();
  }

  isPaused() {
    return this.stream.isPaused();
  }

  pipe(destination, options) {
    return this.stream.pipe(destination, options);
  }

  unpipe(destination) {
    return this.stream.unpipe(destination);
  }

  unshift(chunk) {
    return this.stream.unshift(chunk);
  }

  wrap(stream) {
    return this.stream.wrap(stream);
  }
}

// =============================================================================

module.exports = {
  ZipWriter,
};
