'use client'

import { useEffect, useRef } from 'react'

/**
 * Le hero du régime « premium » : la photographie elle-même passée dans un shader.
 *
 * **Ce qui change par rapport à la couche d'ambiance précédente.** `HeroWebGL` dessinait une
 * caustique *derrière* une photographie inerte : l'effet et le sujet vivaient côte à côte sans se
 * toucher, et le résultat restait discret parce qu'une trame de lumière posée dans le vide n'a
 * rien à déformer. Ici la photographie **est** la texture. Tout ce que le shader fait, il le fait
 * au sujet : c'est ce qui sépare un fond animé d'un site qui réagit.
 *
 * **Quatre effets, et ce que chacun doit produire.**
 *
 * — *Déformation au pointeur.* Des ondes radiales dont l'amplitude suit une gaussienne centrée
 *   sur la souris et, surtout, **la vitesse du curseur** et non sa seule position. Un pointeur
 *   immobile ne creuse presque rien ; un geste rapide ouvre l'image et elle retombe en une
 *   seconde et demie. C'est cette dépendance à la vitesse qui donne une impression de matière —
 *   une déformation liée à la seule position produit un effet de loupe, décoratif et mort.
 *
 * — *Aberration chromatique.* Les trois canaux sont échantillonnés à des décalages différents,
 *   proportionnels à l'amplitude locale du déplacement. Nulle au repos, franche sous la main.
 *   C'est le détail qui lit « traitement optique » plutôt que « filtre CSS ».
 *
 * — *Balayage d'entrée de gauche à droite.* Une crête traverse l'image au chargement, en un peu
 *   plus d'une seconde, en portant une bande de lumière. Elle pose le vocabulaire latéral de la
 *   page dès la première seconde, avant même que le visiteur ait fait défiler.
 *
 * — *Caustique.* Conservée de la version précédente, mais **par-dessus** la photographie et à
 *   opacité franchement remontée : elle n'est plus une trame dans le vide, c'est la lumière sur
 *   l'eau de la vue aérienne. Le motif est décrit plus bas, à son endroit.
 *
 * **Ce qu'il refuse de faire.** Se charger hors du régime `premium`, tourner hors écran ou onglet
 * caché, et s'afficher si le visiteur a demandé moins de mouvement — dans ce dernier cas le
 * `<Image>` posé dessous par la page suffit, et `three` n'est jamais téléchargé.
 *
 * **Le `<Image>` du dessous n'est pas un doublon.** Il porte le LCP, il sert de repli sans WebGL,
 * et c'est lui qui s'affiche pendant le téléchargement de `three`. La page le passe en
 * `unoptimized` pour que le shader et lui demandent **le même fichier** : sans cela le navigateur
 * téléchargerait deux fois 345 Ko, une fois par `/_next/image` et une fois en direct.
 */
export function HeroPhotoWebGL({ src }: { src: string }) {
  const hote = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const racine = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let demonter: (() => void) | null = null
    let chargement = false

    async function activer() {
      if (demonter || chargement) return
      chargement = true
      const arret = await construire(hote.current, src)
      chargement = false
      // Le régime a pu changer pendant le téléchargement de `three` et de la texture.
      if (racine.dataset.motionIntensite === 'premium') demonter = arret
      else arret?.()
    }

    function suivreRegime() {
      if (racine.dataset.motionIntensite === 'premium') void activer()
      else {
        demonter?.()
        demonter = null
      }
    }

    suivreRegime()
    const observateur = new MutationObserver(suivreRegime)
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-motion-intensite'] })

    return () => {
      observateur.disconnect()
      demonter?.()
      demonter = null
    }
  }, [src])

  return <div ref={hote} aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden" />
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

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2  uResolution;   // taille du canvas, en pixels de rendu
  uniform vec2  uTexResolution;// taille de la photographie, pour le cadrage « cover »
  uniform float uTime;
  uniform vec2  uPointer;      // 0–1 dans le repère du hero, Y vers le haut
  uniform float uVitesse;      // 0–1, vitesse lissée du pointeur
  uniform float uScroll;       // 0–1, progression du hero hors de la fenêtre
  uniform float uBalayage;     // 0–1, progression du balayage d'entrée
  uniform float uOpacity;      // fondu du canvas par-dessus le <Image>
  uniform vec3  uFond;
  uniform vec3  uCrete;
  uniform vec3  uVoile;

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

  /* Cadrage « cover » : la photographie remplit la fenêtre sans se déformer, quel que soit le
     rapport de l'écran. On réduit la plage d'échantillonnage sur l'axe qui déborde plutôt que
     d'étirer l'image — un hero étiré se voit immédiatement sur un ultra-large. */
  vec2 cadrageCover(vec2 uv) {
    float ecran = uResolution.x / uResolution.y;
    float photo = uTexResolution.x / uTexResolution.y;
    vec2 echelle = ecran > photo
      ? vec2(1.0, photo / ecran)
      : vec2(ecran / photo, 1.0);
    return (uv - 0.5) * echelle + 0.5;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float ecran = uResolution.x / uResolution.y;

    // Repère corrigé du rapport d'écran : sans lui, la gaussienne du pointeur serait une ellipse
    // et l'onde s'écraserait horizontalement sur un écran large.
    vec2 p = vec2(uv.x * ecran, uv.y);
    vec2 pointeur = vec2(uPointer.x * ecran, uPointer.y);

    float distancePointeur = distance(p, pointeur);
    vec2 direction = distancePointeur > 0.0001
      ? (p - pointeur) / distancePointeur
      : vec2(0.0);

    // --- Déformation au pointeur -------------------------------------------------------------
    // L'amplitude au repos est volontairement non nulle : le hero respire même sans souris, ce
    // qui évite l'effet « rien ne bouge tant qu'on ne touche pas ». Mais c'est bien la vitesse
    // qui fait l'essentiel de l'ouverture.
    float halo = exp(-distancePointeur * distancePointeur * 7.0);
    float amplitude = halo * (0.006 + uVitesse * 0.055);
    float onde = sin(distancePointeur * 24.0 - uTime * 3.6);
    vec2 deplacement = direction * onde * amplitude;

    // Turbulence générale, elle aussi indexée sur la vitesse : un geste rapide fait frémir toute
    // l'image, pas seulement le disque sous le curseur.
    vec2 q = vec2(fbm(p * 2.6 + uTime * 0.08), fbm(p * 2.6 + vec2(5.2, 1.3) - uTime * 0.06));
    deplacement += (q - 0.5) * (0.004 + uVitesse * 0.016);

    // --- Balayage d'entrée, de gauche à droite -----------------------------------------------
    // Le front part hors champ à gauche et sort à droite. Il pousse la matière devant lui et
    // porte une bande de lumière : c'est l'entrée du hero, jouée une seule fois.
    float front = uBalayage * 1.45 - 0.22;
    float crete = exp(-pow((uv.x - front) / 0.075, 2.0));
    deplacement += vec2(crete * 0.045, crete * 0.012);

    // --- Échantillonnage avec aberration chromatique ------------------------------------------
    // Les trois canaux sont décalés le long de la déformation, proportionnellement à son
    // amplitude locale : invisible au repos, net sous la main.
    vec2 base = cadrageCover(uv);
    // Le défilement fait dériver la photographie vers le haut : le hero se referme au lieu de
    // simplement sortir de l'écran.
    base += vec2(0.0, uScroll * 0.07);

    float ampleur = length(deplacement);
    vec2 ecart = direction * ampleur * 0.55 + deplacement * 0.35;

    vec3 couleur;
    couleur.r = texture2D(uTexture, base + deplacement + ecart).r;
    couleur.g = texture2D(uTexture, base + deplacement).g;
    couleur.b = texture2D(uTexture, base + deplacement - ecart).b;

    // La crête du balayage laisse une trace lumineuse derrière elle.
    couleur += uCrete * crete * 0.22;

    // --- Caustique ----------------------------------------------------------------------------
    // Reprise du motif précédent : un bruit passé dans un sinus à haute fréquence, dont chaque
    // période donne une bande, et dont 1 - abs(sin(...)) porté à une forte puissance ne garde
    // que l'arête. Le domaine est déformé au préalable, ce qui courbe les filaments au lieu de
    // les laisser parallèles. Posé cette fois **par-dessus** la photographie, il devient la
    // lumière sur l'eau plutôt qu'une trame dans le vide.
    vec2 c = p * 3.2 + vec2(uPointer.x * 0.35, -uScroll * 1.1);
    float t = uTime * 0.05;
    vec2 w = vec2(fbm(c + t), fbm(c + vec2(3.7, 1.3) - t));
    float filament = pow(1.0 - abs(sin(fbm(c + w * 1.6) * 11.0 + t * 2.2)), 9.0);
    filament += pow(1.0 - abs(sin(fbm(c * 2.3 + w - t * 0.7) * 17.0 - t * 1.6)), 12.0) * 0.55;
    // Le motif s'éteint vers le haut, où se trouvent le surtitre et le titre.
    filament *= 1.0 - smoothstep(0.10, 0.80, uv.y);
    couleur += uCrete * clamp(filament, 0.0, 1.0) * 0.30;

    // --- Fermeture au défilement ---------------------------------------------------------------
    // Le hero se referme sur le navy à mesure qu'il sort : le texte de la section suivante prend
    // le relais sur un fond qui s'est déjà éteint.
    couleur = mix(couleur, uVoile, smoothstep(0.05, 0.95, uScroll) * 0.8);

    // Vignetage doux : ramène le regard au centre, et masque le bord de l'image sous la
    // déformation la plus forte.
    float rayon = distance(uv, vec2(0.5));
    couleur = mix(couleur, uFond, smoothstep(0.55, 1.05, rayon) * 0.45);

    // Tramage d'un demi-niveau : sur un dégradé aussi lent, un rendu en 8 bits par canal laisse
    // voir des bandes concentriques.
    couleur += (aleatoire(gl_FragCoord.xy + uTime) - 0.5) / 255.0;

    gl_FragColor = vec4(couleur, uOpacity);
  }
`

/** Monte la scène et rend une fonction de démontage, ou `null` si WebGL est indisponible. */
async function construire(
  conteneur: HTMLDivElement | null,
  src: string,
): Promise<(() => void) | null> {
  if (!conteneur) return null

  const THREE = await import('three')

  let renderer: InstanceType<typeof THREE.WebGLRenderer>
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
  } catch {
    return null // Pas de contexte WebGL : le hero garde son <Image>, et c'est tout.
  }

  // 1.75 plutôt que le ratio natif : la photographie est déjà interpolée par la déformation,
  // rendre en 3× sur un téléphone récent triplerait le coût pour un gain invisible.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setClearAlpha(0)
  conteneur.append(renderer.domElement)
  Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

  // `NoColorSpace` : ce shader écrit `gl_FragColor` sans passer par la chaîne de conversion de
  // three. Déclarer la texture en sRGB ferait décoder le GPU vers le linéaire et l'image
  // sortirait délavée par rapport au `<Image>` posé dessous, qu'elle doit recouvrir sans coupure.
  const texture = await new THREE.TextureLoader().loadAsync(src).catch(() => null)
  if (!texture) {
    renderer.domElement.remove()
    renderer.dispose()
    return null
  }
  texture.colorSpace = THREE.NoColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  // La déformation peut sortir de [0,1] : sans ce mode, le bord de l'image se répéterait en
  // miroir sous la main. On étire le dernier pixel, ce qui ne se voit pas sous le vignetage.
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  const uniforms = {
    uTexture: { value: texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTexResolution: { value: new THREE.Vector2(texture.image.width, texture.image.height) },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.55) },
    uVitesse: { value: 0 },
    uScroll: { value: 0 },
    uBalayage: { value: 0 },
    uOpacity: { value: 0 },
    uFond: { value: new THREE.Vector3(...couleurToken('--color-navy-950', [0.03, 0.07, 0.16])) },
    uCrete: { value: new THREE.Vector3(...couleurToken('--color-sky', [0.44, 0.66, 1])) },
    uVoile: { value: new THREE.Vector3(...couleurToken('--color-navy-950', [0.03, 0.07, 0.16])) },
  }

  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  const materiau = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthTest: false,
  })
  const geometrie = new THREE.PlaneGeometry(2, 2)
  scene.add(new THREE.Mesh(geometrie, materiau))

  function redimensionner() {
    const { clientWidth: l, clientHeight: h } = conteneur!
    if (!l || !h) return
    renderer.setSize(l, h, false)
    uniforms.uResolution.value.set(l * renderer.getPixelRatio(), h * renderer.getPixelRatio())
  }
  redimensionner()

  // --- Pointeur ------------------------------------------------------------------------------
  // On mesure la vitesse plutôt que de la déduire du delta d'une frame : un `pointermove` peut
  // arriver plusieurs fois entre deux images, et la somme des déplacements est la seule mesure
  // fidèle du geste. Elle est ensuite lissée, puis décroît d'elle-même à l'arrêt.
  const cible = { x: 0.5, y: 0.55 }
  let vitesse = 0
  let dernier: { x: number; y: number } | null = null

  function surPointeur(event: PointerEvent) {
    const boite = conteneur!.getBoundingClientRect()
    const x = (event.clientX - boite.left) / Math.max(1, boite.width)
    const y = 1 - (event.clientY - boite.top) / Math.max(1, boite.height)
    if (dernier) vitesse = Math.min(1, vitesse + Math.hypot(x - dernier.x, y - dernier.y) * 6)
    dernier = { x, y }
    cible.x = x
    cible.y = y
  }

  // Sur téléphone, il n'y a pas de pointeur : l'inclinaison prend le relais, exactement comme
  // dans la version précédente. C'était une demande explicite du client.
  function surInclinaison(event: DeviceOrientationEvent) {
    cible.x = 0.5 + Math.max(-1, Math.min(1, (event.gamma ?? 0) / 45)) * 0.35
    cible.y = 0.5 - Math.max(-1, Math.min(1, ((event.beta ?? 0) - 45) / 45)) * 0.25
    vitesse = Math.min(1, vitesse + 0.02)
  }

  type AvecPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }
  const OrientationAvecPermission = window.DeviceOrientationEvent as unknown as AvecPermission

  // iOS n'envoie l'orientation qu'après un accord explicite, et ne le demande que depuis un geste
  // du visiteur. Le premier appui en fournit un ; refusé ou indisponible, le défilement et le
  // balayage d'entrée suffisent à animer le hero.
  async function demanderOrientation() {
    window.removeEventListener('pointerdown', demanderOrientation)
    try {
      if (typeof OrientationAvecPermission?.requestPermission === 'function') {
        const reponse = await OrientationAvecPermission.requestPermission()
        if (reponse !== 'granted') return
      }
      window.addEventListener('deviceorientation', surInclinaison)
    } catch {
      /* Orientation indisponible. */
    }
  }

  if (typeof OrientationAvecPermission?.requestPermission === 'function') {
    window.addEventListener('pointerdown', demanderOrientation)
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', surInclinaison)
  }
  window.addEventListener('pointermove', surPointeur, { passive: true })
  window.addEventListener('resize', redimensionner)

  // Ne pas dessiner ce que personne ne regarde.
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

    const secondes = (maintenant - debut) / 1000
    uniforms.uTime.value = secondes

    // Le balayage d'entrée dure 1,25 s et ne se rejoue pas. Le canvas se fond en même temps :
    // le `<Image>` du dessous ne doit jamais disparaître avant que la texture ne le recouvre.
    uniforms.uBalayage.value = Math.min(1, secondes / 1.25)
    uniforms.uOpacity.value += (1 - uniforms.uOpacity.value) * 0.07

    const boite = conteneur!.getBoundingClientRect()
    uniforms.uScroll.value = Math.max(0, Math.min(1, -boite.top / Math.max(1, boite.height)))

    const pointeur = uniforms.uPointer.value
    pointeur.x += (cible.x - pointeur.x) * 0.08
    pointeur.y += (cible.y - pointeur.y) * 0.08

    // Décroissance de la vitesse : ~1,5 s pour retomber à zéro à 60 images par seconde. C'est ce
    // retour lent qui donne l'impression d'une matière qui se referme, pas d'un effet coupé.
    vitesse *= 0.962
    uniforms.uVitesse.value += (vitesse - uniforms.uVitesse.value) * 0.12

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
    texture.dispose()
    geometrie.dispose()
    materiau.dispose()
    renderer.domElement.remove()
    renderer.dispose()
  }
}
