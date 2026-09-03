import { useState } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";

const STYLES = {
  seth: { icon:"🎤", name:"세스 릭스 스타일", tag:"자연주의 & 밸런스형", fit:"목이 자주 아프고 고음에서 막히는 분", disciples:"마이클 잭슨, 스티비 원더, 임재범",
    sections:[
      { label:"철학", content:`SLS(Speech Level Singing)의 핵심은 '최소한의 힘으로 최대의 효율'이다.\n\n강하게 지르는 것보다 성대의 상하 밸런스를 맞추는 것을 최우선으로 한다. 치료 목적에 가까운 정교한 접근 방식으로, 발성 문제를 근본적으로 교정하는 데 강점이 있다.` },
      { label:"호흡", content:`숨을 억지로 들이마시거나 배에 과도하게 힘을 주지 않는다.\n\n평소 말할 때처럼 자연스러운 호흡이면 충분하다는 입장이다. 호흡에 힘을 쓰는 것이 오히려 성대 긴장을 유발한다고 본다.` },
      { label:"연습법", content:`1. 립트릴 (Lip Trill)\n입술을 붙이고 "브르르르" 떨면서 스케일을 올린다.\n\n2. Nay 스케일\n가볍게 "네이(Nay)" 발음으로 징징거리듯 스케일을 올린다.\n\n3. 허밍\n입을 다물고 "흠———" 허밍으로 스케일. 성대에 최소한의 힘만 사용하는 감각을 익힌다.` },
    ]
  },
  kim: { icon:"💪", name:"김명기 스타일", tag:"피지컬 & 하드 트레이닝형", fit:"소리에 힘이 없고 파워풀하게 지르고 싶은 분", disciples:"이수(MC더맥스), 거미, 옥주현, 블락비 태일",
    sections:[
      { label:"철학", content:`보컬을 스포츠로 본다. 근육을 단련하듯 성대 주변 피지컬을 키워야 고음이 뚫린다는 관점이다.\n\n강력한 성대 밀착과 피지컬 강화에 초점을 맞추며, 소리를 뒤로 당겨 단단하게 버티는 힘을 기른다.` },
      { label:"호흡", content:`명치와 하복부에 강한 압력을 주는 단단한 호흡 지탱을 요구한다.\n\n엔진(호흡)이 강해야 고음이라는 높은 출력을 버틸 수 있다고 본다.` },
      { label:"연습법", content:`1. 당기기 연습\n턱을 살짝 당기고 소리를 뒤로 던지는 감각으로 발성한다.\n\n2. 성대 밀착 훈련\n"으" 발음으로 성대를 강하게 붙이는 훈련.\n\n3. 고강도 스케일\n중간 강도에서 시작해 점점 출력을 높이는 스케일 훈련.` },
    ]
  },
  balance: { icon:"⚖️", name:"보컬밸런스 스타일", tag:"분석적 & 독학 최적화형", fit:"발성 문제를 체계적으로 분석하고 교정하고 싶은 분", disciples:"국내 최대 규모 보컬 유튜브 채널 기반",
    sections:[
      { label:"철학", content:`특정 발성법만 고집하지 않는다. 학생의 상태를 진단해 '과한 것은 줄이고, 부족한 것은 채우는' 밸런스 조절형 접근이다.\n\n목에 힘이 너무 들어간 사람에게는 힘을 빼는 법을, 소리가 너무 허한 사람에게는 소리를 모으는 법을 맞춤형으로 제시한다.` },
      { label:"호흡", content:`호흡을 뱉는 양(풍량)과 성대가 버티는 힘(풍압)의 비율이 50:50이 되는 상태를 이상적으로 본다.\n\n풍량이 너무 많으면 소리가 허해지고, 풍압이 너무 강하면 성대에 무리가 온다.` },
      { label:"연습법", content:`1. 빨대 불기 (SOVTE)\n가는 빨대를 물고 "우" 소리를 내며 스케일을 올린다.\n\n2. Gu/Mu 발음 스케일\n"구(Gu)" 또는 "무(Mu)" 발음으로 스케일.\n\n3. 자기 진단 녹음\n연습 후 스마트폰으로 녹음해서 들어본다.` },
    ]
  },
  jang: { icon:"🎯", name:"장효진 스타일", tag:"감각적 & 소리 카피형", fit:"이론은 머리 아프고 감각으로 빠르게 체득하고 싶은 분", disciples:"국내 1세대 보컬 유튜버",
    sections:[
      { label:"철학", content:`이론에 매몰되기보다 "이런 느낌으로 소리를 질러봐라", "소리를 여기에 던져라" 같은 감각적인 비유와 카피를 통해 몸으로 직접 체득하게 만든다.\n\n소리의 '질감'과 '위치'를 소리 내어 보여주며 직관적으로 가르치는 실전형 스타일이다.` },
      { label:"공명", content:`얼굴 앞면(미간, 비강)에 소리를 꽂아 넣는 '마스크 공명'을 매우 강조한다.\n\n비강을 잘 써야 소리가 얇아지면서 고음으로 쉽게 넘어간다고 본다.` },
      { label:"연습법", content:`1. 냥/맹 발음 연습\n"냥(Nyang)", "맹(Maeng)" 발음으로 스케일. 코 주변을 울려 마스크 공명을 찾는다.\n\n2. 아기 울음소리 흉내\n아기가 우는 소리처럼 "응애~" 계열의 소리를 흉내 낸다.\n\n3. 소리 카피 훈련\n좋아하는 가수의 발성 방식을 흉내 내며 감각을 체득한다.` },
    ]
  },
};

const ELEMENTS = {
  breath: { icon:"💨", title:"호흡 & 지지", desc:"발성의 근본. 호흡이 안 되면 나머지가 다 무너진다.",
    sections:[
      { label:"이론", content:`복식호흡은 횡격막을 아래로 내려 흡기 공간을 최대화하는 방식이다. 흉식호흡은 어깨와 가슴이 올라가며 긴장을 유발한다.\n\n어팍지오(Appoggio)는 이탈리아 벨칸토 창법에서 말하는 호흡 지지 개념으로, 흡기 근육과 호기 근육이 균형을 이루며 일정한 성문하압을 유지하는 상태다.` },
      { label:"연습법", content:`1. 누운 자세 복식호흡\n누워서 배 위에 책을 올리고 숨을 들이쉬면 책이 올라가야 한다. 5분간 반복.\n\n2. 촛불 끄기 연습\n촛불을 켜고 입술을 좁혀 일정한 세기로 천천히 분다.\n\n3. S발음 지속\n"쓰———" 소리를 최대한 길게 균일하게 낸다. 목표 20초 이상.` },
    ]
  },
  passaggio: { icon:"🔀", title:"성구 전환", desc:"흉성과 두성을 연결하는 구간. 대부분의 발성 문제가 여기서 발생한다.",
    sections:[
      { label:"이론", content:`성구 전환(Passaggio)은 흉성 공명에서 두성 공명으로 전환되는 음역대다. 남성은 보통 E4~G4, 여성은 A4~C5 근방에서 발생한다.\n\n이 구간에서 성대가 얇아지는 과정을 인위적으로 막으면 브레이크(목 끊김)가 생긴다.` },
      { label:"연습법", content:`1. 립트릴 (Lip Trill)\n입술을 붙이고 "브르르르" 떨면서 스케일을 올라간다.\n\n2. 우(Oo) 모음 스케일\n입술을 동그랗게 모아 "우" 발음으로 5음계 스케일.\n\n3. Messa di Voce\n한 음을 약하게 시작해서 크게, 다시 약하게 마친다.` },
    ]
  },
  tone: { icon:"🎚", title:"음색 조절", desc:"배음 구조와 공명 위치가 음색을 결정한다.",
    sections:[
      { label:"이론", content:`음색은 기본 음정 위에 쌓이는 배음(Overtone)의 구성으로 결정된다. 공명 위치에 따라 흉성은 따뜻하고 두터운 소리, 두성은 밝고 가벼운 소리를 낸다.\n\nChest-heavy 발성은 흉성 배음이 과도하게 강조돼 고음에서 힘들어진다.` },
      { label:"연습법", content:`1. 밝은 소리 (이 모음)\n"이" 발음으로 스케일. 앞니 뒤쪽에 소리가 닿는 느낌.\n\n2. 어두운 소리 (오 모음)\n"오" 발음으로 스케일. 후두를 살짝 낮추고 공간을 넓히는 느낌.\n\n3. 성문 폐쇄 훈련\n"어" 발음으로 스타카토.` },
    ]
  },
  vibrato: { icon:"〰️", title:"비브라토", desc:"자연스러운 비브라토는 만드는 것이 아니라 허용하는 것이다.",
    sections:[
      { label:"이론", content:`비브라토는 음정이 일정한 속도로 위아래로 진동하는 현상이다. 자연스러운 비브라토는 성대와 주변 근육이 이완된 상태에서 자동으로 발생한다.\n\n강제로 만들려 하면 턱이나 후두를 흔들게 되며 이는 가성 비브라토가 된다. 속도는 보통 5~7Hz가 자연스럽다.` },
      { label:"연습법", content:`1. 롱톤 이완 훈련\n"아———" 롱톤. 턱, 혀, 어깨의 긴장을 의식적으로 풀어낸다.\n\n2. 복근 펄스\n"하하하하" 복근을 이용해 짧게 끊어낸 후 롱톤으로 연결.\n\n3. 느린 트릴\n반음 위아래를 천천히 왔다갔다하다가 점점 속도를 높인다.` },
    ]
  },
  resonance: { icon:"🔔", title:"공명", desc:"같은 성대 진동도 공명 공간에 따라 전혀 다른 소리가 된다.",
    sections:[
      { label:"이론", content:`공명(Resonance)은 성대에서 발생한 소리가 인두, 구강, 비강 등의 공간에서 증폭되는 현상이다.\n\n마스크 공명은 코와 광대 주변에 진동을 느끼는 것으로, 밝고 앞으로 나오는 소리를 만든다.` },
      { label:"연습법", content:`1. 허밍 진동 찾기\n"흠———" 허밍. 손가락을 코 옆 광대에 대고 진동을 느낀다.\n\n2. 앞울림 연습\n"니———, 니———" 반복.\n\n3. 공간 넓히기\n하품하듯 입 안 공간을 최대로 넓힌 상태로 "아" 발음.` },
    ]
  },
};

export default function Library({ go }) {
  const [mainTab, setMainTab] = useState("style");
  const [selected, setSelected] = useState(null);
  const [subTab, setSubTab] = useState(0);

  const data = mainTab === "style" ? STYLES : ELEMENTS;
  const item = selected ? data[selected] : null;

  const handleBack = () => { if (selected) { setSelected(null); setSubTab(0); } else go("home"); };

  if (item) {
    return (
      <div className="screen">
        <BackButton label="라이브러리" onClick={handleBack} />
        <div className="lib-header">
          <span className="lib-big-icon">{item.icon}</span>
          <div>
            <p className="eyebrow">{item.tag ?? "발성 요소"}</p>
            <h2 className="screen-title"><strong>{item.name ?? item.title}</strong></h2>
          </div>
        </div>

        {item.fit && (
          <div className="lib-fit-card">
            <p className="lib-fit-label">이런 분께 추천</p>
            <p className="lib-fit-text">{item.fit}</p>
          </div>
        )}
        {item.disciples && (
          <div className="result-card">
            <p className="card-label">주요 제자</p>
            <p className="result-body">{item.disciples}</p>
          </div>
        )}

        <div className="lib-tabs">
          {item.sections.map((s, i) => (
            <button key={i} className={`lib-tab ${subTab === i ? "active" : ""}`} onClick={() => setSubTab(i)}>{s.label}</button>
          ))}
        </div>

        <div className="lib-content-box">
          {item.sections[subTab].content.split("\n\n").map((block, i) => (
            <p key={i} className="lib-paragraph">{block}</p>
          ))}
        </div>
        <NavBar go={go} active="library" />
      </div>
    );
  }

  return (
    <div className="screen">
      <BackButton label="홈" onClick={() => go("home")} />
      <p className="eyebrow">Library</p>
      <h2 className="screen-title"><strong>발성 라이브러리</strong></h2>

      <div className="lib-tabs">
        <button className={`lib-tab ${mainTab === "style" ? "active" : ""}`} onClick={() => { setMainTab("style"); setSelected(null); }}>트레이너 스타일</button>
        <button className={`lib-tab ${mainTab === "element" ? "active" : ""}`} onClick={() => { setMainTab("element"); setSelected(null); }}>발성 요소별</button>
      </div>

      {mainTab === "style" ? (
        Object.entries(STYLES).map(([key, item]) => (
          <div key={key} className="lib-style-card" onClick={() => { setSelected(key); setSubTab(0); }}>
            <div className="lib-style-icon">{item.icon}</div>
            <div style={{flex:1}}>
              <p className="lib-style-name">{item.name}</p>
              <p className="lib-style-tag">{item.tag}</p>
              <p className="lib-style-fit">{item.fit}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="element-grid">
          {Object.entries(ELEMENTS).map(([key, item]) => (
            <div key={key} className="element-card" onClick={() => { setSelected(key); setSubTab(0); }}>
              <div className="element-icon">{item.icon}</div>
              <p className="element-name">{item.title}</p>
              <p className="element-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
      <NavBar go={go} active="library" />
    </div>
  );
}
