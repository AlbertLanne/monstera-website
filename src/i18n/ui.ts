/**
 * Les chaînes d'interface, dans les trois langues.
 *
 * **Ce fichier ne contient pas de contenu client.** Les vingt fiches livrées en français, en
 * anglais et en allemand vivent dans `src/content/<locale>/`, générées depuis les `.odt`. Ici ne
 * se trouvent que les libellés que nous avons écrits nous-mêmes — navigation, boutons, formulaire,
 * intitulés, textes alternatifs des photographies — dont le client n'a jamais fourni de version.
 * Leurs traductions anglaise et allemande sont produites par IA, sur décision d'Albert du
 * 23 août 2026.
 *
 * Deux exceptions, prises **dans les documents du client** plutôt que traduites :
 *
 * - `legal.*` — les intitulés de l'identité légale viennent des trois Impressum livrés
 *   (« Numéro du registre du commerce », « Commercial Register Number », « Handelsregister-Nr. »).
 *   Une mention légale ne se traduit pas à l'estime quand le client a écrit la sienne.
 * - `equipe.direction` et `equipe.experts` en français — intitulés de `TEAM NAME.odt`.
 *
 * `UIStrings` est déduit de l'objet français : ajouter une clé en français sans la traduire dans
 * les deux autres langues fait échouer `tsc`. C'est voulu — une chaîne oubliée sortirait en
 * français au milieu d'une page allemande.
 */

import type { Locale } from './locales'

const fr = {
  nav: {
    contact: 'Contact',
    accueilAria: 'Argentum — accueil',
    navigationAria: 'Navigation principale',
    ouvrirMenu: 'Ouvrir le menu',
    fermerMenu: 'Fermer le menu',
    entiteDuGroupe: 'Entité du groupe',
    langue: 'Langue',
    allerAuContenu: 'Aller au contenu',
    vueDEnsemble: 'Vue d’ensemble',
    societe: 'Société',
  },

  marque: {
    selecteurAria: 'Entité du groupe Argentum',
    afficher: 'Afficher',
    affichee: 'Affichée',
    vousConsultez: 'Vous consultez actuellement le site de cette société.',
    titre: 'Deux sociétés, une même approche du capital privé',
    intro:
      'Le groupe Argentum réunit deux sociétés anonymes genevoises aux périmètres complémentaires. ' +
      'Chaque société a son propre site : choisissez celle qui correspond à votre demande pour y accéder.',
    secteur: 'Secteur d’activité',
    registre: 'Registre du commerce',
    contact: 'Contact',
  },

  langue: {
    selecteurAria: 'Langue du site',
    bientot: 'disponible prochainement',
  },

  legal: {
    // Intitulés repris des trois Impressum du client.
    uid: 'Numéro d’identification de l’entreprise (UID)',
    registre: 'Numéro du registre du commerce',
    formeJuridique: 'Forme juridique',
    societeAnonyme: 'Société anonyme (SA)',
    secteur: 'Secteur d’activité',
    representant: 'Représentant autorisé',
    verifierRegistre: 'Vérifier au registre du commerce',
    surMoneyhouse: 'sur Moneyhouse',
    pays: 'Suisse',
    droitsReserves: 'Tous droits réservés.',
    registreCourt: 'Registre du commerce',
    avertissement:
      'n’est ni une banque ni un établissement de crédit et n’exerce pas d’activité conventionnelle ' +
      'd’intermédiation en crédit. Le contenu de ce site ne constitue ni une offre publique, ni une ' +
      'recommandation d’investissement, ni une garantie de financement.',
  },

  accueil: {
    lieu: 'Genève · Suisse',
    ctaProjet: 'Présentez votre projet',
    ctaDomaines: 'Nos domaines d’investissement',
    chiffres: [
      { valeur: '1,5 M€', libelle: 'Besoin de financement minimum étudié' },
      { valeur: '3 à 4', libelle: 'Semaines pour l’évaluation d’un dossier complet' },
      { valeur: '7 ans', libelle: 'D’expérience dans l’évaluation et le financement' },
    ],
    titreMeta: 'Capital privé, Genève',
  },

  finance: {
    eyebrow: 'Finance',
    decouvrir: 'Découvrir',
    description:
      'Domaines d’investissement de %BRAND% : financement immobilier, capital-investissement, ' +
      'capital-risque, mezzanine, énergies renouvelables, médecine et technologies.',
  },

  formulaire: {
    titreSection: 'Soumission confidentielle',
    introSection:
      'Les informations relatives à l’entreprise, les données financières et la documentation ' +
      'd’investissement sont traitées de manière confidentielle tout au long du processus d’évaluation.',
    coordonnees: 'Coordonnées',
    deroulement: 'Déroulement',
    etapes: [
      {
        titre: 'Présentation du projet',
        texte: 'informations principales, capitaux recherchés, utilisation prévue des fonds.',
      },
      {
        titre: 'Évaluation',
        texte: 'généralement trois à quatre semaines lorsque la documentation est complète.',
      },
      {
        titre: 'Décision et structuration',
        texte: 'après une évaluation positive, les conditions du financement envisagé sont structurées.',
      },
    ],
    prenom: 'Prénom',
    nom: 'Nom',
    email: 'Adresse e-mail',
    telephone: 'Téléphone (facultatif)',
    societe: 'Société ou nom du projet',
    pays: 'Pays du projet (facultatif)',
    domaine: 'Domaine concerné',
    capitaux: 'Besoin en capitaux',
    utilisation: 'Utilisation prévue des fonds',
    presentation: 'Présentation du projet',
    placeholderPresentation:
      'Situation économique et financière, structure existante, étapes de développement visées, ' +
      'actifs et garanties disponibles…',
    choisirDomaine: 'Sélectionnez un domaine',
    choisirTranche: 'Sélectionnez une tranche',
    siteWeb: 'Site web',
    consentement:
      'J’accepte que les informations transmises soient traitées de manière confidentielle en vue ' +
      'de l’évaluation de mon projet, conformément à la politique de confidentialité.',
    envoyer: 'Soumettre le projet',
    envoiEnCours: 'Envoi en cours…',
    avertissement:
      'La soumission d’un projet ne confère aucun droit à un financement et ne constitue ni un ' +
      'engagement ni une garantie de mise à disposition de capitaux.',
    succesTitre: 'Votre projet nous est parvenu.',
    succesTexte:
      'Nous procédons à une première évaluation afin de déterminer si le projet correspond au profil ' +
      'd’investissement recherché. Sous réserve de la transmission complète des informations requises, ' +
      'l’évaluation est généralement réalisée dans un délai de trois à quatre semaines.',
    succesComplement: 'Pour compléter votre dossier :',
    immobilierDirect: 'Immobilier — acquisition directe',
    autreDomaine: 'Autre domaine',
    tranches: [
      '1,5 à 2 millions d’euros',
      '2 à 5 millions d’euros',
      '5 à 10 millions d’euros',
      '10 à 25 millions d’euros',
      'Plus de 25 millions d’euros',
    ],
    metaDescription: 'Présentez votre entreprise ou votre projet à %BRAND%, en toute confidentialité.',
    erreurs: {
      prenom: 'Le prénom est requis.',
      nom: 'Le nom est requis.',
      email: 'L’adresse e-mail n’est pas valide.',
      societe: 'La société ou le nom du projet est requis.',
      domaine: 'Sélectionnez un domaine.',
      capitaux: 'Sélectionnez un besoin en capitaux.',
      utilisation: 'Décrivez l’utilisation prévue des fonds en quelques lignes.',
      presentation: 'Décrivez le projet en quelques lignes (40 caractères minimum).',
      consentement: 'Votre accord est nécessaire pour traiter la demande.',
      global: 'Certains champs doivent être corrigés.',
      tropDeDemandes: 'Trop de demandes envoyées depuis cet appareil. Réessayez dans une heure.',
      envoiInactif: 'L’envoi du formulaire n’est pas encore actif. Écrivez-nous directement à {email}.',
      envoiEchoue: 'L’envoi a échoué. Réessayez dans quelques instants ou écrivez-nous à {email}.',
    },
    accuse: {
      sujet: 'Votre soumission de projet — %BRAND%',
      bonjour: 'Bonjour',
      confirmation: 'Nous confirmons la réception de votre demande concernant « {company} ».',
      complement:
        'Pour compléter votre dossier, vous pouvez répondre à ce message ou écrire à {email}.',
      corps:
        'Nous avons bien reçu votre présentation de projet et procédons à une première évaluation. ' +
        'Sous réserve de la transmission complète des informations requises, celle-ci est ' +
        'généralement réalisée dans un délai de trois à quatre semaines.',
      signature: 'Cordialement,',
    },
  },

  contact: {
    eyebrow: 'Contact',
    titre: 'Présentez votre projet',
    lead:
      'Vous recherchez des capitaux privés pour une entreprise, un investissement ou un projet ' +
      'spécifique ? Transmettez-nous les informations principales. À l’issue d’une première ' +
      'évaluation, nous déterminerons si le projet correspond au profil d’investissement de ' +
      '%BRAND% et s’il peut faire l’objet d’une analyse approfondie.',
  },

  equipe: {
    // Intitulés de groupe repris de `TEAM NAME.odt`.
    direction: 'Direction Générale',
    experts: 'Équipe & Experts',
    ecrireA: 'Écrire à',
  },

  renvois: {
    poursuivre: 'Poursuivre',
    consulter: 'Consulter',
  },

  erreur404: {
    eyebrow: 'Erreur 404',
    titre: 'Cette page n’existe pas',
    texte:
      'L’adresse demandée ne correspond à aucune page du site. Elle a peut-être été modifiée, ou ' +
      'le lien qui vous a mené ici est incomplet.',
    retour: 'Retour à l’accueil',
  },

  /** Textes alternatifs des photographies choisies par nous, page par page. */
  alt: {
    aPropos: 'La fontaine du Jardin anglais à Genève',
    services: 'Hall d’entrée en marbre et dorures d’un immeuble historique',
    servicesImmobilier: 'Façade d’une villa de prestige à Genève',
    notreEquipe: 'Escalier en marbre d’un intérieur institutionnel élégant',
    finance: 'Le massif du Salève au-dessus du bassin genevois',
    contact: 'Le pont du Mont-Blanc sur le lac Léman à Genève',
    financementImmobilier: 'Immeuble de bureaux vitré au milieu d’un tissu urbain résidentiel',
    capitalInvestissement:
      'Reflet d’un clocher historique dans la façade vitrée d’un immeuble de bureaux à Genève',
    capitalRisque: 'Vue en contre-plongée de tours de bureaux vitrées modernes',
    startUp: 'Salle de réunion sobre avec une longue table blanche',
    mezzanine: 'Passerelle vitrée reliant deux immeubles de bureaux',
    projets: 'Grue de chantier se détachant sur un ciel bleu',
    energies: 'Installation photovoltaïque sur un barrage alpin, avec pylône électrique',
    medecine: 'Stéthoscope sur fond neutre',
    technologies: 'Câble de recharge branché sur une voiture électrique',
    genevaSkyline: 'Skyline de Genève vu depuis le lac Léman',
  },
}

export type UIStrings = typeof fr

const en: UIStrings = {
  nav: {
    contact: 'Contact',
    accueilAria: 'Argentum — home',
    navigationAria: 'Main navigation',
    ouvrirMenu: 'Open menu',
    fermerMenu: 'Close menu',
    entiteDuGroupe: 'Group entity',
    langue: 'Language',
    allerAuContenu: 'Skip to content',
    vueDEnsemble: 'Overview',
    societe: 'Company',
  },

  marque: {
    selecteurAria: 'Argentum group entity',
    afficher: 'Go to',
    affichee: 'Current',
    vousConsultez: 'You are currently viewing this company’s website.',
    titre: 'Two companies, one approach to private capital',
    intro:
      'The Argentum group brings together two Geneva-based public limited companies with ' +
      'complementary scopes. Each company has its own website: select the one that matches your ' +
      'enquiry to open it.',
    secteur: 'Field of activity',
    registre: 'Commercial register',
    contact: 'Contact',
  },

  langue: {
    selecteurAria: 'Website language',
    bientot: 'coming soon',
  },

  legal: {
    uid: 'Company Identification Number (UID)',
    registre: 'Commercial Register Number',
    formeJuridique: 'Legal form',
    societeAnonyme: 'Public limited company (SA)',
    secteur: 'Field of activity',
    representant: 'Authorized Representative',
    verifierRegistre: 'Verify in the commercial register',
    surMoneyhouse: 'on Moneyhouse',
    pays: 'Switzerland',
    droitsReserves: 'All rights reserved.',
    registreCourt: 'Commercial register',
    avertissement:
      'is neither a bank nor a credit institution and does not carry out conventional credit ' +
      'intermediation. The content of this website constitutes neither a public offer, nor an ' +
      'investment recommendation, nor a financing guarantee.',
  },

  accueil: {
    lieu: 'Geneva · Switzerland',
    ctaProjet: 'Present your project',
    ctaDomaines: 'Our investment areas',
    chiffres: [
      { valeur: 'EUR 1.5m', libelle: 'Minimum financing requirement assessed' },
      { valeur: '3 to 4', libelle: 'Weeks to assess a complete submission' },
      { valeur: '7 years', libelle: 'Of experience in assessment and financing' },
    ],
    titreMeta: 'Private capital, Geneva',
  },

  finance: {
    eyebrow: 'Financing',
    decouvrir: 'Discover',
    description:
      'Investment areas of %BRAND%: real estate financing, private equity, venture capital, ' +
      'mezzanine, renewable energy, medicine and technology.',
  },

  formulaire: {
    titreSection: 'Confidential submission',
    introSection:
      'Company information, financial data and investment documentation are treated ' +
      'confidentially throughout the assessment process.',
    coordonnees: 'Contact details',
    deroulement: 'Process',
    etapes: [
      {
        titre: 'Project presentation',
        texte: 'key information, capital sought, intended use of funds.',
      },
      {
        titre: 'Assessment',
        texte: 'usually three to four weeks once the documentation is complete.',
      },
      {
        titre: 'Decision and structuring',
        texte: 'following a positive assessment, the terms of the envisaged financing are structured.',
      },
    ],
    prenom: 'First name',
    nom: 'Last name',
    email: 'Email address',
    telephone: 'Phone (optional)',
    societe: 'Company or project name',
    pays: 'Country of the project (optional)',
    domaine: 'Area concerned',
    capitaux: 'Capital requirement',
    utilisation: 'Intended use of funds',
    presentation: 'Project presentation',
    placeholderPresentation:
      'Economic and financial situation, existing structure, planned development stages, ' +
      'available assets and collateral…',
    choisirDomaine: 'Select an area',
    choisirTranche: 'Select a range',
    siteWeb: 'Website',
    consentement:
      'I agree that the information submitted may be processed confidentially for the purpose of ' +
      'assessing my project, in accordance with the privacy policy.',
    envoyer: 'Submit the project',
    envoiEnCours: 'Sending…',
    avertissement:
      'Submitting a project creates no entitlement to financing and constitutes neither a ' +
      'commitment nor a guarantee that capital will be made available.',
    succesTitre: 'We have received your project.',
    succesTexte:
      'We are carrying out an initial assessment to determine whether the project matches the ' +
      'investment profile we are looking for. Provided all required information has been submitted, ' +
      'the assessment is usually completed within three to four weeks.',
    succesComplement: 'To complete your file:',
    immobilierDirect: 'Real estate — direct acquisition',
    autreDomaine: 'Another area',
    tranches: [
      'EUR 1.5 to 2 million',
      'EUR 2 to 5 million',
      'EUR 5 to 10 million',
      'EUR 10 to 25 million',
      'More than EUR 25 million',
    ],
    metaDescription: 'Present your company or your project to %BRAND%, in full confidentiality.',
    erreurs: {
      prenom: 'First name is required.',
      nom: 'Last name is required.',
      email: 'The email address is not valid.',
      societe: 'Company or project name is required.',
      domaine: 'Select an area.',
      capitaux: 'Select a capital requirement.',
      utilisation: 'Describe the intended use of funds in a few lines.',
      presentation: 'Describe the project in a few lines (40 characters minimum).',
      consentement: 'Your agreement is required to process the enquiry.',
      global: 'Some fields need to be corrected.',
      tropDeDemandes: 'Too many enquiries sent from this device. Please try again in an hour.',
      envoiInactif: 'The form is not active yet. Please write to us directly at {email}.',
      envoiEchoue: 'Sending failed. Please try again shortly or write to us at {email}.',
    },
    accuse: {
      sujet: 'Your project submission — %BRAND%',
      bonjour: 'Dear',
      confirmation: 'We confirm receipt of your enquiry regarding “{company}”.',
      complement:
        'To complete your file, you may reply to this message or write to {email}.',
      corps:
        'We have received your project presentation and are carrying out an initial assessment. ' +
        'Provided all required information has been submitted, this is usually completed within ' +
        'three to four weeks.',
      signature: 'Kind regards,',
    },
  },

  contact: {
    eyebrow: 'Contact',
    titre: 'Present your project',
    lead:
      'Are you looking for private capital for a company, an investment or a specific project? ' +
      'Send us the key information. Following an initial assessment, we will determine whether the ' +
      'project matches the investment profile of %BRAND% and whether it can be examined in depth.',
  },

  equipe: {
    direction: 'Executive Management',
    experts: 'Team & Experts',
    ecrireA: 'Email',
  },

  renvois: {
    poursuivre: 'Continue',
    consulter: 'Read more',
  },

  erreur404: {
    eyebrow: 'Error 404',
    titre: 'This page does not exist',
    texte:
      'The requested address does not match any page on this site. It may have changed, or the ' +
      'link that brought you here is incomplete.',
    retour: 'Back to home',
  },

  alt: {
    aPropos: 'The fountain of the Jardin anglais in Geneva',
    services: 'Marble and gilded entrance hall of a historic building',
    servicesImmobilier: 'Facade of a prestige villa in Geneva',
    notreEquipe: 'Marble staircase in an elegant institutional interior',
    finance: 'The Salève massif above the Geneva basin',
    contact: 'The Mont-Blanc bridge over Lake Geneva',
    financementImmobilier: 'Glazed office building within a residential urban fabric',
    capitalInvestissement:
      'Reflection of a historic bell tower in the glass facade of a Geneva office building',
    capitalRisque: 'Low-angle view of modern glazed office towers',
    startUp: 'Plain meeting room with a long white table',
    mezzanine: 'Glazed walkway connecting two office buildings',
    projets: 'Construction crane against a blue sky',
    energies: 'Photovoltaic installation on an Alpine dam, with an electricity pylon',
    medecine: 'Stethoscope on a neutral background',
    technologies: 'Charging cable plugged into an electric car',
    genevaSkyline: 'Geneva skyline seen from Lake Geneva',
  },
}

const de: UIStrings = {
  nav: {
    contact: 'Kontakt',
    accueilAria: 'Argentum — Startseite',
    navigationAria: 'Hauptnavigation',
    ouvrirMenu: 'Menü öffnen',
    fermerMenu: 'Menü schliessen',
    entiteDuGroupe: 'Gesellschaft der Gruppe',
    langue: 'Sprache',
    allerAuContenu: 'Zum Inhalt springen',
    vueDEnsemble: 'Übersicht',
    societe: 'Unternehmen',
  },

  marque: {
    selecteurAria: 'Gesellschaft der Argentum-Gruppe',
    afficher: 'Wechseln zu',
    affichee: 'Aktuell',
    vousConsultez: 'Sie befinden sich auf der Website dieser Gesellschaft.',
    titre: 'Zwei Gesellschaften, ein Verständnis von privatem Kapital',
    intro:
      'Die Argentum-Gruppe vereint zwei Genfer Aktiengesellschaften mit sich ergänzenden ' +
      'Tätigkeitsfeldern. Jede Gesellschaft hat ihre eigene Website: Wählen Sie diejenige, die zu ' +
      'Ihrem Anliegen passt.',
    secteur: 'Tätigkeitsbereich',
    registre: 'Handelsregister',
    contact: 'Kontakt',
  },

  langue: {
    selecteurAria: 'Sprache der Website',
    bientot: 'demnächst verfügbar',
  },

  legal: {
    uid: 'Unternehmens-Identifikationsnummer (UID)',
    registre: 'Handelsregister-Nr.',
    formeJuridique: 'Rechtsform',
    societeAnonyme: 'Aktiengesellschaft (SA)',
    secteur: 'Tätigkeitsbereich',
    representant: 'Vertretungsberechtigte Person',
    verifierRegistre: 'Im Handelsregister prüfen',
    surMoneyhouse: 'auf Moneyhouse',
    pays: 'Schweiz',
    droitsReserves: 'Alle Rechte vorbehalten.',
    registreCourt: 'Handelsregister',
    avertissement:
      'ist weder eine Bank noch ein Kreditinstitut und übt keine herkömmliche Kreditvermittlung ' +
      'aus. Die Inhalte dieser Website stellen weder ein öffentliches Angebot noch eine ' +
      'Anlageempfehlung oder eine Finanzierungszusage dar.',
  },

  accueil: {
    lieu: 'Genf · Schweiz',
    ctaProjet: 'Stellen Sie Ihr Vorhaben vor',
    ctaDomaines: 'Unsere Investitionsfelder',
    chiffres: [
      { valeur: 'EUR 1,5 Mio.', libelle: 'Geprüfter Mindestkapitalbedarf' },
      { valeur: '3 bis 4', libelle: 'Wochen für die Prüfung eines vollständigen Dossiers' },
      { valeur: '7 Jahre', libelle: 'Erfahrung in Prüfung und Finanzierung' },
    ],
    titreMeta: 'Privates Kapital, Genf',
  },

  finance: {
    eyebrow: 'Finanzierung',
    decouvrir: 'Entdecken',
    description:
      'Investitionsfelder von %BRAND%: Immobilienfinanzierung, Private Equity, Venture Capital, ' +
      'Mezzanine, erneuerbare Energien, Medizin und Technologie.',
  },

  formulaire: {
    titreSection: 'Vertrauliche Einreichung',
    introSection:
      'Unternehmensangaben, Finanzdaten und Investitionsunterlagen werden während des gesamten ' +
      'Prüfprozesses vertraulich behandelt.',
    coordonnees: 'Kontaktangaben',
    deroulement: 'Ablauf',
    etapes: [
      {
        titre: 'Vorstellung des Vorhabens',
        texte: 'wesentliche Angaben, gesuchtes Kapital, geplante Mittelverwendung.',
      },
      {
        titre: 'Prüfung',
        texte: 'in der Regel drei bis vier Wochen, sofern die Unterlagen vollständig sind.',
      },
      {
        titre: 'Entscheid und Strukturierung',
        texte: 'nach positiver Prüfung werden die Bedingungen der vorgesehenen Finanzierung strukturiert.',
      },
    ],
    prenom: 'Vorname',
    nom: 'Name',
    email: 'E-Mail-Adresse',
    telephone: 'Telefon (optional)',
    societe: 'Unternehmen oder Projektname',
    pays: 'Land des Vorhabens (optional)',
    domaine: 'Betroffener Bereich',
    capitaux: 'Kapitalbedarf',
    utilisation: 'Geplante Mittelverwendung',
    presentation: 'Vorstellung des Vorhabens',
    placeholderPresentation:
      'Wirtschaftliche und finanzielle Situation, bestehende Struktur, geplante Entwicklungsschritte, ' +
      'verfügbare Aktiven und Sicherheiten…',
    choisirDomaine: 'Bereich auswählen',
    choisirTranche: 'Bandbreite auswählen',
    siteWeb: 'Website',
    consentement:
      'Ich bin damit einverstanden, dass die übermittelten Angaben zur Prüfung meines Vorhabens ' +
      'vertraulich bearbeitet werden, gemäss der Datenschutzerklärung.',
    envoyer: 'Vorhaben einreichen',
    envoiEnCours: 'Wird gesendet…',
    avertissement:
      'Die Einreichung eines Vorhabens begründet keinen Anspruch auf eine Finanzierung und stellt ' +
      'weder eine Zusage noch eine Garantie für die Bereitstellung von Kapital dar.',
    succesTitre: 'Ihr Vorhaben ist bei uns eingegangen.',
    succesTexte:
      'Wir nehmen eine erste Prüfung vor, um festzustellen, ob das Vorhaben dem gesuchten ' +
      'Investitionsprofil entspricht. Sofern alle erforderlichen Angaben vorliegen, erfolgt diese ' +
      'in der Regel innerhalb von drei bis vier Wochen.',
    succesComplement: 'Zur Vervollständigung Ihres Dossiers:',
    immobilierDirect: 'Immobilien — Direkterwerb',
    autreDomaine: 'Anderer Bereich',
    tranches: [
      'EUR 1,5 bis 2 Millionen',
      'EUR 2 bis 5 Millionen',
      'EUR 5 bis 10 Millionen',
      'EUR 10 bis 25 Millionen',
      'Mehr als EUR 25 Millionen',
    ],
    metaDescription: 'Stellen Sie %BRAND% Ihr Unternehmen oder Ihr Vorhaben vertraulich vor.',
    erreurs: {
      prenom: 'Der Vorname ist erforderlich.',
      nom: 'Der Name ist erforderlich.',
      email: 'Die E-Mail-Adresse ist ungültig.',
      societe: 'Unternehmen oder Projektname ist erforderlich.',
      domaine: 'Wählen Sie einen Bereich.',
      capitaux: 'Wählen Sie einen Kapitalbedarf.',
      utilisation: 'Beschreiben Sie die geplante Mittelverwendung in wenigen Zeilen.',
      presentation: 'Beschreiben Sie das Vorhaben in wenigen Zeilen (mindestens 40 Zeichen).',
      consentement: 'Ihre Zustimmung ist für die Bearbeitung der Anfrage erforderlich.',
      global: 'Einige Felder müssen korrigiert werden.',
      tropDeDemandes: 'Zu viele Anfragen von diesem Gerät. Versuchen Sie es in einer Stunde erneut.',
      envoiInactif: 'Das Formular ist noch nicht aktiv. Schreiben Sie uns direkt an {email}.',
      envoiEchoue: 'Der Versand ist fehlgeschlagen. Versuchen Sie es später erneut oder schreiben Sie uns an {email}.',
    },
    accuse: {
      sujet: 'Ihre Projekteinreichung — %BRAND%',
      bonjour: 'Guten Tag',
      confirmation: 'Wir bestätigen den Eingang Ihrer Anfrage zu «{company}».',
      complement:
        'Zur Vervollständigung Ihres Dossiers können Sie auf diese Nachricht antworten oder an {email} schreiben.',
      corps:
        'Wir haben Ihre Projektvorstellung erhalten und nehmen eine erste Prüfung vor. Sofern alle ' +
        'erforderlichen Angaben vorliegen, erfolgt diese in der Regel innerhalb von drei bis vier Wochen.',
      signature: 'Freundliche Grüsse,',
    },
  },

  contact: {
    eyebrow: 'Kontakt',
    titre: 'Stellen Sie Ihr Vorhaben vor',
    lead:
      'Suchen Sie privates Kapital für ein Unternehmen, eine Investition oder ein bestimmtes ' +
      'Vorhaben? Übermitteln Sie uns die wesentlichen Angaben. Nach einer ersten Prüfung ' +
      'entscheiden wir, ob das Vorhaben dem Investitionsprofil von %BRAND% entspricht und ' +
      'vertieft geprüft werden kann.',
  },

  equipe: {
    direction: 'Geschäftsleitung',
    experts: 'Team & Experten',
    ecrireA: 'E-Mail an',
  },

  renvois: {
    poursuivre: 'Weiterlesen',
    consulter: 'Ansehen',
  },

  erreur404: {
    eyebrow: 'Fehler 404',
    titre: 'Diese Seite gibt es nicht',
    texte:
      'Die aufgerufene Adresse entspricht keiner Seite dieser Website. Möglicherweise wurde sie ' +
      'geändert, oder der Link, der Sie hierher geführt hat, ist unvollständig.',
    retour: 'Zurück zur Startseite',
  },

  alt: {
    aPropos: 'Der Brunnen im Jardin anglais in Genf',
    services: 'Eingangshalle aus Marmor und Vergoldungen eines historischen Gebäudes',
    servicesImmobilier: 'Fassade einer repräsentativen Villa in Genf',
    notreEquipe: 'Marmortreppe in einem eleganten institutionellen Innenraum',
    finance: 'Das Salève-Massiv über dem Genfer Becken',
    contact: 'Die Pont du Mont-Blanc über dem Genfersee',
    financementImmobilier: 'Verglastes Bürogebäude inmitten eines Wohnquartiers',
    capitalInvestissement:
      'Spiegelung eines historischen Kirchturms in der Glasfassade eines Genfer Bürogebäudes',
    capitalRisque: 'Untersicht moderner verglaster Bürotürme',
    startUp: 'Schlichter Besprechungsraum mit langem weissem Tisch',
    mezzanine: 'Verglaster Übergang zwischen zwei Bürogebäuden',
    projets: 'Baukran vor blauem Himmel',
    energies: 'Photovoltaikanlage auf einer Alpenstaumauer, mit Strommast',
    medecine: 'Stethoskop auf neutralem Hintergrund',
    technologies: 'Ladekabel an einem Elektroauto',
    genevaSkyline: 'Skyline von Genf vom Genfersee aus',
  },
}

export const UI: Record<Locale, UIStrings> = { fr, en, de }
