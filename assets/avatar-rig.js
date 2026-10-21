/*
 * Seamless living portrait.
 * The original illustration is never cut into pieces. Every movement (breathing,
 * head, wave, blink, mouse fingers) is a smooth deformation field applied to the
 * single source image in a WebGL shader, so there are no seams, holes or overlays.
 * Rest pose == the untouched original image. Falls back to the static <img>.
 */
(() => {
  const portrait = document.querySelector('.impact-stage--approved .impact-portrait');
  const img = portrait && portrait.querySelector('img.impact-avatar');
  if (!portrait || !img) return;

  const IMG_W = 1451, IMG_H = 1084;
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  // All rig coordinates are in source-image pixels (1451 x 1084).
  const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_canvas;
uniform float u_breath;
uniform vec3 u_head;      // angle(rad), tx, ty
uniform vec2 u_hand;      // wave angle(rad), lift(px)
uniform vec3 u_handIdle;  // idleRot(rad), idleSway(px), fingerCurl(px)
uniform vec2 u_armSwing;  // whole-arm rotation(rad) from shoulder, vertical shift(px)
uniform vec4 u_fingers;   // index curl, middle curl, thumb curl, spread(px)
uniform vec3 u_mouse;     // glide x(px), glide y(px), finger tap(px)
uniform float u_blink;    // 0 open .. 1 closed
uniform float u_shoulder; // asymmetric shoulder shift (px)
uniform vec3 u_legs;      // leftKneeLift, rightFootTap, kneeSwing(px)
uniform float u_mouseRot; // wrist micro-rotation (rad)
uniform float u_torsoLean; // upper-body lean from waist (rad)
const vec2 SIZE = vec2(${IMG_W}.0, ${IMG_H}.0);

float ell(vec2 p, vec2 c, vec2 r, float a, float b){
  vec2 q = (p - c) / r; return 1.0 - smoothstep(a, b, length(q));
}
vec2 rot(vec2 p, vec2 pivot, float ang){
  float c = cos(ang), s = sin(ang); vec2 d = p - pivot;
  return pivot + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}
vec2 disp(vec2 s){
  vec2 d = vec2(0.0);
  // ---- Torso lean: whole upper body tilts from waist pivot ----
  // Mask: everything above the table (~y<480), fading at the waist.
  float torsoMask = smoothstep(500.0, 420.0, s.y);
  // Stronger at the top (head/shoulders), softer near waist.
  torsoMask *= torsoMask;  // quadratic: head moves more than waist
  d += torsoMask * (rot(s, vec2(730.0, 490.0), u_torsoLean) - s);
  // Breathing: chest, shoulders, arm and head rise together; zero at laptop top.
  float breathMask = smoothstep(450.0, 352.0, s.y);
  d.y -= u_breath * breathMask;
  // Shoulder sway: right shoulder dips when left rises (asymmetric, adds life).
  float shL = smoothstep(730.0, 640.0, s.x) * smoothstep(520.0, 600.0, s.x) * breathMask;
  float shR = smoothstep(730.0, 820.0, s.x) * smoothstep(910.0, 850.0, s.x) * breathMask;
  d.y += u_shoulder * (shR - shL);
  // Head: rigid above the jaw, blended through the neck (no cut line).
  float wh = smoothstep(350.0, 310.0, s.y) * smoothstep(600.0, 622.0, s.x) * smoothstep(885.0, 862.0, s.x);
  d += wh * (rot(s, vec2(737.0, 334.0), u_head.x) - s + u_head.yz);
  // Raised hand: wrist rotation blended into the cuff, plus a soft forearm lift.
  float ww = ell(s, vec2(545.0, 300.0), vec2(78.0, 100.0), 0.74, 1.0);
  d += ww * (rot(s, vec2(533.0, 400.0), u_hand.x) - s);
  d.y -= u_hand.y * ell(s, vec2(535.0, 330.0), vec2(74.0, 150.0), 0.6, 1.0);
  // Whole-arm swing from shoulder pivot (covers shoulder→elbow→wrist→fingers).
  float armMask = smoothstep(630.0, 590.0, s.x) * smoothstep(410.0, 370.0, s.y)
                * (1.0 - smoothstep(300.0, 350.0, s.y) * smoothstep(605.0, 580.0, s.x) * 0.0); // keep full arm
  // Taper off at shoulder joint so it blends into body, not a hard cut.
  float shoulderBlend = smoothstep(620.0, 580.0, s.x) * smoothstep(400.0, 360.0, s.y);
  armMask *= shoulderBlend;
  // Also include the upper arm region more broadly.
  float upperArm = smoothstep(650.0, 610.0, s.x) * smoothstep(420.0, 370.0, s.y) * smoothstep(250.0, 290.0, s.y);
  armMask = max(armMask, upperArm * 0.6);
  // Hand/fingertip region gets full weight.
  float handTip = ell(s, vec2(530.0, 260.0), vec2(60.0, 80.0), 0.5, 1.0);
  armMask = max(armMask, handTip);
  d += armMask * (rot(s, vec2(615.0, 380.0), u_armSwing.x) - s);
  d.y -= armMask * u_armSwing.y;
  // Raised hand idle: continuous wrist twist + gentle sway (conversational gesture).
  float hiWrist = ell(s, vec2(530.0, 280.0), vec2(50.0, 60.0), 0.5, 1.0);
  d += hiWrist * (rot(s, vec2(540.0, 340.0), u_handIdle.x) - s);
  d.x += u_handIdle.y * ww;   // lateral sway uses same hand mask
  // Finger curl on raised hand (index+middle fingertips area ~510,230).
  vec2 hf = (s - vec2(510.0, 235.0)) / vec2(22.0, 28.0);
  d.y += u_handIdle.z * exp(-dot(hf, hf));
  // ---- Individual finger animation on raised hand ----
  // Index finger tip ~(505, 222): curls downward (toward palm).
  vec2 fi = (s - vec2(505.0, 222.0)) / vec2(18.0, 30.0);
  float fiM = exp(-dot(fi, fi));
  d.y += u_fingers.x * fiM;
  d.x += u_fingers.x * fiM * 0.35;   // inward curl
  // Middle finger tip ~(518, 215): curls separately.
  vec2 fm = (s - vec2(520.0, 215.0)) / vec2(18.0, 30.0);
  float fmM = exp(-dot(fm, fm));
  d.y += u_fingers.y * fmM;
  d.x -= u_fingers.y * fmM * 0.25;
  // Thumb ~(488, 262): flexion/extension.
  vec2 ft = (s - vec2(488.0, 260.0)) / vec2(20.0, 22.0);
  float ftM = exp(-dot(ft, ft));
  d.x -= u_fingers.z * ftM;
  d.y += u_fingers.z * ftM * 0.5;
  // Finger spread: index+middle tips push apart laterally.
  d.x -= u_fingers.w * fiM;   // index goes left
  d.x += u_fingers.w * fmM;   // middle goes right
  // Mouse hand: whole hand + mouse glide on the table, plus index-finger click.
  float mw = ell(s, vec2(925.0, 570.0), vec2(80.0, 60.0), 0.55, 1.0);
  d.x += u_mouse.x * mw;
  d.y += u_mouse.y * mw;
  // Mouse wrist micro-rotation (adds organic feel without translating the hand).
  float mRot = ell(s, vec2(925.0, 570.0), vec2(55.0, 45.0), 0.5, 1.0);
  d += mRot * (rot(s, vec2(925.0, 600.0), u_mouseRot) - s);
  // Index finger tap (small, focused on fingertip).
  vec2 f = (s - vec2(907.0, 558.0)) / vec2(14.0, 16.0);
  d.y -= u_mouse.z * exp(-dot(f, f));
  // ---- Leg fidget ----
  // Left knee lift: region ~x=620-720, y=700-950, excludes table (y<660) and feet (y>960).
  float legL = smoothstep(580.0, 640.0, s.x) * smoothstep(740.0, 700.0, s.x)
             * smoothstep(660.0, 720.0, s.y) * smoothstep(960.0, 920.0, s.y);
  d.y -= u_legs.x * legL;
  d.x += u_legs.z * legL * 0.3; // slight lateral sway
  // Right foot tap: region ~x=730-830, y=880-1050 (lower leg / shoe area only).
  float legR = smoothstep(710.0, 750.0, s.x) * smoothstep(850.0, 810.0, s.x)
             * smoothstep(870.0, 910.0, s.y) * smoothstep(1060.0, 1020.0, s.y);
  d.y -= u_legs.y * legR;
  return d;
}
float eyeMap(vec2 q, float cx, float hw){
  float dx = (q.x - cx) / hw;
  float t = clamp(dx * dx, 0.0, 1.0);
  float T = mix(171.0, 177.5, t);      // upper lash line
  float L = 184.0 - 3.5 * smoothstep(0.8, 1.0, abs(dx));     // lower lash line
  float a = 161.0;                      // anchor below the brow
  float k = u_blink * (1.0 - smoothstep(0.9, 1.04, abs(dx)));
  if (q.y <= a || q.y >= L || k <= 0.0) return q.y;
  float closed = min((T + 1.2 - a) / (L - a), 1.0);
  return a + (q.y - a) * mix(1.0, closed, k);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y) / u_canvas * SIZE;
  vec2 s = p;
  for (int i = 0; i < 6; i++) s = p - disp(s);
  // Blink in head-local (rest) space: upper lid slides down to the lower lash line.
  s.y = eyeMap(s, 699.5, 24.5);
  s.y = eyeMap(s, 780.5, 24.5);
  vec2 uv = s / SIZE;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  gl_FragColor = texture2D(u_tex, vec2(uv.x, 1.0 - uv.y));
}`;

  const canvas = document.createElement('canvas');
  canvas.className = 'impact-avatar-rig';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  function compile(type, src) {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('avatar rig disabled:', e); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['u_tex', 'u_canvas', 'u_breath', 'u_head', 'u_hand', 'u_handIdle', 'u_armSwing', 'u_fingers', 'u_mouse', 'u_blink', 'u_shoulder', 'u_legs', 'u_mouseRot', 'u_torsoLean'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.uniform1i(U.u_tex, 0);

  // Upload a high-quality pre-scaled copy so the shader samples ~1:1 (no aliasing shimmer).
  const scaler = document.createElement('canvas');
  const sctx = scaler.getContext('2d');
  let cw = 0, ch = 0, ready = false;
  function resize() {
    const r = portrait.getBoundingClientRect();
    if (!r.width || !r.height || !img.complete || !img.naturalWidth) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.min(IMG_W, Math.round(r.width * dpr)), h = Math.round(w * IMG_H / IMG_W);
    if (w === cw && h === ch) return true;
    cw = w; ch = h; canvas.width = w; canvas.height = h; scaler.width = w; scaler.height = h;
    sctx.clearRect(0, 0, w, h); sctx.imageSmoothingEnabled = true; sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(img, 0, 0, w, h);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scaler);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.u_canvas, w, h);
    return true;
  }

  // ---------- Performance director: calm, varied, with short still moments ----------
  const rnd = (a, b) => a + Math.random() * (b - a);
  const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const P = { breath: 0, head: [0, 0, 0], hand: [0, 0], handIdle: [0, 0, 0], armSwing: [0, 0], fingers: [0, 0, 0, 0], mouse: [0, 0, 0], blink: 0, shoulder: 0, legs: [0, 0, 0], mouseRot: 0, torsoLean: 0 };
  let t = 0, breathPhase = 0;
  let nextBlink = 1.6, blinkAt = -9, doubleBlink = false;
  let nextWave = 1.4, waveAt = -99, waveCycles = 2.5;
  let nextTap = 4.5, tapAt = -9, doubleTap = false;
  let nextLook = 3, lookFrom = [0, 0], lookTo = [0, 0], lookAt = -9, lookDur = 1.6;
  // Leg fidget schedulers
  let nextKnee = 5, kneeAt = -9, kneeDir = 1;
  let nextFootTap = 7, footTapAt = -9, footTapCount = 2;
  // Mouse hand lift scheduler (occasional resettling)
  let nextMouseLift = 8, mouseLiftAt = -9;
  // Raised-hand gesture scheduler (conversational emphasis gestures)
  let nextGesture = 2.5, gestureAt = -9, gestureDur = 1.8, gestureAmp = 1;
  // Torso lean scheduler: shift weight left/right periodically
  let nextLean = 4, leanFrom = 0, leanTo = 0, leanAt = -9, leanDur = 2.5;

  function blinkCurve(u) { // seconds since blink start
    if (u < 0 || u > 0.26) return 0;
    if (u < 0.08) return smooth(u / 0.08);
    if (u < 0.12) return 1;
    return 1 - smooth((u - 0.12) / 0.14);
  }
  function compute(dt) {
    t += dt;
    // Breathing with a gently drifting rate (never perfectly periodic).
    breathPhase += dt * (2 * Math.PI) / (4.4 + 0.7 * Math.sin(t * 0.11));
    const breath = 0.5 - 0.5 * Math.cos(breathPhase);
    P.breath = 2.6 * breath;

    // Blink: random interval, occasional double blink.
    if (t >= nextBlink) { blinkAt = t; doubleBlink = Math.random() < 0.2; nextBlink = t + rnd(2.6, 5.8); }
    P.blink = Math.max(blinkCurve(t - blinkAt), doubleBlink ? blinkCurve(t - blinkAt - 0.34) : 0);

    // Idle gaze/head drift: moves to a new resting angle, then holds still.
    if (t >= nextLook && t - waveAt > 4) {
      lookFrom = lookTo.slice(); lookAt = t; lookDur = rnd(1.2, 2);
      lookTo = Math.random() < 0.35 ? [0, 0] : [rnd(-0.016, 0.016), rnd(-2, 2)];
      nextLook = t + rnd(3.5, 6.5);
    }
    const lk = smooth((t - lookAt) / lookDur);
    let headA = lookFrom[0] + (lookTo[0] - lookFrom[0]) * lk;
    let headX = lookFrom[1] + (lookTo[1] - lookFrom[1]) * lk;
    let headY = 0;

    // Greeting wave: raise, 2-3 friendly swings, settle back to the exact rest pose.
    if (t >= nextWave) { waveAt = t; waveCycles = Math.random() < 0.5 ? 2.5 : 2; nextWave = t + rnd(10, 15); }
    const w = t - waveAt, swing = 0.72, dur = 0.45 + waveCycles * swing + 0.7;
    let waveA = 0, lift = 0;
    if (w >= 0 && w <= dur) {
      const env = smooth(w / 0.45) * (1 - smooth((w - (dur - 0.7)) / 0.7));
      const osc = Math.sin(2 * Math.PI * Math.max(0, w - 0.25) / swing);
      waveA = env * 0.115 * osc;
      lift = env * 5;
      headA += -0.02 * env;                      // friendly tilt toward the waving hand
      headY += -1.2 * env;
      const nod = w - (dur - 0.75);              // small nod as the wave ends
      if (nod > 0 && nod < 0.7) headY += 2.2 * Math.sin(Math.PI * nod / 0.7);
    }
    P.head[0] = headA; P.head[1] = headX; P.head[2] = headY - 0.5 * breath;
    P.hand[0] = waveA; P.hand[1] = lift;

    // ---- Raised hand idle: always alive between waves ----
    // Continuous gentle wrist rotation (conversational, like explaining something).
    const isWaving = (w >= 0 && w <= dur);
    const idleFade = isWaving ? 0 : 1;  // suppress idle during active wave
    // Base organic twist: two slow sine waves with different frequencies.
    let idleRot = 0.028 * Math.sin(t * 0.55 + 1.2) + 0.015 * Math.sin(t * 0.32);
    // Lateral sway: hand drifts side-to-side gently.
    let idleSway = 2.0 * Math.sin(t * 0.38 + 0.5) + 1.0 * Math.sin(t * 0.72);
    // Finger curl: periodic small curl like tapping air.
    let fingerCurl = 1.5 * Math.max(0, Math.sin(t * 0.85));
    // Occasional conversational emphasis gesture (bigger motion burst).
    if (t >= nextGesture && !isWaving) {
      gestureAt = t; gestureDur = rnd(1.2, 2.2); gestureAmp = rnd(0.8, 1.5);
      nextGesture = t + rnd(3, 6);
    }
    const gU = t - gestureAt;
    if (gU >= 0 && gU <= gestureDur) {
      const gEnv = Math.sin(Math.PI * gU / gestureDur);
      idleRot += gestureAmp * 0.04 * gEnv * Math.sin(2 * Math.PI * gU / 0.6);
      idleSway += gestureAmp * 3 * gEnv * Math.sin(2 * Math.PI * gU / 0.8);
      fingerCurl += gestureAmp * 2 * gEnv;
    }
    P.handIdle[0] = idleRot * idleFade;
    P.handIdle[1] = idleSway * idleFade;
    P.handIdle[2] = fingerCurl * idleFade;

    // ---- Individual finger fidget (each finger at its own rhythm) ----
    // Index: curl-uncurl cycle — large enough to be visible at display size.
    const fIndex = 15 * Math.max(0, Math.sin(t * 1.3 + 0.3));
    // Middle: slightly different rate, feels independent.
    const fMiddle = 13 * Math.max(0, Math.sin(t * 1.05 + 1.7));
    // Thumb: flexion/extension.
    const fThumb = 10 * Math.sin(t * 0.7 + 0.5);
    // Spread: fingers open and close.
    const fSpread = 8 * Math.sin(t * 0.5);
    P.fingers[0] = fIndex * idleFade;
    P.fingers[1] = fMiddle * idleFade;
    P.fingers[2] = fThumb * idleFade;
    P.fingers[3] = fSpread * idleFade;

    // ---- Whole-arm swing from shoulder (slow, gentle arcs) ----
    // Slow organic swing: the arm drifts between positions like natural gesturing.
    // Very conservative amplitude to avoid pixel distortion on 2D image.
    const armA = 0.035 * Math.sin(t * 0.22 + 0.4) + 0.015 * Math.sin(t * 0.41);
    const armY = 2.0 * Math.sin(t * 0.18 + 1.0);
    // During wave, suppress arm swing so they don't stack.
    P.armSwing[0] = armA * idleFade;
    P.armSwing[1] = armY * idleFade;

    // Mouse hand: visible glide across the table + occasional click.
    if (t >= nextTap) { tapAt = t; doubleTap = Math.random() < 0.3; nextTap = t + rnd(3.5, 6.5); }
    const tap = u => (u < 0 || u > 0.24) ? 0 : Math.sin(Math.PI * u / 0.24);
    // Organic figure-8-ish drift so the hand visibly moves the mouse.
    const mx = 7.5 * Math.sin(t * 0.34) + 3 * Math.sin(t * 0.17 + 0.8);
    const my = 3.5 * Math.sin(t * 0.26 + 1.5) + 1.5 * Math.cos(t * 0.42);
    P.mouse[0] = mx;
    P.mouse[1] = my;
    P.mouse[2] = 3.2 * Math.max(tap(t - tapAt), doubleTap ? tap(t - tapAt - 0.3) : 0);

    // Shoulder sway: gentle asymmetric motion synced loosely to breath.
    P.shoulder = 1.4 * Math.sin(breathPhase * 0.5 + 0.3) + 0.6 * Math.sin(t * 0.13);

    // ---- Torso lean: upper body shifts weight left/right ----
    // Smooth transition to a new lean angle, holds, then moves again.
    if (t >= nextLean) {
      leanFrom = leanTo;
      leanAt = t;
      leanDur = rnd(2.0, 3.5);
      // Right lean: full range. Left lean: very gentle to avoid distortion.
      const r3 = Math.random();
      leanTo = r3 < 0.20 ? rnd(-0.01, 0.01) : r3 < 0.60 ? rnd(0.10, 0.18) : rnd(-0.02, -0.05);
      nextLean = t + leanDur + rnd(2.0, 4.5);
    }
    const leanU = smooth(Math.min(1, (t - leanAt) / leanDur));
    P.torsoLean = leanFrom + (leanTo - leanFrom) * leanU;

    // ---- Leg fidget ----
    // Left knee: occasional slow lift-and-lower (like shifting weight in the chair).
    if (t >= nextKnee) { kneeAt = t; kneeDir = Math.random() < 0.5 ? 1 : -1; nextKnee = t + rnd(6, 12); }
    const kneeU = t - kneeAt, kneeDur = 2.5;
    let kneeLift = 0;
    if (kneeU >= 0 && kneeU <= kneeDur) {
      kneeLift = 3.5 * Math.sin(Math.PI * kneeU / kneeDur);
    }
    // Right foot: rhythmic tapping (2-3 quick taps, then stillness).
    if (t >= nextFootTap) { footTapAt = t; footTapCount = Math.random() < 0.4 ? 3 : 2; nextFootTap = t + rnd(7, 14); }
    let footTap = 0;
    const ftU = t - footTapAt;
    if (ftU >= 0) {
      for (let i = 0; i < footTapCount; i++) {
        const tapOffset = ftU - i * 0.35;
        if (tapOffset >= 0 && tapOffset <= 0.22) footTap += 2.5 * Math.sin(Math.PI * tapOffset / 0.22);
      }
    }
    // Knee lateral swing (very subtle swaying, always present like a fidget).
    const kneeSwing = 1.2 * Math.sin(t * 0.45) + 0.5 * Math.sin(t * 0.19);
    P.legs[0] = kneeLift;
    P.legs[1] = footTap;
    P.legs[2] = kneeSwing;

    // ---- Mouse wrist rotation (organic micro-twist) ----
    P.mouseRot = 0.018 * Math.sin(t * 0.28 + 0.7) + 0.008 * Math.sin(t * 0.52);
    // Occasional hand lift-and-resettle on mouse.
    if (t >= nextMouseLift) { mouseLiftAt = t; nextMouseLift = t + rnd(9, 18); }
    const mlU = t - mouseLiftAt, mlDur = 1.2;
    if (mlU >= 0 && mlU <= mlDur) {
      P.mouse[1] += -4 * Math.sin(Math.PI * mlU / mlDur); // lift up and settle back
      P.mouseRot += 0.03 * Math.sin(Math.PI * mlU / mlDur); // twist during resettle
    }
  }
  function draw(amp) {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.u_breath, P.breath * amp);
    gl.uniform3f(U.u_head, P.head[0] * amp, P.head[1] * amp, P.head[2] * amp);
    gl.uniform2f(U.u_hand, P.hand[0] * amp, P.hand[1] * amp);
    gl.uniform3f(U.u_handIdle, P.handIdle[0] * amp, P.handIdle[1] * amp, P.handIdle[2] * amp);
    gl.uniform2f(U.u_armSwing, P.armSwing[0] * amp, P.armSwing[1] * amp);
    gl.uniform4f(U.u_fingers, P.fingers[0] * amp, P.fingers[1] * amp, P.fingers[2] * amp, P.fingers[3] * amp);
    gl.uniform3f(U.u_mouse, P.mouse[0] * amp, P.mouse[1] * amp, P.mouse[2] * amp);
    gl.uniform1f(U.u_blink, Math.min(1, P.blink * amp));
    gl.uniform1f(U.u_shoulder, P.shoulder * amp);
    gl.uniform3f(U.u_legs, P.legs[0] * amp, P.legs[1] * amp, P.legs[2] * amp);
    gl.uniform1f(U.u_mouseRot, P.mouseRot * amp);
    gl.uniform1f(U.u_torsoLean, P.torsoLean * amp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ---------- Motion policy: reduced-motion + the site's motion button ----------
  let wantMotion = !reduceQuery.matches && !document.body.classList.contains('motion-off');
  let amp = wantMotion ? 1 : 0, raf = 0, last = 0, visible = true, frozen = null;
  function loop(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    const target = wantMotion ? 1 : 0;
    amp += (target - amp) * Math.min(1, dt * 5);
    if (Math.abs(target - amp) < 0.002) amp = target;
    if (!resize()) return;
    if (frozen) { Object.assign(P, frozen); draw(1); return; }
    compute(dt);
    draw(amp);
    if ((amp > 0 || wantMotion) && visible && !document.hidden) raf = requestAnimationFrame(loop);
    else last = 0;
  }
  function kick() { if (!raf && ready) raf = requestAnimationFrame(loop); }
  function start() {
    if (!resize()) return;
    ready = true;
    draw(0);
    portrait.classList.add('is-rigged');
    kick();
  }

  portrait.appendChild(canvas);
  if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
  new ResizeObserver(() => { if (ready && resize()) { draw(amp); kick(); } }).observe(portrait);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(portrait);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  document.addEventListener('portfolio-motion-change', e => { wantMotion = !!(e.detail && e.detail.enabled); kick(); });
  reduceQuery.addEventListener?.('change', ev => { wantMotion = !ev.matches && !document.body.classList.contains('motion-off'); kick(); });

  // Review hook (local QA only): freeze a pose, e.g. __avatarRig.pose({blink:1}); __avatarRig.pose(null) resumes.
  window.__avatarRig = {
    pose(p) {
      frozen = p ? { breath: 0, head: [0, 0, 0], hand: [0, 0], handIdle: [0, 0, 0], armSwing: [0, 0], fingers: [0, 0, 0, 0], mouse: [0, 0, 0], blink: 0, shoulder: 0, legs: [0, 0, 0], mouseRot: 0, torsoLean: 0, ...p } : null;
      if (!frozen) last = 0;
      if (frozen && ready) { resize(); Object.assign(P, frozen); draw(1); }
      kick();
    },
    get state() { return { wantMotion, amp, t, P: JSON.parse(JSON.stringify(P)) }; }
  };
})();
