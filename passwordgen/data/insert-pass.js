/**
 * Created by azu.
 * Date: 11/05/19 14:50
 * License: MIT License
 */
var input = document.getElementsByTagName("input");
for (var i = 0,len = input.length; i < len; i++) {
    if (input[i].type === "password") {
        input[i].value = arg;
    }
}
