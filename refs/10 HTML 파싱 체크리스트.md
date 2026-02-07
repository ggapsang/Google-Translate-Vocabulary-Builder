## 필수 파싱 항목 (Priority 1)

### 1. 사전 조회 단어

**설명**: 사용자가 사전 보기로 검색한 단어
**용도**: VocabularyWord.word 저장
**예시**: "vicinity."

```
* 내용: 우측 사이드바의 텍스트

* CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.bhvHjb > div > div.m2ySsc

* 샘플 HTML: <div class="m2ySsc"><span lang="en">vicinity</span><div aria-hidden="true" class="Mplckd">vəˈsinədē</div></div>
```

---

### 2. 뜻 리스트 (정의)

**설명**: 사전에서 제공하는 여러 개의 뜻
**용도**: VocabularyWord.definitions[].meaning 저장

**예시**: ["부근", 근처", "인근", "근접"]

```
* 내용: 우측 사이드바의 하단

* CSS Selector: #ow42 > div > table > tbody
  뜻이 여러 개인 경우
  - #ow42 > div > table > tbody > tr:nth-child(1) > th.XGqHue.j8IEGb > div
  - #ow42 > div > table > tbody > tr:nth-child(2) > th > div
  - #ow42 > div > table > tbody > tr:nth-child(3) > th > div
  - #ow42 > div > table > tbody > tr:nth-child(4) > th > div  

* 샘플 HTML: 
  - <div class="EXDvhb" jsname="mnCBDf" role="presentation" lang="ko"><span class="q7tNoe"></span> <span class="ctwFHc" jsname="gm7qse" data-term-type="tl" role="button" tabindex="0" jsaction="blur:Om5fgd; click:JUJgG; focus:kFg5W; mouseout:Om5fgd; mouseover:kFg5W;t6aFMc:LOG0D;mrHAK:RzCLcc" data-sl="ko" data-tl="en">부근</span></div>
  - <div class="EXDvhb" jsname="mnCBDf" role="presentation" lang="ko"><span class="q7tNoe"></span> <span class="ctwFHc" jsname="gm7qse" data-term-type="tl" role="button" tabindex="0" jsaction="blur:Om5fgd; click:JUJgG; focus:kFg5W; mouseout:Om5fgd; mouseover:kFg5W;t6aFMc:LOG0D;mrHAK:RzCLcc" data-sl="ko" data-tl="en">근처</span></div>
  - <div class="EXDvhb" jsname="mnCBDf" role="presentation" lang="ko"><span class="q7tNoe"></span> <span class="ctwFHc" jsname="gm7qse" data-term-type="tl" role="button" tabindex="0" jsaction="blur:Om5fgd; click:JUJgG; focus:kFg5W; mouseout:Om5fgd; mouseover:kFg5W;t6aFMc:LOG0D;mrHAK:RzCLcc" data-sl="ko" data-tl="en">인근</span></div>
  - <div class="EXDvhb" jsname="mnCBDf" role="presentation" lang="ko"><span class="q7tNoe"></span> <span class="ctwFHc" jsname="gm7qse" data-term-type="tl" role="button" tabindex="0" jsaction="blur:Om5fgd; click:JUJgG; focus:kFg5W; mouseout:Om5fgd; mouseover:kFg5W;t6aFMc:LOG0D;mrHAK:RzCLcc" data-sl="ko" data-tl="en">근접</span></div>  
```

---
### 3. 품사 정보

**설명**: 명사, 동사, 형용사 등
**용도**: VocabularyWord.definitions[].partOfSpeech 저장
**예시**: "명사"
```
* 내용: 우측 사이드바 하단
* CSS Selector: #ow47 > div > table > tbody > tr:nth-child(1) > th.p3fwmd > div > div
* 샘플 HTML: <div class="WiGTJe vweeBc">명사</div>
```

---

### 4. 전체 맥락 (번역 요청한 전체 문장)

**설명**: 사용자가 번역 요청한 원래 문장 (단어가 포함된 전체 문맥)
**용도**: VocabularyWord.context.original 저장
**예시**: "Hello, how are you?" (단어 "hello" 검색 시)

```
* 내용: 좌측 입력창의 텍스트

* CSS Selector: #yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > div > c-wiz > span > span > div > textarea

* 샘플 HTML: <textarea aria-autocomplete="list" aria-expanded="false" aria-controls="kvLWu" class="er8xn" jsname="BJE2fc" jslog="176025; track:click,input,paste;" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" rows="1" spellcheck="false" aria-label="원본 텍스트" jsaction="blur:TP1Wfd; click:R8nDBd; focus:HCeAxb; input:r9XDpf,Gyn8rd; keydown:O0Dsab,RHer4; select:BR6jm,RHer4; paste:puy29d" placeholder="" style="height: 288px;">A number of factors affect the performance of a localization sensor that makes use of the GPS. First, it is important to understand that, because of the specific orbital paths of the GPS satellites, coverage is not geometrically identical in different portions of the Earth and therefore resolution is not uniform.</textarea>

* 참고: 단어만 검색한 경우 word와 동일할 수 있음
```

---

### 5. 맥락 번역

**설명**: 전체 맥락의 번역 결과
**용도**: VocabularyWord.context.translation 저장
**예시**: "안녕하세요, 어떻게 지내세요?"

```
* 내용: 좌측에서 두번째 패널널
  
* CSS Selector: #yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > c-wiz > div > div.usGWQd > div > div.lRu31 > span.HwtZe

* 샘플 HTML: <span class="HwtZe" jsname="jqKxS" jsaction="mouseup:Sxi9L,BR6jm; mousedown:qjlr0e" lang="ko"><span jsname="txFAF" class="jCAhz ChMk0b" jsaction="agoMJf:PFBcW;MZfLnc:P7O7bd;nt4Alf:pvnm0e,pfE8Hb,PFBcW;B01qod:dJXsye;H1e5u:iXtTIf;lYIUJf:hij5Wb;tSpjdb:qAKMYb" jscontroller="BiTO4b"><span class="ryNqvb" jsname="W297wb" jsaction="click:PDNqTc,GFf3ac,qlVvte;contextmenu:Nqw7Te,QP7LD; mouseout:Nqw7Te; mouseover:PDNqTc,c2aHje">능동형 거리 측정 센서는 모바일 로봇 분야에서 여전히 가장 인기 있는 센서입니다.</span><div class="NWlwsb" jsname="HyaQwf" dir="ltr" style=""><div jsname="pRuUCc" class="WtlSJf KKjvXb" data-alternative-index="0" jsaction="click:qAKMYb,E2s7Af,o9Z1wb"><div class="lizc5d"><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class=" NMm5M"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></div><div class="Z5VkA"><div class="lrSgmd" dir="ltr"><span class="jzUr5c" jsname="FteS1d" lang="ko">능동형 거리 측정 센서는 모바일 로봇 분야에서 여전히 가장 인기 있는 센서입니다.</span></div><div class="W5CUef" jsname="gLFymd" dir="ltr" lang="en">Active distance measurement sensors remain the most popular sensors in mobile robotics.</div></div></div><div jsname="pRuUCc" class="WtlSJf Qbfsob" data-alternative-index="1" jsaction="click:qAKMYb,E2s7Af,o9Z1wb"><div class="lizc5d"><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class=" NMm5M"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></div><div class="Z5VkA"><div class="lrSgmd" dir="ltr"><span class="jzUr5c" jsname="FteS1d" lang="ko">능동형 거리 측정 센서는 모바일 로봇 공학에서 여전히 가장 인기 있는 센서입니다.</span></div><div class="W5CUef" jsname="gLFymd" dir="ltr" lang="en">Active distance measurement sensors remain the most popular sensors in mobile robotics.</div></div></div><div class="xss4Ef"><div class="eDXd3b">능동형 거리 측정 센서는 모바일 로봇 분야에서 여전히 가장 인기 있는 센서입니다.</div><div><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class="I0OIB NMm5M"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg></div><div class="wUAEb"><div class="eGol3e">다른 번역을 로드할 수 없습니다.</div><div class="lG3kVd"><span class="SiAJed" jsname="ulAhqc" jsaction="click:i6F3te,FLosjf,PDNqTc">다시 시도</span></div></div></div><div class="FWYOhf"><div class="eDXd3b">능동형 거리 측정 센서는 모바일 로봇 분야에서 여전히 가장 인기 있는 센서입니다.</div><div jsname="oajeie" class="cUd8i pahJge"></div><div jsname="oajeie" class="cUd8i Yv4bk pahJge"></div></div></div></span> <span jsname="txFAF" class="jCAhz ChMk0b" jsaction="agoMJf:PFBcW;MZfLnc:P7O7bd;nt4Alf:pvnm0e,pfE8Hb,PFBcW;B01qod:dJXsye;H1e5u:iXtTIf;lYIUJf:hij5Wb;tSpjdb:qAKMYb" jscontroller="BiTO4b"><span class="ryNqvb" jsname="W297wb" jsaction="click:PDNqTc,GFf3ac,qlVvte;contextmenu:Nqw7Te,QP7LD; mouseout:Nqw7Te; mouseover:PDNqTc,c2aHje">많은 거리 측정 센서가 저렴한 가격대를 유지하고 있으며, 무엇보다 모든 센서가 해석하기 쉬운 출력값을 제공한다는 점이 중요합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정할 수 있습니다.</span><div class="NWlwsb" jsname="HyaQwf" dir="ltr" style=""><div jsname="pRuUCc" class="WtlSJf KKjvXb" data-alternative-index="0" jsaction="click:qAKMYb,E2s7Af,o9Z1wb"><div class="lizc5d"><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class=" NMm5M"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></div><div class="Z5VkA"><div class="lrSgmd" dir="ltr"><span class="jzUr5c" jsname="FteS1d" lang="ko">많은 거리 측정 센서가 저렴한 가격대를 유지하고 있으며, 무엇보다 모든 센서가 해석하기 쉬운 출력값을 제공한다는 점이 중요합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정할 수 있습니다.</span></div><div class="W5CUef" jsname="gLFymd" dir="ltr" lang="en">Many distance measurement sensors are affordable, and most importantly, they all provide easy-to-interpret outputs, allowing you to directly measure the distance between your robot and surrounding objects.</div></div></div><div jsname="pRuUCc" class="WtlSJf Qbfsob" data-alternative-index="1" jsaction="click:qAKMYb,E2s7Af,o9Z1wb"><div class="lizc5d"><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class=" NMm5M"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></div><div class="Z5VkA"><div class="lrSgmd" dir="ltr"><span class="jzUr5c" jsname="FteS1d" lang="ko">많은 거리 측정 센서는 가격이 저렴하며, 무엇보다 모든 거리 측정 센서는 해석하기 쉬운 출력값을 제공합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정하여 제공합니다.</span></div><div class="W5CUef" jsname="gLFymd" dir="ltr" lang="en">Many distance measurement sensors are inexpensive, and best of all, they provide easy-to-interpret outputs: they directly measure the distance between the robot and surrounding objects.</div></div></div><div class="xss4Ef"><div class="eDXd3b">많은 거리 측정 센서가 저렴한 가격대를 유지하고 있으며, 무엇보다 모든 센서가 해석하기 쉬운 출력값을 제공한다는 점이 중요합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정할 수 있습니다.</div><div><svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class="I0OIB NMm5M"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg></div><div class="wUAEb"><div class="eGol3e">다른 번역을 로드할 수 없습니다.</div><div class="lG3kVd"><span class="SiAJed" jsname="ulAhqc" jsaction="click:i6F3te,FLosjf,PDNqTc">다시 시도</span></div></div></div><div class="FWYOhf"><div class="eDXd3b">많은 거리 측정 센서가 저렴한 가격대를 유지하고 있으며, 무엇보다 모든 센서가 해석하기 쉬운 출력값을 제공한다는 점이 중요합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정할 수 있습니다.</div><div jsname="oajeie" class="cUd8i pahJge"></div><div jsname="oajeie" class="cUd8i Yv4bk pahJge"></div></div></div></span></span>
```

---

## 중요 파싱 항목 (Priority 2)

### 6. 유의어 (Synonyms)

**설명**: 비슷한 뜻의 다른 단어들
**용도**: VocabularyWord.definitions[].synonyms 저장
**예시**: ["hi", "hey", "greetings"]

```
* 내용: 오른쪽 사이드바 중간
* CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div.AVg9bf > div.ILf88 > span:nth-child(4)
* 샘플 HTML: <span class="KorTjc"><ul class="PwrFgb"><li class="e7Qsd" key="0"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surrounding district </span></li><li class="e7Qsd" key="1"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surrounding area </span></li><li class="e7Qsd" key="2"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">neighborhood </span></li><li class="e7Qsd" key="3"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">locality </span></li><li class="e7Qsd" key="4"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">locale </span></li><li class="e7Qsd" key="5"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">local area </span></li><li class="e7Qsd" key="6"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">area </span></li><li class="e7Qsd" key="7"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">district </span></li><li class="e7Qsd" key="8"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">region </span></li><li class="e7Qsd" key="9"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">quarter </span></li><li class="e7Qsd" key="10"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">sector </span></li><li class="e7Qsd" key="11"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">territory </span></li><li class="e7Qsd" key="12"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">domain </span></li><li class="e7Qsd" key="13"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">place </span></li><li class="e7Qsd" key="14"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">zone </span></li><li class="e7Qsd" key="15"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">environs </span></li><li class="e7Qsd" key="16"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surroundings </span></li><li class="e7Qsd" key="17"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surrounds </span></li><li class="e7Qsd" key="18"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">precincts </span></li><li class="e7Qsd" key="19"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">purlieus </span></li></ul></span>

* 개별 유의어 추출 방법: 
  - <li class="e7Qsd" key="0"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surrounding district </span></li>
  - <li class="e7Qsd" key="1"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">surrounding area </span></li>
  - <li class="e7Qsd" key="2"><span class="wQegqc" jsaction="JUJgG" jsname="UfD2Hd" role="button" tabindex="0" data-sl="en" lang="en">neighborhood </span></li>

<li class>의 key값이 0번부터 하여 하나씩 채번됨  
```

---

### 8. 영문 정의 (English Definition)

**설명**: 영어로 된 단어 설명
**용도**: VocabularyWord.definitions[].englishDefinition 저장
**예시**: "the area near or surrounding a particular place."

```
* 내용: 우측 사이드바상단

* CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div.AVg9bf > div.ILf88 > div:nth-child(1)
  
* 샘플 HTML: <div lang="en">the area near or surrounding a particular place.</div>
```

---

### 8. 예문 (원문)

**설명**: 사전에서 제공하는 예문의 원문
**용도**: VocabularyWord.definitions[].examples[].original 저장
**예시**: "the number of people living in the immediate vicinity was small"

```
* 내용: 오른쪽 사이드바 상단 중간
  
* CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div.AVg9bf > div.ILf88 > div.EesCWb
  
* 샘플 HTML: <div class="EesCWb" lang="en"><q>the number of people living in the immediate vicinity was small</q></div>
```

---


## 선택 파싱 항목 (Priority 3)

### 9. 발음 기호

**설명**: 음성 기호 또는 발음 표기
**용도**: VocabularyWord.pronunciation 저장
**예시**: "/həˈloʊ/", "헬로우"

```
* 내용: 오른쪽 사이드바 상단 중간
* CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.bhvHjb > div > div.m2ySsc > div
* 샘플 HTML: <div aria-hidden="true" class="Mplckd">vəˈsinədē</div>
```

---

### 10. 언어 코드 (원문)

**설명**: 원문의 언어 코드
**용도**: VocabularyWord.sourceLanguage 저장
**예시**: "en" (영어)

```
* 내용: 왼쪽 상단 탭
* CSS Selector or URL 파라미터: #yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div:nth-child(1) > c-wiz > div.zXU7Rb > c-wiz > div.ooArgc.Uw5XA
* 샘플 값: <div jsname="k0o5Tb" class="ooArgc Uw5XA" role="button" jsaction="D8nsr" tabindex="0">영어</div>
```

---

### 11. 언어 코드 (번역)

**설명**: 번역문의 언어 코드
**용도**: VocabularyWord.targetLanguage 저장
**예시**: "ko" (한국어)

```
* 내용: 중간 상단 탭
* CSS Selector or URL 파라미터: #yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div:nth-child(1) > c-wiz > div.zXU7Rb > c-wiz > div.ooArgc.o9YeG
* 샘플 값: <div jsname="SDXlTc" class="ooArgc o9YeG" role="button" jsaction="a9yn8b" tabindex="0">한국어</div>
```

---

## 특수 케이스 확인 항목

### A. 사전 정보 없는 경우

**시나리오**: 문장을 선택할 경우(예: "robot to objects in its vicinity.") 사전 열기에는 아래와 같이 나옴 (세부 정보 없음음)

**확인 사항**:

```
* 사전 패널 존재 여부: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.TvSze > div.pwKYW
* 대체 UI: _____________________________________
* 샘플 HTML: <div class="pwKYW"><div class="iN79vf" lang="en" dir="ltr"><span class="nMhadf">robot to objects in its vicinity</span><span class="ZFGaCd"></span></div>에 관한 세부정보 없음</div>
```

---

### B. 여러 품사가 있는 경우

**시나리오**: 하나의 단어가 명사/동사 등 여러 품사로 쓰임 (예: "run")
**확인 사항**:

```
* 품사별 구분 방법: _____________________________________
* 각 품사별 뜻 그룹핑: _____________________________________
* 샘플 HTML: _____________________________________
```

---

### C. 여러 뜻이 있는 경우

**시나리오**: 동음이의어 (예: "bank" - 은행/강둑)
**확인 사항**:

```
* 뜻 리스트 전체 선택: _____________________________________
* 개별 뜻 순서 유지: _____________________________________
* 샘플 HTML: _____________________________________
```

---

## 테스트 케이스별 체크리스트

### 케이스 1: 단순 단어 (사전 정보 풍부)
**테스트 단어**: "hello"
**URL**: `https://translate.google.com/?sl=en&tl=ko&text=hello&op=translate`

**체크**:
- [ ] 검색 단어 파싱됨
- [ ] 번역 결과 파싱됨
- [ ] 품사 정보 파싱됨
- [ ] 뜻 리스트 파싱됨
- [ ] 유의어 파싱됨
- [ ] 영문 정의 파싱됨
- [ ] 예문 파싱됨

---

### 케이스 2: 동사 (활용형)
**테스트 단어**: "run"
**URL**: `https://translate.google.com/?sl=en&tl=ko&text=run&op=translate`

**체크**:
- [ ] 여러 품사 (동사/명사) 구분됨
- [ ] 각 품사별 뜻 그룹핑됨
- [ ] 동사 활용형 정보 (있다면)

---

### 케이스 3: 문장 (사전 정보 없음)
**테스트 문장**: "How are you?"
**URL**: `https://translate.google.com/?sl=en&tl=ko&text=How%20are%20you&op=translate`

**체크**:
- [ ] 원문 파싱됨
- [ ] 번역문 파싱됨
- [ ] 사전 패널 없음 확인
- [ ] 예외 처리 가능

---

### 케이스 4: 동음이의어
**테스트 단어**: "bank"
**URL**: `https://translate.google.com/?sl=en&tl=ko&text=bank&op=translate`

**체크**:
- [ ] 여러 뜻 (은행/강둑) 모두 파싱됨
- [ ] 뜻 순서 유지됨
- [ ] 각 뜻별 예문 구분됨

---

### 케이스 5: 형용사 (유의어 많음)
**테스트 단어**: "beautiful"
**URL**: `https://translate.google.com/?sl=en&tl=ko&text=beautiful&op=translate`

**체크**:
- [ ] 유의어 리스트 파싱됨
- [ ] 여러 뜻 파싱됨
- [ ] 영문 정의 파싱됨

---

## 작업 순서 가이드

### Step 1: 필수 항목 (1-6번) 먼저 파싱
가장 중요! 이것만 있어도 기본 기능 동작

### Step 2: 중요 항목 (7-10번) 추가
학습 기능에 필수

### Step 3: 선택 항목 (11-13번) 보완
있으면 좋음

### Step 4: 특수 케이스 (A-C) 처리
예외 상황 대비

---

## 작성 예시

이렇게 채워주세요:

```
### 1. 검색 단어 (원문)
* 내용: 상단 좌측 입력창의 텍스트
* CSS Selector: textarea.er8xn:nth-of-type(1)
* 샘플 HTML: <textarea class="er8xn" aria-label="원문">hello</textarea>
```

---

## 추가로 확인할 사항

### DOM 로딩 타이밍

```
* 페이지 로드 후 사전 패널 렌더링까지 대기 시간: _____ms
* MutationObserver 필요 여부: _____
* 권장 대기 방법: _____
```

### 클래스명 안정성

```
* 클래스명이 난독화되어 있는가: _____
* 구조적 선택자 사용 가능한가: _____
* 대체 선택자 (data 속성 등): _____
```

---

## 완료 조건

모든 항목에 대해:
- [ ] CSS Selector 작성됨
- [ ] 샘플 HTML 제공됨
- [ ] 5개 테스트 케이스 모두 검증됨
- [ ] 특수 케이스 처리 방법 확인됨