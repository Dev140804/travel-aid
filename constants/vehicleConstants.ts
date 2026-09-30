// Structured vehicle lookup for two-wheeler and four-wheeler brands + representative models
// VEHICLE_DATA: brand -> model -> fuel types
export const VEHICLE_DATA: {
  fourWheeler: Record<string, Record<string, string[]>>;
  twoWheeler: Record<string, Record<string, string[]>>;
} = {
  fourWheeler: {
    Tata: {
      Nexon: ["Petrol", "Diesel", "Electric"],
      Punch: ["Petrol"],
      Harrier: ["Petrol", "Diesel"],
      Altroz: ["Petrol", "Diesel"],
      Tiago: ["Petrol", "CNG"],
      Tigor: ["Petrol", "CNG"],
      Safari: ["Petrol", "Diesel"],
      Curvv: ["Petrol"],
    },
    "Maruti Suzuki": {
      Swift: ["Petrol"],
      Baleno: ["Petrol"],
      Brezza: ["Petrol"],
      Ertiga: ["Petrol"],
      WagonR: ["Petrol"],
      Alto: ["Petrol"],
      Dzire: ["Petrol"],
      "Grand Vitara": ["Petrol"],
      Fronx: ["Petrol"],
    },
    Hyundai: {
      i10: ["Petrol"],
      i20: ["Petrol"],
      Venue: ["Petrol"],
      Creta: ["Petrol"],
      Alcazar: ["Petrol"],
      Verna: ["Petrol"],
    },
    Mahindra: {
      Thar: ["Petrol", "Diesel"],
      Bolero: ["Diesel"],
      XUV700: ["Petrol", "Diesel"],
      Scorpio: ["Petrol", "Diesel"],
      XUV300: ["Petrol", "Diesel"],
    },
    Honda: {
      City: ["Petrol"],
      Amaze: ["Petrol"],
      "WR-V": ["Petrol"],
      Civic: ["Petrol"],
      "CR-V": ["Petrol"],
    },
    Toyota: {
      Fortuner: ["Diesel"],
      "Urban Cruiser": ["Petrol"],
      Glanza: ["Petrol"],
      Hyryder: ["Petrol", "Hybrid"],
      Corolla: ["Petrol"],
      Yaris: ["Petrol"],
    },
    Kia: { Seltos: ["Petrol"], Sonet: ["Petrol"], Carnival: ["Petrol"], Carens: ["Petrol"], EV6: ["Electric"] },
    MG: { Hector: ["Petrol", "Diesel"], "Hector Plus": ["Petrol"], ZSI: ["Petrol"], ZST: ["Petrol"] },
    Skoda: { Octavia: ["Petrol"], Superb: ["Petrol"], Kushaq: ["Petrol"] },
    Volkswagen: { Polo: ["Petrol"], Vento: ["Petrol"], Taigun: ["Petrol"], "T-Roc": ["Petrol"] },
    Renault: { Kwid: ["Petrol"], Triber: ["Petrol"], Kiger: ["Petrol"], Duster: ["Petrol", "Diesel"] },
    Nissan: { Magnite: ["Petrol"], Kicks: ["Petrol"], Terrano: ["Petrol"] },
    Ford: { Figo: ["Petrol"], Ecosport: ["Petrol"], "Figo Aspire": ["Petrol"] },
    Jeep: { Compass: ["Petrol", "Diesel"], Wrangler: ["Petrol"], Cherokee: ["Petrol"] },
    BMW: { "Series 3": ["Petrol"], X1: ["Petrol"], X3: ["Petrol"], X5: ["Petrol"] },
    "Mercedes-Benz": { "A-Class": ["Petrol"], "C-Class": ["Petrol"], GLA: ["Petrol"], GLE: ["Petrol"] },
    Audi: { "A3": ["Petrol"], "A4": ["Petrol"], Q3: ["Petrol"], Q5: ["Petrol"] },
    Volvo: { "XC40": ["Petrol"], "XC60": ["Petrol"] },
    Citroen: { C3: ["Petrol"], "C5 Aircross": ["Petrol"] },
    Lexus: { ES: ["Petrol"], RX: ["Petrol"] },
    "Land Rover": { Discovery: ["Petrol"], "Range Rover Evoque": ["Petrol"] },
    Jaguar: { XE: ["Petrol"], XF: ["Petrol"] },
    Porsche: { Macan: ["Petrol"], Cayenne: ["Petrol"] },
    Tesla: { "Model 3": ["Electric"], "Model S": ["Electric"], "Model X": ["Electric"], "Model Y": ["Electric"] },
  },
  twoWheeler: {
    "Hero MotoCorp": { Splendor: ["Petrol"], "HF Deluxe": ["Petrol"], Passion: ["Petrol"], Glamour: ["Petrol"], Xtreme: ["Petrol"], Xpulse: ["Petrol"] },
    Honda: { Activa: ["Petrol"], "CB Shine": ["Petrol"], Unicorn: ["Petrol"], "CB350": ["Petrol"], "CB300R": ["Petrol"] },
    Bajaj: { Pulsar: ["Petrol"], Dominar: ["Petrol"], Discover: ["Petrol"] },
    TVS: { Apache: ["Petrol"], Jupiter: ["Petrol"], NTORQ: ["Petrol"] },
    "Royal Enfield": { "Classic 350": ["Petrol"], "Bullet 350": ["Petrol"], "Hunter 350": ["Petrol"], "Meteor 350": ["Petrol"], Himalayan: ["Petrol"], "Interceptor 650": ["Petrol"], "Continental GT 650": ["Petrol"] },
    Yamaha: { FZ: ["Petrol"], R15: ["Petrol"], "FZ-S": ["Petrol"], "MT-15": ["Petrol"] },
    Suzuki: { Access: ["Petrol"], Gixxer: ["Petrol"], Burgman: ["Petrol"] },
    KTM: { "Duke 125": ["Petrol"], "Duke 200": ["Petrol"], "Duke 390": ["Petrol"], "RC 390": ["Petrol"] },
    Jawa: { "42": ["Petrol"], Perak: ["Petrol"] },
    Yezdi: { Roadster: ["Petrol"], "Dirt Track": ["Petrol"] },
    "Ola Electric": { S1: ["Electric"], "S1 Pro": ["Electric"] },
    Ather: { "450X": ["Electric"], "450 Plus": ["Electric"] },
    Triumph: { "Street Twin": ["Petrol"], "Speed Twin": ["Petrol"] },
    "Harley-Davidson": { "Iron 883": ["Petrol"], "Street 750": ["Petrol"], "Sportster S": ["Petrol"] },
  },
};

export const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

export const FOUR_WHEELER_BRANDS = Object.keys(VEHICLE_DATA.fourWheeler);
export const TWO_WHEELER_BRANDS = Object.keys(VEHICLE_DATA.twoWheeler);

// Note: BRAND_MODELS removed; use VEHICLE_DATA directly for strict scoping of brands/models/fuel types.
