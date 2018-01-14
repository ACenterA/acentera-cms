
module.exports = function getParents(el) {
  var a = el;
  var parents = [];

  console.error('GET PARAENTS ... for')
  console.error(a)
  while (a) {
      parents.unshift(a);
      a = a.parentNode;
  }
  return parents;
}
