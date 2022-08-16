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
    console.log(char, natom)
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

const test = 'ab|cd'
let rst = re2post(test)
console.log(test)
console.log(rst);
