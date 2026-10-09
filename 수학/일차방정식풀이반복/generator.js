/* ---------- 유리수 ---------- */
function gcd(a,b){
  a=Math.abs(a); b=Math.abs(b);
  while(b){ [a,b]=[b,a%b]; }
  return a||1;
}
function R(n,d=1){
  if(d<0){n=-n;d=-d}
  const g=gcd(n,d);
  return {n:n/g,d:d/g};
}
const add=(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>R(a.n*b.d-b.n*a.d,a.d*b.d);
const mul=(a,b)=>R(a.n*b.n,a.d*b.d);
const div=(a,b)=>R(a.n*b.d,a.d*b.n);
const same=(a,b)=>a.n===b.n&&a.d===b.d;
const Z=()=>R(0);

function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function nonzeroInt(a,b){let n=0;while(n===0)n=randInt(a,b);return n}
function pick(a){return a[randInt(0,a.length-1)]}
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=randInt(0,i);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

const TYPES=["normal","decimal","fraction"];
const TYPE_NAME={normal:"일반",decimal:"소수 계수",fraction:"분수 계수"};

function coeff(type){
  if(type==="normal") return R(nonzeroInt(-9,9));

  if(type==="decimal"){
    let n;
    do n=nonzeroInt(-29,29); while(n%10===0);
    return R(n,10);
  }

  let d=randInt(2,9),n;
  do n=nonzeroInt(-12,12); while(n%d===0);
  return R(n,d);
}

function constant(){
  return R(randInt(-12,12));
}

function fractionHTML(r){
  if(r.d===1) return String(r.n);
  return `<span class="frac"><span class="num">${r.n}</span><span class="den">${r.d}</span></span>`;
}

function decimalString(r){
  const v=r.n/r.d;
  const s=v.toFixed(5).replace(/\.?0+$/,"");
  return s;
}

function ratHTML(r,type){
  if(r.d===1) return String(r.n);
  if(type==="decimal") return decimalString(r);
  return fractionHTML(r);
}
function absR(r){return R(Math.abs(r.n),r.d)}
function isOne(r){return r.n===r.d}
function isMinusOne(r){return r.n===-r.d}

function termHTML(term,type,first=false){
  const neg=term.v.n<0;
  const a=absR(term.v);
  let body;

  if(term.k==="x"){
    const c=isOne(a)?"":ratHTML(a,type);
    body=`${c}<span class="x">x</span>`;
  }else{
    body=ratHTML(a,type);
  }

  if(first) return (neg?"−":"")+body;
  return ` ${neg?"−":"+"} ${body}`;
}

function exprHTML(terms,type){
  const list=terms.filter(t=>t.v.n!==0);
  if(!list.length) return "0";
  return list.map((t,i)=>termHTML(t,type,i===0)).join("");
}

function linearHTML(a,b,type){
  let out=[];

  if(a.n!==0){
    const neg=a.n<0;
    const aa=absR(a);
    const c=isOne(aa)?"":ratHTML(aa,type);
    out.push((neg?"−":"")+c+"x");
  }

  if(b.n!==0){
    const neg=b.n<0;
    const bb=absR(b);
    const body=ratHTML(bb,type);

    if(!out.length) out.push((neg?"−":"")+body);
    else out.push((neg?" − ":" + ")+body);
  }

  return out.join("")||"0";
}

function xCoeffHTML(a,type){
  if(isOne(a)) return "x";
  if(isMinusOne(a)) return "−x";
  return ratHTML(a,type)+"x";
}

function signedAbsTermHTML(v,isX,type){
  const sign=v.n<0?"−":"+";
  const a=absR(v);
  const core=isX
    ? ((isOne(a)?"":ratHTML(a,type))+"x")
    : ratHTML(a,type);
  return {before:`${sign} ${core}`,after:`${sign==="+"?"−":"+"} ${core}`};
}

/* ---------- 문제 생성: 전체 항 3~5개 ---------- */
function sideSums(side){
  return side.reduce((s,t)=>{
    if(t.k==="x") s.a=add(s.a,t.v);
    else s.b=add(s.b,t.v);
    return s;
  },{a:Z(),b:Z()});
}

function generateProblem(type){
  const solution=R(randInt(-12,12));
  const total=randInt(3,5);

  // 최소: 왼쪽 x, 오른쪽 x, 그리고 상수항 1개
  const left=[{k:"x",v:coeff(type)}];
  const right=[{k:"x",v:coeff(type)}];

  const slots=total-2;
  for(let i=0;i<slots;i++){
    const target=Math.random()<.5?left:right;
    // 상수가 반드시 하나는 생기도록 마지막 슬롯 보정
    const alreadyConst=[...left,...right].some(t=>t.k==="c");
    const mustConst=(i===slots-1 && !alreadyConst);
    target.push(mustConst || Math.random()<.58
      ? {k:"c",v:constant()}
      : {k:"x",v:coeff(type)});
  }

  let L=sideSums(left),Rr=sideSums(right);

  // x계수 합이 같으면 한쪽 계수 변경
  if(same(L.a,Rr.a)){
    left[0].v=add(
      left[0].v,
      type==="normal"?R(1):type==="decimal"?R(1,10):R(1,2)
    );
    L=sideSums(left);
    Rr=sideSums(right);
  }

  // 존재하는 상수항 하나를 조절해 정수해 보장
  const leftConst=left.findIndex(t=>t.k==="c");
  const rightConst=right.findIndex(t=>t.k==="c");

  if(rightConst>=0){
    // D = (A-C)s + B
    const wantedD=add(mul(sub(L.a,Rr.a),solution),L.b);
    const otherD=sub(Rr.b,right[rightConst].v);
    right[rightConst].v=sub(wantedD,otherD);
  }else{
    // B = D - (A-C)s
    const wantedB=sub(Rr.b,mul(sub(L.a,Rr.a),solution));
    const otherB=sub(L.b,left[leftConst].v);
    left[leftConst].v=sub(wantedB,otherB);
  }

  shuffle(left);shuffle(right);
  L=sideSums(left);Rr=sideSums(right);

  return {
    type,solution,left,right,
    A:L.a,B:L.b,C:Rr.a,D:Rr.b
  };
}


window.EquationEngine={generateProblem,linearHTML,ratHTML,TYPE_NAME,TYPES};
