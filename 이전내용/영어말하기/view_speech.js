(()=>{'use strict';
const $=id=>document.getElementById(id), Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>window.englishSpeechMatch.canonical(s);
const tokenize=s=>s.trim().split(/\s+/).filter(Boolean), cleanWord=s=>norm(s);
let active=null,rec=null,session=0,listening=false,finalText='',lastInterim='',error=false;
function setButtons(){ $('viewSpeechStart').disabled=listening; $('viewSpeechStop').disabled=!listening; }
function stop(abort=true){session++;const r=rec;rec=null;listening=false;setButtons();if(r){r.onresult=r.onend=r.onerror=null;try{abort?r.abort():r.stop()}catch(_){}}}
function reset(){stop();finalText='';lastInterim='';error=false;$('viewSpeechLive').textContent='아직 인식된 말이 없어요.';$('viewSpeechStatus').textContent='말하기 시작을 눌러 연습하세요.';$('viewSpeechComparison').classList.add('hidden');}
function open(q){active=q;reset();$('viewSpeechTitle').textContent=`${q.id}번 · 발음 연습`;$('viewSpeechEnglish').textContent=q.en;$('viewSpeechKorean').textContent=q.ko;$('viewSpeechModal').classList.remove('hidden');start();}
function close(){stop();active=null;$('viewSpeechModal').classList.add('hidden');}
function diff(expected,spoken){const a=tokenize(expected),b=tokenize(spoken),n=a.length,m=b.length;const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));for(let i=0;i<=n;i++)dp[i][0]=i;for(let j=0;j<=m;j++)dp[0][j]=j;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(cleanWord(a[i-1])===cleanWord(b[j-1])?0:1));
 let i=n,j=m,changes=[];while(i||j){if(i&&j&&cleanWord(a[i-1])===cleanWord(b[j-1])&&dp[i][j]===dp[i-1][j-1]){changes.push({type:'same',want:a[i-1],got:b[j-1]});i--;j--}
 else if(i&&j&&dp[i][j]===dp[i-1][j-1]+1){changes.push({type:'replace',want:a[i-1],got:b[j-1]});i--;j--}
 else if(i&&dp[i][j]===dp[i-1][j]+1){changes.push({type:'missing',want:a[i-1]});i--}
 else{changes.push({type:'extra',got:b[j-1]});j--}}
 changes.reverse();return {correct:dp[n][m]===0,changes};}
function renderResult(spoken){if(!active)return;const d=diff(active.en,spoken),wrap=$('viewSpeechComparison');wrap.classList.remove('hidden');$('viewSpeechStatus').innerHTML=window.englishSpeechMatch.equal(spoken,active.en)?'<strong class="success">✓ 맞았어요! 잘했어요.</strong>':'<strong class="fail">✕ 틀렸어요. 표시된 부분을 연습해 보세요.</strong>';
 const equivalent=window.englishSpeechMatch.equal(spoken,active.en);const output=(equivalent?tokenize(active.en).map(w=>({type:'same',want:w,got:w})):d.changes).map(c=>{if(c.type==='same')return `<span class="practice-token">${escape(c.want)}</span>`;if(c.type==='extra')return `<span class="practice-token practice-extra" title="추가로 인식된 단어">${escape(c.got)} <small>(추가)</small></span>`;return `<span class="practice-token practice-error" title="${c.type==='missing'?'빠진 단어':'다르게 인식된 단어'}">${escape(c.want)} <button type="button" data-play-part="${escape(c.want)}" aria-label="${escape(c.want)} 발음 듣기" title="이 부분 발음 듣기">🔊</button></span>`}).join(' ');
 $('viewSpeechExpected').innerHTML=output;$('viewSpeechHeard').textContent=spoken||'(인식된 단어 없음)';const issue=(equivalent?[]:d.changes.filter(c=>c.type==='replace'||c.type==='missing')).map(c=>c.want);$('viewSpeechPart').innerHTML=issue.length?`<button class="ghost" type="button" id="viewSpeechAllErrors">🔊 틀린 부분 이어 듣기</button>`:'<span class="detail-note">정답 문장과 일치합니다.</span>';const all=$('viewSpeechAllErrors');if(all)all.onclick=()=>window.englishPracticeSpeak(issue.join(' '));}
function start(){if(!active||listening)return;if(!Recognition){$('viewSpeechStatus').textContent='이 브라우저에서는 음성 인식이 지원되지 않아요. Chrome 또는 Edge를 사용해 주세요.';return}stop();finalText='';lastInterim='';error=false;$('viewSpeechComparison').classList.add('hidden');let r;try{r=new Recognition()}catch(_){$('viewSpeechStatus').textContent='음성 인식을 시작할 수 없어요.';return}rec=r;const token=++session;listening=true;setButtons();r.lang='en-US';r.continuous=false;r.interimResults=true;r.maxAlternatives=1;$('viewSpeechStatus').textContent='듣는 중… 영어로 말해 보세요.';$('viewSpeechLive').textContent='듣고 있어요…';
 r.onresult=e=>{if(token!==session)return;let f='',interim='';for(let i=0;i<e.results.length;i++){const t=e.results[i][0]?.transcript||'';if(e.results[i].isFinal)f+=(f?' ':'')+t;else interim+=(interim?' ':'')+t}finalText=f;lastInterim=interim;const heard=(f+' '+interim).trim();$('viewSpeechLive').textContent=heard||'듣고 있어요…';if(heard&&window.englishSpeechMatch.equal(heard,active.en)){stop();renderResult(heard)}};
 r.onerror=e=>{if(token!==session)return;error=true;const code=e.error||'';$('viewSpeechStatus').textContent=code==='not-allowed'||code==='service-not-allowed'?'마이크가 차단되었어요. 사이트 마이크 권한을 허용해 주세요.':code==='network'?'음성 인식 서비스 연결 오류입니다. 인터넷을 확인해 주세요.':code==='no-speech'?'말소리가 감지되지 않았어요. 다시 시도해 주세요.':`음성 인식 오류: ${code}`;};
 r.onend=()=>{if(token!==session)return;rec=null;listening=false;setButtons();const heard=(finalText+' '+lastInterim).trim();if(heard)renderResult(heard);else if(!error)$('viewSpeechStatus').textContent='인식된 말이 없어요. 다시 말해 보세요.';};
 try{r.start()}catch(_){stop();$('viewSpeechStatus').textContent='마이크를 시작하지 못했어요. 권한을 확인해 주세요.';}}
function finish(){if(!rec||!listening)return;$('viewSpeechStatus').textContent='인식 결과 확인 중…';$('viewSpeechStop').disabled=true;try{rec.stop()}catch(_){stop()}}
document.getElementById('viewList').addEventListener('click',e=>{const b=e.target.closest('[data-practice-id]');if(!b)return;const q=window.WORD_LIST.find(x=>x.id===Number(b.dataset.practiceId));if(q)open(q)});
$('viewSpeechStart').onclick=start;$('viewSpeechStop').onclick=finish;$('viewSpeechClose').onclick=close;$('viewSpeechRetry').onclick=start;$('viewSpeechListen').onclick=()=>active&&window.englishPracticeSpeak(active.en);
$('viewSpeechExpected').addEventListener('click',e=>{const b=e.target.closest('[data-play-part]');if(b)window.englishPracticeSpeak(b.dataset.playPart)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('viewSpeechModal').classList.contains('hidden'))close()});
window.englishPracticeCloseViewSpeech=close;
})();
