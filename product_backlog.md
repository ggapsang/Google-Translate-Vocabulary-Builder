## Product Backlog

> 이 문서는 PM인 Human이 직접 수정함. Agent 수정 금지. 조회만 가능
> (PM) 이라고 되어 있는 체크리스트는 Agent가 수행하지 않음
---
### Sprint 2
- [ ] 사용자가 드래그 했을 때 사전 패널 외에도 드래그한 마우스 지점에 저장 버튼이 표시됨(호버와 비슷하게)  
- [ ] 단어 삭제 후 새로고침을 하지 않으면 Saved 버튼이 변경되지 않는 문제 수정
- [x] assets에 icon 개선

---
### Next Up
#### UI 개선
- [ ] (PM) 🗑️ 클릭 시 `"word" 삭제?` + 삭제/취소 버튼 표시 -> `Delete "word"?`
- [ ] (PM) 🗑️ -> 구글 메터리얼 아이콘으로 변경
- [ ] 저장 버튼 패널 디자인 개선 필요

#### 프로그램 성능 개선
- [ ] 정의/예문/번역 모두 '모두 표시' 버튼을 클릭해야됨 '간략히 보기'에서는 일부 저장 값들이 누락됨 (현재는 최초의 1개 값만을 가져오고 있음)
- [ ] (PM) 영문 뜻만 나오는 단어(한글 뜻이 나오지 않음)의 경우 어떻게 크롤링 되는지 테스트하고 해당 테스트 결과에 따라 문제 발생시 수정(수정 내용은 별도 리스트로 작성)
      예문 : The principle of optical triangulation in 1D is straightforward, as depicted in figure 4.13. A collimated beam (e.g., focused infrared LED, laser beam) is transmitted toward the target.
      번역 : 1차원 광학 삼각측량의 원리는 그림 4.13에 나타낸 바와 같이 간단합니다.
      단어 : collimated (collimate)
---
### Completed Sprints (Sorted Descending)
#### Sprint 1
- [x] **UI 개선:** 필터 드롭다운에서 한번 클릭시 필터 적용(예 품사에서 명사). 해당 부분을(명사)를 한번더 클릭시 필터 해제되도록 기능 수정. 현재는 '전체'를 눌러야만 필터가 해제됨
- [x] **기능 수정:** 품사 필터에서 중복 필터링이 가능하도록 개선(동사와 명사를 동시에 선택)
- [x] **버그 수정:** use 와 같이 명사와 동사가 동시에 있는 경우
    - 맨 앞에 명사-> 목록으로 표기됨
    - 중간에 뜻 리스트에서도 명사와 동사가 구분되지 않고 배열이 나오며 순번이 채번됨
    1. 선작업 : html_parsing_checklist에 예외 사항 명기

