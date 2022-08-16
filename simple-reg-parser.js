function re2post(r) {
    var post = '';
    var natom = 0;
    var nalt = 0;
    var stack = [{ natom: 0, nalt: 0 }];
    var index = 0;
    var top = function () { return stack[index++]; };
    var pop = function () { return stack[--index]; };
    for (var i = 0; i < r.length; i++) {
        var char = r[i];
        console.log(char, natom);
        switch (char) {
            case '(': {
                if (natom > 1) {
                    post += '.';
                    natom--;
                }
                var s = top();
                s.natom = natom;
                s.nalt = nalt;
                natom = 0;
                nalt = 0;
                break;
            }
            case '|': {
                if (natom == 0)
                    return null;
                while (--natom > 0) {
                    post += '.';
                }
                nalt++;
                break;
            }
            case ')': {
                if (natom == 0)
                    return null;
                while (--natom > 0) {
                    post += '.';
                }
                while (nalt-- > 0) {
                    post += '|';
                }
                var s = pop();
                if (!s)
                    return null;
                natom = s.natom;
                nalt = s.nalt;
                ++natom;
                break;
            }
            case '*':
            case '+':
            case '?': {
                if (natom == 0) {
                    return null;
                }
                post += char;
                break;
            }
            default: {
                if (natom > 1) {
                    --natom;
                    post += '.';
                }
                post += char;
                natom++;
                break;
            }
        }
    }
    while (--natom > 0) {
        post += '.';
    }
    while (nalt-- > 0) {
        post += '|';
    }
    return post;
}
var test = 'ab|cd';
var rst = re2post(test);
console.log(test);
console.log(rst);
