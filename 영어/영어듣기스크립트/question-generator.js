(()=>{
function sentences(text){return String(text).replace(/\b([ap])\.m\./gi,'$1~m~').split(/(?<=[.!?])\s+(?=[A-Z“])/).map(x=>x.replace(/([ap])~m~/gi,'$1.m.').trim()).filter(Boolean)}
function extract(content,ids,translations){
 const out=[];for(const id of ids){const obj=content[id];if(!obj)continue;let pos=0;for(const block of obj.blocks||[]){if(block.type!=='paragraph')continue;const raw=(block.runs||[]).map(r=>r.text||'').join('').trim();for(const sent of sentences(raw)){const clean=sent.replace(/^\([^)]*\)\s*/, '').replace(/^(ONE|TWO|THREE|FOUR):\s*/i,'').trim();if(clean&&!/^Q\d[.:]/i.test(clean)){out.push({section:id,english:clean,korean:(translations?.[id]||[])[pos]||'',source:'본문'});}pos++;}}}return out;
}
function generate(content,ids,count,mode,translations){
const src=extract(content,ids,translations), output=[];if(!src.length)return output;
for(let i=0;i<count;i++){let item=src[i%src.length];let question=mode==='write'?(item.korean||'첫 단어: '+(item.english.match(/^[A-Za-z]+/)||[''])[0]):item.english;let answer=item.english;
if(mode==='blank'){const words=[...item.english.matchAll(/\b[A-Za-z][A-Za-z'-]*\b/g)];if(words.length){const w=words[Math.floor(Math.random()*words.length)];const st=w.index;answer=w[0];question=item.english.slice(0,st)+'____________'+item.english.slice(st+w[0].length);}}
output.push({section:item.section,question,answer,meaning:item.korean,mode,source:item.english});}return output;
}
window.EnglishQuestionEngine={sentences,extract,generate};
})();