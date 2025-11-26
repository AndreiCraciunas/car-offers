# Ghid de Parsare a Ofertelor Auto

Acest document descrie structura datelor si cum sa adaugi noi oferte in aplicatia de comparare auto.

## Structura Fisierelor

```
cars/
├── index.html          # Pagina principala
├── styles.css          # Stiluri CSS (tema dark)
├── app.js              # Logica aplicatiei
├── data/
│   └── offers.json     # Datele ofertelor (JSON)
└── PARSING_GUIDE.md    # Acest document
```

## Structura JSON a unei Oferte

Fiecare oferta are urmatoarea structura in `data/offers.json`:

```json
{
  "id": "string-unic-identificator",
  "maker": "Marca (Dacia, Renault, Hyundai, etc.)",
  "model": "Model (Bigster, Austral, Tucson, etc.)",
  "version": "Versiunea completa (ex: Extreme Hybrid 155)",
  "year": 2025,
  "imageUrl": "URL imagine (sau gol pentru placeholder)",
  "officialPageUrl": "Link pagina oficiala model",
  "dealership": "Numele dealerului",
  "dealerContact": "Persoana de contact",
  "offerDate": "YYYY-MM-DD",
  "offerValidUntil": "YYYY-MM-DD",
  "offerId": "ID-ul ofertei din PDF",

  "price": {
    "total": 164590.11,
    "currency": "RON sau EUR",
    "discount": 0
  },

  "paymentType": "cash | credit | leasing",

  "financing": {
    "type": "Tipul creditului (ex: Credit Dacia Promo Pack v5)",
    "downPayment": 82502.40,
    "monthlyPayment": 2612.60,
    "monthlyPaymentCurrency": "RON",
    "duration": 36,
    "interestRate": 6.50,
    "effectiveInterestRate": 9.27,
    "totalAmount": 176537.00,
    "creditValue": 82045.00,
    "finalPayment": null,
    "fees": {
      "dosarAnalysis": 350.00,
      "monthlyAdmin": 79.00,
      "insurance": 19.00
    }
  },

  "services": {
    "servicePackage": true,
    "servicePackageDetails": "Pachet Revizii, ITP...",
    "extendedWarranty": true,
    "extendedWarrantyDetails": "Dacia Extenso 24 luni...",
    "trafficAccidentInsurance": true,
    "cascoInsurance": false
  },

  "specs": {
    "fuelType": "Benzina + Hybrid | Full Hybrid | Diesel | Electric",
    "enginePower": "116 kW / 155 CP",
    "engineDisplacement": 1789,
    "torque": "172 Nm",
    "transmission": "Automata | Manuala",
    "gears": "6",
    "drivetrain": "4x2 | 4x4 | 4WD | 2WD",
    "bodyType": "SUV | Sedan | Hatchback",
    "doors": 5,
    "seats": 5,
    "consumption": "4.7 l/100km (mixt WLTP)",
    "emissions": "106 g/km CO2",
    "maxSpeed": "180 km/h",
    "acceleration": "8.5s (0-100 km/h)",
    "dimensions": {
      "length": 4570,
      "width": 1812,
      "height": 1662,
      "wheelbase": 2702,
      "groundClearance": 220
    },
    "weight": {
      "curb": "1419-1487 kg",
      "maxAuthorized": 1940,
      "towingBraked": 1000,
      "towingUnbraked": 745
    },
    "tankCapacity": 50,
    "trunkCapacity": 616,
    "tires": "215/60/R18",
    "color": "Arctic White"
  },

  "features": {
    "design": ["lista", "de", "dotari"],
    "multimedia": ["..."],
    "comfort": ["..."],
    "safety": ["..."]
  },

  "accessories": ["accesorii", "optionale"],

  "sourceFiles": [
    "Folder/nume_fisier.pdf"
  ]
}
```

## Tipuri de PDF-uri si Informatii Cheie

### 1. Oferte de Credit (Mobilize Financial Services / RCI)

**Identificare:** Logo "MOBILIZE FINANCIAL SERVICES", titlu "Programul Dacia Avantaj" sau similar

**Informatii de extras:**
- Model / Versiune (sectiunea "Masina ta")
- Pret TVA inclus
- Discount RCI
- Rata Dobanda Anuala Fixa
- Plata Initiala (avans)
- Prima Rata
- Durata (luni)
- Servicii incluse (Pachet Revizii, Extindere Garantie, etc.)
- Tabel cu rate (pentru detalii)
- Dobanda anuala efectiva (DAE)
- Dealer / Agent
- ID Oferta si Data

### 2. Configurari Vehicule (Dacia, Renault)

**Identificare:** Titlu "CONFIGURARE [MARCA] [MODEL]", QR code, logo marca

**Informatii de extras:**
- Versiune completa
- Motor
- Cilindree
- Carburant
- Tip cutie viteze
- Culoare
- Tapiterie
- Roti/Jante
- Lista completa echipamente (Design, Multimedia, Confort, Siguranta)
- Detalii tehnice (dimensiuni, greutati, consum, emisii)

### 3. Fise Tehnice (Hyundai)

**Identificare:** Tabel cu "DATE TEHNICE", logo Hyundai

**Informatii de extras:**
- Toate specificatiile tehnice din tabel
- Liste complete dotari (SIGURANTA SI SECURITATE, DOTARI EXTERIOARE, CONFORT SI FUNCTIONALITATE, AUDIO)
- Cod stoc

### 4. Oferte Comerciale (Renault)

**Identificare:** Titlu "Oferta comerciala personalizata", logo Renault

**Informatii de extras:**
- Model si Versiune
- Combustibil
- Cutie de viteze
- Tarif versiune cu TVA
- Dotari si preturi individuale
- Total cu TVA
- Reducere
- Oferta finala
- Rata lunara (daca exista)
- Dealer si contact
- Valabilitate oferta

## Cum sa Adaugi o Noua Oferta

1. **Identifica tipul PDF-ului** din cele de mai sus

2. **Creaza un ID unic** pentru oferta:
   - Format: `marca-model-tip-motor-varianta`
   - Exemplu: `dacia-bigster-hybrid-155-credit-36`

3. **Extrage datele** conform structurii JSON de mai sus

4. **Pentru imagini:**
   - Cauta pe Google Images: `[marca] [model] [an] official`
   - Sau foloseste pagina oficiala a modelului
   - Daca nu gasesti, lasa `imageUrl` gol (se va afisa placeholder)

5. **Pentru link oficial:**
   - Dacia: `https://www.dacia.ro/gama-dacia/[model].html`
   - Renault: `https://www.renault.ro/vehicule/[model].html`
   - Hyundai: `https://www.hyundai.ro/modele/[model]/`

6. **Adauga oferta** in array-ul `offers` din `data/offers.json`

7. **Actualizeaza** campul `lastUpdated` cu data curenta

## Exemple de Parsare

### Exemplu 1: Oferta Credit Dacia

**Din PDF:**
```
Model / Versiune: Dacia Bigster extreme hybrid 155
Pret (TVA inclus)*: 164,590.11 RON
Rata Dobanda Anuala Fixa: 6.50%
Plata Initiala: 82,502.40 Lei
Prima Rata: 2,612.60 Lei
Durata: 36 luni
```

**In JSON:**
```json
{
  "id": "dacia-bigster-hybrid-155-credit-36",
  "maker": "Dacia",
  "model": "Bigster",
  "version": "Extreme Hybrid 155",
  "price": {
    "total": 164590.11,
    "currency": "RON",
    "discount": 0
  },
  "paymentType": "credit",
  "financing": {
    "type": "Credit Dacia Promo Pack v5",
    "downPayment": 82502.40,
    "monthlyPayment": 2612.60,
    "duration": 36,
    "interestRate": 6.50
  }
}
```

### Exemplu 2: Oferta Renault cu Reducere

**Din PDF:**
```
RENAULT AUSTRAL E-Tech full hybrid 200
Versiune: techno
Total cu TVA: 39.284,93 EUR
Reducere: -5.299,99 EUR
OFERTA FINALA CU TVA: 33.984,94 EUR
Rata lunara: de la 2.018,93 Lei / Luna
```

**In JSON:**
```json
{
  "id": "renault-austral-full-hybrid-200-techno",
  "maker": "Renault",
  "model": "Austral",
  "version": "E-Tech Full Hybrid 200 Techno",
  "price": {
    "total": 33984.94,
    "currency": "EUR",
    "discount": 5299.99
  },
  "paymentType": "credit",
  "financing": {
    "type": "Renault Credit",
    "monthlyPayment": 2018.93,
    "monthlyPaymentCurrency": "RON"
  }
}
```

## Categorii de Dotari

Grupeaza dotarile in urmatoarele categorii:

- **safety** (Siguranta): Airbag-uri, ABS, ESP, senzori, camere, asistenta la condus
- **design** (Design): Jante, faruri, tapiterie, culori, elemente exterioare
- **comfort** (Confort): Climatizare, scaune, volan, geamuri electrice, spatii depozitare
- **multimedia** (Multimedia): Sistem infotainment, navigatie, conectivitate, audio

## Tipuri de Combustibil

Foloseste aceste valori pentru `fuelType`:

- `Benzina`
- `Diesel`
- `Benzina + Hybrid` (pentru mild hybrid)
- `Benzina + Electric (Full Hybrid)` (pentru full hybrid)
- `Electric`

## Note Importante

1. **Preturile** pot fi in RON sau EUR - pastreaza moneda originala
2. **Datele** folosesc formatul ISO: YYYY-MM-DD
3. **Valorile null** sunt acceptate pentru campuri lipsa
4. **ID-urile** trebuie sa fie unice in tot fisierul
5. **sourceFiles** ajuta la tracking-ul sursei datelor

## Lansarea Aplicatiei

Pentru a vizualiza aplicatia, ai nevoie de un server local:

```bash
# Cu Python
python -m http.server 8000

# Cu Node.js (npx)
npx serve

# Cu VS Code
# Instaleaza extensia "Live Server" si click dreapta pe index.html
```

Apoi deschide `http://localhost:8000` in browser.
