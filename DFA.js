var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
(function () {
    if (typeof Object.id == "undefined") {
        var id = 0;
        Object.id = function (o) {
            if (typeof o.__uniqueid == "undefined") {
                Object.defineProperty(o, "__uniqueid", {
                    value: ++id,
                    enumerable: false,
                    // This could go either way, depending on your 
                    // interpretation of what an "id" is
                    writable: false
                });
            }
            return o.__uniqueid;
        };
    }
})();
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
var SPLIT = 'split';
var MATCH = 'match';
var State = /** @class */ (function () {
    function State(char, out, out1) {
        if (out === void 0) { out = null; }
        if (out1 === void 0) { out1 = null; }
        this.char = char;
        this.out = out;
        this.out1 = out1;
        this.lastlist = 0;
    }
    return State;
}());
var matchState = new State(MATCH);
var Ptrlist = /** @class */ (function () {
    function Ptrlist(states, numbers) {
        this.states = states;
        this.numbers = numbers;
    }
    return Ptrlist;
}());
var Frag = /** @class */ (function () {
    function Frag(start, out) {
        this.start = start;
        this.out = out;
    }
    return Frag;
}());
function list1(state, number) {
    if (number === void 0) { number = 0; }
    var p = new Ptrlist([state], [number]);
    return p;
}
function patch(ptr, state) {
    ptr.states.forEach(function (s, index) {
        if (ptr.numbers[index] === 0) {
            s.out = state;
        }
        else {
            s.out1 = state;
        }
    });
}
function append(l1, l2) {
    return new Ptrlist(__spreadArray(__spreadArray([], l1.states, true), l2.states, true), __spreadArray(__spreadArray([], l1.numbers, true), l2.numbers, true));
}
function post2nfa(post) {
    var stack = [];
    var e2, e1, e;
    for (var i = 0; i < post.length; i++) {
        var char = post[i];
        var s = void 0;
        switch (char) {
            default: {
                s = new State(char);
                stack.push(new Frag(s, list1(s)));
                break;
            }
            case '.': {
                e2 = stack.pop();
                e1 = stack.pop();
                patch(e1.out, e2.start);
                stack.push(new Frag(e1.start, e2.out));
                break;
            }
            case '|': {
                e2 = stack.pop();
                e1 = stack.pop();
                s = new State(SPLIT, e1.start, e2.start);
                stack.push(new Frag(s, append(e1.out, e2.out)));
                break;
            }
            case '?': {
                e = stack.pop();
                s = new State(SPLIT, e.start);
                stack.push(new Frag(s, append(e.out, list1(s, 1))));
                break;
            }
            case '*': {
                e = stack.pop();
                s = new State(SPLIT, e.start);
                patch(e.out, s);
                stack.push(new Frag(s, list1(s, 1)));
                break;
            }
            case '+': {
                e = stack.pop();
                s = new State(SPLIT, e.start);
                patch(e.out, s);
                stack.push(new Frag(e.start, list1(s, 1)));
                break;
            }
        }
    }
    e = stack.pop();
    patch(e.out, matchState);
    return e.start;
}
var listid = 0;
var clist = [];
var nlist = [];
function addState(list, state) {
    if (!state)
        return;
    if (state.char === SPLIT) {
        addState(list, state.out);
        addState(list, state.out1);
        return;
    }
    if (list.indexOf(state) < 0) {
        list.push(state);
    }
}
function startList(list, state) {
    addState(list, state);
}
function step(l1, char, l2) {
    l1.forEach(function (s) {
        if (s.char === char) {
            addState(l2, s.out);
        }
    });
}
function ismatch(list) {
    var ismatch = false;
    list.forEach(function (s) {
        if (s.char === MATCH)
            ismatch = true;
    });
    return ismatch;
}
var DState = /** @class */ (function () {
    function DState(l, next, left, right) {
        if (next === void 0) { next = []; }
        if (left === void 0) { left = null; }
        if (right === void 0) { right = null; }
        this.l = l;
        this.next = next;
        this.left = left;
        this.right = right;
    }
    return DState;
}());
function listcmp(l1, l2) {
    if (l1.length < l2.length)
        return -1;
    if (l1.length > l2.length)
        return 1;
    for (var i = 0; i < l1.length; i++) {
        if (Object.id(l1[i]) < Object.id(l2[i])) {
            return -1;
        }
        else if (Object.id(l1[i]) > Object.id(l2[i])) {
            return 1;
        }
    }
    return 0;
}
var root = new DState();
function dstate(l) {
    l.sort(function (a, b) { return Object.id(a) - Object.id(b); });
    var d = root;
    var rst = 'self';
    //cache
    while (d.l) {
        var compare = listcmp(l, d.l);
        if (compare < 0) {
            if (!d.left) {
                rst = "left";
                break;
            }
            d = d.left;
        }
        else if (compare > 0) {
            if (!d.right) {
                rst = 'right';
                break;
            }
            d = d.right;
        }
        else
            return d;
    }
    if (rst == 'self') {
        d.l = l;
        return d;
    }
    else if (rst == 'left') {
        d.left = new DState(l);
        return d.left;
    }
    else {
        d.right = new DState(l);
        return d.right;
    }
}
function nextstate(d, s) {
    clist = [];
    step(d.l, s, clist);
    return (d.next[s.charCodeAt(0)] = dstate(clist));
}
function match(start, test) {
    var d = start;
    for (var i = 0; i < test.length; i++) {
        var char = test[i];
        var int = char.charCodeAt(0);
        var next = d.next[int];
        if (!next) {
            next = nextstate(d, char);
        }
        d = next;
    }
    return ismatch(d.l);
}
(function main() {
    var args = process.argv.slice(2);
    var reg = args[0];
    console.log(reg);
    var test = args[1];
    console.log(test);
    var post = re2post(reg);
    if (!post) {
        console.error('invalid regular expression');
        return;
    }
    startList(clist, post2nfa(post));
    if (match(dstate(clist), test)) {
        console.info('Match');
    }
    else {
        console.info('Not Match');
    }
})();
