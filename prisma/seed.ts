import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'SmartDine Restaurant',
      address: '123 Main Street, City Center',
      ownerName: 'John Smith',
      email: 'admin@smartdine.com',
      phone: '+91 98765 43210',
    }
  })

  console.log('Created restaurant:', restaurant.name)

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smartdine.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      restaurantId: restaurant.id,
    }
  })

  console.log('Created admin:', admin.email)

  // Create Tables with QR Codes
  const tables = []
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        tableNumber: `T${i.toString().padStart(2, '0')}`,
        qrCode: `table-${restaurant.id}-${i}`,
        capacity: i <= 4 ? 4 : i <= 7 ? 6 : 8,
      }
    })
    tables.push(table)
  }

  console.log(`Created ${tables.length} tables`)

  // Create Menu Items
  const menuItems = [
    // Starters
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 299, category: 'STARTERS', isVeg: true, preparationTime: 20 },
    { name: 'Chicken Tikka', description: 'Grilled chicken with tandoori spices', price: 399, category: 'STARTERS', isVeg: false, preparationTime: 25 },
    { name: 'Veg Spring Rolls', description: 'Crispy rolls with vegetable filling', price: 199, category: 'STARTERS', isVeg: true, preparationTime: 15 },
    { name: 'Fish Amritsari', description: 'Fried fish with Amritsari spices', price: 449, category: 'STARTERS', isVeg: false, preparationTime: 20 },
    
    // Main Course - Veg
    { name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato gravy', price: 349, category: 'MAIN_COURSE', isVeg: true, preparationTime: 25 },
    { name: 'Dal Makhani', description: 'Black lentils cooked overnight', price: 249, category: 'MAIN_COURSE', isVeg: true, preparationTime: 30 },
    { name: 'Vegetable Biryani', description: 'Fragrant rice with mixed vegetables', price: 299, category: 'RICE', isVeg: true, preparationTime: 35 },
    { name: 'Palak Paneer', description: 'Spinach and cottage cheese curry', price: 329, category: 'MAIN_COURSE', isVeg: true, preparationTime: 25 },
    
    // Main Course - Non Veg
    { name: 'Butter Chicken', description: 'Tandoori chicken in butter gravy', price: 499, category: 'MAIN_COURSE', isVeg: false, preparationTime: 30 },
    { name: 'Mutton Rogan Josh', description: 'Kashmiri style lamb curry', price: 599, category: 'MAIN_COURSE', isVeg: false, preparationTime: 40 },
    { name: 'Chicken Biryani', description: 'Hyderabadi style chicken biryani', price: 449, category: 'RICE', isVeg: false, preparationTime: 35 },
    { name: 'Fish Curry', description: 'Coastal style fish curry', price: 499, category: 'MAIN_COURSE', isVeg: false, preparationTime: 30 },
    
    // Breads
    { name: 'Butter Naan', description: 'Soft naan with butter', price: 49, category: 'BREADS', isVeg: true, preparationTime: 10 },
    { name: 'Garlic Naan', description: 'Naan topped with garlic', price: 59, category: 'BREADS', isVeg: true, preparationTime: 10 },
    { name: 'Tandoori Roti', description: 'Whole wheat tandoori bread', price: 39, category: 'BREADS', isVeg: true, preparationTime: 8 },
    { name: 'Stuffed Kulcha', description: 'Bread stuffed with potato', price: 69, category: 'BREADS', isVeg: true, preparationTime: 15 },
    
    // Drinks
    { name: 'Cold Coffee', description: 'Refreshing cold coffee with ice cream', price: 149, category: 'BEVERAGES', isVeg: true, preparationTime: 5 },
    { name: 'Fresh Lime Soda', description: 'Refreshing lime soda', price: 99, category: 'BEVERAGES', isVeg: true, preparationTime: 3 },
    { name: 'Mango Lassi', description: 'Sweet yogurt drink with mango', price: 129, category: 'BEVERAGES', isVeg: true, preparationTime: 5 },
    { name: 'Masala Chai', description: 'Indian spiced tea', price: 49, category: 'BEVERAGES', isVeg: true, preparationTime: 8 },
    
    // Desserts
    { name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', price: 99, category: 'DESSERTS', isVeg: true, preparationTime: 5 },
    { name: 'Rasmalai', description: 'Soft cheese patties in sweet milk', price: 129, category: 'DESSERTS', isVeg: true, preparationTime: 5 },
    { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 199, category: 'DESSERTS', isVeg: true, preparationTime: 5 },
    { name: 'Chocolate Brownie', description: 'Warm brownie with ice cream', price: 249, category: 'DESSERTS', isVeg: true, preparationTime: 10 },
    
    // Snacks
    { name: 'French Fries', description: 'Crispy potato fries', price: 149, category: 'SNACKS', isVeg: true, preparationTime: 10 },
    { name: 'Veg Burger', description: 'Vegetable patty burger', price: 199, category: 'SNACKS', isVeg: true, preparationTime: 12 },
    { name: 'Chicken Burger', description: 'Grilled chicken burger', price: 249, category: 'SNACKS', isVeg: false, preparationTime: 15 },
    { name: 'Pizza Margherita', description: 'Classic cheese pizza', price: 299, category: 'SNACKS', isVeg: true, preparationTime: 20 },
  ]

  const createdMenuItems = []
  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant.id,
      }
    })
    createdMenuItems.push(menuItem)
  }

  console.log(`Created ${createdMenuItems.length} menu items`)

  // Create Recommendations (Frequently bought together)
  const recommendations = [
    { baseItemId: createdMenuItems.find(i => i.name === 'Butter Chicken')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'Butter Naan')?.id!, confidence: 0.85, frequency: 120 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Butter Chicken')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'Jeera Rice')?.id!, confidence: 0.75, frequency: 95 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Paneer Butter Masala')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'Butter Naan')?.id!, confidence: 0.90, frequency: 150 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Veg Burger')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'French Fries')?.id!, confidence: 0.80, frequency: 110 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Chicken Burger')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'French Fries')?.id!, confidence: 0.82, frequency: 100 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Pizza Margherita')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'Cold Coffee')?.id!, confidence: 0.70, frequency: 85 },
    { baseItemId: createdMenuItems.find(i => i.name === 'Chicken Biryani')?.id!, recommendedItemId: createdMenuItems.find(i => i.name === 'Raita')?.id!, confidence: 0.88, frequency: 130 },
  ]

  for (const rec of recommendations) {
    if (rec.baseItemId && rec.recommendedItemId) {
      await prisma.recommendation.create({
        data: rec
      })
    }
  }

  console.log('Created recommendations')

  // Create some sample orders for analytics
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const orderDate = new Date(now)
    orderDate.setDate(orderDate.getDate() - i)
    
    const numOrders = Math.floor(Math.random() * 10) + 5
    
    for (let j = 0; j < numOrders; j++) {
      const table = tables[Math.floor(Math.random() * tables.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      
      let totalAmount = 0
      const orderItems = []
      
      for (let k = 0; k < numItems; k++) {
        const item = createdMenuItems[Math.floor(Math.random() * createdMenuItems.length)]
        const quantity = Math.floor(Math.random() * 2) + 1
        const subtotal = item.price * quantity
        totalAmount += subtotal
        
        orderItems.push({
          menuItemId: item.id,
          quantity,
          unitPrice: item.price,
          subtotal
        })
      }
      
      const order = await prisma.order.create({
        data: {
          tableId: table.id,
          restaurantId: restaurant.id,
          totalAmount,
          status: 'DELIVERED',
          paymentStatus: 'COMPLETED',
          createdAt: orderDate,
          orderItems: {
            create: orderItems
          }
        }
      })

      // Create payment
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: Math.random() > 0.5 ? 'UPI' : 'CASH',
          amount: totalAmount,
          status: 'COMPLETED',
          paidAt: orderDate,
        }
      })

      // Create feedback for some orders
      if (Math.random() > 0.3) {
        const rating = Math.floor(Math.random() * 3) + 3 // 3-5 rating
        const sentiments = ['POSITIVE', 'POSITIVE', 'POSITIVE', 'NEUTRAL', 'NEGATIVE']
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
        
        await prisma.feedback.create({
          data: {
            orderId: order.id,
            restaurantId: restaurant.id,
            rating,
            review: rating >= 4 ? 'Great food and service!' : rating === 3 ? 'Good experience' : 'Could be better',
            sentiment,
            createdAt: orderDate,
          }
        })
      }
    }
  }

  console.log('Created sample orders and feedback')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
