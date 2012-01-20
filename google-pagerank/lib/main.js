const widgets = require("statusbar");
const requests = require("request");
exports.main = function(options, callbacks) {
    widgets.add(widgets.Widget({
      label: "Google PageRank",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADRUlEQVQ4jSXT60/VdQDH8c/vd7AlI4EHtjW0WCs1i7U2i8u54GWxYDVtpkabumX5JLs86oLYEgRDQjAIBbsYayTmCjDQMwsrtcgxUBdWkNyyJDkCB9jRw+/8vu8e8OD9D7y2tyTJiUFX/wipWxuJe/pzSo9fwiVGNDzB2ewsei0xa9u4Eq5sIpYYl5AkxRwwwLriU2hTEHtbFwte/I6//p0CEyPyWy/XE+JxJYzlwbVExBIhxTFkCwE4jsMDO9rRtk60vQfl/0jxN5fBgInBUE4OUVnEPCJqWUzKw5glBiVkXCAG3sIO7M0/Y2/vxH7hHJv2dwMOAFfXr2NGcWAJVx6mLfGPRJ/tQeACLkVNl9H6IHEvXcB+/nvyqzpxMXAbfnloGT/dcwctS5JpT02mK2kew7botYT6h29igNFwhGU72tBzp1mwOUiw5xoGqGs5zOI3UtFH6Xhq/ajay/yyJ8h6OY19DyeipVs+43jHFXANE1NRjpwZoG/kJi6GklN1qOgRPPVePIeyUG06qs3EOpCFqrOx9q5GCzceJWntx6x+vZE9DR1zajic6fsV+6370OHHUV06qk/HqvFh1fhQZQZWuR9rbwAtzW9g0YYvuDPvU5KfOsTgaBhjDMOhayypfxbVpGEfzMQ+6EU1GdgferEq/djlflSWge7P3U/Glk/Y+G4rr1X9QE/fOC4Gg8vY1Bg5R1/BqkhDtT5U7Z2r0o/2+dEeP2o8fZGxcRcDzE72Mnq1mYGeWm5N3wBgNuaQ2/gqVsVyVJ2BqrzY5ZnofR8q8SFcmP7vIt3NGQw2x/N3mxj52uZK03LCoT/BxPh9dIi7SrNRVSaeD3zYZX5UEkC7A+i2M0NXYzoT3wpz3sY5G0+kYz43jon+5jyMMZgYPHhgAypbgSq8qNTPvN1rsHYF0FRogD8aUrgVTCIcTGCqLZHJ1kRmTqRw/atHITpNxDEsLslDpZnYJatQqQ/7vZVopx85McPgya2EvkxgsuVuwq0LmTmRQvjYvYyfK8QATRdO4nnzMaxiL56ibLQrgAoC6J01c0c6MyHGzhcy0b6WcMuTTLQ/Q6S7mqgT4dLwAIvezkUFK7ALs1HhSrTThwpWIUn/A1g/hnpCRmiJAAAAAElFTkSuQmCC",
      onClick: function(e){
          var url = e.view.content.location.href;
          searchPagerankStatus(url);
      }
    }));

};
    function searchPagerankStatus(url) {
        var gGoogleCHCalc = new googlechcalc();
        var reqgr = "info:" + url;
        var reqgre = "info:" + ssUrlEncode(url).replace(/%2C/, "%2B").replace(/_/, "%5F");
        var mGoogleCH = gGoogleCHCalc.googleCH(gGoogleCHCalc.strord(reqgr));
        mGoogleCH = "6" + gGoogleCHCalc.googleNewCh(mGoogleCH);
        var querystring = "http://";
        querystring += "toolbarqueries.google.com/search?client=navclient-auto&ch=" + mGoogleCH + "&ie=UTF-8&oe=UTF-8&features=Rank" + "&q=" + reqgre;
        //var x = prompt('',querystring);
        // Request インスタンスの生成
        var request = requests.Request({
            url: querystring,
            onComplete: function() {
                var results = this.response.text;
                if(/Rank_1:1:\d/.test(results)){
                    var pagerank = results.match(/Rank_.*?:.*?:(\d+)/i)[1];
                    notify(pagerank)
                }else{
                    notify("0")
                }
            }
        });
        // GETメソッドで送信
        request.get();
    }

    function notify(message){
        var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                                  .getService(Components.interfaces.nsIAlertsService);
        alertsService.showAlertNotification("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAEkUlEQVRIibXTaVCVdRTH8QNRqUmRgYJe1ossGU4zLWbYuKNOig4TQ1opi17uvSMpqAUqekuTAIUBvQwgSiCCAi4QoizZooOJikACbpgEuQESi1oifHsBjWYWOGNn5rx6zvP5/f/znEfkMaokSuwP6MT8cd7pd3mKDLxVt7qs7Xxg1v8SUJ3zloY7J7jXUsAPW4ZNfqK4q4hxW23kOdpzoD2f5vJPDj3RgMosV//u5nRo3g7N6XReTeWb6GGTngjuKmLcVhVaQ1MSXNsM1/TQmM6N0oD8JxJQlva6b1d9JDR8AQ3hUL8RGmLprN3UnRc64J3HBtPniumpOMXoS/vHzbpSNDvwVuXHddStgkshcCkUaj+D2nVweRMtJZrTV/PctD+njpp2bJ04R78qJv8Aq2KHvHyzePaXbcc+OnDr1KKqPyoWt3RWB9J1bjlcDIYLQVCjgrMBcHYpnF0ONcFQswoubqT7fBRd1RHcrVzPnZOhjR1HAstbi3xzmrKmrsz0ETMp/NzEu63YHarU8NN8qJgHFV5w+j047QHlnlD+IVQsgAo/qPCHCi2UL4ayxVAWAKeWwskgKA2E40FQEkTzzklNW+bLWHF7QyyzVxgGN+1x7ewunQcn3OH4u1DqDsdnwo/ToWQKHJ0IR8bD9+Phuwnw7UQ4PAUOT4PiGVDgBoUz6Drkxa9xLq1bNaL6wEMUkuwtA7yni83uFUbrGjPevNtd8j4cmQiHX4Pi0VA0CgqdocAJDjpCviPkOUDuSNjvAPucYO8rkDuGrjwP6uNG30zUSMBCD1FkesozIiKimyBGfu5in7HcSNeY4vg7RW/DQSfId4J8554+4AxfO0GuE+Q4wj4HyB4JmfaQYQsZLjTEWDfFa0Wr9pQRImLwt4+tmyBGqjmiTFtiuKY5dWQHeS6Q69iD5TjC/l507wPwLntIt4M0e67EWl3f7C9qtaeM0IkYPnJFE1TytNccUWYveybsboayB9szsgfM6kV320OGEtKVkGYHO+zoiLe8E6eRgP/EHyiDglWDVJ1pdrBbCbuU98Gddr2oLaTYQrINbLfhtn5E5zatuPX7ZzuzYcg6Um17oB22kNrbX91HSbKGrVaQYMW9LQqOhjy3oL++QV2EWWYPZN3T2x7oJGtIsIR4S4hTgF4BscM5E2oc1i/d1FGMb2wcWkaiNcQrIEEBSTYQb017tPm9W9EWoLeGOGuIsYBoc4iy4PJakz3y8OY8qlZ7ibI1clgj+uGQ6ACJLrRE2HIy+IVjerWEJmsNwypDhpxpDbcHvQvE2EHEUK6vMSkfMkae7zNgr1om3Y00hwQXOqJHUR5sWr5NJaFLfGWcTi02q1WiXLZQpmZoDCOrg80u3A53higH2teYtOjmi0OfAYUBT83t2KDg/FqLmlS1hAX5yeQgH7GMnSHP/jWjU8mgQI3YhSySmdn+suWXYLP631a+1JXiK2P78g30WnFO0cjClQtk8qcqsYrylIH/NqzXyuAAlSjX+8msZLV4x6jEqs8b6LQy2MdHzMJ9xbjP4d5DhWnkRZVKTHUqGfTwwz8BNRMTWpUkr/MAAAAASUVORK5CYII=",
                "Google PageRank", "PageRank "+message, false, "", null);
    }
    function googlechcalc() {
        return this;
    }
    googlechcalc.prototype = {
        googleNewCh: function(ch) {
            ch = (((ch / 7) << 2) | ((this.myfmod(ch, 13)) & 7));
            prbuf = new Array();
            prbuf[0] = ch;
            for (var i = 1; i < 20; i++) {
                prbuf[i] = prbuf[i - 1] - 9;
            }
            ch = this.googleCH(this.c32to8bit(prbuf), 80);
            return ch;
        },
        googleCH: function(url) {
            var init = 0xE6359A60;
            var length = url.length;
            var a = 0x9E3779B9;
            var b = 0x9E3779B9;
            var c = 0xE6359A60;
            var k = 0;
            var len = length;
            var mixo = new Array();
            while (len >= 12) {
                a += (url[k + 0] + (url[k + 1] << 8) + (url[k + 2] << 16) + (url[k + 3] << 24));
                b += (url[k + 4] + (url[k + 5] << 8) + (url[k + 6] << 16) + (url[k + 7] << 24));
                c += (url[k + 8] + (url[k + 9] << 8) + (url[k + 10] << 16) + (url[k + 11] << 24));
                mixo = this.mix(a, b, c);
                a = mixo[0];
                b = mixo[1];
                c = mixo[2];
                k += 12;
                len -= 12;
            }
            c += length;
            switch (len) {
            case 11:
                c += url[k + 10] << 24;
            case 10:
                c += url[k + 9] << 16;
            case 9:
                c += url[k + 8] << 8;
            case 8:
                b += (url[k + 7] << 24);
            case 7:
                b += (url[k + 6] << 16);
            case 6:
                b += (url[k + 5] << 8);
            case 5:
                b += (url[k + 4]);
            case 4:
                a += (url[k + 3] << 24);
            case 3:
                a += (url[k + 2] << 16);
            case 2:
                a += (url[k + 1] << 8);
            case 1:
                a += (url[k + 0]);
            }
            mixo = this.mix(a, b, c);
            if (mixo[2] < 0) {
                return (0x100000000 + mixo[2]);
            } else {
                return mixo[2];
            }
        },
        hexdec: function(str) {
            return parseInt(str, 16);
        },
        zeroFill: function(a, b) {
            var z = this.hexdec(80000000);
            if (z & a) {
                a = a >> 1;
                a &= ~z;
                a |= 0x40000000;
                a = a >> (b - 1);
            } else {
                a = a >> b;
            }
            return (a);
        },
        mix: function(a, b, c) {
            a -= b;
            a -= c;
            a ^= (this.zeroFill(c, 13));
            b -= c;
            b -= a;
            b ^= (a << 8);
            c -= a;
            c -= b;
            c ^= (this.zeroFill(b, 13));
            a -= b;
            a -= c;
            a ^= (this.zeroFill(c, 12));
            b -= c;
            b -= a;
            b ^= (a << 16);
            c -= a;
            c -= b;
            c ^= (this.zeroFill(b, 5));
            a -= b;
            a -= c;
            a ^= (this.zeroFill(c, 3));
            b -= c;
            b -= a;
            b ^= (a << 10);
            c -= a;
            c -= b;
            c ^= (this.zeroFill(b, 15));
            var ret = new Array((a), (b), (c));
            return ret;
        },
        strord: function(string) {
            var result = new Array();
            for (var i = 0; i < string.length; i++) {
                result[i] = string.substr(i, 1).charCodeAt(0);
            }
            return result;
        },
        c32to8bit: function(arr32) {
            var arr8 = new Array();
            for (var i = 0; i < arr32.length; i++) {
                for (var bitOrder = i * 4; bitOrder <= i * 4 + 3; bitOrder++) {
                    arr8[bitOrder] = arr32[i] & 255;
                    arr32[i] = this.zeroFill(arr32[i], 8);
                }
            }
            return arr8;
        },
        myfmod: function(x, y) {
            var i = Math.floor(x / y);
            return (x - i * y);
        }
    };
    function ssUrlEncode(url) {
        return escape(url).replace(/\+/g, '%2C').replace(/\"/g, '%22').replace(/\'/g, '%27');
    }
// cfx run -a firefox -b "C:\Program Files\Mozilla Firefox\firefox.exe" -P "%appdata%\Mozilla\Firefox\Profiles\h545wqkn.jetpack"

