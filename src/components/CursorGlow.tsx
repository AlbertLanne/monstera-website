'use client'

import { useEffect, useRef } from 'react'

/** Éléments au survol desquels le halo se resserre et s'intensifie. */
const INTERACTIFS = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]'

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

/**
 * Un halo doux centré sur le pointeur, plus un anneau qui se resserre sur les éléments cliquables.
 *
 * Trois choses font la différence entre une lueur et le disque en escalier qu'on obtient
 * naïvement :
 *
 * — **`highp`.** En `mediump` — 16 bits sur la plupart des GPU mobiles et sur les Apple Silicon —
 *   la distance au pointeur est quantifiée, et le dégradé sort en marches concentriques.
 * — **Une gaussienne plutôt qu'un `smoothstep`.** `smoothstep` s'arrête net à son rayon : le halo
 *   a un bord, et ce bord se voit. `exp(-d²)` n'en a pas, il s'éteint tout seul.
 * — **Un tramage d'un demi-niveau.** Même en 32 bits, la sortie est écrite sur 8 bits par canal :
 *   un dégradé aussi lent produit des anneaux de banding. Un bruit d'amplitude 1/255 les casse,
 *   pour un grain invisible à l'œil.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uRing;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;

  float tramage(vec2 pixel) {
    return fract(sin(dot(pixel, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  }

  void main() {
    vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
    float d = distance(p, uPointer) / uRadius;

    float halo = exp(-d * d * 2.1);
    float anneau = exp(-pow((d - 0.78) / 0.16, 2.0));

    float alpha = (halo * 0.40 + anneau * 0.34 * uRing) * uOpacity;
    alpha += tramage(gl_FragCoord.xy) * 0.0039;

    gl_FragColor = vec4(uColor, max(alpha, 0.0));
  }
`

/** Lit une couleur de thème et la convertit en composantes 0–1 pour le shader. */
function couleurDeTheme(): [number, number, number] {
  const brut = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-contrast')
    .trim()
  const hex = brut.replace('#', '')
  if (hex.length !== 6) return [0.44, 0.66, 1] // Repli sur le ciel de la charte.
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}

/**
 * Pointeur WebGL — une lueur qui suit la souris avec inertie.
 *
 * Trois raisons de ne rien afficher du tout : un écran tactile (il n'y a pas de pointeur à
 * suivre), une préférence de mouvement réduit, ou l'absence de contexte WebGL. Dans ces cas le
 * curseur du système reste seul, et `three` n'est même pas téléchargé.
 *
 * Le téléchargement attend en outre le premier mouvement de souris. `three` pèse 178 Ko une fois
 * compressé : le charger dès l'hydratation le mettrait en concurrence avec la vidéo du hero et
 * les polices, pour un effet que personne ne voit tant que la souris n'a pas bougé.
 *
 * La boucle de rendu s'arrête d'elle-même quand la lueur a rattrapé le pointeur : sans cela un
 * onglet ouvert consommerait une image toutes les 16 ms pour dessiner une image identique.
 */
export function CursorGlow() {
  const hote = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)')
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finPointeur.matches || mouvementReduit.matches) return

    const conteneur = hote.current
    if (!conteneur) return

    let arrete = false
    let demonter: (() => void) | null = null

    // `three` ne part dans le bundle initial sous aucun prétexte : le site doit s'afficher avant.
    function charger(premier: PointerEvent) {
      if (premier.pointerType !== 'mouse') return
      window.removeEventListener('pointermove', charger)
      void construire(premier)
    }

    window.addEventListener('pointermove', charger, { passive: true })

    async function construire(premier: PointerEvent) {
      const THREE = await import('three')
      if (arrete || !conteneur) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        })
      } catch {
        return // Pas de WebGL : on s'en passe.
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearAlpha(0)
      conteneur.append(renderer.domElement)

      const uniforms = {
        uPointer: { value: new THREE.Vector2(0, -2) }, // Hors écran tant que rien n'a bougé.
        uAspect: { value: window.innerWidth / window.innerHeight },
        uRadius: { value: 0.11 },
        uRing: { value: 0 },
        // Vector3 et non Color : ce shader écrit `gl_FragColor` sans passer par la conversion
        // d'espace colorimétrique de three, il faut donc lui donner du sRGB tel quel.
        uColor: { value: new THREE.Vector3(...couleurDeTheme()) },
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

      const cible = { x: 0, y: -2, rayon: 0.11, anneau: 0, opacite: 0 }
      let frame = 0
      let anime = false

      function versEspaceShader(clientX: number, clientY: number) {
        // Origine au centre, Y vers le haut, X corrigé du rapport d'écran pour un halo rond.
        cible.x = (clientX / window.innerWidth - 0.5) * uniforms.uAspect.value
        cible.y = 0.5 - clientY / window.innerHeight
      }

      function boucle() {
        const p = uniforms.uPointer.value
        // Inertie : la lueur traîne derrière le pointeur, c'est tout l'effet.
        p.x += (cible.x - p.x) * 0.13
        p.y += (cible.y - p.y) * 0.13
        uniforms.uRadius.value += (cible.rayon - uniforms.uRadius.value) * 0.09
        uniforms.uRing.value += (cible.anneau - uniforms.uRing.value) * 0.09
        uniforms.uOpacity.value += (cible.opacite - uniforms.uOpacity.value) * 0.06

        renderer.render(scene, camera)

        const immobile =
          Math.abs(cible.x - p.x) < 0.0004 &&
          Math.abs(cible.y - p.y) < 0.0004 &&
          Math.abs(cible.rayon - uniforms.uRadius.value) < 0.0004 &&
          Math.abs(cible.anneau - uniforms.uRing.value) < 0.004 &&
          Math.abs(cible.opacite - uniforms.uOpacity.value) < 0.004

        if (immobile) {
          anime = false
          frame = 0
          return
        }
        frame = requestAnimationFrame(boucle)
      }

      function relancer() {
        if (anime) return
        anime = true
        frame = requestAnimationFrame(boucle)
      }

      function onPointerMove(event: PointerEvent) {
        if (event.pointerType !== 'mouse') return
        versEspaceShader(event.clientX, event.clientY)
        cible.opacite = 1
        relancer()
      }

      function onPointerOver(event: PointerEvent) {
        const survole = (event.target as Element | null)?.closest?.(INTERACTIFS)
        cible.rayon = survole ? 0.055 : 0.11
        cible.anneau = survole ? 1 : 0
        relancer()
      }

      function onLeave() {
        cible.opacite = 0
        relancer()
      }

      function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight)
        uniforms.uAspect.value = window.innerWidth / window.innerHeight
        relancer()
      }

      // La bascule d'entité change `--accent-contrast` : la lueur suit la marque affichée.
      const surveillance = new MutationObserver(() => {
        uniforms.uColor.value.set(...couleurDeTheme())
        relancer()
      })
      surveillance.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-brand'],
      })

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerover', onPointerOver, { passive: true })
      window.addEventListener('pointerdown', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
      window.addEventListener('blur', onLeave)
      window.addEventListener('resize', onResize)

      demonter = () => {
        if (frame) cancelAnimationFrame(frame)
        surveillance.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerover', onPointerOver)
        window.removeEventListener('pointerdown', onPointerMove)
        document.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('blur', onLeave)
        window.removeEventListener('resize', onResize)
        renderer.domElement.remove()
        renderer.dispose()
      }

      // Le halo se place là où la souris se trouvait déjà : sans cela il partirait du coin.
      onPointerMove(premier)
    }

    return () => {
      arrete = true
      window.removeEventListener('pointermove', charger)
      demonter?.()
    }
  }, [])

  return (
    <div
      ref={hote}
      aria-hidden="true"
      // Au-dessus de tout pour que la lueur passe sur l'en-tête fixe, mais transparent au clic :
      // le site doit rester utilisable exactement comme s'il n'existait pas. Le mode de fusion
      // dépend du thème et vit dans `globals.css` : additif sur le fond sombre d'Advisors,
      // multiplicatif sur le blanc d'Investments, où l'additif ne produirait rien.
      className="cursor-glow pointer-events-none fixed inset-0 z-100"
    />
  )
}
