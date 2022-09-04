//Middleware is the programming pattern of providing hooks with a resume callback.
var start = new Date();
console.clear();
// constructor
var Middleware = function () {
  var THIS = this;
  THIS.root = null;
  THIS.lastNode = null;

  function Node(cb) {
    let p = () => {
      return new Promise((res, rej) => {
        cb.call(THIS, res);
      });
    };
    this.callback = p;
    this.next = null;
  }

  this.getLastNode = function () {
    this.lastNode = this.root;
    while (this.lastNode.next !== null) {
      this.lastNode = this.lastNode.next;
    }
    return this.lastNode;
  };

  this.exec = async () => {
    let n = THIS.root;

    if (n != null) {
      do {
        await n.callback();
        n = n.next;
      } while (n);
    }
  };

  this.use = function (cb) {
    if (this.root) {
      THIS.lastNode = this.getLastNode();
      THIS.lastNode.next = new Node(cb);
    } else {
      THIS.root = new Node(cb);
    }
  };

  this.go = async function (cb) {
    THIS.lastNode = this.getLastNode();
    THIS.lastNode.next = new Node(cb);
    await this.exec();
  };
};

// usage
var middleware = new Middleware();

middleware.use(function (next) {
  var self = this;
  setTimeout(function () {
    self.hook1 = 1;
    next();
  }, 10);
});

middleware.use(function (next) {
  var self = this;
  self.hook2 = self.hook1 * 3;
  console.log("before set timeout: self.hook2", self.hook2);
  setTimeout(function () {
    self.hook2 = self.hook1 * 5;
    next();
  }, 10);
});

middleware.use(function (next) {
  var self = this;
  self.hook3 = self.hook2;
  console.log("before set timeout: self.hook3", self.hook3);
  setTimeout(function () {
    self.hook3 = self.hook2 + 2;
    next();
  }, 10);
});

middleware.go(function () {
  console.log(this.hook1); // 1
  console.log(this.hook2); // 5
  console.log(this.hook3); // 7
  console.log(new Date() - start); //32
});

// a simple util
function isNotEmpty(arr) {
  if (Array.isArray(arr) && arr.length) {
    return true;
  }
  return false;
}
