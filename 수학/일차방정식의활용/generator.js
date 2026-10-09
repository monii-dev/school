(()=>{ "use strict";
const DATA=window.PROBLEM_DATA; const NAMES=window.NAME_DATA?.names||[];
function randint(min,max,step=1){
  min=Number(min);max=Number(max);step=Number(step)||1;
  const count=Math.floor((max-min)/step);
  return min+Math.floor(Math.random()*(count+1))*step;
}
function fmt(v){
  if(typeof v==="number"){
    if(Number.isInteger(v)) return String(v);
    return String(Math.round(v*1000)/1000);
  }
  return String(v);
}
function evalExpr(expr,ctx){
  const keys=Object.keys(ctx).filter(k=>/^[A-Za-z_]\w*$/.test(k));
  const vals=keys.map(k=>ctx[k]);
  return Function(...keys,`"use strict";return (${expr});`)(...vals);
}
function resolveToken(token,ctx){
  token=token.trim();
  if(Object.prototype.hasOwnProperty.call(ctx,token)) return ctx[token];
  const m=token.match(/^%([A-Za-z_]\w*)%$/);
  if(m && Object.prototype.hasOwnProperty.call(ctx,m[1])) return ctx[m[1]];
  return token;
}
function command(body,ctx){
  let assign=null;
  const a=body.match(/^%([A-Za-z_]\w*)%=(.+)$/);
  if(a){assign=a[1];body=a[2];}
  const parts=body.split("=");
  const cmd=parts[0];
  let value;
  if(cmd==="randint"){
    value=randint(parts[1],parts[2],parts[3]??1);
  }else if(cmd==="or"){
    const options=parts.slice(1).map(v=>resolveToken(v,ctx));
    value=options[Math.floor(Math.random()*options.length)];
  }else if(cmd==="calc"){
    value=evalExpr(parts.slice(1).join("="),ctx);
  }else{
    value=resolveToken(body,ctx);
  }
  if(assign)ctx[assign]=value;
  return fmt(value);
}
function ensureNames(s,ctx){
  return s.replace(/%name(\d+)%/g,(_,n)=>{
    const key="name"+n;
    if(!ctx[key]){
      const used=new Set(Object.keys(ctx).filter(k=>/^name\d+$/.test(k)).map(k=>ctx[k]));
      const pool=NAMES.filter(name=>!used.has(name));
      const source=pool.length?pool:NAMES;
      ctx[key]=source[Math.floor(Math.random()*source.length)];
    }
    return ctx[key];
  });
}
function hasBatchim(word){
  const chars=[...String(word).trim()];
  const ch=chars.at(-1)||"";
  const code=ch.charCodeAt(0);
  return code>=0xAC00&&code<=0xD7A3 ? ((code-0xAC00)%28)!==0 : false;
}
function hasRieul(word){
  const chars=[...String(word).trim()];
  const ch=chars.at(-1)||"";
  const code=ch.charCodeAt(0);
  return code>=0xAC00&&code<=0xD7A3&&((code-0xAC00)%28)===8;
}
function josa(word,pair){
  const p=pair.replace(/\s/g,""), batch=hasBatchim(word);
  // 일반 주제 조사: 책[은/는] → 책은, 사과[은/는] → 사과는
  if(p==="은/는"||p==="는/은") return batch?"은":"는";

  // 이름을 말하듯 부르는 주제 조사:
  // 지민[이는/는] → 지민이는, 세하[이는/는] → 세하는
  if(p==="이는/는"||p==="는/이는") return batch?"이는":"는";

  if(p==="이/가"||p==="가/이") return batch?"이":"가";
  if(p==="을/를"||p==="를/을") return batch?"을":"를";
  if(p==="과/와"||p==="와/과") return batch?"과":"와";
  if(p==="으로/로"||p==="로/으로") return (!batch||hasRieul(word))?"로":"으로";

  return pair.split("/")[batch?0:1]||"";
}
function applyJosa(s){
  return s.replace(/([가-힣A-Za-z0-9()·]+)\[([^\]]+\/[^\]]+)\]/g,(_,w,p)=>w+josa(w,p));
}
function render(template,ctx){
  let s=ensureNames(String(template??""),ctx);
  let guard=0;
  while(/\{[^{}]+\}/.test(s)&&guard++<80){
    s=s.replace(/\{([^{}]+)\}/g,(_,body)=>command(body,ctx));
  }
  s=s.replace(/%([A-Za-z_]\w*)%/g,(_,key)=>
    Object.prototype.hasOwnProperty.call(ctx,key)?fmt(ctx[key]):`%${key}%`
  );
  return applyJosa(s);
}

/* ---------- 안전한 HTML + 실제 분수 렌더 ---------- */
function escapeHTML(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function fracHTML(num,den){
  return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}
function mathHTML(text){
  let s=escapeHTML(text);

  // (a+b) ÷ (c+d)
  for(let i=0;i<4;i++){
    s=s.replace(
      /(\([^()<>]+\)|-?[A-Za-z0-9.]+)\s*÷\s*(\([^()<>]+\)|-?[A-Za-z0-9.]+)/g,
      (_,a,b)=>fracHTML(a,b)
    );
  }

  // 3/4, x/5 등의 간단한 분수
  s=s.replace(
    /\b([A-Za-z0-9.]+)\s*\/\s*([A-Za-z0-9.]+)\b/g,
    (_,a,b)=>fracHTML(a,b)
  );

  return s;
}



function build(t){
 const ctx={}; render("%name1% %name2% %name3%",ctx);
 for(const init of (t.init||[]))render(init,ctx);
 const problem=render(t.problem,ctx),equation=render(t.equation,ctx);
 const solution=(t.solution||[]).map(x=>render(x,ctx));
 const answer=Object.prototype.hasOwnProperty.call(ctx,t.answer)?ctx[t.answer]:evalExpr(t.answer,ctx);
 return {t,ctx,problem,equation,solution,answer};
}
window.ApplicationEngine={randint,fmt,evalExpr,resolveToken,command,ensureNames,hasBatchim,hasRieul,josa,applyJosa,render,escapeHTML,fracHTML,mathHTML,build,DATA};
})();
