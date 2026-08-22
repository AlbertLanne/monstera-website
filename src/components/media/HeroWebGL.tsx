'use client'

import { useEffect, useRef } from 'react'

/**
 * Couche WebGL d'ambiance derrière un hero — le régime « maximum ».
 *
 * **Ce qu'elle dessine, et pourquoi.** Une caustique : la trame de lumière que le soleil écrit au
 * fond de l'eau. Le sujet du site est une société genevoise, le lac est la première chose qu'on
 * voit de la ville, et la charte est déjà faite d'un navy profond et d'un ciel. L'effet n'est
 * donc pas un ornement générique posé sur un fond — il vient du lieu. Un champ de particules ou
 * une grille en perspective auraient coûté autant et n'auraient rien dit.
 *
 * **Ce qu'elle écoute.** Le défilement fait dériver la trame, et l'inclinaison du téléphone la
 * déplace latéralement : c'est la demande explicite du client, un effet qui vit sur mobile là où
 * `CursorGlow` ne peut rien faire faute de pointeur.
 *
 * **Ce qu'elle refuse de faire.** Se charger tant que le régime `max` n'est pas demandé, tourner
 * quand elle est hors écran ou l'onglet caché, et s'afficher si le visiteur a demandé moins de
 * mouvement. `three` pèse 178 Ko compressés : il ne part jamais dans le bundle initial.
 *
 * L'activation se lit sur `<html data-motion-intensite>` plutôt que par une propriété : le
 * contrôle qui change de régime vit ailleurs dans l'arbre, et un observateur d'attribut évite de
 * traverser la page avec un contexte pour un seul booléen.
 */
export function HeroWebGL() {
  const hote = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const racine = document.documentElement
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mouvementReduit.matches) return

    let demonter: (() => void) | null = null
    let chargement = false

    async function activer() {
      if (demonter || chargement) return
      chargement = true
      const arret = await construire(hote.current)
      chargement = false
      // Le régime a pu changer pendant le téléchargement de `three`.
      if (racine.dataset.motionIntensite === 'max') demonter = arret
      else arret?.()
    }

    function desactiver() {
      demonter?.()
      demonter = null
    }

    function suivreRegime() {
      if (racine.dataset.motionIntensite === 'max') void activer()
      else desactiver()
    }

    suivreRegime()
    const observateur = new MutationObserver(suivreRegime)
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-motion-intensite'] })

    return () => {
      observateur.disconnect()
      desactiver()
    }
  }, [])

  return <div ref={hote} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden" />
}

/** Lit une couleur de la charte et la rend au shader en sRGB brut, comme le fait `CursorGlow`. */
function couleurToken(nom: string, repli: [number, number, number]) {
  const brut = getComputedStyle(document.documentElement).getPropertyValue(nom).trim()
  const hex = brut.replace('#', '')
  if (hex.length !== 6) return repli
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
}

const VERTEX = /* glsl */ `
  void main() { gl_Position = vec4(position, 1.0); }
`

/**
 * Caustique par bandes repliées.
 *
 * Premier essai écarté : isoler les crêtes d'un bruit par `pow(1 - abs(n), 7)` donne des volutes
 * épaisses — de la fumée, pas de la lumière. Une caustique est faite de **filaments fins et
 * nombreux**, et c'est leur finesse qui la rend crédible.
 *
 * Le motif retenu passe donc le bruit dans un sinus à haute fréquence : chaque période produit
 * une bande, et `1 - abs(sin(...))` porté à une forte puissance n'en garde que l'arête. Le
 * domaine est déformé au préalable par un second bruit, ce qui courbe les bandes au lieu de les
 * laisser parallèles. Deux échelles se superposent, la seconde plus rapide et plus discrète,
 * pour éviter la régularité qui trahirait le procédé.
 *
 * L'opacité reste basse et le motif s'éteint vers le haut : le hero porte un logo, un surtitre
 * et un titre, et une trame lumineuse par-dessus les rendrait illisibles. L'effet vit dans le
 * bas de l'image, là où la photographie n'a rien à dire.
 *
 * Tramage d'un demi-niveau en fin de course, comme dans `CursorGlow` : sur un dégradé aussi
 * doux, un rendu en 8 bits par canal laisse voir des bandes.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2  uTilt;
  uniform vec3  uFond;
  uniform vec3  uCrete;
  uniform float uOpacity;

  float aleatoire(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float bruit(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(aleatoire(i), aleatoire(i + vec2(1.0, 0.0)), u.x),
      mix(aleatoire(i + vec2(0.0, 1.0)), aleatoire(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float somme = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      somme += amplitude * bruit(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return somme;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 3.2;

    // Le défilement fait dériver la trame vers le haut, l'inclinaison la pousse de côté.
    p += vec2(uTilt.x * 0.45, uTilt.y * 0.3 - uScroll * 1.1);

    float t = uTime * 0.05;

    // Déformation du domaine : c'est elle qui courbe les bandes au lieu de les laisser droites.
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.7, 1.3) - t));

    // Bandes repliées : le sinus multiplie les arêtes, la puissance les affine.
    float onde = fbm(p + q * 1.6) * 11.0 + t * 2.2;
    float filament = pow(1.0 - abs(sin(onde)), 9.0);

    // Seconde échelle, plus rapide et plus faible : casse la régularité de la première.
    float onde2 = fbm(p * 2.3 + q - t * 0.7) * 17.0 - t * 1.6;
    filament += pow(1.0 - abs(sin(onde2)), 12.0) * 0.55;

    // Le motif s'éteint vers le haut, où se trouvent le logo, le surtitre et le titre.
    float fondu = 1.0 - smoothstep(0.10, 0.78, uv.y);

    float intensite = clamp(filament, 0.0, 1.0) * fondu;

    vec3 couleur = mix(uFond, uCrete, intensite);
    float alpha = intensite * 0.42 * uOpacity;

    float tramage = (aleatoire(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(couleur + tramage, alpha);
  }
`

/** Monte la scène et rend une fonction de démontage, ou `null` si WebGL est indisponible. */
async function construire(conteneur: HTMLDivElement | null): Promise<(() => void) | null> {
  if (!conteneur) return null

  const THREE = await import('three')

  let renderer: InstanceType<typeof THREE.WebGLRenderer>
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
  } catch {
    return null // Pas de contexte WebGL : le hero garde sa photographie, et c'est tout.
  }

  // Le motif est diffus : le rendre au ratio de l'écran ne se verrait pas et coûterait cher sur
  // un téléphone. Plafonné à 1.5, il reste net et divise le nombre de pixels par deux.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearAlpha(0)
  conteneur.append(renderer.domElement)
  Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uTilt: { value: new THREE.Vector2(0, 0) },
    uFond: { value: new THREE.Vector3(...couleurToken('--color-navy-950', [0.03, 0.07, 0.16])) },
    uCrete: { value: new THREE.Vector3(...couleurToken('--color-sky', [0.44, 0.66, 1])) },
    uOpacity: { value: 0 },
  }

  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  scene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthTest: false,
      }),
    ),
  )

  function redimensionner() {
    const { clientWidth: l, clientHeight: h } = conteneur!
    if (!l || !h) return
    renderer.setSize(l, h, false)
    uniforms.uResolution.value.set(l * renderer.getPixelRatio(), h * renderer.getPixelRatio())
  }
  redimensionner()

  const inclinaison = { x: 0, y: 0 }

  function surInclinaison(event: DeviceOrientationEvent) {
    // gamma : roulis gauche/droite, beta : tangage. Bornés, sinon un quart de tour du poignet
    // enverrait la trame hors champ.
    inclinaison.x = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 45))
    inclinaison.y = Math.max(-1, Math.min(1, ((event.beta ?? 0) - 45) / 45))
  }

  function surPointeur(event: PointerEvent) {
    inclinaison.x = (event.clientX / window.innerWidth - 0.5) * 2
    inclinaison.y = (event.clientY / window.innerHeight - 0.5) * 2
  }

  // iOS n'envoie l'orientation qu'après un accord explicite, et ne le demande que depuis un geste
  // du visiteur. Le premier appui sur la page en fournit un ; s'il est refusé ou indisponible,
  // le défilement suffit à animer la trame et le pointeur prend le relais sur ordinateur.
  type AvecPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }
  const OrientationAvecPermission = window.DeviceOrientationEvent as unknown as AvecPermission

  async function demanderOrientation() {
    window.removeEventListener('pointerdown', demanderOrientation)
    try {
      if (typeof OrientationAvecPermission?.requestPermission === 'function') {
        const reponse = await OrientationAvecPermission.requestPermission()
        if (reponse !== 'granted') return
      }
      window.addEventListener('deviceorientation', surInclinaison)
    } catch {
      /* Orientation indisponible : la trame vit du défilement seul. */
    }
  }

  if (typeof OrientationAvecPermission?.requestPermission === 'function') {
    window.addEventListener('pointerdown', demanderOrientation)
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', surInclinaison)
  }
  window.addEventListener('pointermove', surPointeur, { passive: true })
  window.addEventListener('resize', redimensionner)

  // Ne pas dessiner ce que personne ne regarde : hors écran ou onglet caché, la boucle s'arrête.
  let visible = true
  const vigie = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) relancer()
  })
  vigie.observe(conteneur)

  const debut = performance.now()
  let frame = 0
  let arrete = false

  function boucle(maintenant: number) {
    frame = 0
    if (arrete) return

    uniforms.uTime.value = (maintenant - debut) / 1000
    uniforms.uOpacity.value += (1 - uniforms.uOpacity.value) * 0.04

    const boite = conteneur!.getBoundingClientRect()
    // Progression du hero dans la fenêtre, de 0 à 1 : c'est elle qui fait dériver la trame.
    uniforms.uScroll.value = Math.max(0, Math.min(1, -boite.top / Math.max(1, boite.height)))

    const cible = uniforms.uTilt.value
    cible.x += (inclinaison.x - cible.x) * 0.05
    cible.y += (inclinaison.y - cible.y) * 0.05

    renderer.render(scene, camera)
    relancer()
  }

  function relancer() {
    if (!frame && visible && !document.hidden && !arrete) frame = requestAnimationFrame(boucle)
  }

  document.addEventListener('visibilitychange', relancer)
  relancer()

  return () => {
    arrete = true
    if (frame) cancelAnimationFrame(frame)
    vigie.disconnect()
    window.removeEventListener('deviceorientation', surInclinaison)
    window.removeEventListener('pointerdown', demanderOrientation)
    window.removeEventListener('pointermove', surPointeur)
    window.removeEventListener('resize', redimensionner)
    document.removeEventListener('visibilitychange', relancer)
    renderer.domElement.remove()
    renderer.dispose()
  }
}
