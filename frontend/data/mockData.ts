export const todayStats = [
  {
    title: "Daily Calories",
    value: "1150 / 2000",
    note: "",
    progress: 58,
    color: "black",
    icon: "◎",
  },
  {
    title: "Protein",
    value: "98g / 150g",
    note: "",
    progress: 65,
    color: "green",
    icon: "↗",
  },
  {
    title: "Meals Planned",
    value: "3 / 3",
    note: "Today's meals ready",
    progress: 100,
    color: "orange",
    icon: "▣",
  },
  {
    title: "Avg Cook Time",
    value: "25 min",
    note: "Per meal",
    progress: 0,
    color: "orange",
    icon: "◷",
  },
];

export const todayMeals = [
  {
    mealType: "Breakfast",
    time: "8:00 AM",
    icon: "🥣",
    name: "Greek Yogurt Parfait",
    calories: "320 cal",
    cookTime: "5 min",
    tags: ["Breakfast", "Healthy"],
  },
  {
    mealType: "Lunch",
    time: "12:30 PM",
    icon: "🥗",
    name: "Grilled Chicken Salad",
    calories: "380 cal",
    cookTime: "25 min",
    tags: ["Healthy", "High Protein"],
  },
  {
    mealType: "Dinner",
    time: "7:00 PM",
    icon: "🐟",
    name: "Salmon with Roasted Vegetables",
    calories: "450 cal",
    cookTime: "35 min",
    tags: ["Healthy", "High Protein"],
  },
];

export const weekPlan = [
  {
    date: "Tue, May 12",
    breakfast: "Greek Yogurt Parfait",
    lunch: "Grilled Chicken Salad",
    dinner: "Salmon with Roasted Vegetables",
    calories: 1150,
  },
  {
    date: "Wed, May 13",
    breakfast: "Greek Yogurt Parfait",
    lunch: "Vegetable Stir Fry",
    dinner: "Chicken Tacos",
    calories: 1020,
  },
  {
    date: "Thu, May 14",
    breakfast: "Greek Yogurt Parfait",
    lunch: "Chicken Tacos",
    dinner: "Spaghetti Carbonara",
    calories: 1260,
  },
  {
    date: "Fri, May 15",
    breakfast: "Greek Yogurt Parfait",
    lunch: "Grilled Chicken Salad",
    dinner: "Vegetable Stir Fry",
    calories: 980,
  },
  {
    date: "Sat, May 16",
    breakfast: "Greek Yogurt Parfait",
    lunch: "Salmon with Roasted Vegetables",
    dinner: "Spaghetti Carbonara",
    calories: 1290,
  },
];

export const expiringSoon = [
  {
    name: "Mixed greens",
    expires: "Expires in 2 days",
    icon: "⚠",
  },
  {
    name: "Salmon fillets",
    expires: "Expires in 2 days",
    icon: "⚠",
  },
  {
    name: "Milk",
    expires: "Expires in 4 days",
    icon: "⏰",
  },
];
export const recipes = [
  {
    icon: "🥗",
    title: "Grilled Chicken Salad",
    time: "25 min",
    calories: "380 cal",
    tags: ["Healthy", "High Protein", "Low Carb"],
  },
  {
    icon: "🍝",
    title: "Spaghetti Carbonara",
    time: "20 min",
    calories: "520 cal",
    tags: ["Quick", "Comfort Food", "Italian"],
  },
  {
    icon: "🥘",
    title: "Vegetable Stir Fry",
    time: "15 min",
    calories: "280 cal",
    tags: ["Vegan", "Quick", "Healthy"],
  },
  {
    icon: "🐟",
    title: "Salmon with Roasted Vegetables",
    time: "35 min",
    calories: "450 cal",
    tags: ["Healthy", "High Protein", "Omega-3"],
  },
  {
    icon: "🌮",
    title: "Chicken Tacos",
    time: "30 min",
    calories: "420 cal",
    tags: ["Mexican", "Family Favorite", "Quick"],
  },
  {
    icon: "🥣",
    title: "Greek Yogurt Parfait",
    time: "5 min",
    calories: "320 cal",
    tags: ["Breakfast", "Healthy", "Quick"],
  },
];

export const fridgeGroups = [
  {
    category: "Protein",
    items: [
      {
        name: "Chicken breast",
        quantity: "4 pieces",
        expiry: "May 15, 2026",
        status: "3 days left",
        danger: true,
      },
      {
        name: "Eggs",
        quantity: "12 pieces",
        expiry: "May 20, 2026",
        status: "Fresh",
        danger: false,
      },
      {
        name: "Salmon",
        quantity: "2 fillets",
        expiry: "May 14, 2026",
        status: "2 days left",
        danger: true,
      },
    ],
  },
  {
    category: "Vegetables",
    items: [
      {
        name: "Mixed greens",
        quantity: "1 bag",
        expiry: "May 14, 2026",
        status: "2 days left",
        danger: true,
      },
      {
        name: "Tomatoes",
        quantity: "6 pieces",
        expiry: "May 18, 2026",
        status: "Fresh",
        danger: false,
      },
      {
        name: "Broccoli",
        quantity: "2 heads",
        expiry: "May 17, 2026",
        status: "Fresh",
        danger: false,
      },
      {
        name: "Bell peppers",
        quantity: "3 pieces",
        expiry: "May 19, 2026",
        status: "Fresh",
        danger: false,
      },
    ],
  },
  {
    category: "Dairy",
    items: [
      {
        name: "Milk",
        quantity: "1 liter",
        expiry: "May 16, 2026",
        status: "Fresh",
        danger: false,
      },
      {
        name: "Cheese",
        quantity: "300 g",
        expiry: "May 25, 2026",
        status: "Fresh",
        danger: false,
      },
      {
        name: "Yogurt",
        quantity: "4 cups",
        expiry: "May 22, 2026",
        status: "Fresh",
        danger: false,
      },
    ],
  },
];

export const fridgeSuggestions = [
  {
    icon: "🥗",
    title: "Grilled Chicken Salad",
    subtitle: "100% ingredients available",
  },
  {
    icon: "🐟",
    title: "Salmon with Roasted Vegetables",
    subtitle: "90% ingredients available",
  },
  {
    icon: "🥘",
    title: "Vegetable Stir Fry",
    subtitle: "85% ingredients available",
  },
];

export const shoppingGroups = [
  {
    category: "Pantry",
    items: [
      { name: "Spaghetti", amount: "1 pack", priority: "high" },
      { name: "Tortillas", amount: "1 pack", priority: "medium" },
      { name: "Granola", amount: "1 box", priority: "medium" },
    ],
  },
  {
    category: "Protein",
    items: [
      { name: "Bacon", amount: "200 g", priority: "high" },
      { name: "Tofu", amount: "400 g", priority: "medium" },
    ],
  },
  {
    category: "Dairy",
    items: [{ name: "Parmesan cheese", amount: "100 g", priority: "high" }],
  },
  {
    category: "Produce",
    items: [
      { name: "Avocado", amount: "3 pieces", priority: "medium" },
      { name: "Brussels sprouts", amount: "2 cups", priority: "low" },
      { name: "Sweet potato", amount: "2 pieces", priority: "low" },
    ],
  },
  {
    category: "Herbs",
    items: [{ name: "Fresh dill", amount: "1 bunch", priority: "low" }],
  },
];

export const nutritionStats = [
  {
    title: "Calories Today",
    value: "1290 / 2000",
    subtitle: "750 remaining",
    progress: 65,
    color: "black",
  },
  {
    title: "Protein",
    value: "102g / 150g",
    subtitle: "68% of goal",
    progress: 68,
    color: "green",
  },
  {
    title: "Carbs",
    value: "128g / 225g",
    subtitle: "57% of goal",
    progress: 57,
    color: "orange",
  },
  {
    title: "Fat",
    value: "38g / 67g",
    subtitle: "57% of goal",
    progress: 57,
    color: "orange",
  },
];

export const weeklyCalories = [
  { day: "Mon", value: 1850 },
  { day: "Tue", value: 2100 },
  { day: "Wed", value: 1920 },
  { day: "Thu", value: 2050 },
  { day: "Fri", value: 1820 },
  { day: "Sat", value: 2200 },
  { day: "Sun", value: 1910 },
];

export const nutritionInsights = [
  {
    icon: "💪",
    title: "Great protein intake!",
    text: "You're averaging 98g of protein per day, which is excellent for your goals.",
  },
  {
    icon: "🥗",
    title: "Consider adding more vegetables",
    text: "Try to include at least 5 servings of vegetables daily for optimal nutrition and fiber.",
  },
  {
    icon: "💧",
    title: "Stay hydrated",
    text: "Do not forget to drink enough water throughout the day to support your nutrition goals.",
  },
];