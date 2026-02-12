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
**예시**: "Active ranging sensors continue to be the most popular sensors in mobile robotics. Many ranging sensors have a low price point, and, most importantly, all ranging sensors provide easily interpreted outputs: direct measurements of distance from the robot to objects in its vicinity"

```
* 내용: 좌측 입력창의 텍스트

* CSS Selector: #yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > div > c-wiz > span > span > div > div.D5aOJc.vJwDU

* 샘플 HTML: <div class="D5aOJc vJwDU" jscontroller="ycXvHb" jsname="lKng5e">Active ranging sensors continue to be the most popular sensors in mobile robotics. Many ranging sensors have a low price point, and, most importantly, all ranging sensors provide easily interpreted outputs: direct measurements of distance from the robot to objects in its vicinity.</div>
```

---

### 5. 맥락 번역

**설명**: 전체 맥락의 번역 결과
**용도**: VocabularyWord.context.translation 저장
**예시**: "능동형 거리 측정 센서는 모바일 로봇 분야에서 여전히 가장 인기 있는 센서입니다. 많은 거리 측정 센서가 저렴한 가격대를 유지하고 있으며, 무엇보다 모든 센서가 해석하기 쉬운 출력값을 제공한다는 점이 중요합니다. 즉, 로봇과 주변 물체 사이의 거리를 직접 측정할 수 있습니다."

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
**예시**: [surrounding district , urrounding area, locality ...]

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
**예시**: "vəˈsinədē"

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

**시나리오**: 하나의 단어가 명사/동사 등 여러 품사로 쓰임 (예: "use")
**확인 사항**:

```
* 활성 카드 스코프 원칙:
  - document 전역이 아니라, 현재 보이는 사전 카드(root) 내부에서만 파싱
  - root 후보: .pnBFm > .utwOZb > .c11pPb 순으로 상위 컨테이너 탐색

* 품사별 구분 방법:
  - 뜻 테이블 순회 중 th.p3fwmd 발견 시 새 POS 그룹 시작
  - tbody 분리 구조 / tr 내부 헤더 구조 모두 처리
  - 새 POS 시작 시 이전 POS 그룹 flush 후 채번 다시 시작

* CSS Selector
  - POS 헤더(테이블): th.p3fwmd > div > div.WiGTJe.vweeBc
  - 뜻 텍스트: .ctwFHc (fallback: [jsname='gm7qse'], [data-term-type='tl'])
  - POS 상세 블록 헤더: .pRq29d > .WiGTJe

* 샘플 HTML:
  - <th class="p3fwmd" scope="rowgroup"><div class="Q1NlZe"><div class="WiGTJe vweeBc">명사</div></div></th>
  - <div class="pRq29d"><div class="WiGTJe">동사</div></div>
  - <div class="pRq29d"><div class="WiGTJe">명사</div></div>

* 변형 대응 기준:
  - tbody 1개 + tr 여러개: tr 단위로 th.p3fwmd 감지
  - tbody 여러개: tbody 시작점에서 th.p3fwmd 감지 후 그룹 시작
  - POS 상세(영문 정의/예문/유의어) 매칭: POS 라벨 정규화 일치 우선, 실패 시 인덱스 fallback
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

### D. 영문 정의가 여러 번호로 나뉘는 경우

> **Sprint 3 백로그**: "영문 정의가 여러 개의 번호로 나누어져 있을 경우 1개의 번호 안에 있는 뜻만 가져옴"

**시나리오**: 하나의 품사 안에서 영문 정의가 번호(1. 2. 3. ...)로 여러 개 나오는 경우.
현재 코드는 `extractSectionDetails()`에서 `.ILf88 > div[lang='en']`의 **첫 번째 매칭만** 가져옴.

**테스트 단어 예시**: "have", "run", "set" 등 정의가 많은 동사
**URL 예시**: `https://translate.google.com/?sl=en&tl=ko&text=have&op=translate`

**확인 사항**:

```
* 영문 정의 블록의 전체 컨테이너 / 개별 번호별 영문 정의:
  - 영문 정의 블록은 따로 정의되어 있지 않으며 사전 전체 판넬이 있음
  - 영문 정의 1개/예문 1개/동의어를 묶는 박스는 있음 

  예시: represent

    - 첫번째 박스 css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(3) > div.ILf88
    - 첫번째 뜻: 
      - css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(3) > div.ILf88 > div:nth-child(1)
      - html element: <div lang="en">be entitled or appointed to act or speak for (someone), especially in an official capacity.</div>
    - 두번째 박스 css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88
    - 두번째 뜻:
      - css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88 > div:nth-child(1)
      - html element: <div lang="en">constitute; amount to.</div>
    - 세번째 박스 css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(5) > div.ILf88
    - 세번째 뜻:
      - css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(5) > div.ILf88 > div:nth-child(1)
      - html element: <div lang="en">depict (a particular subject) in a picture or other work of art.</div>
    - 네번째 박스 css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(6) > div.ILf88
    - 네번째 뜻:
      - css selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(6) > div.ILf88 > div:nth-child(2)
      - html selector: <div lang="en">state or point out (something) clearly.</div>


* 각 번호별 정의에 딸린 예문:
  - 예문 1
    - 정의와 예문의 부모-자식 관계: _#yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(3) > div.ILf88
    - 개별 예문 CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(3) > div.ILf88 > div.EesCWb
    - 샘플 HTML:
    <div class="EesCWb" lang="en"><q>for purposes of litigation, an infant can and must be represented by an adult</q></div>
  - 예문 2
    - 정의와 유의어의 부모-자식 관계: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88
    - 개별 유의어 블록 CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88 > div.EesCWb
    - 샘플 HTML:
    <div class="EesCWb" lang="en"><q>this figure represents eleven percent of the company's total sales</q></div>
  - 예문 2
    - 정의와 유의어의 부모-자식 관계: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88
    - 개별 유의어 블록 CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(4) > div.ILf88 > div.EesCWb
    - 샘플 HTML:
    <div class="EesCWb" lang="en"><q>this figure represents eleven percent of the company's total sales</q></div>
  - 예문 3
    - 정의와 유의어의 부모-자식 관계: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(5) > div.ILf88
    - 개별 유의어 블록 CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(5) > div.ILf88 > div.EesCWb
    - 샘플 HTML:
    <div class="EesCWb" lang="en"><q>santos are small wooden figures representing saints</q></div>
  - 예문 4
    - 정의와 유의어의 부모-자식 관계: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(6) > div.ILf88
    - 개별 유의어 블록 CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div > div:nth-child(6) > div.ILf88 > div.EesCWb
    - 샘플 HTML:
    <div class="EesCWb" lang="en"><q>it was represented to him that she would be an unsuitable wife</q></div>
    

* 번호별 정의의 총 개수 확인 (represent 기준): 4개
```

---

### E. '모두 표시' 버튼 (Show All / Show Less)

> **Sprint 3 백로그**: "정의/예문/번역 모두 '모두 표시' 버튼을 클릭해야됨. '간략히 보기'에서는 일부 저장 값들이 누락됨 (현재는 최초의 1개 값만을 가져오고 있음)"

**시나리오**: 정의/예문/유의어가 많은 단어(예: "have")의 경우 Google Translate가 일부만 표시하고
"정의 모두 표시", "예문 모두 표시" 등의 버튼을 제공. 현재 코드는 이 버튼을 클릭하지 않아
간략히 보기 상태에서 보이는 **최초 1개 값만** 파싱됨.

**테스트 단어 예시**: "have" (정의가 많아 '모두 표시' 버튼이 나옴)
**URL 예시**: `https://translate.google.com/?sl=en&tl=ko&text=have&op=translate`

**확인 사항**:

#### E-1. 정의(뜻) 모두 표시 버튼

```
* '정의 모두 표시' / 'Show all definitions' 버튼:
  - CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(1) > div.bZPC5 > div:nth-child(1) > button > div.VfPpkd-RLmnJb
  - 버튼 텍스트 (한국어): _____________________________________
  - 버튼 텍스트 (영어 UI일 때): _____________________________________
  - 샘플 HTML:<div class="VfPpkd-RLmnJb"></div>

* 버튼 클릭 전 DOM 상태:
  - 숨겨진 정의가 DOM에 존재하지만 display:none인가? N
  - 아니면 클릭 후 새로 렌더링되는가? Y
  - 간략히 보기에서 보이는 정의 개수: 3개
  - 클릭 후 표시되는 정의 개수 (make 기준): 11개
  - 샘플 HTML (클릭 전):
    _____________________________________
  - 샘플 HTML (클릭 후):
    _____________________________________

* '간략히 보기' / 'Show less' 버튼 (모두 표시 클릭 후 나타남):
  - CSS Selector: _____________________________________
  - 샘플 HTML: _____________________________________
```

#### E-2. 예문 모두 표시 버튼

```
* '예문 모두 표시' / 'Show all examples' 버튼:
  - CSS Selector: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(2) > div.bZPC5 > div:nth-child(1) > button
  - 버튼 텍스트 (한국어): #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(2) > div.bZPC5 > div:nth-child(1) > button > span
  - 샘플 HTML: <button class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-INsAgc VfPpkd-LgbsSe-OWXEXe-dgl2Hf Rj2Mlf OLiIxf PDpWxe P62QJc LQeN7 PIEKz" jscontroller="soHxf" jsaction="click:cOuCgd; mousedown:UX7yZ; mouseup:lbsD7e; mouseenter:tfO1Yc; mouseleave:JywGue; touchstart:p6p2H; touchmove:FwuNnf; touchend:yfqBxc; touchcancel:JMtRjd; focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef;mlnRJb:fLiPzd" data-idom-class="Rj2Mlf OLiIxf PDpWxe P62QJc LQeN7 PIEKz" jsname="ix0Hvc" aria-expanded="false"><div class="VfPpkd-Jh9lGc"></div><div class="VfPpkd-J1Ukfc-LhBDec"></div><div class="VfPpkd-RLmnJb"></div><span jsname="V67aGc" class="VfPpkd-vQzf8d">예문 4개 모두 표시</span></button>

* 버튼 클릭 전후 DOM 변화:
  - 간략히 보기에서 보이는 예문 개수: 1개
  - 클릭 후 표시되는 예문 개수: 4개
  - 숨겨진 예문이 DOM에 존재하지만 display:none인가? N
  - 아니면 클릭 후 새로 렌더링되는가? Y

  - 하나만 표시될 때: #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div:nth-child(2) > div.inJTWc > div.y2fI6d > div.lc69I

  - 모두 표시될 때: 
    - #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div.q8icfe.sMVRZe > div.inJTWc > div.y2fI6d > div.lc69I
    - #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div.q8icfe.sMVRZe > div.inJTWc > div:nth-child(3) > div > div.lc69I
    - #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div.q8icfe.sMVRZe > div.inJTWc > div:nth-child(4) > div > div.lc69I
    - #yDmH0d > c-wiz > div > div.kmXzdf > c-wiz > div.c11pPb > c-wiz > div > div.utwOZb > div.W50gQb > div.pnBFm > div.q8icfe.sMVRZe > div.inJTWc > div:nth-child(5) > div > div.lc69I
```

#### E-3. 한국어 뜻(번역) 모두 표시 버튼

```
* '번역 모두 표시' / 'Show all translations' 버튼:
  - CSS Selector: #ow27 > div.bZPC5 > div:nth-child(1) > button > div.VfPpkd-RLmnJb
  - 버튼 텍스트 (한국어): 번역 50개 모두 표시
  - 샘플 HTML: <div class="VfPpkd-RLmnJb"></div>

* 버튼 클릭 전후 DOM 변화:
  - 간략히 보기에서 보이는 뜻 개수: 12개
  - 클릭 후 표시되는 뜻 개수: 50개
  - 숨겨진 뜻이 DOM에 존재하지만 display:none인가? N
  - 아니면 클릭 후 새로 렌더링되는가? Y
```

#### E-4. 공통 패턴

```
* '모두 표시' 버튼들이 공통 클래스/구조를 공유하는가? _____
  - 공통 CSS Selector (있다면): _____________________________________
  - 구분 방법 (정의/예문/번역 각각): _____________________________________

* 프로그래밍적으로 클릭하면 정상 작동하는가?
  - button.click() 호출 시 DOM이 정상 업데이트되는가? Y
  - 클릭 후 DOM 업데이트까지 대기 시간 필요한가? 500ms 이내
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
