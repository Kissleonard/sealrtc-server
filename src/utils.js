function APIResult(code, result, message) {
  this.code = code;
  this.result = result;
  this.message = message;
  if (this.code === null || this.code === void 0) {
    throw new Error('Code is null.');
  }
  if (this.result === null) {
    delete this.result;
  }
  if (this.message === null) {
    delete this.message;
  }
}
var formatRegion = function (region) {
  region = String(region);
  var plusPrefix = region.indexOf('+');
  if (plusPrefix > -1) {
    region = region.substring(plusPrefix + 1);
  }
  return region;
};

let Cache = function () {
  let cache = {};
  let set = (key, value) => {
    cache[key] = value;
  };
  let get = (key) => {
    return cache[key];
  };
  let remove = (key) => {
    delete cache[key];
  };
  return {
    set,
    get,
    remove
  };
};
module.exports = {
  Cache,
  APIResult,
  formatRegion
};