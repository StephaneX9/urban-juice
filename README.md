# Urban Juice — site vitrine

Site vitrine statique (HTML, CSS, JavaScript sans dépendance) du kiosque de jus frais Urban Juice, Libreville.
Projet scolaire reproduisant la maquette fournie.

## Structure

- `index.html` — page unique (hero à chapitres, carte, manifeste, points de vente, entreprises + devis, fidélité, pied de page)
- `assets/styles.css` — styles
- `assets/app.js` — chapitres pilotés par le défilement, apparitions, formulaire de devis vers WhatsApp
- `assets/img/`, `assets/world/` — visuels

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python -m http.server 8000
```

## Mise en ligne

Site en ligne sur Cloudflare Pages : https://urban-juice.pages.dev/

Pour publier une nouvelle version (après `npx wrangler login` la première fois) :

```bash
npx wrangler pages deploy . --project-name urban-juice --branch main
```
