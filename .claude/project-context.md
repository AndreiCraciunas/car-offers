# Car Offers Comparator - Project Context

## Overview
A static web application for comparing car offers from Romanian dealerships. Built with vanilla HTML, CSS, and JavaScript (no frameworks). The app displays car offers with filtering, sorting, and detailed views.

## Tech Stack
- **Frontend**: HTML5, CSS3 (with CSS variables for theming), vanilla ES6 JavaScript
- **Data**: JSON file (`data/offers.json`)
- **Hosting**: GitHub Pages at https://andreicraciunas.github.io/car-offers/
- **Language**: Romanian (UI text)

## Project Structure
```
cars/
├── index.html          # Main HTML structure
├── styles.css          # All styles (dark theme, responsive)
├── app.js              # Main application logic (CarOffersApp class)
├── data/
│   └── offers.json     # All offer data and pending offers
├── images/             # Car images (local)
├── offers/             # Source PDF files from dealerships (for parsing)
│   ├── Chery Tiggo 8/
│   ├── Dacia Duster/
│   ├── Hyundai Tucson/
│   ├── Nissan Qashqai/
│   ├── Peugeot 2008/
│   └── Renault Austral/
├── package.json        # npm scripts (serve)
└── PARSING_GUIDE.md    # Guide for parsing PDF offers
```

## Key Features

### 1. Offer Cards
- Display car info: maker, model, version, specs (power, consumption, transmission)
- Price section: total price, monthly payment, down payment (avans), duration
- Fuel type badge (color-coded: hybrid=green, electric=blue, etc.)
- Payment type badge (cash, credit, leasing)
- Click to open detailed modal

### 2. Filters & Sorting
- Filter by: Maker, Fuel type, Payment type
- Sort by: Price (asc/desc), Monthly payment (asc/desc), Power (desc), Maker (A-Z)

### 3. Pending Offers Section
- Collapsible section at top for models awaiting dealer callbacks
- Shows: MG HS, Mazda CX-5, VW T-Roc
- Cards are clickable links to official pages
- Status badge: "astept apel"

### 4. Modal Details
- Full specifications (engine, dimensions, weight, etc.)
- Features by category (safety, comfort, multimedia, design)
- Financing details for credit/leasing offers
- Services included (warranty, service packages)

## Data Structure

### Offer Object
```json
{
  "id": "unique-id",
  "maker": "Brand",
  "model": "Model",
  "version": "Trim/Version",
  "year": 2025,
  "imageUrl": "images/car.webp",
  "officialPageUrl": "https://...",
  "dealership": "Dealer Name",
  "dealerContact": "Contact Person",
  "offerDate": "2025-11-25",
  "offerValidUntil": "2025-11-30",
  "offerId": "ABC123",
  "price": {
    "total": 32918.02,
    "currency": "EUR",
    "discount": 0
  },
  "paymentType": "cash|credit|leasing",
  "financing": {
    "type": "Credit Type",
    "downPayment": 9936.88,
    "monthlyPayment": 495.36,
    "monthlyPaymentCurrency": "EUR",
    "duration": 60,
    "interestRate": 8.90,
    "effectiveInterestRate": 10.95,
    "totalAmount": 39654.68,
    "creditValue": 22972.60,
    "finalPayment": null,
    "fees": {}
  },
  "services": {
    "servicePackage": true,
    "servicePackageDetails": "...",
    "extendedWarranty": true,
    "extendedWarrantyDetails": "...",
    "cascoInsurance": false
  },
  "specs": {
    "fuelType": "Benzina + Hybrid",
    "enginePower": "116 kW / 155 CP",
    "engineDisplacement": 1789,
    "torque": "172 Nm",
    "transmission": "Automata",
    "drivetrain": "4x2|4WD|2WD",
    "consumption": "4.7 l/100km",
    "emissions": "106 g/km CO2",
    "dimensions": { "length": 4570, "width": 1812, "height": 1662 },
    "weight": { "curb": "1419-1487 kg", "maxAuthorized": 1940 },
    "trunkCapacity": 616,
    "seats": 5,
    "color": "Arctic White"
  },
  "features": {
    "safety": [],
    "comfort": [],
    "multimedia": [],
    "design": []
  },
  "sourceFiles": ["path/to/source.pdf"]
}
```

### Pending Offer Object
```json
{
  "id": "pending-mg-hs",
  "maker": "MG",
  "model": "HS",
  "version": "",
  "year": 2025,
  "imageUrl": "",
  "officialPageUrl": "https://mgmotoriasi.ro/noul-hs/",
  "status": "astept apel",
  "requestedDate": "2025-11-25",
  "notes": "Astept oferta de la dealer"
}
```

## Current Offers (15 total)
- **Dacia**: 2x Bigster Extreme Hybrid 155 (credit options: 36mo, 60mo)
- **Hyundai**: 3x Tucson Hybrid 239CP (Premium 4WD, Style 2WD, Luxury 4WD)
- **Renault**: 2x Austral (Full Hybrid 200, Mild Hybrid 160)
- **Chery**: 1x Tiggo 8 Pro Max 2.0T Luxury 7 seats
- **Nissan**: 2x Qashqai (N-DESIGN, TEKNA), 1x X-Trail e-4ORCE ACENTA
- **Peugeot**: 4x 2008 Hybrid 145 (Allure stoc, Allure DEMO, Style stoc, Allure leasing)

## Pending Offers (3)
- MG HS
- Mazda CX-5
- VW T-Roc

## Adding New Offers

### From PDF Files
1. Place PDF files in `offers/[Brand Name]/` folder
2. Read the PDF and extract all relevant data
3. Add new offer object to `data/offers.json` in the `offers` array
4. If car image available, save to `images/` folder and set `imageUrl`
5. All prices should be in EUR (convert from RON using rate ~5 RON = 1 EUR)

### Key Fields to Extract
- Price (total, discounts)
- Financing details (monthly payment, down payment, duration, interest rates)
- Engine specs (power in kW/CP, displacement, torque)
- Fuel type and consumption
- Transmission type
- Dimensions and weight
- Equipment/features lists
- Dealer info and offer validity

## Running Locally
```bash
npm start
# or
npx serve .
```

## Deployment
Push to `main` branch - GitHub Pages auto-deploys from https://github.com/AndreiCraciunas/car-offers

## CSS Variables (Dark Theme)
```css
--bg-primary: #0f0f0f
--bg-secondary: #1a1a1a
--bg-tertiary: #252525
--text-primary: #ffffff
--text-secondary: #a0a0a0
--accent-primary: #6366f1
--accent-secondary: #818cf8
--success: #22c55e
--warning: #eab308
--error: #ef4444
```

## Notes
- All UI text is in Romanian
- Currency display: EUR preferred, with proper formatting
- Images have fallback placeholder (car SVG icon)
- Mobile responsive design
- Collapsible sections use CSS transitions
