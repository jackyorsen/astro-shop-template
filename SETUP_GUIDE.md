# Shop Setup Guide

## 1. Neuen Shop erstellen

### Git Repository klonen
\`\`\`bash
git clone https://github.com/YOUR-USERNAME/astro-shop-template.git my-desk-shop
cd my-desk-shop
\`\`\`

### Verbindung zum Template-Repo entfernen
\`\`\`bash
rm -rf .git
git init
\`\`\`

## 2. Shop-Konfiguration

### shop.config.json anpassen

Öffne \`shop.config.json\` und ändere:

\`\`\`json
{
  "shop": {
    "name": "DeskPro - Höhenverstellbare Schreibtische",
    "shortName": "DESKPRO",
    "tagline": "Premium höhenverstellbare Schreibtische für gesundes Arbeiten",
    "domain": "deskpro.de",
    "logo": "/logo-deskpro.png",
    "primaryColor": "#1a5490",
    "accentColor": "#ff6b35"
  },
  "company": {
    "legalName": "DeskPro GmbH",
    "address": {
      "street": "Musterstraße 1",
      "zip": "12345",
      "city": "Berlin",
      "country": "Deutschland"
    },
    "contact": {
      "email": "kontakt@deskpro.de",
      "phone": "+49 30 12345678",
      "hours": "Mo-Fr: 9:00 - 17:00 Uhr"
    }
  }
}
\`\`\`

## 3. Setup-Script ausführen

Das Script wendet die Config automatisch an:

\`\`\`bash
node setup-shop.mjs
\`\`\`

Das Script aktualisiert:
- package.json (Name)
- Footer (Firmeninfos, Kontakt)
- Header (Logo, Shop-Name)

## 4. Environment Variables

Kopiere .env.example:
\`\`\`bash
cp .env.example .env
\`\`\`

Fülle .env mit deinen Credentials:

\`\`\`env
# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Firebase
PUBLIC_FIREBASE_API_KEY=AIza...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional
PUBLIC_META_PIXEL_ID=123456789
\`\`\`

## 5. Firebase Setup

### Firestore Collections erstellen

Erstelle in Firebase Console:

**Collection: orders**
- Auto-ID Dokumente
- Felder werden automatisch beim ersten Order erstellt

**Collection: coupons**
Beispiel-Dokument:
\`\`\`json
{
  "code": "WELCOME10",
  "discount": 10,
  "type": "percentage",
  "active": true,
  "usageLimit": 100,
  "usedCount": 0
}
\`\`\`

### Firestore Rules

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if true;
    }
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

## 6. Logo & Assets

Ersetze folgende Dateien in \`/public\`:

- \`logo-mamoru.png\` → \`logo-deskpro.png\`
- Aktualisiere \`shop.config.json\` → \`"logo": "/logo-deskpro.png"\`

## 7. Produkte hinzufügen

### Option A: Manuell in products.json

\`\`\`json
[
  {
    "sku": "DESK001",
    "name": "ErgoDesk Pro - Elektrisch höhenverstellbar",
    "description": "Premium Schreibtisch...",
    "category": "Höhenverstellbare Schreibtische",
    "price": 599,
    "pricePrev": 799,
    "stock": 50,
    "ShopStatus": "active",
    "images": [
      "https://...",
      "https://..."
    ]
  }
]
\`\`\`

### Option B: Google Sheets Import

Siehe \`src/hooks/useSheetsApi.ts\`

## 8. Farben & Design anpassen

Die Farben aus \`shop.config.json\` werden aktuell NICHT automatisch angewendet.

### Manuell anpassen:

**1. Tailwind Config** (\`tailwind.config.mjs\`)
\`\`\`js
theme: {
  extend: {
    colors: {
      primary: '#1a5490',  // dein primaryColor
      accent: '#ff6b35'     // dein accentColor
    }
  }
}
\`\`\`

**2. Komponenten durchgehen:**
- \`src/components/Header.tsx\` - Farben von \`#2b4736\` nach \`#1a5490\`
- \`src/components/Footer.tsx\` - Farben anpassen
- \`src/components/SlideCart.tsx\` - Button-Farben

**Suchen & Ersetzen:**
\`\`\`bash
# Finde alle Stellen mit der alten Farbe
grep -r "#2b4736" src/
grep -r "#d9534f" src/
\`\`\`

## 9. Navigation & Footer anpassen

### Kategorien (Header)

\`src/components/Header.tsx\` - Zeile ~36-41
\`\`\`tsx
<Link to="/raum/home-office">Büromöbel</Link>
→ ändern zu deinen Kategorien
\`\`\`

### Footer Links

\`src/components/Footer.tsx\` - Zeile ~36-41
Ändere Kategorien passend zu deinen Produkten

## 10. Installation & Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Öffne [http://localhost:4321](http://localhost:4321)

## 11. Deployment

### Vercel

\`\`\`bash
npm run build

# Vercel CLI
vercel

# Oder via GitHub:
git remote add origin https://github.com/YOUR-USERNAME/desk-shop.git
git add .
git commit -m "Initial desk shop setup"
git push -u origin main
\`\`\`

In Vercel:
1. Repo importieren
2. Environment Variables aus .env eintragen
3. Deploy!

### Netlify

\`\`\`bash
npm run build

# Netlify CLI
netlify deploy --prod
\`\`\`

## 12. Checkliste ✅

Vor dem Go-Live:

- [ ] shop.config.json ausgefüllt
- [ ] .env mit echten Credentials
- [ ] Logo ersetzt
- [ ] Farben angepasst
- [ ] Produkte hinzugefügt
- [ ] Footer-Links geprüft
- [ ] Header-Navigation angepasst
- [ ] Impressum aktualisiert (\`src/pages_react/ImprintPage.tsx\`)
- [ ] Datenschutz geprüft (\`src/pages_react/PrivacyPage.tsx\`)
- [ ] AGB angepasst (\`src/pages_react/TermsPage.tsx\`)
- [ ] Stripe Test-Zahlung durchgeführt
- [ ] Firebase Rules deployed
- [ ] Meta Pixel ID (falls gewünscht)

## Support

Bei Fragen siehe README.md oder öffne ein Issue im Template-Repository.
