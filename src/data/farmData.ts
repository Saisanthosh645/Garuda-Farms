import { StoryStage, FarmBenefit, Testimonial, FarmMetric } from '../types';

export const FARM_BENEFITS: FarmBenefit[] = [
  {
    id: 1,
    iconName: 'Sprout',
    title: '100% Natural',
    subtitle: 'Zero Synthetic Chemicals',
    description: 'Nurtured strictly with compost, neem oils, and native soil minerals. No antibiotics, synthetic hormones, or artificial dyes.',
    highlight: 'Natural Vedic Farming'
  },
  {
    id: 2,
    iconName: 'ShieldCheck',
    title: 'Quality & Safety',
    subtitle: 'Rigorous Lab Testing',
    description: 'Every harvest batch undergoes 18+ strict multi-parameter safety checks for heavy metals, pesticides, and microbial purity.',
    highlight: 'FSSAI Certified'
  },
  {
    id: 3,
    iconName: 'Trees',
    title: 'Sustainable Farming',
    subtitle: 'Ecological Stewardship',
    description: 'Regenerative grazing, rainwater harvesting, solar micro-cold storages, and zero chemical run-off for the next generation.',
    highlight: 'Carbon Negative Focus'
  },
  {
    id: 4,
    iconName: 'Truck',
    title: 'Farm Fresh Delivery',
    subtitle: 'From Harvest to Kitchen',
    description: 'Chilled insulated supply chain delivering within 4 to 12 hours of harvesting. Maximum crunch, nutrient density, and aroma.',
    highlight: 'Morning 7 AM Slot'
  }
];

export const STORY_STAGES: StoryStage[] = [
  {
    id: 1,
    stageNumber: '01',
    title: 'WE GROW',
    subtitle: 'Heirloom Seeds & Living Soil',
    tagline: 'Rooted in Native Indian Wisdom',
    description: 'We reject high-yield GMO seeds in favor of indigenous, climate-hardy varieties. Our soil is alive, enriched with organic cow manure, jeevamrutham compost, and mulch.',
    quote: '"The foundation of extraordinary health is living, nutrient-rich soil."',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    features: ['Non-GMO Heirloom Seed Banks', 'Jeevamrutham Natural Microbial Culture', 'Desi Cow Dung Soil Enrichment']
  },
  {
    id: 2,
    stageNumber: '02',
    title: 'WE CARE',
    subtitle: 'Ethical Grazing & Compassionate Animal Welfare',
    tagline: 'Happy Animals, Wholesome Produce',
    description: 'Our Gir cows and Nati Kodi poultry roam freely on lush organic grasslands with open skies, sunlight, clean borewell water, and zero synthetic cages.',
    quote: '"Compassionate farming produces nutrition that heals the body and spirit."',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80',
    features: ['Pasture-Raised & 100% Free Foraging', 'Zero Preventive Antibiotics or Hormones', 'Fresh Ayurvedic Herb Fodder']
  },
  {
    id: 3,
    stageNumber: '03',
    title: 'WE HARVEST',
    subtitle: 'Hand-Picked at Peak Solar Nutrition',
    tagline: 'Nature’s Perfect Timing',
    description: 'We never harvest before time or force ripening with gas. Fruits, vegetables, and honey are collected at dawn when natural plant sugars and essential minerals peak.',
    quote: '"Plucked with reverence as the first rays of sun touch the leaves."',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80',
    features: ['Early Dawn Hand-Picking', 'Zero Post-Harvest Chemical Dips', 'Immediate Cold Room Temperature Stabilizing']
  },
  {
    id: 4,
    stageNumber: '04',
    title: 'WE DELIVER',
    subtitle: 'From Harvest to Your Doorstep in Hours',
    tagline: 'The Shortest Route from Field to Fork',
    description: 'Packed in eco-friendly biodegradable containers, glass bottles, and jute bags. Shipped in temperature-controlled logistics directly to your morning table.',
    quote: '"Freshness you can smell, taste, and feel in every bite."',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    features: ['Delivered Within 4–12 Hours of Harvest', 'Plastic-Free Insulated Cold Packaging', '100% Traceable Farm Batches']
  }
];

export const FARM_METRICS: FarmMetric[] = [
  {
    id: 1,
    value: 12,
    suffix: '+',
    label: 'Years of Natural Farming',
    description: 'Preserving ancient Indian regenerative agriculture'
  },
  {
    id: 2,
    value: 50,
    suffix: '+',
    label: 'Farm Fresh Products',
    description: 'Certified organic, pesticide-free & unadulterated'
  },
  {
    id: 3,
    value: 15000,
    suffix: '+',
    label: 'Happy Families Served',
    description: 'Across Hyderabad, Bengaluru, Chennai & Tier 1 hubs'
  },
  {
    id: 4,
    value: 100,
    suffix: '%',
    label: 'Purity & Traceability',
    description: 'Single-origin farm lots with complete transparency'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Ananya Reddy',
    location: 'Jubilee Hills, Hyderabad',
    rating: 5,
    comment: 'The difference in Garuda Farms country eggs and A2 Gir cow milk is night and day. The golden yolk has this deep rich flavor you simply cannot buy in standard supermarkets. My kids love the natural taste!',
    badge: 'Verified Farm Patron',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    productPurchased: 'Country Eggs & A2 Milk'
  },
  {
    id: 2,
    name: 'Chef Vikramaditya Rao',
    location: 'Indiranagar, Bengaluru',
    rating: 5,
    comment: 'As a culinary consultant, the texture of meat and authenticity of bilona ghee are crucial. Garuda Farms Nati Kodi and Grass-fed Mutton make the most aromatic traditional broths. Pure artisanal quality.',
    badge: 'Culinary Partner',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    productPurchased: 'Nati Kodi & A2 Bilona Ghee'
  },
  {
    id: 3,
    name: 'Meera & Rajesh Kulkarni',
    location: 'Gachibowli, Hyderabad',
    rating: 5,
    comment: 'We switched our entire pantry to Garuda Farms Sona Masoori, Ragi, and raw Forest Honey. Knowing that our food comes from pesticide-free, transparently managed local farms brings immense peace of mind.',
    badge: 'Monthly Subscriber',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    productPurchased: 'Pantry Staple Bundle'
  },
  {
    id: 4,
    name: 'Siddharth Menon',
    location: 'Adyar, Chennai',
    rating: 5,
    comment: 'Ordered the mutton pickle and raw honeycomb. The packaging in glass jars with sustainable insulation was impeccable. The honeycomb is liquid gold. Remarkable standard of execution.',
    badge: 'Gourmet Club Member',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    productPurchased: 'Raw Honeycomb & Mutton Pickle'
  }
];

export const SUSTAINABILITY_PILLARS = [
  {
    id: 1,
    title: 'Zero Chemical Run-off',
    desc: 'Strict biological pest control with marigolds, neem extracts, and bird perches prevents soil water contamination.',
    stat: '100% Non-Toxic'
  },
  {
    id: 2,
    title: 'Rainwater Harvesting',
    desc: '32 recharge lakes and step-wells on our farmlands capture 100% of annual monsoon deluge to recharge deep aquifers.',
    stat: '45M+ Liters Saved'
  },
  {
    id: 3,
    title: 'Solar Powered Cold Chain',
    desc: 'All micro-chill storage rooms at our packing centers run on decentralized 120kW rooftop solar microgrids.',
    stat: '85% Renewable Power'
  },
  {
    id: 4,
    title: 'Farmer Fair Trade',
    desc: 'We pay native agricultural workers and partner collectives 35% above Mandi MSP with healthcare and education support.',
    stat: '320+ Farming Families'
  }
];
