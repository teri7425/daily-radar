# -*- coding: utf-8 -*-
"""SceneLoop 콘텐츠 원본 → data.json 생성.
각 줄: (화자, 영어, 한국어, 시작초, 강조 표현, 한국어 해설)
시작초는 유튜브 스크립트 패널의 큐 시작값을 기준으로 하고,
한 큐에 여러 대사가 있을 때는 말의 길이에 맞춰 나눠 적었다.
"""
import json, re

SHOWS = [
    {
        "id": "friends", "name": "프렌즈", "nameEn": "Friends",
        "tag": "US · 일상회화", "region": "미국", "season": "Season 1–10",
        "accent": "en-US", "emoji": "☕", "hue": "#f59e0b",
        "desc": "미국식 구어체, 리액션, 일상 필수 이디엄",
        "tip": "짧은 대사가 많아 처음 시작하기 좋아요. 리액션 표현을 통째로 외워 보세요.",
    },
    {
        "id": "modern_family", "name": "모던 패밀리", "nameEn": "Modern Family",
        "tag": "US · 빠른 템포", "region": "미국", "season": "Season 1–11",
        "accent": "en-US", "emoji": "🏠", "hue": "#38bdf8",
        "desc": "가족·직장 실생활 표현, 재치 있는 미국식 유머",
        "tip": "말이 빠르고 겹쳐요. 0.8배속으로 문장을 나눠 듣는 게 좋아요.",
    },
    {
        "id": "sex_education", "name": "오티스의 비밀 상담소", "nameEn": "Sex Education",
        "tag": "UK · 영국 영어", "region": "영국", "season": "Season 1–4",
        "accent": "en-GB", "emoji": "🎓", "hue": "#a78bfa",
        "desc": "영국식 억양과 10대 구어체, 감정 표현의 밀도",
        "tip": "영국 억양은 기본값이 🇬🇧로 맞춰져 있어요. 톤과 모음이 미국식과 달라요.",
    },
]

CLIPS = [
    {
        "id": "friends_atm",
        "show": "friends",
        "videoId": "h8rxZNIjC0U",
        "title": "ATM 안에서 모델과 단둘이 갇히다",
        "titleEn": "Chandler Is Stuck in an ATM Vestibule with a Model",
        "channel": "Friends",
        "episode": "S01E07 · The One with the Blackout",
        "duration": 239,
        "lines": [
            ("챈들러", "Oh my God, it's her. It's Jill Goodacre.", "맙소사, 저 사람이야. 질 굿에이커잖아.", 17, "Oh my God", "놀람·충격을 나타내는 가장 흔한 감탄 표현. 'Oh my gosh'로 순화하기도 해요."),
            ("챈들러", "I am trapped in an ATM vestibule with Jill Goodacre.", "난 지금 질 굿에이커와 ATM 부스에 갇혔어.", 28, "trapped in", "'~에 갇히다'. 물리적 공간뿐 아니라 상황·대화에도 씁니다."),
            ("챈들러", "Yeah, I'm fine. I'm just stuck at the bank. In an ATM vestibule.", "응, 괜찮아. 그냥 은행에 갇혔어. ATM 부스에.", 42, "stuck at", "'~에서 꼼짝 못 하다'. stuck은 '막힌·갇힌' 상태를 말해요."),
            ("챈들러", "Jill says vestibule. I'm going with vestibule.", "질이 '베스티뷸'이라고 했으니 나도 베스티뷸로 갈게.", 47, "going with", "'~쪽으로 정하다·따르다'. 상대의 표현을 따라 말할 때 씁니다."),
            ("질", "Would you like some gum?", "껌 좀 드실래요?", 73, "Would you like", "정중한 권유 표현. 'Do you want'보다 공손합니다."),
            ("챈들러", "Oh, is it sugarless?", "아, 무설탕인가요?", 74, "sugarless", "'무설탕의'. -less는 '~이 없는'을 만드는 접미사예요."),
            ("챈들러", "Mental note: if Jill Goodacre offers you gum, you take it.", "마음속 메모: 질 굿에이커가 껌을 주면 무조건 받아라.", 84, "Mental note", "'머릿속에 적어 두기'. 나중에 기억할 것을 혼잣말로 정리할 때 씁니다."),
            ("챈들러", "You know, on second thought, gum would be perfection.", "있잖아, 생각해 보니 껌이 딱 좋겠어.", 93, "on second thought", "'다시 생각해 보니'. 말을 바꿀 때 쓰는 연결 표현이에요."),
            ("챈들러", "Gum would be perfection. Could have said 'gum would be nice.'", "'껌이 완벽하겠어'라니. '껌 좋겠다'라고 하면 될 걸.", 100, "Could have said", "'~라고 말할 수도 있었는데'. 후회를 담은 가정 표현입니다."),
            ("챈들러", "Blow a bubble. A bubble's good. It's got a boyish charm.", "풍선을 불어라. 풍선이 좋아. 소년 같은 매력이 있잖아.", 114, "boyish charm", "'소년 같은 매력'. -ish가 '~다운'의 느낌을 더합니다."),
            ("챈들러", "This is not my gum.", "이건 내 껌이 아니야.", 156, "not my", "내 것이 아님을 강조하는 짧은 부정문이에요."),
            ("질", "Oh my God. You're choking!", "맙소사! 기도 막혔잖아요!", 168, "choking", "'질식하다·목에 걸리다'. 음식이 목에 걸렸을 때 씁니다."),
            ("챈들러", "Yes. Thank you. That was... that was perfection.", "네. 고마워요. 방금 그건… 정말 완벽했어요.", 176, "that was perfection", "앞서 쓴 perfection을 되받아 쓰는 유머. 같은 단어를 반복해 웃음을 만듭니다."),
            ("질", "Chandler, I had a great blackout. See you.", "챈들러, 즐거운 정전이었어요. 또 봐요.", 197, "See you", "가볍게 헤어질 때 쓰는 인사. 'See you later'의 줄임이에요."),
        ],
    },
    {
        "id": "friends_tan",
        "show": "friends",
        "videoId": "hc1C0I6x3lI",
        "title": "로스, 셀프 태닝 기계에서 대참사",
        "titleEn": "Ross Gets a Spray Tan",
        "channel": "Friends",
        "episode": "S10E03 · The One with Ross's Tan",
        "duration": 283,
        "lines": [
            ("직원", "All right, Mr. Geller, right this way.", "좋아요, 겔러 씨. 이쪽으로 오세요.", 2, "right this way", "'이쪽으로 오세요'라는 안내 표현. 매장·식당에서 자주 듣습니다."),
            ("직원", "So how dark do you want to be? We have one, two, or three.", "얼마나 어둡게 하실래요? 1, 2, 3단계가 있어요.", 5, "how dark", "정도를 묻는 how + 형용사 패턴입니다."),
            ("로스", "Well, I like how you look. What are you? Puerto Rican?", "음, 당신 피부가 좋은데. 뭐세요? 푸에르토리코 사람?", 9, "What are you?", "외모·출신을 물을 때 쓰는 직설적 표현. 실제로는 무례할 수 있어요."),
            ("직원", "You're gonna face the red light. When the red light goes on, the spray's about to start.", "빨간 불 쪽을 보고 서세요. 빨간 불이 켜지면 분사가 시작돼요.", 19, "about to", "'막 ~하려고 하다'. 바로 앞의 일을 알릴 때 씁니다."),
            ("직원", "When the spray stops, count to five, pat yourself down, then turn around.", "분사가 멈추면 5까지 세고, 몸을 두드려 물방울을 정리한 뒤 돌아서세요.", 24, "pat yourself down", "'몸을 가볍게 두드리다'. pat은 손바닥으로 톡톡 치는 동작이에요."),
            ("로스", "Spray, count, pat, and turn.", "분사, 세기, 두드리기, 돌기.", 31, "count", "'수를 세다'. 동작을 요약해 되짚을 때 동사원형으로 나열합니다."),
            ("직원", "Wow, you catch on quick.", "와, 이해가 빠르시네요.", 33, "catch on quick", "'이해가 빠르다·눈치가 빠르다'. catch on은 요령을 파악한다는 뜻."),
            ("로스", "Well, I have a PhD.", "뭐, 박사 학위가 있거든요.", 36, "Well", "말을 시작하며 완충하는 감탄사. 겸손과 자랑 사이의 뉘앙스를 만듭니다."),
            ("로스", "One Mississippi, two Mississippi, three—", "원 미시시피, 투 미시시피, 쓰리—", 63, "Mississippi", "'미시시피'를 넣어 세는 미국식 방법. 1초보다 길게 세기 위한 장치예요."),
            ("로스", "I'm not finished counting!", "아직 다 안 셌어요!", 69, "finished", "'끝낸'. be finished는 '끝난 상태'를 말합니다."),
            ("로스", "No, I barely even got to three Mississippi.", "아뇨, 겨우 3까지 갔어요.", 79, "barely", "'간신히·거의 ~못하다'. 부정적 뉘앙스를 담습니다."),
            ("직원", "Ain't that bad yet, but it keeps getting darker for the next four hours.", "지금은 그렇게 심하진 않은데, 앞으로 네 시간 더 어두워져요.", 87, "keeps getting", "'계속 ~해지다'. keep + -ing는 변화가 이어진다는 뜻."),
            ("직원", "Yeah, but your back's a zero. You're gonna want to even that out.", "그런데 등은 0단계예요. 그것도 맞춰서 균형을 잡아야 해요.", 95, "even that out", "'고르게 맞추다'. even out은 차이를 없애는 것."),
            ("레이첼", "Was that place the sun?", "그 장소가 혹시 '태양'이었어?", 163, "Was that", "과거 사실을 되짚어 묻는 be동사 의문문. 여기선 농담의 핵심이에요."),
            ("모니카", "How could you mess this up? It's so easy.", "이걸 어떻게 망칠 수가 있어? 이렇게 쉬운데.", 180, "mess this up", "'일을 망치다'. mess up은 실수로 엉망으로 만드는 것."),
            ("챈들러", "No. I just had to get a picture of this. I'll see you later.", "아니, 이 꼴을 사진으로 남겨야 해서. 나중에 보자.", 266, "get a picture", "'사진을 찍다'. take a picture와 함께 쓰이는 구어 표현이에요."),
        ],
    },
    {
        "id": "friends_unagi",
        "show": "friends",
        "videoId": "UPW3iSLPrPg",
        "title": "우나기(Unagi)는 총체적 자각 상태",
        "titleEn": "Unagi",
        "channel": "Friends",
        "episode": "S06E17 · The One with Unagi",
        "duration": 299,
        "lines": [
            ("조이", "What have you guys been up to?", "너희 뭐 하고 지냈어?", 2, "been up to", "'무엇을 하고 지내다'. 근황을 물을 때 쓰는 구어 표현."),
            ("모니카", "We went to a self-defense class today.", "우리 오늘 호신술 수업 들었어.", 7, "self-defense", "'호신술'. defend(방어하다)에서 나온 말이에요."),
            ("피비", "Kicking a guy in the crotch all morning really takes it out of you.", "아침 내내 남자 사타구니를 걷어차는 건 정말 기운을 쭉 빼.", 9, "takes it out of you", "'기운을 빼앗다·녹초가 되게 하다'. 힘든 일을 겪은 뒤 쓰는 표현."),
            ("레이첼", "What, you want to see me self-defend myself?", "뭐, 내가 날 지키는 걸 보고 싶어?", 14, "self-defend", "'스스로를 방어하다'. 실제로는 defend oneself가 더 자연스러운 형태예요."),
            ("로스", "Of course you could defend yourself from an attack you know is coming.", "당연히 올 줄 아는 공격은 막을 수 있겠지.", 24, "Of course", "'당연히'. 동의·양보를 강조할 때 문두에 씁니다."),
            ("로스", "That's not enough.", "그걸로는 충분하지 않아.", 30, "not enough", "'충분하지 않다'. 서운함·아쉬움을 담는 짧은 문장."),
            ("로스", "There's a concept you should really be familiar with.", "너희가 꼭 알아야 할 개념이 있어.", 34, "be familiar with", "'~에 익숙하다·잘 알다'. 지식·경험을 전제로 말합니다."),
            ("로스", "It's what the Japanese call unagi.", "일본 사람들이 '우나기'라고 부르는 거야.", 39, "what the Japanese call", "'일본 사람들이 ~라고 부르는 것'. what절로 용어를 소개하는 틀."),
            ("피비", "Isn't that a kind of sushi?", "그거 회 종류 아니야?", 41, "a kind of", "'~의 한 종류'. 종류를 묻거나 분류할 때 씁니다."),
            ("로스", "It's freshwater eel. All right, maybe it means that too.", "민물 장어야. 알았어, 그 뜻도 맞아.", 48, "freshwater", "'민물의'. 바닷물은 saltwater예요."),
            ("로스", "Unagi is a state of total awareness.", "우나기는 완전한 자각 상태야.", 65, "state of", "'~한 상태'. 감정·몸의 상태를 말할 때 쓰는 표현."),
            ("로스", "Only by achieving true unagi can you be prepared for any danger that may befall you.", "진정한 우나기를 얻어야만 어떤 위험에도 대비할 수 있어.", 73, "be prepared for", "'~에 대비하다'. 준비된 상태를 말합니다."),
            ("피비", "You mean in case someone's trying to steal your bamboo sleeping mat?", "혹시 누가 네 대나무 돗자리를 훔쳐 갈 경우를 말하는 거야?", 82, "in case", "'혹시 ~할 경우에 대비해'. if와 달리 대비의 뉘앙스가 있어요."),
            ("레이첼", "What the hell was that?", "방금 그게 대체 뭐야?", 136, "What the hell", "'대체 뭐야'. 짜증·당황을 실은 강조 표현."),
            ("로스", "I'm sorry I had to take such drastic measures to make my point.", "내 주장을 하려고 이렇게 과격한 방법을 써서 미안해.", 160, "drastic measures", "'과감한 조치'. measure는 '조치·수단'의 뜻이에요."),
            ("레이첼", "Oh my god, why is he jumping on those women?", "맙소사, 왜 저 여자들한테 뛰어드는 거야?", 270, "jumping on", "'~위로 뛰어오르다'. 전치사 on이 목적물을 붙여 줍니다."),
        ],
    },
    {
        "id": "mf_funparent",
        "show": "modern_family",
        "videoId": "ORfWypnbbyk",
        "title": "클레어, '재미있는 부모' 자리를 맡다",
        "titleEn": "Claire Takes Phil's Place as the \"Fun\" Parent",
        "channel": "Peacock",
        "episode": "S02E22 · Good Cop Bad Dog",
        "duration": 313,
        "lines": [
            ("클레어", "May I have a word with you, Phil?", "필, 잠깐 얘기 좀 할까요?", 8, "have a word with", "'~와 잠깐 이야기하다'. 주로 사적인 대화를 청할 때 씁니다."),
            ("클레어", "Phil, you sold me out behind my back.", "필, 당신이 내 뒤통수 쳤잖아요.", 16, "sold me out", "'배신하다·팔아넘기다'. sell out은 사람·신념을 버리는 것."),
            ("필", "Sometimes you can get a little intense, and I feel like I need to swoop in.", "가끔 당신이 좀 강해지니까, 내가 들어가서 달래야 할 것 같아서.", 18, "get a little intense", "'조금 강해지다·과해지다'. get + 형용사는 상태 변화."),
            ("필", "I need to swoop in and let the kids know they're still loved.", "내가 들어가서 애들한테 아직 사랑받고 있다고 알려 줘야 할 것 같아.", 21, "swoop in", "'훌쩍 들어가 구하다'. 새가 급강하하는 그림에서 온 말."),
            ("필", "Honey, these are just the parts that we're playing.", "여보, 이건 그냥 우리가 맡은 역할일 뿐이야.", 25, "the parts that we're playing", "'우리가 연기하는 배역'. 부부의 역할 분담을 연극에 비유했어요."),
            ("클레어", "I'm tired of being the bad cop.", "나 이제 나쁜 경찰 역할은 지쳤어.", 30, "the bad cop", "'나쁜 경찰'. good cop/bad cop은 부모의 훈육 역할 분담을 뜻하는 관용구예요."),
            ("클레어", "You need to discipline them sometime and let me swoop in with all the love.", "당신도 가끔은 혼내고, 나는 사랑으로 달래게 해 줘요.", 32, "discipline", "'훈육하다·혼내다'. 명사로는 '규율'입니다."),
            ("필", "Shouldn't we just stick with the stuff we're good at?", "그냥 우리가 잘하는 것만 하는 게 낫지 않아?", 36, "stick with", "'~을 계속 고수하다'. 함께 간다는 뉘앙스가 있어요."),
            ("클레어", "Oh, my God, this bathroom is disgusting.", "세상에, 이 화장실 너무 지저분해.", 36, "disgusting", "'역겨운·형편없는'. 불쾌함을 강하게 전달합니다."),
            ("클레어", "The girls told me they would clean it days ago.", "애들이 며칠 전에 치우겠다고 했어.", 40, "days ago", "'며칠 전'. ago는 기간 + ago 형태로만 씁니다."),
            ("클레어", "I can't yell at them about it one more time. Phil, you handle it.", "이걸로 또 소리칠 수는 없어. 필, 당신이 처리해요.", 44, "yell at", "'~에게 소리치다'. at이 화살표처럼 대상을 향합니다."),
            ("클레어", "You stay here, hound the girls about cleaning up this mess.", "당신은 여기 남아서 애들한테 이 엉망을 치우라고 계속 졸라요.", 54, "hound", "'끈질기게 조르다·몰아세우다'. 사냥개(hound)에서 온 동사예요."),
            ("클레어", "Hey, guys, guess who's taking you go-karting today?", "얘들아, 오늘 누가 너희 카트 태워 주러 가는지 맞혀 봐.", 70, "guess who", "'누군지 맞혀 봐'. 놀라게 할 때 쓰는 도입 표현."),
            ("루크", "Why? Are we in trouble?", "왜? 우리 혼나는 거야?", 73, "in trouble", "'곤란한·혼날 상황인'. 문제에 휘말린 상태를 말해요."),
            ("클레어", "Today's just all about having fun.", "오늘은 그냥 신나게 노는 날이야.", 78, "all about", "'~가 전부인'. 그날의 주제를 강조하는 구어 표현."),
            ("필", "And because I'm your dad and I'm older than you. And I call the shots around here.", "왜냐면 내가 너희 아빠고 너희보다 나이가 많으니까. 그리고 여기선 내가 결정해.", 131, "call the shots", "'결정권을 쥐다·지시하다'. 사격 지휘에서 온 관용구예요."),
            ("필", "Note to Claire: if you want intense family drama, rent Spy Kids.", "클레어에게 한마디: 진한 가족 드라마가 보고 싶으면 '스파이 키즈'를 빌려 봐.", 177, "Note to", "'~에게 남기는 메모'. 농담조로 충고할 때 씁니다."),
            ("필", "You are not a good bad cop.", "당신은 나쁜 경찰을 잘 못해.", 270, "good bad cop", "good cop/bad cop을 비틀어 '나쁜 경찰 연기를 잘한다'는 뜻으로 만든 말장난."),
            ("필", "And I am a very bad, good cop.", "그리고 나는 아주 형편없는 좋은 경찰이야.", 279, "very bad", "'아주 못하는'. good과 대비해 아이러니를 만듭니다."),
            ("필", "I feel really shaky. I don't like being you.", "나 진짜 속이 떨려. 당신 역할은 싫어.", 281, "shaky", "'떨리는·불안한'. 몸과 마음 모두에 씁니다."),
        ],
    },
    {
        "id": "mf_boyfriend",
        "show": "modern_family",
        "videoId": "2ZGvEQWNqqQ",
        "title": "딸의 연상 남자친구를 대하는 필의 방식",
        "titleEn": "Phil Does Not Like Haley's Older Boyfriend",
        "channel": "Peacock",
        "episode": "S04E12 · Party Crasher",
        "duration": 253,
        "lines": [
            ("필", "That's crazy. I'm gonna fight him.", "말도 안 돼. 내가 그 녀석과 싸울 거야.", 0, "That's crazy", "'말도 안 돼'. 황당함을 나타내는 짧은 반응."),
            ("필", "No, Claire, I'm gonna fight him up real nice.", "아니, 클레어. 아주 얌전하게 싸울 거야.", 7, "real nice", "'아주 착하게'. 구어에서 really 대신 real을 씁니다."),
            ("클레어", "He's about to drop the hammer on Haley's new boyfriend.", "아빠가 헤일리의 새 남자친구한테 한 방 먹이려는 참이야.", 19, "drop the hammer", "'강하게 제재하다·한 방 먹이다'. 망치를 내리치는 그림."),
            ("클레어", "He's twice her age, and it's disgusting.", "나이가 헤일리의 두 배야. 역겨워.", 22, "twice her age", "'그녀 나이의 두 배'. 배수를 말하는 twice."),
            ("필", "I know why Haley is doing this. She's doing it to get back at you.", "헤일리가 왜 그러는지 알아. 당신한테 앙갚음하려는 거야.", 50, "get back at", "'~에게 앙갚음하다'. 복수·반격을 뜻합니다."),
            ("필", "And do you think I'm just going to let this happen?", "내가 이걸 그냥 두고 볼 것 같아?", 59, "let this happen", "'이 일이 일어나게 두다'. let + 목적어 + 동사원형."),
            ("클레어", "Trust me, the more it bothers you, the longer he stays.", "믿어 봐. 당신이 신경 쓸수록 그는 더 오래 있어.", 59, "the more", "'~할수록 더 ~'. the 비교급 구문의 대표 형태."),
            ("필", "The sooner Willie Nelson's on the road again.", "윌리 넬슨이 빨리 '다시 길 위로' 가겠지.", 67, "on the road again", "'다시 여행길에 오르다'. 윌리 넬슨의 노래 제목을 빌린 농담."),
            ("필", "I'm so conflicted. What you're saying makes sense up here.", "나 지금 너무 갈등돼. 네 말은 머리로는 맞아.", 77, "makes sense", "'말이 되다·이해가 되다'. 논리적 타당성을 말합니다."),
            ("필", "It just feels so damn comfortable down here.", "여기(가슴)는 하라는 대로 못 하겠어. 너무 편하다고.", 80, "damn", "형용사를 강조하는 구어적 부사. 가볍게 짜증을 실어요."),
            ("클레어", "Manny seems to me like a real old soul.", "매니는 정말 늙은 영혼 같아.", 101, "old soul", "'늙은 영혼'. 또래보다 성숙한 사람을 일컫는 표현."),
            ("필", "Age is nothing but a state of mind.", "나이는 그저 마음가짐일 뿐이야.", 111, "nothing but", "'단지 ~에 불과하다'. 강한 한정 표현."),
            ("필", "In fact, it has been such a pleasure getting to know Kenny. It's our treat.", "사실 케니를 알게 돼서 정말 기뻐. 우리가 살게.", 141, "It's our treat", "'우리가 낼게'. 식사·경험을 대접할 때 쓰는 표현."),
            ("필", "Well, sweetheart, you are only young once.", "여보, 인생에서 젊은 때는 한 번뿐이야.", 149, "only young once", "'젊음은 한 번뿐'. YOLO와 같은 뉘앙스의 격려."),
            ("헤일리", "You were going to let me go with him?", "나를 그 사람과 보내려고 했어?", 193, "going to let", "'~하게 둘 작정이었다'. be going to + 동사원형."),
            ("헤일리", "You've been acting so weird ever since I left college.", "내가 대학 그만둔 뒤로 계속 이상하게 구네.", 197, "ever since", "'~한 이후로 쭉'. 현재완료와 함께 씁니다."),
            ("필", "This little chicken game may work for your dad, but it doesn't work for me.", "이 닭싸움 같은 게 네 아빠한테는 통할지 몰라도 나한테는 안 통해.", 217, "chicken game", "'겁쟁이 게임'. 서로 버티는 승부를 뜻합니다."),
            ("필", "No guy on earth is good enough for her, let alone some slimy jeans salesman.", "이 세상 어떤 남자도 그 애에게 부족해. 끈적한 청바지 판매원은 말할 것도 없지.", 223, "let alone", "'~은 말할 것도 없고'. 더 강한 경우를 덧붙입니다."),
        ],
    },
    {
        "id": "mf_earthquake",
        "show": "modern_family",
        "videoId": "JJivFinaNPY",
        "title": "지진을 이용해 밀린 집안일을 끝내다",
        "titleEn": "Phil Uses the Earthquake To His Advantage",
        "channel": "Peacock",
        "episode": "S02E03 · Earthquake",
        "duration": 301,
        "lines": [
            ("미첼", "If they find us in these outfits, it's going to be very bad for the gays.", "이런 옷차림으로 들키면 동성애자들 욕먹는 거야.", 20, "very bad for", "'~에게 아주 안 좋은'. 결과를 걱정할 때 씁니다."),
            ("루크", "That thing almost fell on me.", "저게 나한테 떨어질 뻔했어.", 28, "almost fell", "'거의 떨어졌다'. almost는 아슬아슬한 실패를 나타냅니다."),
            ("루크", "It came this close to my head.", "내 머리 바로 앞까지 왔어.", 30, "this close", "'이만큼 가까이'. 손으로 거리를 보여 줄 때 쓰는 말."),
            ("루크", "I'm not gonna wait around here until I do.", "난 당할 때까지 여기서 기다리진 않을 거야.", 38, "wait around", "'빈둥대며 기다리다'. 목적 없이 머무는 느낌."),
            ("제이", "That is a doozy.", "이건 정말 대단한 지진이네.", 45, "a doozy", "'대단한 것·굉장한 것'. 크고 인상적인 일에 쓰는 구어 표현."),
            ("제이", "We lost Phil.", "필이랑 연락이 끊겼어.", 60, "we lost", "'연결이 끊겼다·잃었다'. 통화·신호가 끊길 때 씁니다."),
            ("캠", "Great. Now Gloria's gone.", "좋네. 이제 글로리아도 사라졌어.", 68, "gone", "'가 버린·없는'. gone은 사라진 상태를 말합니다."),
            ("글로리아", "Of course I'm alive.", "당연히 살아 있지.", 74, "alive", "'살아 있는'. live(동사)와 구별되는 형용사예요."),
            ("필", "For months, Claire has been after me and dogging me.", "몇 달 동안 클레어가 나를 계속 졸라 댔어.", 77, "has been after me", "'계속 나를 쫓아다녔다·졸랐다'. 현재완료 진행의 지속."),
            ("필", "Anchor the cabinet to the wall. We've got kids in the house, blah blah blah.", "수납장을 벽에 고정해. 집에 애들이 있잖아, 어쩌고저쩌고.", 84, "blah blah blah", "'어쩌고저쩌고'. 반복되는 말을 흘려들을 때 씁니다."),
            ("필", "It reached the point where I had no choice but to just roll up my sleeves.", "결국엔 내가 소매를 걷어붙이는 수밖에 없는 지경이 됐지.", 93, "roll up my sleeves", "'소매를 걷어붙이다'. 본격적으로 일을 시작한다는 관용구."),
            ("클레어", "We're fine. The door is jammed.", "우린 괜찮아. 문이 끼었어.", 110, "jammed", "'끼다·걸리다'. 기계·문이 움직이지 않을 때 씁니다."),
            ("필", "I'm gonna push, you pull. Okay, on three.", "내가 밀게, 네가 당겨. 셋에 하는 거야.", 116, "on three", "'셋에 맞춰'. 함께 동작을 시작할 때 쓰는 말."),
            ("필", "Okay, here's the thing.", "있잖아, 사실은 말이지.", 125, "here's the thing", "'사실은 말이야'. 본론을 꺼내기 전 쓰는 도입 표현."),
            ("필", "It dawned on me that as long as Claire was stuck, I'd have time.", "클레어가 갇혀 있는 동안 시간이 생긴다는 걸 깨달았어.", 132, "It dawned on me", "'문득 깨달았다'. 생각이 떠오르는 순간을 말합니다."),
            ("필", "Sometimes when God closes a door, he closes it so hard that your wife can't get out.", "신이 문을 닫을 땐 아내가 못 나올 만큼 세게 닫기도 하지.", 135, "closes a door", "'문을 닫으면 창문이 열린다'는 속담을 비트는 대사. 원래 속담을 문장 안에서 비틀어 웃음을 만듭니다."),
            ("클레어", "Get a crowbar, if you have one.", "쇠지렛대 있어? 있으면 가져와.", 148, "if you have one", "'있으면'. 조건을 붙여 부탁할 때 씁니다."),
            ("필", "Like I'm some dandy who doesn't have a crowbar?", "내가 쇠지렛대도 없는 멋쟁이인 줄 알아?", 150, "some dandy", "'어떤 멋쟁이'. some은 비꼬는 뉘앙스를 담기도 합니다."),
            ("필", "Dandy is a term coined by miners in the 15th century.", "댄디는 15세기 광부들이 만든 말이야.", 156, "coined by", "'~가 만들어 낸'. 단어를 새로 만들 때 coin을 씁니다."),
            ("클레어", "Don't you dare leave this house.", "이 집에서 나갈 생각 하지 마.", 190, "Don't you dare", "'감히 ~하지 마'. 강한 금지 표현."),
            ("클레어", "Just for that, you are grounded one week.", "그래서 벌로 일주일 외출 금지야.", 199, "grounded", "'외출 금지당한'. 부모가 벌을 주는 상황에서 씁니다."),
            ("클레어", "Want to double it? Keep talking.", "두 배로 늘려 줄까? 계속 말해 봐.", 202, "Keep talking", "'계속 말해 봐'. 위협조로 쓰이는 명령형."),
            ("필", "This cabinet barely moved. That's just perspective.", "이 수납장 거의 안 움직였어. 그건 그냥 원근법이야.", 224, "barely moved", "'거의 움직이지 않았다'. barely는 부정에 가깝습니다."),
            ("필", "I brought the wrong screwdriver, so I'll be right back.", "드라이버를 잘못 가져왔어. 금방 올게.", 264, "be right back", "'금방 돌아올게'. 자리를 잠깐 비울 때 씁니다."),
        ],
    },
    {
        "id": "se_voicemail",
        "show": "sex_education",
        "videoId": "95jRV9nVlQY",
        "title": "그 음성 메시지, 사실은 이랬어",
        "titleEn": "Otis FINALLY Tells Maeve What The Voicemail Said",
        "channel": "Still Watching Netflix",
        "episode": "S03E08 · Episode 8",
        "duration": 162,
        "lines": [
            ("메이브", "What did it say? The voicemail.", "뭐라고 했어? 그 음성 메시지.", 2, "What did it say", "'뭐라고 했어?' 말의 내용을 묻는 과거형 질문."),
            ("오티스", "Doesn't matter. It was ages ago.", "상관없어. 엄청 오래전 일이야.", 5, "ages ago", "'아주 오래전'. ages는 '오랜 시간'의 구어 표현."),
            ("메이브", "It matters to me.", "나한테는 중요해.", 12, "It matters to me", "'나에게 중요하다'. matter는 '중요하다'의 동사."),
            ("오티스", "It was something like, \"Hi, Maeve. I'm watching you on TV right now.\"", "대충 이런 거였어. '안녕, 메이브. 지금 TV에서 너를 보고 있어.'", 24, "something like", "'대충 ~ 같은 것'. 정확하지 않은 인용을 할 때 씁니다."),
            ("오티스", "\"And I wanted to let you know how proud I am of you.\"", "'그리고 네가 얼마나 자랑스러운지 말해 주고 싶었어.'", 38, "let you know", "'알려 주다'. 정중하게 정보를 전달할 때 쓰는 표현."),
            ("오티스", "\"And how you saying you had feelings for me was all I ever wanted to hear.\"", "'네가 나한테 감정이 있다고 한 게 내가 듣고 싶던 전부였어.'", 46, "had feelings for", "'~에게 감정이 있다·좋아하다'. 연애 감정을 완곡하게 말합니다."),
            ("오티스", "\"Because it's always been you.\"", "'왜냐면 언제나 너였으니까.'", 52, "always been you", "'늘 너였다'. 현재완료로 지속을 강조하는 고백 표현."),
            ("오티스", "\"I love you.\" Anyway, it was… stupid.", "'사랑해.' 아무튼, 그건… 바보 같았어.", 56, "Anyway", "'아무튼'. 화제를 접거나 바꿀 때 쓰는 연결어."),
            ("메이브", "Did you mean it?", "진심이었어?", 68, "mean it", "'진심으로 말하다'. 말의 진의를 확인할 때 씁니다."),
            ("오티스", "Of course I meant it.", "당연히 진심이었지.", 85, "Of course", "'물론이지'. 당연함을 강조하는 답."),
            ("오티스", "I can't… I can't do this.", "난… 이건 못 하겠어.", 107, "I can't do this", "'못 하겠다'. 감정적으로 버거울 때 자주 쓰는 말."),
            ("메이브", "I don't want to lose you again.", "난… 또 너를 잃고 싶지 않아.", 121, "lose you", "'너를 잃다'. 관계를 잃는 것을 lose로 표현합니다."),
            ("오티스", "I'm confused. This is confusing me.", "나 혼란스러워. 이게 나를 헷갈리게 해.", 124, "confused", "'혼란스러운'. 사람은 confused, 상황은 confusing입니다."),
        ],
    },
    {
        "id": "se_looks",
        "show": "sex_education",
        "videoId": "9DenrhhJkZM",
        "title": "오티스와 메이브, 말하지 못한 마음",
        "titleEn": "Maeve and Otis - The Lingering Looks of Love",
        "channel": "Still Watching Netflix",
        "episode": "S02 명장면 모음",
        "duration": 217,
        "lines": [
            ("아이작", "Who's the intense starey guy?", "저 빤히 쳐다보는 무서운 남자는 누구야?", 0, "starey", "'빤히 보는'. stare에서 만든 구어적 형용사예요."),
            ("메이브", "That's Otis. It's his party. Things are a bit weird between us right now.", "오티스야. 그의 파티야. 지금 우리 사이가 좀 이상해.", 3, "a bit weird", "'좀 이상한'. a bit으로 부드럽게 만든 표현."),
            ("아이작", "Is he your boyfriend?", "걔 네 남자친구야?", 9, "boyfriend", "'남자친구'. 관계를 직접 확인하는 질문."),
            ("메이브", "No.", "아니.", 12, "No.", "단호하게 선을 긋는 한 단어 대답."),
            ("아이작", "But you want him to be your boyfriend?", "그런데 걔가 네 남자친구였으면 좋겠어?", 14, "want him to be", "'그가 ~이길 바라다'. 목적격 + to부정사."),
            ("오티스", "Have you seen Ola anywhere?", "혹시 올라 봤어?", 29, "anywhere", "의문문에서 '어디든'의 뜻으로 쓰는 anywhere."),
            ("오티스", "If you see Ola, I'm looking for her.", "올라 보면 나가 찾고 있다고 해 줘.", 35, "I'm looking for", "'~을 찾고 있다'. 진행형으로 현재 상황을 말합니다."),
            ("오티스", "How's the rest of your birthday?", "생일 나머지는 어땠어?", 48, "the rest of", "'~의 나머지'. 남은 부분을 가리킵니다."),
            ("메이브", "Unexpected.", "예상 밖이었어.", 50, "Unexpected", "'예상치 못한'. 한 단어로 감정을 압축한 대답."),
            ("오티스", "Well, I got you something.", "뭐, 너한테 줄 게 있어.", 53, "got you something", "'너에게 뭘 사 왔어'. get은 '구하다·사다'의 뜻."),
            ("메이브", "Just visiting.", "그냥 들른 거야.", 79, "Just visiting", "'그냥 방문 중'. 짧게 상황을 설명하는 말."),
            ("메이브", "Nothing unusual. We're just hanging out, you know. Boyfriend, girlfriend hang times.", "별거 아니야. 그냥 어울려 노는 거지. 남친·여친이 노는 시간.", 87, "hanging out", "'어울려 놀다·시간을 보내다'. 계획 없는 만남을 말합니다."),
            ("오티스", "Changed your hair.", "머리 바꿨네.", 94, "Changed your hair", "주어를 생략한 회화체. '머리 바꿨어'를 짧게 던지는 말."),
            ("메이브", "Perceptive.", "눈썰미 있네.", 95, "Perceptive", "'관찰력이 좋은'. 칭찬과 비꼼 사이의 한 단어."),
            ("오티스", "I ripped out all your birthday pages so you don't have to celebrate one for another five years.", "네 생일 페이지는 다 찢어 놨어. 5년 동안 생일 안 챙겨도 되게.", 102, "ripped out", "'찢어 냈다'. rip은 거칠게 잡아 뜯는 동작."),
            ("메이브", "I don't think I'm over Otis.", "난 아직 오티스를 잊지 못한 것 같아.", 116, "I'm over", "'~을 극복하다·잊다'. 감정이 정리된 상태."),
            ("메이브", "I better get to class.", "수업 가 봐야겠다.", 119, "I better", "'~하는 게 낫겠다'. had better의 구어 축약."),
            ("오티스", "This is entirely about the money.", "이건 전적으로 돈 때문에 하는 거야.", 140, "entirely about", "'전적으로 ~에 관한'. 강조 부사 entirely."),
            ("메이브", "It's good to be back in business.", "다시 일하는 것도 좋네.", 142, "back in business", "'다시 일을 시작하다·복귀하다'. 원래대로 돌아왔다는 관용구."),
            ("오티스", "I got kicked out. 'Cause I mess everything up.", "응, 쫓겨났어. 난 뭐든 망치니까.", 148, "got kicked out", "'쫓겨났다'. get + 과거분사로 수동을 만든 구어 표현."),
            ("메이브", "You don't mess everything up.", "넌 뭐든 망치는 거 아니야.", 156, "mess everything up", "'모든 걸 망치다'. mess up의 강조형."),
            ("메이브", "I think I'm gonna have to punch you in the face if you ever buy me a birthday present again.", "또 내 생일 선물 사 오면 얼굴 한 대 때려야 할 것 같아.", 179, "punch you in the face", "'얼굴을 때리다'. punch + 사람 + in the + 신체 부위."),
        ],
    },
]


def words(s):
    return len(re.findall(r"[A-Za-z']+", s))


def build():
    clips_out = []
    total = 0
    for c in CLIPS:
        lines = []
        raw = c["lines"]
        for i, (sp, en, ko, start, idiom, note) in enumerate(raw):
            nxt = raw[i + 1][3] if i + 1 < len(raw) else c["duration"]
            spoken = max(1.5, words(en) * 0.42 + 0.35)
            end = min(max(start + 1.5, start + spoken), nxt - 0.15)
            if end <= start:
                end = start + 1.5
            if end > c["duration"]:
                end = c["duration"]
            lines.append({
                "id": f'{c["id"]}_{i + 1:02d}',
                "sp": sp, "en": en, "ko": ko,
                "start": round(float(start), 1), "end": round(float(end), 1),
                "idiom": idiom, "note": note,
            })
        total += len(lines)
        clips_out.append({
            "id": c["id"], "show": c["show"], "videoId": c["videoId"],
            "title": c["title"], "titleEn": c["titleEn"], "channel": c["channel"],
            "episode": c["episode"], "duration": c["duration"],
            "url": f'https://www.youtube.com/watch?v={c["videoId"]}',
            "lines": lines,
        })
    data = {
        "app": "SceneLoop", "builtAt": "2026-11-24",
        "shows": SHOWS, "clips": clips_out,
    }
    json.dump(data, open("data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("clips:", len(clips_out), "| lines:", total)
    for c in clips_out:
        print(f'  {c["show"]:14s} {c["videoId"]} {len(c["lines"]):2d}줄  {c["title"]}')


if __name__ == "__main__":
    build()
