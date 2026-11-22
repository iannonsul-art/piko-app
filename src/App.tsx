import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { collection, isAdmin } from '@piko/data';
import mathNotebook from '@piko/photos/math-notebook';
import mathGuidance from '@piko/photos/math-guidance';
import classroom from '@piko/photos/classroom';
import './styles.css';

type Teacher = {
  name: string;
  lines: string[];
};

const KOREAN_TEACHERS: Teacher[] = [
  {
    name: '장혜진',
    lines: [
      '한국교원대학교 국어교육 전공',
      '현) 이안학원 국어 강사',
      '전) 대성학원',
    ],
  },
  {
    name: '연민희',
    lines: [
      '한양대학교 국어교육 전공',
      '현) 이안학원 국어 강사',
      '전) 면목고등학교 국어교사',
    ],
  },
  {
    name: '오서영',
    lines: ['동국대학교 국어교육 전공', '현) 이안학원 국어 강사'],
  },
  {
    name: '이정원',
    lines: ['현) 이안학원 국어 강사'],
  },
  {
    name: '유지수',
    lines: ['현) 이안학원 국어 강사'],
  },
  {
    name: '박진선',
    lines: [
      '현) 이안학원 국어 강사',
      '전) 경기도교육청 산하기관 작문구술 전문강사',
      '전) 서초 지역 대입 자소서 컨설팅 강사 - 연세대, 경희대, 한동대 등 다수 합격자 배출',
      '전) 동심교육연구소 연구원',
      '전) 한국환경운동본부 책임기자',
    ],
  },
];

type ClassGroup = {
  key: string;
  title: string;
  summary: string;
  grades: { grade: string; classes: string[] }[];
  note?: string;
  schools?: string[];
};

const REGULAR_GROUPS: ClassGroup[] = [
  {
    key: 'g3',
    title: '중3 정규반',
    summary: '테스트 후 성적에 따라 반이 배정됩니다.',
    grades: [
      { grade: '중3', classes: ['top반', '1%반', '4%반', '정규반'] },
    ],
  },
  {
    key: 'g2',
    title: '중2 정규반',
    summary: '테스트 후 성적에 따라 반이 배정됩니다.',
    grades: [{ grade: '중2', classes: ['1등급반', '정규반'] }],
  },
  {
    key: 'g1',
    title: '중1 정규반',
    summary: '테스트 후 성적에 따라 반이 배정됩니다.',
    grades: [{ grade: '중1', classes: ['1등급반', '정규반'] }],
  },
];

const SCHOOLS = [
  '궁내중', '귀인중', '대안여중', '대안중', '박달중', '범계중', '부림중',
  '부안중', '부흥중', '신기중', '연현중', '임곡중', '평촌중', '호계중',
];

const SPECIAL_CLASSES = [
  {
    title: '중3 외고 입시 자소서반',
    desc:
      '외국어고등학교 진학을 준비하는 중3 학생을 위한 자기소개서 작성 수업입니다. 활동 기록을 정리하고, 학교별 문항에 맞춰 자신의 경험을 설득력 있는 글로 풀어내는 과정을 연습합니다.',
    points: [
      '개인별 활동 기록과 경험 정리',
      '문항 분석 후 초안 작성과 첨삭',
      '학교별 자소서 방향 점검',
    ],
  },
  {
    title: '중3 외고 입시 면접반',
    desc:
      '자기소개서와 연결되는 예상 질문에 대비해 실제 면접 상황을 연습하는 수업입니다. 답변 구성과 표현, 면접 태도를 함께 점검합니다.',
    points: [
      '예상 질문과 답변 구조 설계',
      '실전 모의 면접 진행',
      '개별 피드백과 보완',
    ],
  },
];

const WEEKDAY_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLScL-D3v0xcL-4qn--s62_M3DDxMRHk4e20lDxg9GfNE6Hh8jw/viewform';
const WEEKEND_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSdVIFwBzQ480AooVNIIz1-C0P8BdsXMVe5jr6xK53pZfPVdOA/viewform';

const NAV_ITEMS = [
  { href: '#teachers', label: '선생님 소개' },
  { href: '#classes', label: '개설 반' },
  { href: '#materials', label: '학습 자료' },
  { href: '#how', label: '예약 절차' },
  { href: '#consult', label: '상담 예약' },
  { href: '#test', label: '테스트 예약' },
];

type Reservation = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  grade: string;
  subject: string;
  topic: string;
  preferred: string;
  message: string;
};

const reservations = collection<Reservation>('consult_reservations');

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    isAdmin()
      .then((value) => {
        if (alive) setAdmin(value === true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header menuOpen={menuOpen} onToggle={() => setMenuOpen((v) => !v)} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <Teachers />
        <Classes />
        <SpecialClasses />
        <Materials />
        <Process />
        <ConsultForm />
        <TestBooking />
        {admin && <AdminPanel />}
      </main>
      <Footer />
    </>
  );
}

function Header({
  menuOpen,
  onToggle,
  onClose,
}: {
  menuOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand" onClick={onClose}>
          <span className="brand-mark">이안</span>
          <span className="brand-text">
            <strong>이안학원</strong>
            <small>맞춤형 학습 컨설팅</small>
          </span>
        </a>
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`} aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={onClose}>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-label="메뉴 열기"
          onClick={onToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">중등 국어 전문 · 맞춤형 학습 컨설팅</p>
          <h1>
            학생의 현재를 진단하고,
            <br />
            맞는 반과 선생님을 찾아드립니다
          </h1>
          <p className="lead">
            이안학원은 테스트 결과와 상담을 바탕으로 학생에게 맞는 반을 설계하는 중등 국어 학원입니다.
            선생님 프로필을 확인하고, 상담이나 테스트 예약으로 시작해 보세요.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#consult">
              상담 예약하기
            </a>
            <a className="btn btn-ghost" href="#test">
              테스트 예약하기
            </a>
          </div>
          <ul className="hero-facts">
            <li>테스트 결과로 학년별 반 배정</li>
            <li>수업 선생님 직접 소개</li>
            <li>내신 기간 학교별 수업</li>
          </ul>
        </div>
        {mathGuidance && (
          <figure className="hero-photo">
            <img
              src={mathGuidance}
              alt="노트 위 필기 내용을 짚어 가며 설명하는 모습"
              loading="eager"
            />
            <figcaption>예시 사진입니다. 실제 이안학원 수업이나 시설의 모습이 아닙니다.</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

function Teachers() {
  return (
    <section className="section" id="teachers">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">선생님 소개</p>
          <h2>중등국어 선생님</h2>
          <p className="section-sub">
            이안학원 중등국어를 맡고 있는 선생님들입니다. 학력과 주요 경력을 아래에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="teacher-grid">
          {KOREAN_TEACHERS.map((t) => (
            <article className="teacher-card" key={t.name}>
              <div className="teacher-top">
                <span className="teacher-avatar" aria-hidden="true">
                  {t.name.slice(0, 1)}
                </span>
                <div>
                  <h3>{t.name}</h3>
                  <p className="teacher-subject">중등국어</p>
                </div>
              </div>
              <ul>
                {t.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Classes() {
  return (
    <section className="section section-alt" id="classes">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">현재 개설된 중등반</p>
          <h2>학년과 성적에 맞는 반 구성</h2>
          <p className="section-sub">
            정규반은 테스트 후 성적에 따라 입반하며, 내신반은 내신 기간에만 학교별로 나누어 진행합니다.
          </p>
        </div>

        <div className="table-wrap">
          <table className="class-table">
            <caption className="sr-only">학년별 정규반 구성</caption>
            <thead>
              <tr>
                <th scope="col">학년</th>
                <th scope="col">개설 반</th>
              </tr>
            </thead>
            <tbody>
              {REGULAR_GROUPS.map((g) => (
                <tr key={g.key}>
                  <th scope="row">{g.grades[0].grade}</th>
                  <td>
                    <div className="chip-row">
                      {g.grades[0].classes.map((c) => (
                        <span className="chip" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">정규반 : 테스트 후 성적에 따라 입반</p>

        <div className="class-grid">
          <article className="class-card">
            <h3>정규반</h3>
            <p>테스트 결과에 따라 학년별 반이 정해집니다. 학생의 실력과 목표에 맞는 반에서 수업을 시작합니다.</p>
            <a className="text-link" href="#test">
              테스트 예약하고 반 상담하기 →
            </a>
          </article>
          <article className="class-card">
            <h3>내신반</h3>
            <p>내신 기간에만 진행되며, 학교별로 나누어 해당 학교의 시험 범위와 출제 경향에 맞춰 수업합니다.</p>
            <p className="class-meta">진행 학교</p>
            <div className="chip-row">
              {SCHOOLS.map((s) => (
                <span className="chip chip-soft" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function SpecialClasses() {
  return (
    <section className="section" id="special">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">특별반 안내</p>
          <h2>중3 외고 입시 자소서반 · 면접반</h2>
          <p className="section-sub">외고 진학을 준비하는 중3 학생을 위한 특별반을 함께 운영하고 있습니다.</p>
        </div>
        <div className="special-grid">
          {SPECIAL_CLASSES.map((c) => (
            <article className="special-card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <ul className="check-list">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="callout">
          자세한 수업 일정과 진행 방식은 상담 예약 시 안내해 드립니다.{' '}
          <a className="text-link" href="#consult">
            상담 예약하기 →
          </a>
        </p>
      </div>
    </section>
  );
}

const MATERIALS = [
  {
    tag: '학습 팁',
    title: '비문학 지문, 구조로 읽기',
    body: '문단마다 중심 문장을 표시하고, 글 전체의 구조(나열·비교·인과)를 먼저 파악한 뒤 문제로 넘어갑니다.',
  },
  {
    tag: '학습 팁',
    title: '문법 용어는 예문과 함께',
    body: '개념을 외우기보다 짧은 예문에 직접 표시하며 익히면 서술형에서 설명을 쓰기 쉬워집니다.',
  },
  {
    tag: '시험 유형 설명',
    title: '서술형 문항 대비',
    body: '조건에 맞게 근거를 제시하고, 정해진 분량 안에서 결론까지 쓰는 연습이 필요합니다. 아래 예제와 샘플로 형태를 확인해 보세요.',
  },
];

const SAMPLE_QUESTIONS = [
  {
    q: '다음 글의 중심 내용을 한 문장으로 서술하시오. (근거 2가지를 포함할 것)',
    hint: '글의 구조를 먼저 표시한 뒤, 반복되는 핵심 어구를 찾아봅니다.',
  },
  {
    q: '밑줄 친 표현이 사용된 이유를 문맥에 근거하여 설명하시오.',
    hint: '앞뒤 문장에서 그 표현이 없을 때와 있을 때의 뜻 차이를 비교해 봅니다.',
  },
  {
    q: '제시된 두 관점 중 필자의 관점을 고르고, 그 근거를 본문에서 찾아 쓰시오.',
    hint: '접속어와 평가 어구를 표시하면 필자의 태도가 드러납니다.',
  },
];

function SampleDownload() {
  const [state, setState] = useState<'idle' | 'ready'>('idle');

  const download = () => {
    const lines = [
      '이안학원 · 중등국어 샘플 테스트 (예시)',
      '',
      '※ 예시 문제로 실제 입반 테스트와 동일하지 않습니다.',
      '',
      ...SAMPLE_QUESTIONS.flatMap((s, i) => [
        `${i + 1}. ${s.q}`,
        `   힌트: ${s.hint}`,
        '',
      ]),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '이안학원_중등국어_샘플테스트.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setState('ready');
  };

  return (
    <div className="sample-box">
      <h3>샘플 테스트 다운로드</h3>
      <p>입반 테스트의 형태를 미리 경험해 볼 수 있는 예시 문제입니다. 실제 테스트 문항과는 다릅니다.</p>
      <button type="button" className="btn btn-primary" onClick={download}>
        샘플 테스트 내려받기
      </button>
      {state === 'ready' && <p className="form-ok">샘플 파일이 내려받아졌습니다.</p>}
    </div>
  );
}

function Materials() {
  return (
    <section className="section section-alt" id="materials">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">학습 자료 · 테스트 샘플</p>
          <h2>수업 전에 미리 확인해 보세요</h2>
          <p className="section-sub">자주 쓰는 학습 팁과 서술형 시험의 유형, 예시 문제를 정리했습니다.</p>
        </div>
        <div className="materials-grid">
          <div className="materials-left">
            <div className="material-cards">
              {MATERIALS.map((m) => (
                <article className="material-card" key={m.title}>
                  <span className="tag">{m.tag}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </article>
              ))}
            </div>
            <SampleDownload />
          </div>
          <div className="materials-right">
            <article className="examples-card">
              <h3>예제 문제 (예시)</h3>
              <p className="examples-note">아래 문제는 형식을 보여 주기 위한 예시이며, 실제 시험 문제가 아닙니다.</p>
              <ol>
                {SAMPLE_QUESTIONS.map((s) => (
                  <li key={s.q}>
                    <p className="q-text">{s.q}</p>
                    <p className="q-hint">힌트 · {s.hint}</p>
                  </li>
                ))}
              </ol>
            </article>
            {mathNotebook && (
              <figure className="side-photo">
                <img src={mathNotebook} alt="수학 공식과 도형을 손으로 필기한 노트" loading="lazy" />
                <figcaption>예시 사진입니다. 실제 교재나 수업 자료가 아닙니다.</figcaption>
              </figure>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: '01', t: '예약', d: '상담 예약 폼을 작성하거나, 평일·주말 테스트 신청서를 제출합니다.' },
    { n: '02', t: '확인 연락', d: '남겨 주신 연락처로 일정을 확인하고 안내드립니다.' },
    { n: '03', t: '상담 또는 테스트', d: '학습 고민을 상담하거나 테스트를 봅니다. 테스트는 학년과 과목에 맞춰 진행됩니다.' },
    { n: '04', t: '반 안내', d: '테스트 결과에 따라 들어갈 반과 수업 방향을 안내해 드립니다.' },
  ];
  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">상담 · 테스트 예약 절차</p>
          <h2>네 단계로 시작합니다</h2>
          <p className="section-sub">필요 정보는 학생 이름, 학년, 연락처, 희망 일정입니다.</p>
        </div>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="process-actions">
          <a className="btn btn-primary" href="#consult">
            상담 예약
          </a>
          <a className="btn btn-accent" href="#test">
            테스트 예약
          </a>
        </div>
      </div>
    </section>
  );
}

function ConsultForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    grade: '중1',
    subject: '국어',
    topic: '반 편성 상담',
    preferred: '',
    message: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await reservations.create({ ...form });
      setStatus('done');
      setForm({ ...form, name: '', phone: '', preferred: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section section-alt" id="consult">
      <div className="container consult-grid">
        <div>
          <p className="eyebrow">상담 예약</p>
          <h2>현재 상황을 알려 주세요</h2>
          <p className="section-sub">
            학생의 학년과 학습 고민을 적어 주시면, 그에 맞는 반과 상담 일정을 안내해 드립니다.
          </p>
          <ul className="info-list">
            <li>
              <strong>필요 정보</strong> 학생 이름, 학년, 연락처, 희망 상담 주제
            </li>
            <li>
              <strong>상담 내용</strong> 반 편성, 내신 대비, 외고 자소서·면접반 등
            </li>
            <li>
              <strong>예상 소요 시간</strong> 상담 일정과 함께 안내드립니다.
            </li>
          </ul>
        </div>
        <form className="card form" onSubmit={onSubmit}>
          <div className="field-row">
            <label className="field">
              <span>학생 이름</span>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="예: 김학생"
              />
            </label>
            <label className="field">
              <span>학년</span>
              <select value={form.grade} onChange={(e) => update('grade', e.target.value)}>
                <option>중1</option>
                <option>중2</option>
                <option>중3</option>
                <option>기타</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>연락처</span>
            <input
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="연락받으실 전화번호"
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>과목</span>
              <select value={form.subject} onChange={(e) => update('subject', e.target.value)}>
                <option>국어</option>
                <option>국어 · 내신</option>
                <option>외고 자소서·면접</option>
                <option>기타</option>
              </select>
            </label>
            <label className="field">
              <span>상담 주제</span>
              <select value={form.topic} onChange={(e) => update('topic', e.target.value)}>
                <option>반 편성 상담</option>
                <option>내신 대비 상담</option>
                <option>외고 입시 상담</option>
                <option>학습 방법 상담</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>희망 상담 일정</span>
            <input
              value={form.preferred}
              onChange={(e) => update('preferred', e.target.value)}
              placeholder="예: 평일 오후 7시 이후"
            />
          </label>
          <label className="field">
            <span>학습 고민 (선택)</span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="예: 중2인데 서술형에서 자꾸 조건을 놓쳐요"
            />
          </label>
          <button className="btn btn-primary btn-full" disabled={status === 'sending'}>
            {status === 'sending' ? '보내는 중…' : '상담 예약 보내기'}
          </button>
          {status === 'done' && (
            <p className="form-ok">상담 예약이 접수되었습니다. 일정 확인 후 연락드리겠습니다.</p>
          )}
          {status === 'error' && (
            <p className="form-error">접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.</p>
          )}
        </form>
      </div>
    </section>
  );
}

function TestBooking() {
  return (
    <section className="section" id="test">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">테스트 예약</p>
          <h2>평일 · 주말 테스트 신청</h2>
          <p className="section-sub">
            테스트는 신청서로 접수합니다. 희망하는 요일 유형을 선택해 해당 신청서로 이동해 주세요.
          </p>
        </div>
        <div className="test-grid">
          <article className="test-card">
            <h3>평일 테스트 신청</h3>
            <p>평일 방문을 희망하는 학생은 아래 신청서를 작성해 주세요.</p>
            <a className="btn btn-primary btn-full" href={WEEKDAY_FORM} target="_blank" rel="noopener noreferrer">
              평일 테스트 신청서 열기
            </a>
          </article>
          <article className="test-card">
            <h3>주말 테스트 신청</h3>
            <p>주말 방문을 희망하는 학생은 아래 신청서를 작성해 주세요.</p>
            <a className="btn btn-accent btn-full" href={WEEKEND_FORM} target="_blank" rel="noopener noreferrer">
              주말 테스트 신청서 열기
            </a>
          </article>
        </div>
        <div className="test-info">
          <div>
            <h3>신청 전에 확인하세요</h3>
            <ul className="info-list">
              <li>테스트 결과에 따라 정규반(학년별 반)이 배정됩니다.</li>
              <li>필요 정보는 학생 이름, 학년, 연락처, 희망 날짜입니다.</li>
              <li>테스트 일정과 소요 시간은 신청 후 안내드립니다.</li>
              <li>테스트 관련 문의는 상담 예약을 이용해 주세요.</li>
            </ul>
          </div>
          {classroom && (
            <figure className="side-photo">
              <img src={classroom} alt="햇살이 들어오는 빈 교실" loading="lazy" />
              <figcaption>예시 사진입니다. 실제 이안학원 시설의 모습이 아닙니다.</figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminPanel() {
  const [items, setItems] = useState<Reservation[] | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    reservations
      .list({ order: '-createdAt' })
      .then((data) => setItems(data as Reservation[]))
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="section section-alt" id="admin">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">관리자</p>
          <h2>상담 예약 접수 목록</h2>
        </div>
        {items === null ? (
          <p className="section-sub">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="section-sub">아직 접수된 상담 예약이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table className="class-table admin-table">
              <thead>
                <tr>
                  <th>접수일</th>
                  <th>학생</th>
                  <th>학년</th>
                  <th>연락처</th>
                  <th>상담 주제</th>
                  <th>희망 일정</th>
                  <th>고민</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>{r.name}</td>
                    <td>{r.grade}</td>
                    <td>{r.phone}</td>
                    <td>
                      {r.subject} · {r.topic}
                    </td>
                    <td>{r.preferred || '-'}</td>
                    <td>{r.message || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>이안학원</strong>
          <p>맞춤형 학습 컨설팅 · 중등 국어</p>
        </div>
        <nav className="footer-nav" aria-label="하단 메뉴">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
