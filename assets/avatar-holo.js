/*
 * Kinetic Ticker Stream:
 * Continuous horizontal marquee text scrolling smoothly behind the character.
 * 4 rows only (user-selected positions: forehead, eyes/cheeks, chin/shoulders, chest/laptop).
 * Content is broad on purpose (strategy, brand, content, web, SEO, automation, AI, leadership,
 * data, consulting), not only paid ads. Real CV facts, zero company names.
 * Respects locale (Arabic/English) and motion accessibility.
 */
(() => {
  const stage = document.querySelector('.impact-stage--approved');
  if (!stage) return;

  const isAr = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const MINT = '#7df0c5', CYAN = '#1fd0ff';

  const rowsData = isAr ? [
    [
      { t: '+7 سنوات في بناء النمو', h: true, c: MINT },
      { t: 'استراتيجية تسويق متكاملة', h: false },
      { t: '+1,000,000$ ميزانيات مُدارة', h: true, c: CYAN },
      { t: 'بناء العلامة التجارية وتموضعها', h: false },
      { t: '12 سوقًا دوليًا', h: true, c: MINT }
    ],
    [
      { t: '+100 علامة تجارية في +20 قطاعًا', h: true, c: CYAN },
      { t: 'إدارة المحتوى والإبداع', h: false },
      { t: 'مواقع ومتاجر إلكترونية', h: false },
      { t: '+650 حملة تسويقية', h: true, c: MINT },
      { t: 'الظهور في البحث ومحركات الذكاء الاصطناعي', h: false }
    ],
    [
      { t: '+50,000 عميل محتمل وعملية شراء', h: true, c: MINT },
      { t: 'الأتمتة والذكاء الاصطناعي', h: false },
      { t: '+50% متوسط تحسّن العائد', h: true, c: CYAN },
      { t: 'قيادة الفرق وتوجيهها', h: false },
      { t: 'قرارات مبنية على البيانات', h: false }
    ],
    [
      { t: '+3.7M مشاهدة فيديو', h: true, c: CYAN },
      { t: 'تحسين تجربة العميل والتحويل', h: false },
      { t: '+200 استراتيجية مُختبرة', h: true, c: MINT },
      { t: 'استشارات لأكثر من 50 صاحب عمل', h: false },
      { t: 'تحليل الأسواق والتوسع', h: false }
    ]
  ] : [
    [
      { t: '7+ YEARS BUILDING GROWTH', h: true, c: MINT },
      { t: 'FULL-FUNNEL MARKETING STRATEGY', h: false },
      { t: '$1M+ AD SPEND MANAGED', h: true, c: CYAN },
      { t: 'BRAND POSITIONING', h: false },
      { t: '12 INTERNATIONAL MARKETS', h: true, c: MINT }
    ],
    [
      { t: '100+ BRANDS · 20+ INDUSTRIES', h: true, c: CYAN },
      { t: 'CONTENT & CREATIVE DIRECTION', h: false },
      { t: 'WEBSITES & E-COMMERCE', h: false },
      { t: '650+ CAMPAIGNS LAUNCHED', h: true, c: MINT },
      { t: 'SEO · AEO · GEO', h: false }
    ],
    [
      { t: '50,000+ LEADS & SALES DELIVERED', h: true, c: MINT },
      { t: 'AUTOMATION & GENERATIVE AI', h: false },
      { t: '+50% AVERAGE ROAS', h: true, c: CYAN },
      { t: 'TEAM LEADERSHIP & MENTORSHIP', h: false },
      { t: 'DATA-DRIVEN DECISIONS', h: false }
    ],
    [
      { t: '3.7M+ VIDEO VIEWS', h: true, c: CYAN },
      { t: 'CUSTOMER EXPERIENCE & CONVERSION', h: false },
      { t: '200+ STRATEGIES TESTED', h: true, c: MINT },
      { t: '50+ BUSINESS OWNERS ADVISED', h: false },
      { t: 'MARKET ANALYSIS & EXPANSION', h: false }
    ]
  ];

  // Container element
  const container = document.createElement('div');
  container.className = 'impact-kinetic-stream';
  container.setAttribute('aria-hidden', 'true');

  // Seconds per loop (half the track). Slow and calm.
  const speeds = [96, 108, 100, 112];

  rowsData.forEach((row, i) => {
    const rowEl = document.createElement('div');
    rowEl.className = `stream-row stream-row--${i % 2 === 0 ? 'left' : 'right'}`;

    const track = document.createElement('div');
    track.className = 'stream-track';
    track.style.setProperty('--stream-dur', `${speeds[i % speeds.length]}s`);

    // Repeating text content for seamless infinite looping
    let inner = '';
    let s = 0;
    for (let rep = 0; rep < 4; rep++) {
      row.forEach(item => {
        const color = item.h ? item.c : 'rgba(215, 235, 248, 0.62)';
        const glow = item.h ? `text-shadow: 0 0 12px ${item.c}88;` : '';
        const weight = item.h ? '800' : '600';
        inner += `<span class="stream-item" dir="${isAr ? 'rtl' : 'ltr'}" style="color:${color};font-weight:${weight};${glow}">${item.t}</span>`;
        // Stars spin + pulse; staggered so they never move in lockstep.
        inner += `<span class="stream-sep" aria-hidden="true" style="--i:${(s++ + i * 2) % 8}">✳</span>`;
      });
    }
    track.innerHTML = inner;
    rowEl.appendChild(track);
    container.appendChild(rowEl);
  });

  // Insert behind portrait
  stage.insertBefore(container, stage.firstChild);
})();
