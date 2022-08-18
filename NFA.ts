function re2post(r: string): string | null {
  let post = ''
  let natom = 0
  let nalt = 0
  let stack = [{natom:0,nalt:0}]
  let index = 0 
  let top = () => stack[index++]
  let pop = () => stack[--index]
  for(let i =0; i<r.length ;i++){
    let char = r[i]
    switch(char){
      case '(':  {
        if(natom > 1){
          post += '.'
          natom--
        }
        let s = top()
        s.natom = natom
        s.nalt = nalt
        natom = 0;
        nalt = 0;
        break
      }
      case '|': {
        if(natom == 0) return null
        while(--natom > 0) {
          post += '.'
        }
        nalt++;
        break
      }
      case ')': {
        if(natom == 0) return null
        
        while(--natom > 0) {
          post += '.'
        }
        while(nalt-- >0){
          post += '|'
        }
        let s = pop()
        if(!s) return null
        natom = s.natom
        nalt = s.nalt
        ++natom
        break
      }
      case '*':
      case '+':
      case '?': {
        if(natom == 0){
          return null
        }
        post += char;
        break
      }
      default : {
        if(natom > 1){
          --natom
          post += '.'
        }
        post  += char
        natom++
        break
      }
    }
  }
  while(--natom > 0){
    post += '.'
  }
  while(nalt-- >0){
    post += '|'
  }
  return post;
}


const SPLIT = 'split'
const MATCH = 'match'

class State {
  lastlist = 0
  constructor(
    public char:string, 
    public out: State | null = null , 
    public out1: State |null = null )
    {}
}

const matchState = new State(MATCH)
class Ptrlist {
  constructor(public states: Array<State>, public numbers: Array<0|1>){}
}
class Frag {
  constructor(public start: State, public out: Ptrlist){}
}

function list1(state: State, number : 0 | 1 = 0)  : Ptrlist {
  let p = new Ptrlist([state], [number])
  return p;
}
function patch(ptr: Ptrlist, state:State){
  ptr.states.forEach((s,index) => {
    if(ptr.numbers[index] === 0){
      s.out = state
    } else {
      s.out1 = state
    }
  })
}

function append(l1:Ptrlist, l2:Ptrlist){
  return new Ptrlist([...l1.states,...l2.states], [...l1.numbers,...l2.numbers])
}

function post2nfa(post: string) {

  let stack : Array<Frag> = []
  let e2: Frag, e1: Frag, e:Frag
  for(let i =0; i< post.length ; i++){
    const char = post[i]
    let s : State
    switch(char){
      default:{
        s = new State(char)
        stack.push(new Frag(s,list1(<State>s)))
        break
      }
      case '.': {
        e2 = <Frag>stack.pop()
        e1 = <Frag>stack.pop()
        patch(e1.out, e2.start)
        stack.push(new Frag(e1.start,e2.out))
        break
      }
      case '|': {
        e2 = <Frag>stack.pop()
        e1 = <Frag>stack.pop()
        s = new State(SPLIT, e1.start, e2.start)
        stack.push(new Frag(s, append(e1.out, e2.out)))
        break
      }
      case '?':{
        e = <Frag>stack.pop()
        s = new State(SPLIT, e.start)
        stack.push(new Frag(s, append(e.out, list1(s,1))))
        break
      }
      case '*':{
        e = <Frag>stack.pop()
        s  = new State(SPLIT, e.start)
        patch(e.out, s)
        stack.push(new Frag(s,  list1(s,1)))
        break
      }
      case '+':{
        e = <Frag>stack.pop()
        s  = new State(SPLIT, e.start)
        patch(e.out, s)
        stack.push(new Frag(e.start, list1(s,1)))
        break
      }
    }
  }
  e = <Frag>stack.pop()
  patch(e.out,matchState)
  return e.start

}

let listid = 0
type List = Set<State>
let clist= new Set<State>()
let nlist= new Set<State>()
function addState(list:List, state:State | null){
  if(!state) return
  if(state.char === SPLIT){
    addState(list,state.out)
    addState(list,state.out1)
    return
  }
  if(!list.has(state)){
    list.add(state)
  }
} 

function startList(list:List,state: State ){
  addState(list,state)
}

function step(l1:List, char: string, l2: List){
  l1.forEach(s => {
    if(s.char === char){
      addState(l2,s.out)
    }
  })
  
}

function ismatch(list:List){
  let ismatch = false
  list.forEach(s => {
    if(s.char === MATCH) ismatch =  true
  })
  return ismatch
}


function match(start: State, test: string){
  startList(clist, start)
  for(let i =0;i<test.length;i++){
    const char = test[i]
    step(clist,char,nlist)
    clist = nlist
    nlist = new Set<State>() 
  }
  return ismatch(clist)
}

(function main(){
  const args = process.argv.slice(2)
  const reg = args[0]
  
  const test = args[1]
  let post = re2post(reg)
  if(!post){
    console.error('invalid regular expression')
    return
  } 
  if(match(post2nfa(post), test)){
    console.info('Match')
  } else {
    console.info('Not Match')
  }  
})()


