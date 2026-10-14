# Data Analyst Portfolio

A static, game-inspired personal portfolio (HTML5, CSS3, vanilla JS, no build step).

## Preview locally
Open `index.html` directly in a browser, or serve the folder (recommended so clipboard copy works):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customize
- **Name, bio, projects, experience, skills:** edit `index.html` (each section is commented).
- **Resume:** replace `assets/resume.pdf` (keep the file name).
- **Photo:** replace `assets/profile-placeholder.svg` or point the `<img>` in the About section at your own file.
- **Email:** update `your.email@example.com` in the Contact section (both `href` values and `data-email`).
- **LinkedIn:** update `https://www.linkedin.com/in/your-profile`.
- **Live Demo links:** replace each `href="#"` marked `data-placeholder-link`.
- **Skill levels:** change `style="--lvl:90"` and the matching `aria-valuenow` on each stat bar.
- **Colors/fonts:** edit the tokens at the top of `css/styles.css`.

## Deploy
Any static host works: GitHub Pages (Settings → Pages → deploy from branch), Netlify, or Vercel.
