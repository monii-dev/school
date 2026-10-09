window.PrintRenderer={escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));},
formatEquation(p){let E=window.PrintEquation;return `${E.linearHTML(p.A,p.B,p.type)} = ${E.linearHTML(p.C,p.D,p.type)}`;},
formatRational(r){return r.d===1?String(r.n):`${r.n}/${r.d}`;},
renderProblem(q,i){const e=this.escape;return `<article class="item"><strong>${i+1}.</strong><div class="question">${q.html||e(q.question)}</div><div class="workline"></div></article>`;},
renderAnswer(q,i){const e=this.escape;return `<article class="answerItem"><strong>${i+1}.</strong><div>${q.answerHtml||e(q.mode==='view'?q.source:q.answer)}</div>${q.steps?.length?'<div class="steps">'+q.steps.map(s=>'<div>'+e(s)+'</div>').join('')+'</div>':''}</article>`;}};