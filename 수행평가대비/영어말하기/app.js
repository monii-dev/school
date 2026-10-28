(()=>{'use strict';
const $=id=>document.getElementById(id);
const home=$('home'),exam=$('exam'),results=$('results'),viewer=$('viewer');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>s.toLowerCase().replace(/[‘’ʼ`]/g,"'").replace(/[^a-z0-9'\s-]/g,'').replace(/\s+/g,' ').trim();
const words=s=>s.trim().split(/\s+/).filter(Boolean);
const shuffled=a=>[...a].sort(()=>Math.random()-.5);
// 고른 순서가 충분히 잘 섞이도록 Fisher-Yates 셔플 사용
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
const fmt=ms=>{const n=Math.max(0,ms)/1000;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}.${Math.floor(n%1*10)}`};
function speak(sentence){
 if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){$('speechNotice').classList.remove('hidden');alert('이 브라우저는 음성 재생을 지원하지 않습니다.');return}
 window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(sentence);u.lang='en-US';u.rate=Number($('voiceSpeed')?.value||.88);u.pitch=1;
 const voices=window.speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase()==='en-us')||voices.find(v=>v.lang.toLowerCase().startsWith('en'));
 if(voice)u.voice=voice;window.speechSynthesis.speak(u);
}
function stopSpeaking(){if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function viewAll(){stopSpeaking();$('viewList').innerHTML=window.WORD_LIST.map(q=>`<article class="view-item"><div class="view-head"><span class="tag">${q.id}번 문장</span><button class="speaker" type="button" data-speak-id="${q.id}" aria-label="${q.id}번 영어 발음 듣기" title="발음 듣기">🔊</button></div><div class="en">${escapeHTML(q.en)}</div><div class="korean">${escapeHTML(q.ko)}</div></article>`).join('');display(viewer)}
let questions=[],idx=0,errors=0,records=[],mode='six',startAt=0,questionAt=0,interval=null,answerShown=false;
function display(page){['speechExam','speechResults','speechModal'].forEach(id=>$(id)?.classList.add('hidden'));[home,exam,results,viewer].forEach(x=>x.classList.add('hidden'));page.classList.remove('hidden')}
function current(){return questions[idx]}
function tick(){$('elapsed').textContent=fmt(performance.now()-startAt)}
function launch(m){stopSpeaking();mode=m;const pool=shuffle(window.WORD_LIST);questions=m==='six'?pool.slice(0,6):[...pool,...shuffle(window.WORD_LIST).slice(0,10)];idx=0;errors=0;records=[];startAt=performance.now();questionAt=startAt;clearInterval(interval);interval=setInterval(tick,90);display(exam);load()}
function load(){stopSpeaking();$('examSpeak').classList.add('hidden');const q=current();questionAt=performance.now();errors=0;answerShown=false;$('position').textContent=`${idx+1} / ${questions.length}`;$('bar').style.width=`${idx/questions.length*100}%`;$('number').textContent=`원본 ${q.id}번 문장${idx>=20&&mode==='all'?' · 복습':''}`;$('translation').textContent=q.ko;$('typing').value='';$('typing').disabled=false;$('check').disabled=false;$('check').textContent='채점하기 ↵';$('showAnswer').textContent='정답 보기';$('errorCount').textContent='0';$('feedback').innerHTML='';$('feedback').classList.add('hidden');$('typing').focus()}
function compare(actual,expected){const a=words(actual),b=words(expected),an=a.map(normalize),bn=b.map(normalize),n=a.length,m=b.length;
 const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));for(let i=0;i<=n;i++)dp[i][0]=i;for(let j=0;j<=m;j++)dp[0][j]=j;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(an[i-1]===bn[j-1]?0:1));
 let i=n,j=m;const steps=[];while(i||j){if(i&&j&&an[i-1]===bn[j-1]&&dp[i][j]===dp[i-1][j-1]){steps.push({type:'same',ai:i-1,bi:j-1});i--;j--}
 else if(i&&j&&dp[i][j]===dp[i-1][j-1]+1){steps.push({type:'wrong',ai:i-1,bi:j-1});i--;j--}
 else if(j&&dp[i][j]===dp[i][j-1]+1){steps.push({type:'missing',bi:j-1});j--}
 else{steps.push({type:'extra',ai:i-1});i--}}
 steps.reverse();const flags=Array(n).fill(''),neighbors=new Set(),missing=[];for(let p=0;p<steps.length;p++){const s=steps[p];if(s.ai!==undefined&&s.type!=='same')flags[s.ai]='wrong';if(s.type==='missing'){let left=null,right=null;for(let x=p-1;x>=0;x--)if(steps[x].ai!==undefined){left=steps[x].ai;break}for(let x=p+1;x<steps.length;x++)if(steps[x].ai!==undefined){right=steps[x].ai;break}if(left!==null)neighbors.add(left);if(right!==null)neighbors.add(right);missing.push({left,right,word:b[s.bi]})}}
 const out=[];for(let k=0;k<n;k++){for(const miss of missing.filter(x=>x.right===k&&x.left===null))out.push(`<span class="missing">[앞에 단어 누락]</span>`);const highlight=flags[k]==='wrong'?'wrong':neighbors.has(k)?'neighbor':'';out.push(`<span class="word ${highlight}">${escapeHTML(a[k])}</span>`);for(const miss of missing.filter(x=>x.left===k))out.push(`<span class="missing">${miss.right===null?'[뒤에 단어 누락]':'[사이에 단어 누락]'}</span>`)}if(!n)out.push('<span class="missing">[문장 전체가 비어 있음]</span>');return {valid:dp[n][m]===0,html:out.join(' '),missing:missing.length};}
function feedback(html){$('feedback').innerHTML=html;$('feedback').classList.remove('hidden')}
function check(){const q=current(),txt=$('typing').value.trim();$('examSpeak').classList.remove('hidden');const test=compare(txt,q.en);if(test.valid){const elapsed=performance.now()-questionAt;records.push({q,ms:elapsed,errors});$('typing').disabled=true;$('check').textContent='다음 문장 →';$('check').onclick=next;$('showAnswer').disabled=true;feedback(`<div class="success"><strong>✓ 정답!</strong> ${fmt(elapsed)} · 오답 ${errors}회</div><div class="expected">${escapeHTML(q.en)}</div>`);return}
 errors++;$('errorCount').textContent=errors;const text=test.missing?'주황색: 빠진 단어 위치의 양쪽 단어 · 빨간색: 다르거나 불필요한 단어':'빨간색으로 표시된 단어를 확인하세요';feedback(`<strong class="fail">✕ 다시 시도해 보세요</strong><span class="small">${text}</span><div>${test.html}</div>${answerShown?`<div class="expected">정답: ${escapeHTML(q.en)}</div>`:''}`);$('typing').focus()}
function next(){stopSpeaking();idx++;$('check').onclick=check;if(idx<questions.length){$('showAnswer').disabled=false;load()}else finish()}
function finish(){stopSpeaking();clearInterval(interval);$('bar').style.width='100%';display(results);const total=performance.now()-startAt;$('totalTime').textContent=fmt(total);$('totalErrors').textContent=records.reduce((s,r)=>s+r.errors,0)+'회';$('totalQuestions').textContent=records.length+'문장';$('resultRows').innerHTML=records.map((r,i)=>`<tr><td>${i+1}<span class="muted"> (#${r.q.id})</span></td><td><div class="result-english"><span>${escapeHTML(r.q.en)}</span><button class="speaker" type="button" data-speak-id="${r.q.id}" aria-label="${r.q.id}번 영어 발음 듣기" title="발음 듣기">🔊</button></div></td><td>${fmt(r.ms)}</td><td>${r.errors}회</td></tr>`).join('')}
$('startView').onclick=viewAll;$('viewBack').onclick=()=>{stopSpeaking();display(home)}; $('examSpeak').onclick=()=>speak(current().en);document.addEventListener('click',e=>{const button=e.target.closest('[data-speak-id]');if(!button)return;const q=window.WORD_LIST.find(item=>item.id===Number(button.dataset.speakId));if(q)speak(q.en)});$('startAll').onclick=()=>launch('all');$('startSix').onclick=()=>launch('six');$('check').onclick=check;
$('typing').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!$('check').disabled)$('check').click()}});
$('showAnswer').onclick=()=>{answerShown=!answerShown;$('showAnswer').textContent=answerShown?'정답 숨기기':'정답 보기';const q=current();if(answerShown)feedback(`<span class="small">참고용 정답</span><div class="expected">${escapeHTML(q.en)}</div>`);else{$('feedback').classList.add('hidden')}};
$('quit').onclick=()=>{stopSpeaking();clearInterval(interval);display(home)};
$('again').onclick=()=>launch(mode);$('backHome').onclick=()=>{stopSpeaking();display(home)};
window.englishPracticeSpeak=speak;window.englishPracticeHome=()=>{stopSpeaking();clearInterval(interval);display(home)};window.englishPracticeHideOld=()=>{clearInterval(interval);stopSpeaking();[home,exam,results,viewer].forEach(x=>x.classList.add('hidden'))};
if(!Array.isArray(window.WORD_LIST)||window.WORD_LIST.length===0){home.innerHTML='<p>word_list.js를 불러오지 못했습니다.</p>'}
})();
