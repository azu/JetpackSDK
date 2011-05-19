/**
 * Created by azu.
 * Date: 11/05/19 14:17
 * License: MIT License
 */
var generateRandomString = require("random-string-generator").generateRandomString;
/**
 * @param length     (Number)  option, string length
 * @param useNumbers (Boolean) option, use numbers
 * @param useNumbers (Boolean) option, use upper cases
 * @param additinals (Array)   option, add specified character(s)
 * @return random string
 */
exports.test_noparam_generate = function(test) {
    var lowerCaseCharacters = /^[abcdefghijklmnopqrstuvwxyz]*$/;// 小文字
    var password = generateRandomString();
    test.assertEqual(password.length, 32);
    test.assertMatches(password, lowerCaseCharacters, "小文字のみで構成される");
}
exports.test_length = function(test) {
    var password = generateRandomString(12);
    test.assertEqual(password.length, 12);
}
//exports.test_random_duplication = function(test) {
//    var passAry = [];
//    for (var i = 0,len = 1000; i < len; i++) {
//        passAry[i] = generateRandomString(12, true, true);
//    }
//    for (var i = 0,len = passAry.length; i < len; i++) {
//        var pass = passAry[i];
//        test.assertNotEqual(pass, generateRandomString(12, true, true), "パスワードが重複");
//    }
//}