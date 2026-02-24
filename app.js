const stageGate = document.getElementById('stageGate');
const modePage = document.getElementById('modePage');

const modeConfig = {
  start: {
    title: '🌸 起步模式',
    note: '从一个小种子出发，把故事的第一口呼吸写出来。',
    fields: [
      { key: 'seed', label: '故事种子（必填）', tag: 'textarea', required: true },
      { key: 'lead', label: '主角一句话', tag: 'input' },
      { key: 'mood', label: '想要的情绪', tag: 'input' },
      { key: 'avoid', label: '不想写什么', tag: 'input' }
    ],
    actions: [
      { text: '✨ 给我三个故事方向', type: 'threeWays' },
      { text: '✨ 给我开场钩子', type: 'hook' },
      { text: '✨ 给我第一段落笔提示', type: 'firstDrop' }
    ]
  },
  push: {
    title: '🌷 推进模式',
    note: '故事已经在路上，只差一个转弯继续往前走。',
    fields: [
      { key: 'progress', label: '当前进度', tag: 'input' },
      { key: 'recent', label: '最近发生了什么', tag: 'textarea' },
      { key: 'goal', label: '我接下来想达到什么', tag: 'input' },
      { key: 'blockType', label: '卡点类型', tag: 'select', options: ['推进', '冲突', '动机', '节奏', '对话'] }
    ],
    actions: [
      { text: '⚡ 下一幕5个走向', type: 'nextFive' },
      { text: '⚡ 冲突升级', type: 'upgradeConflict' },
      { text: '⚡ 推荐最省力写法', type: 'easyPath' }
    ]
  },
  restart: {
    title: '🌙 重启模式',
    note: '灵感电量不足时，让核心矛盾重新亮起来。',
    fields: [
      { key: 'oneLine', label: '这本小说如果只剩一句话，它讲什么？', tag: 'textarea' },
      { key: 'scene', label: '你最舍不得删掉哪个场景？', tag: 'textarea' },
      { key: 'worst', label: '如果主角失败，最糟会发生什么？', tag: 'textarea' }
    ],
    actions: [
      { text: '🌊 放大冲突', type: 'amplify' },
      { text: '🌊 给我更狠版本', type: 'hardcore' },
      { text: '🌊 给我情绪片段写法', type: 'emotionSlice' }
    ]
  }
};

let currentMode = '';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const val = (key) => (document.getElementById(key)?.value || '').trim();

function renderStageGate() {
  stageGate.innerHTML = `
    <h2>🫧 现在卡在哪个阶段？</h2>
    <p>先选阶段，再进入只属于这一阶段的解卡页面。</p>
    <div class="stage-options">
      <button class="stage-btn" data-mode="start">🌸 起步模式</button>
      <button class="stage-btn" data-mode="push">🌷 推进模式</button>
      <button class="stage-btn" data-mode="restart">🌙 重启模式</button>
    </div>
  `;

  document.querySelectorAll('.stage-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderModePage(btn.dataset.mode));
  });
}

function renderModePage(mode) {
  currentMode = mode;
  stageGate.style.display = 'none';
  modePage.classList.add('show');

  const conf = modeConfig[mode];
  const fieldsHtml = conf.fields
    .map((f) => {
      if (f.tag === 'textarea') {
        return `<div class="field-item"><label for="${f.key}">${f.label}</label><textarea id="${f.key}" ${f.required ? 'required' : ''}></textarea></div>`;
      }
      if (f.tag === 'select') {
        return `<div class="field-item"><label for="${f.key}">${f.label}</label><select id="${f.key}">${f.options
          .map((opt) => `<option value="${opt}">${opt}</option>`)
          .join('')}</select></div>`;
      }
      return `<div class="field-item"><label for="${f.key}">${f.label}</label><input id="${f.key}" type="text" /></div>`;
    })
    .join('');

  const actionsHtml = conf.actions
    .map((a) => `<button class="generate-btn" data-action="${a.type}">${a.text}</button>`)
    .join('');

  modePage.innerHTML = `
    <div class="mode-layout">
      <section class="mode-head soft-card">
        <div>
          <h2>${conf.title}</h2>
          <p>${conf.note}</p>
        </div>
        <button id="backBtn" class="back-btn">← 重选阶段</button>
      </section>

      <section class="input-panel soft-card">
        <div class="fields-grid">${fieldsHtml}</div>
        <div class="action-row">${actionsHtml}</div>
      </section>

      <section class="result-panel soft-card">
        <div class="result-head">
          <h3>灵感花园回响</h3>
          <button id="copyBtn" class="copy-btn">复制结果</button>
        </div>
        <pre id="resultBox">填写完成后，点下按钮，让这一段故事继续发光 ✨</pre>
      </section>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => {
    modePage.classList.remove('show');
    modePage.innerHTML = '';
    stageGate.style.display = 'block';
    currentMode = '';
  });

  document.querySelectorAll('.generate-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const resultBox = document.getElementById('resultBox');
      resultBox.textContent = generateByMode(currentMode, btn.dataset.action);
    });
  });

  const copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', async () => {
    const resultBox = document.getElementById('resultBox');
    try {
      await navigator.clipboard.writeText(resultBox.textContent);
      copyBtn.textContent = '已复制';
      setTimeout(() => (copyBtn.textContent = '复制结果'), 800);
    } catch (_) {
      copyBtn.textContent = '复制失败';
      setTimeout(() => (copyBtn.textContent = '复制结果'), 800);
    }
  });
}

function generateByMode(mode, action) {
  if (mode === 'start') return generateStart(action);
  if (mode === 'push') return generatePush(action);
  return generateRestart(action);
}

function generateStart(type) {
  const seed = val('seed');
  if (!seed) return '请先写下故事种子，哪怕只是一句心动瞬间也可以。';
  const lead = val('lead') || '一位把秘密缝进衣角的人';
  const mood = val('mood') || pick(['潮湿暧昧', '轻甜微疼', '安静汹涌']);
  const avoid = val('avoid') || '脸谱化反派';

  const directionPool = [
    `雨夜里，${lead}捡到一封写给未来自己的信，信里点名今夜必须错过某个人。`,
    `${lead}在旧城图书馆的夹层里，发现每一本书都在记录同一场尚未发生的告别。`,
    `一场订婚前夜的停电，让${lead}听见墙里有人低声念出自己的真名。`,
    `${lead}受邀回到儿时小镇，却发现街口花店的橱窗每天都提前摆出明天会凋谢的花。`
  ];
  const conflictPool = [
    `想要${mood}的亲密，却被“${avoid}”式的命运推向误解。`,
    `越想守住珍贵关系，越被迫在诚实和保护之间切割自己。`,
    `每一次靠近真相，都会让主角失去一段真实记忆。`
  ];
  const hookPool = [
    `她在婚纱试衣镜里看见自己穿着丧服，而身后站着昨天刚死去的人。`,
    `凌晨三点，城市广播突然播报了她尚未说出口的分手台词。`,
    `那封信最后一句写着：天亮前别去看海，否则你会爱上不该回来的人。`
  ];
  const dropPool = [
    `第一段从“身体感受”起笔：指尖、气味、光线，把${mood}落在一个动作上。`,
    `先写主角最平常的一件小事，再让异样感像涟漪一样慢慢扩开。`,
    `开头三句只做一件事：让读者看见她正在失去什么。`
  ];

  const directions = Array.from({ length: 3 }, () => pick(directionPool));
  if (type === 'hook') directions[0] += '（以钩子为第一句落下）';
  if (type === 'firstDrop') directions[1] += '（第二段立即推进关系张力）';

  return `【故事方向】
1. ${directions[0]}
2. ${directions[1]}
3. ${directions[2]}

【冲突核心】
${pick(conflictPool)}

【开场钩子】
${pick(hookPool)}

【落笔提示】
${pick(dropPool)}`;
}

function generatePush(type) {
  const progress = val('progress') || '故事进行到中段';
  const recent = val('recent') || '两人刚建立脆弱同盟';
  const goal = val('goal') || '让关系和主线同时推进';
  const blockType = val('blockType') || '推进';

  const diagnosisPool = [
    `${progress}却停在“情绪已满、行动不足”的缝隙里。`,
    `目前段落的能量集中在回忆，现实动作不够锋利。`,
    `读者已感到风暴将至，但关键选择还没真正发生。`
  ];
  const nextPool = [
    `主角误把盟友当成背叛者，当晚做出会引发连锁后果的决定。`,
    `反派不出现，只送来一件旧物，迫使主角承认过去的谎言。`,
    `把“${goal}”拆成一次失败会立刻付出代价的小行动。`,
    `让最安静的配角说出最锋利的一句真话，关系格局立刻改写。`,
    `把${recent}的结果反转：看似赢下局面，实则失去更重要筹码。`,
    `下一幕直接切到不可撤销时刻，省去过渡解释。`,
    `安排一次被迫合作，把旧矛盾装进同一辆失控列车。`
  ];
  const costPool = [
    `代价是：主角保住目标，却在亲密关系里留下无法修复的裂纹。`,
    `代价是：推进了外部事件，但主角必须亲手放弃一个旧誓言。`,
    `代价是：真相更近一步，同时失去最信任她的人。`
  ];
  const priorityMap = {
    推进: '先选“不可撤销时刻”那条，段落速度会立刻拉起。',
    冲突: '先选“旧物触发谎言”那条，冲突会更贴身更痛。',
    动机: '先选“失败即代价的小行动”那条，人物动机会更清晰。',
    节奏: '先选“删过渡直切现场”那条，节奏会变得干净有力。',
    对话: '先选“安静角色说真话”那条，对话层次最容易爆开。'
  };

  const candidates = Array.from({ length: 5 }, () => pick(nextPool));
  if (type === 'upgradeConflict') candidates[0] = '主角最想守住的人主动站到对立面，冲突从事件升级为立场决裂。';
  if (type === 'easyPath') candidates[4] = '把大场面缩成“二人对峙 + 一件证据”，最省笔力却最见火花。';

  return `【诊断】
${pick(diagnosisPool)}（卡点：${blockType}）

【下一步行动候选】
1. ${candidates[0]}
2. ${candidates[1]}
3. ${candidates[2]}
4. ${candidates[3]}
5. ${candidates[4]}

【代价】
${pick(costPool)}

【建议优先选】
${priorityMap[blockType] || priorityMap.推进}`;
}

function generateRestart(type) {
  const oneLine = val('oneLine') || '一个人为了守住爱，必须先承认自己并不无辜';
  const scene = val('scene') || '雨夜天台的拥抱与沉默';
  const worst = val('worst') || '主角失去所有重要关系，只剩迟来的真相';

  const corePool = [
    `“${oneLine}”与“活得体面”正在互相撕扯。`,
    `主角渴望被理解，却一直用最容易被误读的方式求救。`,
    '爱与自我保护不是二选一，而是同一把双刃。'
  ];
  const strongPool = [
    `把“${scene}”提前到中段重演一次，但这次有人录下全部真相。`,
    '把隐藏秘密改成“所有人都知道，只有主角不敢承认”。',
    '让失败后果从个人痛感，扩大为整个家庭或群体的崩塌。'
  ];
  const extremePool = [
    `最狠版本：主角亲手达成了${worst}，并且无人替她辩白。`,
    '最狠版本：她终于赢了目标，却发现自己成了当初最厌恶的人。',
    '最狠版本：想救的人活下来了，但从此再也不愿叫她的名字。'
  ];
  const emotionPool = [
    '情绪片段以“动作-停顿-错觉”三拍写法：先写身体本能，再写不敢承认的念头，最后落在一句反常台词。',
    '片段从环境噪音切入，让风声、门响、呼吸压过对白，再用一句短句刺穿。',
    '让角色做一件与情绪相反的小动作，例如笑着整理袖口，却在下一秒掐破掌心。'
  ];

  let reinforced = pick(strongPool);
  let extreme = pick(extremePool);
  if (type === 'amplify') reinforced = `把矛盾公开化：${reinforced}`;
  if (type === 'hardcore') extreme = `再狠一层：${extreme}`;
  if (type === 'emotionSlice') reinforced += '（紧接一段高压情绪独白）';

  return `【当前核心矛盾】
${pick(corePool)}

【强化版】
${reinforced}

【极端版】
${extreme}

【情绪驱动写法】
${pick(emotionPool)}`;
}

renderStageGate();
