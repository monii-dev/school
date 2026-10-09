/* Offline PDF exporter. Browser canvas paints Korean text; JPEG pages are packed into a PDF Blob. No fetch, external dependencies or print dialog. */
(()=>{'use strict';
const encoder=new TextEncoder();
function pack(parts){let size=parts.reduce((n,x)=>n+x.length,0),out=new Uint8Array(size),offset=0;for(let x of parts){out.set(x,offset);offset+=x.length}return out}
function bytes(s){return encoder.encode(s)}
function jpegBytes(canvas){const base64=canvas.toDataURL('image/jpeg',.88).split(',')[1];const raw=atob(base64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
function buildPdf(jpegs,width,height){const parts=[bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];let position=parts[0].length;const put=data=>{parts.push(data);position+=data.length};const obj=(id,body)=>{offsets[id]=position;put(bytes(id+' 0 obj\n'+body+'\nendobj\n'))};const pages=jpegs.map((_,i)=>3+3*i);obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${pages.map(i=>i+' 0 R').join(' ')}] /Count ${pages.length} >>`);
 jpegs.forEach((jpg,i)=>{const pageId=pages[i],imageId=pageId+1,contentId=pageId+2;obj(pageId,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Img${i} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);offsets[imageId]=position;put(bytes(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`));put(jpg);put(bytes('\nendstream\nendobj\n'));const command=bytes(`q\n595.28 0 0 841.89 0 0 cm\n/Img${i} Do\nQ\n`);offsets[contentId]=position;put(bytes(`${contentId} 0 obj\n<< /Length ${command.length} >>\nstream\n`));put(command);put(bytes('endstream\nendobj\n'))});
const start=position,max=2+jpegs.length*3;put(bytes(`xref\n0 ${max+1}\n0000000000 65535 f \n`));for(let id=1;id<=max;id++)put(bytes(String(offsets[id]).padStart(10,'0')+' 00000 n \n'));put(bytes(`trailer\n<< /Size ${max+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`));return new Blob([pack(parts)],{type:'application/pdf'});
}
// Convert rich question HTML (especially fraction-based equations) into printable text.
function richText(html){
 const el=document.createElement('div');el.innerHTML=String(html??'');
 el.querySelectorAll('.frac').forEach(node=>{const n=node.querySelector('.num')?.textContent.trim()||'';const d=node.querySelector('.den')?.textContent.trim()||'';node.replaceWith(document.createTextNode(d?`(${n}/${d})`:n));});
 el.querySelectorAll('br').forEach(node=>node.replaceWith(document.createTextNode(' ')));
 return (el.textContent||'').replace(/\s+/g,' ').trim();
}
function printable(q,which){
 if(which==='answer')return q.answerHtml?richText(q.answerHtml):String(q.mode==='view'?q.source??q.answer:q.answer??'');
 return q.html?richText(q.html):String(q.question??'');
}
function save(items,which,unit){const W=1240,H=1754,M=92,limit=H-102;let canvases=[],canvas,ctx,y=0,page=0;
function newPage(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,W,H);ctx.fillStyle='#111';ctx.textBaseline='top';ctx.font='bold 35px "Malgun Gothic",sans-serif';ctx.fillText(which==='answer'?'정답 및 해설':'문제지',M,70);ctx.font='20px "Malgun Gothic",sans-serif';ctx.fillStyle='#777';ctx.fillText(unit+' · '+items.length+'문제',M,125);ctx.fillText(String(++page),W-M-30,H-70);ctx.fillStyle='#111';y=190;canvases.push(canvas)}
function wrap(text,font,maxWidth){ctx.font=font;const parts=String(text??'').split(/\s+/),lines=[];let line='';for(const part of parts){if(!part)continue;const attempt=line?line+' '+part:part;if(ctx.measureText(attempt).width>maxWidth&&line){lines.push(line);line=part}else line=attempt}if(line)lines.push(line);return lines.length?lines:['']}
function add(text,size=27,color='#141414',height=43,indent=0){const font=`${size}px "Malgun Gothic", "Apple SD Gothic Neo",sans-serif`;const lines=wrap(text,font,W-2*M-indent);if(y+lines.length*height>limit)newPage();ctx.font=font;ctx.fillStyle=color;for(const line of lines){ctx.fillText(line,M+indent,y);y+=height}}
newPage();
if(items.length===1&&items[0].englishDocument){
 const doc=items[0];let blankNo=0;
 for(const block of doc.blocks){
  if(block.type==='heading'){y+=22;add(block.text,26,'#916a15',45);y+=12;continue}
  if(block.type==='title'){add(block.plain||'',25,'#242424',42);y+=10;continue}
  // Same paragraph boundaries as source; blanks remain in the running text.
  let line=block.plain||'';
  if(which==='problem'&&doc.mode==='blank'){
   const choices=(block.html.match(/<span class=\"blank-word\">/g)||[]).length;
   const div=document.createElement('div');div.innerHTML=block.html;
   div.querySelectorAll('.blank-word').forEach(el=>{const num=el.querySelector('sup')?.textContent||'';el.replaceWith(document.createTextNode('['+num+'] __________'))});
   line=div.textContent||line;
  }
  add(line,25,'#1b1b1b',40);y+=22;
 }
 if(which==='answer'&&doc.answers.length){y+=12;add('빈칸 정답',25,'#222',43);for(const a of doc.answers)add(a.index+'. '+a.word,22,'#333',35)}
}else for(let i=0;i<items.length;i++){const q=items[i];const source=printable(q,which);const details=which==='answer'?(q.steps||[]):[];const estimate=48+Math.ceil(source.length/45)*44+details.reduce((sum,t)=>sum+Math.ceil(String(t).length/48)*31,0)+(which==='problem'?65:18);if(y+estimate>limit)newPage();add((i+1)+'.  '+source,27,'#111',42);if(which==='answer'){for(const step of details)add(step,18,'#555',31,22);y+=22}else {y+=65;ctx.strokeStyle='#ddd';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=23}}
const pdf=buildPdf(canvases.map(jpegBytes),W,H);const url=URL.createObjectURL(pdf);const a=document.createElement('a');a.href=url;a.download=(which==='answer'?'답안지_':'문제지_')+unit.replace(/[\\/:*?"<>|]/g,'_')+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
window.SchoolPdfDownload={save};
})();
