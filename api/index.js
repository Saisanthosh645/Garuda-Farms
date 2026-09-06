// server/api.ts
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// server/db/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseClient = null;
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith("http")) {
    return null;
  }
  try {
    if (!supabaseClient) {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
    return supabaseClient;
  } catch (err) {
    console.warn("[Supabase Client Error]:", err);
    return null;
  }
}
function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && url.startsWith("http"));
}
async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) {
    return {
      ok: false,
      message: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing or invalid."
    };
  }
  try {
    const { data, error } = await client.from("categories").select("count", { count: "exact", head: true });
    if (error) {
      return {
        ok: false,
        message: `Database query error: ${error.message}`,
        details: error
      };
    }
    return {
      ok: true,
      message: "Successfully connected to Supabase PostgreSQL database."
    };
  } catch (err) {
    return {
      ok: false,
      message: `Connection failed: ${err.message}`
    };
  }
}

// src/data/products.ts
var PRODUCTS = [
  // ================= 1. EGGS (5) =================
  {
    id: 1,
    name: "Farm Fresh Eggs",
    category: "Eggs",
    description: "Golden yolk, daily hand-collected fresh farm eggs laid by pasture-raised hens with zero antibiotics or artificial feed additives.",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
    price: 120,
    originalPrice: 140,
    rating: 4.9,
    reviews: 248,
    availableWeights: ["6 Eggs", "12 Eggs", "30 Tray"],
    defaultWeight: "12 Eggs",
    badge: "Bestseller",
    farmOrigin: "Garuda Pasture Flock #1, Shamshabad",
    stock: true,
    featured: true,
    organicCert: "Certified Natural & Free Range",
    tags: ["High Protein", "Rich Golden Yolk", "No Hormones"],
    nutritionHighlights: ["6.5g Protein per egg", "Rich in Choline & Lutein", "Vitamin B12"]
  },
  {
    id: 2,
    name: "Country Eggs / Nati Kodi Eggs",
    category: "Eggs",
    description: "Authentic desi country eggs from freely foraging native breed hens. Naturally nutrient-dense with a deep orange yolk and rich taste.",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    price: 180,
    originalPrice: 210,
    rating: 5,
    reviews: 184,
    availableWeights: ["6 Eggs", "12 Eggs", "24 Eggs"],
    defaultWeight: "12 Eggs",
    badge: "Desi Pure",
    farmOrigin: "Native Grassland Sanctuary, Chevella",
    stock: true,
    featured: true,
    organicCert: "100% Free Foraging Desi",
    tags: ["Ayurvedic Grade", "Omega 3 Boost", "Deep Amber Yolk"],
    nutritionHighlights: ["Higher Omega-3", "Double Vitamin D", "Traditional Stamina"]
  },
  {
    id: 3,
    name: "Brown Eggs",
    category: "Eggs",
    description: "Wholesome brown-shelled eggs from healthy, grain-fed Rhode Island Red hens nurtured in hygienic, open-air farm runs.",
    image: "https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80",
    price: 135,
    originalPrice: 155,
    rating: 4.8,
    reviews: 96,
    availableWeights: ["6 Eggs", "12 Eggs", "30 Tray"],
    defaultWeight: "12 Eggs",
    badge: "Farm Fresh",
    farmOrigin: "Green Meadow Unit 3, Medchal",
    stock: true,
    tags: ["Grain Fed", "Rich Selenium", "Clean Shells"],
    nutritionHighlights: ["70 Calories", "100% Vegetarian Feed", "Essential Amino Acids"]
  },
  {
    id: 4,
    name: "Duck Eggs",
    category: "Eggs",
    description: "Extra-large creamy duck eggs with a velvety, rich yolk. Ideal for gourmet baking, rich omelettes, and traditional delicacies.",
    image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80",
    price: 210,
    originalPrice: 240,
    rating: 4.7,
    reviews: 62,
    availableWeights: ["6 Eggs", "12 Eggs"],
    defaultWeight: "6 Eggs",
    badge: "Artisanal",
    farmOrigin: "Waterpond Agro Sanctuary, Krishna Valley",
    stock: true,
    tags: ["Extra Large", "Baking Gold", "Creamy Rich"],
    nutritionHighlights: ["9g Protein per egg", "Dense Mineral Profile", "Rich in Healthy Fats"]
  },
  {
    id: 5,
    name: "Quail Eggs",
    category: "Eggs",
    description: "Bite-sized, speckled superfood eggs loaded with antioxidants, iron, and concentrated micro-nutrients loved by kids and athletes.",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
    price: 140,
    originalPrice: 160,
    rating: 4.9,
    reviews: 79,
    availableWeights: ["12 Eggs", "24 Eggs"],
    defaultWeight: "24 Eggs",
    badge: "Superfood",
    farmOrigin: "Avian Wellness Farm, Vikarabad",
    stock: true,
    tags: ["Immunity Booster", "Iron Rich", "Kid Friendly"],
    nutritionHighlights: ["High Iron & Riboflavin", "Concentrated Zinc", "Low Calorie Dense"]
  },
  // ================= 2. MEAT (5) =================
  {
    id: 6,
    name: "Mutton",
    category: "Meat",
    description: "Tender and juicy young goat meat curry cut. 100% pasture-grazed, grass-fed livestock with zero chemical stimulants.",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
    price: 499,
    originalPrice: 550,
    rating: 4.9,
    reviews: 310,
    availableWeights: ["500g", "1kg", "2kg"],
    defaultWeight: "500g",
    badge: "Tender Cut",
    farmOrigin: "Deccan Grasslands Ranch, Mahbubnagar",
    stock: true,
    featured: true,
    organicCert: "100% Grass Grazed & Halal Certified",
    tags: ["Curry Cut", "Grass Fed", "Freshly Processed"],
    nutritionHighlights: ["26g Protein per 100g", "Rich in Heme Iron", "Zinc & Vitamin B12"]
  },
  {
    id: 7,
    name: "Goat Meat",
    category: "Meat",
    description: "Premium boneless prime cut goat meat. Lean, succulent, and perfectly portioned for slow-cooked stews, roasts, and biryanis.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    price: 580,
    originalPrice: 640,
    rating: 4.9,
    reviews: 142,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "Boneless Prime",
    farmOrigin: "Deccan Grasslands Ranch, Mahbubnagar",
    stock: true,
    tags: ["Zero Bone", "High Lean Muscle", "Melt-in-Mouth"],
    nutritionHighlights: ["Ultra Lean", "Zero Additives", "Superior Digestibility"]
  },
  {
    id: 8,
    name: "Lamb Meat",
    category: "Meat",
    description: "Delicate, tender lamb chops and curry cuts from naturally grazing sheep nurtured on organic clover and mountain herbs.",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80",
    price: 540,
    originalPrice: 600,
    rating: 4.8,
    reviews: 95,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "Gourmet",
    farmOrigin: "Highland Meadow Pastures",
    stock: true,
    tags: ["Chops & Cuts", "Herb Grazed", "Delicate Flavour"],
    nutritionHighlights: ["High Conjugated Linoleic Acid", "Pure Protein", "Omega 3 Healthy Fats"]
  },
  {
    id: 9,
    name: "Mutton Keema",
    category: "Meat",
    description: "Freshly machine-minced tender goat meat, twice ground for perfect silkiness. Ideal for shami kebabs, keema matar, and samosas.",
    image: "https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80",
    price: 520,
    originalPrice: 580,
    rating: 4.9,
    reviews: 188,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "Finely Minced",
    farmOrigin: "Deccan Grasslands Ranch, Mahbubnagar",
    stock: true,
    tags: ["Twice Ground", "No Sinew", "Quick Cook"],
    nutritionHighlights: ["Fine Texture", "High Bioavailable Iron", "Zero Preservatives"]
  },
  {
    id: 10,
    name: "Mutton Pickle",
    category: "Meat",
    description: "Traditional slow-cooked bone-in mutton pickle preserved in cold-pressed sesame oil with hand-ground Andhra spices and garlic.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    price: 450,
    originalPrice: 499,
    rating: 5,
    reviews: 280,
    availableWeights: ["250g", "500g"],
    defaultWeight: "250g",
    badge: "Artisanal Recipe",
    farmOrigin: "Garuda Kitchens, Guntur Heritage",
    stock: true,
    featured: true,
    tags: ["Cold Pressed Oil", "Grandma Recipe", "100% Natural"],
    nutritionHighlights: ["Aromatic Spices", "Zero Synthetic Vinegar", "Natural Fermentation"]
  },
  // ================= 3. CHICKEN (8) =================
  {
    id: 11,
    name: "Country Chicken / Nati Kodi",
    category: "Chicken",
    description: "Free-roaming indigenous Nati Kodi chicken with dense, flavourful meat and rustic texture. Ideal for traditional country stews and biryanis.",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
    price: 380,
    originalPrice: 420,
    rating: 5,
    reviews: 412,
    availableWeights: ["1kg (Whole Cut)", "1.5kg"],
    defaultWeight: "1kg (Whole Cut)",
    badge: "Heritage Breed",
    farmOrigin: "Garuda Forest Sanctuary, Nallamala Foothills",
    stock: true,
    featured: true,
    organicCert: "100% Free Range Native",
    tags: ["Intense Flavor", "Dense Bone Broth", "Zero Hormones"],
    nutritionHighlights: ["High Collagen", "Lean Native Protein", "Immunity Broth"]
  },
  {
    id: 12,
    name: "Broiler Chicken",
    category: "Chicken",
    description: "Hygienically raised tender chicken curry cut. Carefully raised in airy coops on clean vegetarian feed with continuous vet checks.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    price: 210,
    originalPrice: 240,
    rating: 4.7,
    reviews: 195,
    availableWeights: ["500g", "1kg (Curry Cut)"],
    defaultWeight: "1kg (Curry Cut)",
    badge: "Everyday Fresh",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Curry Cut", "Cleanly Dressed", "Juicy & Tender"],
    nutritionHighlights: ["Pure Protein", "Low Saturated Fat", "Clean Wash"]
  },
  {
    id: 13,
    name: "Chicken Breast",
    category: "Chicken",
    description: "Skinless, boneless tender fillets of prime chicken breast. Extra clean cut, exceptionally high in pure protein for healthy gym meals.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    price: 290,
    originalPrice: 330,
    rating: 4.9,
    reviews: 320,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "High Protein",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Boneless", "Gym & Fitness", "Zero Trim Fat"],
    nutritionHighlights: ["31g Protein per 100g", "165 Calories", "Pure Lean Mass"]
  },
  {
    id: 14,
    name: "Chicken Legs",
    category: "Chicken",
    description: "Juicy, plump chicken drumsticks. Tender meat that absorbs marinades deeply, perfect for tandoori grills, barbecues, and spicy curries.",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
    price: 260,
    originalPrice: 290,
    rating: 4.8,
    reviews: 145,
    availableWeights: ["500g (4-5 pcs)", "1kg"],
    defaultWeight: "500g (4-5 pcs)",
    badge: "BBQ Special",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Drumsticks", "BBQ Grill", "Juicy Dark Meat"],
    nutritionHighlights: ["Juicy & Succulent", "Collagen Rich", "Tender Texture"]
  },
  {
    id: 15,
    name: "Chicken Wings",
    category: "Chicken",
    description: "Crispy cut chicken wings with skin intact for that golden crunchy finish. Perfect for hot wing platters and air fryer delicacies.",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80",
    price: 220,
    originalPrice: 250,
    rating: 4.8,
    reviews: 110,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "Crispy Cut",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Appetizer", "Crispy Skin", "Game Night Pick"],
    nutritionHighlights: ["Flavor Packed", "Quick Marinate", "Rich Texture"]
  },
  {
    id: 16,
    name: "Chicken Liver",
    category: "Chicken",
    description: "Silky smooth fresh chicken liver packed with bioavailable iron, vitamin A, and zinc. Thoroughly cleaned and trimmed.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    price: 130,
    originalPrice: 150,
    rating: 4.6,
    reviews: 84,
    availableWeights: ["250g", "500g"],
    defaultWeight: "500g",
    badge: "Nutrient Dense",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Iron Powerhouse", "Vitamin A", "Silky Fry"],
    nutritionHighlights: ["Highest Vitamin A", "Folate & Iron", "Metabolic Boost"]
  },
  {
    id: 17,
    name: "Chicken Keema",
    category: "Chicken",
    description: "Finely minced fresh chicken breast meat with zero gristle or fillers. Ready to turn into savory patties, kathi rolls, and kheema fry.",
    image: "https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80",
    price: 280,
    originalPrice: 310,
    rating: 4.8,
    reviews: 162,
    availableWeights: ["500g", "1kg"],
    defaultWeight: "500g",
    badge: "Lean Mince",
    farmOrigin: "Garuda Bio-Secure Coop, Rangareddy",
    stock: true,
    tags: ["Breast Mince", "Zero Bone", "Fast Cook"],
    nutritionHighlights: ["High Protein Low Fat", "Quick Saut\xE9", "Kid Favorite"]
  },
  {
    id: 18,
    name: "Chicken Pickle",
    category: "Chicken",
    description: "Crispy fried boneless country chicken chunks steeped in aromatic gingelly oil, freshly roasted coriander seeds, red chillies, and ginger garlic.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    price: 360,
    originalPrice: 400,
    rating: 4.9,
    reviews: 350,
    availableWeights: ["250g", "500g"],
    defaultWeight: "250g",
    badge: "Andhra Special",
    farmOrigin: "Garuda Kitchens, Guntur Heritage",
    stock: true,
    featured: true,
    tags: ["Spicy Crunch", "Pure Sesame Oil", "Preservative Free"],
    nutritionHighlights: ["Authentic Spices", "Zero Artificial Color", "Aromatic Guntur Chilli"]
  },
  // ================= 4. MUSHROOM (4) =================
  {
    id: 19,
    name: "Button Mushroom",
    category: "Mushroom",
    description: "Crisp, ivory-white button mushrooms grown in temperature-controlled organic substrate chambers. Plucked at peak freshness.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    price: 85,
    originalPrice: 100,
    rating: 4.8,
    reviews: 130,
    availableWeights: ["200g Box", "400g Pack"],
    defaultWeight: "200g Box",
    badge: "Harvest Fresh",
    farmOrigin: "Garuda Fungi Chamber #2, Sangareddy",
    stock: true,
    organicCert: "100% Organic Controlled Fungi",
    tags: ["Vitamin D", "Crisp White", "Saut\xE9 Ready"],
    nutritionHighlights: ["Natural Ergothioneine", "Low Calorie Superfood", "Gut Friendly Fiber"]
  },
  {
    id: 20,
    name: "Oyster Mushroom",
    category: "Mushroom",
    description: "Delicate fan-shaped organic oyster mushrooms with an exquisite velvety texture and subtle woodsy umami aroma.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    price: 110,
    originalPrice: 130,
    rating: 4.9,
    reviews: 92,
    availableWeights: ["200g Pack"],
    defaultWeight: "200g Pack",
    badge: "Gourmet Fungi",
    farmOrigin: "Garuda Fungi Chamber #2, Sangareddy",
    stock: true,
    tags: ["Umami Rich", "Velvety Soft", "Chef Choice"],
    nutritionHighlights: ["High Beta-Glucans", "Cholesterol Lowering", "Plant Protein"]
  },
  {
    id: 21,
    name: "Milky Mushroom",
    category: "Mushroom",
    description: "Thick, fleshy tropical milky mushrooms with a firm meaty bite and long shelf-life. Splendid in curries and biryanis.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    price: 120,
    originalPrice: 140,
    rating: 4.7,
    reviews: 58,
    availableWeights: ["250g Pack"],
    defaultWeight: "250g Pack",
    badge: "Meaty Bite",
    farmOrigin: "Garuda Fungi Chamber #2, Sangareddy",
    stock: true,
    tags: ["Fleshy Texture", "Curry Favorite", "High Fiber"],
    nutritionHighlights: ["Dense Fiber", "B-Complex Vitamins", "Immuno-stimulant"]
  },
  {
    id: 22,
    name: "Mushroom Pickle",
    category: "Mushroom",
    description: "Sun-dried wild mushrooms pan-tossed in garlic, mustard seeds, fenugreek, and cold-pressed mustard oil for an irresistible savory punch.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    price: 240,
    originalPrice: 280,
    rating: 4.8,
    reviews: 142,
    availableWeights: ["250g Jar"],
    defaultWeight: "250g Jar",
    badge: "Spicy Umami",
    farmOrigin: "Garuda Kitchens, Guntur Heritage",
    stock: true,
    tags: ["Vegan Delicacy", "Tangy & Spicy", "Cold Pressed Oil"],
    nutritionHighlights: ["Rich in Antioxidants", "Probiotic Herbs", "Zero Artificial Preservatives"]
  },
  // ================= 5. HONEY (4) =================
  {
    id: 23,
    name: "Pure Farm Honey",
    category: "Honey",
    description: "Golden, multi-floral raw nectar gathered by Italian honeybees from our organic orchard blooms of neem, mustard, and citrus.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    price: 320,
    originalPrice: 380,
    rating: 5,
    reviews: 490,
    availableWeights: ["500g Jar", "1kg Jar"],
    defaultWeight: "500g Jar",
    badge: "Purest Nectar",
    farmOrigin: "Garuda Apiary Groves, Vikarabad Forest Border",
    stock: true,
    featured: true,
    organicCert: "100% Raw Unpasteurized NMR Tested",
    tags: ["NMR Certified", "Zero Added Sugar", "Orchard Multi-Floral"],
    nutritionHighlights: ["Natural Enzymes Alive", "Pollen Intact", "Low Glycemic Index"]
  },
  {
    id: 24,
    name: "Forest Honey",
    category: "Honey",
    description: "Dark, amber-hued wild honey collected sustainably by tribal gatherers from ancient forest trees in the Western Ghats.",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80",
    price: 420,
    originalPrice: 480,
    rating: 4.9,
    reviews: 215,
    availableWeights: ["500g Jar", "1kg Jar"],
    defaultWeight: "500g Jar",
    badge: "Wild Reserve",
    farmOrigin: "Nallamala Tribal Agro Forest Reserve",
    stock: true,
    tags: ["Wild Forest", "Deep Mineral Amber", "Tribal Harvest"],
    nutritionHighlights: ["High Polyphenol Count", "Medicinal Grade", "Natural Cough Soother"]
  },
  {
    id: 25,
    name: "Raw Honey",
    category: "Honey",
    description: "Completely unheated, unpasteurized, and single-strained honey retaining all natural bee propolis, royal jelly traces, and live enzymes.",
    image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80",
    price: 360,
    originalPrice: 410,
    rating: 4.9,
    reviews: 178,
    availableWeights: ["500g Jar"],
    defaultWeight: "500g Jar",
    badge: "Unprocessed",
    farmOrigin: "Garuda Apiary Groves, Vikarabad",
    stock: true,
    tags: ["Micro-Filtered", "Living Enzymes", "Bee Propolis"],
    nutritionHighlights: ["Living Active Enzymes", "Rich Flavonoids", "Natural Antiseptic"]
  },
  {
    id: 26,
    name: "Honeycomb",
    category: "Honey",
    description: "Fresh square of 100% edible natural beeswax comb brimming with virgin honey straight from the hive. The ultimate honey luxury.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    price: 490,
    originalPrice: 550,
    rating: 5,
    reviews: 135,
    availableWeights: ["250g Comb Box"],
    defaultWeight: "250g Comb Box",
    badge: "Raw Luxury",
    farmOrigin: "Garuda Apiary Groves, Vikarabad",
    stock: true,
    tags: ["100% Edible Wax", "Hive Direct", "Gourmet Cheese Pairing"],
    nutritionHighlights: ["Raw Wax Alcohols", "Concentrated Pollen", "Antimicrobial"]
  },
  // ================= 6. DAIRY (7) =================
  {
    id: 27,
    name: "Fresh Cow Milk",
    category: "Dairy",
    description: "Raw, unadulterated A2 Gir and Sahiwal cow milk. Naturally sweet, easy to digest, delivered in sanitized glass bottles within 4 hours of milking.",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    price: 90,
    originalPrice: 105,
    rating: 5,
    reviews: 620,
    availableWeights: ["1 Litre", "2 Litres"],
    defaultWeight: "1 Litre",
    badge: "A2 Vedic Desi",
    farmOrigin: "Garuda Goshala, Chevella Green Belt",
    stock: true,
    featured: true,
    organicCert: "Certified A2 Beta-Casein Single Herd",
    tags: ["Desi Gir Cow", "Glass Bottle", "Delivered by 7 AM"],
    nutritionHighlights: ["Pure A2 Beta-Casein", "Bioavailable Calcium", "Zero Hormones or Oxytocin"]
  },
  {
    id: 28,
    name: "Buffalo Milk",
    category: "Dairy",
    description: "Rich, thick Murrah buffalo milk with natural 7%+ milk fat. Creates the thickest malai, richest kheer, and heavenly creamy tea.",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80",
    price: 95,
    originalPrice: 110,
    rating: 4.8,
    reviews: 310,
    availableWeights: ["1 Litre"],
    defaultWeight: "1 Litre",
    badge: "Rich & Creamy",
    farmOrigin: "Garuda Dairy Unit, Shamshabad",
    stock: true,
    tags: ["High Fat (7%+)", "Thick Malai", "Tea Connoisseur"],
    nutritionHighlights: ["Dense Calcium", "High Energy", "Creamy Phospholipids"]
  },
  {
    id: 29,
    name: "Curd",
    category: "Dairy",
    description: "Thick, velvety dahi cultured slowly in earthenware clay pots with heirloom heritage cultures for deep probiotic goodness.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    price: 65,
    originalPrice: 75,
    rating: 4.9,
    reviews: 240,
    availableWeights: ["500g Pot", "1kg Pot"],
    defaultWeight: "500g Pot",
    badge: "Claypot Set",
    farmOrigin: "Garuda Goshala, Chevella",
    stock: true,
    tags: ["Heirloom Culture", "Claypot Set", "Probiotic Power"],
    nutritionHighlights: ["Live Probiotic Cultures", "Gut Healing Lactic Acid", "Natural Protein"]
  },
  {
    id: 30,
    name: "Paneer",
    category: "Dairy",
    description: "Ultra-soft, melt-in-mouth cottage cheese crafted from whole A2 farm milk curdled naturally with lemon and whey. Never pressed with chemicals.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    price: 130,
    originalPrice: 150,
    rating: 4.9,
    reviews: 380,
    availableWeights: ["200g Pack", "500g Pack"],
    defaultWeight: "200g Pack",
    badge: "Malai Soft",
    farmOrigin: "Garuda Dairy Unit, Shamshabad",
    stock: true,
    featured: true,
    tags: ["Fresh Daily", "Melt in Mouth", "No Starch or Bleach"],
    nutritionHighlights: ["18g Protein per 100g", "Pure Milk Fat", "Zero Preservatives"]
  },
  {
    id: 31,
    name: "Ghee",
    category: "Dairy",
    description: "Golden, granular A2 Vedic Bilona Ghee made by churning whole curd with wooden bilona and slow firewood simmering in bronze vats.",
    image: "https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80",
    price: 850,
    originalPrice: 950,
    rating: 5,
    reviews: 540,
    availableWeights: ["500ml Jar", "1 Litre Jar"],
    defaultWeight: "500ml Jar",
    badge: "Vedic Bilona",
    farmOrigin: "Garuda Goshala, Chevella",
    stock: true,
    featured: true,
    organicCert: "Traditional Vedic Bilona Method",
    tags: ["A2 Gir Cow", "Granular Texture", "Firewood Simmered"],
    nutritionHighlights: ["Butyric Acid for Gut", "Fat Soluble Vitamins A, D, E, K", "Vedic Healing"]
  },
  {
    id: 32,
    name: "Butter",
    category: "Dairy",
    description: "Traditional white desi makkhan churned from cultured fresh cream. Lightly salted or unsalted, aromatic and fluffy.",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
    price: 180,
    originalPrice: 210,
    rating: 4.9,
    reviews: 195,
    availableWeights: ["250g Block", "500g Block"],
    defaultWeight: "250g Block",
    badge: "Hand Churned",
    farmOrigin: "Garuda Goshala, Chevella",
    stock: true,
    tags: ["White Makkhan", "Cultured Cream", "Paratha Best Friend"],
    nutritionHighlights: ["Unrefined Natural Fat", "Rich In Phospholipids", "No Yellow Dye"]
  },
  {
    id: 33,
    name: "Buttermilk",
    category: "Dairy",
    description: "Refreshing spiced chaas / mattha brewed with hand-churned whey, roasted cumin, ginger, curry leaves, and pink rock salt.",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
    price: 45,
    originalPrice: 55,
    rating: 4.8,
    reviews: 210,
    availableWeights: ["500ml Bottle", "1 Litre Bottle"],
    defaultWeight: "500ml Bottle",
    badge: "Digestive Elixir",
    farmOrigin: "Garuda Goshala, Chevella",
    stock: true,
    tags: ["Spiced Chaas", "Summer Cooler", "Electrolyte Rich"],
    nutritionHighlights: ["Live Probiotics", "Zero Added Fat", "Instant Digestion Support"]
  },
  // ================= 7. VEGETABLES (5) =================
  {
    id: 34,
    name: "Tomatoes",
    category: "Vegetables",
    description: "Plump, aromatic vine-ripened country tomatoes bursting with juicy tangy sweetness. Hand-picked at daybreak without chemical sprays.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    price: 40,
    originalPrice: 50,
    rating: 4.8,
    reviews: 285,
    availableWeights: ["1kg", "2kg"],
    defaultWeight: "1kg",
    badge: "Vine Ripened",
    farmOrigin: "Garuda Organic Fields, Medak",
    stock: true,
    organicCert: "100% Pesticide-Free Certified",
    tags: ["Naturally Ripened", "Rich Lycopene", "Juicy Nati"],
    nutritionHighlights: ["High Lycopene", "Vitamin C & Potassium", "Folate Rich"]
  },
  {
    id: 35,
    name: "Potatoes",
    category: "Vegetables",
    description: "Farm-fresh earthen potatoes grown in nutrient-dense red loam soil. Golden skinned, non-sprouted, and firm.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    price: 35,
    originalPrice: 45,
    rating: 4.7,
    reviews: 190,
    availableWeights: ["1kg", "2kg"],
    defaultWeight: "1kg",
    badge: "Soil Fresh",
    farmOrigin: "Garuda Organic Fields, Medak",
    stock: true,
    tags: ["Unpolished", "Firm Texture", "Versatile Cooking"],
    nutritionHighlights: ["Complex Carbohydrates", "Potassium & Vitamin B6", "Dietary Fiber"]
  },
  {
    id: 36,
    name: "Onions",
    category: "Vegetables",
    description: "Crisp, pungent red onions cured naturally in breezy sun sheds. Thin-skinned and brimming with sharp, savory flavor.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
    price: 45,
    originalPrice: 55,
    rating: 4.8,
    reviews: 230,
    availableWeights: ["1kg", "2kg"],
    defaultWeight: "1kg",
    badge: "Sun Cured",
    farmOrigin: "Garuda Organic Fields, Medak",
    stock: true,
    tags: ["Sharp Flavor", "Long Shelf Life", "Maharashtra Desi"],
    nutritionHighlights: ["Quercetin Antioxidants", "Sulfur Nutrients", "Heart Health"]
  },
  {
    id: 37,
    name: "Green Chillies",
    category: "Vegetables",
    description: "Fiery, fresh-plucked green chillies bursting with invigorating capsaicin and clean, crisp heat for authentic tadkas.",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
    price: 30,
    originalPrice: 40,
    rating: 4.9,
    reviews: 175,
    availableWeights: ["250g", "500g"],
    defaultWeight: "250g",
    badge: "Crisp & Spicy",
    farmOrigin: "Garuda Spice Fields, Guntur Valley",
    stock: true,
    tags: ["Crisp Snap", "Spicy Kick", "Zero Pesticide"],
    nutritionHighlights: ["High Capsaicin", "Vitamin C Powerhouse", "Metabolism Enhancer"]
  },
  {
    id: 38,
    name: "Leafy Greens / Palak",
    category: "Vegetables",
    description: "Tender baby spinach and mixed heirloom leafy greens washed with bio-sanitized ozone water. Rich emerald leaves with zero sand grit.",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
    price: 35,
    originalPrice: 45,
    rating: 4.9,
    reviews: 310,
    availableWeights: ["250g Bunch", "500g (2 Bunches)"],
    defaultWeight: "250g Bunch",
    badge: "Harvested Today",
    farmOrigin: "Hydro-Organic Polyhouse #1, Chevella",
    stock: true,
    tags: ["Super Green", "Iron Rich", "Ozone Washed"],
    nutritionHighlights: ["Bioavailable Iron", "Folate & Vitamin K", "Eye Health Lutein"]
  },
  // ================= 8. FRUITS (4) =================
  {
    id: 39,
    name: "Mangoes",
    category: "Fruits",
    description: "Tree-ripened royal Banganapalli and Alphonso mangoes. Naturally straw-ripened with zero calcium carbide or artificial chemicals.",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
    price: 350,
    originalPrice: 420,
    rating: 5,
    reviews: 580,
    availableWeights: ["1kg Box", "3kg Family Crate"],
    defaultWeight: "1kg Box",
    badge: "King of Fruits",
    farmOrigin: "Garuda Heritage Orchards, Jagtial",
    stock: true,
    featured: true,
    organicCert: "Naturally Straw-Ripened Carbide-Free",
    tags: ["Carbide Free", "Intense Aroma", "Honey Sweet"],
    nutritionHighlights: ["Vitamin A & C", "Digestive Amylases", "Immunity Boost"]
  },
  {
    id: 40,
    name: "Bananas",
    category: "Fruits",
    description: "Naturally ripened sweet Yelakki & Robusta bananas nurtured on organic compost. Golden skin and rich aromatic creaminess.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    price: 65,
    originalPrice: 80,
    rating: 4.8,
    reviews: 240,
    availableWeights: ["1 Dozen (12 pcs)", "2 Dozen"],
    defaultWeight: "1 Dozen (12 pcs)",
    badge: "Naturally Sweet",
    farmOrigin: "Garuda Riverbank Grove, Krishna Basin",
    stock: true,
    tags: ["Yelakki Sweet", "Potassium Rich", "Quick Energy"],
    nutritionHighlights: ["High Potassium & Magnesium", "Prebiotic Fiber", "Natural Sustained Energy"]
  },
  {
    id: 41,
    name: "Papaya",
    category: "Fruits",
    description: "Red Lady honey-sweet farm papaya with vibrant salmon-red flesh, melt-in-mouth sweetness, and powerful digestive enzymes.",
    image: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80",
    price: 80,
    originalPrice: 100,
    rating: 4.7,
    reviews: 145,
    availableWeights: ["1 Whole Fruit (~1.2kg)", "2 Fruits"],
    defaultWeight: "1 Whole Fruit (~1.2kg)",
    badge: "Red Lady",
    farmOrigin: "Garuda Heritage Orchards, Jagtial",
    stock: true,
    tags: ["Papain Enzymes", "Glow Skin", "Sweet Red Flesh"],
    nutritionHighlights: ["Natural Papain Enzyme", "Lycopene & Beta-Carotene", "Gut Cleansing"]
  },
  {
    id: 42,
    name: "Guava",
    category: "Fruits",
    description: "Crisp pink flash Taiwan and Lucknow 49 guavas with an intoxicating perfume, crunchy seeds, and triple the vitamin C of oranges.",
    image: "https://images.unsplash.com/photo-1536511135899-738914ba1b9a?auto=format&fit=crop&w=800&q=80",
    price: 90,
    originalPrice: 110,
    rating: 4.8,
    reviews: 118,
    availableWeights: ["1kg Box"],
    defaultWeight: "1kg Box",
    badge: "Pink Flesh",
    farmOrigin: "Garuda Heritage Orchards, Jagtial",
    stock: true,
    tags: ["Pink Flesh", "Vitamin C Blast", "Crisp Bite"],
    nutritionHighlights: ["3x Vitamin C of Oranges", "High Dietary Fiber", "Low Glycemic Superfruit"]
  },
  // ================= 9. RICE (4) =================
  {
    id: 43,
    name: "Sona Masoori Rice",
    category: "Rice",
    description: "12-month naturally aged aromatic Sona Masoori raw rice. Lightweight, fluffy grain separation, easy on the stomach.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    price: 360,
    originalPrice: 420,
    rating: 4.9,
    reviews: 390,
    availableWeights: ["5kg Bag", "10kg Bag", "25kg Sack"],
    defaultWeight: "5kg Bag",
    badge: "Aged 12 Months",
    farmOrigin: "Tungabhadra Canal Basin, Kurnool",
    stock: true,
    featured: true,
    organicCert: "Naturally Grown Zero Synthetic Chemical",
    tags: ["Aged 1 Year", "Non-Sticky Fluffy", "Daily Staple"],
    nutritionHighlights: ["Light & Easy to Digest", "Low Starch Weight", "Zero Polishing Chemicals"]
  },
  {
    id: 44,
    name: "Basmati Rice",
    category: "Rice",
    description: "Extra-long grain 1121 Royal Basmati Rice aged to perfection for exquisite elongated pearls, royal aroma, and regal biryanis.",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80",
    price: 195,
    originalPrice: 230,
    rating: 4.9,
    reviews: 265,
    availableWeights: ["1kg Box", "5kg Bag"],
    defaultWeight: "1kg Box",
    badge: "Royal Grain",
    farmOrigin: "Garuda Himalayan Foothills Collective",
    stock: true,
    tags: ["Extra Long Grain", "Royal Aroma", "Biryani Master"],
    nutritionHighlights: ["Aged 2 Years", "Slender Elongation", "Naturally Fragrant"]
  },
  {
    id: 45,
    name: "Brown Rice",
    category: "Rice",
    description: "Unpolished whole grain brown rice with the nutrient-rich bran layer intact. Nutty, high fiber, and helps maintain balanced blood sugar.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    price: 140,
    originalPrice: 165,
    rating: 4.7,
    reviews: 140,
    availableWeights: ["1kg Pack", "5kg Bag"],
    defaultWeight: "1kg Pack",
    badge: "High Fiber",
    farmOrigin: "Tungabhadra Canal Basin, Kurnool",
    stock: true,
    tags: ["100% Unpolished", "Bran Intact", "Low GI Choice"],
    nutritionHighlights: ["High In Soluble Fiber", "Rich In Magnesium & Manganese", "Slow Sustained Release"]
  },
  {
    id: 46,
    name: "Rice Flour",
    category: "Rice",
    description: "Cold stone-ground fine rice flour made from single-origin aged rice. Silk-smooth texture for crispy dosas, modaks, and idiyappam.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    price: 80,
    originalPrice: 95,
    rating: 4.8,
    reviews: 110,
    availableWeights: ["1kg Pack", "2kg Pack"],
    defaultWeight: "1kg Pack",
    badge: "Stone Milled",
    farmOrigin: "Garuda Mills, Chevella",
    stock: true,
    tags: ["Gluten Free", "Ultra Fine", "Crispy Dosa Secret"],
    nutritionHighlights: ["Naturally Gluten Free", "Pure Grain Powder", "Zero Added Starch"]
  },
  // ================= 10. GRAINS (4) =================
  {
    id: 47,
    name: "Wheat",
    category: "Grains",
    description: "Golden Sharbati whole wheat grains harvested from rainwater-fed black soil. Produces the softest, puffiest rotis with rich natural sweetness.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    price: 240,
    originalPrice: 280,
    rating: 4.9,
    reviews: 320,
    availableWeights: ["5kg Bag", "10kg Bag"],
    defaultWeight: "5kg Bag",
    badge: "Sharbati Gold",
    farmOrigin: "Garuda Grain Farm, Sehore Belt",
    stock: true,
    featured: true,
    organicCert: "100% Whole Wheat Unadulterated",
    tags: ["Sharbati Premium", "Softest Rotis", "Heavy Grain"],
    nutritionHighlights: ["Whole Endosperm & Germ", "High Dietary Fiber", "Essential Vitamin E"]
  },
  {
    id: 48,
    name: "Maize / Corn",
    category: "Grains",
    description: "Sun-dried golden whole grain corn kernels. Sweet, nutrient-rich, ideal for homemade makki ki roti, fresh pop corn, and livestock feeds.",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
    price: 90,
    originalPrice: 110,
    rating: 4.7,
    reviews: 88,
    availableWeights: ["1kg Pack", "2kg Pack"],
    defaultWeight: "1kg Pack",
    badge: "Sun Harvest",
    farmOrigin: "Garuda Dryland Agrotech, Mahabubnagar",
    stock: true,
    tags: ["Golden Kernel", "Non GMO", "Makki Atta Ready"],
    nutritionHighlights: ["Rich in Zeaxanthin & Lutein", "Complex Carbs", "Eye Protection"]
  },
  {
    id: 49,
    name: "Ragi",
    category: "Grains",
    description: "Nutrient-packed finger millet whole grains. The ancient super-grain with 30x the calcium of rice, perfect for ragi mudde, idli, and porridge.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    price: 85,
    originalPrice: 100,
    rating: 5,
    reviews: 290,
    availableWeights: ["1kg Pack", "2kg Pack"],
    defaultWeight: "1kg Pack",
    badge: "Ancient Supergrain",
    farmOrigin: "Garuda Dryland Agrotech, Mahabubnagar",
    stock: true,
    featured: true,
    tags: ["Calcium Powerhouse", "Diabetic Friendly", "Mothers Choice"],
    nutritionHighlights: ["344mg Calcium per 100g", "High Bioavailable Iron", "Low Glycemic Response"]
  },
  {
    id: 50,
    name: "Jowar",
    category: "Grains",
    description: "High-fiber whole grain white sorghum. Ancient gluten-free drought-resilient grain that crafts wholesome, nutritious jowar rotis.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    price: 80,
    originalPrice: 95,
    rating: 4.8,
    reviews: 165,
    availableWeights: ["1kg Pack", "2kg Pack"],
    defaultWeight: "1kg Pack",
    badge: "Gluten Free",
    farmOrigin: "Garuda Dryland Agrotech, Mahabubnagar",
    stock: true,
    tags: ["Heart Friendly", "Gluten Free Grain", "Traditional Millet"],
    nutritionHighlights: ["Rich in Copper & Magnesium", "High In Tannin Antioxidants", "Aids Digestion"]
  }
];
var CATEGORIES = [
  { id: "all", name: "All", icon: "\u{1F33E}", count: 50 },
  { id: "eggs", name: "Eggs", icon: "\u{1F95A}", count: 5 },
  { id: "meat", name: "Meat", icon: "\u{1F969}", count: 5 },
  { id: "chicken", name: "Chicken", icon: "\u{1F357}", count: 8 },
  { id: "mushroom", name: "Mushroom", icon: "\u{1F344}", count: 4 },
  { id: "honey", name: "Honey", icon: "\u{1F36F}", count: 4 },
  { id: "dairy", name: "Dairy", icon: "\u{1F95B}", count: 7 },
  { id: "vegetables", name: "Vegetables", icon: "\u{1F96C}", count: 5 },
  { id: "fruits", name: "Fruits", icon: "\u{1F34E}", count: 4 },
  { id: "rice", name: "Rice", icon: "\u{1F35A}", count: 4 },
  { id: "grains", name: "Grains", icon: "\u{1F33E}", count: 4 }
];

// server/db/seed.ts
function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
}
async function seedDatabase(client) {
  const categoryRecords = CATEGORIES.filter((c) => c.name !== "All").map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    description: `Finest single-origin ${cat.name.toLowerCase()} harvested sustainably from Garuda Farms sanctuaries.`,
    display_order: idx + 1,
    is_active: true
  }));
  const { error: catError } = await client.from("categories").upsert(categoryRecords, { onConflict: "id" });
  if (catError) {
    throw new Error(`Failed to seed categories: ${catError.message}`);
  }
  const productRecords = PRODUCTS.map((p) => {
    return {
      id: p.id,
      slug: `${slugify(p.name)}-${p.id}`,
      name: p.name,
      category: p.category,
      short_description: p.description.slice(0, 120) + "...",
      description: p.description,
      image: p.image,
      fallback_image: p.fallbackImage || null,
      images: [p.image],
      price: p.price,
      original_price: p.originalPrice,
      discount_percent: Math.round((p.originalPrice - p.price) / p.originalPrice * 100) || 0,
      unit: p.defaultWeight,
      sku: `GF-${p.category.substring(0, 3).toUpperCase()}-${String(p.id).padStart(3, "0")}`,
      stock_quantity: p.stock ? 75 : 0,
      is_in_stock: p.stock,
      low_stock_threshold: 15,
      rating: p.rating,
      reviews_count: p.reviews,
      available_weights: p.availableWeights,
      default_weight: p.defaultWeight,
      badge: p.badge || null,
      farm_origin: p.farmOrigin,
      is_featured: Boolean(p.featured),
      is_bestseller: p.badge?.toLowerCase().includes("bestseller") || false,
      is_new: p.badge?.toLowerCase().includes("new") || false,
      is_active: true,
      organic_cert: p.organicCert || "Certified Natural & Sustainable",
      tags: p.tags,
      nutrition_highlights: p.nutritionHighlights || [],
      seo_title: `${p.name} | 100% Pure & Single-Origin | Garuda Farms`,
      seo_description: p.description
    };
  });
  const { error: prodError } = await client.from("products").upsert(productRecords, { onConflict: "id" });
  if (prodError) {
    throw new Error(`Failed to seed products: ${prodError.message}`);
  }
  let adminCreated = false;
  const defaultSettings = [
    {
      key: "general",
      value: {
        store_name: "Garuda Farms",
        tagline: "Pure by Nature \u2022 Ethical by Choice \u2022 Grown with Care",
        support_email: "support@garudafarms.com",
        support_phone: "+91 98669 29427",
        currency: "INR",
        currency_symbol: "\u20B9"
      }
    },
    {
      key: "delivery",
      value: {
        base_delivery_charge: 40,
        free_delivery_threshold: 500,
        supported_pincodes: ["500032", "500081", "500033", "500084", "500019", "500008"],
        estimated_delivery_hours: "Same-day morning (6:00 AM - 9:00 AM)"
      }
    },
    {
      key: "tax",
      value: {
        gst_enabled: true,
        default_gst_percent: 5,
        tax_inclusive: true
      }
    },
    {
      key: "razorpay",
      value: {
        enabled: false,
        key_id: process.env.RAZORPAY_KEY_ID || ""
      }
    }
  ];
  await client.from("store_settings").upsert(defaultSettings, { onConflict: "key" });
  return {
    categoriesSeeded: categoryRecords.length,
    productsSeeded: productRecords.length,
    adminCreated,
    settingsInitialized: true,
    message: `Successfully migrated ${productRecords.length} products and ${categoryRecords.length} categories into Supabase PostgreSQL.`
  };
}

// server/routes/auth.ts
import { Router } from "express";

// server/middleware/auth.ts
var ADMIN_ALLOWLIST = [
  "garudafarms9427@gmail.com",
  "raminisaisanthosh@gmail.com"
];
async function requireUser(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "");
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ ok: false, error: "Missing Authorization header" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ ok: false, error: "Missing access token" });
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: "Supabase not configured on server" });
      return;
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ ok: false, error: "Invalid or expired access token" });
      return;
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error("[Auth] requireUser error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
async function requireAdmin(req, res, next) {
  try {
    await requireUser(req, res, async () => {
      try {
        const user = req.user;
        if (!user || !user.email) {
          res.status(403).json({ ok: false, error: "Forbidden. Admin access required." });
          return;
        }
        const userEmail = user.email.toLowerCase().trim();
        const isAllowlisted = ADMIN_ALLOWLIST.some(
          (adminEmail) => adminEmail.toLowerCase().trim() === userEmail
        );
        if (isAllowlisted) {
          req.admin = true;
          next();
          return;
        }
        const supabase = getSupabase();
        if (supabase) {
          const { data: adminRow } = await supabase.from("admin_users").select("id, email, is_active").ilike("email", userEmail).eq("is_active", true).limit(1).maybeSingle();
          if (adminRow) {
            req.admin = true;
            next();
            return;
          }
        }
        console.warn(`[Admin Auth] DENIED access attempt from: ${userEmail}`);
        res.status(403).json({ ok: false, error: "Forbidden. You are not authorized to access admin resources." });
      } catch (err) {
        console.error("[Auth] requireAdmin inner error:", err);
        res.status(500).json({ ok: false, error: "Internal server error" });
      }
    });
  } catch (err) {
    console.error("[Auth] requireAdmin error:", err);
  }
}

// server/routes/auth.ts
var router = Router();
router.get("/me", requireUser, async (req, res) => {
  try {
    const supabase = getSupabase();
    const user = req.user;
    let profile = null;
    if (supabase && user?.id) {
      const { data } = await supabase.from("customers").select("*").eq("id", user.id).maybeSingle();
      profile = data || null;
    }
    res.json({ ok: true, user, profile });
  } catch (err) {
    console.error("/api/auth/me error:", err);
    res.status(500).json({ ok: false, error: "Failed to retrieve authenticated user." });
  }
});
router.get("/status", async (req, res) => {
  const client = getSupabase();
  if (!client) {
    res.json({
      ok: true,
      databaseConfigured: false,
      singleAdminInitialized: true,
      note: "Operating with default local admin until Supabase credentials are provided in .env"
    });
    return;
  }
  const { count, error } = await client.from("admin_users").select("*", { count: "exact", head: true });
  res.json({
    ok: true,
    databaseConfigured: true,
    singleAdminInitialized: (count ?? 0) > 0,
    adminCount: count ?? 0
  });
});
var auth_default = router;

// server/routes/products.ts
import { Router as Router3 } from "express";

// server/routes/admin.ts
import { Router as Router2 } from "express";

// server/utils/distance.ts
var DEFAULT_RATE_PER_KM = 10;
var DEFAULT_FREE_SHIPPING_THRESHOLD = 1e3;
var PINCODE_DISTANCE_MAP = {
  "501503": { name: "Mudimyala / Chevella Sanctuary", distanceKm: 4 },
  "501504": { name: "Chevella Town / Aloor", distanceKm: 6 },
  "501501": { name: "Chevella Rural / Shankarpally Road", distanceKm: 12 },
  "501505": { name: "Vikarabad Road / Pargi", distanceKm: 35 },
  "501506": { name: "Nawabpet / Chevella East", distanceKm: 16 },
  "501508": { name: "Shabad / Shahbad", distanceKm: 18 },
  "501509": { name: "Aloor / Chevella South", distanceKm: 10 },
  "501510": { name: "Shankarpally / Janwada", distanceKm: 14 },
  "501512": { name: "Kandada / Chevella North", distanceKm: 15 },
  "501513": { name: "Damagundam / Forest Sanctuary", distanceKm: 8 },
  "501203": { name: "Vikarabad / Ananthagiri Hills", distanceKm: 32 },
  "501218": { name: "Tellapur / Kollur", distanceKm: 22 },
  "501359": { name: "Mokila / Tangatur", distanceKm: 18 },
  "500005": { name: "Chandrayangutta / Barkas", distanceKm: 38 },
  "500019": { name: "Erragadda / Sanathnagar", distanceKm: 38 },
  "500030": { name: "Rajendranagar / Pillar 200 / SVVU", distanceKm: 26 },
  "500032": { name: "Gachibowli / Financial District", distanceKm: 26 },
  "500035": { name: "Saroornagar / Kothapet", distanceKm: 46 },
  "500046": { name: "Chandanagar / Serilingampally", distanceKm: 34 },
  "500048": { name: "Old Bowenpally / Military Dairy Farm", distanceKm: 42 },
  "500052": { name: "Bowenpally / Hasmathpet", distanceKm: 44 },
  "500058": { name: "Uppal Kalan / IDA Uppal", distanceKm: 48 },
  "500060": { name: "Dilsukhnagar / Malakpet", distanceKm: 44 },
  "500069": { name: "Musheerabad / Kavadiguda", distanceKm: 42 },
  "500070": { name: "Hayathnagar / Vanasthalipuram", distanceKm: 52 },
  "500074": { name: "LB Nagar / Nagole", distanceKm: 48 },
  "500075": { name: "Moinabad / Chilkur Balaji", distanceKm: 16 },
  "500077": { name: "Bandlaguda Jagir / Sun City", distanceKm: 24 },
  "500079": { name: "Karmanghat / Champapet", distanceKm: 46 },
  "500084": { name: "Kondapur / Botanical Garden", distanceKm: 32 },
  "500086": { name: "Hafeezpet / Madinaguda", distanceKm: 35 },
  "500089": { name: "Manikonda / Puppalguda / Narsingi", distanceKm: 24 },
  "500090": { name: "Nizampet / Bachupally", distanceKm: 42 },
  "500091": { name: "Kismatpur / Peeramcheru", distanceKm: 22 },
  "500092": { name: "Bowrampet / Gandimaisamma", distanceKm: 48 },
  "500097": { name: "Attapur / Hyderguda", distanceKm: 28 },
  "500098": { name: "Hydershakote / Manchirevula", distanceKm: 22 },
  "500100": { name: "Miyapur / Hafeezpet West", distanceKm: 36 },
  "500102": { name: "Nallagandla / Tellapur Extension", distanceKm: 25 },
  "500104": { name: "Kokapet / Neopolis", distanceKm: 22 },
  "500107": { name: "Narsingi / Ocean Park", distanceKm: 24 },
  "500108": { name: "Financial District Phase 2 / Nanakramguda", distanceKm: 25 },
  "500111": { name: "Puppalguda Golden Mile", distanceKm: 24 },
  "500112": { name: "Kollur ORR Junction", distanceKm: 20 },
  "500113": { name: "Velimela / Pati", distanceKm: 20 }
};
async function getDeliverySettingsFromDb() {
  const supabase = getSupabase();
  let ratePerKm = DEFAULT_RATE_PER_KM;
  let freeThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD;
  let originAddress = "Garuda Sanctuary, Mudimyala, Chevella (501503)";
  if (!supabase) {
    return { ratePerKm, freeThreshold, originAddress };
  }
  try {
    const { data } = await supabase.from("store_settings").select("key, value").in("key", ["delivery_rate_per_km", "free_delivery_threshold", "delivery_origin_address"]);
    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.key === "delivery_rate_per_km") {
          const val = typeof row.value === "number" ? row.value : parseFloat(row.value);
          if (!isNaN(val) && val >= 0) ratePerKm = val;
        } else if (row.key === "free_delivery_threshold") {
          const val = typeof row.value === "number" ? row.value : parseFloat(row.value);
          if (!isNaN(val)) freeThreshold = val;
        } else if (row.key === "delivery_origin_address") {
          if (typeof row.value === "string") originAddress = row.value.replace(/^"|"$/g, "");
        }
      });
    }
  } catch (err) {
    console.warn("[Delivery Settings DB fetch warning]:", err);
  }
  return { ratePerKm, freeThreshold, originAddress };
}
async function calculateServerDeliveryFee(pincode, subtotal, couponCode) {
  const cleanPin = String(pincode || "").trim().replace(/\D/g, "");
  const supabase = getSupabase();
  const cleanCoupon = String(couponCode || "").trim().toUpperCase();
  if (!cleanPin || cleanPin.length !== 6) {
    return {
      ok: false,
      serviceable: false,
      pincode: cleanPin,
      locationName: "",
      distanceKm: 0,
      ratePerKm: DEFAULT_RATE_PER_KM,
      calculatedFee: 0,
      finalFee: 0,
      isFreeDelivery: false,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      amountNeededForFreeDelivery: DEFAULT_FREE_SHIPPING_THRESHOLD,
      error: "Please enter a valid 6-digit PIN code."
    };
  }
  const settings = await getDeliverySettingsFromDb();
  let distanceKm = 0;
  let locationName = "";
  let isServiceable = false;
  if (supabase) {
    try {
      const { data, error } = await supabase.from("serviceable_pincodes").select("*").eq("pincode", cleanPin).maybeSingle();
      if (!error && data) {
        if (data.is_enabled === false) {
          return {
            ok: false,
            serviceable: false,
            pincode: cleanPin,
            locationName: data.area_name || "Restricted Area",
            distanceKm: Number(data.distance_km) || 0,
            ratePerKm: settings.ratePerKm,
            calculatedFee: 0,
            finalFee: 0,
            isFreeDelivery: false,
            freeShippingThreshold: settings.freeThreshold,
            amountNeededForFreeDelivery: Math.max(0, settings.freeThreshold - subtotal),
            error: "Delivery is not available to this location."
          };
        }
        isServiceable = true;
        distanceKm = Number(data.distance_km);
        locationName = data.area_name;
      }
    } catch (dbErr) {
      console.warn("[Pincode DB lookup warning]:", dbErr);
    }
  }
  if (!isServiceable) {
    if (PINCODE_DISTANCE_MAP[cleanPin]) {
      isServiceable = true;
      distanceKm = PINCODE_DISTANCE_MAP[cleanPin].distanceKm;
      locationName = PINCODE_DISTANCE_MAP[cleanPin].name;
    } else {
      return {
        ok: false,
        serviceable: false,
        pincode: cleanPin,
        locationName: "",
        distanceKm: 0,
        ratePerKm: settings.ratePerKm,
        calculatedFee: 0,
        finalFee: 0,
        isFreeDelivery: false,
        freeShippingThreshold: settings.freeThreshold,
        amountNeededForFreeDelivery: Math.max(0, settings.freeThreshold - subtotal),
        error: "Delivery is not available to this location."
      };
    }
  }
  const ratePerKm = settings.ratePerKm;
  const calculatedFee = Math.round(distanceKm * ratePerKm);
  const isFreeDelivery = cleanCoupon === "GARUDAFREE" && subtotal >= 500;
  const finalFee = isFreeDelivery || subtotal === 0 ? 0 : calculatedFee;
  const amountNeededForFreeDelivery = cleanCoupon === "GARUDAFREE" ? Math.max(0, 500 - subtotal) : 0;
  return {
    ok: true,
    serviceable: true,
    pincode: cleanPin,
    locationName,
    distanceKm,
    ratePerKm,
    calculatedFee,
    finalFee,
    isFreeDelivery,
    freeShippingThreshold: 500,
    amountNeededForFreeDelivery
  };
}

// server/routes/admin.ts
import multer from "multer";
var router2 = Router2();
var upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
async function auditLog(adminEmail, action, entityType, entityId, details) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("audit_logs").insert({
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      details
    });
  } catch (e) {
    console.warn("[Audit] Failed to write audit log:", e);
  }
}
router2.get("/stats", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    const [ordersRes, productsRes, categoriesRes, customersRes] = await Promise.all([
      supabase.from("orders").select("id, total_amount, payment_status, order_status, created_at"),
      supabase.from("products").select("id, is_active, is_in_stock, is_featured"),
      supabase.from("categories").select("id, is_active"),
      supabase.from("profiles").select("id, created_at")
    ]);
    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const customers = customersRes.data || [];
    const todayOrders = orders.filter((o) => o.created_at >= todayISO);
    const paidOrders = orders.filter((o) => o.payment_status === "Paid");
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0
    };
    orders.forEach((o) => {
      if (statusCounts[o.order_status] !== void 0) statusCounts[o.order_status]++;
    });
    res.json({
      ok: true,
      stats: {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue: paidOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
        todayRevenue: todayOrders.filter((o) => o.payment_status === "Paid").reduce((s, o) => s + Number(o.total_amount || 0), 0),
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.is_active && p.is_in_stock).length,
        unavailableProducts: products.filter((p) => !p.is_in_stock).length,
        featuredProducts: products.filter((p) => p.is_featured).length,
        totalCategories: categories.length,
        activeCategories: categories.filter((c) => c.is_active).length,
        totalCustomers: customers.length,
        ...statusCounts
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/analytics", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const days = Math.min(90, Math.max(7, Number(req.query.days || 30)));
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const [ordersRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from("orders").select("id, customer_email, total_amount, payment_status, payment_method, order_status, created_at, items"),
      supabase.from("products").select("id, name, category, price, is_in_stock, is_active"),
      supabase.from("categories").select("id, name")
    ]);
    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const trendMap = /* @__PURE__ */ new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      trendMap.set(dateStr, { date: dateStr, label, revenue: 0, orders: 0, paidOrders: 0 });
    }
    const paymentMethods = {
      COD: { count: 0, revenue: 0 },
      Razorpay: { count: 0, revenue: 0 },
      Online: { count: 0, revenue: 0 },
      Other: { count: 0, revenue: 0 }
    };
    const categoryMap = /* @__PURE__ */ new Map();
    categories.forEach((c) => categoryMap.set(c.name, { category: c.name, revenue: 0, count: 0 }));
    const productSalesMap = /* @__PURE__ */ new Map();
    const customerOrderCounts = /* @__PURE__ */ new Map();
    let totalPaidRevenue = 0;
    let paidOrdersCount = 0;
    orders.forEach((o) => {
      const dateStr = new Date(o.created_at).toISOString().split("T")[0];
      const isPaid = o.payment_status === "Paid";
      const amount = Number(o.total_amount || 0);
      if (o.customer_email) {
        customerOrderCounts.set(o.customer_email, (customerOrderCounts.get(o.customer_email) || 0) + 1);
      }
      if (trendMap.has(dateStr)) {
        const item = trendMap.get(dateStr);
        item.orders += 1;
        if (isPaid) {
          item.revenue += amount;
          item.paidOrders += 1;
        }
      }
      if (isPaid) {
        totalPaidRevenue += amount;
        paidOrdersCount += 1;
      }
      const methodKey = o.payment_method?.toUpperCase().includes("COD") ? "COD" : o.payment_method?.toUpperCase().includes("RAZORPAY") ? "Razorpay" : o.payment_method ? "Online" : "Other";
      paymentMethods[methodKey].count += 1;
      if (isPaid) paymentMethods[methodKey].revenue += amount;
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const prodName = it.product_name || it.name || "Unknown Product";
          const qty = Number(it.quantity || 1);
          const price = Number(it.total_price || it.unit_price * qty || 0);
          const prod = products.find((p) => p.name?.toLowerCase() === prodName.toLowerCase());
          const catName = prod?.category || "General";
          if (!categoryMap.has(catName)) {
            categoryMap.set(catName, { category: catName, revenue: 0, count: 0 });
          }
          const catObj = categoryMap.get(catName);
          catObj.count += qty;
          if (isPaid) catObj.revenue += price;
          if (!productSalesMap.has(prodName)) {
            productSalesMap.set(prodName, { name: prodName, category: catName, count: 0, revenue: 0 });
          }
          const prodObj = productSalesMap.get(prodName);
          prodObj.count += qty;
          if (isPaid) prodObj.revenue += price;
        });
      }
    });
    const dailyTrends = Array.from(trendMap.values());
    const categoryBreakdown = Array.from(categoryMap.values()).filter((c) => c.count > 0 || c.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const totalCustomers = customerOrderCounts.size;
    const repeatCustomers = Array.from(customerOrderCounts.values()).filter((cnt) => cnt > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round(repeatCustomers / totalCustomers * 100) : 0;
    const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalPaidRevenue / paidOrdersCount) : 0;
    const deliveredOrders = orders.filter((o) => o.order_status === "Delivered").length;
    const fulfillmentRate = orders.length > 0 ? Math.round(deliveredOrders / orders.length * 100) : 0;
    res.json({
      ok: true,
      analytics: {
        dailyTrends,
        categoryBreakdown,
        topProducts,
        paymentMethods,
        kpis: {
          totalPaidRevenue,
          paidOrdersCount,
          averageOrderValue,
          repeatRate,
          fulfillmentRate,
          deliveredOrders,
          totalCustomers
        }
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/customers", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { search, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(100, Number(limit));
    const from = (pageNum - 1) * pageSize;
    let profileQuery = supabase.from("profiles").select("id, full_name, email, phone, created_at").order("created_at", { ascending: false }).range(from, from + pageSize - 1);
    if (search) {
      profileQuery = profileQuery.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }
    const { data: profiles, error } = await profileQuery;
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    const profileIds = (profiles || []).map((p) => p.id);
    const { data: orders } = profileIds.length > 0 ? await supabase.from("orders").select("auth_id, customer_id, total_amount, payment_status").or(profileIds.map((id) => `auth_id.eq.${id},customer_id.eq.${id}`).join(",")) : { data: [] };
    const ordersByCustomer = {};
    (orders || []).forEach((o) => {
      const cid = String(o.auth_id || o.customer_id || "");
      if (!ordersByCustomer[cid]) ordersByCustomer[cid] = { count: 0, total: 0 };
      ordersByCustomer[cid].count++;
      if (o.payment_status === "Paid") {
        ordersByCustomer[cid].total += Number(o.total_amount || 0);
      }
    });
    const customers = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name,
      email: p.email,
      phone: p.phone || "-",
      registeredAt: p.created_at,
      orderCount: ordersByCustomer[p.id]?.count || 0,
      totalSpend: ordersByCustomer[p.id]?.total || 0
    }));
    res.json({ ok: true, customers });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/coupons", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    res.json({ ok: true, coupons: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.post("/coupons", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const {
      code,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount,
      usage_limit,
      expires_at,
      is_active,
      first_order_only,
      applicable_category,
      applicable_product_id,
      per_customer_limit
    } = req.body;
    if (!code || !discount_type || discount_value === void 0) {
      res.status(400).json({ ok: false, error: "code, discount_type, and discount_value are required." });
      return;
    }
    const { data, error } = await supabase.from("coupons").insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value: Number(discount_value),
      minimum_order_amount: Number(minimum_order_amount || 0),
      maximum_discount_amount: maximum_discount_amount ? Number(maximum_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      expires_at: expires_at || null,
      is_active: is_active !== false,
      first_order_only: Boolean(first_order_only),
      applicable_category: applicable_category || "All",
      applicable_product_id: applicable_product_id ? Number(applicable_product_id) : null,
      per_customer_limit: Number(per_customer_limit || 1)
    }).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.create", "coupon", data.id, { code: data.code });
    res.status(201).json({ ok: true, coupon: data, message: "Coupon created successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/coupons/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { id } = req.params;
    const updates = {};
    const allowedFields = [
      "code",
      "discount_type",
      "discount_value",
      "minimum_order_amount",
      "maximum_discount_amount",
      "usage_limit",
      "expires_at",
      "is_active",
      "first_order_only",
      "applicable_category",
      "applicable_product_id",
      "per_customer_limit"
    ];
    allowedFields.forEach((f) => {
      if (req.body[f] !== void 0) updates[f] = req.body[f];
    });
    if (updates.code) updates.code = updates.code.toUpperCase().trim();
    const { data, error } = await supabase.from("coupons").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.update", "coupon", id, updates);
    res.json({ ok: true, coupon: data, message: "Coupon updated." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.delete("/coupons/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { id } = req.params;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.delete", "coupon", id, {});
    res.json({ ok: true, message: "Coupon deleted." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/products/:id/dynamic-offers", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const id = Number(req.params.id);
    const { is_todays_deal, deal_price, is_fresh_arrival, is_best_seller, is_special_offer } = req.body;
    const updates = {};
    if (is_todays_deal !== void 0) updates.is_todays_deal = Boolean(is_todays_deal);
    if (deal_price !== void 0) updates.deal_price = deal_price ? Number(deal_price) : null;
    if (is_fresh_arrival !== void 0) updates.is_fresh_arrival = Boolean(is_fresh_arrival);
    if (is_best_seller !== void 0) updates.is_best_seller = Boolean(is_best_seller);
    if (is_special_offer !== void 0) updates.is_special_offer = Boolean(is_special_offer);
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "product.dynamic_offers", "product", String(id), updates);
    res.json({ ok: true, product: data, message: "Dynamic offers updated for product." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/reviews", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const statusFilter = req.query.status ? String(req.query.status) : "All";
    let query = supabase.from("product_reviews").select("*, products(name)").order("created_at", { ascending: false });
    if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }
    const { data, error } = await query;
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    res.json({ ok: true, reviews: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/reviews/:id/status", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      res.status(400).json({ ok: false, error: "Status must be pending, approved, or rejected." });
      return;
    }
    const { data, error } = await supabase.from("product_reviews").update({ status }).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "review.moderate", "review", id, { status });
    res.json({ ok: true, review: data, message: `Review status set to ${status}.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.delete("/reviews/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { id } = req.params;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "review.delete", "review", id, {});
    res.json({ ok: true, message: "Review deleted by admin." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/store-settings", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { data, error } = await supabase.from("store_settings").select("key, value");
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    const settings = {};
    (data || []).forEach((row) => {
      settings[row.key] = row.value;
    });
    res.json({ ok: true, settings });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/store-settings", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const updates = req.body;
    if (!updates || typeof updates !== "object") {
      res.status(400).json({ ok: false, error: "Request body must be an object of key/value pairs." });
      return;
    }
    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? JSON.parse(JSON.stringify(value)) : value,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    const { error } = await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "store_settings.update", "store_settings", null, { keys: Object.keys(updates) });
    res.json({ ok: true, message: "Store settings updated successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.post("/upload-image", requireAdmin, upload.single("image"), async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    if (!req.file) {
      res.status(400).json({ ok: false, error: "No image file provided." });
      return;
    }
    const file = req.file;
    const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bucketName = "product-images";
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
    if (error) {
      res.status(400).json({ ok: false, error: `Storage upload failed: ${error.message}. Make sure the 'product-images' bucket exists in Supabase Storage.` });
      return;
    }
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    await auditLog(req.user.email, "image.upload", "storage", fileName, { url: publicUrl });
    res.json({ ok: true, url: publicUrl, message: "Image uploaded successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/audit-logs", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    res.json({ ok: true, logs: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.delete("/products/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const id = Number(req.params.id);
    const { data, error } = await supabase.from("products").update({ is_active: false, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select("name").single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "product.archive", "product", String(id), { name: data?.name });
    res.json({ ok: true, message: `Product archived (hidden from storefront). Historical orders preserved.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/me", requireAdmin, async (req, res) => {
  const user = req.user;
  res.json({
    ok: true,
    admin: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.fullName || user.user_metadata?.full_name || "Garuda Admin",
      role: "admin"
    }
  });
});
router2.get("/delivery/settings", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { data, error } = await supabase.from("store_settings").select("key, value").in("key", ["delivery_rate_per_km", "free_delivery_threshold", "delivery_origin_address", "delivery_origin_pincode"]);
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    const settings = {
      ratePerKm: 10,
      freeThreshold: 1e3,
      originAddress: "Garuda Sanctuary, Mudimyala, Chevella (501503)",
      originPincode: "501503"
    };
    if (data && Array.isArray(data)) {
      data.forEach((row) => {
        if (row.key === "delivery_rate_per_km") {
          const val = typeof row.value === "number" ? row.value : parseFloat(row.value);
          if (!isNaN(val)) settings.ratePerKm = val;
        } else if (row.key === "free_delivery_threshold") {
          const val = typeof row.value === "number" ? row.value : parseFloat(row.value);
          if (!isNaN(val)) settings.freeThreshold = val;
        } else if (row.key === "delivery_origin_address") {
          settings.originAddress = typeof row.value === "string" ? row.value.replace(/^"|"$/g, "") : row.value;
        } else if (row.key === "delivery_origin_pincode") {
          settings.originPincode = typeof row.value === "string" ? row.value.replace(/^"|"$/g, "") : row.value;
        }
      });
    }
    res.json({ ok: true, settings });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/delivery/settings", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { ratePerKm, freeThreshold, originAddress, originPincode } = req.body || {};
    const updates = [
      { key: "delivery_rate_per_km", value: JSON.stringify(Number(ratePerKm) || 10) },
      { key: "free_delivery_threshold", value: JSON.stringify(Number(freeThreshold) || 0) },
      { key: "delivery_origin_address", value: JSON.stringify(String(originAddress || "Garuda Sanctuary, Mudimyala, Chevella (501503)")) },
      { key: "delivery_origin_pincode", value: JSON.stringify(String(originPincode || "501503")) }
    ];
    for (const item of updates) {
      await supabase.from("store_settings").upsert({ key: item.key, value: item.value, updated_at: (/* @__PURE__ */ new Date()).toISOString() }, { onConflict: "key" });
    }
    await auditLog(req.user.email, "delivery.update_settings", "settings", "delivery", { ratePerKm, freeThreshold, originAddress, originPincode });
    res.json({ ok: true, message: "Delivery settings updated successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/delivery/pincodes", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("serviceable_pincodes").select("*").order("pincode", { ascending: true });
      if (!error && data && data.length > 0) {
        res.json({ ok: true, pincodes: data });
        return;
      }
    } catch (err) {
      console.warn("[Admin Delivery Pincodes DB warning]:", err);
    }
  }
  const fallbackList = Object.entries(PINCODE_DISTANCE_MAP).map(([pin, info], index) => ({
    id: `pin-${pin}`,
    pincode: pin,
    area_name: info.name,
    distance_km: info.distanceKm,
    is_enabled: true
  }));
  res.json({ ok: true, pincodes: fallbackList, isFallback: true });
});
router2.post("/delivery/pincodes", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const { pincode, area_name, distance_km, is_enabled = true } = req.body || {};
    const cleanPin = String(pincode || "").trim().replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      res.status(400).json({ ok: false, error: "Valid 6-digit PIN code is required." });
      return;
    }
    if (!area_name) {
      res.status(400).json({ ok: false, error: "Area name is required." });
      return;
    }
    const dist = Math.max(0.1, Number(distance_km) || 1);
    const { data, error } = await supabase.from("serviceable_pincodes").upsert({
      pincode: cleanPin,
      area_name: String(area_name).trim(),
      distance_km: dist,
      is_enabled: Boolean(is_enabled),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "pincode" }).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "delivery.add_pincode", "pincode", cleanPin, { area_name, distance_km: dist, is_enabled });
    res.json({ ok: true, pincode: data, message: `PIN code ${cleanPin} saved successfully.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/delivery/pincodes/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const id = req.params.id;
    const { pincode, area_name, distance_km, is_enabled } = req.body || {};
    const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (pincode) updatePayload.pincode = String(pincode).trim().replace(/\D/g, "");
    if (area_name !== void 0) updatePayload.area_name = String(area_name).trim();
    if (distance_km !== void 0) updatePayload.distance_km = Math.max(0.1, Number(distance_km));
    if (is_enabled !== void 0) updatePayload.is_enabled = Boolean(is_enabled);
    const { data, error } = await supabase.from("serviceable_pincodes").update(updatePayload).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "delivery.update_pincode", "pincode", String(id), updatePayload);
    res.json({ ok: true, pincode: data, message: "PIN code updated successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.delete("/delivery/pincodes/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase not configured" });
    return;
  }
  try {
    const id = req.params.id;
    const { data: existing } = await supabase.from("serviceable_pincodes").select("pincode, area_name").eq("id", id).single();
    const { error } = await supabase.from("serviceable_pincodes").delete().eq("id", id);
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "delivery.delete_pincode", "pincode", String(id), { pincode: existing?.pincode });
    res.json({ ok: true, message: `PIN code ${existing?.pincode || id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.get("/coupons", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase database not connected" });
    return;
  }
  try {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    res.json({ ok: true, coupons: data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.post("/coupons", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase database not connected" });
    return;
  }
  try {
    const body = req.body || {};
    if (!body.code || !body.discount_value) {
      res.status(400).json({ ok: false, error: "Coupon code and discount value are required." });
      return;
    }
    const cleanCode = String(body.code).trim().toUpperCase();
    const payload = {
      code: cleanCode,
      discount_type: body.discount_type || "percentage",
      discount_value: Number(body.discount_value),
      minimum_order_amount: Number(body.minimum_order_amount || 0),
      maximum_discount_amount: body.maximum_discount_amount ? Number(body.maximum_discount_amount) : null,
      usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
      expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
      is_active: body.is_active !== void 0 ? Boolean(body.is_active) : true,
      description: body.description || null,
      first_order_only: Boolean(body.first_order_only),
      applicable_category: body.applicable_category || null,
      applicable_product_id: body.applicable_product_id ? Number(body.applicable_product_id) : null
    };
    const { data, error } = await supabase.from("coupons").insert(payload).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.create", "coupon", String(data.id), { code: cleanCode });
    res.json({ ok: true, coupon: data, message: `Coupon "${cleanCode}" created successfully.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.put("/coupons/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase database not connected" });
    return;
  }
  try {
    const id = req.params.id;
    const body = req.body || {};
    const updatePayload = {};
    if (body.code !== void 0) updatePayload.code = String(body.code).trim().toUpperCase();
    if (body.discount_type !== void 0) updatePayload.discount_type = body.discount_type;
    if (body.discount_value !== void 0) updatePayload.discount_value = Number(body.discount_value);
    if (body.minimum_order_amount !== void 0) updatePayload.minimum_order_amount = Number(body.minimum_order_amount);
    if (body.maximum_discount_amount !== void 0) updatePayload.maximum_discount_amount = body.maximum_discount_amount ? Number(body.maximum_discount_amount) : null;
    if (body.usage_limit !== void 0) updatePayload.usage_limit = body.usage_limit ? Number(body.usage_limit) : null;
    if (body.expires_at !== void 0) updatePayload.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null;
    if (body.is_active !== void 0) updatePayload.is_active = Boolean(body.is_active);
    if (body.description !== void 0) updatePayload.description = body.description || null;
    if (body.first_order_only !== void 0) updatePayload.first_order_only = Boolean(body.first_order_only);
    if (body.applicable_category !== void 0) updatePayload.applicable_category = body.applicable_category || null;
    if (body.applicable_product_id !== void 0) updatePayload.applicable_product_id = body.applicable_product_id ? Number(body.applicable_product_id) : null;
    const { data, error } = await supabase.from("coupons").update(updatePayload).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.update", "coupon", String(id), updatePayload);
    res.json({ ok: true, coupon: data, message: "Coupon updated successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.delete("/coupons/:id", requireAdmin, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase database not connected" });
    return;
  }
  try {
    const id = req.params.id;
    const { data: existing } = await supabase.from("coupons").select("code").eq("id", id).single();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "coupon.delete", "coupon", String(id), { code: existing?.code });
    res.json({ ok: true, message: `Coupon "${existing?.code || id}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router2.post("/test-google-sheets", requireAdmin, async (req, res) => {
  try {
    const { webhook_url } = req.body || {};
    let url = webhook_url || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!url) {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase.from("store_settings").select("value").eq("key", "google_sheets_webhook_url").maybeSingle();
        if (data && data.value) url = typeof data.value === "string" ? data.value.replace(/^"|"$/g, "") : data.value;
      }
    }
    if (!url || !url.startsWith("http")) {
      res.status(400).json({ ok: false, error: "No valid Google Sheets Webhook URL provided or configured." });
      return;
    }
    const testPayload = {
      order_id: "TEST-" + Math.floor(1e3 + Math.random() * 9e3),
      date: (/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      customer_name: "Garuda Test Connection",
      customer_email: "test@garudafarms.com",
      customer_phone: "+91 98765 43210",
      shipping_address: "Test Farm Address, Chevella - 501503",
      delivery_slot: "Morning 7am-10am",
      items: "Fresh Country Eggs (Pack of 12 \xD7 1)",
      subtotal: 150,
      delivery_charge: 30,
      discount_amount: 0,
      coupon_code: "TEST",
      total_amount: 180,
      payment_method: "Test Payment",
      payment_status: "Paid",
      order_status: "Confirmed"
    };
    const encodedData = encodeURIComponent(JSON.stringify(testPayload));
    const urlWithQuery = url.includes("?") ? `${url}&data=${encodedData}` : `${url}?data=${encodedData}`;
    const response = await fetch(urlWithQuery, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
      redirect: "follow"
    });
    if (response.ok || response.status === 302 || response.status === 200) {
      res.json({ ok: true, message: "Test row successfully sent to Google Sheets!" });
    } else {
      res.status(400).json({ ok: false, error: `Google returned HTTP status ${response.status}` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var admin_default = router2;

// server/routes/products.ts
var router3 = Router3();
var localProducts = [...PRODUCTS];
router3.get("/", async (req, res) => {
  try {
    const { category, search, featured, active_only, sort } = req.query;
    const client = getSupabase();
    if (client) {
      let query = client.from("products").select("*");
      if (category && category !== "All") {
        query = query.eq("category", String(category));
      }
      if (featured === "true") {
        query = query.eq("is_featured", true);
      }
      if (active_only !== "false") {
        query = query.eq("is_active", true);
      }
      if (search) {
        query = query.ilike("name", `%${String(search)}%`);
      }
      if (sort === "price-asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price-desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "rating") {
        query = query.order("rating", { ascending: false });
      } else {
        query = query.order("id", { ascending: true });
      }
      const { data, error } = await query;
      if (!error && data) {
        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          image: p.image,
          fallbackImage: p.fallback_image,
          price: Number(p.price),
          originalPrice: Number(p.original_price),
          rating: Number(p.rating),
          reviews: p.reviews_count,
          availableWeights: p.available_weights || ["Standard Pack"],
          defaultWeight: p.default_weight || "Standard Pack",
          badge: p.badge,
          farmOrigin: p.farm_origin,
          stock: p.is_in_stock !== false,
          stockQuantity: p.stock_quantity,
          featured: p.is_featured,
          organicCert: p.organic_cert,
          tags: p.tags || [],
          nutritionHighlights: p.nutrition_highlights || []
        }));
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.json({
          ok: true,
          count: formatted.length,
          source: "supabase",
          products: formatted
        });
        return;
      }
    }
    let list = [...localProducts];
    if (active_only !== "false") {
      list = list.filter((p) => p.stock !== false);
    }
    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (featured === "true") {
      list = list.filter((p) => p.featured);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    res.json({
      ok: true,
      count: list.length,
      source: "local_seeded",
      products: list
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const idParam = req.params.id;
    const client = getSupabase();
    if (client) {
      const isNumeric = !isNaN(Number(idParam));
      let query = client.from("products").select("*");
      if (isNumeric) {
        query = query.eq("id", Number(idParam));
      } else {
        query = query.eq("slug", idParam);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        res.json({
          ok: true,
          source: "supabase",
          product: {
            id: data.id,
            name: data.name,
            category: data.category,
            description: data.description,
            image: data.image,
            fallbackImage: data.fallback_image,
            price: Number(data.price),
            originalPrice: Number(data.original_price),
            rating: Number(data.rating),
            reviews: data.reviews_count,
            availableWeights: data.available_weights,
            defaultWeight: data.default_weight,
            badge: data.badge,
            farmOrigin: data.farm_origin,
            stock: data.is_in_stock !== false,
            stockQuantity: data.stock_quantity,
            featured: data.is_featured,
            organicCert: data.organic_cert,
            tags: data.tags || [],
            nutritionHighlights: data.nutrition_highlights || []
          }
        });
        return;
      }
    }
    const prod = localProducts.find((p) => String(p.id) === idParam);
    if (prod) {
      res.json({ ok: true, source: "local_seeded", product: prod });
    } else {
      res.status(404).json({ ok: false, error: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router3.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const client = getSupabase();
    if (!body.name || !body.category || !body.price) {
      res.status(400).json({ ok: false, error: "Name, category, and price are required." });
      return;
    }
    if (client) {
      const slug = `${slugify(body.name)}-${Date.now().toString().slice(-4)}`;
      const { data: maxRows } = await client.from("products").select("id").order("id", { ascending: false }).limit(1);
      const maxId = maxRows && maxRows.length > 0 ? Number(maxRows[0].id) : 0;
      const nextId = maxId + 1;
      const productPayload = {
        id: nextId,
        slug,
        name: body.name,
        category: body.category,
        short_description: body.short_description || body.description?.slice(0, 120),
        description: body.description || body.name,
        image: body.image || "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
        price: body.price,
        original_price: body.originalPrice || body.price,
        available_weights: body.availableWeights || ["1kg"],
        default_weight: body.defaultWeight || "1kg",
        farm_origin: body.farmOrigin || "Garuda Sanctuary, Chevella",
        is_in_stock: body.stock !== false,
        stock_quantity: body.stockQuantity || 50,
        is_featured: Boolean(body.featured),
        badge: body.badge || null,
        tags: body.tags || [],
        nutrition_highlights: body.nutritionHighlights || []
      };
      let { data, error } = await client.from("products").insert(productPayload).select().single();
      if (error && (error.code === "23505" || error.message.includes("products_pkey"))) {
        delete productPayload.id;
        const retry = await client.from("products").insert(productPayload).select().single();
        data = retry.data;
        error = retry.error;
      }
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      await auditLog(req.user.email, "product.create", "product", String(data.id), { name: data.name, price: data.price });
      res.status(201).json({ ok: true, product: data, message: "Product created successfully." });
      return;
    }
    const newId = Math.max(...localProducts.map((p) => p.id), 0) + 1;
    const newProduct = {
      id: newId,
      name: body.name,
      category: body.category,
      description: body.description || body.name,
      image: body.image || "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      rating: 5,
      reviews: 0,
      availableWeights: body.availableWeights || ["1kg"],
      defaultWeight: body.defaultWeight || "1kg",
      badge: body.badge,
      farmOrigin: body.farmOrigin || "Garuda Sanctuary",
      stock: body.stock !== false,
      featured: Boolean(body.featured),
      tags: body.tags || []
    };
    localProducts.unshift(newProduct);
    res.status(201).json({ ok: true, product: newProduct, message: "Product created in local store." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router3.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;
    const client = getSupabase();
    if (client) {
      const updates = {};
      if (body.name !== void 0) updates.name = body.name;
      if (body.price !== void 0) updates.price = Number(body.price);
      if (body.originalPrice !== void 0) updates.original_price = Number(body.originalPrice);
      if (body.stock !== void 0) updates.is_in_stock = Boolean(body.stock);
      if (body.stockQuantity !== void 0) updates.stock_quantity = Number(body.stockQuantity);
      if (body.category !== void 0) updates.category = body.category;
      if (body.badge !== void 0) updates.badge = body.badge;
      if (body.featured !== void 0) updates.is_featured = Boolean(body.featured);
      if (body.description !== void 0) updates.description = body.description;
      if (body.shortDescription !== void 0) updates.short_description = body.shortDescription;
      if (body.image !== void 0) updates.image = body.image;
      if (body.availableWeights !== void 0) updates.available_weights = body.availableWeights;
      if (body.defaultWeight !== void 0) updates.default_weight = body.defaultWeight;
      if (body.farmOrigin !== void 0) updates.farm_origin = body.farmOrigin;
      updates.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      const { data, error } = await client.from("products").update(updates).eq("id", id).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      const localIdx = localProducts.findIndex((p) => p.id === id);
      if (localIdx !== -1) {
        localProducts[localIdx] = {
          ...localProducts[localIdx],
          stock: Boolean(data.is_in_stock && data.is_active),
          price: Number(data.price),
          name: data.name
        };
      }
      await auditLog(req.user.email, "product.update", "product", String(id), updates);
      res.json({ ok: true, product: data, message: "Product updated in Supabase." });
      return;
    }
    const idx = localProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...body };
      res.json({ ok: true, product: localProducts[idx], message: "Product updated in local store." });
    } else {
      res.status(404).json({ ok: false, error: "Product not found." });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router3.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const client = getSupabase();
    if (client) {
      const { error } = await client.from("products").delete().eq("id", id);
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, message: `Product ${id} deleted successfully.` });
      return;
    }
    localProducts = localProducts.filter((p) => p.id !== id);
    res.json({ ok: true, message: `Product ${id} deleted from local store.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var products_default = router3;

// server/routes/categories.ts
import { Router as Router4 } from "express";
var router4 = Router4();
var localCategories = [...CATEGORIES];
router4.get("/", async (req, res) => {
  try {
    const client = getSupabase();
    if (client) {
      const { data: catData, error: catError } = await client.from("categories").select("*").order("display_order", { ascending: true });
      if (!catError && catData) {
        const { data: prodData } = await client.from("products").select("category").eq("is_active", true);
        const counts = {};
        if (prodData) {
          prodData.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });
        }
        const formatted = catData.filter((c) => c.is_active !== false).map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description,
          imageUrl: c.image_url,
          displayOrder: c.display_order,
          isActive: c.is_active,
          count: counts[c.name] || 0
        }));
        const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
        const categoriesWithAll = [
          { id: "all", name: "All", icon: "\u{1F33E}", count: totalCount },
          ...formatted
        ];
        res.json({ ok: true, source: "supabase", categories: categoriesWithAll });
        return;
      }
    }
    res.json({ ok: true, source: "local_seeded", categories: localCategories });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router4.get("/admin", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const { data, error } = await client.from("categories").select("*").order("display_order", { ascending: true });
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    const { data: prodData } = await client.from("products").select("category");
    const counts = {};
    if (prodData) prodData.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    res.json({
      ok: true,
      categories: (data || []).map((c) => ({
        ...c,
        count: counts[c.name] || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router4.post("/", requireAdmin, async (req, res) => {
  try {
    const { id, name, icon, description, imageUrl, displayOrder } = req.body;
    const client = getSupabase();
    if (!name) {
      res.status(400).json({ ok: false, error: "Category name is required." });
      return;
    }
    const catId = id || name.toLowerCase().replace(/\s+/g, "-");
    if (client) {
      const { data, error } = await client.from("categories").insert({
        id: catId,
        name,
        icon: icon || "\u{1F33E}",
        description,
        image_url: imageUrl,
        display_order: displayOrder || 10,
        is_active: true
      }).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      await auditLog(req.user.email, "category.create", "category", catId, { name });
      res.status(201).json({ ok: true, category: data, message: "Category created in Supabase." });
      return;
    }
    const newCat = { id: catId, name, icon: icon || "\u{1F33E}", count: 0 };
    localCategories.push(newCat);
    res.status(201).json({ ok: true, category: newCat, message: "Category created in local store." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router4.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const updates = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    const allowedFields = {
      name: "name",
      icon: "icon",
      description: "description",
      imageUrl: "image_url",
      displayOrder: "display_order",
      isActive: "is_active"
    };
    Object.entries(allowedFields).forEach(([jsField, dbField]) => {
      if (req.body[jsField] !== void 0) updates[dbField] = req.body[jsField];
    });
    const { data, error } = await client.from("categories").update(updates).eq("id", id).select().single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "category.update", "category", id, updates);
    res.json({ ok: true, category: data, message: "Category updated." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router4.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const { data, error } = await client.from("categories").update({ is_active: false, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select("name").single();
    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "category.disable", "category", id, { name: data?.name });
    res.json({ ok: true, message: "Category disabled (hidden from storefront)." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var categories_default = router4;

// server/routes/payments.ts
import { Router as Router5 } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";

// server/utils/googleSheets.ts
async function syncOrderToGoogleSheets(order) {
  try {
    let webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
    if (!webhookUrl) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data } = await supabase.from("store_settings").select("value").eq("key", "google_sheets_webhook_url").maybeSingle();
          if (data && data.value) {
            webhookUrl = typeof data.value === "string" ? data.value.replace(/^"|"$/g, "") : data.value;
          }
        } catch (dbErr) {
        }
      }
    }
    const itemsSummary = Array.isArray(order.items) ? order.items.map((i) => `${i.product_name} (${i.selected_weight} \xD7 ${i.quantity})`).join(", ") : "";
    const payload = {
      order_id: order.id,
      date: (/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      customer_name: order.customer_name || "Guest Patron",
      customer_email: order.customer_email || "N/A",
      customer_phone: order.customer_phone || "N/A",
      shipping_address: `${order.shipping_address || ""}, ${order.city || ""} - ${order.pincode || ""}`.trim(),
      delivery_slot: order.delivery_slot || "Standard Morning",
      items: itemsSummary,
      subtotal: order.subtotal ?? 0,
      delivery_charge: order.delivery_charge ?? 0,
      discount_amount: order.discount_amount ?? 0,
      coupon_code: order.coupon_code || "None",
      total_amount: order.total_amount ?? 0,
      payment_method: order.payment_method || "N/A",
      payment_status: order.payment_status || "Pending",
      order_status: order.order_status || "Confirmed"
    };
    if (webhookUrl && webhookUrl.startsWith("http")) {
      const encodedData = encodeURIComponent(JSON.stringify(payload));
      const urlWithQuery = webhookUrl.includes("?") ? `${webhookUrl}&data=${encodedData}` : `${webhookUrl}?data=${encodedData}`;
      fetch(urlWithQuery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow"
      }).then((res) => {
        console.log(`[Google Sheets Sync] Order #${order.id} synced to Google Sheets (Status: ${res.status})`);
      }).catch((err) => {
        console.warn(`[Google Sheets Sync] Failed to send order #${order.id} to Google Sheets:`, err.message);
      });
    } else {
      console.log(`[Google Sheets Sync] Order #${order.id} prepared. (Configure GOOGLE_SHEETS_WEBHOOK_URL in Vercel or store_settings to enable live sheet push)`);
    }
  } catch (err) {
    console.warn(`[Google Sheets Sync Warning]:`, err.message);
  }
}

// server/routes/payments.ts
var router5 = Router5();
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}
function getWeightMultiplier(selectedWeight, availableWeights) {
  if (!selectedWeight || !availableWeights || availableWeights.length === 0) return 1;
  const idx = availableWeights.indexOf(selectedWeight);
  if (idx <= 0) return 1;
  if (idx === 1) return 1.8;
  return 2.5;
}
async function calculateAuthoritativeTotals(items, couponCode, pincode) {
  const supabase = getSupabase();
  const validatedItems = [];
  let subtotal = 0;
  if (supabase) {
    const productIds = items.map((it) => Number(it.product_id));
    const { data: dbProducts, error: dbErr } = await supabase.from("products").select("id, name, price, is_active, is_in_stock, available_weights, default_weight").in("id", productIds);
    if (dbErr || !dbProducts) {
      return { ok: false, error: "Failed to fetch product details from database.", subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
    }
    const dbProductsById = {};
    dbProducts.forEach((p) => dbProductsById[p.id] = p);
    for (const item of items) {
      const p = dbProductsById[item.product_id];
      if (!p) {
        return { ok: false, error: `Product ID ${item.product_id} not found in database.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }
      if (p.is_active === false) {
        return { ok: false, error: `Product "${p.name}" is no longer active.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }
      if (p.is_in_stock === false) {
        return { ok: false, error: `Product "${p.name}" is currently out of stock / unavailable.`, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
      }
      const availableWeights = p.available_weights || ["Standard Pack"];
      const selectedWeight = item.selected_weight || p.default_weight || availableWeights[0] || "Standard Pack";
      const multiplier = getWeightMultiplier(selectedWeight, availableWeights);
      const unitPrice = Math.round(Number(p.price) * multiplier);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;
      validatedItems.push({
        product_id: p.id,
        product_name: p.name,
        selected_weight: selectedWeight,
        unit_price: unitPrice,
        quantity,
        total_price: itemTotal
      });
    }
  } else {
    return { ok: false, error: "Database client not initialized on server.", subtotal: 0, deliveryFee: 0, discount: 0, total: 0, totalInPaise: 0, validatedItems: [] };
  }
  let deliveryFee = 0;
  if (pincode) {
    const deliveryCalc = await calculateServerDeliveryFee(pincode, subtotal, couponCode);
    if (!deliveryCalc.ok || !deliveryCalc.serviceable) {
      return {
        ok: false,
        error: deliveryCalc.error || "Delivery is not available to this location.",
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        totalInPaise: 0,
        validatedItems: []
      };
    }
    deliveryFee = deliveryCalc.finalFee;
  } else {
    const isGarudaFree = String(couponCode || "").trim().toUpperCase() === "GARUDAFREE" && subtotal >= 500;
    deliveryFee = isGarudaFree || validatedItems.length === 0 ? 0 : 40;
  }
  let discount = 0;
  if (couponCode && supabase) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    const { data: dbCoupons } = await supabase.from("coupons").select("*").ilike("code", cleanCode).eq("is_active", true).limit(1);
    if (dbCoupons && dbCoupons.length > 0) {
      const c = dbCoupons[0];
      const isExpired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
      const minOk = subtotal >= Number(c.minimum_order_amount || 0);
      if (!isExpired && minOk) {
        if (c.discount_type === "percentage") {
          discount = Math.round(subtotal * Number(c.discount_value) / 100);
          if (c.maximum_discount_amount && discount > Number(c.maximum_discount_amount)) {
            discount = Number(c.maximum_discount_amount);
          }
        } else {
          discount = Number(c.discount_value || 0);
        }
        discount = Math.min(subtotal, discount);
      }
    }
  }
  const grandTotal = Math.max(1, subtotal + deliveryFee - discount);
  const totalInPaise = Math.round(grandTotal * 100);
  return {
    ok: true,
    subtotal,
    deliveryFee,
    discount,
    total: grandTotal,
    totalInPaise,
    validatedItems
  };
}
async function handleCreateOrder(req, res) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      res.status(401).json({
        ok: false,
        error: "Razorpay credentials not configured on the server. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env."
      });
      return;
    }
    const { items, couponCode, receipt, notes, pincode: reqPincode } = req.body;
    const pincode = reqPincode || notes?.pincode || req.body.address?.pincode || req.body.shipping_address?.pincode || "";
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, error: "Cart items array is required to create an order." });
      return;
    }
    const calc = await calculateAuthoritativeTotals(items, couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, error: calc.error });
      return;
    }
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      res.status(500).json({ ok: false, error: "Razorpay client initialization failed." });
      return;
    }
    const options = {
      amount: calc.totalInPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      notes: notes || {}
    };
    try {
      const order = await razorpay.orders.create(options);
      res.status(200).json({
        ok: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
        receipt: order.receipt,
        calculatedTotal: calc.total,
        subtotal: calc.subtotal,
        deliveryFee: calc.deliveryFee,
        discount: calc.discount
      });
      return;
    } catch (createErr) {
      console.error("Razorpay Create Order Error:", createErr);
      const isAuthError = createErr.statusCode === 401 || createErr.error?.code === "BAD_REQUEST_ERROR" || createErr.error?.description === "Authentication failed" || createErr.message?.includes("Authentication failed");
      if (isAuthError) {
        if (process.env.RAZORPAY_ALLOW_SIMULATOR === "true") {
          console.warn("[Razorpay] Live key auth failed; using developer test simulation order.");
          const simOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
          res.status(200).json({
            ok: true,
            order_id: simOrderId,
            amount: calc.totalInPaise,
            currency: "INR",
            key_id: keyId,
            receipt: options.receipt,
            isSimulated: true,
            calculatedTotal: calc.total,
            subtotal: calc.subtotal,
            deliveryFee: calc.deliveryFee,
            discount: calc.discount
          });
          return;
        }
        res.status(400).json({
          ok: false,
          error: "Razorpay Authentication Failed: Your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env do not match. Please update RAZORPAY_KEY_SECRET with the secret from your Razorpay Dashboard."
        });
        return;
      }
      const desc = createErr.error?.description || createErr.message || "";
      res.status(500).json({ ok: false, error: desc || "Error occurred while creating Razorpay order." });
    }
  } catch (err) {
    console.error("Razorpay Create Order Handler Error:", err);
    res.status(500).json({ ok: false, error: err.message || "Error occurred while creating Razorpay order." });
  }
}
async function handleVerifyPayment(req, res) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(401).json({ ok: false, verified: false, error: "Razorpay key secret is missing on server." });
      return;
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      custom_order_id,
      orderPayload
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        ok: false,
        verified: false,
        error: "Missing required payment verification parameters."
      });
      return;
    }
    const isSimulated = String(razorpay_order_id).startsWith("order_sim_") || String(razorpay_payment_id).startsWith("pay_sim_");
    if (!isSimulated) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        res.status(400).json({
          ok: false,
          verified: false,
          error: "Invalid payment signature. Payment verification failed."
        });
        return;
      }
    }
    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: "Supabase database not connected." });
      return;
    }
    let authUser = null;
    const authHeader = String(req.headers.authorization || "");
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) authUser = data.user;
      } catch (e) {
        console.warn("Supabase auth getUser error during payment verify:", e);
      }
    }
    const { data: existingPay } = await supabase.from("orders").select("id, payment_status").eq("razorpay_payment_id", razorpay_payment_id).maybeSingle();
    if (existingPay && existingPay.payment_status === "Paid") {
      res.status(200).json({
        ok: true,
        verified: true,
        message: "Payment already processed and verified.",
        orderId: existingPay.id,
        razorpay_payment_id
      });
      return;
    }
    const orderId = custom_order_id || `GF-${Math.floor(Date.now() / 1e3)}`;
    const { data: existingOrder } = await supabase.from("orders").select("id, payment_status").eq("id", orderId).maybeSingle();
    if (existingOrder && existingOrder.payment_status === "Paid") {
      res.status(200).json({
        ok: true,
        verified: true,
        message: "Order already processed.",
        orderId: existingOrder.id,
        razorpay_payment_id
      });
      return;
    }
    const items = orderPayload?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, verified: false, error: "Missing cart items in payment verification payload." });
      return;
    }
    const pincode = orderPayload?.pincode || orderPayload?.shippingAddress?.pincode || "";
    const calc = await calculateAuthoritativeTotals(items, orderPayload?.couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, verified: false, error: calc.error });
      return;
    }
    let customerId = null;
    if (authUser) {
      const { data: byAuth } = await supabase.from("customers").select("id").eq("auth_id", authUser.id).maybeSingle();
      if (byAuth && byAuth.id) {
        customerId = byAuth.id;
      } else {
        const { data: existingCust } = await supabase.from("customers").select("*").eq("email", authUser.email).maybeSingle();
        if (existingCust && existingCust.id) {
          customerId = existingCust.id;
          if (!existingCust.auth_id) {
            await supabase.from("customers").update({ auth_id: authUser.id }).eq("id", existingCust.id);
          }
        } else {
          const { data: newCust } = await supabase.from("customers").insert({
            email: authUser.email,
            name: orderPayload.customerName || authUser.user_metadata?.fullName || authUser.email,
            phone: orderPayload.phone || authUser.phone || null,
            auth_id: authUser.id
          }).select("id").maybeSingle();
          customerId = newCust?.id || null;
        }
      }
    }
    const orderRecord = {
      id: orderId,
      customer_id: customerId,
      customer_name: orderPayload.customerName || authUser?.user_metadata?.fullName || "Guest Patron",
      customer_email: orderPayload.email || authUser?.email || "",
      customer_phone: orderPayload.phone || authUser?.phone || "",
      shipping_address: orderPayload.address || "",
      city: orderPayload.city || "Hyderabad",
      pincode: orderPayload.pincode || "",
      delivery_slot: orderPayload.deliverySlot || null,
      subtotal: calc.subtotal,
      delivery_charge: calc.deliveryFee,
      discount_amount: calc.discount,
      coupon_code: orderPayload.couponCode || null,
      total_amount: calc.total,
      payment_method: "Razorpay",
      payment_status: "Paid",
      order_status: "Confirmed",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes: orderPayload.notes ? JSON.stringify(orderPayload.notes) : null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const testRecord = { ...orderRecord, auth_id: authUser?.id || null };
      const { error: upsertErr } = await supabase.from("orders").upsert(testRecord, { onConflict: "id" });
      if (upsertErr) {
        console.warn("[Payment] Order upsert with auth_id failed, retrying without:", upsertErr.message);
        const { error: retryErr } = await supabase.from("orders").upsert(orderRecord, { onConflict: "id" });
        if (retryErr) {
          console.error("[Payment] Order upsert failed:", retryErr.message);
        }
      }
    } catch (upsertEx) {
      console.error("[Payment] Order upsert exception:", upsertEx.message);
      await supabase.from("orders").upsert(orderRecord, { onConflict: "id" });
    }
    await supabase.from("order_items").delete().eq("order_id", orderId);
    for (const item of calc.validatedItems) {
      await supabase.from("order_items").insert({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        selected_weight: item.selected_weight,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price
      });
    }
    syncOrderToGoogleSheets({ ...orderRecord, items: calc.validatedItems });
    res.status(200).json({
      ok: true,
      verified: true,
      message: "Razorpay payment verified and order created successfully.",
      orderId,
      razorpay_payment_id,
      razorpay_order_id
    });
  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ ok: false, verified: false, error: err.message || "Internal error during payment verification." });
  }
}
async function handleCreateCodOrder(req, res) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ ok: false, error: "Supabase database not configured." });
      return;
    }
    let authUser = null;
    const authHeader = String(req.headers.authorization || "");
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        authUser = data.user;
      }
    }
    const payload = req.body || {};
    const items = payload.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ ok: false, error: "Cart items are required for COD order." });
      return;
    }
    const pincode = payload.pincode || payload.shippingAddress?.pincode || "";
    const calc = await calculateAuthoritativeTotals(items, payload.couponCode, pincode);
    if (!calc.ok) {
      res.status(400).json({ ok: false, error: calc.error });
      return;
    }
    const orderId = payload.orderId || `GF-${Math.floor(Date.now() / 1e3)}`;
    let customerId = null;
    if (authUser) {
      const { data: byAuth } = await supabase.from("customers").select("id").eq("auth_id", authUser.id).maybeSingle();
      if (byAuth && byAuth.id) {
        customerId = byAuth.id;
      } else {
        const { data: existingCust } = await supabase.from("customers").select("*").eq("email", authUser.email).maybeSingle();
        if (existingCust && existingCust.id) {
          customerId = existingCust.id;
          if (!existingCust.auth_id) {
            await supabase.from("customers").update({ auth_id: authUser.id }).eq("id", existingCust.id);
          }
        }
      }
    }
    const orderRecord = {
      id: orderId,
      customer_id: customerId,
      customer_name: payload.customerName || authUser?.user_metadata?.fullName || "Guest Patron",
      customer_email: payload.email || authUser?.email || "",
      customer_phone: payload.phone || authUser?.phone || "",
      shipping_address: payload.address || "",
      city: payload.city || "Hyderabad",
      pincode: payload.pincode || "",
      delivery_slot: payload.deliverySlot || null,
      subtotal: calc.subtotal,
      delivery_charge: calc.deliveryFee,
      discount_amount: calc.discount,
      coupon_code: payload.couponCode || null,
      total_amount: calc.total,
      payment_method: "COD",
      payment_status: "Pending",
      order_status: "Confirmed",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const testRecord = { ...orderRecord, auth_id: authUser?.id || null };
      const { error: upsertErr } = await supabase.from("orders").upsert(testRecord, { onConflict: "id" });
      if (upsertErr) {
        console.warn("[COD] Order upsert with auth_id failed, retrying without:", upsertErr.message);
        const { error: retryErr } = await supabase.from("orders").upsert(orderRecord, { onConflict: "id" });
        if (retryErr) {
          console.error("[COD] Order upsert failed:", retryErr.message);
          res.status(500).json({ ok: false, error: "Failed to save order: " + retryErr.message });
          return;
        }
      }
    } catch (upsertEx) {
      console.error("[COD] Order upsert exception:", upsertEx.message);
      const { error: fallbackErr } = await supabase.from("orders").upsert(orderRecord, { onConflict: "id" });
      if (fallbackErr) {
        res.status(500).json({ ok: false, error: "Failed to save order: " + fallbackErr.message });
        return;
      }
    }
    await supabase.from("order_items").delete().eq("order_id", orderId);
    for (const item of calc.validatedItems) {
      await supabase.from("order_items").insert({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        selected_weight: item.selected_weight,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price
      });
    }
    syncOrderToGoogleSheets({ ...orderRecord, items: calc.validatedItems });
    res.status(200).json({
      ok: true,
      orderId,
      message: "Cash on Delivery order created successfully."
    });
  } catch (err) {
    console.error("COD Order Error:", err);
    res.status(500).json({ ok: false, error: err.message || "Internal error creating COD order." });
  }
}
async function handleWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set in environment.");
      res.status(400).json({ ok: false, error: "Webhook secret not configured on server." });
      return;
    }
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      res.status(400).json({ ok: false, error: "Missing x-razorpay-signature header." });
      return;
    }
    const rawBody = typeof req.body === "string" || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (expectedSignature !== signature) {
      console.warn("[Razorpay Webhook] Invalid webhook signature detected.");
      res.status(400).json({ ok: false, error: "Invalid webhook signature." });
      return;
    }
    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventType = event.event;
    const payload = event.payload;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);
    const supabase = getSupabase();
    if (supabase) {
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;
        if (razorpayOrderId || razorpayPaymentId) {
          let query = supabase.from("orders").update({
            payment_status: "Paid",
            order_status: "Confirmed",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (razorpayOrderId) {
            query = query.eq("razorpay_order_id", razorpayOrderId);
          } else {
            query = query.eq("razorpay_payment_id", razorpayPaymentId);
          }
          await query;
          console.log(`[Razorpay Webhook] Order updated to Paid for Razorpay Order ${razorpayOrderId}`);
        }
      } else if (eventType === "payment.failed") {
        const paymentEntity = payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        if (razorpayOrderId) {
          await supabase.from("orders").update({
            payment_status: "Failed",
            order_status: "Cancelled",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("razorpay_order_id", razorpayOrderId);
        }
      }
    }
    res.status(200).json({ ok: true, status: "processed" });
  } catch (err) {
    console.error("[Razorpay Webhook Error]:", err);
    res.status(500).json({ ok: false, error: err.message || "Webhook processing error." });
  }
}
router5.post("/create-order", handleCreateOrder);
router5.post("/verify-payment", handleVerifyPayment);
router5.post("/create-cod", handleCreateCodOrder);
router5.post("/webhook", handleWebhook);
var payments_default = router5;

// server/routes/orders.ts
import { Router as Router6 } from "express";
var router6 = Router6();
var VALID_ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];
async function attachOrderItems(supabase, orders) {
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);
  const { data: items, error } = await supabase.from("order_items").select("*").in("order_id", orderIds);
  if (error || !items) {
    return orders.map((o) => ({ ...o, items: [] }));
  }
  const itemsByOrderId = {};
  items.forEach((item) => {
    if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
    itemsByOrderId[item.order_id].push({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      selected_weight: item.selected_weight,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      total_price: Number(item.total_price)
    });
  });
  return orders.map((o) => ({
    ...o,
    items: itemsByOrderId[o.id] || []
  }));
}
router6.get("/", requireUser, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase database not configured on server." });
      return;
    }
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId && !userEmail) {
      res.status(400).json({ ok: false, error: "User ID or email missing in request." });
      return;
    }
    let allOrders = [];
    const seenIds = /* @__PURE__ */ new Set();
    if (userEmail) {
      const { data: emailOrders, error: emailErr } = await client.from("orders").select("*").eq("customer_email", userEmail).order("created_at", { ascending: false });
      if (!emailErr && emailOrders) {
        emailOrders.forEach((o) => {
          if (!seenIds.has(o.id)) {
            seenIds.add(o.id);
            allOrders.push(o);
          }
        });
      } else if (emailErr) {
        console.warn("[Orders] email query error:", emailErr.message);
      }
    }
    if (userId) {
      try {
        const { data: authOrders, error: authErr } = await client.from("orders").select("*").eq("auth_id", userId).order("created_at", { ascending: false });
        if (!authErr && authOrders) {
          authOrders.forEach((o) => {
            if (!seenIds.has(o.id)) {
              seenIds.add(o.id);
              allOrders.push(o);
            }
          });
        }
      } catch (authLookupErr) {
        console.warn("[Orders] auth_id lookup skipped:", authLookupErr?.message);
      }
    }
    allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const ordersWithItems = await attachOrderItems(client, allOrders);
    res.json({ ok: true, orders: ordersWithItems });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    res.status(500).json({ ok: false, error: err.message || "Internal server error" });
  }
});
router6.get("/admin", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured on server" });
      return;
    }
    const { status, search } = req.query;
    let query = client.from("orders").select("*").order("created_at", { ascending: false });
    if (status && String(status) !== "All") {
      query = query.eq("order_status", String(status));
    }
    if (search) {
      const q = String(search);
      query = query.or(`id.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`);
    }
    const { data: orders, error } = await query;
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    const ordersWithItems = await attachOrderItems(client, orders || []);
    res.json({ ok: true, orders: ordersWithItems });
  } catch (err) {
    console.error("GET /api/orders/admin error:", err);
    res.status(500).json({ ok: false, error: err.message || "Internal server error" });
  }
});
router6.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const { data: orders, error } = await client.from("orders").select("id, total_amount, payment_status, order_status");
    if (error || !orders) {
      res.status(500).json({ ok: false, error: error?.message || "Error fetching order stats" });
      return;
    }
    const totalOrders = orders.length;
    let totalRevenue = 0;
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0
    };
    orders.forEach((o) => {
      if (o.payment_status === "Paid") {
        totalRevenue += Number(o.total_amount || 0);
      }
      if (statusCounts[o.order_status] !== void 0) {
        statusCounts[o.order_status] += 1;
      }
    });
    res.json({
      ok: true,
      stats: {
        totalOrders,
        totalRevenue,
        ...statusCounts
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const { id } = req.params;
    const { data: order, error } = await client.from("orders").select("*").eq("id", id).single();
    if (error || !order) {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }
    const [orderWithItems] = await attachOrderItems(client, [order]);
    res.json({ ok: true, order: orderWithItems });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Supabase not configured" });
      return;
    }
    const { id } = req.params;
    const { order_status, payment_status } = req.body;
    if (order_status && !VALID_ORDER_STATUSES.includes(order_status)) {
      res.status(400).json({ ok: false, error: `Invalid order status. Allowed: ${VALID_ORDER_STATUSES.join(", ")}` });
      return;
    }
    const updates = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (order_status) updates.order_status = order_status;
    if (payment_status) updates.payment_status = payment_status;
    const { data, error } = await client.from("orders").update(updates).eq("id", id).select().single();
    if (error || !data) {
      res.status(400).json({ ok: false, error: error?.message || "Failed to update order status" });
      return;
    }
    await auditLog(req.user.email, "order.status_change", "order", id, { order_status, payment_status });
    try {
      await client.from("order_status_history").insert({
        order_id: id,
        status: order_status || data.order_status,
        changed_by: `Admin (${req.user.email})`,
        notes: `Status updated to ${order_status}`
      });
    } catch {
    }
    res.json({ ok: true, order: data, message: `Order #${id} status updated to "${order_status}".` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.post("/:id/cancel", requireUser, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    const { id } = req.params;
    const userId = req.user.id;
    const { data: order, error: fetchErr } = await client.from("orders").select("*").eq("id", id).single();
    if (fetchErr || !order) {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }
    if (order.customer_id !== userId && order.auth_id !== userId) {
      res.status(403).json({ ok: false, error: "Unauthorized to cancel this order." });
      return;
    }
    const cancellableStatuses = ["Pending", "Confirmed"];
    if (!cancellableStatuses.includes(order.order_status)) {
      res.status(400).json({
        ok: false,
        error: `Cannot cancel order in "${order.order_status}" status. Please contact support.`
      });
      return;
    }
    const { data: updated, error: updateErr } = await client.from("orders").update({
      order_status: "Cancelled",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id).select().single();
    if (updateErr) {
      res.status(500).json({ ok: false, error: updateErr.message });
      return;
    }
    try {
      await client.from("order_status_history").insert({
        order_id: id,
        status: "Cancelled",
        changed_by: `Customer (${req.user.email})`,
        notes: "Order cancelled by customer"
      });
    } catch {
    }
    res.json({ ok: true, order: updated, message: `Order #${id} has been cancelled.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.post("/:id/reorder", requireUser, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    const { id } = req.params;
    const userId = req.user.id;
    const { data: order, error: fetchErr } = await client.from("orders").select("*").eq("id", id).single();
    if (fetchErr || !order) {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }
    if (order.customer_id !== userId && order.auth_id !== userId) {
      res.status(403).json({ ok: false, error: "Unauthorized." });
      return;
    }
    const [orderWithItems] = await attachOrderItems(client, [order]);
    const items = orderWithItems.items || [];
    if (items.length === 0) {
      res.status(400).json({ ok: false, error: "No items found in this order to reorder." });
      return;
    }
    const productIds = items.map((it) => it.product_id);
    const { data: dbProducts } = await client.from("products").select("*").in("id", productIds);
    const dbProductsMap = {};
    (dbProducts || []).forEach((p) => dbProductsMap[p.id] = p);
    const reorderItems = [];
    const unavailableNames = [];
    items.forEach((item) => {
      const liveP = dbProductsMap[item.product_id];
      if (!liveP || !liveP.is_active || liveP.is_in_stock === false) {
        unavailableNames.push(item.product_name);
      } else {
        reorderItems.push({
          product: {
            id: liveP.id,
            name: liveP.name,
            category: liveP.category,
            description: liveP.description,
            image: liveP.image,
            price: Number(liveP.price),
            originalPrice: Number(liveP.original_price),
            rating: Number(liveP.rating),
            reviews: liveP.reviews_count,
            availableWeights: liveP.available_weights || ["Standard Pack"],
            defaultWeight: liveP.default_weight || "Standard Pack",
            badge: liveP.badge,
            farmOrigin: liveP.farm_origin,
            stock: liveP.is_in_stock
          },
          weight: item.selected_weight,
          quantity: item.quantity,
          currentPrice: Number(liveP.price)
        });
      }
    });
    res.json({
      ok: true,
      items: reorderItems,
      unavailable: unavailableNames,
      message: unavailableNames.length > 0 ? `Some products (${unavailableNames.join(", ")}) are currently unavailable and were omitted.` : "All items are available for reorder."
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.get("/track/:query", async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    const { query } = req.params;
    const cleanQuery = query.replace("#", "").trim();
    if (!cleanQuery) {
      res.status(400).json({ ok: false, error: "Order reference or phone required" });
      return;
    }
    const { data: orders, error } = await client.from("orders").select("*").or(`id.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%,customer_email.ilike.%${cleanQuery}%`).order("created_at", { ascending: false }).limit(5);
    if (error || !orders || orders.length === 0) {
      res.status(404).json({ ok: false, error: `No active order found matching "${cleanQuery}".` });
      return;
    }
    const primaryOrder = orders[0];
    const [orderWithItems] = await attachOrderItems(client, [primaryOrder]);
    const { data: history } = await client.from("order_status_history").select("*").eq("order_id", primaryOrder.id).order("created_at", { ascending: true });
    res.json({
      ok: true,
      order: orderWithItems,
      currentStatus: primaryOrder.order_status,
      paymentStatus: primaryOrder.payment_status,
      createdAt: primaryOrder.created_at,
      updatedAt: primaryOrder.updated_at,
      history: history || [],
      matchingOrders: orders.map((o) => ({
        id: o.id,
        created_at: o.created_at,
        total_amount: o.total_amount,
        status: o.order_status
      }))
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.get("/:id/tracking", requireUser, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    const { id } = req.params;
    const { data: order, error } = await client.from("orders").select("id, order_status, payment_status, created_at, updated_at").eq("id", id).single();
    if (error || !order) {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }
    const { data: history } = await client.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true });
    res.json({
      ok: true,
      currentStatus: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      history: history || []
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.delete("/admin/clear-all", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    await client.from("order_items").delete().gte("id", 0);
    const { error } = await client.from("orders").delete().neq("id", "NO_MATCH");
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "orders.clear_all", "orders", null, {});
    res.json({ ok: true, message: "All test orders have been cleared successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router6.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const client = getSupabase();
    if (!client) {
      res.status(500).json({ ok: false, error: "Database client not configured" });
      return;
    }
    const { id } = req.params;
    await client.from("order_items").delete().eq("order_id", id);
    const { error } = await client.from("orders").delete().eq("id", id);
    if (error) {
      res.status(500).json({ ok: false, error: error.message });
      return;
    }
    await auditLog(req.user.email, "order.delete", "order", id, {});
    res.json({ ok: true, message: `Order #${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var orders_default = router6;

// server/routes/account.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/profile", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (!client) {
      res.json({
        ok: true,
        profile: {
          id: userId,
          full_name: req.user.user_metadata?.fullName || req.user.email.split("@")[0],
          email: req.user.email,
          phone: req.user.phone || "",
          avatar_url: req.user.user_metadata?.avatar_url || ""
        }
      });
      return;
    }
    const { data: profile } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (profile) {
      res.json({ ok: true, profile });
    } else {
      res.json({
        ok: true,
        profile: {
          id: userId,
          full_name: req.user.user_metadata?.fullName || req.user.email.split("@")[0],
          email: req.user.email,
          phone: req.user.phone || "",
          avatar_url: ""
        }
      });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router7.patch("/profile", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, avatar_url, dob, gender } = req.body;
    const client = getSupabase();
    if (client) {
      const updates = {
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (full_name !== void 0) updates.full_name = full_name;
      if (phone !== void 0) updates.phone = phone;
      if (avatar_url !== void 0) updates.avatar_url = avatar_url;
      if (dob !== void 0) updates.dob = dob;
      if (gender !== void 0) updates.gender = gender;
      const { data, error } = await client.from("profiles").upsert({ id: userId, email: req.user.email, ...updates }).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, profile: data, message: "Profile updated successfully." });
      return;
    }
    res.json({
      ok: true,
      profile: { id: userId, full_name, phone, email: req.user.email, avatar_url },
      message: "Profile updated locally."
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var account_default = router7;

// server/routes/addresses.ts
import { Router as Router8 } from "express";
var router8 = Router8();
var localAddressesMap = {};
router8.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (client) {
      const { data, error } = await client.from("customer_addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at", { ascending: false });
      if (!error && data) {
        res.json({ ok: true, addresses: data });
        return;
      }
    }
    res.json({ ok: true, addresses: localAddressesMap[userId] || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router8.post("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address_line, city, state, pincode, label, is_default } = req.body;
    const client = getSupabase();
    if (!full_name || !phone || !address_line || !city || !pincode) {
      res.status(400).json({ ok: false, error: "Full name, phone, address line, city, and pincode are required." });
      return;
    }
    if (client) {
      if (is_default) {
        await client.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
      }
      const { data, error } = await client.from("customer_addresses").insert({
        user_id: userId,
        full_name,
        phone,
        address_line,
        city,
        state: state || "Telangana",
        pincode,
        label: label || "Home",
        is_default: Boolean(is_default)
      }).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.status(201).json({ ok: true, address: data, message: "Address saved successfully." });
      return;
    }
    if (!localAddressesMap[userId]) localAddressesMap[userId] = [];
    if (is_default) {
      localAddressesMap[userId].forEach((a) => a.is_default = false);
    }
    const newAddr = {
      id: `addr_${Date.now()}`,
      user_id: userId,
      full_name,
      phone,
      address_line,
      city,
      state: state || "Telangana",
      pincode,
      label: label || "Home",
      is_default: Boolean(is_default || localAddressesMap[userId].length === 0),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    localAddressesMap[userId].unshift(newAddr);
    res.status(201).json({ ok: true, address: newAddr, message: "Address saved locally." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router8.put("/:id", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { full_name, phone, address_line, city, state, pincode, label, is_default } = req.body;
    const client = getSupabase();
    if (client) {
      if (is_default) {
        await client.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
      }
      const updates = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      if (full_name !== void 0) updates.full_name = full_name;
      if (phone !== void 0) updates.phone = phone;
      if (address_line !== void 0) updates.address_line = address_line;
      if (city !== void 0) updates.city = city;
      if (state !== void 0) updates.state = state;
      if (pincode !== void 0) updates.pincode = pincode;
      if (label !== void 0) updates.label = label;
      if (is_default !== void 0) updates.is_default = is_default;
      const { data, error } = await client.from("customer_addresses").update(updates).eq("id", id).eq("user_id", userId).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, address: data, message: "Address updated successfully." });
      return;
    }
    const list = localAddressesMap[userId] || [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      if (is_default) list.forEach((a) => a.is_default = false);
      list[idx] = { ...list[idx], ...req.body, is_default: Boolean(is_default) };
      res.json({ ok: true, address: list[idx], message: "Address updated." });
    } else {
      res.status(404).json({ ok: false, error: "Address not found." });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router8.delete("/:id", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();
    if (client) {
      const { error } = await client.from("customer_addresses").delete().eq("id", id).eq("user_id", userId);
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, message: "Address deleted." });
      return;
    }
    if (localAddressesMap[userId]) {
      localAddressesMap[userId] = localAddressesMap[userId].filter((a) => a.id !== id);
    }
    res.json({ ok: true, message: "Address deleted." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router8.patch("/:id/default", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();
    if (client) {
      await client.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
      const { data, error } = await client.from("customer_addresses").update({ is_default: true, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).eq("user_id", userId).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, address: data, message: "Default address updated." });
      return;
    }
    const list = localAddressesMap[userId] || [];
    list.forEach((a) => a.is_default = a.id === id);
    res.json({ ok: true, message: "Default address set." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var addresses_default = router8;

// server/routes/wishlist.ts
import { Router as Router9 } from "express";
var router9 = Router9();
var localWishlistMap = {};
router9.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (client) {
      const { data, error } = await client.from("wishlist_items").select("product_id").eq("user_id", userId);
      if (!error && data) {
        const productIds = data.map((item) => item.product_id);
        res.json({ ok: true, productIds });
        return;
      }
    }
    res.json({ ok: true, productIds: localWishlistMap[userId] || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router9.post("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const client = getSupabase();
    if (!productId) {
      res.status(400).json({ ok: false, error: "Product ID is required." });
      return;
    }
    const numericId = Number(productId);
    if (client) {
      const { error } = await client.from("wishlist_items").upsert({ user_id: userId, product_id: numericId }, { onConflict: "user_id,product_id" });
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.status(201).json({ ok: true, productId: numericId, message: "Added to wishlist." });
      return;
    }
    if (!localWishlistMap[userId]) localWishlistMap[userId] = [];
    if (!localWishlistMap[userId].includes(numericId)) {
      localWishlistMap[userId].push(numericId);
    }
    res.status(201).json({ ok: true, productId: numericId, message: "Added to wishlist." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router9.delete("/:productId", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const numericId = Number(req.params.productId);
    const client = getSupabase();
    if (client) {
      const { error } = await client.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", numericId);
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.json({ ok: true, productId: numericId, message: "Removed from wishlist." });
      return;
    }
    if (localWishlistMap[userId]) {
      localWishlistMap[userId] = localWishlistMap[userId].filter((id) => id !== numericId);
    }
    res.json({ ok: true, productId: numericId, message: "Removed from wishlist." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var wishlist_default = router9;

// server/routes/notifications.ts
import { Router as Router10 } from "express";
var router10 = Router10();
router10.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (client) {
      const { data, error } = await client.from("customer_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (!error && data) {
        res.json({ ok: true, notifications: data });
        return;
      }
    }
    res.json({
      ok: true,
      notifications: [
        {
          id: "welcome-1",
          user_id: userId,
          title: "Welcome to Garuda Farms",
          message: "Your account is active. Enjoy 100% pure single-origin A2 milk and organic harvests.",
          type: "system",
          read: false,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router10.patch("/:id/read", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const client = getSupabase();
    if (client) {
      await client.from("customer_notifications").update({ read: true }).eq("id", id).eq("user_id", userId);
    }
    res.json({ ok: true, message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router10.patch("/read-all", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (client) {
      await client.from("customer_notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    }
    res.json({ ok: true, message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var notifications_default = router10;

// server/routes/support.ts
import { Router as Router11 } from "express";
var router11 = Router11();
var localTicketsMap = {};
router11.get("/tickets", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = getSupabase();
    if (client) {
      const { data, error } = await client.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (!error && data) {
        res.json({ ok: true, tickets: data });
        return;
      }
    }
    res.json({ ok: true, tickets: localTicketsMap[userId] || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router11.post("/tickets", requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, category, message, order_id } = req.body;
    const client = getSupabase();
    if (!subject || !message) {
      res.status(400).json({ ok: false, error: "Subject and message are required." });
      return;
    }
    if (client) {
      const { data, error } = await client.from("support_tickets").insert({
        user_id: userId,
        subject,
        category: category || "General",
        message,
        order_id: order_id || null,
        status: "Open"
      }).select().single();
      if (error) {
        res.status(400).json({ ok: false, error: error.message });
        return;
      }
      res.status(201).json({ ok: true, ticket: data, message: "Support ticket submitted." });
      return;
    }
    if (!localTicketsMap[userId]) localTicketsMap[userId] = [];
    const newTicket = {
      id: `tkt_${Date.now()}`,
      user_id: userId,
      subject,
      category: category || "General",
      message,
      order_id: order_id || null,
      status: "Open",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    localTicketsMap[userId].unshift(newTicket);
    res.status(201).json({ ok: true, ticket: newTicket, message: "Support ticket submitted." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var support_default = router11;

// server/routes/coupons.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.get("/active", async (req, res) => {
  try {
    const client = getSupabase();
    if (client) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const { data, error } = await client.from("coupons").select("*").eq("is_active", true).or(`expires_at.is.null,expires_at.gt.${now}`).order("created_at", { ascending: false });
      if (!error && data) {
        const visibleCoupons = data.filter((c) => c.code.toUpperCase() !== "GARUDAFREE");
        res.json({ ok: true, coupons: visibleCoupons });
        return;
      }
    }
    res.json({ ok: true, coupons: [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router12.post("/validate", async (req, res) => {
  try {
    const { code, subtotal, items, customerEmail } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ ok: false, error: "Coupon code is required." });
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    const cartSubtotal = Number(subtotal || 0);
    if (cleanCode === "GARUDAFREE") {
      if (cartSubtotal < 500) {
        res.status(400).json({
          ok: false,
          error: `Coupon "GARUDAFREE" requires a minimum order subtotal of \u20B9500 for Free Delivery. (Current: \u20B9${cartSubtotal})`
        });
        return;
      }
      res.json({
        ok: true,
        coupon: {
          code: "GARUDAFREE",
          discount_type: "free_shipping",
          discount_value: 0,
          description: "Unlocks FREE Delivery on orders \u20B9500+"
        },
        discountAmount: 0,
        isFreeDelivery: true,
        netTotal: cartSubtotal,
        message: 'Secret coupon "GARUDAFREE" applied! Free Delivery unlocked.'
      });
      return;
    }
    const client = getSupabase();
    let coupon = null;
    if (client) {
      try {
        const { data, error } = await client.from("coupons").select("*").eq("code", cleanCode).limit(1);
        if (error) {
          const { data: ilikeData } = await client.from("coupons").select("*").ilike("code", cleanCode).limit(1);
          if (ilikeData && ilikeData.length > 0) {
            coupon = ilikeData[0];
          }
        } else if (data && data.length > 0) {
          coupon = data[0];
        }
      } catch (err) {
        console.warn("[Coupons Validation] Error querying coupons table:", err.message);
      }
    }
    if (!coupon) {
      res.status(400).json({ ok: false, error: `Invalid coupon code "${cleanCode}".` });
      return;
    }
    if (coupon.is_active === false) {
      res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" is no longer active.` });
      return;
    }
    if (coupon.expires_at) {
      const exp = new Date(coupon.expires_at).getTime();
      if (exp < Date.now()) {
        res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" has expired.` });
        return;
      }
    }
    if (coupon.usage_limit && coupon.used_count && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ ok: false, error: `Coupon code "${cleanCode}" has reached maximum usage limit.` });
      return;
    }
    const minAmount = Number(coupon.minimum_order_amount || 0);
    if (cartSubtotal < minAmount) {
      res.status(400).json({
        ok: false,
        error: `Coupon "${cleanCode}" requires a minimum order subtotal of \u20B9${minAmount}. (Current: \u20B9${cartSubtotal})`
      });
      return;
    }
    if (coupon.first_order_only && customerEmail && client) {
      try {
        const { data: orderData } = await client.from("orders").select("id").eq("customer_email", String(customerEmail).trim().toLowerCase()).limit(1);
        if (orderData && orderData.length > 0) {
          res.status(400).json({
            ok: false,
            error: `Coupon "${cleanCode}" is valid for first-time customers only.`
          });
          return;
        }
      } catch (e) {
        console.warn("First order coupon check error:", e);
      }
    }
    if (coupon.applicable_category && coupon.applicable_category !== "All" && Array.isArray(items)) {
      const categoryMatch = items.some(
        (it) => it.category && it.category.toLowerCase() === coupon.applicable_category.toLowerCase()
      );
      if (!categoryMatch) {
        res.status(400).json({
          ok: false,
          error: `Coupon "${cleanCode}" is valid only for items in the "${coupon.applicable_category}" category.`
        });
        return;
      }
    }
    if (coupon.applicable_product_id && Array.isArray(items)) {
      const productMatch = items.some((it) => Number(it.product_id || it.id) === Number(coupon.applicable_product_id));
      if (!productMatch) {
        res.status(400).json({
          ok: false,
          error: `Coupon "${cleanCode}" is valid only for specific targeted products.`
        });
        return;
      }
    }
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round(cartSubtotal * Number(coupon.discount_value) / 100);
      if (coupon.maximum_discount_amount && discountAmount > Number(coupon.maximum_discount_amount)) {
        discountAmount = Number(coupon.maximum_discount_amount);
      }
    } else {
      discountAmount = Number(coupon.discount_value || 0);
    }
    discountAmount = Math.min(cartSubtotal, discountAmount);
    const netTotal = Math.max(0, cartSubtotal - discountAmount);
    res.json({
      ok: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description || `${coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `\u20B9${coupon.discount_value}`} discount`
      },
      discountAmount,
      netTotal,
      message: `Coupon "${coupon.code}" applied! You saved \u20B9${discountAmount}.`
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var coupons_default = router12;

// server/routes/reviews.ts
import { Router as Router13 } from "express";
var router13 = Router13();
var memoryReviews = [
  {
    id: "rev-1",
    product_id: 1,
    customer_name: "Dr. Ananya Rao",
    customer_email: "ananya.rao@example.com",
    rating: 5,
    title: "Purest A2 Milk & Thick Cream",
    comment: "Subscribed to daily delivery for 3 months now. Deep orange cream layer and zero stomach heaviness. Authentic Gir cow milk!",
    photo_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400",
    is_verified_purchase: true,
    status: "approved",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: "rev-2",
    product_id: 1,
    customer_name: "Vikram Reddy",
    customer_email: "vikram.reddy@example.com",
    rating: 5,
    title: "Chilled Dawn Delivery",
    comment: "Punctual 6:30 AM delivery every morning in sealed glass bottles. Outstanding purity!",
    photo_url: null,
    is_verified_purchase: true,
    status: "approved",
    created_at: new Date(Date.now() - 864e5 * 5).toISOString()
  },
  {
    id: "rev-3",
    product_id: 2,
    customer_name: "Sunita Sharma",
    customer_email: "sunita@example.com",
    rating: 5,
    title: "Authentic Deep Yolk Nati Eggs",
    comment: "You can taste the difference immediately. Deep golden yolk and farm-fresh taste. My kids love it!",
    photo_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400",
    is_verified_purchase: true,
    status: "approved",
    created_at: new Date(Date.now() - 864e5 * 1).toISOString()
  }
];
router13.get("/product/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const supabase = getSupabase();
    let reviews = [];
    if (supabase) {
      const { data, error } = await supabase.from("product_reviews").select("*").eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false });
      if (!error && data) {
        reviews = data;
      } else {
        reviews = memoryReviews.filter((r) => r.product_id === productId && r.status === "approved");
      }
    } else {
      reviews = memoryReviews.filter((r) => r.product_id === productId && r.status === "approved");
    }
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)) : 5;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, r.rating));
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });
    res.json({
      ok: true,
      productId,
      avgRating,
      totalReviews,
      ratingCounts,
      reviews
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router13.post("/", async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, title, comment, photoUrl } = req.body;
    if (!productId || !customerName || !customerEmail || !rating || !comment) {
      res.status(400).json({
        ok: false,
        error: "productId, customerName, customerEmail, rating (1-5), and comment are required."
      });
      return;
    }
    const numericRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
    const supabase = getSupabase();
    let isVerifiedPurchase = false;
    if (supabase) {
      try {
        const { data: orderData } = await supabase.from("orders").select("id").eq("customer_email", customerEmail.trim().toLowerCase()).eq("order_status", "Delivered").limit(1);
        if (orderData && orderData.length > 0) {
          isVerifiedPurchase = true;
        }
      } catch (e) {
        console.warn("[Review Verified Purchase Check Warn]:", e);
      }
    }
    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      product_id: Number(productId),
      customer_name: String(customerName).trim(),
      customer_email: String(customerEmail).trim().toLowerCase(),
      rating: numericRating,
      title: title ? String(title).trim() : null,
      comment: String(comment).trim(),
      photo_url: photoUrl ? String(photoUrl).trim() : null,
      is_verified_purchase: isVerifiedPurchase,
      status: "approved",
      // Auto-approve by default for seamless customer UX
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase.from("product_reviews").insert({
        product_id: newReview.product_id,
        customer_name: newReview.customer_name,
        customer_email: newReview.customer_email,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        photo_url: newReview.photo_url,
        is_verified_purchase: newReview.is_verified_purchase,
        status: "approved"
      }).select().single();
      if (!error && data) {
        res.status(201).json({ ok: true, review: data, message: "Review submitted successfully." });
        return;
      }
    }
    memoryReviews.unshift(newReview);
    res.status(201).json({ ok: true, review: newReview, message: "Review submitted successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
router13.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customerEmail = String(req.query.email || req.body.email || "").trim().toLowerCase();
    if (!customerEmail) {
      res.status(400).json({ ok: false, error: "Customer email is required to delete review." });
      return;
    }
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from("product_reviews").delete().eq("id", id).eq("customer_email", customerEmail);
      if (!error) {
        res.json({ ok: true, message: "Review deleted successfully." });
        return;
      }
    }
    memoryReviews = memoryReviews.filter((r) => !(r.id === id && r.customer_email === customerEmail));
    res.json({ ok: true, message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
var reviews_default = router13;

// server/routes/delivery.ts
import { Router as Router14 } from "express";
var router14 = Router14();
router14.post("/calculate", async (req, res) => {
  try {
    const { pincode, subtotal = 0, couponCode } = req.body || {};
    if (!pincode) {
      res.status(400).json({
        ok: false,
        serviceable: false,
        error: "PIN code is required to calculate delivery fee."
      });
      return;
    }
    const numericSubtotal = Math.max(0, Number(subtotal) || 0);
    const result = await calculateServerDeliveryFee(String(pincode), numericSubtotal, couponCode);
    if (!result.ok || !result.serviceable) {
      res.status(200).json({
        ok: false,
        serviceable: false,
        pincode: result.pincode,
        error: result.error || "Delivery is not available to this location."
      });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("[Delivery Calculate Error]:", err);
    res.status(500).json({
      ok: false,
      serviceable: false,
      error: "Failed to calculate delivery fee on server."
    });
  }
});
router14.get("/pincodes", async (req, res) => {
  try {
    const supabase = getSupabase();
    let pincodesList = [];
    if (supabase) {
      const { data, error } = await supabase.from("serviceable_pincodes").select("*").eq("is_enabled", true).order("pincode", { ascending: true });
      if (!error && data && data.length > 0) {
        pincodesList = data.map((item) => ({
          pincode: item.pincode,
          area_name: item.area_name,
          distance_km: Number(item.distance_km),
          is_enabled: Boolean(item.is_enabled)
        }));
      }
    }
    if (pincodesList.length === 0) {
      pincodesList = Object.entries(PINCODE_DISTANCE_MAP).map(([pin, info]) => ({
        pincode: pin,
        area_name: info.name,
        distance_km: info.distanceKm,
        is_enabled: true
      }));
    }
    const settings = await getDeliverySettingsFromDb();
    res.status(200).json({
      ok: true,
      pincodes: pincodesList,
      ratePerKm: settings.ratePerKm,
      freeThreshold: settings.freeThreshold,
      originAddress: settings.originAddress
    });
  } catch (err) {
    console.error("[Delivery Pincodes List Error]:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch serviceable PIN codes." });
  }
});
var delivery_default = router14;

// server/api.ts
dotenv.config();
var app = express();
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.get("/api/health", async (req, res) => {
  const supabaseConfigured = isSupabaseConfigured();
  let dbStatus = { ok: false, message: "Supabase credentials not configured" };
  if (supabaseConfigured) dbStatus = await testSupabaseConnection();
  res.json({
    status: "ok",
    service: "Garuda Farms E-Commerce API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "production",
    database: { provider: "Supabase PostgreSQL", configured: supabaseConfigured, connected: dbStatus.ok },
    payments: { razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) }
  });
});
app.get("/api/db/status", async (req, res) => {
  const client = getSupabase();
  if (!client) {
    res.json({ ok: true, configured: false });
    return;
  }
  try {
    const { count: prodCount } = await client.from("products").select("*", { count: "exact", head: true });
    res.json({ ok: true, configured: true, productsInDatabase: prodCount ?? 0 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.post("/api/db/seed", async (req, res) => {
  const client = getSupabase();
  if (!client) {
    res.status(400).json({ ok: false, error: "Supabase not configured." });
    return;
  }
  try {
    const result = await seedDatabase(client);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.use("/api/auth", auth_default);
app.use("/api/products", products_default);
app.use("/api/categories", categories_default);
app.use("/api/payments", payments_default);
app.use("/api/orders", orders_default);
app.use("/api/admin", admin_default);
app.use("/api/account", account_default);
app.use("/api/addresses", addresses_default);
app.use("/api/wishlist", wishlist_default);
app.use("/api/notifications", notifications_default);
app.use("/api/support", support_default);
app.use("/api/coupons", coupons_default);
app.use("/api/reviews", reviews_default);
app.use("/api/delivery", delivery_default);
app.post("/api/create-order", handleCreateOrder);
app.post("/api/verify-payment", handleVerifyPayment);
app.post("/api/create-cod", handleCreateCodOrder);
if (isSupabaseConfigured()) {
  const client = getSupabase();
  if (client) {
    (async () => {
      try {
        const { count, error } = await client.from("products").select("id", { count: "exact", head: true });
        if (error) throw error;
        if (count === 0 || count === null) {
          await seedDatabase(client);
          console.log("[Garuda Farms] Auto-seed complete.");
        } else {
          console.log(`[Garuda Farms] DB ready with ${count} products.`);
        }
      } catch (err) {
        console.warn("[Garuda Farms] DB check error:", err?.message || err);
      }
    })();
  }
}
var api_default = app;
export {
  api_default as default
};
