interface Function {
  processAfter(fn: Function);
}

if (!Function.prototype.processAfter) {
  Function.prototype.processAfter = function(fn: Function) {
    const self = this;
    return function(...args) {
      const ret = self.apply(this, args);
      return ret === `NEXT_SUCCESSOR` ? fn.apply(this, args) : ret;
    };
  };
}