# Maison Célestine — Thème Shopify (KNR)

> Intégration de la page produit (PDP) **Maison Célestine** — Shopify Liquid, CSS et JS natifs.
> Fidélité au pixel sur les maquettes Figma **Desktop 1440 px** et **Mobile 390 px**.

---

## 🛠️ Stack & contraintes

- **Liquid** natif Shopify — aucun moteur de template externe.
- **CSS Vanilla** scopé (BEM), sans framework (ni Tailwind ni Bootstrap).
- **JavaScript Vanilla**, chargé en `defer` — pas de jQuery, pas de React.
- **Aucun AJAX** : le panier fonctionne par soumission de formulaire Shopify native. Le JavaScript ne sert qu'à l'interface (variantes, carrousels, accordéons, drawer).
- **Typographie** : Google Fonts **Inter**.
- **Zéro hardcoding** : tout provient des objets Liquid (`product`, `collection`, `cart`, `blog`), des Metafields et des Metaobjects.

### Conventions de contribution

| Règle | Détail |
|---|---|
| **Préfixe `knr-`** | Tout nouveau fichier dans `sections/`, `assets/*.css`, `assets/*.js` doit être préfixé `knr-`. |
| **Aucune image bitmap dans `assets/`** | `assets/` ne contient **aucun PNG/JPG**. Les photos vivent dans **Shopify › Contenu › Fichiers** et sont référencées par URL CDN. Seules les **54 icônes SVG** d'interface restent ici. |
| **Fidélité au design** | Toute modification de mise en page se mesure contre les exports Figma du dépôt parent (`desktop-design-html/`, `mobile-design-html/`). |

---

## 📂 Structure

```text
theme-mc/
├── layout/
│   └── knr-pdp.liquid                    # Layout dédié : HEAD / TEMPLATE / FOOTER
├── templates/
│   └── product.knr.json                  # Template produit ("layout": "knr-pdp")
├── sections/
│   ├── knr-header-group.json             # Groupe d'en-tête : bandeau + header
│   ├── knr-footer-group.json             # Groupe de pied de page : réassurance + footer
│   ├── knr-announcement-bar.liquid       # 1.  Bandeau d'annonce
│   ├── knr-header.liquid                 # 2.  Header (logo/menu configurables, sticky, drawer mobile)
│   ├── knr-main-product.liquid           # 3.  PDP Hero (galerie, variantes, accordéons, rituel)
│   ├── knr-engagement.liquid             # 4.  Manifeste & Quick Buy Card
│   ├── knr-how-to-use.liquid             # 5.  Étapes d'utilisation
│   ├── knr-before-after.liquid           # 6.  Comparateur Avant/Après & témoignages
│   ├── knr-faq.liquid                    # 7.  FAQ en accordéons
│   ├── knr-reviews.liquid                # 8.  Notes & avis vérifiés
│   ├── knr-latest-news.liquid            # 9.  Articles du Journal (Blog Shopify)
│   ├── knr-newsletter.liquid             # 10. Inscription Newsletter
│   ├── knr-reassurance.liquid            # 11. Réassurance 4 piliers
│   └── knr-footer.liquid                 # 12. Footer & certification COSMOS ORGANIC
└── assets/
    ├── knr-pdp.css                       # Styles scopés (Desktop 1440 px & Mobile 390 px)
    ├── knr-pdp.js                        # Interactions UI (variantes, sliders, carrousels, drawer…)
    └── *.svg                             # 54 icônes d'interface
```

### Layout dédié

La PDP n'utilise pas `theme.liquid` mais son propre layout `layout/knr-pdp.liquid`, structuré en trois régions :

| Région | Contenu |
|---|---|
| **HEAD** | Métadonnées et snippets du thème de base (`meta-tags`, `stylesheets`, `fonts`, `scripts`, `theme-styles-variables`, `color-palette`), police Inter, puis `knr-pdp.css` et `knr-pdp.js` (`defer`). |
| **TEMPLATE** | `{% sections 'knr-header-group' %}` → `<main>{{ content_for_layout }}</main>` → `{% sections 'knr-footer-group' %}` |
| **FOOTER** | Fin de document. |

L'en-tête et le pied de page sont des **groupes de sections** : ils restent entièrement éditables dans l'éditeur de thème et sont partagés par tous les templates qui déclarent ce layout. Le template `product.knr.json` ne contient donc que le corps de la page (8 sections).

---

## ⚙️ Réglages communs à toutes les sections

Chaque section `knr-*` expose les mêmes réglages de mise en page :

| Réglage | Valeurs | Rôle |
|---|---|---|
| **Largeur du contenu** | Pleine largeur · Large · Boîte | 100 % · 1440 px · 1200 px. Le fond reste pleine largeur, seul le contenu est contraint. |
| **Marge haute / basse — bureau** | 0 – 200 px | Espacement vertical desktop. |
| **Marge haute / basse — mobile** | 0 – 160 px | Espacement vertical mobile. |

Les valeurs par défaut reproduisent exactement la maquette. Si seule la valeur desktop est modifiée, le mobile en hérite ; définir la valeur mobile la remplace.

Techniquement, ces réglages alimentent des variables CSS sur l'élément racine de la section :
`--knr-pt`, `--knr-pb`, `--knr-pt-m`, `--knr-pb-m`.

---

## 🎛️ Réglages spécifiques

### 2 · `knr-header`
- **Position du logo** : Gauche · Centre
- **Position du menu** : Gauche · Centre · Droite
- **En-tête fixe au défilement** (sticky) — activable/désactivable
- Icônes optionnelles (localisation, compte, recherche), logo personnalisé, menu de navigation

Sur mobile, le menu devient un **drawer latéral** ouvert de droite à gauche : logo en tête, fond assombri, fermeture au clic extérieur ou via `Échap`.

### 3 · `knr-main-product`
Blocs réordonnables : `breadcrumb`, `badges`, `title`, `rating`, `scores`, `short_description`, `variant_picker`, `price`, `buy_buttons`, `delivery_notice`, `accordion` (×N), `related_ritual`.

- **Galerie** — 4 dispositions (empilée, vignettes à gauche/en bas, grille 2 colonnes). Sur mobile : **carrousel swipeable** avec flèches contextuelles (droite seule sur la 1ʳᵉ image, gauche seule sur la dernière) et indicateur de position.
- **Bouton d'achat** — texte personnalisable **et** texte de rupture de stock. Le bouton est **désactivé automatiquement** quand la variante est indisponible (`disabled` rendu côté Liquid, puis synchronisé au changement de variante). Les variantes épuisées restent sélectionnables mais barrées.
- **Estimation de livraison** — accepte **plusieurs messages** (un par ligne), défilement automatique paramétrable (`0` = désactivé), pastilles cliquables, pause au survol.
- **Complétez votre rituel** — carrousel horizontal, cartes cliquables vers la fiche produit, bouton `+` qui soumet un formulaire d'ajout au panier. Sans metafield, la section retombe sur la collection du produit.

### 6 · `knr-before-after`
Les témoignages sont des **blocs** (auteur, note 1–5, texte) affichés en carrousel via les chevrons.

Les visuels Avant/Après sont résolus dans cet ordre :

1. `product.metafields.custom.before_after` → **Metaobject `before_after`**
   (`before_image`, `after_image`, `label_before`, `label_after`)
2. `product.metafields.custom.before_image` / `custom.after_image`
3. Réglages d'image de la section

> **La section n'est pas rendue du tout** si aucune paire Avant/Après n'est résolue : chaque produit peut donc avoir, ou non, son comparateur.

### 8 · `knr-reviews`
Répartition des notes configurable (ex. `32,10,5,6,1`) — barres et étoiles pleines/vides générées automatiquement.

---

## 🗃️ Données attendues

### Metafields produit (`custom.*`)

| Clé | Type | Usage |
|---|---|---|
| `yuka_score`, `inci_score` | text | Scores sous le titre |
| `benefits_badges` | list.text | Badges UNIFIE / PROTÈGE |
| `unit_price` | text | Prix au 100 mL |
| `delivery_estimate` | text | Date de livraison estimée |
| `tab_bienfaits`, `tab_ingredients`, `tab_peaux` | multi-line | Contenu des accordéons |
| `ritual_products` | list.product_reference | Produits du rituel |
| `before_after` | metaobject_reference | Comparateur Avant/Après |
| `before_image`, `after_image` | file_reference | Alternative simple au Metaobject |

### Metaobjects

| Type | Champs |
|---|---|
| `before_after` | `before_image`, `after_image`, `label_before`, `label_after` |
| `knr_faq` | question / réponse |
| `knr_how_to_use` | numéro, visuel, description |
| `knr_review` | note, auteur, date, texte |

Les scripts de création et de peuplement de ces données se trouvent dans `scripts/` du dépôt parent.

---

## 🚀 Installation

### Import via l'Admin Shopify (recommandé)
1. Admin Shopify → **Boutique en ligne › Thèmes**
2. **Ajouter un thème › Importer un fichier zip**
3. Publier

### Shopify CLI

```bash
shopify auth login --store <votre-boutique>.myshopify.com
shopify theme push --publish
```

> ⚠️ **Jetons et API Thèmes.** Un jeton d'app personnalisée (`shpua_…`) ne suffit **pas** pour `theme dev` / `theme push`, même avec le scope `write_themes` : Shopify exige en plus une dérogation d'accès aux thèmes (« missing write_themes **and an exemption** »). Deux solutions :
> - installer l'app **Theme Access** et utiliser le mot de passe généré (`shptka_…`) ;
> - ou lancer `shopify theme dev` **sans** `--password` pour passer par l'authentification navigateur du CLI.
>
> La lecture (`theme list`, `theme pull`) fonctionne normalement avec un jeton `shpua_`.

### Contrôle qualité

```bash
npx shopify theme check
```

État actuel : **0 erreur**. Les avertissements restants sont attendus — `RemoteAsset` (images servies depuis Shopify Files), `UnusedDocParam` et `HardcodedRoutes` (préexistants).

---

## 📱 Responsive

Mesures validées en comparant le rendu réel aux exports Figma.

**Desktop 1440 px** — écart de 0 px : hero 1440 × 760, panneau produit 456 px à x = 944, cartes « How to use » 448 px, liste FAQ 720 px, résumé des avis 720 px.

**Mobile 390 px** :
- Bandeau d'annonce dans le flux, hero 550 px en carrousel plein écran
- Badges bénéfices centrés en surimpression du visuel
- Carte produit blanche chevauchant le hero, titre et prix sur une même ligne
- Carrousels horizontaux (rituel, étapes, articles, réassurance) avec indicateurs
- Colonnes du footer transformées en accordéons
- Drawer de navigation latéral

---

## ✅ Interactions

- Ajout au panier par **formulaire natif Shopify** (`POST` vers `routes.cart_add_url`) — bouton principal, quick-buy et `+` du rituel. Aucun appel AJAX : le compteur du panier est rendu côté serveur depuis `cart.item_count`, et `return_to=back` ramène le client sur la fiche produit.
- Bouton d'achat **désactivé** hors stock.
- Sélecteur de variantes (prix, prix au litre, visuel, disponibilité).
- Comparateur Avant/Après à la souris **et** au tactile.
- Carrousels : galerie mobile, témoignages, rituel, étapes, articles, messages de livraison.
- Accordéons PDP, FAQ et footer mobile.
- Header sticky (désactivable) et drawer mobile accessible (`aria-expanded`, fermeture `Échap`).
