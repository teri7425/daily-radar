/* 《유창한 영어회화를 꼭 원하는 분 1》 — ① 공식 대입 데이터
   107개 장 가운데 parts.js 에 이미 F가 들어 있는 PART 1의 13개 장을 뺀
   나머지 94개 장의 공식 데이터입니다. (로컬 전용 · 외부 요청 없음)

   aux  : 공식 축. 문자열 id 는 app.js 의 AUX_META 를, {id,label,tense} 는 장마다 직접 쓴 축을 씁니다.
   sets : 동사구 한 벌
     ko   우리말 동사구            v    영어 동사구 (be동사 장은 보어)
     past 과거형                   pp   p.p (완료·수동)      ing  -ing (진행)
     wh   의문사                   hw   의문사 뒤에 붙는 말(What + time)
     mid  문장 중앙 부사           ans  의문사에 답하는 정보   say  의문사의 모범 답변
     subj/asub/agr  주어·답의 주어·수(단수 sg / 복수 pl)
     only 이 공식에서만 쓰는 동사구  be  보어 여부
     flip 답할 때 your↔my, me↔you 로 바꿔야 하는 동사구
     yes/no/forms  장에서 직접 쓴 문장
*/
window.FE_FORMULAS = {
 "p1c1": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "have"
  ],
  "sets": [
   {
    "ko": "비행기로 미국에 가다",
    "v": "go to America by plane",
    "past": "went to America by plane",
    "pp": "gone to America by plane"
   },
   {
    "ko": "오늘 그를 만나다",
    "v": "see him today",
    "past": "saw him today",
    "pp": "seen him today"
   },
   {
    "ko": "전화로 그에게 연락하다",
    "v": "contact him by phone",
    "past": "contacted him by phone",
    "pp": "contacted him by phone"
   },
   {
    "ko": "10년째 영어를 배우다",
    "v": "learn English for 10 years",
    "past": "learned English for 10 years",
    "pp": "learned English for 10 years"
   },
   {
    "ko": "정각에 여기 도착하다",
    "v": "arrive here on time",
    "past": "arrived here on time",
    "pp": "arrived here on time"
   }
  ],
  "note": "문장 구조(1~5형식) 그대로 [ ] you …? 틀에 넣어 봅니다."
 },
 "p1c5": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wantto",
   "haveto",
   "usedto",
   "intendto"
  ],
  "sets": [
   {
    "ko": "예약을 하다",
    "v": "make reservations",
    "past": "made reservations",
    "pp": "made reservations"
   },
   {
    "ko": "직업을 얻다",
    "v": "take a job",
    "past": "took a job",
    "pp": "taken a job"
   },
   {
    "ko": "가족을 부양하다",
    "v": "support a family",
    "past": "supported a family",
    "pp": "supported a family"
   },
   {
    "ko": "예약을 취소하다",
    "v": "cancel the reservation",
    "past": "canceled the reservation",
    "pp": "canceled the reservation"
   },
   {
    "ko": "돈을 낭비하다",
    "v": "waste money",
    "past": "wasted money",
    "pp": "wasted money"
   }
  ],
  "note": "1부 중간 테스트의 문장을 조동사만 바꿔 전부 말해 봅니다."
 },
 "p1c7": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wantto",
   "haveto",
   "intendto",
   "usedto"
  ],
  "sets": [
   {
    "ko": "우체국에서 소포를 찾다",
    "v": "pick up a parcel at the post office",
    "past": "picked up a parcel at the post office",
    "pp": "picked up a parcel at the post office"
   },
   {
    "ko": "길에서 옛 친구를 만나다",
    "v": "run into an old friend on the street",
    "past": "ran into an old friend on the street",
    "pp": "run into an old friend on the street"
   },
   {
    "ko": "한국에서 도망가다",
    "v": "run away from Korea",
    "past": "ran away from Korea",
    "pp": "run away from Korea"
   },
   {
    "ko": "변명을 하다",
    "v": "make an excuse",
    "past": "made an excuse",
    "pp": "made an excuse"
   },
   {
    "ko": "요청을 하다",
    "v": "make a request",
    "past": "made a request",
    "pp": "made a request"
   }
  ],
  "note": "PICK / RUN 의 여러 뜻을 같은 공식에 넣어 봅니다."
 },
 "p1c14": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wantto",
   "haveto",
   "usedto",
   "planto"
  ],
  "sets": [
   {
    "ko": "보증인이 있다",
    "v": "have a sponsor",
    "past": "had a sponsor",
    "pp": "had a sponsor"
   },
   {
    "ko": "직장을 그만두다",
    "v": "quit the job",
    "past": "quit the job",
    "pp": "quit the job"
   },
   {
    "ko": "일본을 방문하다",
    "v": "visit Japan",
    "past": "visited Japan",
    "pp": "visited Japan"
   },
   {
    "ko": "돈을 모으다",
    "v": "save money",
    "past": "saved money",
    "pp": "saved money"
   },
   {
    "ko": "잠깐 쉬다",
    "v": "take a break",
    "past": "took a break",
    "pp": "taken a break"
   }
  ],
  "note": "1부 공식정리에 나온 동사구를 한자리에서 돌려 말합니다."
 },
 "p1c18": {
  "aux": [
   "prog",
   "progpast",
   "progwill"
  ],
  "sets": [
   {
    "ko": "여기서 일하다",
    "v": "work here",
    "past": "worked here",
    "pp": "worked here",
    "ing": "working here"
   },
   {
    "ko": "직업을 찾다",
    "v": "look for a job",
    "past": "looked for a job",
    "pp": "looked for a job",
    "ing": "looking for a job"
   },
   {
    "ko": "파티를 준비하다",
    "v": "prepare for a party",
    "past": "prepared for a party",
    "pp": "prepared for a party",
    "ing": "preparing for a party"
   },
   {
    "ko": "농담하다",
    "v": "kid",
    "past": "kidded",
    "pp": "kidded",
    "ing": "kidding"
   },
   {
    "ko": "그를 기다리다",
    "v": "wait for him",
    "past": "waited for him",
    "pp": "waited for him",
    "ing": "waiting for him"
   }
  ],
  "note": "be + -ing 진행 문장을 현재·과거·미래로 바꿔 말합니다."
 },
 "p1c19": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "몇 시에 떠나다",
    "v": "leave",
    "past": "left",
    "pp": "left",
    "wh": "What time",
    "ans": "at eight"
   },
   {
    "ko": "손님을 어디서 만나다",
    "v": "meet the guest",
    "past": "met the guest",
    "pp": "met the guest",
    "wh": "Where",
    "ans": "at the office"
   },
   {
    "ko": "무슨 일을 하다",
    "v": "do",
    "past": "did",
    "pp": "done",
    "wh": "What",
    "say": "I'm an office worker.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "비용이 얼마 들다",
    "v": "cost",
    "past": "costed",
    "pp": "costed",
    "wh": "How much",
    "ans": "ten dollars",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "몇 시에 점심을 먹다",
    "v": "have lunch",
    "past": "had lunch",
    "pp": "had lunch",
    "wh": "When",
    "ans": "at noon"
   }
  ],
  "note": "의문사마다 답까지 한 벌로 — 1부 종합시험 문장으로 확인합니다."
 },
 "p2c1": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "몇 시에 일어나다",
    "v": "get up",
    "past": "got up",
    "pp": "got up",
    "wh": "What time",
    "ans": "at six"
   },
   {
    "ko": "어디서 점심을 먹다",
    "v": "have lunch",
    "past": "had lunch",
    "pp": "had lunch",
    "wh": "Where",
    "ans": "at the cafeteria"
   },
   {
    "ko": "언제 저녁을 먹다",
    "v": "have dinner",
    "past": "had dinner",
    "pp": "had dinner",
    "wh": "When",
    "ans": "at seven"
   },
   {
    "ko": "얼마나 머무르다",
    "v": "stay",
    "past": "stayed",
    "pp": "stayed",
    "wh": "How long",
    "ans": "for a week"
   },
   {
    "ko": "얼마나 자주 영화를 보다",
    "v": "see a movie",
    "past": "saw a movie",
    "pp": "seen a movie",
    "wh": "How often",
    "ans": "once a month"
   }
  ],
  "note": "의문사 + [ ] you …? — 의문사만 바꿔 같은 동사구로 묻습니다."
 },
 "p2c2": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "haveto",
   "prog"
  ],
  "sets": [
   {
    "ko": "하루에 몇 시간 일하다",
    "v": "work",
    "past": "worked",
    "pp": "worked",
    "wh": "How many hours a day",
    "ans": "eight hours",
    "only": [
     "do",
     "did",
     "will",
     "can",
     "haveto"
    ]
   },
   {
    "ko": "얼마나 자주 그를 방문하다",
    "v": "visit him",
    "past": "visited him",
    "pp": "visited him",
    "wh": "How often",
    "ans": "once a week",
    "only": [
     "do",
     "did",
     "will",
     "can",
     "haveto"
    ]
   },
   {
    "ko": "무엇을 생각하다",
    "v": "think about",
    "past": "thought about",
    "pp": "thought about",
    "ing": "thinking about",
    "wh": "What",
    "ans": "my work"
   },
   {
    "ko": "누구를 기다리다",
    "v": "wait for",
    "past": "waited for",
    "pp": "waited for",
    "ing": "waiting for",
    "wh": "Who",
    "ans": "my friend"
   },
   {
    "ko": "무슨 요일에 교회에 가다",
    "v": "go to church",
    "past": "went to church",
    "pp": "gone to church",
    "wh": "What day",
    "ans": "on Sunday",
    "only": [
     "do",
     "did",
     "will",
     "can",
     "haveto"
    ]
   }
  ],
  "note": "2부 중간 테스트 — 의문사가 붙은 문장을 통째로 연습합니다."
 },
 "p2c3": {
  "aux": [
   "would",
   "can",
   "will",
   "could"
  ],
  "sets": [
   {
    "ko": "다시 한 번 말하다",
    "v": "say it again",
    "past": "said it again",
    "pp": "said it again"
   },
   {
    "ko": "천천히 말하다",
    "v": "speak slowly",
    "past": "spoke slowly",
    "pp": "spoken slowly"
   },
   {
    "ko": "영어로 설명하다",
    "v": "explain it in English",
    "past": "explained it in English",
    "pp": "explained it in English"
   },
   {
    "ko": "이름의 철자를 말하다",
    "v": "spell the name",
    "past": "spelled the name",
    "pp": "spelled the name"
   },
   {
    "ko": "더 쉬운 말로 말하다",
    "v": "say it in easier words",
    "past": "said it in easier words",
    "pp": "said it in easier words"
   }
  ],
  "note": "수업·대화 중에 쓰는 요청 표현 — 조동사만 바꿔 말합니다."
 },
 "p2c4": {
  "aux": [
   "be",
   "bep",
   "havebe"
  ],
  "sets": [
   {
    "ko": "어떻게 지내다",
    "v": "",
    "wh": "How",
    "ans": "fine"
   },
   {
    "ko": "어머니가 안녕하시다",
    "v": "",
    "wh": "How",
    "ans": "fine",
    "subj": "your mother",
    "asub": "she"
   },
   {
    "ko": "오늘 하루가 어떠하다",
    "v": "",
    "wh": "How",
    "ans": "busy",
    "subj": "your day",
    "asub": "it"
   },
   {
    "ko": "오늘 날씨가 어떠하다",
    "v": "",
    "wh": "How",
    "ans": "nice",
    "subj": "the weather",
    "asub": "it"
   },
   {
    "ko": "식욕이 어떠하다",
    "v": "",
    "wh": "How",
    "ans": "good",
    "subj": "your appetite",
    "asub": "it"
   }
  ],
  "note": "HOW + be동사 — 「어떠냐」를 묻고 「나는 ~하다」로 답합니다."
 },
 "p2c5": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "얼마나 멀다",
    "v": "",
    "wh": "How",
    "hw": "far",
    "ans": "ten minutes from here",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "얼마나 크다",
    "v": "",
    "wh": "How",
    "hw": "big",
    "ans": "very big",
    "subj": "your house",
    "asub": "it"
   },
   {
    "ko": "얼마나 키가 크다",
    "v": "",
    "wh": "How",
    "hw": "tall",
    "ans": "about 180 centimeters",
    "subj": "he",
    "asub": "he"
   },
   {
    "ko": "얼마나 무겁다",
    "v": "",
    "wh": "How",
    "hw": "heavy",
    "ans": "about ten kilos",
    "subj": "the box",
    "asub": "it"
   }
  ],
  "note": "How + 형용사 — 「얼마나 ~한가」를 be동사로 묻습니다."
 },
 "p2c6": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wantto"
  ],
  "sets": [
   {
    "ko": "무엇을 하다",
    "v": "do",
    "past": "did",
    "pp": "done",
    "wh": "What",
    "say": "I'm a teacher.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "무엇을 원하다",
    "v": "want",
    "past": "wanted",
    "pp": "wanted",
    "wh": "What",
    "ans": "a new phone"
   },
   {
    "ko": "무엇이 필요하다",
    "v": "need",
    "past": "needed",
    "pp": "needed",
    "wh": "What",
    "ans": "some help"
   },
   {
    "ko": "무엇을 좋아하다",
    "v": "like",
    "past": "liked",
    "pp": "liked",
    "wh": "What",
    "ans": "Korean food"
   },
   {
    "ko": "무엇을 찾다",
    "v": "look for",
    "past": "looked for",
    "pp": "looked for",
    "wh": "What",
    "ans": "my keys"
   }
  ],
  "note": "WHAT으로만 된 문장 — 묻는 말만 바꿔 같은 동사구를 씁니다."
 },
 "p2c7": {
  "aux": [
   "do",
   "did",
   "will",
   "shall"
  ],
  "sets": [
   {
    "ko": "몇 시에 만나다",
    "v": "meet",
    "past": "met",
    "pp": "met",
    "wh": "What",
    "hw": "time",
    "ans": "at seven",
    "subj": "we",
    "asub": "we"
   },
   {
    "ko": "무슨 색을 원하다",
    "v": "want",
    "past": "wanted",
    "pp": "wanted",
    "wh": "What",
    "hw": "color",
    "ans": "blue"
   },
   {
    "ko": "어떤 종류의 차를 원하다",
    "v": "want",
    "past": "wanted",
    "pp": "wanted",
    "wh": "What",
    "hw": "kind of tea",
    "ans": "green tea"
   },
   {
    "ko": "몇 번 버스를 타다",
    "v": "take",
    "past": "took",
    "pp": "taken",
    "wh": "What",
    "hw": "number bus",
    "ans": "the 405 bus"
   },
   {
    "ko": "무슨 요일에 만나다",
    "v": "meet",
    "past": "met",
    "pp": "met",
    "wh": "What",
    "hw": "day",
    "ans": "on Monday",
    "subj": "we",
    "asub": "we"
   }
  ],
  "note": "WHAT + 명사 — 의문사 뒤에 명사를 붙여 묻습니다."
 },
 "p2c8": {
  "aux": [
   {
    "id": "wsp",
    "label": "현재",
    "tense": "현재"
   },
   {
    "id": "wspast",
    "label": "과거",
    "tense": "과거"
   },
   {
    "id": "wsfut",
    "label": "미래",
    "tense": "미래"
   }
  ],
  "sets": [
   {
    "ko": "누가 여기에 매일 오다",
    "v": "",
    "forms": {
     "wsp": {
      "q": "Who comes here every day?",
      "yes": "Mr. Lee does.",
      "no": "Nobody does."
     },
     "wspast": {
      "q": "Who came here yesterday?",
      "yes": "Mr. Lee did.",
      "no": "Nobody did."
     },
     "wsfut": {
      "q": "Who will come here tomorrow?",
      "yes": "Mr. Lee will.",
      "no": "Nobody will."
     }
    }
   },
   {
    "ko": "무엇이 당신을 화나게 하다",
    "v": "",
    "forms": {
     "wsp": {
      "q": "What makes you angry?",
      "yes": "The noise does.",
      "no": "Nothing does."
     },
     "wspast": {
      "q": "What made you angry?",
      "yes": "The noise did.",
      "no": "Nothing did."
     },
     "wsfut": {
      "q": "What will make you angry?",
      "yes": "The noise will.",
      "no": "Nothing will."
     }
    }
   },
   {
    "ko": "누가 그 일을 책임지다",
    "v": "",
    "forms": {
     "wsp": {
      "q": "Who takes charge of it?",
      "yes": "Mr. Park does.",
      "no": "Nobody does."
     },
     "wspast": {
      "q": "Who took charge of it?",
      "yes": "Mr. Park did.",
      "no": "Nobody did."
     },
     "wsfut": {
      "q": "Who will take charge of it?",
      "yes": "Mr. Park will.",
      "no": "Nobody will."
     }
    }
   },
   {
    "ko": "누가 그것을 압니까?",
    "v": "",
    "forms": {
     "wsp": {
      "q": "Who knows it?",
      "yes": "Mr. Kim does.",
      "no": "Nobody does."
     },
     "wspast": {
      "q": "Who knew it?",
      "yes": "Mr. Kim did.",
      "no": "Nobody did."
     },
     "wsfut": {
      "q": "Who will know it?",
      "yes": "Mr. Kim will.",
      "no": "Nobody will."
     }
    }
   }
  ],
  "note": "의문사가 주어 — 「누가/무엇이 + 동사」라서 do를 쓰지 않습니다."
 },
 "p2c9": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wantto",
   "prog"
  ],
  "sets": [
   {
    "ko": "누구를 기다리다",
    "v": "wait for",
    "past": "waited for",
    "pp": "waited for",
    "ing": "waiting for",
    "wh": "Who",
    "ans": "my friend"
   },
   {
    "ko": "누구와 함께 일하다",
    "v": "work with",
    "past": "worked with",
    "pp": "worked with",
    "ing": "working with",
    "wh": "Who",
    "ans": "my colleague"
   },
   {
    "ko": "누구에게 전화하다",
    "v": "call",
    "past": "called",
    "pp": "called",
    "ing": "calling",
    "wh": "Who",
    "ans": "my mother"
   },
   {
    "ko": "누구를 만나다",
    "v": "meet",
    "past": "met",
    "pp": "met",
    "ing": "meeting",
    "wh": "Whom",
    "ans": "the manager"
   },
   {
    "ko": "누구와 결혼하다",
    "v": "marry",
    "past": "married",
    "pp": "married",
    "ing": "marrying",
    "wh": "Who",
    "ans": "a teacher"
   }
  ],
  "note": "WHO / WHOM — 목적어로 쓰인 의문사를 문장 앞으로 보냅니다."
 },
 "p2c10": {
  "aux": [
   "do",
   "did",
   "will",
   "should"
  ],
  "sets": [
   {
    "ko": "어느 것을 원하다",
    "v": "want",
    "past": "wanted",
    "pp": "wanted",
    "wh": "Which",
    "ans": "the red one",
    "only": [
     "do",
     "did",
     "will"
    ]
   },
   {
    "ko": "어느 버스를 타다",
    "v": "take",
    "past": "took",
    "pp": "taken",
    "wh": "Which",
    "hw": "bus",
    "ans": "the 405 bus",
    "only": [
     "do",
     "did",
     "will",
     "should"
    ]
   },
   {
    "ko": "어느 쪽으로 가다",
    "v": "go",
    "past": "went",
    "pp": "gone",
    "wh": "Which",
    "hw": "way",
    "ans": "to the left",
    "subj": "I",
    "asub": "I"
   },
   {
    "ko": "어느 것을 좋아하다",
    "v": "like",
    "past": "liked",
    "pp": "liked",
    "wh": "Which",
    "ans": "the blue one",
    "only": [
     "do",
     "did",
     "will"
    ]
   }
  ],
  "note": "WHICH — 「어느 것·어느 쪽」을 묻고 골라서 답합니다."
 },
 "p2c11": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "have",
   "haveto"
  ],
  "sets": [
   {
    "ko": "언제 떠나다",
    "v": "leave",
    "past": "left",
    "pp": "left",
    "wh": "When",
    "ans": "at six",
    "only": [
     "do",
     "will",
     "can",
     "haveto"
    ]
   },
   {
    "ko": "언제 그것을 사다",
    "v": "buy it",
    "past": "bought it",
    "pp": "bought it",
    "wh": "When",
    "ans": "next week",
    "only": [
     "do",
     "will",
     "can"
    ]
   },
   {
    "ko": "언제 한국에 오다",
    "v": "come to Korea",
    "past": "came to Korea",
    "pp": "come to Korea",
    "wh": "When",
    "ans": "last year",
    "only": [
     "did"
    ]
   },
   {
    "ko": "언제까지 기다리다",
    "v": "wait",
    "past": "waited",
    "pp": "waited",
    "wh": "Until when",
    "ans": "until noon",
    "subj": "I",
    "asub": "I",
    "only": [
     "will",
     "can",
     "haveto"
    ]
   },
   {
    "ko": "언제부터 여기서 일하다",
    "v": "work here",
    "past": "worked here",
    "pp": "worked here",
    "wh": "Since when",
    "ans": "since 2015",
    "only": [
     "have"
    ]
   }
  ],
  "note": "WHEN — 때를 묻고 at / on / in / until / since 로 답합니다."
 },
 "p2c12": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "prog"
  ],
  "sets": [
   {
    "ko": "어디에 살다",
    "v": "live",
    "past": "lived",
    "pp": "lived",
    "ing": "living",
    "wh": "Where",
    "ans": "in Seoul"
   },
   {
    "ko": "어디서 일하다",
    "v": "work",
    "past": "worked",
    "pp": "worked",
    "ing": "working",
    "wh": "Where",
    "ans": "at a bank"
   },
   {
    "ko": "어디로 가다",
    "v": "go",
    "past": "went",
    "pp": "gone",
    "ing": "going",
    "wh": "Where",
    "ans": "to the library"
   },
   {
    "ko": "어디서 그것을 사다",
    "v": "buy it",
    "past": "bought it",
    "pp": "bought it",
    "ing": "buying it",
    "wh": "Where",
    "ans": "at the market"
   },
   {
    "ko": "어디에 두다",
    "v": "put it",
    "past": "put it",
    "pp": "put it",
    "ing": "putting it",
    "wh": "Where",
    "ans": "on the desk"
   }
  ],
  "note": "WHERE — 장소를 묻고 in / at / to 로 답합니다."
 },
 "p2c13": {
  "aux": [
   "do",
   "did",
   "didnt",
   "prog"
  ],
  "sets": [
   {
    "ko": "왜 여기에 오다",
    "v": "come here",
    "past": "came here",
    "pp": "come here",
    "wh": "Why",
    "ans": "to see you",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "왜 그렇게 생각하다",
    "v": "think so",
    "past": "thought so",
    "pp": "thought so",
    "wh": "Why",
    "ans": "because it is true",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "왜 웃다",
    "v": "laugh",
    "past": "laughed",
    "pp": "laughed",
    "ing": "laughing",
    "wh": "Why",
    "ans": "because of the joke"
   },
   {
    "ko": "왜 일찍 일어나다",
    "v": "get up early",
    "past": "got up early",
    "pp": "got up early",
    "wh": "Why",
    "ans": "to catch the bus",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "왜 그것을 사지 않다",
    "v": "buy it",
    "past": "bought it",
    "pp": "bought it",
    "wh": "Why",
    "ans": "because it was too expensive",
    "only": [
     "did",
     "didnt"
    ]
   }
  ],
  "note": "WHY — 이유를 묻고 to부정사·because 로 답합니다."
 },
 "p2c14": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "누구와 함께 가다",
    "v": "go",
    "past": "went",
    "pp": "gone",
    "wh": "With whom",
    "ans": "with my friend"
   },
   {
    "ko": "무엇으로 그것을 만들다",
    "v": "make it",
    "past": "made it",
    "pp": "made it",
    "wh": "With what",
    "ans": "with wood"
   },
   {
    "ko": "어디서 오다",
    "v": "come",
    "past": "came",
    "pp": "come",
    "wh": "From where",
    "ans": "from Busan"
   },
   {
    "ko": "몇 시부터 시작하다",
    "v": "start",
    "past": "started",
    "pp": "started",
    "wh": "From what time",
    "ans": "from nine",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "누구에게 그것을 주다",
    "v": "give it",
    "past": "gave it",
    "pp": "given it",
    "wh": "To whom",
    "ans": "to Mr. Kim"
   },
   {
    "ko": "무엇을 위해 일하다",
    "v": "work",
    "past": "worked",
    "pp": "worked",
    "wh": "For what",
    "ans": "for money"
   }
  ],
  "note": "전치사 + 의문사 — 「누구와 / 무엇으로 / 어디서」를 한 덩어리로 묻습니다."
 },
 "p2c15": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "몇 시에 일어나다",
    "v": "get up",
    "past": "got up",
    "pp": "got up",
    "wh": "What time",
    "ans": "at six"
   },
   {
    "ko": "어디서 점심을 먹다",
    "v": "have lunch",
    "past": "had lunch",
    "pp": "had lunch",
    "wh": "Where",
    "ans": "at the office"
   },
   {
    "ko": "얼마나 자주 그를 만나다",
    "v": "meet him",
    "past": "met him",
    "pp": "met him",
    "wh": "How often",
    "ans": "twice a month"
   },
   {
    "ko": "왜 그 회사를 선택하다",
    "v": "choose the company",
    "past": "chose the company",
    "pp": "chosen the company",
    "wh": "Why",
    "ans": "because it is near my house"
   },
   {
    "ko": "누구와 상담하다",
    "v": "consult with",
    "past": "consulted with",
    "pp": "consulted with",
    "wh": "Who",
    "ans": "my boss"
   }
  ],
  "note": "2부 종합 — 의문사만 바꿔 같은 동사구로 묻고 답합니다."
 },
 "p3c1": {
  "aux": [
   "may",
   "can"
  ],
  "subj": "I",
  "asub": "you",
  "sets": [
   {
    "ko": "들어오다",
    "v": "come in",
    "past": "came in",
    "pp": "come in"
   },
   {
    "ko": "질문 하나 하다",
    "v": "ask a question",
    "past": "asked a question",
    "pp": "asked a question"
   },
   {
    "ko": "여기 앉다",
    "v": "sit here",
    "past": "sat here",
    "pp": "sat here"
   },
   {
    "ko": "그것을 빌리다",
    "v": "borrow it",
    "past": "borrowed it",
    "pp": "borrowed it"
   },
   {
    "ko": "창문을 열다",
    "v": "open the window",
    "past": "opened the window",
    "pp": "opened the window"
   }
  ],
  "note": "MAY I …? — 허락을 구하고 「Yes, you may / No, you may not」으로 답합니다."
 },
 "p3c2": {
  "aux": [
   "shall",
   "should"
  ],
  "subj": "we",
  "asub": "we",
  "sets": [
   {
    "ko": "함께 가다",
    "v": "go together",
    "past": "went together",
    "pp": "gone together"
   },
   {
    "ko": "창문을 열다",
    "v": "open the window",
    "past": "opened the window",
    "pp": "opened the window"
   },
   {
    "ko": "서두르다",
    "v": "hurry up",
    "past": "hurried up",
    "pp": "hurried up"
   },
   {
    "ko": "잠깐 쉬다",
    "v": "take a rest",
    "past": "took a rest",
    "pp": "taken a rest"
   },
   {
    "ko": "지금 떠나다",
    "v": "leave now",
    "past": "left now",
    "pp": "left now"
   }
  ],
  "note": "SHALL we …? = 「~할까요?」 / SHOULD we …? = 「~해야 할까요?」"
 },
 "p3c3": {
  "aux": [
   "must",
   "haveto"
  ],
  "subj": "I",
  "asub": "you",
  "sets": [
   {
    "ko": "지금 가다",
    "v": "go now",
    "past": "went now",
    "pp": "gone now"
   },
   {
    "ko": "그것을 오늘 끝내다",
    "v": "finish it today",
    "past": "finished it today",
    "pp": "finished it today"
   },
   {
    "ko": "여기서 기다리다",
    "v": "wait here",
    "past": "waited here",
    "pp": "waited here"
   },
   {
    "ko": "일찍 일어나다",
    "v": "get up early",
    "past": "got up early",
    "pp": "got up early"
   },
   {
    "ko": "영어로 쓰다",
    "v": "write in English",
    "past": "wrote in English",
    "pp": "written in English"
   }
  ],
  "note": "MUST = HAVE TO — 물을 때는 Must I …? / Do I have to …? 로 바뀝니다."
 },
 "p3c4": {
  "aux": [
   "can",
   "will",
   "ableto"
  ],
  "sets": [
   {
    "ko": "영어를 말하다",
    "v": "speak English",
    "past": "spoke English",
    "pp": "spoken English"
   },
   {
    "ko": "차를 운전하다",
    "v": "drive a car",
    "past": "drove a car",
    "pp": "driven a car"
   },
   {
    "ko": "내일 오다",
    "v": "come tomorrow",
    "past": "came tomorrow",
    "pp": "come tomorrow"
   },
   {
    "ko": "그를 돕다",
    "v": "help him",
    "past": "helped him",
    "pp": "helped him"
   },
   {
    "ko": "이것을 하다",
    "v": "do this",
    "past": "did this",
    "pp": "done this"
   }
  ],
  "note": "CAN = be able to — 가능을 묻고 Yes, I can … 으로 답합니다."
 },
 "p3c5": {
  "aux": [
   "will",
   "would"
  ],
  "sets": [
   {
    "ko": "문을 닫다",
    "v": "close the door",
    "past": "closed the door",
    "pp": "closed the door"
   },
   {
    "ko": "내일 오다",
    "v": "come tomorrow",
    "past": "came tomorrow",
    "pp": "come tomorrow"
   },
   {
    "ko": "이것을 사무실로 가져가다",
    "v": "take this to the office",
    "past": "took this to the office",
    "pp": "taken this to the office"
   },
   {
    "ko": "그와 결혼하다",
    "v": "marry him",
    "past": "married him",
    "pp": "married him"
   },
   {
    "ko": "그를 돕다",
    "v": "help him",
    "past": "helped him",
    "pp": "helped him"
   }
  ],
  "note": "WILL you …? = 부탁·권유 / WOULD you …? = 더 공손한 부탁"
 },
 "p3c6": {
  "aux": [
   "will",
   "would",
   "can"
  ],
  "sets": [
   {
    "ko": "그가 들어오게 하다",
    "v": "let him come in",
    "past": "let him come in",
    "pp": "let him come in"
   },
   {
    "ko": "그를 가게 하다",
    "v": "let him go",
    "past": "let him go",
    "pp": "let him go"
   },
   {
    "ko": "그들이 먼저 가게 하다",
    "v": "let them go first",
    "past": "let them go first",
    "pp": "let them go first"
   },
   {
    "ko": "그가 그것을 하게 두다",
    "v": "let him do it",
    "past": "let him do it",
    "pp": "let him do it"
   },
   {
    "ko": "그를 쉬게 하다",
    "v": "let him take a rest",
    "past": "let him take a rest",
    "pp": "let him take a rest"
   }
  ],
  "note": "LET + 목적어 + 동사원형 — 「~하게 하다」를 부탁하는 문장으로 돌립니다."
 },
 "p3c7": {
  "aux": [
   "will",
   "did",
   "can",
   "would",
   "haveto"
  ],
  "sets": [
   {
    "ko": "그에게 편지를 보내다",
    "v": "send him a letter",
    "past": "sent him a letter",
    "pp": "sent him a letter"
   },
   {
    "ko": "그에게 이것을 보여 주다",
    "v": "show him this",
    "past": "showed him this",
    "pp": "shown him this"
   },
   {
    "ko": "그에게 기회를 주다",
    "v": "give him a chance",
    "past": "gave him a chance",
    "pp": "given him a chance"
   },
   {
    "ko": "그에게 돈을 빌려주다",
    "v": "lend him some money",
    "past": "lent him some money",
    "pp": "lent him some money"
   },
   {
    "ko": "그에게 시계를 사 주다",
    "v": "buy him a watch",
    "past": "bought him a watch",
    "pp": "bought him a watch"
   }
  ],
  "note": "4형식 — give/send/show + 사람 + 물건 순서를 그대로 씁니다."
 },
 "p3c8": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "would",
   "haveto"
  ],
  "sets": [
   {
    "ko": "그것을 그에게 주다",
    "v": "give it to him",
    "past": "gave it to him",
    "pp": "given it to him"
   },
   {
    "ko": "그에게 기회를 주다",
    "v": "give him a chance",
    "past": "gave him a chance",
    "pp": "given him a chance"
   },
   {
    "ko": "그에게 설명을 해 주다",
    "v": "give him an explanation",
    "past": "gave him an explanation",
    "pp": "given him an explanation"
   },
   {
    "ko": "그에게 전화번호를 알려 주다",
    "v": "give him the phone number",
    "past": "gave him the phone number",
    "pp": "given him the phone number"
   },
   {
    "ko": "담배를 끊다",
    "v": "give up smoking",
    "past": "gave up smoking",
    "pp": "given up smoking"
   }
  ],
  "note": "GIVE — 뒤에 오는 말에 따라 「주다·포기하다·돌려주다」로 바뀝니다."
 },
 "p3c9": {
  "aux": [
   "will",
   "did",
   "can"
  ],
  "sets": [
   {
    "ko": "그가 오게 하다",
    "v": "have him come",
    "past": "had him come",
    "pp": "had him come"
   },
   {
    "ko": "그가 들어오는 것을 보다",
    "v": "see him come in",
    "past": "saw him come in",
    "pp": "seen him come in"
   },
   {
    "ko": "그를 웃게 하다",
    "v": "make him laugh",
    "past": "made him laugh",
    "pp": "made him laugh"
   },
   {
    "ko": "그가 노래하는 것을 듣다",
    "v": "hear him sing",
    "past": "heard him sing",
    "pp": "heard him sing"
   },
   {
    "ko": "방을 청소하게 하다",
    "v": "have the room cleaned",
    "past": "had the room cleaned",
    "pp": "had the room cleaned"
   }
  ],
  "note": "사역·지각동사 — have/make/see/hear + 목적어 + 동사원형"
 },
 "p3c10": {
  "aux": [
   "do",
   "did",
   "will",
   "goingto",
   "prog"
  ],
  "sets": [
   {
    "ko": "집에 가다",
    "v": "go home",
    "past": "went home",
    "pp": "gone home",
    "ing": "going home"
   },
   {
    "ko": "산책하러 가다",
    "v": "go for a walk",
    "past": "went for a walk",
    "pp": "gone for a walk",
    "ing": "going for a walk"
   },
   {
    "ko": "화를 내다",
    "v": "go mad",
    "past": "went mad",
    "pp": "gone mad",
    "ing": "going mad"
   },
   {
    "ko": "너무 멀리 가다",
    "v": "go too far",
    "past": "went too far",
    "pp": "gone too far",
    "ing": "going too far"
   },
   {
    "ko": "어디로 가다",
    "v": "go",
    "past": "went",
    "pp": "gone",
    "ing": "going",
    "wh": "Where",
    "ans": "to the office"
   }
  ],
  "note": "GO — 뒤에 붙는 말에 따라 뜻이 달라집니다. 의문사로도 묻습니다."
 },
 "p3c11": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "어디서 오다",
    "v": "come from",
    "past": "came from",
    "pp": "come from",
    "wh": "Where",
    "ans": "Busan"
   },
   {
    "ko": "언제 오다",
    "v": "come",
    "past": "came",
    "pp": "come",
    "wh": "When",
    "ans": "tomorrow",
    "only": [
     "do",
     "will",
     "can"
    ]
   },
   {
    "ko": "어떻게 그것을 생각해 내다",
    "v": "come up with it",
    "past": "came up with it",
    "pp": "come up with it",
    "wh": "How",
    "ans": "by asking him"
   },
   {
    "ko": "그와 함께 오다",
    "v": "come with him",
    "past": "came with him",
    "pp": "come with him"
   },
   {
    "ko": "무슨 일로 오다",
    "v": "come for",
    "past": "came for",
    "pp": "come for",
    "wh": "What",
    "say": "I came to see you.",
    "only": [
     "did"
    ]
   }
  ],
  "note": "COME — Where / When / How / What … for 로 묻고 답합니다."
 },
 "p3c12": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "would"
  ],
  "sets": [
   {
    "ko": "무엇을 하다",
    "v": "do",
    "past": "did",
    "pp": "done",
    "wh": "What",
    "say": "I'm a teacher.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "일을 잘하다",
    "v": "do the work well",
    "past": "did the work well",
    "pp": "done the work well"
   },
   {
    "ko": "그것을 하다",
    "v": "do it",
    "past": "did it",
    "pp": "done it"
   },
   {
    "ko": "설거지를 하다",
    "v": "do the dishes",
    "past": "did the dishes",
    "pp": "done the dishes"
   },
   {
    "ko": "그것을 좋아하다",
    "v": "like it",
    "past": "liked it",
    "pp": "liked it"
   }
  ],
  "note": "DO — 「무엇을 하다」와 대명사 it 을 받아 쓰는 문장을 함께 익힙니다."
 },
 "p3c13": {
  "aux": [
   "will",
   "do",
   "can"
  ],
  "sets": [
   {
    "ko": "비가 오면 집에 있다",
    "v": "stay home if it rains",
    "past": "stayed home if it rains",
    "pp": "stayed home if it rains"
   },
   {
    "ko": "그가 도착하기 전에 전화하다",
    "v": "call him before he arrives",
    "past": "called him before he arrives",
    "pp": "called him before he arrives"
   },
   {
    "ko": "당신이 바쁘면 혼자 가다",
    "v": "go alone if you are busy",
    "past": "went alone if you are busy",
    "pp": "gone alone if you are busy"
   },
   {
    "ko": "그가 올 때까지 기다리다",
    "v": "wait until he comes",
    "past": "waited until he comes",
    "pp": "waited until he comes"
   },
   {
    "ko": "그것이 싸면 사다",
    "v": "buy it if it is cheap",
    "past": "bought it if it is cheap",
    "pp": "bought it if it is cheap"
   }
  ],
  "note": "접속사(if / before / until) 절을 붙여 장문으로 말합니다."
 },
 "p3c14": {
  "aux": [
   "would"
  ],
  "sets": [
   {
    "ko": "시간이 있다면 여행하다",
    "v": "travel if you had time",
    "past": "traveled if you had time",
    "pp": "traveled if you had time",
    "yes": "Yes, I would travel if I had time.",
    "no": "No, I wouldn't travel if I had time."
   },
   {
    "ko": "돈이 있다면 차를 사다",
    "v": "buy a car if you had money",
    "past": "bought a car if you had money",
    "pp": "bought a car if you had money",
    "yes": "Yes, I would buy a car if I had money.",
    "no": "No, I wouldn't buy a car if I had money."
   },
   {
    "ko": "그가 여기 있다면 돕다",
    "v": "help him if he were here",
    "past": "helped him if he were here",
    "pp": "helped him if he were here",
    "yes": "Yes, I would help him if he were here.",
    "no": "No, I wouldn't help him if he were here."
   },
   {
    "ko": "새라면 날아가다",
    "v": "fly if you were a bird",
    "past": "flew if you were a bird",
    "pp": "flown if you were a bird",
    "yes": "Yes, I would fly if I were a bird.",
    "no": "No, I wouldn't fly if I were a bird."
   },
   {
    "ko": "돈이 많다면 무엇을 하다",
    "v": "do if you had a lot of money",
    "past": "did if you had a lot of money",
    "pp": "done if you had a lot of money",
    "wh": "What",
    "say": "I'd buy a new car."
   }
  ],
  "note": "가정문 — if 절은 과거로, 본문은 would 로 말합니다."
 },
 "p3c15": {
  "aux": [
   "do",
   "did",
   "have"
  ],
  "sets": [
   {
    "ko": "그가 아프다는 것을 듣다",
    "v": "hear that he is sick",
    "past": "heard that he is sick",
    "pp": "heard that he is sick"
   },
   {
    "ko": "그가 올지 아닌지 알다",
    "v": "know whether he will come",
    "past": "knew whether he will come",
    "pp": "known whether he will come",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "그가 오면 그에게 묻다",
    "v": "ask him if he comes",
    "past": "asked him if he comes",
    "pp": "asked him if he comes"
   },
   {
    "ko": "그가 오기를 기다리다",
    "v": "wait for him to come",
    "past": "waited for him to come",
    "pp": "waited for him to come"
   },
   {
    "ko": "그것이 무엇인지 그에게 말하다",
    "v": "tell him what it is",
    "past": "told him what it is",
    "pp": "told him what it is"
   }
  ],
  "note": "that / whether / if / what 절을 붙여 긴 문장을 만듭니다."
 },
 "p3c16": {
  "aux": [
   "did",
   "will",
   "can",
   "would"
  ],
  "sets": [
   {
    "ko": "그에게 책을 주다",
    "v": "give him the book",
    "past": "gave him the book",
    "pp": "given him the book"
   },
   {
    "ko": "그를 가게 하다",
    "v": "let him go",
    "past": "let him go",
    "pp": "let him go"
   },
   {
    "ko": "그가 들어오는 것을 보다",
    "v": "see him come in",
    "past": "saw him come in",
    "pp": "seen him come in"
   },
   {
    "ko": "차를 수리하게 하다",
    "v": "have the car repaired",
    "past": "had the car repaired",
    "pp": "had the car repaired"
   },
   {
    "ko": "한국으로 돌아오다",
    "v": "return to Korea",
    "past": "returned to Korea",
    "pp": "returned to Korea"
   }
  ],
  "note": "3부 중간시험 — 수여동사·사역동사·의문사를 한자리에서 확인합니다."
 },
 "p3c17": {
  "aux": [
   "have",
   "had",
   "willhave"
  ],
  "sets": [
   {
    "ko": "미국에 가 본 적이 있다",
    "v": "be to America",
    "past": "was to America",
    "pp": "been to America",
    "mid": "ever"
   },
   {
    "ko": "그것을 끝내다",
    "v": "finish it",
    "past": "finished it",
    "pp": "finished it"
   },
   {
    "ko": "영어를 배우다",
    "v": "learn English",
    "past": "learned English",
    "pp": "learned English"
   },
   {
    "ko": "점심을 먹다",
    "v": "have lunch",
    "past": "had lunch",
    "pp": "had lunch"
   },
   {
    "ko": "얼마나 오래 여기 있다",
    "v": "be here",
    "past": "was here",
    "pp": "been here",
    "wh": "How long",
    "ans": "for three years"
   }
  ],
  "note": "have + p.p — 경험·완료·계속을 Have you …? 로 묻습니다."
 },
 "p3c18": {
  "aux": [
   "be",
   "bep",
   "willbe",
   "goingtobe"
  ],
  "sets": [
   {
    "ko": "피곤하다",
    "v": "tired",
    "past": "tireded",
    "pp": "tireded",
    "be": true
   },
   {
    "ko": "좋은 의사이다",
    "v": "a good doctor",
    "past": "aed good doctor",
    "pp": "aed good doctor",
    "be": true
   },
   {
    "ko": "아주 쉽다",
    "v": "very easy",
    "past": "veried easy",
    "pp": "veried easy",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "사실이다",
    "v": "true",
    "past": "trued",
    "pp": "trued",
    "subj": "the news",
    "asub": "it",
    "be": true
   },
   {
    "ko": "맛이 좋다",
    "v": "good",
    "past": "gooded",
    "pp": "gooded",
    "subj": "the soup",
    "asub": "it",
    "be": true
   }
  ],
  "note": "2형식 be동사 — 주어 + be + 보어(형용사·명사) 문장을 묻습니다."
 },
 "p3c19": {
  "aux": [
   "do",
   "did",
   "will",
   "can",
   "wouldliketo"
  ],
  "sets": [
   {
    "ko": "산책하다",
    "v": "take a walk",
    "past": "took a walk",
    "pp": "taken a walk"
   },
   {
    "ko": "결정을 내리다",
    "v": "make a decision",
    "past": "made a decision",
    "pp": "made a decision"
   },
   {
    "ko": "목욕하다",
    "v": "take a bath",
    "past": "took a bath",
    "pp": "taken a bath"
   },
   {
    "ko": "영어를 가르치다",
    "v": "teach English",
    "past": "taught English",
    "pp": "taught English"
   },
   {
    "ko": "커피를 좋아하다",
    "v": "like coffee",
    "past": "liked coffee",
    "pp": "liked coffee"
   }
  ],
  "note": "동사를 명사로 — take a walk / make a decision 처럼 명사와 함께 씁니다."
 },
 "p3c20": {
  "aux": [
   "be",
   "bep",
   "willbe",
   "havebe"
  ],
  "sets": [
   {
    "ko": "여기 있다",
    "v": "here",
    "past": "hered",
    "pp": "hered",
    "be": true
   },
   {
    "ko": "밖에 있다",
    "v": "outside",
    "past": "outsided",
    "pp": "outsided",
    "subj": "they",
    "asub": "they",
    "be": true
   },
   {
    "ko": "3시이다",
    "v": "at three",
    "past": "ated three",
    "pp": "ated three",
    "subj": "the meeting",
    "asub": "it",
    "be": true
   },
   {
    "ko": "한국에 있다",
    "v": "in Korea",
    "past": "ined Korea",
    "pp": "ined Korea",
    "subj": "he",
    "asub": "he",
    "be": true
   },
   {
    "ko": "배고프다",
    "v": "hungry",
    "past": "hungried",
    "pp": "hungried",
    "be": true
   }
  ],
  "note": "1형식 be동사 — 주어 + be + 장소·시간·상태"
 },
 "p3c21": {
  "aux": [
   "pbe",
   "pwas",
   "pwill",
   "phas",
   "pcan"
  ],
  "sets": [
   {
    "ko": "여행사에서 발행되다",
    "v": "",
    "pp": "published by the travel agency",
    "subj": "the book",
    "asub": "it"
   },
   {
    "ko": "세계에서 사용되다",
    "v": "",
    "pp": "used all over the world",
    "subj": "English",
    "asub": "it"
   },
   {
    "ko": "매일 잠기다",
    "v": "",
    "pp": "locked every day",
    "subj": "the door",
    "asub": "it"
   },
   {
    "ko": "한국에 세워지다",
    "v": "",
    "pp": "founded in Korea",
    "subj": "the company",
    "asub": "it",
    "only": [
     "pwas"
    ]
   },
   {
    "ko": "많은 나라에서 팔리다",
    "v": "",
    "pp": "sold in many countries",
    "subj": "the product",
    "asub": "it"
   }
  ],
  "note": "수동 (be + p.p) — 「~되다」를 현재·과거·미래·완료로 바꿔 말합니다."
 },
 "p3c22": {
  "aux": [
   "pbe",
   "pwas",
   "pwill",
   "phas",
   "pcan"
  ],
  "sets": [
   {
    "ko": "끝나다",
    "v": "",
    "pp": "finished",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "매일 청소되다",
    "v": "",
    "pp": "cleaned every day",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "많은 사람에게 사용되다",
    "v": "",
    "pp": "used by many people",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "수리되다",
    "v": "",
    "pp": "repaired",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "여기서 팔리다",
    "v": "",
    "pp": "sold here",
    "subj": "it",
    "asub": "it"
   }
  ],
  "note": "수동 공식정리 — It is / was / will be / has been / can be + p.p"
 },
 "p3c23": {
  "aux": [
   "pwas",
   "pbe"
  ],
  "sets": [
   {
    "ko": "이 다리가 지어지다",
    "v": "",
    "pp": "built",
    "wh": "When",
    "ans": "in 1970",
    "subj": "this bridge",
    "asub": "it",
    "only": [
     "pwas"
    ]
   },
   {
    "ko": "그 편지가 보내지다",
    "v": "",
    "pp": "sent",
    "subj": "the letter",
    "asub": "it"
   },
   {
    "ko": "그 회의가 연기되다",
    "v": "",
    "pp": "postponed",
    "subj": "the meeting",
    "asub": "it"
   },
   {
    "ko": "이 방이 매일 청소되다",
    "v": "",
    "pp": "cleaned every day",
    "subj": "this room",
    "asub": "it"
   },
   {
    "ko": "그 차가 수리되다",
    "v": "",
    "pp": "repaired",
    "subj": "the car",
    "asub": "it"
   }
  ],
  "note": "수동 실력시험 — 의문사와 함께 「언제 지어졌습니까」를 묻습니다."
 },
 "p3c24": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "그가 아픈지 알다",
    "v": "know if he is sick",
    "past": "knew if he is sick",
    "pp": "known if he is sick"
   },
   {
    "ko": "그가 올 것이라고 생각하다",
    "v": "think he will come",
    "past": "thought he will come",
    "pp": "thought he will come"
   },
   {
    "ko": "그가 어디로 가는지 알다",
    "v": "know where he is going",
    "past": "knew where he is going",
    "pp": "known where he is going"
   },
   {
    "ko": "그것이 무엇인지 그에게 말하다",
    "v": "tell him what it is",
    "past": "told him what it is",
    "pp": "told him what it is"
   },
   {
    "ko": "그가 아프다는 것을 듣다",
    "v": "hear that he is sick",
    "past": "heard that he is sick",
    "pp": "heard that he is sick"
   }
  ],
  "note": "명사절(화법) — if / where / what 절을 동사 뒤에 붙입니다."
 },
 "p3c25": {
  "aux": [
   "do",
   "did",
   "can",
   "have"
  ],
  "sets": [
   {
    "ko": "그것이 진실이라고 생각하다",
    "v": "think that it is true",
    "past": "thought that it is true",
    "pp": "thought that it is true",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "그가 어디에 사는지 알다",
    "v": "know where he lives",
    "past": "knew where he lives",
    "pp": "known where he lives",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "그 일을 끝냈다고 듣다",
    "v": "hear that he finished the work",
    "past": "heard that he finished the work",
    "pp": "heard that he finished the work"
   },
   {
    "ko": "그 일을 끝내다",
    "v": "finish the work",
    "past": "finished the work",
    "pp": "finished the work"
   },
   {
    "ko": "그 책을 읽다",
    "v": "read the book",
    "past": "read the book",
    "pp": "read the book"
   }
  ],
  "note": "수동·완료·명사절 실력시험 — 긴 문장을 묶어 말합니다."
 },
 "p3c26": {
  "aux": [
   "do",
   "did",
   "can",
   "will"
  ],
  "sets": [
   {
    "ko": "그가 무엇을 원하는지 그에게 말하다",
    "v": "tell him what he wants",
    "past": "told him what he wants",
    "pp": "told him what he wants"
   },
   {
    "ko": "그녀가 어떻게 했는지 알다",
    "v": "know how she did it",
    "past": "knew how she did it",
    "pp": "known how she did it"
   },
   {
    "ko": "그것이 얼마인지 알다",
    "v": "know how much it is",
    "past": "knew how much it is",
    "pp": "known how much it is"
   },
   {
    "ko": "그가 언제 오는지 알다",
    "v": "know when he is coming",
    "past": "knew when he is coming",
    "pp": "known when he is coming"
   },
   {
    "ko": "그가 왜 그런지 이해하다",
    "v": "understand why he is like that",
    "past": "understood why he is like that",
    "pp": "understood why he is like that"
   }
  ],
  "note": "명사절의 여러 형태 — what / how / when / why 절을 붙입니다."
 },
 "p3c27": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "그것에 동의하다",
    "v": "agree with him",
    "past": "agreed with him",
    "pp": "agreed with him"
   },
   {
    "ko": "그것을 결정하다",
    "v": "decide it",
    "past": "decided it",
    "pp": "decided it"
   },
   {
    "ko": "그것을 추천하다",
    "v": "recommend it",
    "past": "recommended it",
    "pp": "recommended it"
   },
   {
    "ko": "그것을 기대하다",
    "v": "expect it",
    "past": "expected it",
    "pp": "expected it"
   },
   {
    "ko": "그것에 대해 이야기하다",
    "v": "talk about it",
    "past": "talked about it",
    "pp": "talked about it"
   }
  ],
  "note": "잘 쓰는 단어 200개 — agree / decide / recommend / expect 를 문장으로."
 },
 "p3c28": {
  "aux": [
   "will",
   "would",
   "can",
   "could"
  ],
  "sets": [
   {
    "ko": "문을 닫다",
    "v": "close the door",
    "past": "closed the door",
    "pp": "closed the door"
   },
   {
    "ko": "앉다",
    "v": "sit down",
    "past": "sat down",
    "pp": "sat down"
   },
   {
    "ko": "천천히 말하다",
    "v": "speak slowly",
    "past": "spoke slowly",
    "pp": "spoken slowly"
   },
   {
    "ko": "다시 해 보다",
    "v": "try again",
    "past": "tried again",
    "pp": "tried again"
   },
   {
    "ko": "그를 기다리다",
    "v": "wait for him",
    "past": "waited for him",
    "pp": "waited for him"
   }
  ],
  "note": "명령문도 「Will you …?」로 물으면 정중한 부탁이 됩니다."
 },
 "p4c1": {
  "aux": [
   "be",
   "bep",
   "willbe",
   "goingtobe"
  ],
  "sets": [
   {
    "ko": "친절한 사람이다",
    "v": "a kind person",
    "past": "aed kind person",
    "pp": "aed kind person",
    "be": true
   },
   {
    "ko": "새로운 책이다",
    "v": "a new book",
    "past": "aed new book",
    "pp": "aed new book",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "넓고 밝다",
    "v": "wide and bright",
    "past": "wided and bright",
    "pp": "wided and bright",
    "subj": "this room",
    "asub": "it",
    "be": true
   },
   {
    "ko": "매우 바쁜 사람이다",
    "v": "a very busy person",
    "past": "aed very busy person",
    "pp": "aed very busy person",
    "be": true
   },
   {
    "ko": "중요하다",
    "v": "important",
    "past": "importanted",
    "pp": "importanted",
    "subj": "it",
    "asub": "it",
    "be": true
   }
  ],
  "note": "형용사 문장 — 「~은 …하다」를 Are you …? 로 묻습니다."
 },
 "p4c2": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "오늘 덥다",
    "v": "hot today",
    "past": "hotted today",
    "pp": "hotted today",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "좁다",
    "v": "narrow",
    "past": "narrowed",
    "pp": "narrowed",
    "subj": "this room",
    "asub": "it",
    "be": true
   },
   {
    "ko": "정직하다",
    "v": "honest",
    "past": "honested",
    "pp": "honested",
    "subj": "he",
    "asub": "he",
    "be": true
   },
   {
    "ko": "어렵다",
    "v": "difficult",
    "past": "difficulted",
    "pp": "difficulted",
    "subj": "the work",
    "asub": "it",
    "be": true
   },
   {
    "ko": "친절하다",
    "v": "kind",
    "past": "kinded",
    "pp": "kinded",
    "subj": "she",
    "asub": "she",
    "be": true
   },
   {
    "ko": "값이 싸다",
    "v": "cheap",
    "past": "cheaped",
    "pp": "cheaped",
    "subj": "it",
    "asub": "it",
    "be": true
   }
  ],
  "note": "필수 형용사 300 — 주어만 바꿔 형용사를 붙여 말합니다."
 },
 "p4c3": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "그것을 하기에 충분히 나이가 들다",
    "v": "old enough to do it",
    "past": "olded enough to do it",
    "pp": "olded enough to do it",
    "be": true
   },
   {
    "ko": "너무 무거워서 들 수 없다",
    "v": "too heavy to lift",
    "past": "tooed heavy to lift",
    "pp": "tooed heavy to lift",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "노래를 잘하다",
    "v": "good at singing",
    "past": "gooded at singing",
    "pp": "gooded at singing",
    "subj": "she",
    "asub": "she",
    "be": true
   },
   {
    "ko": "수학에 약하다",
    "v": "weak in mathematics",
    "past": "weaked in mathematics",
    "pp": "weaked in mathematics",
    "be": true
   },
   {
    "ko": "그것에 관심이 있다",
    "v": "interested in it",
    "past": "interesteded in it",
    "pp": "interesteded in it",
    "be": true
   },
   {
    "ko": "물로 가득하다",
    "v": "full of water",
    "past": "fulled of water",
    "pp": "fulled of water",
    "subj": "it",
    "asub": "it",
    "be": true
   }
  ],
  "note": "공식 형용사 — old enough to / too … to / good at / interested in"
 },
 "p4c4": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "날씨가 어떻다",
    "v": "",
    "wh": "How",
    "ans": "nice",
    "subj": "the weather",
    "asub": "it",
    "be": true
   },
   {
    "ko": "몇 시이다",
    "v": "",
    "wh": "What time",
    "ans": "eight",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "쉽다",
    "v": "easy",
    "past": "easied",
    "pp": "easied",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "그를 만나는 것이 즐겁다",
    "v": "pleasant to meet him",
    "past": "pleasanted to meet him",
    "pp": "pleasanted to meet him",
    "subj": "it",
    "asub": "it",
    "be": true
   },
   {
    "ko": "그가 거짓말을 했다는 것이 사실이다",
    "v": "true that he lied",
    "past": "trued that he lied",
    "pp": "trued that he lied",
    "subj": "it",
    "asub": "it",
    "be": true
   }
  ],
  "note": "IT으로 시작하는 문장 — 날씨·시간·거리·감정을 it 으로 말합니다."
 },
 "p4c5": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "모든 학생이 오다",
    "v": "come",
    "past": "came",
    "pp": "come",
    "subj": "all the students",
    "asub": "they",
    "agr": "pl"
   },
   {
    "ko": "각 학생이 책을 가지고 있다",
    "v": "have a book",
    "past": "had a book",
    "pp": "had a book",
    "subj": "each student",
    "asub": "he",
    "agr": "sg"
   },
   {
    "ko": "몇몇 사람들이 그것을 알다",
    "v": "know it",
    "past": "knew it",
    "pp": "known it",
    "subj": "some people",
    "asub": "they",
    "agr": "pl"
   },
   {
    "ko": "모든 학생이 그것을 알다",
    "v": "know it",
    "past": "knew it",
    "pp": "known it",
    "subj": "every student",
    "asub": "he",
    "agr": "sg"
   }
  ],
  "note": "한정사 — all / each / some / every 가 주어에 붙으면 수에 맞춰 말합니다."
 },
 "p4c6": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "저기서 일하는 남자를 알다",
    "v": "know the man who works there",
    "past": "knew the man who works there",
    "pp": "known the man who works there"
   },
   {
    "ko": "그가 산 책을 알다",
    "v": "know the book that he bought",
    "past": "knew the book that he bought",
    "pp": "known the book that he bought"
   },
   {
    "ko": "그가 떠난 날을 기억하다",
    "v": "remember the day when he left",
    "past": "remembered the day when he left",
    "pp": "remembered the day when he left"
   },
   {
    "ko": "그가 사는 도시를 알다",
    "v": "know the city where he lives",
    "past": "knew the city where he lives",
    "pp": "known the city where he lives"
   },
   {
    "ko": "그가 그것을 한 이유를 알다",
    "v": "know the reason why he did it",
    "past": "knew the reason why he did it",
    "pp": "known the reason why he did it"
   }
  ],
  "note": "관계사 — who / which / where / when / why 로 명사를 뒤에서 꾸밉니다."
 },
 "p4c7": {
  "aux": [
   "do",
   "did",
   "can",
   "will"
  ],
  "sets": [
   {
    "ko": "영어를 할 수 있는 사람을 알다",
    "v": "know the person who can speak English",
    "past": "knew the person who can speak English",
    "pp": "known the person who can speak English"
   },
   {
    "ko": "우리가 만난 장소를 알다",
    "v": "know the place where we met",
    "past": "knew the place where we met",
    "pp": "known the place where we met"
   },
   {
    "ko": "그가 추천한 책을 사다",
    "v": "buy the book that he recommended",
    "past": "bought the book that he recommended",
    "pp": "bought the book that he recommended"
   },
   {
    "ko": "그가 한 말을 이해하다",
    "v": "understand what he said",
    "past": "understood what he said",
    "pp": "understood what he said"
   },
   {
    "ko": "그 이유를 그에게 말하다",
    "v": "tell him the reason",
    "past": "told him the reason",
    "pp": "told him the reason"
   }
  ],
  "note": "관계사 실력시험 — who / where / that / what 로 이어 말합니다."
 },
 "p4c8": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "갈 시간이 있다",
    "v": "have time to go",
    "past": "had time to go",
    "pp": "had time to go"
   },
   {
    "ko": "보고할 것이 있다",
    "v": "have something to report",
    "past": "had something to report",
    "pp": "had something to report"
   },
   {
    "ko": "영어로 쓰인 책을 읽다",
    "v": "read a book written in English",
    "past": "read a book written in English",
    "pp": "read a book written in English"
   },
   {
    "ko": "그것에 대해 들은 것이 있다",
    "v": "hear something about it",
    "past": "heard something about it",
    "pp": "heard something about it"
   },
   {
    "ko": "그 책을 영어로 읽다",
    "v": "read the book in English",
    "past": "read the book in English",
    "pp": "read the book in English"
   }
  ],
  "note": "형용사구 — to부정사·분사가 명사 뒤에서 꾸며 줍니다."
 },
 "p5c1": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "월요일에 시작하다",
    "v": "begin on Monday",
    "past": "began on Monday",
    "pp": "begun on Monday",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "3월에 한국에 오다",
    "v": "come to Korea in March",
    "past": "came to Korea in March",
    "pp": "come to Korea in March"
   },
   {
    "ko": "아침에 일어나다",
    "v": "get up in the morning",
    "past": "got up in the morning",
    "pp": "got up in the morning"
   },
   {
    "ko": "일요일까지 기다리다",
    "v": "wait until Sunday",
    "past": "waited until Sunday",
    "pp": "waited until Sunday"
   },
   {
    "ko": "몇 시에 시작하다",
    "v": "start",
    "past": "started",
    "pp": "started",
    "wh": "What time",
    "ans": "at nine",
    "subj": "it",
    "asub": "it"
   }
  ],
  "note": "시간의 전치사 — at / on / in / until 로 때를 붙입니다."
 },
 "p5c2": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "방에 있다",
    "v": "in the room",
    "past": "ined the room",
    "pp": "ined the room",
    "subj": "he",
    "asub": "he",
    "be": true
   },
   {
    "ko": "탁자 위에 있다",
    "v": "on the table",
    "past": "oned the table",
    "pp": "oned the table",
    "subj": "the book",
    "asub": "it",
    "be": true
   },
   {
    "ko": "탁자 아래에 있다",
    "v": "under the table",
    "past": "undered the table",
    "pp": "undered the table",
    "subj": "the cat",
    "asub": "it",
    "be": true
   },
   {
    "ko": "역 근처에 있다",
    "v": "near the station",
    "past": "neared the station",
    "pp": "neared the station",
    "subj": "the bank",
    "asub": "it",
    "be": true
   },
   {
    "ko": "공원에 있다",
    "v": "in the park",
    "past": "ined the park",
    "pp": "ined the park",
    "subj": "they",
    "asub": "they",
    "be": true
   }
  ],
  "note": "장소·방향의 전치사 — in / on / under / near 로 위치를 말합니다."
 },
 "p5c3": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "버스로 가다",
    "v": "go by bus",
    "past": "went by bus",
    "pp": "gone by bus"
   },
   {
    "ko": "연필로 쓰다",
    "v": "write it with a pencil",
    "past": "wrote it with a pencil",
    "pp": "written it with a pencil"
   },
   {
    "ko": "영어로 말하다",
    "v": "say it in English",
    "past": "said it in English",
    "pp": "said it in English"
   },
   {
    "ko": "전화로 그에게 연락하다",
    "v": "contact him by phone",
    "past": "contacted him by phone",
    "pp": "contacted him by phone"
   },
   {
    "ko": "산책으로 건강을 유지하다",
    "v": "keep fit through walking",
    "past": "kept fit through walking",
    "pp": "kept fit through walking"
   }
  ],
  "note": "수단·방법의 전치사 — by / with / in / through"
 },
 "p5c4": {
  "aux": [
   "be",
   "bep",
   "willbe"
  ],
  "sets": [
   {
    "ko": "3시에 있다",
    "v": "at three",
    "past": "ated three",
    "pp": "ated three",
    "subj": "the meeting",
    "asub": "it",
    "be": true
   },
   {
    "ko": "책상 위에 있다",
    "v": "on the desk",
    "past": "oned the desk",
    "pp": "oned the desk",
    "subj": "the document",
    "asub": "it",
    "be": true
   },
   {
    "ko": "그것에 관심이 있다",
    "v": "interested in it",
    "past": "interesteded in it",
    "pp": "interesteded in it",
    "be": true
   },
   {
    "ko": "한국 출신이다",
    "v": "from Korea",
    "past": "fromed Korea",
    "pp": "fromed Korea",
    "subj": "he",
    "asub": "he",
    "be": true
   },
   {
    "ko": "사무실에 있다",
    "v": "in the office",
    "past": "ined the office",
    "pp": "ined the office",
    "subj": "he",
    "asub": "he",
    "be": true
   }
  ],
  "note": "전치사 종합 — 시간·장소·상태를 be동사 문장으로 묻습니다."
 },
 "p5c5": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "보통 7시에 일어나다",
    "v": "get up at seven",
    "past": "got up at seven",
    "pp": "got up at seven",
    "mid": "usually"
   },
   {
    "ko": "가끔 영화를 보다",
    "v": "see a movie",
    "past": "saw a movie",
    "pp": "seen a movie",
    "mid": "sometimes"
   },
   {
    "ko": "자주 체육관에 가다",
    "v": "go to the gym",
    "past": "went to the gym",
    "pp": "gone to the gym",
    "mid": "often"
   },
   {
    "ko": "일주일에 한 번 운동하다",
    "v": "work out once a week",
    "past": "worked out once a week",
    "pp": "worked out once a week"
   },
   {
    "ko": "매일 영어를 공부하다",
    "v": "study English every day",
    "past": "studied English every day",
    "pp": "studied English every day"
   }
  ],
  "note": "부사구 100 — usually / sometimes / often 를 동사 앞에 넣습니다."
 },
 "p5c6": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "영어를 열심히 공부하다",
    "v": "study English hard",
    "past": "studied English hard",
    "pp": "studied English hard"
   },
   {
    "ko": "그 일을 아주 잘하다",
    "v": "do the work very well",
    "past": "did the work very well",
    "pp": "done the work very well"
   },
   {
    "ko": "그를 거의 모르다",
    "v": "hardly know him",
    "past": "hardly knew him",
    "pp": "hardly known him"
   },
   {
    "ko": "빠르게 달리다",
    "v": "run fast",
    "past": "ran fast",
    "pp": "run fast"
   },
   {
    "ko": "그에게 친절하게 말하다",
    "v": "speak to him kindly",
    "past": "spoke to him kindly",
    "pp": "spoken to him kindly"
   }
  ],
  "note": "문장 중앙·끝에 쓰는 부사 — hard / very well / hardly / fast / kindly"
 },
 "p5c7": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "그것을 잘 알다",
    "v": "know it well",
    "past": "knew it well",
    "pp": "known it well"
   },
   {
    "ko": "시간이 걸리다",
    "v": "take time",
    "past": "took time",
    "pp": "taken time",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "마음을 바꾸다",
    "v": "change his mind",
    "past": "changed his mind",
    "pp": "changed his mind",
    "subj": "he",
    "asub": "he"
   },
   {
    "ko": "그것을 명심하다",
    "v": "keep it in mind",
    "past": "kept it in mind",
    "pp": "kept it in mind"
   },
   {
    "ko": "말이 되다",
    "v": "make sense",
    "past": "made sense",
    "pp": "made sense",
    "subj": "it",
    "asub": "it"
   }
  ],
  "note": "관용구 100 — know it well / take time / keep it in mind / make sense"
 },
 "p5c8": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "보통 지하철로 출근하다",
    "v": "go to work by subway",
    "past": "went to work by subway",
    "pp": "gone to work by subway",
    "mid": "usually"
   },
   {
    "ko": "아침에 커피를 마시다",
    "v": "drink coffee in the morning",
    "past": "drank coffee in the morning",
    "pp": "drunk coffee in the morning"
   },
   {
    "ko": "그와 좋은 관계를 유지하다",
    "v": "keep a good relationship with him",
    "past": "kept a good relationship with him",
    "pp": "kept a good relationship with him"
   },
   {
    "ko": "그것을 그에게 설명하다",
    "v": "explain it to him",
    "past": "explained it to him",
    "pp": "explained it to him"
   },
   {
    "ko": "그렇게 생각하다",
    "v": "think so",
    "past": "thought so",
    "pp": "thought so"
   }
  ],
  "note": "5부 종합 — 전치사·부사구·관용구를 한 문장에 담아 말합니다."
 },
 "p6c1": {
  "aux": [
   "wouldliketo",
   "wantto",
   "will"
  ],
  "sets": [
   {
    "ko": "같이 점심을 먹다",
    "v": "have lunch together",
    "past": "had lunch together",
    "pp": "had lunch together"
   },
   {
    "ko": "한국 음식을 먹어 보다",
    "v": "try Korean food",
    "past": "tried Korean food",
    "pp": "tried Korean food",
    "only": [
     "do",
     "did",
     "can",
     "wantto"
    ]
   },
   {
    "ko": "지금 주문하다",
    "v": "order now",
    "past": "ordered now",
    "pp": "ordered now"
   },
   {
    "ko": "잠깐 쉬다",
    "v": "take a short break",
    "past": "took a short break",
    "pp": "taken a short break"
   },
   {
    "ko": "한국 식당에 가다",
    "v": "go to a Korean restaurant",
    "past": "went to a Korean restaurant",
    "pp": "gone to a Korean restaurant"
   }
  ],
  "note": "점심 — 권유는 Would you like to …? 로 시작합니다."
 },
 "p6c2": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "학교에 가다",
    "v": "go to school",
    "past": "went to school",
    "pp": "gone to school",
    "wh": "How",
    "ans": "by bus"
   },
   {
    "ko": "집에서 회사까지 걸리다",
    "v": "take",
    "past": "took",
    "pp": "taken",
    "wh": "How long",
    "ans": "about an hour",
    "subj": "it",
    "asub": "it"
   },
   {
    "ko": "몇 시에 집을 나서다",
    "v": "leave home",
    "past": "left home",
    "pp": "left home",
    "wh": "What time",
    "ans": "at seven"
   },
   {
    "ko": "걸어서 가다",
    "v": "go on foot",
    "past": "went on foot",
    "pp": "gone on foot"
   },
   {
    "ko": "지하철로 갈아타다",
    "v": "transfer to the subway",
    "past": "transferred to the subway",
    "pp": "transferred to the subway"
   }
  ],
  "note": "오고 가기 — How / What time / How long 으로 길과 시간을 묻습니다."
 },
 "p6c3": {
  "aux": [
   "wouldliketo",
   "wantto",
   "can"
  ],
  "sets": [
   {
    "ko": "영화를 보러 가다",
    "v": "go see a movie",
    "past": "went see a movie",
    "pp": "gone see a movie"
   },
   {
    "ko": "표 두 장을 예약하다",
    "v": "reserve two tickets",
    "past": "reserved two tickets",
    "pp": "reserved two tickets",
    "wh": "What time",
    "ans": "for the seven o'clock show"
   },
   {
    "ko": "뒷자리에 앉다",
    "v": "sit in the back",
    "past": "sat in the back",
    "pp": "sat in the back"
   },
   {
    "ko": "늦은 영화를 보다",
    "v": "see the late show",
    "past": "saw the late show",
    "pp": "seen the late show"
   }
  ],
  "note": "영화 보기 — Shall we …? 로 함께 할 일을 제안합니다."
 },
 "p6c4": {
  "aux": [
   "did",
   "do",
   "will",
   "wantto"
  ],
  "sets": [
   {
    "ko": "그것을 즐기다",
    "v": "enjoy it",
    "past": "enjoyed it",
    "pp": "enjoyed it"
   },
   {
    "ko": "그것을 다시 보다",
    "v": "see it again",
    "past": "saw it again",
    "pp": "seen it again"
   },
   {
    "ko": "그 배우를 좋아하다",
    "v": "like that actor",
    "past": "liked that actor",
    "pp": "liked that actor"
   },
   {
    "ko": "누구와 함께 보다",
    "v": "see it with",
    "past": "saw it with",
    "pp": "seen it with",
    "wh": "Who",
    "ans": "my friend"
   },
   {
    "ko": "그 영화를 좋아하다",
    "v": "like the movie",
    "past": "liked the movie",
    "pp": "liked the movie"
   }
  ],
  "note": "영화 감상 — Did you enjoy it? 으로 지난 일을 묻습니다."
 },
 "p6c5": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "어떻게 영어를 공부하다",
    "v": "study English",
    "past": "studied English",
    "pp": "studied English",
    "wh": "How",
    "ans": "by listening to the radio"
   },
   {
    "ko": "하루에 얼마나 공부하다",
    "v": "study",
    "past": "studied",
    "pp": "studied",
    "wh": "How long",
    "ans": "two hours a day"
   },
   {
    "ko": "하루에 몇 시간 공부하다",
    "v": "study",
    "past": "studied",
    "pp": "studied",
    "wh": "How many hours a day",
    "ans": "about two hours"
   },
   {
    "ko": "소리 내어 읽다",
    "v": "read aloud every day",
    "past": "read aloud every day",
    "pp": "read aloud every day"
   },
   {
    "ko": "계속 연습하다",
    "v": "keep practicing",
    "past": "kept practicing",
    "pp": "kept practicing"
   }
  ],
  "note": "영어 공부 — How / How long / How many hours 로 방법과 시간을 묻습니다."
 },
 "p6c6": {
  "aux": [
   "have",
   "will",
   "do",
   "goingto"
  ],
  "sets": [
   {
    "ko": "미국에 가 본 적이 있다",
    "v": "be to America",
    "past": "was to America",
    "pp": "been to America",
    "mid": "ever",
    "only": [
     "have"
    ]
   },
   {
    "ko": "언제 떠나다",
    "v": "leave",
    "past": "left",
    "pp": "left",
    "wh": "When",
    "ans": "next Monday",
    "only": [
     "will",
     "do",
     "goingto"
    ]
   },
   {
    "ko": "비행기 표를 예약하다",
    "v": "book the flight",
    "past": "booked the flight",
    "pp": "booked the flight"
   },
   {
    "ko": "얼마나 머무르다",
    "v": "stay",
    "past": "stayed",
    "pp": "stayed",
    "wh": "How long",
    "ans": "for two weeks",
    "only": [
     "will",
     "do",
     "goingto"
    ]
   },
   {
    "ko": "누구와 함께 가다",
    "v": "go with",
    "past": "went with",
    "pp": "gone with",
    "wh": "Who",
    "ans": "my brother"
   }
  ],
  "note": "미국여행 — Have you ever been …? 으로 경험을 묻습니다."
 },
 "p6c7": {
  "aux": [
   "do",
   "can",
   "could"
  ],
  "sets": [
   {
    "ko": "공항에서 호텔까지 가다",
    "v": "get to the hotel from the airport",
    "past": "got to the hotel from the airport",
    "pp": "got to the hotel from the airport",
    "wh": "How",
    "ans": "by taxi"
   },
   {
    "ko": "짐을 찾다",
    "v": "pick up the luggage",
    "past": "picked up the luggage",
    "pp": "picked up the luggage"
   },
   {
    "ko": "표를 사다",
    "v": "buy a ticket",
    "past": "bought a ticket",
    "pp": "bought a ticket",
    "wh": "Where",
    "ans": "at the counter"
   },
   {
    "ko": "걸어서 그곳에 가다",
    "v": "walk there",
    "past": "walked there",
    "pp": "walked there"
   },
   {
    "ko": "가장 빠른 길을 그에게 알려 주다",
    "v": "tell him the fastest way",
    "past": "told him the fastest way",
    "pp": "told him the fastest way"
   }
  ],
  "note": "미국여행 2 — 길과 표를 묻는 표현을 조동사로 돌려 말합니다."
 },
 "p6c8": {
  "aux": [
   "do",
   "did",
   "have"
  ],
  "sets": [
   {
    "ko": "어디서 오다",
    "v": "come from",
    "past": "came from",
    "pp": "come from",
    "wh": "Where",
    "ans": "Korea"
   },
   {
    "ko": "무슨 일을 하다",
    "v": "do for a living",
    "past": "did for a living",
    "pp": "done for a living",
    "wh": "What",
    "say": "I'm an engineer.",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "여기서 일하다",
    "v": "work here",
    "past": "worked here",
    "pp": "worked here"
   },
   {
    "ko": "그를 전에 만나다",
    "v": "meet him before",
    "past": "met him before",
    "pp": "met him before",
    "only": [
     "have",
     "did"
    ]
   },
   {
    "ko": "연락처를 그에게 알려 주다",
    "v": "give him the contact number",
    "past": "gave him the contact number",
    "pp": "given him the contact number"
   }
  ],
  "note": "초면 대화 — Where are you from? / What do you do? 로 시작합니다."
 },
 "p6c9": {
  "aux": [
   "do",
   "can",
   "did",
   "wantto"
  ],
  "sets": [
   {
    "ko": "외국 음식을 좋아하다",
    "v": "like foreign food",
    "past": "liked foreign food",
    "pp": "liked foreign food",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "매운 음식을 먹다",
    "v": "eat spicy food",
    "past": "ate spicy food",
    "pp": "eaten spicy food",
    "only": [
     "do",
     "did",
     "can"
    ]
   },
   {
    "ko": "술을 마시다",
    "v": "drink alcohol",
    "past": "drank alcohol",
    "pp": "drunk alcohol",
    "only": [
     "do",
     "did",
     "can"
    ]
   },
   {
    "ko": "한 잔 하다",
    "v": "have a drink",
    "past": "had a drink",
    "pp": "had a drink",
    "only": [
     "do",
     "did",
     "can",
     "wantto"
    ]
   },
   {
    "ko": "한국 음식을 먹어 보다",
    "v": "try Korean food",
    "past": "tried Korean food",
    "pp": "tried Korean food",
    "only": [
     "do",
     "did",
     "can",
     "wantto"
    ]
   }
  ],
  "note": "외국 음식·술 — 좋아하는지, 먹을 수 있는지, 한 잔 할지 묻습니다."
 },
 "p6c10": {
  "aux": [
   "do",
   "did",
   "will",
   "can"
  ],
  "sets": [
   {
    "ko": "어느 학교에 다니다",
    "v": "go to",
    "past": "went to",
    "pp": "gone to",
    "wh": "Which school",
    "ans": "Seoul High School"
   },
   {
    "ko": "무엇을 전공하다",
    "v": "major in",
    "past": "majored in",
    "pp": "majored in",
    "wh": "What",
    "ans": "economics",
    "only": [
     "do",
     "did",
     "will"
    ]
   },
   {
    "ko": "시험을 잘 보다",
    "v": "do well on the exam",
    "past": "did well on the exam",
    "pp": "done well on the exam"
   },
   {
    "ko": "동아리에 가입하다",
    "v": "join a club",
    "past": "joined a club",
    "pp": "joined a club"
   },
   {
    "ko": "방학 동안 무엇을 하다",
    "v": "do during vacation",
    "past": "did during vacation",
    "pp": "done during vacation",
    "wh": "What",
    "say": "I travel around the country.",
    "only": [
     "do"
    ]
   }
  ],
  "note": "학교 — Which school / What 으로 학교생활을 묻습니다."
 },
 "p6c11": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "어디서 일하다",
    "v": "work",
    "past": "worked",
    "pp": "worked",
    "wh": "Where",
    "ans": "at a bank"
   },
   {
    "ko": "그곳에서 무슨 일을 하다",
    "v": "do there",
    "past": "did there",
    "pp": "done there",
    "wh": "What",
    "say": "I handle loans.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "야근을 하다",
    "v": "work overtime",
    "past": "worked overtime",
    "pp": "worked overtime"
   },
   {
    "ko": "직장을 좋아하다",
    "v": "like the job",
    "past": "liked the job",
    "pp": "liked the job"
   },
   {
    "ko": "지하철로 출근하다",
    "v": "take the subway to work",
    "past": "took the subway to work",
    "pp": "taken the subway to work"
   }
  ],
  "note": "직업이 있다고 가정 — Where / What 으로 일을 묻습니다."
 },
 "p6c12": {
  "aux": [
   "have",
   "do",
   "did",
   "planto"
  ],
  "sets": [
   {
    "ko": "그 일을 하다",
    "v": "do the job",
    "past": "did the job",
    "pp": "done the job",
    "wh": "How long",
    "ans": "for five years"
   },
   {
    "ko": "사람들을 많이 만나다",
    "v": "meet many people",
    "past": "met many people",
    "pp": "met many people"
   },
   {
    "ko": "출장을 자주 가다",
    "v": "go on business trips often",
    "past": "went on business trips often",
    "pp": "gone on business trips often"
   },
   {
    "ko": "직업을 바꾸다",
    "v": "change jobs",
    "past": "changed jobs",
    "pp": "changed jobs"
   },
   {
    "ko": "일이 끝나면 무엇을 하다",
    "v": "do after work",
    "past": "did after work",
    "pp": "done after work",
    "wh": "What",
    "say": "I go to the gym after work.",
    "only": [
     "do",
     "did"
    ]
   }
  ],
  "note": "직업 2 — How long have you …? 으로 얼마나 했는지 묻습니다."
 },
 "p6c13": {
  "aux": [
   "do",
   "did",
   "planto",
   "wantto"
  ],
  "sets": [
   {
    "ko": "결혼하다",
    "v": "get married",
    "past": "got married",
    "pp": "got married"
   },
   {
    "ko": "어떤 사람을 만나고 싶다",
    "v": "meet",
    "past": "met",
    "pp": "met",
    "wh": "What kind of person",
    "ans": "a kind person"
   },
   {
    "ko": "데이트를 자주 하다",
    "v": "go on dates often",
    "past": "went on dates often",
    "pp": "gone on dates often"
   },
   {
    "ko": "혼자 살다",
    "v": "live alone",
    "past": "lived alone",
    "pp": "lived alone"
   },
   {
    "ko": "부모님이 결혼을 재촉하다",
    "v": "urge you to marry",
    "past": "urged you to marry",
    "pp": "urged you to marry",
    "subj": "your parents",
    "asub": "they",
    "agr": "pl",
    "flip": true,
    "only": [
     "do",
     "did"
    ]
   }
  ],
  "note": "결혼(미혼) — Are you married? 대신 plan to / want to 로 묻습니다."
 },
 "p6c14": {
  "aux": [
   "do",
   "did",
   "will"
  ],
  "sets": [
   {
    "ko": "언제 결혼하다",
    "v": "get married",
    "past": "got married",
    "pp": "got married",
    "wh": "When",
    "ans": "in 2010"
   },
   {
    "ko": "아이가 있다",
    "v": "have children",
    "past": "had children",
    "pp": "had children"
   },
   {
    "ko": "집안일을 돕다",
    "v": "help with the housework",
    "past": "helped with the housework",
    "pp": "helped with the housework"
   },
   {
    "ko": "가족과 함께 살다",
    "v": "live with the family",
    "past": "lived with the family",
    "pp": "lived with the family"
   },
   {
    "ko": "주말에 가족과 무엇을 하다",
    "v": "do on weekends",
    "past": "did on weekends",
    "pp": "done on weekends",
    "wh": "What",
    "say": "I go hiking with my family.",
    "only": [
     "do"
    ]
   }
  ],
  "note": "결혼(기혼) — When did you get married? 로 가정을 묻습니다."
 },
 "p6c15": {
  "aux": [
   "have",
   "do",
   "did",
   "can"
  ],
  "sets": [
   {
    "ko": "그를 알다",
    "v": "know him",
    "past": "knew him",
    "pp": "known him",
    "wh": "How long",
    "ans": "for ten years",
    "only": [
     "have"
    ]
   },
   {
    "ko": "그를 어떻게 만나다",
    "v": "meet him",
    "past": "met him",
    "pp": "met him",
    "wh": "How",
    "ans": "at university",
    "only": [
     "did",
     "do"
    ]
   },
   {
    "ko": "자주 만나다",
    "v": "meet often",
    "past": "met often",
    "pp": "met often",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "그에게 무엇이든 말하다",
    "v": "tell him anything",
    "past": "told him anything",
    "pp": "told him anything",
    "only": [
     "can"
    ]
   },
   {
    "ko": "그와 다툰 적이 있다",
    "v": "quarrel with him",
    "past": "quarreled with him",
    "pp": "quarreled with him",
    "mid": "ever",
    "only": [
     "have"
    ]
   }
  ],
  "note": "친한 친구 — How long have you known him? 으로 오랜 관계를 묻습니다."
 },
 "p6c16": {
  "aux": [
   "do",
   "did",
   "be",
   "bep"
  ],
  "sets": [
   {
    "ko": "정치에 관심이 있다",
    "v": "interested in politics",
    "past": "interesteded in politics",
    "pp": "interesteded in politics",
    "be": true,
    "only": [
     "be",
     "bep"
    ]
   },
   {
    "ko": "복지 제도가 있다",
    "v": "have a welfare system",
    "past": "had a welfare system",
    "pp": "had a welfare system",
    "subj": "your country",
    "asub": "it",
    "agr": "sg",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "뉴스를 자주 보다",
    "v": "watch the news often",
    "past": "watched the news often",
    "pp": "watched the news often",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "세금이 높다",
    "v": "high",
    "past": "highed",
    "pp": "highed",
    "subj": "the taxes",
    "asub": "they",
    "agr": "pl",
    "be": true,
    "only": [
     "be",
     "bep"
    ]
   },
   {
    "ko": "선거가 언제이다",
    "v": "",
    "wh": "When",
    "ans": "next April",
    "subj": "the election",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   }
  ],
  "note": "국무(정치) — be동사 문장과 일반동사 문장을 함께 돌려 말합니다."
 },
 "p6c17": {
  "aux": [
   "do",
   "have",
   "did",
   "wantto"
  ],
  "sets": [
   {
    "ko": "여행을 좋아하다",
    "v": "like traveling",
    "past": "liked traveling",
    "pp": "liked traveling",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "어디를 여행하다",
    "v": "travel",
    "past": "traveled",
    "pp": "traveled",
    "wh": "Where",
    "ans": "in Europe",
    "only": [
     "have"
    ]
   },
   {
    "ko": "혼자 여행하다",
    "v": "travel alone",
    "past": "traveled alone",
    "pp": "traveled alone",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "사진을 많이 찍다",
    "v": "take many pictures",
    "past": "took many pictures",
    "pp": "taken many pictures",
    "only": [
     "do",
     "did"
    ]
   },
   {
    "ko": "다음에 어디에 가고 싶다",
    "v": "go",
    "past": "went",
    "pp": "gone",
    "wh": "Where",
    "ans": "to Japan",
    "only": [
     "wantto"
    ]
   }
  ],
  "note": "여행 — Where have you traveled? 로 다녀온 곳을 묻습니다."
 },
 "p6c18": {
  "aux": [
   "do",
   "will",
   "be"
  ],
  "sets": [
   {
    "ko": "비가 자주 오다",
    "v": "rain often",
    "past": "rained often",
    "pp": "rained often",
    "subj": "it",
    "asub": "it",
    "only": [
     "do",
     "will"
    ]
   },
   {
    "ko": "겨울에 눈이 많이 오다",
    "v": "snow a lot in winter",
    "past": "snowed a lot in winter",
    "pp": "snowed a lot in winter",
    "subj": "it",
    "asub": "it",
    "only": [
     "do",
     "will"
    ]
   },
   {
    "ko": "내일 비가 오다",
    "v": "rain tomorrow",
    "past": "rained tomorrow",
    "pp": "rained tomorrow",
    "subj": "it",
    "asub": "it",
    "only": [
     "will"
    ]
   },
   {
    "ko": "어떤 계절을 가장 좋아하다",
    "v": "like",
    "past": "liked",
    "pp": "liked",
    "wh": "Which season",
    "ans": "spring best",
    "only": [
     "do",
     "will"
    ]
   },
   {
    "ko": "오늘 날씨가 어떻다",
    "v": "",
    "wh": "How",
    "ans": "sunny",
    "subj": "the weather today",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   }
  ],
  "note": "기후와 날씨 — it 을 주어로 비·눈·날씨를 묻습니다."
 },
 "p6c19": {
  "aux": [
   "do",
   "can",
   "could",
   "will"
  ],
  "sets": [
   {
    "ko": "무역 회사에서 일하다",
    "v": "work for a trading company",
    "past": "worked for a trading company",
    "pp": "worked for a trading company"
   },
   {
    "ko": "주로 무엇을 수출하다",
    "v": "export",
    "past": "exported",
    "pp": "exported",
    "wh": "What",
    "say": "We export electronics."
   },
   {
    "ko": "견적서를 보내다",
    "v": "send a quotation",
    "past": "sent a quotation",
    "pp": "sent a quotation"
   },
   {
    "ko": "샘플을 받다",
    "v": "get samples",
    "past": "got samples",
    "pp": "got samples"
   },
   {
    "ko": "계약서를 검토하다",
    "v": "review the contract",
    "past": "reviewed the contract",
    "pp": "reviewed the contract"
   }
  ],
  "note": "상담(무역) — What do you export? / Could you send …? 로 묻습니다."
 },
 "p6c20": {
  "aux": [
   "would",
   "do",
   "will",
   "be"
  ],
  "sets": [
   {
    "ko": "그것을 좋아하다",
    "v": "like it",
    "past": "liked it",
    "pp": "liked it",
    "only": [
     "do"
    ]
   },
   {
    "ko": "지금 가다",
    "v": "go now",
    "past": "went now",
    "pp": "gone now",
    "only": [
     "would",
     "do",
     "will"
    ]
   },
   {
    "ko": "커피를 마시다",
    "v": "have some coffee",
    "past": "had some coffee",
    "pp": "had some coffee",
    "only": [
     "would",
     "will"
    ]
   },
   {
    "ko": "그와 함께 가다",
    "v": "come with him",
    "past": "came with him",
    "pp": "come with him",
    "only": [
     "would",
     "will"
    ]
   },
   {
    "ko": "내일 시간이 있다",
    "v": "free tomorrow",
    "past": "freed tomorrow",
    "pp": "freed tomorrow",
    "be": true,
    "only": [
     "be"
    ]
   }
  ],
  "note": "YES·NO 외의 대답 — 권유·가능·상태를 묻고 다르게 답합니다."
 },
 "p6c21": {
  "aux": [
   "have",
   "did",
   "do",
   "can"
  ],
  "sets": [
   {
    "ko": "그를 오래 알다",
    "v": "know him",
    "past": "knew him",
    "pp": "known him",
    "wh": "How long",
    "ans": "for ten years",
    "only": [
     "have"
    ]
   },
   {
    "ko": "그를 전에 만나다",
    "v": "meet him before",
    "past": "met him before",
    "pp": "met him before",
    "only": [
     "have",
     "did"
    ]
   },
   {
    "ko": "최근에 그를 보다",
    "v": "see him recently",
    "past": "saw him recently",
    "pp": "seen him recently",
    "only": [
     "have",
     "did"
    ]
   },
   {
    "ko": "그와 함께 일하다",
    "v": "work with him",
    "past": "worked with him",
    "pp": "worked with him"
   },
   {
    "ko": "그를 소개하다",
    "v": "introduce him",
    "past": "introduced him",
    "pp": "introduced him"
   }
  ],
  "note": "인사·소개 — How long have you known him? 으로 안부를 묻습니다."
 },
 "p6c22": {
  "aux": [
   "do",
   "can",
   "could"
  ],
  "sets": [
   {
    "ko": "더 큰 사이즈가 있다",
    "v": "have a bigger size",
    "past": "had a bigger size",
    "pp": "had a bigger size",
    "only": [
     "do"
    ]
   },
   {
    "ko": "카드로 계산하다",
    "v": "pay by card",
    "past": "paid by card",
    "pp": "paid by card"
   },
   {
    "ko": "환불을 받다",
    "v": "get a refund",
    "past": "got a refund",
    "pp": "got a refund"
   },
   {
    "ko": "그것을 입어 보다",
    "v": "try it on",
    "past": "tried it on",
    "pp": "tried it on"
   },
   {
    "ko": "봉투를 받다",
    "v": "get a bag",
    "past": "got a bag",
    "pp": "got a bag"
   }
  ],
  "note": "장보기 — 사이즈·계산·환불을 묻는 표현입니다."
 },
 "p6c23": {
  "aux": [
   "did",
   "can",
   "have",
   "do"
  ],
  "sets": [
   {
    "ko": "왜 이 회사에 지원하다",
    "v": "apply for this company",
    "past": "applied for this company",
    "pp": "applied for this company",
    "wh": "Why",
    "say": "I like this field.",
    "only": [
     "did",
     "have",
     "do"
    ]
   },
   {
    "ko": "언제부터 일할 수 있다",
    "v": "start working",
    "past": "started working",
    "pp": "started working",
    "wh": "When",
    "ans": "next month"
   },
   {
    "ko": "무슨 일을 해 보다",
    "v": "do",
    "past": "did",
    "pp": "done",
    "wh": "What kind of work",
    "say": "I've done sales.",
    "only": [
     "have"
    ]
   },
   {
    "ko": "질문이 있다",
    "v": "have some questions",
    "past": "had some questions",
    "pp": "had some questions",
    "only": [
     "do",
     "did",
     "have"
    ]
   },
   {
    "ko": "그 회사에 대해 아는 것이 있다",
    "v": "know about the company",
    "past": "knew about the company",
    "pp": "known about the company",
    "only": [
     "do",
     "did"
    ]
   }
  ],
  "note": "취직 인터뷰 — 지원 동기·경력·시작 시점을 묻습니다."
 },
 "p6c24": {
  "aux": [
   "have",
   "will",
   "do",
   "planto"
  ],
  "sets": [
   {
    "ko": "얼마나 공부할 겁니까",
    "v": "study",
    "past": "studied",
    "pp": "studied",
    "wh": "How long",
    "ans": "for two years"
   },
   {
    "ko": "어느 학교에 갈 예정입니까",
    "v": "attend",
    "past": "attended",
    "pp": "attended",
    "wh": "Which school",
    "ans": "NYU"
   },
   {
    "ko": "영어를 얼마나 공부했습니까",
    "v": "study English",
    "past": "studied English",
    "pp": "studied English",
    "wh": "How long",
    "ans": "for three years"
   },
   {
    "ko": "한국으로 돌아올 예정입니까",
    "v": "return to Korea",
    "past": "returned to Korea",
    "pp": "returned to Korea"
   },
   {
    "ko": "영어 시험 점수가 있습니까",
    "v": "have a test score",
    "past": "had a test score",
    "pp": "had a test score"
   }
  ],
  "note": "유학 인터뷰 — 공부 기간·학교·귀국 계획을 묻습니다."
 },
 "p6c25": {
  "aux": [
   "dont",
   "didnt",
   {
    "id": "tagare",
    "label": "aren't you?",
    "tense": "부가 의문"
   },
   {
    "id": "tagdoes",
    "label": "does she?",
    "tense": "부가 의문"
   }
  ],
  "sets": [
   {
    "ko": "커피를 좋아하다",
    "v": "like coffee",
    "past": "liked coffee",
    "pp": "liked coffee",
    "only": [
     "dont",
     "didnt"
    ]
   },
   {
    "ko": "그것을 어제 사다",
    "v": "buy it",
    "past": "bought it",
    "pp": "bought it",
    "only": [
     "didnt"
    ]
   },
   {
    "ko": "그것을 원하다",
    "v": "want it",
    "past": "wanted it",
    "pp": "wanted it",
    "only": [
     "dont"
    ]
   },
   {
    "ko": "당신은 의사이다",
    "v": "",
    "only": [
     "tagare"
    ],
    "forms": {
     "tagare": {
      "q": "You are a doctor, aren't you?",
      "yes": "Yes, I am.",
      "no": "No, I'm not."
     }
    }
   },
   {
    "ko": "오늘 바쁘다",
    "v": "",
    "only": [
     "tagare"
    ],
    "forms": {
     "tagare": {
      "q": "You aren't busy today, are you?",
      "yes": "No, I'm not.",
      "no": "Yes, I am."
     }
    }
   },
   {
    "ko": "그녀가 여기 살다",
    "v": "",
    "only": [
     "tagdoes"
    ],
    "forms": {
     "tagdoes": {
      "q": "She doesn't live here, does she?",
      "yes": "No, she doesn't.",
      "no": "Yes, she does."
     }
    }
   },
   {
    "ko": "그가 여기서 일하다",
    "v": "",
    "only": [
     "tagdoes"
    ],
    "forms": {
     "tagdoes": {
      "q": "He works here, doesn't he?",
      "yes": "Yes, he does.",
      "no": "No, he doesn't."
     }
    }
   }
  ],
  "note": "부정 의문문은 Don't you …? / 부가 의문문은 「…, aren't you?」로 말합니다."
 },
 "p6c26": {
  "aux": [
   "may",
   "would",
   "will",
   "wouldliketo"
  ],
  "sets": [
   {
    "ko": "김 씨와 통화하다",
    "v": "",
    "only": [
     "may"
    ],
    "forms": {
     "may": {
      "q": "May I speak to Mr. Kim?",
      "yes": "Yes, hold on a moment.",
      "no": "Sorry, he is out."
     }
    }
   },
   {
    "ko": "잠시 기다리다",
    "v": "hold on a moment",
    "past": "held on a moment",
    "pp": "held on a moment",
    "only": [
     "would",
     "will"
    ]
   },
   {
    "ko": "메시지를 남기다",
    "v": "leave a message",
    "past": "left a message",
    "pp": "left a message",
    "only": [
     "wouldliketo",
     "would",
     "will"
    ]
   },
   {
    "ko": "나중에 다시 전화하다",
    "v": "call back later",
    "past": "called back later",
    "pp": "called back later",
    "only": [
     "will",
     "would"
    ]
   },
   {
    "ko": "전화를 끊다",
    "v": "hang up now",
    "past": "hung up now",
    "pp": "hung up now",
    "only": [
     "will"
    ]
   }
  ],
  "note": "전화 대화 — May I …? / Would you …? 로 통화를 시작합니다."
 },
 "p6c27": {
  "aux": [
   "be",
   "did",
   "will",
   "could"
  ],
  "sets": [
   {
    "ko": "김 사장님 댁이다",
    "v": "the home of Mr. Kim",
    "past": "thed home of Mr. Kim",
    "pp": "thed home of Mr. Kim",
    "subj": "this",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   },
   {
    "ko": "몇 번으로 걸다",
    "v": "dial",
    "past": "dialed",
    "pp": "dialed",
    "wh": "What number",
    "ans": "123-4567",
    "only": [
     "did"
    ]
   },
   {
    "ko": "그분이 언제 돌아오다",
    "v": "be back",
    "past": "was back",
    "pp": "been back",
    "wh": "When",
    "ans": "in an hour",
    "subj": "he",
    "asub": "he",
    "only": [
     "will"
    ]
   },
   {
    "ko": "다시 전화하다",
    "v": "call again",
    "past": "called again",
    "pp": "called again",
    "only": [
     "could",
     "will"
    ]
   },
   {
    "ko": "전화를 잘못 걸다",
    "v": "dial the wrong number",
    "past": "dialed the wrong number",
    "pp": "dialed the wrong number",
    "only": [
     "did"
    ]
   }
  ],
  "note": "전화 문답 — 댁입니까? / 몇 번으로 걸었습니까? 를 묻습니다."
 },
 "p6c28": {
  "aux": [
   "do",
   "can",
   "be",
   "haveto"
  ],
  "sets": [
   {
    "ko": "공중전화가 어디에 있다",
    "v": "",
    "wh": "Where",
    "ans": "near the station",
    "subj": "a public phone",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   },
   {
    "ko": "동전을 넣다",
    "v": "put in coins",
    "past": "put in coins",
    "pp": "put in coins",
    "only": [
     "haveto",
     "do"
    ]
   },
   {
    "ko": "카드로도 걸다",
    "v": "use a card",
    "past": "used a card",
    "pp": "used a card",
    "only": [
     "can"
    ]
   },
   {
    "ko": "시내 전화 요금이 얼마이다",
    "v": "",
    "wh": "How much",
    "ans": "fifty cents",
    "subj": "a local call",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   },
   {
    "ko": "국제 전화를 걸다",
    "v": "make an international call",
    "past": "made an international call",
    "pp": "made an international call",
    "only": [
     "can",
     "do"
    ]
   }
  ],
  "note": "공중전화 — 동전·카드·시내 전화 요금을 묻습니다."
 },
 "p6c29": {
  "aux": [
   "do",
   "did",
   "will",
   "have",
   "be"
  ],
  "sets": [
   {
    "ko": "어디에 살다",
    "v": "live",
    "past": "lived",
    "pp": "lived",
    "wh": "Where",
    "ans": "in Seoul",
    "only": [
     "do",
     "did",
     "will"
    ]
   },
   {
    "ko": "무슨 일을 하다",
    "v": "do",
    "past": "did",
    "pp": "done",
    "wh": "What",
    "say": "I'm an office worker.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "취미가 무엇이다",
    "v": "",
    "wh": "What",
    "ans": "reading",
    "subj": "your hobby",
    "asub": "it",
    "be": true,
    "only": [
     "be"
    ]
   },
   {
    "ko": "영어를 얼마나 공부하다",
    "v": "study English",
    "past": "studied English",
    "pp": "studied English",
    "wh": "How long",
    "ans": "for three years",
    "only": [
     "have"
    ]
   },
   {
    "ko": "왜 영어를 공부하다",
    "v": "study English",
    "past": "studied English",
    "pp": "studied English",
    "wh": "Why",
    "say": "Because I need it for work.",
    "only": [
     "do"
    ]
   },
   {
    "ko": "하고 싶은 말이 있다",
    "v": "have something to say",
    "past": "had something to say",
    "pp": "had something to say",
    "only": [
     "do",
     "did"
    ]
   }
  ],
  "note": "최종 종합 — 이름·사는 곳·직업·취미·공부 기간을 차례로 묻습니다."
 }
};
