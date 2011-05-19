/**
* Random String Generator
* @author Hideaki Tanabe <http://blog.kaihatsubu.com>
*
* USAGE:
* //by default 32bit, only lower cases
* var foo = generateRandomString();
* //128bit, use numbers, use upper cases, use special characters
* var bar = generateRandomString(128, true, true, ["=", "-", "?"]);
*
* @param length     (Number)  option, result string length
* @param useNumbers (Boolean) option, use numbers
* @param useNumbers (Boolean) option, use upper cases
* @param additinals (Array)   option, add specified character(s)
* @return random string
*/
var generateRandomString = function(length, useNumbers, useUpperCaseCharacters, additinals) {
  var lowerCaseCharacters = "abcdefghijklmnopqrstuvwxyz";
  var upperCaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var numbers = "0123456789";
  var base = lowerCaseCharacters;
  var result = "";
  var length = (length > 0) ? length : 32;
  var shuffle = function(array) {
    var i = array.length;
    while(i){
      var j = (Math.random() * i) >> 0;
      var t = array[--i];
      array[i] = array[j];
      array[j] = t;
    }
    return array;
  }

  useNumbers === true && (base += numbers);
  useUpperCaseCharacters === true && (base += upperCaseCharacters);
  if (typeof additinals !== "undefined") {
    for (var i = 0; i < additinals.length; i++) {
      var additinalCharacter = additinals[i];
      if ((additinalCharacter.length === 1) && (base.indexOf(additinalCharacter) === -1)) {
        base += additinalCharacter;
      }
    }
  }
  base = shuffle(base.split("")).join("");

  for (var i = 0; i < length; i++) {
    result += base.charAt(Math.random() * base.length >> 0);
  }
  return result;
}
// CommonJS
exports.generateRandomString = generateRandomString;
