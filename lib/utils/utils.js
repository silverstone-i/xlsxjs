const fs = require('fs');

// useful stuff
const inherits = function(cls, superCtor, statics, prototype) {
  cls.super_ = superCtor;

  if (!prototype) {
    prototype = statics;
    statics = null;
  }

  if (statics) {
    Object.keys(statics).forEach(i => {
      Object.defineProperty(
        cls,
        i,
        Object.getOwnPropertyDescriptor(statics, i)
      );
    });
  }

  const properties = {
    constructor: {
      value: cls,
      enumerable: false,
      writable: false,
      configurable: true,
    },
  };
  if (prototype) {
    Object.keys(prototype).forEach(i => {
      properties[i] = Object.getOwnPropertyDescriptor(prototype, i);
    });
  }

  cls.prototype = Object.create(superCtor.prototype, properties);
};

const utils = {
  nop() {},
  promiseImmediate(value) {
    return new Promise(resolve => {
      if (global.setImmediate) {
        setImmediate(() => {
          resolve(value);
        });
      } else {
        // poorman's setImmediate - must wait at least 1ms
        setTimeout(() => {
          resolve(value);
        }, 1);
      }
    });
  },
  inherits,
  dateToExcel(d, date1904) {
    const daysSinceEpoch = d.getTime() / (24 * 3600 * 1000);
    const date1904Offset = date1904 ? 1462 : 0;
    return 25569 + daysSinceEpoch - date1904Offset;
  },
  excelToDate(v, date1904) {
    const date1904Offset = date1904 ? 1462 : 0;
    const daysSinceEpoch = v - 25569 + date1904Offset;
    const millisecondSinceEpoch = Math.round(daysSinceEpoch * 24 * 3600 * 1000);
    return new Date(millisecondSinceEpoch);
  },
  parsePath(filepath) {
    const last = filepath.lastIndexOf('/');
    return {
      path: filepath.substring(0, last),
      name: filepath.substring(last + 1),
    };
  },
  getRelsPath(filepath) {
    const path = utils.parsePath(filepath);
    return `${path.path}/_rels/${path.name}.rels`;
  },
  xmlEncode(text) {
    let result = '';
    let escape = '';
    let lastIndex = 0;
    let needsEscape = false;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      switch (charCode) {
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&apos;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        case 127:
          escape = '';
          break;
        default: {
          if (
            charCode <= 31 &&
            (charCode <= 8 || (charCode >= 11 && charCode !== 13))
          ) {
            escape = '';
            break;
          }
          continue;
        }
      }

      if (!needsEscape) {
        needsEscape = true;
        result = text.substring(0, i);
      } else if (lastIndex !== i) {
        result += text.substring(lastIndex, i);
      }
      lastIndex = i + 1;
      if (escape) result += escape;
    }
    if (!needsEscape) return text;
    if (lastIndex < text.length) result += text.substring(lastIndex);
    return result;
  },
  xmlDecode(text) {
    return text.replace(/&([a-z]*);/g, c => {
      switch (c) {
        case '&lt;':
          return '<';
        case '&gt;':
          return '>';
        case '&amp;':
          return '&';
        case '&apos;':
          return '\'';
        case '&quot;':
          return '"';
        default:
          return c;
      }
    });
  },
  validInt(value) {
    const i = parseInt(value, 10);
    return !Number.isNaN(i) ? i : 0;
  },

  isDateFmt(fmt) {
    if (!fmt) {
      return false;
    }

    // must remove all chars inside quotes and []
    fmt = fmt.replace(/\[[^\]]*]/g, '');
    fmt = fmt.replace(/"[^"]*"/g, '');
    // then check for date formatting chars
    const result = fmt.match(/[ymdhMsb]+/) !== null;
    return result;
  },

  fs: {
    exists(path) {
      return new Promise(resolve => {
        fs.access(path, fs.constants.F_OK, err => {
          resolve(!err);
        });
      });
    },
  },

  toIsoDateString(dt) {
    return dt.toIsoString().subsstr(0, 10);
  },

  parseBoolean(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  },

  *range(start, stop, step = 1) {
    const compareOrder = step > 0 ? (a, b) => a < b : (a, b) => a > b;
    for (let value = start; compareOrder(value, stop); value += step) {
      yield value;
    }
  },

  toSortedArray(values) {
    const result = Array.from(values);

    // Note: per default, `Array.prototype.sort()` converts values
    // to strings when comparing. Here, if we have numbers, we use
    // numeric sort.
    if (result.every(item => Number.isFinite(item))) {
      const compareNumbers = (a, b) => a - b;
      return result.sort(compareNumbers);
    }

    return result.sort();
  },

  objectFromProps(props, value = null) {
    // *Note*: Using `reduce` as `Object.fromEntries` requires Node 12+;
    // ExcelJs is >=8.3.0 (as of 2023-10-08).
    // return Object.fromEntries(props.map(property => [property, value]));
    return props.reduce((result, property) => {
      result[property] = value;
      return result;
    }, {});
  },
};

module.exports = utils;
