# CartCraft: Walmart Recipe & Grocery Shopper

CartCraft is a modern web application that transforms recipes into an organized, Walmart-ready grocery order. It extracts ingredients with accurate packaging quantities, matches authentic Walmart food items, and adds them directly into your Walmart.com cart in 1 click.

## Features

- **⚡ 1-Click Walmart Cart Auto-Add:** Uses Walmart's official Recipe / Bundle AddToCart endpoint (`/sc/cart/addToCart?items=itemId1|qty1,itemId2|qty2`) to transfer all recipe ingredients into your actual Walmart cart in a single page load.
- **🛒 Real Walmart Catalog Item IDs:** Pre-indexed with real food item IDs for produce, poultry, meats, dairy, pasta, grains, beans, and pantry staples.
- **📦 True Retail Package Quantities:** Intelligently calculates the retail package count needed (e.g. 1.5 lbs chicken = 1x 3 lb tray; 18 corn tortillas = 1x 24-count pack; 4 limes = 4x individual limes).
- **✏️ Interactive Cart Controls:** Edit quantities (`+` / `-`), remove individual ingredients, or clear whole recipes before auto-adding.
- **🌐 Dual-Mode Deployment:**
  - **Full-Stack (Dev/Server):** Express server with Gemini AI support for smart recipe parsing.
  - **Static (GitHub Pages):** Built-in client-side parser, generator, and substitution engine that runs 100% in the browser with zero backend requirements.

## Hosting on GitHub (GitHub Pages)

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) ready for GitHub Pages:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CartCraft"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. That's it! Every time you push to `main`, GitHub Actions will build and publish your app automatically to:
   `https://<your-username>.github.io/<your-repo-name>/`

## Local Development

```bash
# Install dependencies
npm install

# Run the development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Tech Stack

- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Server:** Node.js, Express, @google/genai
