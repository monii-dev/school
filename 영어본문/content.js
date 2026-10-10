// content.js

const ENGLISH_CONTENT = {
  4: {
    lesson: 4,
    unitTitle: "Be Safe Everywhere",
    readingTitle: "Stay Safe at School",

    blocks: [
      {
        type: "title",
        runs: [
          { text: "Stay Safe at School", bold: true }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Many students have fun at school. But sometimes, dangerous accidents happen. So we need to know about common accidents. Let’s learn!" }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Many school accidents happen in PE classes (44%), at lunchtime (17%), or during break (10%)." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Students get injuries when they play soccer (19%), basketball (15%), or dodgeball (9%). Accidents also happen when students are walking (12%)!" }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Students injure their fingers (23%), ankles (22%), and knees (6%)." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Now we know about common school accidents. But how do they happen?" }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "(10:00 a.m., PE class) ", bold: true },
          { text: "Jinho played basketball. He jumped but landed the wrong way. He injured his ankle!" }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "(12:30 p.m., Lunchtime) ", bold: true },
          { text: "Sora picked up a bowl of hot soup. Oops! She bumped into Jaemin! Sora spilled the hot soup on her arm." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "(2:00 p.m., Break) ", bold: true },
          { text: "Homin walked down the hallway. He looked at his smartphone. Be careful, Homin! Ouch! He bumped into the wall." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "(3:10 p.m., After class) ", bold: true },
          { text: "The school day ended. Minji wanted to go home quickly. She ran down the stairs and slipped!" }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "We looked at some examples of accidents at school. Now write the safety promises below. You should keep them!" }
        ]
      },

      {
        type: "subtitle",
        runs: [
          { text: "My Safety Promises", bold: true }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "ONE: ", bold: true },
          { text: "I will warm up before I play sports." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "TWO: ", bold: true },
          { text: "I will look around carefully when I am holding hot soup." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "THREE: ", bold: true },
          { text: "I will not use my smartphone when I walk." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "FOUR: ", bold: true },
          { text: "I will not run on the stairs." }
        ]
      }
    ]
  },

  5: {
    lesson: 5,
    unitTitle: "Enjoying Art",
    readingTitle: "From the Self-Portrait to the Selfie",

    blocks: [
      {
        type: "title",
        runs: [
          { text: "From the Self-Portrait to the Selfie", bold: true }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Today, people enjoy taking selfies. We can capture special moments with them." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Long ago, people captured their own image in a different way. They painted pictures of themselves. These pictures are self-portraits." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Selfies and self-portraits are similar. Both show our image at a certain time. When we look at them, we can remember ourselves from that time. They are like a diary." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "We take selfies to remember happy moments. Selfies capture the expressions on our faces at those times. We often look at selfies with our family and friends to bring back those joyful feelings." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Similarly, some painters made self-portraits to capture different times in their lives. Rembrandt looked in the mirror and painted himself many times. He painted around 90 self-portraits in his life. They show his face from youth to old age." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Selfies and self-portraits also have differences." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "Taking a selfie is easy. We can do it quickly with our camera at any time. However, painting a self-portrait takes some time. Also, a self-portrait shows a painter’s personal painting style." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "To paint a person, a painter needs a model. Vincent van Gogh didn’t have enough money for a model. So he painted himself! When he painted his self-portraits, he chose bright colors and applied a lot of paint. This became his unique style. We can see it in his other paintings too." }
        ]
      },

      {
        type: "paragraph",
        runs: [
          { text: "We can express ourselves with selfies and self-portraits. Do you want to try?" }
        ]
      }
    ]
  }
};


// 전역에서 사용할 수 있게 함
window.ENGLISH_CONTENT = ENGLISH_CONTENT;


// 문장별 한국어 해석 (Q1~Q4 문답 제외).
const MEMO_TRANSLATIONS = {
  "4": [
    "많은 학생들이 학교에서 즐거운 시간을 보낸다.",
    "하지만 가끔 위험한 사고가 발생한다.",
    "그래서 우리는 흔히 일어나는 사고들에 대해 알아야 한다.",
    "함께 알아보자!",
    "많은 학교 사고는 체육 시간(44%), 점심시간(17%), 또는 쉬는 시간(10%)에 발생한다.",
    "학생들은 축구(19%), 농구(15%), 또는 피구(9%)를 할 때 부상을 입는다.",
    "학생들이 걷는 동안에도 사고가 발생한다(12%)!",
    "학생들은 손가락(23%), 발목(22%), 무릎(6%)을 다친다.",
    "이제 우리는 흔히 일어나는 학교 사고들에 대해 알게 되었다.",
    "하지만 그런 사고는 어떻게 일어날까?",
    "진호는 농구를 했다.",
    "그는 점프했지만 잘못된 방식으로 착지했다.",
    "그는 발목을 다쳤다!",
    "소라는 뜨거운 국 한 그릇을 집어 들었다.",
    "앗!",
    "그녀는 재민이와 부딪쳤다!",
    "소라는 뜨거운 국을 팔에 쏟았다.",
    "호민이는 복도를 걸어갔다.",
    "그는 스마트폰을 보았다.",
    "조심해, 호민아!",
    "아야!",
    "그는 벽에 부딪쳤다.",
    "학교 수업이 끝났다.",
    "민지는 빨리 집에 가고 싶었다.",
    "그녀는 계단을 뛰어 내려가다가 미끄러졌다!",
    "우리는 학교에서 일어나는 사고의 몇 가지 사례를 살펴보았다.",
    "이제 아래에 안전 수칙을 적어 보자.",
    "너는 그 수칙들을 지켜야 한다!",
    "나는 운동하기 전에 준비 운동을 할 것이다.",
    "나는 뜨거운 국을 들고 있을 때 주변을 주의 깊게 살펴볼 것이다.",
    "나는 걸을 때 스마트폰을 사용하지 않을 것이다.",
    "나는 계단에서 뛰지 않을 것이다."
  ],
  "5": [
    "오늘날 사람들은 셀피를 찍는 것을 즐긴다.",
    "우리는 그것들로 특별한 순간들을 포착할 수 있다.",
    "오래전에 사람들은 다른 방식으로 그들 자신의 모습을 담았다.",
    "그들은 자신의 모습을 그림으로 그렸다.",
    "이런 그림들이 자화상이다.",
    "셀피와 자화상은 비슷하다.",
    "둘 다 특정 시점의 우리 모습을 보여 준다.",
    "우리가 그것들을 보면 그때의 우리 자신을 기억할 수 있다.",
    "그것들은 마치 일기와 같다.",
    "우리는 행복한 순간들을 기억하기 위해 셀피를 찍는다.",
    "셀피는 그 순간 우리 얼굴의 표정을 담는다.",
    "우리는 그 즐거운 감정을 되살리기 위해 가족이나 친구들과 함께 셀피를 자주 본다.",
    "마찬가지로 일부 화가들은 삶의 서로 다른 시기를 담기 위해 자화상을 그렸다.",
    "렘브란트는 거울을 보며 자신의 모습을 여러 번 그렸다.",
    "그는 생애 동안 약 90점의 자화상을 그렸다.",
    "그 그림들은 젊은 시절부터 노년까지 그의 얼굴을 보여 준다.",
    "셀피와 자화상에는 차이점도 있다.",
    "셀피를 찍는 것은 쉽다.",
    "우리는 언제든지 카메라로 빠르게 셀피를 찍을 수 있다.",
    "그러나 자화상을 그리는 데는 시간이 좀 걸린다.",
    "또한 자화상은 화가 개인의 그림 스타일을 보여 준다.",
    "사람을 그리려면 화가에게 모델이 필요하다.",
    "빈센트 반 고흐는 모델을 구할 돈이 충분하지 않았다.",
    "그래서 그는 자기 자신을 그렸다!",
    "그는 자화상을 그릴 때 밝은 색들을 선택하고 물감을 많이 발랐다.",
    "이것이 그의 독특한 화풍이 되었다.",
    "우리는 그의 다른 그림에서도 그것을 볼 수 있다.",
    "우리는 셀피와 자화상으로 우리 자신을 표현할 수 있다.",
    "여러분도 시도해 보고 싶은가?"
  ]
};
window.MEMO_TRANSLATIONS = MEMO_TRANSLATIONS;
