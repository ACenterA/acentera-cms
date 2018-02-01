
module.exports = function getParents(el) {
  var a = el;
  var parents = [];

  while (a) {
      parents.unshift(a);
      a = a.parentNode;
  }
  return parents;
}
