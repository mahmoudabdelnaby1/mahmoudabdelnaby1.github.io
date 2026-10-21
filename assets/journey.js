import * as THREE from './vendor/three.module.js';

const root = document.querySelector('.journey-experience');
const canvas = document.querySelector('#growth-scene');
if (root && canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visual = document.querySelector('.journey-art');
  const fallback = document.querySelector('.journey-static');
  const stages = [...document.querySelectorAll('.journey-chapter[data-step]')];
  const controls = [...document.querySelectorAll('[data-stage]')];
  const title = document.querySelector('#journey-active-name');
  const description = document.querySelector('#journey-active-description');
  const number = document.querySelector('#journey-active-number');
  let renderer, scene, camera, system, beads = [];
  let width = 0, height = 0, activeStage = 0, visible = true, raf = 0;
  const motionEnabled = true;
  let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0, time = 0;

  const palette = [0xe05d3f, 0x668c7b, 0xd0a64c, 0x5e718d];
  const phaseText = controls.map(button => ({
    name: button.dataset.name || button.textContent.trim(),
    description: button.dataset.description || ''
  }));

  function setStage(index, scrollToChapter = false) {
    activeStage = Math.max(0, Math.min(3, index));
    controls.forEach((button, i) => {
      const selected = i === activeStage;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (number) number.textContent = `0${activeStage + 1} / 04`;
    if (title) title.textContent = phaseText[activeStage]?.name || '';
    if (description) description.textContent = phaseText[activeStage]?.description || '';
    if (system?.userData?.nodes) system.userData.nodes.forEach((node, i) => {
      node.userData.targetScale = i === activeStage ? 1.24 : 1;
    });
    if (scrollToChapter) stages[activeStage]?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    renderOnce();
  }

  controls.forEach(button => button.addEventListener('click', () => setStage(Number(button.dataset.stage), true)));
  if ('IntersectionObserver' in window && stages.length) {
    const observer = new IntersectionObserver(entries => {
      const candidates = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (candidates[0]) setStage(Number(candidates[0].target.dataset.step));
    }, { rootMargin: '-28% 0px -34% 0px', threshold: [0.08, 0.22, 0.45, 0.7] });
    stages.forEach(stage => observer.observe(stage));
  }

  function makeScene() {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !matchMedia('(max-width: 700px)').matches, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(max-width: 700px)').matches ? 1.15 : 1.45));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(0, 0.04, 8.7);
      scene.add(new THREE.HemisphereLight(0xfff5e7, 0x4d4842, 2.0));
      const key = new THREE.DirectionalLight(0xffe4bf, 3.2);
      key.position.set(-3.5, 4, 5);
      scene.add(key);
      const rim = new THREE.PointLight(0x80b4a0, 14, 12, 2);
      rim.position.set(3, 1, -2);
      scene.add(rim);

      system = new THREE.Group();
      system.position.y = 0.5;
      scene.add(system);
      const positions = [
        new THREE.Vector3(-1.72, 0.63, 0.1),
        new THREE.Vector3(-0.64, -0.3, 0.52),
        new THREE.Vector3(0.64, 0.48, -0.38),
        new THREE.Vector3(1.72, -0.25, 0.14)
      ];
      const curve = new THREE.CatmullRomCurve3(positions, false, 'centripetal');
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 120, 0.035, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x314c43, roughness: 0.36, metalness: 0.24 })
      );
      system.add(rail);
      const underRail = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(positions.map((p, i) => p.clone().add(new THREE.Vector3(0, i % 2 ? -0.1 : 0.1, -0.12))), false, 'centripetal'), 120, 0.009, 5, false),
        new THREE.MeshBasicMaterial({ color: 0xd08d54, transparent: true, opacity: 0.65 })
      );
      system.add(underRail);

      const nodes = [];
      const enamel = (color, roughness = 0.25) => new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0.16, clearcoat: 0.85, clearcoatRoughness: 0.18 });
      const glow = (color, opacity = 0.86) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      positions.forEach((position, i) => {
        const group = new THREE.Group();
        group.position.copy(position);
        const color = palette[i];
        if (i === 0) {
          // REACH: a dimensional bullseye with broadcast ripples.
          group.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), enamel(color)));
          [0.32, 0.49, 0.67].forEach((radius, ring) => {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(radius, ring === 1 ? 0.018 : 0.009, 8, 72), glow(color, ring === 1 ? 0.95 : 0.58));
            halo.rotation.x = Math.PI * (0.38 + ring * 0.08);
            halo.rotation.y = ring * 0.6;
            group.add(halo);
            if (ring === 1) group.userData.halo = halo;
          });
          const cross = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.006, 4, 72), glow(0xf1bd72, 0.6));
          cross.rotation.set(1.1, 0.35, 0.2);
          group.add(cross);
        } else if (i === 1) {
          // ENGAGE: stacked conversation cards and a live typing pulse.
          const bubbleShape = new THREE.Shape();
          bubbleShape.moveTo(-0.3, -0.2); bubbleShape.lineTo(0.3, -0.2); bubbleShape.lineTo(0.3, 0.2); bubbleShape.lineTo(-0.08, 0.2); bubbleShape.lineTo(-0.23, 0.34); bubbleShape.lineTo(-0.2, 0.2); bubbleShape.lineTo(-0.3, 0.2); bubbleShape.closePath();
          const bubbleGeometry = new THREE.ExtrudeGeometry(bubbleShape, { depth: 0.11, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025 });
          const backBubble = new THREE.Mesh(bubbleGeometry, enamel(0xe0bc75));
          backBubble.position.set(0.12, 0.12, -0.16); backBubble.rotation.z = 0.18; group.add(backBubble);
          const frontBubble = new THREE.Mesh(bubbleGeometry, enamel(color));
          frontBubble.position.set(-0.17, -0.04, 0.02); frontBubble.rotation.z = -0.12; group.add(frontBubble);
          [-0.13, 0, 0.13].forEach((x, dot) => {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), glow(0xfff4dc));
            bead.position.set(x - 0.13, 0.015, 0.17); bead.userData.pulseOffset = dot * 0.9; group.add(bead);
          });
        } else if (i === 2) {
          // CONVERT: a clear narrowing funnel with a result at its outlet.
          const profile = [new THREE.Vector2(0.48, 0.28), new THREE.Vector2(0.4, 0.06), new THREE.Vector2(0.27, -0.13), new THREE.Vector2(0.1, -0.36), new THREE.Vector2(0.1, -0.46)];
          const funnel = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), enamel(color, 0.3));
          group.add(funnel);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.025, 10, 64), glow(0xffd273));
          rim.position.y = 0.27; group.add(rim);
          const result = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), enamel(0xffdf9a, 0.16));
          result.position.y = -0.36; result.userData.result = true; group.add(result);
        } else {
          // RETAIN: a closed customer loop with an orbiting return signal.
          const loop = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.055, 16, 96), enamel(color));
          loop.rotation.set(0.76, 0.12, 0.2); group.add(loop); group.userData.loop = loop;
          const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.009, 6, 80), glow(0xe3be75, 0.8));
          orbit.rotation.set(1.22, 0.3, -0.35); group.add(orbit);
          const returnSignal = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), glow(0xff8868));
          returnSignal.position.set(0.46, 0.33, 0.22); returnSignal.userData.returnSignal = true; group.add(returnSignal);
        }
        group.userData = { ...group.userData, targetScale: 1, baseY: position.y, phase: i * 1.7 };
        nodes.push(group);
        system.add(group);
      });
      system.userData.nodes = nodes;

      const beadGeometry = new THREE.SphereGeometry(0.065, 16, 12);
      for (let i = 0; i < 5; i++) {
        const bead = new THREE.Mesh(beadGeometry, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf5c77b : 0xff8a67 }));
        system.add(bead);
        beads.push({ mesh: bead, offset: i / 5 });
      }

      const count = matchMedia('(max-width: 700px)').matches ? 34 : 72;
      const dust = new Float32Array(count * 3);
      let seed = 82;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < count; i++) {
        dust[i * 3] = (rand() - 0.5) * 5.2;
        dust[i * 3 + 1] = (rand() - 0.5) * 4.6;
        dust[i * 3 + 2] = (rand() - 0.5) * 2.6 - 0.5;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(dust, 3));
      const dustField = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x756d5e, size: 0.018, transparent: true, opacity: 0.42, sizeAttenuation: true }));
      system.add(dustField);
      system.userData.curve = curve;

      const resize = () => {
        const rect = visual.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        camera.aspect = width / height;
        camera.position.z = width < 520 ? 9.7 : width < 760 ? 9.15 : 8.7;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderOnce();
      };
      new ResizeObserver(resize).observe(visual);
      resize();
      fallback?.classList.add('is-hidden');
      canvas.classList.add('is-ready');

      visual.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch' || reducedMotion.matches) return;
        const rect = visual.getBoundingClientRect();
        targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18;
        targetX = ((event.clientY - rect.top) / rect.height - 0.5) * -0.12;
      }, { passive: true });
      visual.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; }, { passive: true });

      const visibility = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && motionEnabled) start();
        else { cancelAnimationFrame(raf); raf = 0; renderOnce(); }
      }, { threshold: 0.04 });
      visibility.observe(visual);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
        else if (visible && motionEnabled) start();
      });
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        fallback?.classList.remove('is-hidden');
        canvas.classList.remove('is-ready');
        cancelAnimationFrame(raf);
      });
      setStage(0);
      if (motionEnabled) start();
    } catch (error) {
      canvas.hidden = true;
      fallback?.classList.remove('is-hidden');
      console.info('Interactive growth scene unavailable; static route remains active.', error);
    }
  }

  function renderOnce() {
    if (!renderer || !scene || !camera || !visible || document.hidden) return;
    renderer.render(scene, camera);
  }
  function start() {
    if (raf || !renderer || !visible || document.hidden || !motionEnabled) return;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      time += 0.016;
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      system.rotation.x += (pointerX - system.rotation.x) * 0.032;
      system.rotation.y += (pointerY - system.rotation.y + Math.sin(time * 0.2) * 0.018) * 0.028;
      system.userData.nodes.forEach((node, i) => {
        const scale = node.userData.targetScale || 1;
        node.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.09);
        node.position.y = node.userData.baseY + Math.sin(time * 1.35 + i * 1.4) * 0.055;
        node.rotation.y = Math.sin(time * 0.65 + node.userData.phase) * 0.12;
        node.children.forEach(child => {
          if (child.userData.pulseOffset !== undefined) child.scale.setScalar(0.72 + 0.28 * (0.5 + 0.5 * Math.sin(time * 4 + child.userData.pulseOffset)));
          if (child.userData.result) child.rotation.y += 0.025;
          if (child.userData.returnSignal) child.position.set(Math.cos(time * 1.25) * 0.46, Math.sin(time * 1.25) * 0.34, 0.22);
        });
        if (node.userData.loop) node.userData.loop.rotation.z = Math.sin(time * 0.7 + i) * 0.18;
      });
      beads.forEach(({ mesh, offset }, i) => {
        const point = system.userData.curve.getPoint((time * 0.085 + offset) % 1);
        mesh.position.copy(point);
        mesh.scale.setScalar(i === activeStage ? 1.28 : 1);
      });
      renderer.render(scene, camera);
    };
    frame();
  }

  if (fallback) fallback.classList.remove('is-hidden');
  makeScene();
}
