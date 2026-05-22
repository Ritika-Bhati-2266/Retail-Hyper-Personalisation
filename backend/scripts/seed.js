import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.js';
import { Product } from '../models/product.js';
import { Offer } from '../models/offer.js';
import { BehaviorLog } from '../models/behavior.js';
import { UserPreferenceProfile } from '../models/preference.js';

const seed = async () => {
  console.log('Seeder Script Initializing...');
  await connectDB();

  try {
    // 1. Clean Database
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Offer.deleteMany({});
    await BehaviorLog.deleteMany({});
    await UserPreferenceProfile.deleteMany({});

    console.log('Collections successfully cleared.');

    // 2. Seed Users
    console.log('Seeding administrative and customer accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const customerPasswordHash = await bcrypt.hash('customer123', salt);

    const admin = await User.create({
      username: 'Retail Admin',
      email: 'admin@retail.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    });

    const customer = await User.create({
      username: 'Alex Carter',
      email: 'customer@retail.com',
      passwordHash: customerPasswordHash,
      role: 'customer'
    });

    console.log('Accounts created:');
    console.log(' - Admin: admin@retail.com / admin123');
    console.log(' - Customer: customer@retail.com / customer123');

    // 3. Seed Products
    console.log('Seeding products catalog...');
    const productsData = [
      // Electronics
      {
        name: 'Quantum Sound Wireless Headphones',
        description: 'Noise-cancelling over-ear smart headphones with premium acoustic feedback and 40h battery runtime.',
        price: 199.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
        tags: ['audio', 'wireless', 'headphones', 'premium', 'tech'],
        discountPercent: 15,
        stock: 25
      },
      {
        name: 'AeroGlide Pro Smartwatch',
        description: 'Vibrant AMOLED fitness tracker with heart monitoring, integrated GPS, and sleep analysis metrics.',
        price: 249.50,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        tags: ['wearable', 'smartwatch', 'fitness', 'tech', 'gadget'],
        discountPercent: 10,
        stock: 18
      },
      {
        name: 'OmniView 4K Ultra Short Throw Projector',
        description: 'Cinematic 2500 ANSI Lumens projector capable of displaying up to 120-inch displays natively.',
        price: 899.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60',
        tags: ['cinema', 'projector', '4k', 'media', 'home-theater'],
        discountPercent: 5,
        stock: 8
      },

      // Fashion / Apparel
      {
        name: 'Urban Knit Breathable Running Shoes',
        description: 'Ultralight dual-density responsive athletic running shoes crafted from recycled oceanic plastics.',
        price: 120.00,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
        tags: ['shoes', 'sneakers', 'activewear', 'fashion', 'runners'],
        discountPercent: 20,
        stock: 30
      },
      {
        name: 'Minimalist Camel Wool Trench Coat',
        description: 'Sartorial luxury camel hair wool blend trench coat tailored for cold winter weather.',
        price: 280.00,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60',
        tags: ['jacket', 'coat', 'wool', 'winter', 'luxury'],
        discountPercent: 0,
        stock: 12
      },
      {
        name: 'Polaroid Retro Acetate Sunglasses',
        description: 'Classic tortoiseshell frames paired with high performance UV400 polarised lenses.',
        price: 65.00,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
        tags: ['accessories', 'sunglasses', 'summer', 'vintage', 'retro'],
        discountPercent: 15,
        stock: 50
      },

      // Fitness / Outdoors
      {
        name: 'Apex Grip Anti-Slip Yoga Mat',
        description: 'Dense natural rubber 6mm cushioning workout mat ensuring perfect grip during hot yoga sessions.',
        price: 75.00,
        category: 'Fitness',
        image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=60',
        tags: ['yoga', 'mat', 'pilates', 'home-gym', 'fitness'],
        discountPercent: 10,
        stock: 40
      },
      {
        name: 'HexCast Solid Cast Iron Dumbbells (Pair - 15lbs)',
        description: 'Ergonomic knurled chrome handles encased in thick noise-reducing hexagonal rubber bounds.',
        price: 55.00,
        category: 'Fitness',
        image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&auto=format&fit=crop&q=60',
        tags: ['weights', 'dumbbell', 'strength', 'home-gym'],
        discountPercent: 25,
        stock: 15
      },

      // Home Decor
      {
        name: 'AromaSphere Ultrasonic Oil Diffuser',
        description: 'Minimalist ceramic misting diffuser with dynamic warm LED mood lighting profiles.',
        price: 45.00,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
        tags: ['aromatherapy', 'diffuser', 'home-decor', 'candles'],
        discountPercent: 30,
        stock: 35
      },
      {
        name: 'Handwoven Nordic Rattan Lounge Chair',
        description: 'Comfortable accent lounge chair featuring natural peeled cane weave and black iron legs.',
        price: 320.00,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=60',
        tags: ['furniture', 'chair', 'nordic', 'decor', 'rattan'],
        discountPercent: 0,
        stock: 7
      }
    ];

    const seededProducts = await Product.create(productsData);
    console.log(`Successfully seeded ${seededProducts.length} products.`);

    // 4. Seed Dynamic Targeted Offers
    console.log('Seeding targeted marketing offers...');
    const offersData = [
      {
        title: 'Tech Upgrade Voucher',
        description: 'Save 15% off any item in our premium Electronics catalog. Perfect for upgrading your home workspace.',
        discountCode: 'TECH15',
        targetSegment: 'electronics_lovers',
        bannerImage: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1000&auto=format&fit=crop&q=80',
        active: true
      },
      {
        title: 'Style Renewal Event',
        description: 'Revamp your wardrobe! Save 20% off all apparel and activewear shoes this weekend.',
        discountCode: 'STYLE20',
        targetSegment: 'fashion_lovers',
        bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
        active: true
      },
      {
        title: 'Flash Bargain Extravaganza',
        description: 'Super Deal! Take an extra 25% off already discounted products. Stackable with existing markdowns.',
        discountCode: 'SUPERSTEAL',
        targetSegment: 'bargain_hunters',
        bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop&q=80',
        active: true
      },
      {
        title: 'New Customer Starter Kit',
        description: 'Welcome to PersonalShop! Get $10 store credit and 10% off your initial purchase.',
        discountCode: 'WELCOME10',
        targetSegment: 'new_users',
        bannerImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=80',
        active: true
      },
      {
        title: 'Weekly Storewide Savings',
        description: 'Get an extra 5% off everything on the website. No exclusions apply.',
        discountCode: 'SAVE5',
        targetSegment: 'all',
        bannerImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1000&auto=format&fit=crop&q=80',
        active: true
      }
    ];

    const seededOffers = await Offer.create(offersData);
    console.log(`Successfully seeded ${seededOffers.length} promo offers.`);

    console.log('Seeder Script Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal Error during database seed:', error);
    process.exit(1);
  }
};

seed();
