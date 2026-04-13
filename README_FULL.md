# Astro Shop Template 🛍️

Ein wiederverwendbares E-Commerce-Template basierend auf Astro, React und Firebase.

## Features ✨

- 🛒 Vollständiger Warenkorb mit Slide-Out Cart
- 💳 Stripe Integration (Kreditkarte, PayPal, Klarna, TWINT)
- 🔥 Firebase Firestore für Bestellungen & Coupons
- 📦 Admin-Dashboard für Produkt- & Bestellverwaltung
- ⭐ Bewertungssystem
- 🎨 Responsive Design mit Tailwind CSS
- 🔍 Produktsuche mit Autocomplete
- 📊 Analytics (Meta Pixel)
- 🌍 Multi-Währung Support (EUR/CHF)

## Quick Start 🚀

### 1. Template verwenden

Klone dieses Template für deinen neuen Shop:

\`\`\`bash
git clone [REPO-URL] my-new-shop
cd my-new-shop
\`\`\`

### 2. Shop konfigurieren

Bearbeite \`shop.config.json\`:

\`\`\`json
{
  "shop": {
    "name": "Dein Shop Name",
    "shortName": "DEINSHOP",
    "domain": "deinshop.de"
  }
}
\`\`\`

### 3. Environment Variables

\`\`\`bash
cp .env.example .env
# Fülle .env mit deinen Credentials
\`\`\`

### 4. Installation & Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Anpassungen 🎨

1. Logo ersetzen: \`/public/logo-mamoru.png\`
2. Farben: \`shop.config.json\` → primaryColor, accentColor
3. Footer: \`src/components/Footer.tsx\`
4. Header: \`src/components/Header.tsx\`
5. Produkte: \`public/products.json\`

## Deployment

1. Build: \`npm run build\`
2. Push zu GitHub
3. Vercel/Netlify verbinden
4. Environment Variables setzen

---

Für Details siehe vollständige Dokumentation.
