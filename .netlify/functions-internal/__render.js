var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/.pnpm/@sveltejs+kit@1.0.0-next.193_stylus@0.54.8+svelte@3.44.1/node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone2 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location2 = headers.get("Location");
        const locationURL = location2 === null ? null : new URL(location2, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _Blob, Blob2, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/.pnpm/@sveltejs+kit@1.0.0-next.193_stylus@0.54.8+svelte@3.44.1/node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name) {
          return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name) {
          return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error2) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error2);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error2) {
          stream._inFlightWriteRequest._reject(error2);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error2) {
          stream._inFlightCloseRequest._reject(error2);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error2);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error2);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error2);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error2);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error2) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error2);
        }
        function streamBrandCheckException$2(name) {
          return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error2 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error2) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
              } else {
                finalize(isError, error2);
              }
            }
            function finalize(isError, error2) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error2);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable2 = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable2, "readable", "ReadableWritablePair");
          assertReadableStream(readable2, `${context} has member 'readable' that`);
          const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable2, "writable", "ReadableWritablePair");
          assertWritableStream(writable2, `${context} has member 'writable' that`);
          return { readable: readable2, writable: writable2 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name) {
          return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name) {
          return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush2 = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush2 === void 0 ? void 0 : convertTransformerFlushCallback(flush2, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error2 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error2);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable2 = stream._writable;
              const state = writable2._state;
              if (state === "erroring") {
                throw writable2._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable2 = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable2._state === "errored") {
              throw readable2._storedError;
            }
            ReadableStreamDefaultControllerClose(readable2._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable2._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name) {
          return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error2) {
          process2.emitWarning = emitWarning;
          throw error2;
        }
      } catch (error2) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob3 } = require("buffer");
      if (Blob3 && !Blob3.prototype.stream) {
        Blob3.prototype.stream = function name(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error2) {
    }
    POOL_SIZE = 65536;
    _Blob = class Blob {
      #parts = [];
      #type = "";
      #size = 0;
      constructor(blobParts = [], options2 = {}) {
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof Blob) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
          this.#parts.push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
      }
      get size() {
        return this.#size;
      }
      get type() {
        return this.#type;
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(this.#parts, false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(this.#parts, false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(this.#parts, true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob2 = _Blob;
    Blob$1 = Blob2;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (error_) => {
            const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        import_stream.default.Readable.from(body.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error2;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
        throw error2;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback, thisArg = void 0) {
        for (const name of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name), name, this]);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/.pnpm/@sveltejs+adapter-netlify@1.0.0-next.35/node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/.pnpm/@sveltejs+adapter-netlify@1.0.0-next.35/node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/.pnpm/color-name@1.1.4/node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/.pnpm/color-name@1.1.4/node_modules/color-name/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/.pnpm/is-arrayish@0.3.2/node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS({
  "node_modules/.pnpm/is-arrayish@0.3.2/node_modules/is-arrayish/index.js"(exports, module2) {
    init_shims();
    module2.exports = function isArrayish(obj) {
      if (!obj || typeof obj === "string") {
        return false;
      }
      return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
    };
  }
});

// node_modules/.pnpm/simple-swizzle@0.2.2/node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS({
  "node_modules/.pnpm/simple-swizzle@0.2.2/node_modules/simple-swizzle/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var isArrayish = require_is_arrayish();
    var concat = Array.prototype.concat;
    var slice = Array.prototype.slice;
    var swizzle = module2.exports = function swizzle2(args) {
      var results = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (isArrayish(arg)) {
          results = concat.call(results, slice.call(arg));
        } else {
          results.push(arg);
        }
      }
      return results;
    };
    swizzle.wrap = function(fn) {
      return function() {
        return fn(swizzle(arguments));
      };
    };
  }
});

// node_modules/.pnpm/color-string@1.6.0/node_modules/color-string/index.js
var require_color_string = __commonJS({
  "node_modules/.pnpm/color-string@1.6.0/node_modules/color-string/index.js"(exports, module2) {
    init_shims();
    var colorNames = require_color_name();
    var swizzle = require_simple_swizzle();
    var reverseNames = {};
    for (name in colorNames) {
      if (colorNames.hasOwnProperty(name)) {
        reverseNames[colorNames[name]] = name;
      }
    }
    var name;
    var cs = module2.exports = {
      to: {},
      get: {}
    };
    cs.get = function(string) {
      var prefix = string.substring(0, 3).toLowerCase();
      var val;
      var model;
      switch (prefix) {
        case "hsl":
          val = cs.get.hsl(string);
          model = "hsl";
          break;
        case "hwb":
          val = cs.get.hwb(string);
          model = "hwb";
          break;
        default:
          val = cs.get.rgb(string);
          model = "rgb";
          break;
      }
      if (!val) {
        return null;
      }
      return { model, value: val };
    };
    cs.get.rgb = function(string) {
      if (!string) {
        return null;
      }
      var abbr = /^#([a-f0-9]{3,4})$/i;
      var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
      var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
      var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
      var keyword = /(\D+)/;
      var rgb = [0, 0, 0, 1];
      var match;
      var i;
      var hexAlpha;
      if (match = string.match(hex)) {
        hexAlpha = match[2];
        match = match[1];
        for (i = 0; i < 3; i++) {
          var i2 = i * 2;
          rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha, 16) / 255;
        }
      } else if (match = string.match(abbr)) {
        match = match[1];
        hexAlpha = match[3];
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i] + match[i], 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
        }
      } else if (match = string.match(rgba)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i + 1], 0);
        }
        if (match[4]) {
          rgb[3] = parseFloat(match[4]);
        }
      } else if (match = string.match(per)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
        }
        if (match[4]) {
          rgb[3] = parseFloat(match[4]);
        }
      } else if (match = string.match(keyword)) {
        if (match[1] === "transparent") {
          return [0, 0, 0, 0];
        }
        rgb = colorNames[match[1]];
        if (!rgb) {
          return null;
        }
        rgb[3] = 1;
        return rgb;
      } else {
        return null;
      }
      for (i = 0; i < 3; i++) {
        rgb[i] = clamp(rgb[i], 0, 255);
      }
      rgb[3] = clamp(rgb[3], 0, 1);
      return rgb;
    };
    cs.get.hsl = function(string) {
      if (!string) {
        return null;
      }
      var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?[\d\.]+)\s*)?\)$/;
      var match = string.match(hsl);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) + 360) % 360;
        var s2 = clamp(parseFloat(match[2]), 0, 100);
        var l = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, s2, l, a];
      }
      return null;
    };
    cs.get.hwb = function(string) {
      if (!string) {
        return null;
      }
      var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
      var match = string.match(hwb);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var w = clamp(parseFloat(match[2]), 0, 100);
        var b = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, w, b, a];
      }
      return null;
    };
    cs.to.hex = function() {
      var rgba = swizzle(arguments);
      return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
    };
    cs.to.rgb = function() {
      var rgba = swizzle(arguments);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
    };
    cs.to.rgb.percent = function() {
      var rgba = swizzle(arguments);
      var r = Math.round(rgba[0] / 255 * 100);
      var g = Math.round(rgba[1] / 255 * 100);
      var b = Math.round(rgba[2] / 255 * 100);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
    };
    cs.to.hsl = function() {
      var hsla = swizzle(arguments);
      return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
    };
    cs.to.hwb = function() {
      var hwba = swizzle(arguments);
      var a = "";
      if (hwba.length >= 4 && hwba[3] !== 1) {
        a = ", " + hwba[3];
      }
      return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
    };
    cs.to.keyword = function(rgb) {
      return reverseNames[rgb.slice(0, 3)];
    };
    function clamp(num, min, max) {
      return Math.min(Math.max(min, num), max);
    }
    function hexDouble(num) {
      var str = num.toString(16).toUpperCase();
      return str.length < 2 ? "0" + str : str;
    }
  }
});

// node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/conversions.js"(exports, module2) {
    init_shims();
    var cssKeywords = require_color_name();
    var reverseKeywords = {};
    for (const key of Object.keys(cssKeywords)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
    var convert = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    module2.exports = convert;
    for (const model of Object.keys(convert)) {
      if (!("channels" in convert[model])) {
        throw new Error("missing channels property: " + model);
      }
      if (!("labels" in convert[model])) {
        throw new Error("missing channel labels property: " + model);
      }
      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error("channel and label counts mismatch: " + model);
      }
      const { channels, labels } = convert[model];
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], "channels", { value: channels });
      Object.defineProperty(convert[model], "labels", { value: labels });
    }
    convert.rgb.hsl = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      const delta = max - min;
      let h;
      let s2;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      const l = (min + max) / 2;
      if (max === min) {
        s2 = 0;
      } else if (l <= 0.5) {
        s2 = delta / (max + min);
      } else {
        s2 = delta / (2 - max - min);
      }
      return [h, s2 * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      let rdif;
      let gdif;
      let bdif;
      let h;
      let s2;
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const v = Math.max(r, g, b);
      const diff = v - Math.min(r, g, b);
      const diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = 0;
        s2 = 0;
      } else {
        s2 = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s2 * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      const r = rgb[0];
      const g = rgb[1];
      let b = rgb[2];
      const h = convert.rgb.hsl(rgb)[0];
      const w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const k = Math.min(1 - r, 1 - g, 1 - b);
      const c = (1 - r - k) / (1 - k) || 0;
      const m = (1 - g - k) / (1 - k) || 0;
      const y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
    }
    convert.rgb.keyword = function(rgb) {
      const reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      let currentClosestDistance = Infinity;
      let currentClosestKeyword;
      for (const keyword of Object.keys(cssKeywords)) {
        const value = cssKeywords[keyword];
        const distance = comparativeDistance(rgb, value);
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      let r = rgb[0] / 255;
      let g = rgb[1] / 255;
      let b = rgb[2] / 255;
      r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
      g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
      b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
      const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      const xyz = convert.rgb.xyz(rgb);
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      const h = hsl[0] / 360;
      const s2 = hsl[1] / 100;
      const l = hsl[2] / 100;
      let t2;
      let t3;
      let val;
      if (s2 === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s2);
      } else {
        t2 = l + s2 - l * s2;
      }
      const t1 = 2 * l - t2;
      const rgb = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      const h = hsl[0];
      let s2 = hsl[1] / 100;
      let l = hsl[2] / 100;
      let smin = s2;
      const lmin = Math.max(l, 0.01);
      l *= 2;
      s2 *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      const v = (l + s2) / 2;
      const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s2 / (l + s2);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      const h = hsv[0] / 60;
      const s2 = hsv[1] / 100;
      let v = hsv[2] / 100;
      const hi = Math.floor(h) % 6;
      const f = h - Math.floor(h);
      const p = 255 * v * (1 - s2);
      const q = 255 * v * (1 - s2 * f);
      const t = 255 * v * (1 - s2 * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    };
    convert.hsv.hsl = function(hsv) {
      const h = hsv[0];
      const s2 = hsv[1] / 100;
      const v = hsv[2] / 100;
      const vmin = Math.max(v, 0.01);
      let sl;
      let l;
      l = (2 - s2) * v;
      const lmin = (2 - s2) * vmin;
      sl = s2 * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      const h = hwb[0] / 360;
      let wh = hwb[1] / 100;
      let bl = hwb[2] / 100;
      const ratio = wh + bl;
      let f;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      const i = Math.floor(6 * h);
      const v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      const n = wh + f * (v - wh);
      let r;
      let g;
      let b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      const c = cmyk[0] / 100;
      const m = cmyk[1] / 100;
      const y = cmyk[2] / 100;
      const k = cmyk[3] / 100;
      const r = 1 - Math.min(1, c * (1 - k) + k);
      const g = 1 - Math.min(1, m * (1 - k) + k);
      const b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      const x = xyz[0] / 100;
      const y = xyz[1] / 100;
      const z = xyz[2] / 100;
      let r;
      let g;
      let b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let x;
      let y;
      let z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      const y2 = y ** 3;
      const x2 = x ** 3;
      const z2 = z ** 3;
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let h;
      const hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      const c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      const l = lch[0];
      const c = lch[1];
      const h = lch[2];
      const hr = h / 360 * 2 * Math.PI;
      const a = c * Math.cos(hr);
      const b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args, saturation = null) {
      const [r, g, b] = args;
      let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args) {
      return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };
    convert.rgb.ansi256 = function(args) {
      const r = args[0];
      const g = args[1];
      const b = args[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args) {
      let color = args % 10;
      if (color === 0 || color === 7) {
        if (args > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      const mult = (~~(args > 50) + 1) * 0.5;
      const r = (color & 1) * mult * 255;
      const g = (color >> 1 & 1) * mult * 255;
      const b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args) {
      if (args >= 232) {
        const c = (args - 232) * 10 + 8;
        return [c, c, c];
      }
      args -= 16;
      let rem;
      const r = Math.floor(args / 36) / 5 * 255;
      const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
      const b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args) {
      const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args) {
      const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      let colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map((char) => {
          return char + char;
        }).join("");
      }
      const integer = parseInt(colorString, 16);
      const r = integer >> 16 & 255;
      const g = integer >> 8 & 255;
      const b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const max = Math.max(Math.max(r, g), b);
      const min = Math.min(Math.min(r, g), b);
      const chroma = max - min;
      let grayscale;
      let hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      const s2 = hsl[1] / 100;
      const l = hsl[2] / 100;
      const c = l < 0.5 ? 2 * s2 * l : 2 * s2 * (1 - l);
      let f = 0;
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      const s2 = hsv[1] / 100;
      const v = hsv[2] / 100;
      const c = s2 * v;
      let f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      const h = hcg[0] / 360;
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      const pure = [0, 0, 0];
      const hi = h % 1 * 6;
      const v = hi % 1;
      const w = 1 - v;
      let mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      let f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const l = g * (1 - c) + 0.5 * c;
      let s2 = 0;
      if (l > 0 && l < 0.5) {
        s2 = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s2 = c / (2 * (1 - l));
      }
      return [hcg[0], s2 * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      const w = hwb[1] / 100;
      const b = hwb[2] / 100;
      const v = 1 - b;
      const c = v - w;
      let g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args) {
      return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };
    convert.gray.hsl = function(args) {
      return [0, 0, args[0]];
    };
    convert.gray.hsv = convert.gray.hsl;
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      const val = Math.round(gray[0] / 100 * 255) & 255;
      const integer = (val << 16) + (val << 8) + val;
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/route.js
var require_route = __commonJS({
  "node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/route.js"(exports, module2) {
    init_shims();
    var conversions = require_conversions();
    function buildGraph() {
      const graph = {};
      const models = Object.keys(conversions);
      for (let len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      const graph = buildGraph();
      const queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        const current = queue.pop();
        const adjacents = Object.keys(conversions[current]);
        for (let len = adjacents.length, i = 0; i < len; i++) {
          const adjacent = adjacents[i];
          const node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args) {
        return to(from(args));
      };
    }
    function wrapConversion(toModel, graph) {
      const path = [graph[toModel].parent, toModel];
      let fn = conversions[graph[toModel].parent][toModel];
      let cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path;
      return fn;
    }
    module2.exports = function(fromModel) {
      const graph = deriveBFS(fromModel);
      const conversion = {};
      const models = Object.keys(graph);
      for (let len = models.length, i = 0; i < len; i++) {
        const toModel = models[i];
        const node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "node_modules/.pnpm/color-convert@2.0.1/node_modules/color-convert/index.js"(exports, module2) {
    init_shims();
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      const wrappedFn = function(...args) {
        const arg0 = args[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args = arg0;
        }
        return fn(args);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      const wrappedFn = function(...args) {
        const arg0 = args[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args = arg0;
        }
        const result = fn(args);
        if (typeof result === "object") {
          for (let len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach((fromModel) => {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      const routes = route(fromModel);
      const routeModels = Object.keys(routes);
      routeModels.forEach((toModel) => {
        const fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// node_modules/.pnpm/color@4.0.1/node_modules/color/index.js
var require_color = __commonJS({
  "node_modules/.pnpm/color@4.0.1/node_modules/color/index.js"(exports, module2) {
    init_shims();
    var colorString = require_color_string();
    var convert = require_color_convert();
    var _slice = [].slice;
    var skippedModels = [
      "keyword",
      "gray",
      "hex"
    ];
    var hashedModelKeys = {};
    for (const model of Object.keys(convert)) {
      hashedModelKeys[_slice.call(convert[model].labels).sort().join("")] = model;
    }
    var limiters = {};
    function Color(object, model) {
      if (!(this instanceof Color)) {
        return new Color(object, model);
      }
      if (model && model in skippedModels) {
        model = null;
      }
      if (model && !(model in convert)) {
        throw new Error("Unknown model: " + model);
      }
      let i;
      let channels;
      if (object == null) {
        this.model = "rgb";
        this.color = [0, 0, 0];
        this.valpha = 1;
      } else if (object instanceof Color) {
        this.model = object.model;
        this.color = object.color.slice();
        this.valpha = object.valpha;
      } else if (typeof object === "string") {
        const result = colorString.get(object);
        if (result === null) {
          throw new Error("Unable to parse color from string: " + object);
        }
        this.model = result.model;
        channels = convert[this.model].channels;
        this.color = result.value.slice(0, channels);
        this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
      } else if (object.length > 0) {
        this.model = model || "rgb";
        channels = convert[this.model].channels;
        const newArray = _slice.call(object, 0, channels);
        this.color = zeroArray(newArray, channels);
        this.valpha = typeof object[channels] === "number" ? object[channels] : 1;
      } else if (typeof object === "number") {
        this.model = "rgb";
        this.color = [
          object >> 16 & 255,
          object >> 8 & 255,
          object & 255
        ];
        this.valpha = 1;
      } else {
        this.valpha = 1;
        const keys = Object.keys(object);
        if ("alpha" in object) {
          keys.splice(keys.indexOf("alpha"), 1);
          this.valpha = typeof object.alpha === "number" ? object.alpha : 0;
        }
        const hashedKeys = keys.sort().join("");
        if (!(hashedKeys in hashedModelKeys)) {
          throw new Error("Unable to parse color from object: " + JSON.stringify(object));
        }
        this.model = hashedModelKeys[hashedKeys];
        const labels = convert[this.model].labels;
        const color = [];
        for (i = 0; i < labels.length; i++) {
          color.push(object[labels[i]]);
        }
        this.color = zeroArray(color);
      }
      if (limiters[this.model]) {
        channels = convert[this.model].channels;
        for (i = 0; i < channels; i++) {
          const limit = limiters[this.model][i];
          if (limit) {
            this.color[i] = limit(this.color[i]);
          }
        }
      }
      this.valpha = Math.max(0, Math.min(1, this.valpha));
      if (Object.freeze) {
        Object.freeze(this);
      }
    }
    Color.prototype = {
      toString() {
        return this.string();
      },
      toJSON() {
        return this[this.model]();
      },
      string(places) {
        let self2 = this.model in colorString.to ? this : this.rgb();
        self2 = self2.round(typeof places === "number" ? places : 1);
        const args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
        return colorString.to[self2.model](args);
      },
      percentString(places) {
        const self2 = this.rgb().round(typeof places === "number" ? places : 1);
        const args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
        return colorString.to.rgb.percent(args);
      },
      array() {
        return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
      },
      object() {
        const result = {};
        const channels = convert[this.model].channels;
        const labels = convert[this.model].labels;
        for (let i = 0; i < channels; i++) {
          result[labels[i]] = this.color[i];
        }
        if (this.valpha !== 1) {
          result.alpha = this.valpha;
        }
        return result;
      },
      unitArray() {
        const rgb = this.rgb().color;
        rgb[0] /= 255;
        rgb[1] /= 255;
        rgb[2] /= 255;
        if (this.valpha !== 1) {
          rgb.push(this.valpha);
        }
        return rgb;
      },
      unitObject() {
        const rgb = this.rgb().object();
        rgb.r /= 255;
        rgb.g /= 255;
        rgb.b /= 255;
        if (this.valpha !== 1) {
          rgb.alpha = this.valpha;
        }
        return rgb;
      },
      round(places) {
        places = Math.max(places || 0, 0);
        return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
      },
      alpha(value) {
        if (arguments.length > 0) {
          return new Color(this.color.concat(Math.max(0, Math.min(1, value))), this.model);
        }
        return this.valpha;
      },
      red: getset("rgb", 0, maxfn(255)),
      green: getset("rgb", 1, maxfn(255)),
      blue: getset("rgb", 2, maxfn(255)),
      hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, (value) => (value % 360 + 360) % 360),
      saturationl: getset("hsl", 1, maxfn(100)),
      lightness: getset("hsl", 2, maxfn(100)),
      saturationv: getset("hsv", 1, maxfn(100)),
      value: getset("hsv", 2, maxfn(100)),
      chroma: getset("hcg", 1, maxfn(100)),
      gray: getset("hcg", 2, maxfn(100)),
      white: getset("hwb", 1, maxfn(100)),
      wblack: getset("hwb", 2, maxfn(100)),
      cyan: getset("cmyk", 0, maxfn(100)),
      magenta: getset("cmyk", 1, maxfn(100)),
      yellow: getset("cmyk", 2, maxfn(100)),
      black: getset("cmyk", 3, maxfn(100)),
      x: getset("xyz", 0, maxfn(100)),
      y: getset("xyz", 1, maxfn(100)),
      z: getset("xyz", 2, maxfn(100)),
      l: getset("lab", 0, maxfn(100)),
      a: getset("lab", 1),
      b: getset("lab", 2),
      keyword(value) {
        if (arguments.length > 0) {
          return new Color(value);
        }
        return convert[this.model].keyword(this.color);
      },
      hex(value) {
        if (arguments.length > 0) {
          return new Color(value);
        }
        return colorString.to.hex(this.rgb().round().color);
      },
      rgbNumber() {
        const rgb = this.rgb().color;
        return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
      },
      luminosity() {
        const rgb = this.rgb().color;
        const lum = [];
        for (const [i, element] of rgb.entries()) {
          const chan = element / 255;
          lum[i] = chan <= 0.03928 ? chan / 12.92 : ((chan + 0.055) / 1.055) ** 2.4;
        }
        return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
      },
      contrast(color2) {
        const lum1 = this.luminosity();
        const lum2 = color2.luminosity();
        if (lum1 > lum2) {
          return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
      },
      level(color2) {
        const contrastRatio = this.contrast(color2);
        if (contrastRatio >= 7.1) {
          return "AAA";
        }
        return contrastRatio >= 4.5 ? "AA" : "";
      },
      isDark() {
        const rgb = this.rgb().color;
        const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3;
        return yiq < 128;
      },
      isLight() {
        return !this.isDark();
      },
      negate() {
        const rgb = this.rgb();
        for (let i = 0; i < 3; i++) {
          rgb.color[i] = 255 - rgb.color[i];
        }
        return rgb;
      },
      lighten(ratio) {
        const hsl = this.hsl();
        hsl.color[2] += hsl.color[2] * ratio;
        return hsl;
      },
      darken(ratio) {
        const hsl = this.hsl();
        hsl.color[2] -= hsl.color[2] * ratio;
        return hsl;
      },
      saturate(ratio) {
        const hsl = this.hsl();
        hsl.color[1] += hsl.color[1] * ratio;
        return hsl;
      },
      desaturate(ratio) {
        const hsl = this.hsl();
        hsl.color[1] -= hsl.color[1] * ratio;
        return hsl;
      },
      whiten(ratio) {
        const hwb = this.hwb();
        hwb.color[1] += hwb.color[1] * ratio;
        return hwb;
      },
      blacken(ratio) {
        const hwb = this.hwb();
        hwb.color[2] += hwb.color[2] * ratio;
        return hwb;
      },
      grayscale() {
        const rgb = this.rgb().color;
        const value = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
        return Color.rgb(value, value, value);
      },
      fade(ratio) {
        return this.alpha(this.valpha - this.valpha * ratio);
      },
      opaquer(ratio) {
        return this.alpha(this.valpha + this.valpha * ratio);
      },
      rotate(degrees) {
        const hsl = this.hsl();
        let hue = hsl.color[0];
        hue = (hue + degrees) % 360;
        hue = hue < 0 ? 360 + hue : hue;
        hsl.color[0] = hue;
        return hsl;
      },
      mix(mixinColor, weight) {
        if (!mixinColor || !mixinColor.rgb) {
          throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
        }
        const color1 = mixinColor.rgb();
        const color2 = this.rgb();
        const p = weight === void 0 ? 0.5 : weight;
        const w = 2 * p - 1;
        const a = color1.alpha() - color2.alpha();
        const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
        const w2 = 1 - w1;
        return Color.rgb(w1 * color1.red() + w2 * color2.red(), w1 * color1.green() + w2 * color2.green(), w1 * color1.blue() + w2 * color2.blue(), color1.alpha() * p + color2.alpha() * (1 - p));
      }
    };
    for (const model of Object.keys(convert)) {
      if (skippedModels.includes(model)) {
        continue;
      }
      const channels = convert[model].channels;
      Color.prototype[model] = function() {
        if (this.model === model) {
          return new Color(this);
        }
        if (arguments.length > 0) {
          return new Color(arguments, model);
        }
        const newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
        return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
      };
      Color[model] = function(color) {
        if (typeof color === "number") {
          color = zeroArray(_slice.call(arguments), channels);
        }
        return new Color(color, model);
      };
    }
    function roundTo(number, places) {
      return Number(number.toFixed(places));
    }
    function roundToPlace(places) {
      return function(number) {
        return roundTo(number, places);
      };
    }
    function getset(model, channel, modifier) {
      model = Array.isArray(model) ? model : [model];
      for (const m of model) {
        (limiters[m] || (limiters[m] = []))[channel] = modifier;
      }
      model = model[0];
      return function(value) {
        let result;
        if (arguments.length > 0) {
          if (modifier) {
            value = modifier(value);
          }
          result = this[model]();
          result.color[channel] = value;
          return result;
        }
        result = this[model]().color[channel];
        if (modifier) {
          result = modifier(result);
        }
        return result;
      };
    }
    function maxfn(max) {
      return function(v) {
        return Math.max(0, Math.min(max, v));
      };
    }
    function assertArray(value) {
      return Array.isArray(value) ? value : [value];
    }
    function zeroArray(array, length) {
      for (let i = 0; i < length; i++) {
        if (typeof array[i] !== "number") {
          array[i] = 0;
        }
      }
      return array;
    }
    module2.exports = Color;
  }
});

// node_modules/.pnpm/bezier-easing@2.1.0/node_modules/bezier-easing/src/index.js
var require_src = __commonJS({
  "node_modules/.pnpm/bezier-easing@2.1.0/node_modules/bezier-easing/src/index.js"(exports, module2) {
    init_shims();
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 1e-3;
    var SUBDIVISION_PRECISION = 1e-7;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    var kSplineTableSize = 11;
    var kSampleStepSize = 1 / (kSplineTableSize - 1);
    var float32ArraySupported = typeof Float32Array === "function";
    function A(aA1, aA2) {
      return 1 - 3 * aA2 + 3 * aA1;
    }
    function B(aA1, aA2) {
      return 3 * aA2 - 6 * aA1;
    }
    function C(aA1) {
      return 3 * aA1;
    }
    function calcBezier(aT, aA1, aA2) {
      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }
    function getSlope(aT, aA1, aA2) {
      return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
    }
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }
    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0) {
          return aGuessT;
        }
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }
    function LinearEasing(x) {
      return x;
    }
    module2.exports = function bezier(mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error("bezier x values must be in [0, 1] range");
      }
      if (mX1 === mY1 && mX2 === mY2) {
        return LinearEasing;
      }
      var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
      function getTForX(aX) {
        var intervalStart = 0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }
        --currentSample;
        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }
      return function BezierEasing2(x) {
        if (x === 0) {
          return 0;
        }
        if (x === 1) {
          return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
      };
    };
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_color = __toModule(require_color());
var import_bezier_easing = __toModule(require_src());
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue$1 = [];
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue$1.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue$1.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue$1.length; i += 2) {
            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
          }
          subscriber_queue$1.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
var escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable$1($session);
    const props = {
      stores: {
        page: writable$1(null),
        navigating: writable$1(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${page && page.path ? try_serialize(page.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page && page.query ? s$1(page.query.toString()) : ""}),
						params: ${page && page.params ? try_serialize(page.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$6 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: null
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$6);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n\n<head>\n  <meta charset="utf-8" />\n  <link rel="icon" href="/favicon.png" />\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n  ' + head + '\n</head>\n\n<body>\n  <div id="svelte">' + body + "</div>\n</body>\n\n</html>\n";
var options$1 = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings2 = default_settings) {
  set_paths(settings2.paths);
  set_prerendering(settings2.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options$1 = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-b7d48c75.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-b7d48c75.js", assets + "/_app/chunks/vendor-cbf02e87.js", assets + "/_app/chunks/singletons-12a22614.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options$1.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings2.paths,
    prerender: true,
    read: settings2.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "img/.DS_Store", "size": 10244, "type": null }, { "file": "img/ZIFt6yuOMAQ@1000w.png", "size": 399284, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@1000w.webp", "size": 44408, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@1250w.png", "size": 569391, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@1250w.webp", "size": 57116, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@1500w.png", "size": 712923, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@1500w.webp", "size": 65396, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@15w.jpg", "size": 448, "type": "image/jpeg" }, { "file": "img/ZIFt6yuOMAQ@15w.webp", "size": 128, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@1750w.png", "size": 897573, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@1750w.webp", "size": 79490, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@2000w.png", "size": 1101381, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@2000w.webp", "size": 90040, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@250w.png", "size": 41385, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@250w.webp", "size": 8544, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@500w.png", "size": 128915, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@500w.webp", "size": 20152, "type": "image/webp" }, { "file": "img/ZIFt6yuOMAQ@750w.png", "size": 250487, "type": "image/png" }, { "file": "img/ZIFt6yuOMAQ@750w.webp", "size": 32018, "type": "image/webp" }, { "file": "img/arrow.svg", "size": 1070, "type": "image/svg+xml" }, { "file": "img/bakugai-img@1000w.png", "size": 888372, "type": "image/png" }, { "file": "img/bakugai-img@1000w.webp", "size": 78014, "type": "image/webp" }, { "file": "img/bakugai-img@1250w.png", "size": 1225194, "type": "image/png" }, { "file": "img/bakugai-img@1250w.webp", "size": 97696, "type": "image/webp" }, { "file": "img/bakugai-img@1500w.png", "size": 1597153, "type": "image/png" }, { "file": "img/bakugai-img@1500w.webp", "size": 115084, "type": "image/webp" }, { "file": "img/bakugai-img@15w.jpg", "size": 1314, "type": "image/jpeg" }, { "file": "img/bakugai-img@15w.webp", "size": 884, "type": "image/webp" }, { "file": "img/bakugai-img@1750w.png", "size": 1996986, "type": "image/png" }, { "file": "img/bakugai-img@1750w.webp", "size": 133048, "type": "image/webp" }, { "file": "img/bakugai-img@2000w.png", "size": 2419265, "type": "image/png" }, { "file": "img/bakugai-img@2000w.webp", "size": 151488, "type": "image/webp" }, { "file": "img/bakugai-img@250w.png", "size": 109884, "type": "image/png" }, { "file": "img/bakugai-img@250w.webp", "size": 14478, "type": "image/webp" }, { "file": "img/bakugai-img@500w.png", "size": 327304, "type": "image/png" }, { "file": "img/bakugai-img@500w.webp", "size": 35456, "type": "image/webp" }, { "file": "img/bakugai-img@750w.png", "size": 592663, "type": "image/png" }, { "file": "img/bakugai-img@750w.webp", "size": 55838, "type": "image/webp" }, { "file": "img/checker.svg", "size": 354, "type": "image/svg+xml" }, { "file": "img/cup-run_ss@1000w.png", "size": 544117, "type": "image/png" }, { "file": "img/cup-run_ss@1000w.webp", "size": 29254, "type": "image/webp" }, { "file": "img/cup-run_ss@1250w.png", "size": 773974, "type": "image/png" }, { "file": "img/cup-run_ss@1250w.webp", "size": 36480, "type": "image/webp" }, { "file": "img/cup-run_ss@1500w.png", "size": 1022946, "type": "image/png" }, { "file": "img/cup-run_ss@1500w.webp", "size": 44562, "type": "image/webp" }, { "file": "img/cup-run_ss@15w.jpg", "size": 4598, "type": "image/jpeg" }, { "file": "img/cup-run_ss@15w.webp", "size": 4278, "type": "image/webp" }, { "file": "img/cup-run_ss@1750w.png", "size": 1290392, "type": "image/png" }, { "file": "img/cup-run_ss@1750w.webp", "size": 52384, "type": "image/webp" }, { "file": "img/cup-run_ss@2000w.png", "size": 1569414, "type": "image/png" }, { "file": "img/cup-run_ss@2000w.webp", "size": 60454, "type": "image/webp" }, { "file": "img/cup-run_ss@250w.png", "size": 59820, "type": "image/png" }, { "file": "img/cup-run_ss@250w.webp", "size": 8254, "type": "image/webp" }, { "file": "img/cup-run_ss@500w.png", "size": 179285, "type": "image/png" }, { "file": "img/cup-run_ss@500w.webp", "size": 14776, "type": "image/webp" }, { "file": "img/cup-run_ss@750w.png", "size": 345086, "type": "image/png" }, { "file": "img/cup-run_ss@750w.webp", "size": 21866, "type": "image/webp" }, { "file": "img/facebook.svg", "size": 1230, "type": "image/svg+xml" }, { "file": "img/fall_in_parfait-ss1@1000w.png", "size": 410341, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@1000w.webp", "size": 35234, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@1250w.png", "size": 590738, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@1250w.webp", "size": 44634, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@1500w.png", "size": 804799, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@1500w.webp", "size": 53726, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@15w.jpg", "size": 468, "type": "image/jpeg" }, { "file": "img/fall_in_parfait-ss1@15w.webp", "size": 146, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@1750w.png", "size": 1056706, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@1750w.webp", "size": 63316, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@2000w.png", "size": 1318160, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@2000w.webp", "size": 73204, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@250w.png", "size": 47299, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@250w.webp", "size": 6794, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@500w.png", "size": 134960, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@500w.webp", "size": 15984, "type": "image/webp" }, { "file": "img/fall_in_parfait-ss1@750w.png", "size": 256409, "type": "image/png" }, { "file": "img/fall_in_parfait-ss1@750w.webp", "size": 25030, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@1000w.png", "size": 727206, "type": "image/png" }, { "file": "img/foh7rj5YI_E@1000w.webp", "size": 66240, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@1250w.png", "size": 1062122, "type": "image/png" }, { "file": "img/foh7rj5YI_E@1250w.webp", "size": 88004, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@1500w.png", "size": 1450021, "type": "image/png" }, { "file": "img/foh7rj5YI_E@1500w.webp", "size": 110612, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@15w.jpg", "size": 500, "type": "image/jpeg" }, { "file": "img/foh7rj5YI_E@15w.webp", "size": 138, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@1750w.png", "size": 1885203, "type": "image/png" }, { "file": "img/foh7rj5YI_E@1750w.webp", "size": 133598, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@2000w.png", "size": 2210934, "type": "image/png" }, { "file": "img/foh7rj5YI_E@2000w.webp", "size": 144336, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@250w.png", "size": 69483, "type": "image/png" }, { "file": "img/foh7rj5YI_E@250w.webp", "size": 9522, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@500w.png", "size": 228685, "type": "image/png" }, { "file": "img/foh7rj5YI_E@500w.webp", "size": 25682, "type": "image/webp" }, { "file": "img/foh7rj5YI_E@750w.png", "size": 449867, "type": "image/png" }, { "file": "img/foh7rj5YI_E@750w.webp", "size": 45074, "type": "image/webp" }, { "file": "img/github.svg", "size": 2124, "type": "image/svg+xml" }, { "file": "img/lastfm.svg", "size": 3983, "type": "image/svg+xml" }, { "file": "img/m44wTn8nk9Y@1000w.png", "size": 477770, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@1000w.webp", "size": 45426, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@1250w.png", "size": 669973, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@1250w.webp", "size": 59772, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@1500w.png", "size": 803350, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@1500w.webp", "size": 69170, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@15w.jpg", "size": 456, "type": "image/jpeg" }, { "file": "img/m44wTn8nk9Y@15w.webp", "size": 140, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@1750w.png", "size": 997097, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@1750w.webp", "size": 83580, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@2000w.png", "size": 1220605, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@2000w.webp", "size": 97752, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@250w.png", "size": 51533, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@250w.webp", "size": 8484, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@500w.png", "size": 160151, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@500w.webp", "size": 20160, "type": "image/webp" }, { "file": "img/m44wTn8nk9Y@750w.png", "size": 304320, "type": "image/png" }, { "file": "img/m44wTn8nk9Y@750w.webp", "size": 32702, "type": "image/webp" }, { "file": "img/members/.DS_Store", "size": 6148, "type": null }, { "file": "img/members/amu@1000w.png", "size": 48437, "type": "image/png" }, { "file": "img/members/amu@1000w.webp", "size": 12136, "type": "image/webp" }, { "file": "img/members/amu@1250w.png", "size": 73128, "type": "image/png" }, { "file": "img/members/amu@1250w.webp", "size": 15014, "type": "image/webp" }, { "file": "img/members/amu@1500w.png", "size": 97061, "type": "image/png" }, { "file": "img/members/amu@1500w.webp", "size": 18484, "type": "image/webp" }, { "file": "img/members/amu@1750w.png", "size": 127756, "type": "image/png" }, { "file": "img/members/amu@1750w.webp", "size": 22194, "type": "image/webp" }, { "file": "img/members/amu@2000w.png", "size": 145084, "type": "image/png" }, { "file": "img/members/amu@2000w.webp", "size": 26e3, "type": "image/webp" }, { "file": "img/members/amu@250w.png", "size": 6389, "type": "image/png" }, { "file": "img/members/amu@250w.webp", "size": 2224, "type": "image/webp" }, { "file": "img/members/amu@500w.png", "size": 15920, "type": "image/png" }, { "file": "img/members/amu@500w.webp", "size": 5042, "type": "image/webp" }, { "file": "img/members/amu@750w.png", "size": 34342, "type": "image/png" }, { "file": "img/members/amu@750w.webp", "size": 8436, "type": "image/webp" }, { "file": "img/members/echo@1000w.png", "size": 744613, "type": "image/png" }, { "file": "img/members/echo@1000w.webp", "size": 36994, "type": "image/webp" }, { "file": "img/members/echo@1250w.png", "size": 996038, "type": "image/png" }, { "file": "img/members/echo@1250w.webp", "size": 46722, "type": "image/webp" }, { "file": "img/members/echo@1500w.png", "size": 1312649, "type": "image/png" }, { "file": "img/members/echo@1500w.webp", "size": 59354, "type": "image/webp" }, { "file": "img/members/echo@1750w.png", "size": 1649320, "type": "image/png" }, { "file": "img/members/echo@1750w.webp", "size": 72878, "type": "image/webp" }, { "file": "img/members/echo@2000w.png", "size": 2009150, "type": "image/png" }, { "file": "img/members/echo@2000w.webp", "size": 85604, "type": "image/webp" }, { "file": "img/members/echo@250w.png", "size": 64636, "type": "image/png" }, { "file": "img/members/echo@250w.webp", "size": 5644, "type": "image/webp" }, { "file": "img/members/echo@500w.png", "size": 222863, "type": "image/png" }, { "file": "img/members/echo@500w.webp", "size": 14106, "type": "image/webp" }, { "file": "img/members/echo@750w.png", "size": 454032, "type": "image/png" }, { "file": "img/members/echo@750w.webp", "size": 24628, "type": "image/webp" }, { "file": "img/members/hibiki@1000w.png", "size": 213332, "type": "image/png" }, { "file": "img/members/hibiki@1000w.webp", "size": 12680, "type": "image/webp" }, { "file": "img/members/hibiki@1250w.png", "size": 393869, "type": "image/png" }, { "file": "img/members/hibiki@1250w.webp", "size": 16542, "type": "image/webp" }, { "file": "img/members/hibiki@1500w.png", "size": 632457, "type": "image/png" }, { "file": "img/members/hibiki@1500w.webp", "size": 20310, "type": "image/webp" }, { "file": "img/members/hibiki@1750w.png", "size": 912688, "type": "image/png" }, { "file": "img/members/hibiki@1750w.webp", "size": 24430, "type": "image/webp" }, { "file": "img/members/hibiki@2000w.png", "size": 1236210, "type": "image/png" }, { "file": "img/members/hibiki@2000w.webp", "size": 29200, "type": "image/webp" }, { "file": "img/members/hibiki@250w.png", "size": 17104, "type": "image/png" }, { "file": "img/members/hibiki@250w.webp", "size": 2916, "type": "image/webp" }, { "file": "img/members/hibiki@500w.png", "size": 44134, "type": "image/png" }, { "file": "img/members/hibiki@500w.webp", "size": 5870, "type": "image/webp" }, { "file": "img/members/hibiki@750w.png", "size": 96945, "type": "image/png" }, { "file": "img/members/hibiki@750w.webp", "size": 9378, "type": "image/webp" }, { "file": "img/members/i-da@1000w.png", "size": 520151, "type": "image/png" }, { "file": "img/members/i-da@1000w.webp", "size": 39564, "type": "image/webp" }, { "file": "img/members/i-da@1250w.png", "size": 715504, "type": "image/png" }, { "file": "img/members/i-da@1250w.webp", "size": 51098, "type": "image/webp" }, { "file": "img/members/i-da@1500w.png", "size": 930759, "type": "image/png" }, { "file": "img/members/i-da@1500w.webp", "size": 61530, "type": "image/webp" }, { "file": "img/members/i-da@1750w.png", "size": 1156572, "type": "image/png" }, { "file": "img/members/i-da@1750w.webp", "size": 74072, "type": "image/webp" }, { "file": "img/members/i-da@2000w.png", "size": 1400286, "type": "image/png" }, { "file": "img/members/i-da@2000w.webp", "size": 84228, "type": "image/webp" }, { "file": "img/members/i-da@250w.png", "size": 60852, "type": "image/png" }, { "file": "img/members/i-da@250w.webp", "size": 7992, "type": "image/webp" }, { "file": "img/members/i-da@500w.png", "size": 189458, "type": "image/png" }, { "file": "img/members/i-da@500w.webp", "size": 19998, "type": "image/webp" }, { "file": "img/members/i-da@750w.png", "size": 344158, "type": "image/png" }, { "file": "img/members/i-da@750w.webp", "size": 29346, "type": "image/webp" }, { "file": "img/members/kazuemon@1000w.png", "size": 823170, "type": "image/png" }, { "file": "img/members/kazuemon@1000w.webp", "size": 31474, "type": "image/webp" }, { "file": "img/members/kazuemon@1250w.png", "size": 1147833, "type": "image/png" }, { "file": "img/members/kazuemon@1250w.webp", "size": 41188, "type": "image/webp" }, { "file": "img/members/kazuemon@1500w.png", "size": 1491161, "type": "image/png" }, { "file": "img/members/kazuemon@1500w.webp", "size": 50680, "type": "image/webp" }, { "file": "img/members/kazuemon@1750w.png", "size": 1867643, "type": "image/png" }, { "file": "img/members/kazuemon@1750w.webp", "size": 62130, "type": "image/webp" }, { "file": "img/members/kazuemon@2000w.png", "size": 2251683, "type": "image/png" }, { "file": "img/members/kazuemon@2000w.webp", "size": 73492, "type": "image/webp" }, { "file": "img/members/kazuemon@250w.png", "size": 91146, "type": "image/png" }, { "file": "img/members/kazuemon@250w.webp", "size": 7488, "type": "image/webp" }, { "file": "img/members/kazuemon@500w.png", "size": 288506, "type": "image/png" }, { "file": "img/members/kazuemon@500w.webp", "size": 15570, "type": "image/webp" }, { "file": "img/members/kazuemon@750w.png", "size": 537957, "type": "image/png" }, { "file": "img/members/kazuemon@750w.webp", "size": 23256, "type": "image/webp" }, { "file": "img/members/machiko@1000w.png", "size": 275299, "type": "image/png" }, { "file": "img/members/machiko@1000w.webp", "size": 16700, "type": "image/webp" }, { "file": "img/members/machiko@1250w.png", "size": 387526, "type": "image/png" }, { "file": "img/members/machiko@1250w.webp", "size": 20994, "type": "image/webp" }, { "file": "img/members/machiko@1500w.png", "size": 514728, "type": "image/png" }, { "file": "img/members/machiko@1500w.webp", "size": 25330, "type": "image/webp" }, { "file": "img/members/machiko@1750w.png", "size": 642454, "type": "image/png" }, { "file": "img/members/machiko@1750w.webp", "size": 30564, "type": "image/webp" }, { "file": "img/members/machiko@2000w.png", "size": 780545, "type": "image/png" }, { "file": "img/members/machiko@2000w.webp", "size": 36076, "type": "image/webp" }, { "file": "img/members/machiko@250w.png", "size": 39339, "type": "image/png" }, { "file": "img/members/machiko@250w.webp", "size": 5906, "type": "image/webp" }, { "file": "img/members/machiko@500w.png", "size": 105443, "type": "image/png" }, { "file": "img/members/machiko@500w.webp", "size": 10428, "type": "image/webp" }, { "file": "img/members/machiko@750w.png", "size": 195894, "type": "image/png" }, { "file": "img/members/machiko@750w.webp", "size": 13370, "type": "image/webp" }, { "file": "img/members/neo@1000w.png", "size": 1263295, "type": "image/png" }, { "file": "img/members/neo@1000w.webp", "size": 96396, "type": "image/webp" }, { "file": "img/members/neo@1250w.png", "size": 1754126, "type": "image/png" }, { "file": "img/members/neo@1250w.webp", "size": 119222, "type": "image/webp" }, { "file": "img/members/neo@1500w.png", "size": 2292362, "type": "image/png" }, { "file": "img/members/neo@1500w.webp", "size": 143608, "type": "image/webp" }, { "file": "img/members/neo@1750w.png", "size": 2882653, "type": "image/png" }, { "file": "img/members/neo@1750w.webp", "size": 168170, "type": "image/webp" }, { "file": "img/members/neo@2000w.png", "size": 3501901, "type": "image/png" }, { "file": "img/members/neo@2000w.webp", "size": 192144, "type": "image/webp" }, { "file": "img/members/neo@250w.png", "size": 113470, "type": "image/png" }, { "file": "img/members/neo@250w.webp", "size": 11960, "type": "image/webp" }, { "file": "img/members/neo@500w.png", "size": 410950, "type": "image/png" }, { "file": "img/members/neo@500w.webp", "size": 40990, "type": "image/webp" }, { "file": "img/members/neo@750w.png", "size": 820790, "type": "image/png" }, { "file": "img/members/neo@750w.webp", "size": 70836, "type": "image/webp" }, { "file": "img/necromance-scenery@1000w.png", "size": 529974, "type": "image/png" }, { "file": "img/necromance-scenery@1000w.webp", "size": 24776, "type": "image/webp" }, { "file": "img/necromance-scenery@1250w.png", "size": 764082, "type": "image/png" }, { "file": "img/necromance-scenery@1250w.webp", "size": 31822, "type": "image/webp" }, { "file": "img/necromance-scenery@1500w.png", "size": 1021608, "type": "image/png" }, { "file": "img/necromance-scenery@1500w.webp", "size": 40238, "type": "image/webp" }, { "file": "img/necromance-scenery@1750w.png", "size": 1281917, "type": "image/png" }, { "file": "img/necromance-scenery@1750w.webp", "size": 49250, "type": "image/webp" }, { "file": "img/necromance-scenery@2000w.png", "size": 1534732, "type": "image/png" }, { "file": "img/necromance-scenery@2000w.webp", "size": 59298, "type": "image/webp" }, { "file": "img/necromance-scenery@250w.png", "size": 49149, "type": "image/png" }, { "file": "img/necromance-scenery@250w.webp", "size": 4160, "type": "image/webp" }, { "file": "img/necromance-scenery@500w.png", "size": 165520, "type": "image/png" }, { "file": "img/necromance-scenery@500w.webp", "size": 10760, "type": "image/webp" }, { "file": "img/necromance-scenery@750w.png", "size": 328942, "type": "image/png" }, { "file": "img/necromance-scenery@750w.webp", "size": 17584, "type": "image/webp" }, { "file": "img/necromance-system1@1000w.png", "size": 819680, "type": "image/png" }, { "file": "img/necromance-system1@1000w.webp", "size": 50274, "type": "image/webp" }, { "file": "img/necromance-system1@1250w.png", "size": 1195155, "type": "image/png" }, { "file": "img/necromance-system1@1250w.webp", "size": 67400, "type": "image/webp" }, { "file": "img/necromance-system1@1500w.png", "size": 1617040, "type": "image/png" }, { "file": "img/necromance-system1@1500w.webp", "size": 84106, "type": "image/webp" }, { "file": "img/necromance-system1@1750w.png", "size": 2076168, "type": "image/png" }, { "file": "img/necromance-system1@1750w.webp", "size": 101742, "type": "image/webp" }, { "file": "img/necromance-system1@2000w.png", "size": 2571774, "type": "image/png" }, { "file": "img/necromance-system1@2000w.webp", "size": 120054, "type": "image/webp" }, { "file": "img/necromance-system1@250w.png", "size": 71528, "type": "image/png" }, { "file": "img/necromance-system1@250w.webp", "size": 8024, "type": "image/webp" }, { "file": "img/necromance-system1@500w.png", "size": 242513, "type": "image/png" }, { "file": "img/necromance-system1@500w.webp", "size": 19934, "type": "image/webp" }, { "file": "img/necromance-system1@750w.png", "size": 496963, "type": "image/png" }, { "file": "img/necromance-system1@750w.webp", "size": 34330, "type": "image/webp" }, { "file": "img/necromance-system2@1000w.png", "size": 937092, "type": "image/png" }, { "file": "img/necromance-system2@1000w.webp", "size": 79490, "type": "image/webp" }, { "file": "img/necromance-system2@1250w.png", "size": 1377546, "type": "image/png" }, { "file": "img/necromance-system2@1250w.webp", "size": 106504, "type": "image/webp" }, { "file": "img/necromance-system2@1500w.png", "size": 1881021, "type": "image/png" }, { "file": "img/necromance-system2@1500w.webp", "size": 136054, "type": "image/webp" }, { "file": "img/necromance-system2@1750w.png", "size": 2418724, "type": "image/png" }, { "file": "img/necromance-system2@1750w.webp", "size": 160052, "type": "image/webp" }, { "file": "img/necromance-system2@2000w.png", "size": 2972349, "type": "image/png" }, { "file": "img/necromance-system2@2000w.webp", "size": 184430, "type": "image/webp" }, { "file": "img/necromance-system2@250w.png", "size": 84097, "type": "image/png" }, { "file": "img/necromance-system2@250w.webp", "size": 13348, "type": "image/webp" }, { "file": "img/necromance-system2@500w.png", "size": 278451, "type": "image/png" }, { "file": "img/necromance-system2@500w.webp", "size": 31734, "type": "image/webp" }, { "file": "img/necromance-system2@750w.png", "size": 567260, "type": "image/png" }, { "file": "img/necromance-system2@750w.webp", "size": 54132, "type": "image/webp" }, { "file": "img/necromance-system3@1000w.png", "size": 509382, "type": "image/png" }, { "file": "img/necromance-system3@1000w.webp", "size": 26100, "type": "image/webp" }, { "file": "img/necromance-system3@1250w.png", "size": 731780, "type": "image/png" }, { "file": "img/necromance-system3@1250w.webp", "size": 33298, "type": "image/webp" }, { "file": "img/necromance-system3@1500w.png", "size": 979676, "type": "image/png" }, { "file": "img/necromance-system3@1500w.webp", "size": 39806, "type": "image/webp" }, { "file": "img/necromance-system3@1750w.png", "size": 1250104, "type": "image/png" }, { "file": "img/necromance-system3@1750w.webp", "size": 47114, "type": "image/webp" }, { "file": "img/necromance-system3@2000w.png", "size": 1538669, "type": "image/png" }, { "file": "img/necromance-system3@2000w.webp", "size": 54528, "type": "image/webp" }, { "file": "img/necromance-system3@250w.png", "size": 53923, "type": "image/png" }, { "file": "img/necromance-system3@250w.webp", "size": 5372, "type": "image/webp" }, { "file": "img/necromance-system3@500w.png", "size": 164926, "type": "image/png" }, { "file": "img/necromance-system3@500w.webp", "size": 11786, "type": "image/webp" }, { "file": "img/necromance-system3@750w.png", "size": 318833, "type": "image/png" }, { "file": "img/necromance-system3@750w.webp", "size": 18796, "type": "image/webp" }, { "file": "img/necromance_character_illustration.png", "size": 3318799, "type": "image/png" }, { "file": "img/necromance_character_illustration@1000w.png", "size": 517152, "type": "image/png" }, { "file": "img/necromance_character_illustration@1000w.webp", "size": 62992, "type": "image/webp" }, { "file": "img/necromance_character_illustration@1250w.png", "size": 704415, "type": "image/png" }, { "file": "img/necromance_character_illustration@1250w.webp", "size": 82178, "type": "image/webp" }, { "file": "img/necromance_character_illustration@1500w.png", "size": 901851, "type": "image/png" }, { "file": "img/necromance_character_illustration@1500w.webp", "size": 103504, "type": "image/webp" }, { "file": "img/necromance_character_illustration@1750w.png", "size": 1113423, "type": "image/png" }, { "file": "img/necromance_character_illustration@1750w.webp", "size": 126266, "type": "image/webp" }, { "file": "img/necromance_character_illustration@2000w.png", "size": 1330587, "type": "image/png" }, { "file": "img/necromance_character_illustration@2000w.webp", "size": 149598, "type": "image/webp" }, { "file": "img/necromance_character_illustration@250w.png", "size": 78411, "type": "image/png" }, { "file": "img/necromance_character_illustration@250w.webp", "size": 11516, "type": "image/webp" }, { "file": "img/necromance_character_illustration@500w.png", "size": 201089, "type": "image/png" }, { "file": "img/necromance_character_illustration@500w.webp", "size": 26714, "type": "image/webp" }, { "file": "img/necromance_character_illustration@750w.png", "size": 349158, "type": "image/png" }, { "file": "img/necromance_character_illustration@750w.webp", "size": 43880, "type": "image/webp" }, { "file": "img/necromance_logo@1000w.png", "size": 345408, "type": "image/png" }, { "file": "img/necromance_logo@1000w.webp", "size": 72900, "type": "image/webp" }, { "file": "img/necromance_logo@1250w.png", "size": 467732, "type": "image/png" }, { "file": "img/necromance_logo@1250w.webp", "size": 95372, "type": "image/webp" }, { "file": "img/necromance_logo@1500w.png", "size": 600831, "type": "image/png" }, { "file": "img/necromance_logo@1500w.webp", "size": 118806, "type": "image/webp" }, { "file": "img/necromance_logo@1750w.png", "size": 750567, "type": "image/png" }, { "file": "img/necromance_logo@1750w.webp", "size": 141086, "type": "image/webp" }, { "file": "img/necromance_logo@2000w.png", "size": 926039, "type": "image/png" }, { "file": "img/necromance_logo@2000w.webp", "size": 163996, "type": "image/webp" }, { "file": "img/necromance_logo@250w.png", "size": 47526, "type": "image/png" }, { "file": "img/necromance_logo@250w.webp", "size": 11512, "type": "image/webp" }, { "file": "img/necromance_logo@500w.png", "size": 133272, "type": "image/png" }, { "file": "img/necromance_logo@500w.webp", "size": 30872, "type": "image/webp" }, { "file": "img/necromance_logo@750w.png", "size": 232963, "type": "image/png" }, { "file": "img/necromance_logo@750w.webp", "size": 51432, "type": "image/webp" }, { "file": "img/necromance_smile_alpha.png", "size": 918009, "type": "image/png" }, { "file": "img/necromance_smile_alpha@1000w.png", "size": 591337, "type": "image/png" }, { "file": "img/necromance_smile_alpha@1000w.webp", "size": 122506, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@1250w.png", "size": 829127, "type": "image/png" }, { "file": "img/necromance_smile_alpha@1250w.webp", "size": 164832, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@1500w.png", "size": 1101166, "type": "image/png" }, { "file": "img/necromance_smile_alpha@1500w.webp", "size": 205266, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@1750w.png", "size": 1406052, "type": "image/png" }, { "file": "img/necromance_smile_alpha@1750w.webp", "size": 246424, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@2000w.png", "size": 1727006, "type": "image/png" }, { "file": "img/necromance_smile_alpha@2000w.webp", "size": 290266, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@250w.png", "size": 80813, "type": "image/png" }, { "file": "img/necromance_smile_alpha@250w.webp", "size": 19392, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@500w.png", "size": 215912, "type": "image/png" }, { "file": "img/necromance_smile_alpha@500w.webp", "size": 48972, "type": "image/webp" }, { "file": "img/necromance_smile_alpha@750w.png", "size": 388468, "type": "image/png" }, { "file": "img/necromance_smile_alpha@750w.webp", "size": 83894, "type": "image/webp" }, { "file": "img/necromance_ss@1000w.png", "size": 546415, "type": "image/png" }, { "file": "img/necromance_ss@1000w.webp", "size": 45590, "type": "image/webp" }, { "file": "img/necromance_ss@1250w.png", "size": 798282, "type": "image/png" }, { "file": "img/necromance_ss@1250w.webp", "size": 58260, "type": "image/webp" }, { "file": "img/necromance_ss@1500w.png", "size": 1084681, "type": "image/png" }, { "file": "img/necromance_ss@1500w.webp", "size": 71868, "type": "image/webp" }, { "file": "img/necromance_ss@15w.jpg", "size": 1158, "type": "image/jpeg" }, { "file": "img/necromance_ss@15w.webp", "size": 836, "type": "image/webp" }, { "file": "img/necromance_ss@1750w.png", "size": 1404355, "type": "image/png" }, { "file": "img/necromance_ss@1750w.webp", "size": 85388, "type": "image/webp" }, { "file": "img/necromance_ss@2000w.png", "size": 1749763, "type": "image/png" }, { "file": "img/necromance_ss@2000w.webp", "size": 98016, "type": "image/webp" }, { "file": "img/necromance_ss@250w.png", "size": 53454, "type": "image/png" }, { "file": "img/necromance_ss@250w.webp", "size": 7396, "type": "image/webp" }, { "file": "img/necromance_ss@500w.png", "size": 170940, "type": "image/png" }, { "file": "img/necromance_ss@500w.webp", "size": 19092, "type": "image/webp" }, { "file": "img/necromance_ss@750w.png", "size": 337933, "type": "image/png" }, { "file": "img/necromance_ss@750w.webp", "size": 32478, "type": "image/webp" }, { "file": "img/note.svg", "size": 2370, "type": "image/svg+xml" }, { "file": "img/ogp.vectornator", "size": 739521, "type": null }, { "file": "img/qiita.svg", "size": 2656, "type": "image/svg+xml" }, { "file": "img/spinner_ss@1000w.png", "size": 437074, "type": "image/png" }, { "file": "img/spinner_ss@1000w.webp", "size": 26302, "type": "image/webp" }, { "file": "img/spinner_ss@1250w.png", "size": 573426, "type": "image/png" }, { "file": "img/spinner_ss@1250w.webp", "size": 30804, "type": "image/webp" }, { "file": "img/spinner_ss@1500w.png", "size": 749304, "type": "image/png" }, { "file": "img/spinner_ss@1500w.webp", "size": 36956, "type": "image/webp" }, { "file": "img/spinner_ss@15w.jpg", "size": 491, "type": "image/jpeg" }, { "file": "img/spinner_ss@15w.webp", "size": 122, "type": "image/webp" }, { "file": "img/spinner_ss@1750w.png", "size": 937164, "type": "image/png" }, { "file": "img/spinner_ss@1750w.webp", "size": 44040, "type": "image/webp" }, { "file": "img/spinner_ss@2000w.png", "size": 1139709, "type": "image/png" }, { "file": "img/spinner_ss@2000w.webp", "size": 51080, "type": "image/webp" }, { "file": "img/spinner_ss@250w.png", "size": 46332, "type": "image/png" }, { "file": "img/spinner_ss@250w.webp", "size": 5136, "type": "image/webp" }, { "file": "img/spinner_ss@500w.png", "size": 142647, "type": "image/png" }, { "file": "img/spinner_ss@500w.webp", "size": 12384, "type": "image/webp" }, { "file": "img/spinner_ss@750w.png", "size": 274275, "type": "image/png" }, { "file": "img/spinner_ss@750w.webp", "size": 19508, "type": "image/webp" }, { "file": "img/ssm-logo-landscape-white.svg", "size": 3971, "type": "image/svg+xml" }, { "file": "img/ssm-logo-landscape.png", "size": 64771, "type": "image/png" }, { "file": "img/ssm-logo-landscape.svg", "size": 4010, "type": "image/svg+xml" }, { "file": "img/ssm-logo-landscape@1000w.png", "size": 33320, "type": "image/png" }, { "file": "img/ssm-logo-landscape@1000w.webp", "size": 18782, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@1250w.png", "size": 42337, "type": "image/png" }, { "file": "img/ssm-logo-landscape@1250w.webp", "size": 23632, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@1500w.png", "size": 51248, "type": "image/png" }, { "file": "img/ssm-logo-landscape@1500w.webp", "size": 28966, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@15w.jpg", "size": 386, "type": "image/jpeg" }, { "file": "img/ssm-logo-landscape@15w.webp", "size": 216, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@1750w.png", "size": 57136, "type": "image/png" }, { "file": "img/ssm-logo-landscape@1750w.webp", "size": 34102, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@2000w.png", "size": 70591, "type": "image/png" }, { "file": "img/ssm-logo-landscape@2000w.webp", "size": 39660, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@250w.png", "size": 8485, "type": "image/png" }, { "file": "img/ssm-logo-landscape@250w.webp", "size": 4682, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@500w.png", "size": 16388, "type": "image/png" }, { "file": "img/ssm-logo-landscape@500w.webp", "size": 9254, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@750w.png", "size": 24927, "type": "image/png" }, { "file": "img/ssm-logo-landscape@750w.webp", "size": 13996, "type": "image/webp" }, { "file": "img/ssm-logo-landscape@ogp.jpg", "size": 331345, "type": "image/jpeg" }, { "file": "img/ssm-logo.svg", "size": 3944, "type": "image/svg+xml" }, { "file": "img/twitter.svg", "size": 1483, "type": "image/svg+xml" }, { "file": "img/vTsy8NCYSNE@1000w.png", "size": 528371, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@1000w.webp", "size": 82566, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@1250w.png", "size": 752793, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@1250w.webp", "size": 115690, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@1500w.png", "size": 916423, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@1500w.webp", "size": 128876, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@15w.jpg", "size": 450, "type": "image/jpeg" }, { "file": "img/vTsy8NCYSNE@15w.webp", "size": 114, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@1750w.png", "size": 1147255, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@1750w.webp", "size": 154728, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@2000w.png", "size": 1407513, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@2000w.webp", "size": 179114, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@250w.png", "size": 52149, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@250w.webp", "size": 10930, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@500w.png", "size": 170087, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@500w.webp", "size": 31058, "type": "image/webp" }, { "file": "img/vTsy8NCYSNE@750w.png", "size": 331506, "type": "image/png" }, { "file": "img/vTsy8NCYSNE@750w.webp", "size": 55314, "type": "image/webp" }, { "file": "img/youtube-white.svg", "size": 1429, "type": "image/svg+xml" }, { "file": "img/youtube.svg", "size": 1389, "type": "image/svg+xml" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-f5feb7f3.js", "css": [], "js": ["layout.svelte-f5feb7f3.js", "chunks/vendor-cbf02e87.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-ceb32d9d.js", "css": [], "js": ["error.svelte-ceb32d9d.js", "chunks/vendor-cbf02e87.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-b38ab9e5.js", "css": ["assets/pages/index.svelte-cbbd071a.css"], "js": ["pages/index.svelte-b38ab9e5.js", "chunks/vendor-cbf02e87.js", "chunks/singletons-12a22614.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options$1, { prerender });
}
var Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var commonjsGlobal2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var SAT$1 = { exports: {} };
(function(module2, exports) {
  (function(root, factory) {
    {
      module2["exports"] = factory();
    }
  })(commonjsGlobal2, function() {
    var SAT2 = {};
    function Vector(x, y) {
      this["x"] = x || 0;
      this["y"] = y || 0;
    }
    SAT2["Vector"] = Vector;
    SAT2["V"] = Vector;
    Vector.prototype["copy"] = Vector.prototype.copy = function(other) {
      this["x"] = other["x"];
      this["y"] = other["y"];
      return this;
    };
    Vector.prototype["clone"] = Vector.prototype.clone = function() {
      return new Vector(this["x"], this["y"]);
    };
    Vector.prototype["perp"] = Vector.prototype.perp = function() {
      var x = this["x"];
      this["x"] = this["y"];
      this["y"] = -x;
      return this;
    };
    Vector.prototype["rotate"] = Vector.prototype.rotate = function(angle) {
      var x = this["x"];
      var y = this["y"];
      this["x"] = x * Math.cos(angle) - y * Math.sin(angle);
      this["y"] = x * Math.sin(angle) + y * Math.cos(angle);
      return this;
    };
    Vector.prototype["reverse"] = Vector.prototype.reverse = function() {
      this["x"] = -this["x"];
      this["y"] = -this["y"];
      return this;
    };
    Vector.prototype["normalize"] = Vector.prototype.normalize = function() {
      var d = this.len();
      if (d > 0) {
        this["x"] = this["x"] / d;
        this["y"] = this["y"] / d;
      }
      return this;
    };
    Vector.prototype["add"] = Vector.prototype.add = function(other) {
      this["x"] += other["x"];
      this["y"] += other["y"];
      return this;
    };
    Vector.prototype["sub"] = Vector.prototype.sub = function(other) {
      this["x"] -= other["x"];
      this["y"] -= other["y"];
      return this;
    };
    Vector.prototype["scale"] = Vector.prototype.scale = function(x, y) {
      this["x"] *= x;
      this["y"] *= typeof y != "undefined" ? y : x;
      return this;
    };
    Vector.prototype["project"] = Vector.prototype.project = function(other) {
      var amt = this.dot(other) / other.len2();
      this["x"] = amt * other["x"];
      this["y"] = amt * other["y"];
      return this;
    };
    Vector.prototype["projectN"] = Vector.prototype.projectN = function(other) {
      var amt = this.dot(other);
      this["x"] = amt * other["x"];
      this["y"] = amt * other["y"];
      return this;
    };
    Vector.prototype["reflect"] = Vector.prototype.reflect = function(axis) {
      var x = this["x"];
      var y = this["y"];
      this.project(axis).scale(2);
      this["x"] -= x;
      this["y"] -= y;
      return this;
    };
    Vector.prototype["reflectN"] = Vector.prototype.reflectN = function(axis) {
      var x = this["x"];
      var y = this["y"];
      this.projectN(axis).scale(2);
      this["x"] -= x;
      this["y"] -= y;
      return this;
    };
    Vector.prototype["dot"] = Vector.prototype.dot = function(other) {
      return this["x"] * other["x"] + this["y"] * other["y"];
    };
    Vector.prototype["len2"] = Vector.prototype.len2 = function() {
      return this.dot(this);
    };
    Vector.prototype["len"] = Vector.prototype.len = function() {
      return Math.sqrt(this.len2());
    };
    function Circle(pos, r) {
      this["pos"] = pos || new Vector();
      this["r"] = r || 0;
      this["offset"] = new Vector();
    }
    SAT2["Circle"] = Circle;
    Circle.prototype["getAABBAsBox"] = Circle.prototype.getAABBAsBox = function() {
      var r = this["r"];
      var corner = this["pos"].clone().add(this["offset"]).sub(new Vector(r, r));
      return new Box(corner, r * 2, r * 2);
    };
    Circle.prototype["getAABB"] = Circle.prototype.getAABB = function() {
      return this.getAABBAsBox().toPolygon();
    };
    Circle.prototype["setOffset"] = Circle.prototype.setOffset = function(offset) {
      this["offset"] = offset;
      return this;
    };
    function Polygon(pos, points) {
      this["pos"] = pos || new Vector();
      this["angle"] = 0;
      this["offset"] = new Vector();
      this.setPoints(points || []);
    }
    SAT2["Polygon"] = Polygon;
    Polygon.prototype["setPoints"] = Polygon.prototype.setPoints = function(points) {
      var lengthChanged = !this["points"] || this["points"].length !== points.length;
      if (lengthChanged) {
        var i2;
        var calcPoints = this["calcPoints"] = [];
        var edges = this["edges"] = [];
        var normals = this["normals"] = [];
        for (i2 = 0; i2 < points.length; i2++) {
          var p1 = points[i2];
          var p2 = i2 < points.length - 1 ? points[i2 + 1] : points[0];
          if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
            points.splice(i2, 1);
            i2 -= 1;
            continue;
          }
          calcPoints.push(new Vector());
          edges.push(new Vector());
          normals.push(new Vector());
        }
      }
      this["points"] = points;
      this._recalc();
      return this;
    };
    Polygon.prototype["setAngle"] = Polygon.prototype.setAngle = function(angle) {
      this["angle"] = angle;
      this._recalc();
      return this;
    };
    Polygon.prototype["setOffset"] = Polygon.prototype.setOffset = function(offset) {
      this["offset"] = offset;
      this._recalc();
      return this;
    };
    Polygon.prototype["rotate"] = Polygon.prototype.rotate = function(angle) {
      var points = this["points"];
      var len = points.length;
      for (var i2 = 0; i2 < len; i2++) {
        points[i2].rotate(angle);
      }
      this._recalc();
      return this;
    };
    Polygon.prototype["translate"] = Polygon.prototype.translate = function(x, y) {
      var points = this["points"];
      var len = points.length;
      for (var i2 = 0; i2 < len; i2++) {
        points[i2]["x"] += x;
        points[i2]["y"] += y;
      }
      this._recalc();
      return this;
    };
    Polygon.prototype._recalc = function() {
      var calcPoints = this["calcPoints"];
      var edges = this["edges"];
      var normals = this["normals"];
      var points = this["points"];
      var offset = this["offset"];
      var angle = this["angle"];
      var len = points.length;
      var i2;
      for (i2 = 0; i2 < len; i2++) {
        var calcPoint = calcPoints[i2].copy(points[i2]);
        calcPoint["x"] += offset["x"];
        calcPoint["y"] += offset["y"];
        if (angle !== 0) {
          calcPoint.rotate(angle);
        }
      }
      for (i2 = 0; i2 < len; i2++) {
        var p1 = calcPoints[i2];
        var p2 = i2 < len - 1 ? calcPoints[i2 + 1] : calcPoints[0];
        var e = edges[i2].copy(p2).sub(p1);
        normals[i2].copy(e).perp().normalize();
      }
      return this;
    };
    Polygon.prototype["getAABBAsBox"] = Polygon.prototype.getAABBAsBox = function() {
      var points = this["calcPoints"];
      var len = points.length;
      var xMin = points[0]["x"];
      var yMin = points[0]["y"];
      var xMax = points[0]["x"];
      var yMax = points[0]["y"];
      for (var i2 = 1; i2 < len; i2++) {
        var point = points[i2];
        if (point["x"] < xMin) {
          xMin = point["x"];
        } else if (point["x"] > xMax) {
          xMax = point["x"];
        }
        if (point["y"] < yMin) {
          yMin = point["y"];
        } else if (point["y"] > yMax) {
          yMax = point["y"];
        }
      }
      return new Box(this["pos"].clone().add(new Vector(xMin, yMin)), xMax - xMin, yMax - yMin);
    };
    Polygon.prototype["getAABB"] = Polygon.prototype.getAABB = function() {
      return this.getAABBAsBox().toPolygon();
    };
    Polygon.prototype["getCentroid"] = Polygon.prototype.getCentroid = function() {
      var points = this["calcPoints"];
      var len = points.length;
      var cx = 0;
      var cy = 0;
      var ar = 0;
      for (var i2 = 0; i2 < len; i2++) {
        var p1 = points[i2];
        var p2 = i2 === len - 1 ? points[0] : points[i2 + 1];
        var a = p1["x"] * p2["y"] - p2["x"] * p1["y"];
        cx += (p1["x"] + p2["x"]) * a;
        cy += (p1["y"] + p2["y"]) * a;
        ar += a;
      }
      ar = ar * 3;
      cx = cx / ar;
      cy = cy / ar;
      return new Vector(cx, cy);
    };
    function Box(pos, w, h) {
      this["pos"] = pos || new Vector();
      this["w"] = w || 0;
      this["h"] = h || 0;
    }
    SAT2["Box"] = Box;
    Box.prototype["toPolygon"] = Box.prototype.toPolygon = function() {
      var pos = this["pos"];
      var w = this["w"];
      var h = this["h"];
      return new Polygon(new Vector(pos["x"], pos["y"]), [
        new Vector(),
        new Vector(w, 0),
        new Vector(w, h),
        new Vector(0, h)
      ]);
    };
    function Response2() {
      this["a"] = null;
      this["b"] = null;
      this["overlapN"] = new Vector();
      this["overlapV"] = new Vector();
      this.clear();
    }
    SAT2["Response"] = Response2;
    Response2.prototype["clear"] = Response2.prototype.clear = function() {
      this["aInB"] = true;
      this["bInA"] = true;
      this["overlap"] = Number.MAX_VALUE;
      return this;
    };
    var T_VECTORS = [];
    for (var i = 0; i < 10; i++) {
      T_VECTORS.push(new Vector());
    }
    var T_ARRAYS = [];
    for (var i = 0; i < 5; i++) {
      T_ARRAYS.push([]);
    }
    var T_RESPONSE = new Response2();
    var TEST_POINT = new Box(new Vector(), 1e-6, 1e-6).toPolygon();
    function flattenPointsOn(points, normal, result) {
      var min = Number.MAX_VALUE;
      var max = -Number.MAX_VALUE;
      var len = points.length;
      for (var i2 = 0; i2 < len; i2++) {
        var dot = points[i2].dot(normal);
        if (dot < min) {
          min = dot;
        }
        if (dot > max) {
          max = dot;
        }
      }
      result[0] = min;
      result[1] = max;
    }
    function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
      var rangeA = T_ARRAYS.pop();
      var rangeB = T_ARRAYS.pop();
      var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos);
      var projectedOffset = offsetV.dot(axis);
      flattenPointsOn(aPoints, axis, rangeA);
      flattenPointsOn(bPoints, axis, rangeB);
      rangeB[0] += projectedOffset;
      rangeB[1] += projectedOffset;
      if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
        T_VECTORS.push(offsetV);
        T_ARRAYS.push(rangeA);
        T_ARRAYS.push(rangeB);
        return true;
      }
      if (response) {
        var overlap = 0;
        if (rangeA[0] < rangeB[0]) {
          response["aInB"] = false;
          if (rangeA[1] < rangeB[1]) {
            overlap = rangeA[1] - rangeB[0];
            response["bInA"] = false;
          } else {
            var option1 = rangeA[1] - rangeB[0];
            var option2 = rangeB[1] - rangeA[0];
            overlap = option1 < option2 ? option1 : -option2;
          }
        } else {
          response["bInA"] = false;
          if (rangeA[1] > rangeB[1]) {
            overlap = rangeA[0] - rangeB[1];
            response["aInB"] = false;
          } else {
            var option1 = rangeA[1] - rangeB[0];
            var option2 = rangeB[1] - rangeA[0];
            overlap = option1 < option2 ? option1 : -option2;
          }
        }
        var absOverlap = Math.abs(overlap);
        if (absOverlap < response["overlap"]) {
          response["overlap"] = absOverlap;
          response["overlapN"].copy(axis);
          if (overlap < 0) {
            response["overlapN"].reverse();
          }
        }
      }
      T_VECTORS.push(offsetV);
      T_ARRAYS.push(rangeA);
      T_ARRAYS.push(rangeB);
      return false;
    }
    SAT2["isSeparatingAxis"] = isSeparatingAxis;
    function voronoiRegion(line, point) {
      var len2 = line.len2();
      var dp = point.dot(line);
      if (dp < 0) {
        return LEFT_VORONOI_REGION;
      } else if (dp > len2) {
        return RIGHT_VORONOI_REGION;
      } else {
        return MIDDLE_VORONOI_REGION;
      }
    }
    var LEFT_VORONOI_REGION = -1;
    var MIDDLE_VORONOI_REGION = 0;
    var RIGHT_VORONOI_REGION = 1;
    function pointInCircle(p, c) {
      var differenceV = T_VECTORS.pop().copy(p).sub(c["pos"]).sub(c["offset"]);
      var radiusSq = c["r"] * c["r"];
      var distanceSq = differenceV.len2();
      T_VECTORS.push(differenceV);
      return distanceSq <= radiusSq;
    }
    SAT2["pointInCircle"] = pointInCircle;
    function pointInPolygon(p, poly) {
      TEST_POINT["pos"].copy(p);
      T_RESPONSE.clear();
      var result = testPolygonPolygon(TEST_POINT, poly, T_RESPONSE);
      if (result) {
        result = T_RESPONSE["aInB"];
      }
      return result;
    }
    SAT2["pointInPolygon"] = pointInPolygon;
    function testCircleCircle(a, b, response) {
      var differenceV = T_VECTORS.pop().copy(b["pos"]).add(b["offset"]).sub(a["pos"]).sub(a["offset"]);
      var totalRadius = a["r"] + b["r"];
      var totalRadiusSq = totalRadius * totalRadius;
      var distanceSq = differenceV.len2();
      if (distanceSq > totalRadiusSq) {
        T_VECTORS.push(differenceV);
        return false;
      }
      if (response) {
        var dist = Math.sqrt(distanceSq);
        response["a"] = a;
        response["b"] = b;
        response["overlap"] = totalRadius - dist;
        response["overlapN"].copy(differenceV.normalize());
        response["overlapV"].copy(differenceV).scale(response["overlap"]);
        response["aInB"] = a["r"] <= b["r"] && dist <= b["r"] - a["r"];
        response["bInA"] = b["r"] <= a["r"] && dist <= a["r"] - b["r"];
      }
      T_VECTORS.push(differenceV);
      return true;
    }
    SAT2["testCircleCircle"] = testCircleCircle;
    function testPolygonCircle(polygon, circle, response) {
      var circlePos = T_VECTORS.pop().copy(circle["pos"]).add(circle["offset"]).sub(polygon["pos"]);
      var radius = circle["r"];
      var radius2 = radius * radius;
      var points = polygon["calcPoints"];
      var len = points.length;
      var edge = T_VECTORS.pop();
      var point = T_VECTORS.pop();
      for (var i2 = 0; i2 < len; i2++) {
        var next = i2 === len - 1 ? 0 : i2 + 1;
        var prev = i2 === 0 ? len - 1 : i2 - 1;
        var overlap = 0;
        var overlapN = null;
        edge.copy(polygon["edges"][i2]);
        point.copy(circlePos).sub(points[i2]);
        if (response && point.len2() > radius2) {
          response["aInB"] = false;
        }
        var region = voronoiRegion(edge, point);
        if (region === LEFT_VORONOI_REGION) {
          edge.copy(polygon["edges"][prev]);
          var point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev]);
          region = voronoiRegion(edge, point2);
          if (region === RIGHT_VORONOI_REGION) {
            var dist = point.len();
            if (dist > radius) {
              T_VECTORS.push(circlePos);
              T_VECTORS.push(edge);
              T_VECTORS.push(point);
              T_VECTORS.push(point2);
              return false;
            } else if (response) {
              response["bInA"] = false;
              overlapN = point.normalize();
              overlap = radius - dist;
            }
          }
          T_VECTORS.push(point2);
        } else if (region === RIGHT_VORONOI_REGION) {
          edge.copy(polygon["edges"][next]);
          point.copy(circlePos).sub(points[next]);
          region = voronoiRegion(edge, point);
          if (region === LEFT_VORONOI_REGION) {
            var dist = point.len();
            if (dist > radius) {
              T_VECTORS.push(circlePos);
              T_VECTORS.push(edge);
              T_VECTORS.push(point);
              return false;
            } else if (response) {
              response["bInA"] = false;
              overlapN = point.normalize();
              overlap = radius - dist;
            }
          }
        } else {
          var normal = edge.perp().normalize();
          var dist = point.dot(normal);
          var distAbs = Math.abs(dist);
          if (dist > 0 && distAbs > radius) {
            T_VECTORS.push(circlePos);
            T_VECTORS.push(normal);
            T_VECTORS.push(point);
            return false;
          } else if (response) {
            overlapN = normal;
            overlap = radius - dist;
            if (dist >= 0 || overlap < 2 * radius) {
              response["bInA"] = false;
            }
          }
        }
        if (overlapN && response && Math.abs(overlap) < Math.abs(response["overlap"])) {
          response["overlap"] = overlap;
          response["overlapN"].copy(overlapN);
        }
      }
      if (response) {
        response["a"] = polygon;
        response["b"] = circle;
        response["overlapV"].copy(response["overlapN"]).scale(response["overlap"]);
      }
      T_VECTORS.push(circlePos);
      T_VECTORS.push(edge);
      T_VECTORS.push(point);
      return true;
    }
    SAT2["testPolygonCircle"] = testPolygonCircle;
    function testCirclePolygon(circle, polygon, response) {
      var result = testPolygonCircle(polygon, circle, response);
      if (result && response) {
        var a = response["a"];
        var aInB = response["aInB"];
        response["overlapN"].reverse();
        response["overlapV"].reverse();
        response["a"] = response["b"];
        response["b"] = a;
        response["aInB"] = response["bInA"];
        response["bInA"] = aInB;
      }
      return result;
    }
    SAT2["testCirclePolygon"] = testCirclePolygon;
    function testPolygonPolygon(a, b, response) {
      var aPoints = a["calcPoints"];
      var aLen = aPoints.length;
      var bPoints = b["calcPoints"];
      var bLen = bPoints.length;
      for (var i2 = 0; i2 < aLen; i2++) {
        if (isSeparatingAxis(a["pos"], b["pos"], aPoints, bPoints, a["normals"][i2], response)) {
          return false;
        }
      }
      for (var i2 = 0; i2 < bLen; i2++) {
        if (isSeparatingAxis(a["pos"], b["pos"], aPoints, bPoints, b["normals"][i2], response)) {
          return false;
        }
      }
      if (response) {
        response["a"] = a;
        response["b"] = b;
        response["overlapV"].copy(response["overlapN"]).scale(response["overlap"]);
      }
      return true;
    }
    SAT2["testPolygonPolygon"] = testPolygonPolygon;
    return SAT2;
  });
})(SAT$1);
var SAT = SAT$1.exports;
var globalSettings = {
  standardWidths: [
    {
      mediaQuery: "min-aspect-ratio: 16/9",
      value: 70
    },
    {
      mediaQuery: "default",
      value: 80
    },
    {
      mediaQuery: "max-aspect-ratio: 3/4",
      value: 90
    }
  ],
  imageDirectory: "/img/",
  imageExtensionsShort: ["webp", "png"],
  imageSizes: [250, 500, 750, 1e3, 1250, 1500, 1750, 2e3],
  tinyImageSize: 15,
  tinyImageExtensionsShort: ["webp", "jpg"],
  transitionDuration: 500
};
var css$5 = {
  code: "img.svelte-7n4eh0{vertical-align:top}",
  map: null
};
function getSafeImageExtensionIndex(imageExtensionsShort) {
  return imageExtensionsShort.findIndex((i) => i == "jpg" || i == "png") || 0;
}
var Picture = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { imageId = "", sizes = "100vw", alt = `${imageId}${imageId != "" ? "\u306E" : ""}\u753B\u50CF`, width = "", height = "", click = null, title = "\u753B\u50CF", useTiny = false, loadLazy = true, groupId = "", groupImagesCount = null, imageDirectory = globalSettings.imageDirectory, imageExtensionsShort = globalSettings.imageExtensionsShort, imageSizes = globalSettings.imageSizes, tinyImageExtensionsShort = globalSettings.tinyImageExtensionsShort, tinyImageSize = globalSettings.tinyImageSize } = $$props;
  let loading = true;
  function resolveSrcsets(imageDirectory2, imageExtensionsShort2, imageSizes2, imageId2, loading2, tinyImageExtensionsShort2, tinyImageSize2) {
    return (loading2 && useTiny ? tinyImageExtensionsShort2 : imageExtensionsShort2).map((ext) => {
      if (loading2 && useTiny) {
        return `${imageDirectory2}${imageId2}@${tinyImageSize2}w.${ext} ${tinyImageSize2}w`;
      } else {
        return imageSizes2.map((size) => `${imageDirectory2}${imageId2}@${size}w.${ext} ${size}w`);
      }
    });
  }
  if ($$props.imageId === void 0 && $$bindings.imageId && imageId !== void 0)
    $$bindings.imageId(imageId);
  if ($$props.sizes === void 0 && $$bindings.sizes && sizes !== void 0)
    $$bindings.sizes(sizes);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.click === void 0 && $$bindings.click && click !== void 0)
    $$bindings.click(click);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.useTiny === void 0 && $$bindings.useTiny && useTiny !== void 0)
    $$bindings.useTiny(useTiny);
  if ($$props.loadLazy === void 0 && $$bindings.loadLazy && loadLazy !== void 0)
    $$bindings.loadLazy(loadLazy);
  if ($$props.groupId === void 0 && $$bindings.groupId && groupId !== void 0)
    $$bindings.groupId(groupId);
  if ($$props.groupImagesCount === void 0 && $$bindings.groupImagesCount && groupImagesCount !== void 0)
    $$bindings.groupImagesCount(groupImagesCount);
  if ($$props.imageDirectory === void 0 && $$bindings.imageDirectory && imageDirectory !== void 0)
    $$bindings.imageDirectory(imageDirectory);
  if ($$props.imageExtensionsShort === void 0 && $$bindings.imageExtensionsShort && imageExtensionsShort !== void 0)
    $$bindings.imageExtensionsShort(imageExtensionsShort);
  if ($$props.imageSizes === void 0 && $$bindings.imageSizes && imageSizes !== void 0)
    $$bindings.imageSizes(imageSizes);
  if ($$props.tinyImageExtensionsShort === void 0 && $$bindings.tinyImageExtensionsShort && tinyImageExtensionsShort !== void 0)
    $$bindings.tinyImageExtensionsShort(tinyImageExtensionsShort);
  if ($$props.tinyImageSize === void 0 && $$bindings.tinyImageSize && tinyImageSize !== void 0)
    $$bindings.tinyImageSize(tinyImageSize);
  $$result.css.add(css$5);
  return `${imageExtensionsShort.includes("svg") ? `<picture${add_attribute("title", title, 0)}><img src="${escape(imageDirectory) + escape(imageId) + ".svg"}"${add_attribute("alt", alt, 0)}${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("loading", loadLazy ? "lazy" : "eager", 0)} class="${"svelte-7n4eh0"}"></picture>` : `<picture${add_attribute("title", title, 0)}>${each(imageExtensionsShort.filter((v) => v != "svg"), (ext, i) => `<source type="${"image/" + escape(ext)}"${add_attribute("sizes", sizes, 0)}${add_attribute("srcset", resolveSrcsets(imageDirectory, imageExtensionsShort, imageSizes, imageId, loading, tinyImageExtensionsShort, tinyImageSize)[i], 0)}>`)}
    <img${add_attribute("sizes", sizes, 0)}${add_attribute("srcset", resolveSrcsets(imageDirectory, imageExtensionsShort, imageSizes, imageId, loading, tinyImageExtensionsShort, tinyImageSize)[getSafeImageExtensionIndex(imageExtensionsShort.filter((v) => v != "svg"))], 0)}${add_attribute("alt", alt, 0)}${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("loading", loadLazy ? "lazy" : "eager", 0)} class="${"svelte-7n4eh0"}"></picture>`}`;
});
function guard(name) {
  return () => {
    throw new Error(`Cannot call ${name}(...) on the server`);
  };
}
var goto = guard("goto");
var css$4 = {
  code: ":root{--base-size:calc(3.5rem);--base-size-vw:1vw;--navigation-width:70vw;--ui-bg:#fff;--ui-bg-hover:#fff;--ui-bg-focus:#333;--ui-over-text-color:#000;--ui-over-bg:#222;--ui-over-bg-hover:#888;--ui-over-text-hover-color:#000;--ui-text-color:#fff;--ui-text-hover-color:#000}.break-scope.svelte-m2b3ny.svelte-m2b3ny{display:inline-block;white-space:nowrap}header.svelte-m2b3ny.svelte-m2b3ny{position:fixed;top:calc(var(--base-size) / 2 + env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between;transform:translateZ(999999999px);width:min(90%, calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right)));margin:0 max(5%, env(safe-area-inset-right)) 0 max(5%, env(safe-area-inset-left));padding:0 0 0 calc(var(--base-size) / 2);border-radius:calc(var(--base-size) / 2);height:var(--base-size);box-sizing:border-box;background-color:var(--ui-bg);color:var(--text-color);z-index:1000}@media screen and (orientation: portrait){header.svelte-m2b3ny.svelte-m2b3ny{top:calc(var(--base-size) / 6 + env(safe-area-inset-top));transition-property:top width margin border-radius overflow;transition-duration:0.3s;transition-timing-function:ease}header.checked.svelte-m2b3ny.svelte-m2b3ny{top:env(safe-area-inset-top);width:100%;margin:0 max(0%, 0%) 0 max(0%, 0%);border-radius:0 0 0 calc(var(--base-size) / 2)}}@media screen and (orientation: landscape){header.svelte-m2b3ny.svelte-m2b3ny:not(.game){overflow:hidden}}@media(prefers-color-scheme: dark){header.svelte-m2b3ny.svelte-m2b3ny{background-color:var(--ui-bg);color:var(--text-color)}}header.svelte-m2b3ny img{width:auto;height:calc(var(--base-size) * 0.75);background-color:rgba(255,255,255,0);cursor:pointer;z-index:7000}header.svelte-m2b3ny picture{z-index:7000}.game-background.svelte-m2b3ny.svelte-m2b3ny{position:fixed;z-index:10;opacity:0;pointer-events:none;height:100vh;width:100%;background-color:var(--bg);transition:opacity 1s ease 1s}.game-background.shown{opacity:0.5 !important}.game-obstacle{position:fixed;z-index:20000;pointer-events:none;width:var(--width);height:var(--height);background-color:#fff;top:0;right:0;transform:translateX(var(--width)) rotate(var(--angle));animation:move-obstacle var(--duration) linear both}.header_button.svelte-m2b3ny.svelte-m2b3ny{margin:0;position:fixed;top:0;right:0;z-index:7000;border:none;box-sizing:border-box;border-radius:0 calc(var(--base-size) / 2) calc(var(--base-size) / 2) 0;height:var(--base-size);display:inline-flex;align-items:center;justify-content:center;background-color:#444;cursor:pointer}@media screen and (orientation: portrait){.header_button.svelte-m2b3ny.svelte-m2b3ny{transition:border-radius 0.3s ease}.header_button.checked.svelte-m2b3ny.svelte-m2b3ny{border-radius:0 0 0 0}}@media screen and (orientation: landscape){.header_button.svelte-m2b3ny.svelte-m2b3ny:hover{background-color:#555}}.header_button_dummy.svelte-m2b3ny.svelte-m2b3ny{margin:0;z-index:6000;border:none;box-sizing:border-box;border-radius:0 calc(var(--base-size) / 2) calc(var(--base-size) / 2) 0;cursor:pointer;height:var(--base-size);display:inline-flex;align-items:center;justify-content:center;background-color:var(--ui-over-bg)}@media screen and (orientation: portrait){.header_button_dummy.svelte-m2b3ny.svelte-m2b3ny{display:none}}.header_button.svelte-m2b3ny.svelte-m2b3ny,.header_button_dummy.svelte-m2b3ny.svelte-m2b3ny{padding:0 calc(var(--base-size) / 2) 0 calc(var(--base-size) / 2)}#header_button_checkbox.svelte-m2b3ny:checked~.header_button.svelte-m2b3ny{padding:0 calc(var(--base-size) / 2) 0}.header_button_svg-wrapper.svelte-m2b3ny.svelte-m2b3ny{display:flex;justify-content:center;align-items:center;height:100%;z-index:8000;transform:translate(var(--arrow-x), var(--arrow-y)) rotate(var(--arrow-r))}.header_button_svg.svelte-m2b3ny.svelte-m2b3ny{margin:auto 0;height:60%;transform:translate(0, -2%);z-index:8000;fill:#fff;pointer-events:none;animation-name:svelte-m2b3ny-derotate_svg;animation-duration:200ms;animation-timing-function:ease-out;animation-delay:200ms;animation-fill-mode:both}.header_close_area.svelte-m2b3ny.svelte-m2b3ny{display:none;position:absolute;background-color:transparent;cursor:pointer;height:100%;width:100%;left:-100%;top:0}.header_button_checkbox.svelte-m2b3ny.svelte-m2b3ny{display:none}.header_navigation.svelte-m2b3ny.svelte-m2b3ny{display:flex;width:var(--navigation-width);z-index:6000;font-size:var(--base-size-vw);position:fixed;top:0;right:0;background-color:var(--ui-over-bg);opacity:1;animation-name:svelte-m2b3ny-fold_navigation;animation-duration:200ms;animation-timing-function:ease-out;animation-fill-mode:both}@media screen and (orientation: portrait){.header_navigation.svelte-m2b3ny.svelte-m2b3ny{flex-direction:column;width:50vw;font-size:calc(var(--base-size) / 3);height:100vh}}@media screen and (orientation: landscape){.header_navigation.svelte-m2b3ny.svelte-m2b3ny{border-radius:calc(var(--base-size) / 6) calc(var(--base-size) / 2) calc(var(--base-size) / 2) calc(var(--base-size) / 6)}}.header_navigation_list_items.svelte-m2b3ny.svelte-m2b3ny{display:block;width:100%;background-color:transparent;cursor:pointer;height:var(--base-size);line-height:var(--base-size);margin:0;padding:0;border:none;text-align:center;color:var(--ui-text-color)}@media screen and (orientation: portrait){.header_navigation_list_items.svelte-m2b3ny.svelte-m2b3ny:nth-last-child(2):after{content:'';position:absolute;display:block;background-color:var(--ui-text-color);height:1px;left:calc(50vw * 0.05);transform:translate(0, calc(100% - 1px));width:calc(50vw * 0.9)}}.header_navigation_list_items.svelte-m2b3ny.svelte-m2b3ny:hover{background-color:var(--ui-over-bg-hover)}.header_navigation_list_items.svelte-m2b3ny+.header_navigation_list_items.svelte-m2b3ny:not(:nth-child(2)):before{content:'';position:absolute;display:block;background-color:var(--ui-text-color)}@media screen and (orientation: landscape){.header_navigation_list_items.svelte-m2b3ny+.header_navigation_list_items.svelte-m2b3ny:not(:nth-child(2)):before{width:1px;top:calc(var(--base-size) * 0.1);transform:translate(-0.5px, 0);height:calc(var(--base-size) * 0.8)}}@media screen and (orientation: portrait){.header_navigation_list_items.svelte-m2b3ny+.header_navigation_list_items.svelte-m2b3ny:not(:nth-child(2)):before{height:1px;left:calc(50vw * 0.05);transform:translate(0, -0.5px);width:calc(50vw * 0.9)}}.header_navigation_close_button.svelte-m2b3ny.svelte-m2b3ny{display:flex;align-items:center;cursor:pointer;margin:0;line-height:calc(var(--base-size) / 2);font-weight:normal;box-sizing:border-box;color:var(--ui-text-color)}.header_navigation_close_button.svelte-m2b3ny.svelte-m2b3ny:hover{background-color:#ccc}.header_navigation_close_button.svelte-m2b3ny:hover .header_navigation_close_button_svg.svelte-m2b3ny{fill:#ff0200}@media screen and (orientation: landscape){.header_navigation_close_button.svelte-m2b3ny.svelte-m2b3ny{border-radius:calc(var(--base-size) / 6) 0 0 calc(var(--base-size) / 6);padding:0 1ch 0}}@media screen and (orientation: portrait){.header_navigation_close_button.svelte-m2b3ny.svelte-m2b3ny{height:var(--base-size);padding-left:1.5ch;border-bottom:solid 1px}}.header_navigation_close_button_text.svelte-m2b3ny.svelte-m2b3ny{display:flex;align-items:center}@media screen and (orientation: portrait){.header_navigation_close_button_text.svelte-m2b3ny.svelte-m2b3ny{display:none}}.header_navigation_close_button_svg.svelte-m2b3ny.svelte-m2b3ny{height:60%;z-index:8000;fill:#fff;transition:fill 150ms ease-in-out 0s}@media screen and (orientation: landscape){.header_navigation_close_button_svg.svelte-m2b3ny.svelte-m2b3ny{display:none}}#header_button_checkbox.svelte-m2b3ny:checked~.header_navigation.svelte-m2b3ny{animation-name:svelte-m2b3ny-expand_navigation;animation-duration:200ms;animation-timing-function:ease-out;animation-delay:100ms;animation-fill-mode:both}#header_button_checkbox:checked~.header_navigation.svelte-m2b3ny .header_close_area.svelte-m2b3ny{display:block}#header_button_checkbox:checked~.header_button.svelte-m2b3ny svg.svelte-m2b3ny{animation-name:svelte-m2b3ny-rotate_svg;animation-duration:150ms;animation-timing-function:ease-in;animation-delay:0ms;animation-fill-mode:both}@media screen and (orientation: landscape){#header_button_checkbox.svelte-m2b3ny:checked~.header_button.svelte-m2b3ny{transition-delay:150ms}}@media screen and (orientation: landscape){@-moz-keyframes svelte-m2b3ny-expand_button{0%{transform:translate(0, 0)}100%{transform:translate(calc(var(--navigation-width) * -1), 0)}}@-webkit-keyframes svelte-m2b3ny-expand_button{0%{transform:translate(0, 0)}100%{transform:translate(calc(var(--navigation-width) * -1), 0)}}@-o-keyframes svelte-m2b3ny-expand_button{0%{transform:translate(0, 0)}100%{transform:translate(calc(var(--navigation-width) * -1), 0)}}@keyframes svelte-m2b3ny-expand_button{0%{transform:translate(0, 0)}100%{transform:translate(calc(var(--navigation-width) * -1), 0)}}@-moz-keyframes svelte-m2b3ny-fold_button{0%{transform:translate(calc(var(--navigation-width) * -1), 0)}100%{transform:translate(0, 0)}}@-webkit-keyframes svelte-m2b3ny-fold_button{0%{transform:translate(calc(var(--navigation-width) * -1), 0)}100%{transform:translate(0, 0)}}@-o-keyframes svelte-m2b3ny-fold_button{0%{transform:translate(calc(var(--navigation-width) * -1), 0)}100%{transform:translate(0, 0)}}@keyframes svelte-m2b3ny-fold_button{0%{transform:translate(calc(var(--navigation-width) * -1), 0)}100%{transform:translate(0, 0)}}@-moz-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-webkit-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-o-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-moz-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@-webkit-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@-o-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}}@media screen and (orientation: portrait){@-moz-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-webkit-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-o-keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@keyframes svelte-m2b3ny-expand_navigation{0%{transform:translate(100%, 0%);opacity:0}100%{transform:translate(0%, 0%);opacity:1}}@-moz-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@-webkit-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@-o-keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}@keyframes svelte-m2b3ny-fold_navigation{0%{transform:translate(0%, 0%);opacity:1}100%{transform:translate(100%, 0%);opacity:0}}}@-moz-keyframes move-obstacle{from{transform:translate(var(--width), var(--StartY)) rotate(var(--angle))}to{transform:translate(calc(var(--gameFieldWidth) * -1), var(--EndY)) rotate(calc(var(--rotation) + var(--angle)))}}@-webkit-keyframes move-obstacle{from{transform:translate(var(--width), var(--StartY)) rotate(var(--angle))}to{transform:translate(calc(var(--gameFieldWidth) * -1), var(--EndY)) rotate(calc(var(--rotation) + var(--angle)))}}@-o-keyframes move-obstacle{from{transform:translate(var(--width), var(--StartY)) rotate(var(--angle))}to{transform:translate(calc(var(--gameFieldWidth) * -1), var(--EndY)) rotate(calc(var(--rotation) + var(--angle)))}}@keyframes move-obstacle{from{transform:translate(var(--width), var(--StartY)) rotate(var(--angle))}to{transform:translate(calc(var(--gameFieldWidth) * -1), var(--EndY)) rotate(calc(var(--rotation) + var(--angle)))}}@-moz-keyframes svelte-m2b3ny-rotate_svg{0%{transform:rotate(45deg)}100%{transform:rotate(270deg)}}@-webkit-keyframes svelte-m2b3ny-rotate_svg{0%{transform:rotate(45deg)}100%{transform:rotate(270deg)}}@-o-keyframes svelte-m2b3ny-rotate_svg{0%{transform:rotate(45deg)}100%{transform:rotate(270deg)}}@keyframes svelte-m2b3ny-rotate_svg{0%{transform:rotate(45deg)}100%{transform:rotate(270deg)}}@-moz-keyframes svelte-m2b3ny-derotate_svg{0%{transform:rotate(270deg)}100%{transform:rotate(45deg)}}@-webkit-keyframes svelte-m2b3ny-derotate_svg{0%{transform:rotate(270deg)}100%{transform:rotate(45deg)}}@-o-keyframes svelte-m2b3ny-derotate_svg{0%{transform:rotate(270deg)}100%{transform:rotate(45deg)}}@keyframes svelte-m2b3ny-derotate_svg{0%{transform:rotate(270deg)}100%{transform:rotate(45deg)}}",
  map: null
};
var scroll_duration = 400;
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
var Nav_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { contents, globalSettings: globalSettings2 } = $$props;
  let header;
  function smoothScroll(time, start_time, origin, destination) {
    if (time == start_time) {
      checked = false;
      requestAnimationFrame((time2) => smoothScroll(time2, start_time, origin, destination));
      return;
    }
    scrollTo({
      top: origin + (destination || origin * -1) * easeInOutCubic((time - start_time) / scroll_duration)
    });
    if (time - start_time > scroll_duration)
      return;
    requestAnimationFrame((time2) => smoothScroll(time2, start_time, origin, destination));
  }
  function triggerSmoothScroll(target) {
    if (target != "top") {
      var targetElement = document.getElementById(target);
    }
    requestAnimationFrame((time) => smoothScroll(time, time, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0, target == "top" ? 0 : targetElement.getBoundingClientRect().top - header.clientHeight));
  }
  let checked = true;
  const game = {
    engaged: false,
    startTime: null,
    lastTime: null,
    hit: false,
    wasHit: false,
    keysPressed: { w: false, a: false, s: false, d: false },
    command: [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a"
    ],
    commandsCount: 0,
    backgroundElement: null,
    debug: null,
    field: {
      width: 0,
      height: 0,
      origin: { x: null, y: null }
    },
    arrow: {
      element: null,
      svgElement: null,
      width: 0,
      height: 0,
      speed: 20,
      collision: null,
      x: 0,
      y: 0,
      r: 0,
      offset: { x: null, y: null }
    },
    obstacles: {
      lastAdded: null,
      interval: 500,
      duration: 2e3,
      width: 200,
      height: 200,
      parent: null,
      elements: []
    },
    launch: {
      launching: false,
      launched: false,
      distance: 0,
      duration: 2e3,
      turn: {
        turning: false,
        startTime: null,
        startPoint: { x: 0, y: 0 },
        radius: 0
      }
    },
    customEasing: (0, import_bezier_easing.default)(0.25, -0.4, 0.75, 1),
    handleKeyDown(e) {
      if (game.engaged) {
        if (Object.keys(game.keysPressed).includes(e.key)) {
          game.keysPressed[e.key] = true;
          if (game.keysPressed.w && game.keysPressed.s) {
            switch (e.key) {
              case "w":
                game.keysPressed.s = false;
                break;
              case "s":
                game.keysPressed.w = false;
                break;
            }
          }
          if (game.keysPressed.a && game.keysPressed.d) {
            switch (e.key) {
              case "a":
                game.keysPressed.d = false;
                break;
              case "d":
                game.keysPressed.a = false;
                break;
            }
          }
        }
      } else if (e.key == game.command[game.commandsCount] && checked) {
        if (++game.commandsCount == game.command.length) {
          requestAnimationFrame(game.init);
          game.engaged = true;
          game.backgroundElement.classList.add("shown");
        }
      } else
        game.commandsCount = 0;
    },
    init() {
      game.arrow.width = game.arrow.svgElement.getBoundingClientRect().width;
      game.arrow.height = game.arrow.svgElement.getBoundingClientRect().height;
      game.arrow.offset.x = game.arrow.svgElement.getBoundingClientRect().x;
      game.arrow.offset.y = game.arrow.svgElement.getBoundingClientRect().y;
      game.arrow.collision = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(),
        new SAT.Vector(game.arrow.width, game.arrow.height / 2),
        new SAT.Vector(0, game.arrow.height)
      ]);
      game.field.width = innerWidth;
      game.field.height = innerHeight;
      game.field.origin.x = game.field.width - game.arrow.x;
      game.field.origin.y = game.field.height / 2;
      game.launch.turn.radius = (game.field.height - game.arrow.offset.y) / 4;
      game.launch.turn.startPoint.x = -(game.field.width - (game.field.width - game.arrow.offset.x) * 2 - game.launch.turn.radius);
      game.launch.turn.startPoint.y = game.arrow.offset.y;
      game.launch.distance = game.launch.turn.radius * Math.PI + Math.abs(game.launch.turn.startPoint.x);
      game.obstacles.width = game.field.width / 7;
      game.obstacles.height = game.field.width / 7;
      requestAnimationFrame(game.update);
    },
    map_range(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },
    update(time) {
      game.wasHit = game.hit;
      game.hit = false;
      if (game.startTime == null) {
        game.startTime = time;
      }
      if (!game.launch.launched) {
        if (time - game.startTime < game.launch.duration) {
          if (!game.launch.turn.turning) {
            game.arrow.x = -(game.customEasing((time - game.startTime) / game.launch.duration) * game.launch.distance);
            if (game.arrow.x < game.launch.turn.startPoint.x) {
              game.launch.turn.turning = true;
              game.launch.turn.startTime = time;
            }
          } else {
            game.arrow.x = Math.cos(game.map_range(game.customEasing((time - game.startTime) / game.launch.duration), game.customEasing((game.launch.turn.startTime - game.startTime) / game.launch.duration), 1, 0.5, 1.5) * Math.PI) * game.launch.turn.radius + game.launch.turn.startPoint.x;
            game.arrow.y = Math.sin(game.map_range(game.customEasing((time - game.startTime) / game.launch.duration), game.customEasing((game.launch.turn.startTime - game.startTime) / game.launch.duration), 1, 0.5, 1.5) * Math.PI) * -game.launch.turn.radius + game.launch.turn.startPoint.y + game.launch.turn.radius;
            game.arrow.r = game.map_range(game.customEasing((time - game.startTime) / game.launch.duration), game.customEasing((game.launch.turn.startTime - game.startTime) / game.launch.duration), 1, 0, -180);
          }
        } else {
          game.launch.launched = true;
          game.arrow.collision.translate(game.arrow.svgElement.getBoundingClientRect().x, game.arrow.svgElement.getBoundingClientRect().y);
        }
      } else {
        const delta = game.arrow.speed * (time - game.lastTime) / 60;
        if (game.keysPressed.w) {
          const deltaFixed = delta - (game.arrow.collision.calcPoints[0].y - delta < 0 ? game.arrow.speed : 0);
          game.arrow.y -= deltaFixed;
          game.arrow.collision.translate(0, -deltaFixed);
        }
        if (game.keysPressed.a) {
          const deltaFixed = delta - (game.arrow.collision.calcPoints[0].x - delta < 0 ? game.arrow.speed : 0);
          game.arrow.x -= deltaFixed;
          game.arrow.collision.translate(-deltaFixed, 0);
        }
        if (game.keysPressed.s) {
          const deltaFixed = delta - (game.arrow.collision.calcPoints[2].y + delta > game.field.height ? game.arrow.speed : 0);
          game.arrow.y += deltaFixed;
          game.arrow.collision.translate(0, deltaFixed);
        }
        if (game.keysPressed.d) {
          const deltaFixed = delta - (game.arrow.collision.calcPoints[1].x + delta > game.field.width ? game.arrow.speed : 0);
          game.arrow.x += deltaFixed;
          game.arrow.collision.translate(deltaFixed, 0);
        }
        if (game.obstacles.lastAdded == null)
          game.obstacles.lastAdded = time - game.obstacles.interval;
        if (time - game.obstacles.lastAdded >= game.obstacles.interval) {
          const obstacle = {};
          obstacle.element = document.createElement("div");
          obstacle.element.classList.add("game-obstacle");
          obstacle.element.style.setProperty("--gameFieldWidth", game.field.width + "px");
          obstacle.element.style.setProperty("--width", game.obstacles.width + "px");
          obstacle.element.style.setProperty("--height", game.obstacles.height + "px");
          obstacle.angle = Math.random() * 360 - 180;
          obstacle.element.style.setProperty("--angle", obstacle.angle + "deg");
          obstacle.rotation = Math.random() * 360 * 4 - 360 * 2;
          obstacle.element.style.setProperty("--rotation", obstacle.rotation + "deg");
          obstacle.startY = Math.random() * (game.field.height + game.obstacles.height) - game.obstacles.height / 2;
          obstacle.element.style.setProperty("--StartY", obstacle.startY + "px");
          obstacle.endY = Math.random() * (game.field.height + game.obstacles.height) - game.obstacles.height;
          obstacle.element.style.setProperty("--EndY", obstacle.endY + "px");
          obstacle.element.style.setProperty("--duration", game.obstacles.duration + "ms");
          obstacle.collision = new SAT.Box(new SAT.Vector(game.field.width, obstacle.startY), game.obstacles.width, game.obstacles.height).toPolygon();
          obstacle.collision.translate(-game.obstacles.width / 2, -game.obstacles.height / 2);
          obstacle.collision.rotate(-1 * obstacle.angle * (Math.PI / 180));
          obstacle.collision.translate(game.obstacles.width / 2, game.obstacles.height / 2);
          game.obstacles.lastAdded = time;
          obstacle.addedAt = time;
          obstacle.destroyAt = time + game.obstacles.duration;
          game.obstacles.parent.appendChild(obstacle.element);
          game.obstacles.elements.push(obstacle);
        }
        game.obstacles.elements.forEach((v) => {
          if (time > v.destroyAt) {
            v.element.remove();
            game.obstacles.elements = game.obstacles.elements.filter((w) => w !== v);
          }
        });
        game.obstacles.elements.forEach((v) => {
          const transformRatio = (time - v.addedAt) / game.obstacles.duration;
          const timePassed = time - game.lastTime;
          v.collision.setOffset(new SAT.Vector(-transformRatio * (game.field.width + game.obstacles.width), transformRatio * (v.endY - v.startY)));
          v.collision.translate(-game.obstacles.width / 2, -game.obstacles.height / 2);
          v.collision.rotate(-timePassed * v.rotation);
          v.collision.translate(game.obstacles.width / 2, game.obstacles.height / 2);
          const tmp = game.hit;
          game.hit = (SAT.testPolygonPolygon(v.collision, game.arrow.collision, new SAT.Response()) || game.hit) && !game.wasHit;
          if (game.hit && !tmp) {
            v.element.style.backgroundColor = "#f00";
          }
        });
      }
      game.lastTime = time;
      checked = true;
      requestAnimationFrame(game.update);
    }
  };
  if ($$props.contents === void 0 && $$bindings.contents && contents !== void 0)
    $$bindings.contents(contents);
  if ($$props.globalSettings === void 0 && $$bindings.globalSettings && globalSettings2 !== void 0)
    $$bindings.globalSettings(globalSettings2);
  $$result.css.add(css$4);
  return `

<header style="${"--itemsCount: " + escape(contents.items.length) + ";"}" class="${escape("") + " " + escape(game.engaged ? "game" : "") + " svelte-m2b3ny"}"${add_attribute("this", header, 0)}>${validate_component(Picture, "Picture").$$render($$result, {
    click: () => location.pathname == "/" ? triggerSmoothScroll("top") : goto("/"),
    title: "\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u30C8\u30C3\u30D7\u30DA\u30FC\u30B8\u306B\u79FB\u52D5\u3057\u307E\u3059",
    imageId: contents.imageId,
    width: contents.aspectRatio.width,
    height: contents.aspectRatio.height
  }, {}, {})}
  <input type="${"checkbox"}" class="${"ui_button header_button_checkbox svelte-m2b3ny"}" name="${"header_button_checkbox"}" id="${"header_button_checkbox"}"${add_attribute("checked", checked, 1)}>
  <label for="${"header_button_checkbox"}" class="${"header_button " + escape("") + " svelte-m2b3ny"}" title="${"\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u3092\u958B\u9589\u3067\u304D\u307E\u3059"}"><div class="${"header_button_svg-wrapper svelte-m2b3ny"}" style="${"--arrow-x:" + escape(game.arrow.x) + "px;--arrow-y:" + escape(game.arrow.y) + "px;--arrow-r:" + escape(game.arrow.r) + "deg;"}"${add_attribute("this", game.arrow.element, 0)}><svg class="${"header_button_svg svelte-m2b3ny"}" viewBox="${"0 0 24 24"}"><path d="${"M0 0h24v24H0z"}" fill="${"none"}"></path><path d="${"M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"}" stroke="${"#444"}"${add_attribute("this", game.arrow.svgElement, 0)}></path></svg></div></label>
  <nav class="${"header_navigation svelte-m2b3ny"}"><label for="${"header_button_checkbox"}" class="${"header_navigation_close_button svelte-m2b3ny"}"><span class="${"header_navigation_close_button_text svelte-m2b3ny"}"><span class="${"break-scope svelte-m2b3ny"}">\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3</span>\u3092<span class="${"break-scope svelte-m2b3ny"}">\u9589\u3058\u308B</span></span>
      <svg class="${"header_navigation_close_button_svg svelte-m2b3ny"}" viewBox="${"0 0 24 24"}"><path d="${"M0 0h24v24H0z"}" fill="${"none"}"></path><path d="${"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"}"></path></svg></label>
    <div class="${"header_close_area svelte-m2b3ny"}"></div>
    ${each(contents.items, (item) => `<div class="${"header_navigation_list_items svelte-m2b3ny"}">${escape(item.label)}
      </div>`)}
    <div class="${"header_button_dummy svelte-m2b3ny"}"><svg class="${"header_button_svg svelte-m2b3ny"}" viewBox="${"0 0 24 24"}" fill="${"white"}"></svg></div></nav></header>
<div class="${"game-background svelte-m2b3ny"}" style="${"--bg: " + escape(game.hit ? "#f73f22" : "#000")}"${add_attribute("this", game.backgroundElement, 0)}></div>
<div${add_attribute("this", game.obstacles.parent, 0)}></div>

`;
});
var css$3 = {
  code: "span.svelte-1cntuzd{display:inline-block}",
  map: null
};
var Lines = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { string = "" } = $$props;
  if ($$props.string === void 0 && $$bindings.string && string !== void 0)
    $$bindings.string(string);
  $$result.css.add(css$3);
  return `${each(string.split(" "), (chunk) => `<span class="${"svelte-1cntuzd"}">${escape(chunk)}</span>`)}`;
});
var css$2 = {
  code: "a.svelte-tfmqa5{margin:0;padding:0 4ch;position:relative;box-sizing:border-box;border:solid 0.15em var(--buttonColor);font-size:calc(1em * 14 / 12);font-weight:bold;line-height:2em;border-radius:2em;color:var(--buttonColor);background-color:#fff;transition:filter 300ms ease-out 0ms;filter:none;z-index:1}a.svelte-tfmqa5:after{content:'';position:absolute;top:calc((2em - 0.6em) / 2);right:1em;display:block;width:calc(0.6em - 3px * 2);height:calc(0.6em - 3px * 2);border:solid 0.15em var(--buttonColor);border-color:var(--buttonColor) var(--buttonColor) transparent transparent;transform:rotate(45deg)}a.svelte-tfmqa5:hover{filter:brightness(0.8)}a.svelte-tfmqa5:disabled:hover{filter:none;cursor:not-allowed}",
  map: null
};
var Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { target = "", disabled = false, Class = "", targetEvent = "" } = $$props;
  if ($$props.target === void 0 && $$bindings.target && target !== void 0)
    $$bindings.target(target);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.Class === void 0 && $$bindings.Class && Class !== void 0)
    $$bindings.Class(Class);
  if ($$props.targetEvent === void 0 && $$bindings.targetEvent && targetEvent !== void 0)
    $$bindings.targetEvent(targetEvent);
  $$result.css.add(css$2);
  return `<a${add_attribute("href", !disabled ? target : "javascript:void(0);", 0)} class="${escape(null_to_empty(Class)) + " svelte-tfmqa5"}" ${disabled ? "disabled" : ""}>${slots.default ? slots.default({}) : ``}</a>

`;
});
var subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
    };
  });
}
var defaultFormats = {
  number: {
    scientific: { notation: "scientific" },
    engineering: { notation: "engineering" },
    compactLong: { notation: "compact", compactDisplay: "long" },
    compactShort: { notation: "compact", compactDisplay: "short" }
  },
  date: {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  },
  time: {
    short: { hour: "numeric", minute: "numeric" },
    medium: { hour: "numeric", minute: "numeric", second: "numeric" },
    long: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    },
    full: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    }
  }
};
var defaultOptions = {
  fallbackLocale: "",
  initialLocale: "",
  loadingDelay: 200,
  formats: defaultFormats,
  warnOnMissingMessages: true
};
var options = defaultOptions;
var currentLocale;
function getCurrentLocale() {
  return currentLocale;
}
function setCurrentLocale(val) {
  return currentLocale = val;
}
function getOptions() {
  return options;
}
function getSubLocales(refLocale) {
  return refLocale.split("-").map((_, i, arr) => arr.slice(0, i + 1).join("-")).reverse();
}
function getPossibleLocales(refLocale, fallbackLocale = getOptions().fallbackLocale) {
  const locales = getSubLocales(refLocale);
  if (fallbackLocale) {
    return [...new Set([...locales, ...getSubLocales(fallbackLocale)])];
  }
  return locales;
}
var dictionary;
var $dictionary = writable({});
function getLocaleDictionary(locale) {
  return dictionary[locale] || null;
}
function hasLocaleDictionary(locale) {
  return locale in dictionary;
}
function getMessageFromDictionary(locale, id) {
  if (hasLocaleDictionary(locale)) {
    const localeDictionary = getLocaleDictionary(locale);
    if (id in localeDictionary) {
      return localeDictionary[id];
    }
    const ids = id.split(".");
    let tmpDict = localeDictionary;
    for (let i = 0; i < ids.length; i++) {
      if (typeof tmpDict[ids[i]] !== "object") {
        return tmpDict[ids[i]] || null;
      }
      tmpDict = tmpDict[ids[i]];
    }
  }
  return null;
}
function getClosestAvailableLocale(refLocale) {
  if (refLocale == null)
    return null;
  const relatedLocales = getPossibleLocales(refLocale);
  for (let i = 0; i < relatedLocales.length; i++) {
    const locale = relatedLocales[i];
    if (hasLocaleDictionary(locale)) {
      return locale;
    }
  }
  return null;
}
function addMessages(locale, ...partials) {
  $dictionary.update((d) => {
    d[locale] = Object.assign(d[locale] || {}, ...partials);
    return d;
  });
}
$dictionary.subscribe((newDictionary) => dictionary = newDictionary);
var $isLoading = writable(false);
var loaderQueue = {};
function removeLocaleFromQueue(locale) {
  delete loaderQueue[locale];
}
function getLocaleQueue(locale) {
  return loaderQueue[locale];
}
function getLocalesQueues(locale) {
  return getPossibleLocales(locale).reverse().map((localeItem) => {
    const queue = getLocaleQueue(localeItem);
    return [localeItem, queue ? [...queue] : []];
  }).filter(([, queue]) => queue.length > 0);
}
function hasLocaleQueue(locale) {
  return getPossibleLocales(locale).reverse().some(getLocaleQueue);
}
var activeLocaleFlushes = {};
function flush(locale) {
  if (!hasLocaleQueue(locale))
    return Promise.resolve();
  if (locale in activeLocaleFlushes)
    return activeLocaleFlushes[locale];
  const queues = getLocalesQueues(locale);
  if (queues.length === 0)
    return Promise.resolve();
  const loadingDelay = setTimeout(() => $isLoading.set(true), getOptions().loadingDelay);
  activeLocaleFlushes[locale] = Promise.all(queues.map(([locale2, queue]) => {
    return Promise.all(queue.map((loader) => loader())).then((partials) => {
      removeLocaleFromQueue(locale2);
      partials = partials.map((partial) => partial.default || partial);
      addMessages(locale2, ...partials);
    });
  })).then(() => {
    clearTimeout(loadingDelay);
    $isLoading.set(false);
    delete activeLocaleFlushes[locale];
  });
  return activeLocaleFlushes[locale];
}
var $locale = writable("");
$locale.subscribe((newLocale) => {
  setCurrentLocale(newLocale);
  if (typeof window !== "undefined") {
    document.documentElement.setAttribute("lang", newLocale);
  }
});
var localeSet = $locale.set;
$locale.set = (newLocale) => {
  if (getClosestAvailableLocale(newLocale) && hasLocaleQueue(newLocale)) {
    return flush(newLocale).then(() => localeSet(newLocale));
  }
  return localeSet(newLocale);
};
$locale.update = (fn) => {
  let currentLocale2 = getCurrentLocale();
  fn(currentLocale2);
  localeSet(currentLocale2);
};
var lookupCache = {};
var addToCache = (path, locale, message) => {
  if (!message)
    return message;
  if (!(locale in lookupCache))
    lookupCache[locale] = {};
  if (!(path in lookupCache[locale]))
    lookupCache[locale][path] = message;
  return message;
};
var lookup = (path, refLocale) => {
  if (refLocale == null)
    return void 0;
  if (refLocale in lookupCache && path in lookupCache[refLocale]) {
    return lookupCache[refLocale][path];
  }
  const locales = getPossibleLocales(refLocale);
  for (let i = 0; i < locales.length; i++) {
    const locale = locales[i];
    const message = getMessageFromDictionary(locale, path);
    if (message) {
      return addToCache(path, refLocale, message);
    }
  }
  return void 0;
};
var formatMessage = (optionsOrId, maybeOptions = {}) => {
  const id = typeof optionsOrId === "string" ? optionsOrId : optionsOrId.id;
  const options2 = typeof optionsOrId === "string" ? maybeOptions : optionsOrId;
  const { values, locale = getCurrentLocale(), default: defaultValue } = options2;
  if (locale == null) {
    throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");
  }
  let message = lookup(id, locale);
  if (typeof message === "string") {
    return message;
  }
  if (typeof message === "function") {
    return message(...Object.keys(options2.values || {}).sort().map((k) => (options2.values || {})[k]));
  }
  {
    console.warn(`[svelte-i18n] The message "${id}" was not found in "${getPossibleLocales(locale).join('", "')}".${hasLocaleQueue(getCurrentLocale()) ? `

Note: there are at least one loader still registered to this locale that wasn't executed.` : ""}`);
  }
  return defaultValue || id;
};
var $format = /* @__PURE__ */ derived([$locale, $dictionary], () => formatMessage);
var css$1 = {
  code: ".wrapper.svelte-kb1y73{--buttonColor:#0a6afa;position:relative;height:min(90%, 90vh)}.wrapper.svelte-kb1y73 img{height:100%;width:100%;filter:blur(0.1vw);object-fit:cover}@media screen and (orientation: landscape){.em-text.svelte-kb1y73{font-size:2vw}h2.em-text.svelte-kb1y73{font-size:3vw}}.content.svelte-kb1y73{position:absolute;padding:calc(50vh + env(safe-area-inset-top)) calc(var(--base-size) / 2 + env(safe-area-inset-right)) calc(var(--base-size) / 2) calc(var(--base-size) / 2 + env(safe-area-inset-left));bottom:0;height:100%;width:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;background:linear-gradient(to right, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0));box-sizing:border-box}@media screen and (orientation: portrait){.content.svelte-kb1y73{background:linear-gradient(to top, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0))}}.description.svelte-kb1y73{color:#fff}@media screen and (orientation: landscape){.description.svelte-kb1y73{width:40%}}",
  map: null
};
var Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $t, $$unsubscribe_t;
  $$unsubscribe_t = subscribe($format, (value) => $t = value);
  $$result.css.add(css$1);
  $$unsubscribe_t();
  return `<div class="${"wrapper svelte-kb1y73"}">${validate_component(Picture, "Picture").$$render($$result, { imageId: "foh7rj5YI_E" }, {}, {})}
  <div class="${"content svelte-kb1y73"}" style="${"--bg-color: #F7931E; --fg-color: #FFF"}"><span class="${"em-text svelte-kb1y73"}">${escape($t("test"))}</span>
    <h2 class="${"em-text svelte-kb1y73"}">${validate_component(Lines, "Lines").$$render($$result, { string: "\u308C\u30FC\u305E\u304F\uFF01 \u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093" }, {}, {})}</h2>
    <p class="${"description svelte-kb1y73"}">${validate_component(Lines, "Lines").$$render($$result, {
    string: "\u30B9\u30FC\u30D1\u30FC\u30B9\u30BF\u30FC\u30DE\u30A4\u30F3 \u7B2C\u4E00\u4F5C\u76EE\u306E STG\u3002 \u6575\u5F3E\u3092 \u30B9\u30EC\u30B9\u30EC\u3067 \u304B\u308F\u3059\u3053\u3068\u3067 \u5F37\u5927\u306A \u5FC5\u6BBA\u6280\u3092 \u30D6\u30C3\u653E\u305B\u308B \u300E\u308C\u30FC\u305E\u304F\u30B7\u30B9\u30C6\u30E0\u300F \u3092\u642D\u8F09\u3002 \u30EA\u30B9\u30AF\u3068 \u30EA\u30BF\u30FC\u30F3\u306E \u53D6\u6368\u9078\u629E\u306B \u624B\u306B\u6C57\u63E1\u308B\u3001 \u767D\u71B1\u3057\u305F \u30D0\u30C8\u30EB\u3092 \u697D\u3057\u3081\u308B\u3002"
  }, {}, {})}</p>
    ${validate_component(Button, "Button").$$render($$result, { target: "necromance" }, {}, { default: () => `\u30C6\u30A3\u30B6\u30FC\u30B5\u30A4\u30C8\u3078` })}</div>
</div>`;
});
var settings = [
  {
    sectionType: "navHeader",
    themeColor: "#fff",
    contents: {
      imageId: "ssm-logo-landscape",
      aspectRatio: { width: 157213, height: 60041 },
      imageExtensionsShort: ["svg"],
      items: [
        { id: "top", label: "\u4F5C\u54C1" },
        { id: "news", label: "\u30CB\u30E5\u30FC\u30B9" },
        { id: "about", label: "\u30C1\u30FC\u30E0\u306B\u3064\u3044\u3066" },
        { id: "members", label: "\u30E1\u30F3\u30D0\u30FC" }
      ]
    }
  },
  {
    sectionType: "slideHero",
    pairId: "hero"
  },
  {
    sectionType: "slideDesc",
    pairId: "hero",
    isParent: true,
    contents: {
      articles: [
        {
          title: "\u308C\u30FC\u305E\u304F\uFF01\u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093",
          subtitle: "\u308C\u30FC\u305E\u304F\u5168\u65B9\u4F4D\u30B7\u30E5\u30FC\u30C6\u30A3\u30F3\u30B0\u30B2\u30FC\u30E0",
          themeColor: "#ed773e",
          imageId: "necromance_ss",
          alt: "\u308C\u30FC\u305E\u304F\uFF01\u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093\u306E\u30D7\u30EC\u30A4\u753B\u9762",
          aspectRatio: { width: 16, height: 9 },
          description: [
            "\u30B9\u30FC\u30D1\u30FC\u30B9\u30BF\u30FC\u30DE\u30A4\u30F3\u7B2C\u4E00\u4F5C\u76EE\u306ESTG\u3002",
            "\u6575\u5F3E\u3092\u30B9\u30EC\u30B9\u30EC\u3067\u304B\u308F\u3059\u3053\u3068\u3067\u5F37\u5927\u306A\u5FC5\u6BBA\u6280\u3092\u30D6\u30C3\u653E\u305B\u308B\u3001\u3068\u3044\u3046\u300E\u308C\u30FC\u305E\u304F\u30B7\u30B9\u30C6\u30E0\u300F\u3092\u642D\u8F09\u3002\u30EA\u30B9\u30AF\u3068\u30EA\u30BF\u30FC\u30F3\u306E\u53D6\u6368\u9078\u629E\u306B\u624B\u306B\u6C57\u63E1\u308B\u3001\u767D\u71B1\u3057\u305F\u30D0\u30C8\u30EB\u3092\u697D\u3057\u3081\u308B\u3002",
            "\u30B9\u30C8\u30FC\u30EA\u30FC\u3084\u4E16\u754C\u89B3\u3092\u3053\u3060\u308F\u308A\u629C\u304D\u3001\u30AB\u30C3\u30C8\u30A4\u30F3\u6620\u50CF\u3084\u30DC\u30A4\u30B9\u4ED8\u304D\u30B7\u30CA\u30EA\u30AA\u30D1\u30FC\u30C8\u3068\u3044\u3063\u305F\u30EA\u30C3\u30C1\u306A\u8868\u73FE\u306B\u3082\u6311\u6226\u3002",
            "\u30B2\u30FC\u30E0\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u7532\u5B50\u57122020\u306B\u3066\u7DCF\u5408\u5927\u8CDE3\u4F4D\u3001\u5BE9\u67FB\u54E1\u7279\u5225\u8CDE\u3001\u8A71\u984C\u8CDE\u53D7\u8CDE\u3002\u30B3\u30DF\u30C3\u30AF\u30DE\u30FC\u30B1\u30C3\u30C897\u3001\u30C7\u30B8\u30B2\u30FC\u535A2020\u306B\u51FA\u5C55\u3002",
            "Booth\u306B\u3066\u4F53\u9A13\u7248\u3092\u914D\u4FE1\u4E2D\u3002"
          ],
          buttons: [
            {
              popup: "\u4ECA\u3059\u3050\u30A2\u30AF\u30BB\u30B9",
              title: "\u516C\u5F0F\u30B5\u30A4\u30C8\u306B\u884C\u304F",
              target: "/necromance/",
              spaMode: true
            }
          ],
          slides: [
            {
              type: "youtube",
              id: "foh7rj5YI_E"
            }
          ],
          specs: {
            times: [
              {
                year: "2019",
                month: "8",
                annotation: "\u301C"
              }
            ],
            platforms: [
              {
                name: "Windows",
                version: "7",
                orLater: true
              },
              {
                name: "macOS",
                version: "Sierra",
                orLater: true
              }
            ]
          }
        },
        {
          title: "SPINNER",
          subtitle: "\u65B0\u611F\u899A\u30DB\u30C3\u30B1\u30FC\u30A2\u30AF\u30B7\u30E7\u30F3\u30B2\u30FC\u30E0",
          themeColor: "#464646",
          imageId: "spinner_ss",
          alt: "SPINNER\u306E\u30D7\u30EC\u30A4\u753B\u9762",
          aspectRatio: { width: 16, height: 9 },
          description: [
            "\u30CF\u30F3\u30C9\u30EB\u30B3\u30F3\u30C8\u30ED\u30FC\u30E9\u30FC\u3092\u7528\u3044\u3066\u6226\u30461vs1\u306E\u30DB\u30C3\u30B1\u30FC\u30B2\u30FC\u30E0\u3002",
            "\u30B4\u30FC\u30EB\u304C\u306A\u304F\u3001\u30D1\u30C3\u30AF\u304C\u7AEF\u306E\u30E9\u30A4\u30F3\u3092\u8D85\u3048\u308B\u3068\u5BFE\u3068\u306A\u308B\u30E9\u30A4\u30F3\u306B\u30EF\u30FC\u30D7\u3059\u308B\u3068\u3044\u3046\u4ED5\u69D8\u304C\u7279\u5FB4\u3002",
            "GCGEXPO2019\u306B\u3066\u7DCF\u5408\u512A\u52DD\u3002",
            "2020\u5E742\u6708\u306B\u958B\u50AC\u3055\u308C\u3001200\u540D\u8FD1\u304F\u306E\u696D\u754C\u4EBA\u304C\u53C2\u52A0\u3057\u305F\u30B2\u30FC\u30E0\u696D\u754C\u5E74\u59CB\u3042\u3044\u3055\u3064\u4F1A\u3067\u306F\u4F53\u9A13\u4F1A\u3092\u958B\u50AC\u3057\u3001\u30D7\u30ED\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u306E\u65B9\u3005\u304B\u3089\u5EFA\u8A2D\u7684\u306A\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3092\u3044\u305F\u3060\u3044\u305F\u3002"
          ],
          buttons: [
            {
              title: "\u7D39\u4ECB\u8A18\u4E8B\u3092\u8AAD\u3080",
              target: "https://game.creators-guild.com/g4c/%e3%82%b2%e3%83%bc%e3%83%a0%e6%a5%ad%e7%95%8c%e4%ba%a4%e6%b5%81%e4%bc%9a%e3%81%ab%e6%bd%9c%e5%85%a5%ef%bc%81/"
            }
          ],
          specs: {
            times: [
              {
                year: "2019",
                month: "11",
                annotation: "(2\u9031\u9593)"
              }
            ],
            platforms: [
              {
                name: "Windows",
                version: "7",
                orLater: true
              },
              {
                name: "macOS",
                version: "Sierra",
                orLater: true
              }
            ]
          }
        },
        {
          title: "CUPRUNMEN",
          subtitle: "VRM\u30BF\u30A4\u30E0\u30A2\u30BF\u30C3\u30AF\u30E9\u30F3\u30B2\u30FC\u30E0",
          themeColor: "#b56c4e",
          imageId: "cup-run_ss",
          alt: "CUPRUNMEN\u306E\u30D7\u30EC\u30A4\u753B\u9762",
          aspectRatio: { width: 16, height: 9 },
          description: [
            "\u521D\u3068\u306A\u308B\u30D5\u30EB\u30EA\u30E2\u30FC\u30C8\u4F53\u5236\u3067\u5236\u4F5C\u3057\u305F\u30E9\u30F3\u30B2\u30FC\u30E0\u3002",
            "\u6280\u8853\u7684\u306B\u30E6\u30CB\u30FC\u30AF\u306A\u70B9\u3068\u3057\u3066\u3001\u300C\u30D7\u30EC\u30A4\u30E4\u30FC\u306E\u5411\u304D\u3068\u30B9\u30C6\u30FC\u30B8\u306E\u6CD5\u7DDA\u30D9\u30AF\u30C8\u30EB\u304B\u3089\u6EA2\u308C\u308B\u30B9\u30FC\u30D7\u91CF\u3092\u7B97\u51FA\u3059\u308B\u300D\u3068\u3044\u3046\u51E6\u7406\u3092\u884C\u3063\u3066\u3044\u308B\u3002",
            "\u307E\u305F\u3001\u30ED\u30FC\u30AB\u30EB\u306EVRM\u30A2\u30D0\u30BF\u30FC\u3092\u30B2\u30FC\u30E0\u306B\u7528\u3044\u308B\u3068\u3044\u3046\u8A66\u307F\u3092\u884C\u3063\u305F\u3002",
            "\u30CB\u30B3\u30CB\u30B3\u30CD\u30C3\u30C8\u8D85\u4F1A\u8B70\u8D85\u30CF\u30C3\u30AB\u30BD\u30F3\u306B\u51FA\u5C55\u3002"
          ],
          buttons: [
            {
              popup: "\u4ECA\u3059\u3050\u30D7\u30EC\u30A4",
              title: ["unityroom\u3067", "\u904A\u3076"],
              target: "https://unityroom.com/games/cuprunmen"
            }
          ],
          slides: [
            {
              type: "youtube",
              id: "m44wTn8nk9Y"
            }
          ],
          specs: {
            times: [
              {
                year: "2020",
                month: "4",
                annotation: "(5\u65E5)"
              }
            ],
            platforms: [
              {
                name: "WebGL"
              }
            ]
          }
        },
        {
          title: "\u30D5\u30A9\u30FC\u30EA\u30F3\u30D1\u30D5\u30A7",
          subtitle: "\u30D1\u30D5\u30A7\u7A4D\u307F\u30A2\u30AF\u30B7\u30E7\u30F3\u30B2\u30FC\u30E0",
          themeColor: "#4ae0ef",
          imageId: "fall_in_parfait-ss1",
          alt: "\u30D5\u30A9\u30FC\u30EA\u30F3\u30D1\u30D5\u30A7\u306E\u30D7\u30EC\u30A4\u753B\u9762",
          aspectRatio: { width: 16, height: 9 },
          description: [
            "2020\u5E748\u6708\u306B\u958B\u50AC\u3055\u308C\u305FUnity1Week\u3067\u5236\u4F5C\u3057\u305F\u30B2\u30FC\u30E0\u3002",
            "\u300E\u4E0A\u304B\u3089\u843D\u3061\u3066\u304F\u308B\u6750\u6599\u3092\u5668\u3067\u30AD\u30E3\u30C3\u30C1\u3057\u3066\u30D1\u30D5\u30A7\u3092\u4F5C\u308B\u300F\u3068\u3044\u3046\u30B7\u30F3\u30D7\u30EB\u306A\u64CD\u4F5C\u6027\u306A\u304C\u3089\u3001\u30D1\u30D5\u30A7\u3092\u5927\u304D\u304F\u306A\u308B\u306B\u3064\u308C\u3066\u7206\u5F3E\u306B\u5F53\u305F\u308A\u3084\u3059\u304F\u306A\u308B\u3001\u30AA\u30F3\u30E9\u30A4\u30F3\u30E9\u30F3\u30AD\u30F3\u30B0\u306E\u5B9F\u88C5\u3068\u3044\u3063\u305F\u5DE5\u592B\u306B\u3088\u308A\u3001\u4E0A\u7D1A\u8005\u306B\u3068\u3063\u3066\u3082\u3084\u308A\u8FBC\u307F\u304C\u3044\u306E\u3042\u308B\u30B2\u30FC\u30E0\u3068\u306A\u3063\u305F\u3002",
            "\u4E00\u756A\u306E\u7279\u9577\u306F\u300E\u30D5\u30A9\u30C8\u30E2\u30FC\u30C9\u300F\u3067\u3001\u30D7\u30EC\u30A4\u30E4\u30FC\u306F\u81EA\u5206\u306E\u4F5C\u3063\u305F\u30D1\u30D5\u30A7\u3092\u64AE\u5F71\u3057\u3066Twitter\u306B\u6295\u7A3F\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002",
            "\u30B2\u30FC\u30E0\u30C7\u30B6\u30A4\u30F3\u306E\u4E2D\u306B\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u306E\u8996\u70B9\u3092\u6301\u3061\u8FBC\u3093\u3060\u3001\u30B2\u30FC\u30E0\u201C\u5546\u54C1\u201D\u3068\u3057\u3066\u306E\u8349\u5206\u3051\u7684\u306A\u4F5C\u54C1\u3068\u306A\u3063\u305F\u3002",
            "Unity1Week\u30B2\u30FC\u30E0\u30B8\u30E3\u30E0\u306B\u3066\u7D04500\u4F5C\u54C1\u4E2D\u7DCF\u5408\u90E8\u958046\u4F4D\u3001\u7D75\u4F5C\u308A\u90E8\u958035\u4F4D\u7372\u5F97\u3002",
            "\u30C7\u30D9\u30ED\u30C3\u30D1\u30FC\u30BA\u30B2\u30FC\u30E0\u30B3\u30F3\u30C6\u30B9\u30C82020\u306B\u3066\u4F01\u696D\u8CDE\u53D7\u8CDE\u3002",
            "\u798F\u5CA1\u30B2\u30FC\u30E0\u30B3\u30F3\u30C6\u30B9\u30C82021\u3001Ohayoo Casual Game Contest\u306B\u51FA\u5C55\u3002"
          ],
          buttons: [
            {
              popup: "\u4ECA\u3059\u3050\u30D7\u30EC\u30A4",
              title: ["unityroom\u3067", "\u904A\u3076"],
              target: "https://unityroom.com/games/fallinparfait"
            }
          ],
          slides: [
            {
              type: "youtube",
              id: "ZIFt6yuOMAQ"
            }
          ],
          specs: {
            times: [
              {
                year: "2020",
                month: "8",
                annotation: "(1\u9031\u9593)"
              },
              {
                year: "2020",
                month: "12",
                annotation: "(1\u30F6\u6708)"
              }
            ],
            platforms: [
              {
                name: "iOS",
                version: "10",
                orLater: true
              },
              {
                name: "Android",
                version: "8",
                orLater: true
              },
              {
                name: "WebGL"
              }
            ]
          }
        },
        {
          title: "\u7206\u8CB7\u3044\u30DE\u30FC\u30B1\u30C3\u30C8",
          subtitle: "\u7206\u8CB7\u3044\u30A2\u30AF\u30B7\u30E7\u30F3\u30E9\u30F3\u30B2\u30FC\u30E0",
          themeColor: "#da3c26",
          imageId: "bakugai-img",
          aspectRatio: { width: 1, height: 1 },
          alt: "",
          description: [
            "\u30D5\u30A9\u30FC\u30EA\u30F3\u30D1\u30D5\u30A7\u306B\u7D9A\u304F\u3001Unity1Week\u4E8C\u4F5C\u76EE\u3002",
            "\u30B7\u30E7\u30C3\u30D4\u30F3\u30B0\u30AB\u30FC\u30C8\u306B\u642D\u4E57\u3057\u3066\u30B9\u30FC\u30D1\u30FC\u30DE\u30FC\u30B1\u30C3\u30C8\u3092\u7206\u8D70\u3057\u3001\u5E8A\u306E\u5546\u54C1\u3092\u62FE\u3063\u305F\u308A\u5546\u54C1\u68DA\u3084\u4ED6\u306E\u30D7\u30EC\u30A4\u30E4\u30FC\u3092\u653B\u6483\u3059\u308B\u3053\u3068\u3067\u30B9\u30B3\u30A2\u3092\u7A3C\u3050\u3002",
            "\u4ECA\u56DE\u306F\u521D\u3081\u3066AI\u30D7\u30EC\u30A4\u30E4\u30FC\u3092\u5C0E\u5165\u3057\u305F\u3002\u305D\u308C\u305E\u308C\u306EAI\u306B\u6027\u683C\u4ED8\u3051\uFF08\u653B\u6483\u578B\u30FB\u53CE\u96C6\u578B\u30FB\u9003\u4EA1\u578B\uFF09\u3092\u3059\u308B\u3053\u3068\u3067\u3001\u30D7\u30EC\u30A4\u30E4\u30FC\u306F\u6BCE\u56DE\u523A\u6FC0\u7684\u306A\u30B2\u30FC\u30E0\u5C55\u958B\u3092\u697D\u3057\u3081\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002",
            "Unity1Week\u30B2\u30FC\u30E0\u30B8\u30E3\u30E0\u306B\u51FA\u5C55\u3002"
          ],
          buttons: [
            {
              popup: "\u4ECA\u3059\u3050\u30D7\u30EC\u30A4",
              title: ["unityroom\u3067", "\u904A\u3076"],
              target: "https://unityroom.com/games/bakugaimarket"
            }
          ],
          slides: [
            {
              type: "youtube",
              id: "vTsy8NCYSNE"
            }
          ],
          specs: {
            times: [
              {
                year: "2020",
                month: "2",
                annotation: "(12\u65E5)"
              }
            ],
            platforms: [
              {
                name: "WebGL"
              }
            ]
          }
        }
      ]
    }
  },
  {
    sectionType: "dateList",
    title: "NEWS",
    subtitle: "\u30C1\u30FC\u30E0\u304B\u3089\u306E\u304A\u77E5\u3089\u305B",
    themeColor: "#f73f23",
    id: "news",
    contents: {
      shownItemsCount: 3,
      articles: [
        {
          title: "\u300E\u30D5\u30A9\u30FC\u30EA\u30F3\u30D1\u30D5\u30A7\u300F\u304C\u30C7\u30D9\u30ED\u30C3\u30D1\u30FC\u30BA\u30B2\u30FC\u30E0\u30B3\u30F3\u30C6\u30B9\u30C82020\u306B\u3066\u4F01\u696D\u8CDE\uFF08f4samurai\u8CDE\uFF09\u3092\u53D7\u8CDE\uFF01",
          date: {
            year: "2021",
            month: "1",
            day: "29"
          },
          url: "https://twitter.com/MachiCollider/status/1355123713226625027"
        },
        {
          title: "\u30B9\u30FC\u30D1\u30FC\u30B9\u30BF\u30FC\u30DE\u30A4\u30F3\u304C\u300C\u6D3B\u8E8D\u3059\u308B\u96FB\u5927\u4EBA\u300D\u306B\u63B2\u8F09\uFF01",
          date: {
            year: "2021",
            month: "1",
            day: "28"
          },
          url: "https://www.dendai.ac.jp/dendai-people/20210128-01.html"
        },
        {
          title: "\u300E\u308C\u30FC\u305E\u304F\uFF01\u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093\u300F\u304C\u30B2\u30FC\u30E0\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u7532\u5B50\u57122020\u306B\u3066\u7DCF\u5408\u5927\u8CDE3\u4F4D\u3001\u5BE9\u67FB\u54E1\u7279\u5225\u8CDE\uFF08\u9234\u6728\u82F1\u4EC1\u8CDE\uFF09\u3001\u8A71\u984C\u8CDE\u3092\u53D7\u8CDE\uFF01",
          date: {
            year: "2020",
            month: "12",
            day: "19"
          },
          url: "https://www.4gamer.net/games/999/G999905/20201228102/"
        },
        {
          title: "\u300E\u308C\u30FC\u305E\u304F\uFF01\u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093\u300F\u3092\u30C7\u30B8\u30B2\u30FC\u535A2020\u306B\u51FA\u5C55\uFF01",
          date: {
            year: "2020",
            month: "11",
            day: "29"
          },
          url: "http://digigame-expo.org/"
        },
        {
          title: "\u300E\u30D5\u30A9\u30FC\u30EA\u30F3\u30D1\u30D5\u30A7\u300F\u304CUnity 1Week\u30B2\u30FC\u30E0\u30B8\u30E3\u30E0\u306B\u3066\u7DCF\u5408\u30E9\u30F3\u30AD\u30F3\u30B0\u3001\u7D75\u4F5C\u308A\u30E9\u30F3\u30AD\u30F3\u30B0\u306B\u5165\u8CDE\uFF01",
          date: {
            year: "2020",
            month: "8",
            day: "30"
          },
          url: "https://unityroom.com/unity1weeks/17"
        },
        {
          title: "\u300ESPINNER\u300F\u3092\u30B2\u30FC\u30E0\u696D\u754C\u4EA4\u6D41\u4F1A\u306B\u51FA\u5C55\uFF01",
          date: {
            year: "2020",
            month: "2",
            day: "6"
          },
          url: "https://game.creators-guild.com/g4c/%E3%82%B2%E3%83%BC%E3%83%A0%E6%A5%AD%E7%95%8C%E4%BA%A4%E6%B5%81%E4%BC%9A%E3%81%AB%E6%BD%9C%E5%85%A5%EF%BC%81/"
        },
        {
          title: "\u30B2\u30FC\u30E0\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u30BA\u30AE\u30EB\u30C9\u69D8\u304B\u3089\u30A4\u30F3\u30BF\u30D3\u30E5\u30FC\u3092\u3057\u3066\u3044\u305F\u3060\u304D\u307E\u3057\u305F\uFF01",
          date: {
            year: "2019",
            month: "12",
            day: "27"
          },
          url: "https://game.creators-guild.com/g4c/interview-studentgamescreator-20190114/"
        },
        {
          title: "\u300ESPINNER\u300F\u304CGCG EXPO 2019\u3067\u6700\u512A\u79C0\u8CDE\u3092\u53D7\u8CDE\uFF01",
          date: {
            year: "2019",
            month: "11",
            day: "30"
          },
          url: "https://game.creators-guild.com/g4c/event-realevent-20191205/"
        },
        {
          title: "\u300E\u308C\u30FC\u305E\u304F\uFF01\u30CD\u30AF\u30ED\u30DE\u30F3\u30B9\u3061\u3083\u3093\u300F\u3092\u30B2\u30FC\u30E0\u5236\u4F5C\u8005\u4EA4\u6D41\u4F1A GAME^3\u306B\u51FA\u5C55\uFF01",
          date: {
            year: "2019",
            month: "9",
            day: "8"
          },
          url: "https://game3.trap.jp/10th/"
        }
      ]
    }
  },
  {
    sectionType: "static",
    title: "ABOUT",
    themeColor: "#f78323",
    id: "about",
    contents: {
      imageId: "ssm-logo-landscape",
      aspectRatio: { width: 157213, height: 60041 },
      imageExtensionsShort: ["svg"],
      article: [
        "\u30B9\u30FC\u30D1\u30FC\u30B9\u30BF\u30FC\u30DE\u30A4\u30F3\u306F\u5927\u5B66\u30B5\u30FC\u30AF\u30EB\u767A\u3001\u65B0\u9032\u6C17\u92ED\u306E\u30B2\u30FC\u30E0\u5236\u4F5C\u30C1\u30FC\u30E0\u3002",
        "\u9762\u767D\u3044\u3082\u306E\u304C\u5927\u597D\u304D\u3067\u3059\u3002"
      ],
      bottomButtonsLayout: "left",
      bottomButtons: [
        {
          title: ["\u304A\u554F\u3044\u5408\u308F\u305B"],
          target: "https://docs.google.com/forms/d/e/1FAIpQLSd6Z3feC7onaq9SJa1Blfdd7frPFCsm4zQUCfQr9XqPxM3gzA/viewform"
        },
        {
          title: "Twitter",
          target: "https://twitter.com/necromance_chan"
        }
      ]
    }
  },
  {
    sectionType: "cards",
    title: "MEMBERS",
    themeColor: "#f7a723",
    id: "members",
    contents: {
      logoImageId: "ssm-logo",
      logoImageExtensionsShort: ["svg"],
      logoAspectRatio: { width: 47581, height: 90047 },
      backfaceLogoImageId: "ssm-logo-landscape",
      backfaceLogoImageExtensionsShort: ["svg"],
      backfaceLogoAspectRatio: { width: 157213, height: 60041 },
      imageDirectory: "./img/members/",
      cards: [
        {
          name: "\u30DE\u30C1\u30B3\u30FC",
          imageId: "machiko",
          post: ["\u30EA\u30FC\u30C0\u30FC", "\u30D7\u30E9\u30F3\u30CA\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "MachiCollider"
            },
            {
              name: "note",
              id: "machikou_mk2"
            },
            {
              name: "qiita",
              id: "Machikof"
            }
          ],
          backfaceColor: "#E03D16",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u3044\u30FC\u3060",
          imageId: "i-da",
          post: ["\u30D7\u30ED\u30B0\u30E9\u30DE\u30FC", "\u30DE\u30B9\u30BF\u30EA\u30F3\u30B0\u30A8\u30F3\u30B8\u30CB\u30A2"],
          accounts: [
            {
              name: "twitter",
              id: "GoodPaddyField5"
            },
            {
              name: "note",
              id: "203_"
            }
          ],
          backfaceColor: "#57e827",
          backfaceLogoBrightness: 10
        },
        {
          name: "Amu",
          imageId: "amu",
          post: ["UI/\u30ED\u30B4\u30C7\u30B6\u30A4\u30CA\u30FC", "\u30A8\u30D5\u30A7\u30AF\u30C8\u30AF\u30EA\u30A8\u30FC\u30BF\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "Amu_dsgn"
            }
          ],
          backfaceColor: "#e84327",
          backfaceLogoBrightness: 10
        },
        {
          name: "HIBIKI CUBE",
          imageId: "hibiki",
          post: ["Web\u30A8\u30F3\u30B8\u30CB\u30A2", "CG\u30E2\u30C7\u30E9\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "hibiki_cube"
            },
            {
              name: "github",
              id: "HIBIKI-CUBE"
            },
            {
              name: "qiita",
              id: "HIBIKI-CUBE"
            },
            {
              name: "lastfm",
              id: "HIBIKI_CUBE"
            }
          ],
          backfaceColor: "#27b1e8",
          backfaceLogoBrightness: 10
        },
        {
          name: "Matsu",
          imageId: "",
          post: ["\u30D7\u30ED\u30B0\u30E9\u30DE\u30FC", "\u30EC\u30D9\u30EB\u30C7\u30B6\u30A4\u30CA\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "sake_unity_stu"
            },
            {
              name: "github",
              id: "AtaruMatsudaira"
            }
          ],
          backfaceColor: "#e82727",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u30CA\u30DF\u30FC",
          imageId: "",
          post: ["\u30C7\u30D0\u30C3\u30AC\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "fi_matsu"
            }
          ],
          backfaceColor: "#6e27e8",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u3048\u3061\u3087",
          imageId: "echo",
          post: ["\u30EC\u30D9\u30EB\u30C7\u30B6\u30A4\u30CA\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "ysXKPSlvMZqVtIW"
            }
          ],
          backfaceColor: "#000000",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u5341\u4E8C\u6708\u306D\u3053",
          imageId: "",
          post: ["CG\u30E2\u30C7\u30E9\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "Subamaru_7"
            }
          ],
          backfaceColor: "#e82781",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u304B\u305A\u3048\u3082\u3093",
          imageId: "kazuemon",
          post: ["Web\u30C7\u30B6\u30A4\u30CA\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "kazuemon_0602",
              customUrl: "//k6n.jp/tw"
            },
            {
              name: "youtube",
              id: "kazuemon",
              customUrl: "//k6n.jp/yt"
            },
            {
              name: "github",
              id: "kazuemon",
              customUrl: "//k6n.jp/gh"
            }
          ],
          backfaceColor: "#e8a127",
          backfaceLogoBrightness: 10
        },
        {
          name: "NEO",
          imageId: "neo",
          post: ["\u30A8\u30D5\u30A7\u30AF\u30C8", "\u30B5\u30A6\u30F3\u30C9\u30C7\u30B6\u30A4\u30F3"],
          accounts: [
            {
              name: "twitter",
              id: "neo_97m"
            },
            {
              name: "github",
              id: "NEON1212121"
            }
          ],
          backfaceColor: "#7de8bd",
          backfaceLogoBrightness: 10
        },
        {
          name: "\u3059\u304E\u306E\u3053",
          post: ["3D\u30E2\u30C7\u30E9\u30FC"],
          accounts: [
            {
              name: "twitter",
              id: "ucSzlqTS3y78lIN"
            }
          ],
          backfaceColor: "#145866",
          backfaceLogoBrightness: 10
        }
      ]
    }
  },
  {
    sectionType: "footer",
    themeColor: "#fff",
    contents: {
      copyright: ["&copy; 2021", "HIBIKI CUBE", "\u30B9\u30FC\u30D1\u30FC\u30B9\u30BF\u30FC\u30DE\u30A4\u30F3"],
      codeLicense: {
        license: "mpl-2.0",
        linkLabel: "GitHub",
        url: "https://github.com/HIBIKI-CUBE/superstarmine-web"
      },
      assetsLicense: {
        ccType: "by-nd"
      }
    }
  }
];
var css = {
  code: "html,\nbody,\nmain,\n#svelte{margin:0;width:100%;height:100%;background:#000;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%;font-family:-apple-system, 'BlinkMacSystemFont', 'Hiragino Kaku Gothic ProN', '\u30E1\u30A4\u30EA\u30AA', 'Helvetica Neue', 'Helvetica', 'Arial', system-ui, sans-serif}a{text-decoration:none}.heavy{font-weight:900}.regular{font-weight:400}.break-scope{display:inline-block}.em-text{background-color:var(--bg-color);color:var(--fg-color);display:inline-block}h2.em-text{margin:0.3em 0}@media screen and (min-width: 600px){.pc-hide{display:none}}@media screen and (max-width: 600px){.mobile-hide{display:none}}article.svelte-1cumban.svelte-1cumban{background-color:#f8f9fb}article.svelte-1cumban .title.svelte-1cumban{font-size:3em}@media screen and (orientation: portrait){article.svelte-1cumban .title.svelte-1cumban{font-size:2.5em}}article.svelte-1cumban .title h2.svelte-1cumban,article.svelte-1cumban .title h3.svelte-1cumban{margin:0;display:inline-block}article.svelte-1cumban .title h3.svelte-1cumban{font-size:calc(1em * 14 / 12)}article.svelte-1cumban .title.svelte-1cumban:before{content:'';display:inline-block;width:1ch;height:3em;background-color:#f00}@media screen and (orientation: portrait){article.svelte-1cumban .title.svelte-1cumban:before{height:2.5em}}",
  map: null
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${validate_component(Nav_header, "Nheader").$$render($$result, {
    contents: settings.find((v) => v.sectionType == "navHeader").contents,
    globalSettings
  }, {}, {})}
<main>${validate_component(Hero, "Hero").$$render($$result, {}, {}, {})}
  <article class="${"svelte-1cumban"}"><div class="${"title svelte-1cumban"}"><h2 class="${"svelte-1cumban"}">GAMES</h2><h3 class="${"svelte-1cumban"}">\u4F5C\u54C1\u7D39\u4ECB</h3></div></article>
</main>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (!rendered) {
    return {
      statusCode: 404,
      body: "Not found"
    };
  }
  const partial_response = {
    statusCode: rendered.status,
    ...split_headers(rendered.headers)
  };
  if (rendered.body instanceof Uint8Array) {
    return {
      ...partial_response,
      isBase64Encoded: true,
      body: Buffer.from(rendered.body).toString("base64")
    };
  }
  return {
    ...partial_response,
    body: rendered.body
  };
}
function split_headers(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
/** @preserve SAT.js - Version 0.9.0 - Copyright 2012 - 2021 - Jim Riecken <jimr@jimr.ca> - released under the MIT License. https://github.com/jriecken/sat-js */
