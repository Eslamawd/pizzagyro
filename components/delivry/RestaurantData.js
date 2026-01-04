export const RESTAURANT_DATA = {
  name: "Pizza & Gyro Party",
  menus: [
    {
      id: "m1",
      name: "Specialty Pizza",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070",
      categories: [
        {
          id: "p-cat-1",
          name: "Original Pizzas",
          items: [
            {
              id: "p1",
              name: "Party Pizza",
              description: "Pepperoni, Sausage, Mushroom, Green Pepper, Onion",
              image:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981",
              prices: { S: 13.99, M: 16.99, L: 20.99, XL: 25.99 },
            },
            {
              id: "p2",
              name: "Meat Lovers",
              description: "Pepperoni, Sausage, Beef, Ham, Bacon",
              image:
                "https://images.unsplash.com/photo-1593246049226-ded77bf90326?q=80&w=1935",
              prices: { S: 13.99, M: 16.99, L: 20.99, XL: 25.99 },
            },
            {
              id: "p3",
              name: "Veggie Pizza",
              description:
                "Mushroom, Green Pepper, Onion, Black Olives, Tomato",
              image:
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=1920",
              prices: { S: 13.99, M: 16.99, L: 20.99, XL: 25.99 },
            },
            {
              id: "p4",
              name: "Margherita",
              description: "Fresh Tomato, Basil, Olive Oil, Mozzarella",
              image:
                "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=2070",
              prices: { S: 12.99, M: 14.99, L: 17.99, XL: 22.99 },
            },
          ],
        },
        {
          id: "p-cat-2",
          name: "Gourmet Pizzas",
          items: [
            {
              id: "p5",
              name: "BBQ Chicken",
              description: "Grilled Chicken, Red Onion, BBQ Sauce",
              image:
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070",
              prices: { S: 14.99, M: 17.99, L: 21.99, XL: 26.99 },
            },
            {
              id: "p6",
              name: "Hawaiian",
              description: "Ham, Pineapple, Extra Cheese",
              image:
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070",
              prices: { S: 13.99, M: 16.99, L: 20.99, XL: 25.99 },
            },
            {
              id: "p7",
              name: "Buffalo Chicken",
              description: "Spicy Buffalo Chicken, Ranch Dressing",
              image:
                "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=1974",
              prices: { S: 14.99, M: 17.99, L: 21.99, XL: 26.99 },
            },
          ],
        },
      ],
    },
    {
      id: "m2",
      name: "Gyro & Plates",
      image:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=2076",
      categories: [
        {
          id: "g-cat-1",
          name: "Gyros",
          items: [
            {
              id: "g1",
              name: "Gyro Sandwich",
              description: "Beef/Lamb or Chicken with Tzatziki, Tomato, Onion",
              image:
                "https://images.unsplash.com/photo-1591193833165-1d2d230b50e2?q=80&w=1935",
              price: 7.75,
            },
            {
              id: "g2",
              name: "Gyro Plate",
              description: "Served with rice, salad, and pita bread",
              image:
                "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=2076",
              price: 11.99,
            },
            {
              id: "g3",
              name: "Loaded Gyro Fries",
              description: "Fries topped with gyro meat and white sauce",
              image:
                "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070",
              price: 11.99,
            },
          ],
        },
        {
          id: "g-cat-2",
          name: "Platters",
          items: [
            {
              id: "g4",
              name: "Chicken Platter",
              description: "Grilled Chicken with two sides",
              image:
                "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=1935",
              price: 12.99,
            },
            {
              id: "g5",
              name: "Mixed Grill Platter",
              description: "Gyro, Chicken, and Lamb served with rice",
              image:
                "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1935",
              price: 15.99,
            },
          ],
        },
      ],
    },
    {
      id: "m3",
      name: "Calzones",
      image:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1760",
      categories: [
        {
          id: "c-cat-1",
          name: "Baked Calzones",
          items: [
            {
              id: "cz1",
              name: "Cheese Calzone",
              description: "Ricotta, Mozzarella, Parmesan",
              image:
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1760",
              prices: { S: 12.99, M: 14.99, L: 17.99, XL: 22.99 },
            },
            {
              id: "cz2",
              name: "Spinach Calzone",
              description: "Fresh Spinach, Ricotta, Mozzarella",
              image:
                "https://images.unsplash.com/photo-1593246049226-ded77bf90326?q=80&w=1935",
              prices: { S: 12.99, M: 14.99, L: 17.99, XL: 22.99 },
            },
            {
              id: "cz3",
              name: "Meat Lovers Calzone",
              description: "Pepperoni, Sausage, Ham, Beef",
              image:
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981",
              prices: { S: 14.99, M: 16.99, L: 19.99, XL: 24.99 },
            },
          ],
        },
      ],
    },
    {
      id: "m4",
      name: "Wings & Sides",
      image:
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1980",
      categories: [
        {
          id: "s-cat-1",
          name: "Wings",
          items: [
            {
              id: "w1",
              name: "6 Pieces Wings",
              description: "Choice of Buffalo, BBQ, or Lemon Pepper",
              image:
                "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1980",
              price: 8.99,
            },
            {
              id: "w2",
              name: "12 Pieces Wings",
              description: "Choice of Buffalo, BBQ, or Lemon Pepper",
              image:
                "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069",
              price: 15.99,
            },
            {
              id: "w3",
              name: "24 Pieces Wings",
              description: "Perfect for parties, choice of sauce",
              image:
                "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1964",
              price: 28.99,
            },
          ],
        },
        {
          id: "s-cat-2",
          name: "Sides & Appetizers",
          items: [
            {
              id: "sd1",
              name: "French Fries",
              price: 3.99,
              image:
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1974",
            },
            {
              id: "sd2",
              name: "Hummus with Pita",
              price: 5.99,
              image:
                "https://images.unsplash.com/photo-1626645738675-4c5d46b6a13e?q=80&w=2070",
            },
            {
              id: "sd3",
              name: "Mozzarella Sticks",
              price: 6.99,
              image:
                "https://images.unsplash.com/photo-1563379091339-03246963d9d6?q=80&w=2070",
            },
            {
              id: "sd4",
              name: "Garlic Bread",
              price: 4.99,
              image:
                "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=2070",
            },
            {
              id: "sd5",
              name: "Greek Salad",
              price: 7.99,
              image:
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1984",
            },
          ],
        },
      ],
    },
    {
      id: "m5",
      name: "Drinks & Desserts",
      image:
        "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=1974",
      categories: [
        {
          id: "d-cat-1",
          name: "Beverages",
          items: [
            {
              id: "dr1",
              name: "Coca-Cola",
              price: 1.99,
              image:
                "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=2065",
            },
            {
              id: "dr2",
              name: "Sprite",
              price: 1.99,
              image:
                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070",
            },
            {
              id: "dr3",
              name: "Fanta",
              price: 1.99,
              image:
                "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=1974",
            },
            {
              id: "dr4",
              name: "Bottled Water",
              price: 0.99,
              image:
                "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1974",
            },
          ],
        },
        {
          id: "d-cat-2",
          name: "Desserts",
          items: [
            {
              id: "ds1",
              name: "Baklava",
              price: 3.99,
              image:
                "https://images.unsplash.com/photo-1562504205-f4d0442c6fa4?q=80&w=1974",
            },
            {
              id: "ds2",
              name: "Cheesecake",
              price: 5.99,
              image:
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1974",
            },
            {
              id: "ds3",
              name: "Tiramisu",
              price: 4.99,
              image:
                "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1974",
            },
          ],
        },
      ],
    },
  ],
};
