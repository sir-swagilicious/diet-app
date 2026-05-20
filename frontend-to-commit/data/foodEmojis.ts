/**
 * Food emojis for recipe cards.
 * Used when creating a new recipe — pick one to set the card icon.
 */
export const DEFAULT_FOOD_EMOJI = "🍽";

export const FOOD_EMOJIS = [
  { emoji: "🍽", label: "Plate" },
  { emoji: "🥗", label: "Salad" },
  { emoji: "🍝", label: "Pasta" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🍲", label: "Soup" },
  { emoji: "🥘", label: "Stew" },
  { emoji: "🍛", label: "Curry" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🌮", label: "Tacos" },
  { emoji: "🌯", label: "Wrap" },
  { emoji: "🍔", label: "Burger" },
  { emoji: "🥪", label: "Sandwich" },
  { emoji: "🍳", label: "Breakfast" },
  { emoji: "🥞", label: "Pancakes" },
  { emoji: "🥣", label: "Bowl" },
  { emoji: "🐟", label: "Fish" },
  { emoji: "🍤", label: "Seafood" },
  { emoji: "🍗", label: "Chicken" },
  { emoji: "🥩", label: "Meat" },
  { emoji: "🥓", label: "Bacon" },
  { emoji: "🧆", label: "Falafel" },
  { emoji: "🥙", label: "Kebab" },
  { emoji: "🍱", label: "Bento" },
  { emoji: "🍣", label: "Sushi" },
  { emoji: "🥟", label: "Dumplings" },
  { emoji: "🧁", label: "Dessert" },
  { emoji: "🍰", label: "Cake" },
  { emoji: "🥧", label: "Pie" },
  { emoji: "🍪", label: "Cookie" },
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🥦", label: "Broccoli" },
  { emoji: "🌽", label: "Corn" },
  { emoji: "🍅", label: "Tomato" },
  { emoji: "🥕", label: "Carrot" },
  { emoji: "🍄", label: "Mushroom" },
  { emoji: "🧀", label: "Cheese" },
  { emoji: "🥚", label: "Eggs" },
  { emoji: "🍞", label: "Bread" },
  { emoji: "🥐", label: "Croissant" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🧃", label: "Drink" },
] as const;

export type FoodEmoji = (typeof FOOD_EMOJIS)[number]["emoji"];
