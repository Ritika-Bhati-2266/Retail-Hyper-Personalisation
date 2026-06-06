export const synonyms = {
  "watch": ["smartwatch", "wearable", "timepiece"],
  "shoes": ["sneakers", "footwear", "boots", "trainers"],
  "coat": ["jacket", "outerwear", "parka", "overcoat"],
  "shirt": ["t-shirt", "top", "blouse", "tee"],
  "pants": ["trousers", "jeans", "leggings", "slacks"],
  "computer": ["laptop", "desktop", "macbook", "pc"],
  "phone": ["smartphone", "iphone", "android", "mobile"],
  "fitness": ["workout", "gym", "exercise", "training"],
  "electronics": ["gadgets", "tech", "devices"],
  "fashion": ["clothing", "apparel", "style"]
};

export const expandQuery = (query) => {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);
  
  words.forEach(word => {
    if (synonyms[word]) {
      synonyms[word].forEach(syn => expanded.add(syn));
    }
    // Check if any synonym key is contained in the word or vice versa for better matching
    Object.keys(synonyms).forEach(key => {
      if (word.includes(key) || key.includes(word)) {
        synonyms[key].forEach(syn => expanded.add(syn));
      }
    });
  });
  
  return Array.from(expanded).join(' ');
};
