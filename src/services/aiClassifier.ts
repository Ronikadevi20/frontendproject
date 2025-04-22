
import { toast } from "sonner";

// Predefined password categories
export const passwordCategories = [
  { id: "social", name: "Social Media", icon: "instagram", color: "#E1306C" },
  { id: "finance", name: "Finance & Banking", icon: "credit-card", color: "#0070BA" },
  { id: "work", name: "Work & Career", icon: "briefcase", color: "#2C3E50" },
  { id: "media", name: "Entertainment & Media", icon: "tv", color: "#E50914" },
  { id: "shopping", name: "Shopping", icon: "shopping-bag", color: "#FF9900" },
  { id: "bills", name: "Bills & Utilities", icon: "file-text", color: "#26ae60" },
  { id: "education", name: "Education", icon: "book", color: "#9B59B6" },
  { id: "health", name: "Health & Medical", icon: "activity", color: "#E74C3C" },
  { id: "travel", name: "Travel", icon: "map", color: "#3498DB" },
  { id: "other", name: "Other", icon: "more-horizontal", color: "#7F8C8D" }
];

// Simple rule-based classifier (in a real app, this would use an actual AI service)
export const classifyPassword = (website: string, url?: string): string => {
  // Convert to lowercase for case-insensitive matching
  const websiteLower = website.toLowerCase();
  const urlLower = url?.toLowerCase() || '';

  // Social media
  if (
    websiteLower.includes('facebook') || 
    websiteLower.includes('instagram') || 
    websiteLower.includes('twitter') || 
    websiteLower.includes('tiktok') ||
    websiteLower.includes('snapchat') ||
    websiteLower.includes('linkedin') ||
    websiteLower.includes('pinterest') ||
    urlLower.includes('facebook.com') || 
    urlLower.includes('instagram.com') || 
    urlLower.includes('twitter.com') || 
    urlLower.includes('tiktok.com')
  ) {
    return 'social';
  }
  
  // Finance & Banking
  if (
    websiteLower.includes('bank') || 
    websiteLower.includes('chase') || 
    websiteLower.includes('paypal') || 
    websiteLower.includes('venmo') ||
    websiteLower.includes('credit') ||
    websiteLower.includes('loan') ||
    websiteLower.includes('invest') ||
    websiteLower.includes('finance')
  ) {
    return 'finance';
  }
  
  // Work & Career
  if (
    websiteLower.includes('work') || 
    websiteLower.includes('office') || 
    websiteLower.includes('slack') || 
    websiteLower.includes('zoom') ||
    websiteLower.includes('jira') ||
    websiteLower.includes('asana') ||
    websiteLower.includes('trello') ||
    websiteLower.includes('indeed') ||
    websiteLower.includes('glassdoor') ||
    websiteLower.includes('job')
  ) {
    return 'work';
  }

  // Media & Entertainment
  if (
    websiteLower.includes('netflix') || 
    websiteLower.includes('hulu') || 
    websiteLower.includes('disney') || 
    websiteLower.includes('spotify') ||
    websiteLower.includes('youtube') ||
    websiteLower.includes('prime') ||
    websiteLower.includes('hbo') ||
    websiteLower.includes('music') ||
    websiteLower.includes('movie')
  ) {
    return 'media';
  }
  
  // Shopping
  if (
    websiteLower.includes('amazon') || 
    websiteLower.includes('ebay') || 
    websiteLower.includes('walmart') || 
    websiteLower.includes('target') ||
    websiteLower.includes('shop') ||
    websiteLower.includes('etsy') ||
    websiteLower.includes('best buy')
  ) {
    return 'shopping';
  }
  
  // Bills & Utilities
  if (
    websiteLower.includes('bill') || 
    websiteLower.includes('utility') || 
    websiteLower.includes('electric') || 
    websiteLower.includes('water') ||
    websiteLower.includes('gas') ||
    websiteLower.includes('phone') ||
    websiteLower.includes('internet') ||
    websiteLower.includes('broadband') ||
    websiteLower.includes('payment')
  ) {
    return 'bills';
  }
  
  // Default to "other"
  return 'other';
};

// Function to get category details by ID
export const getCategoryById = (categoryId: string) => {
  return passwordCategories.find(cat => cat.id === categoryId) || passwordCategories[9]; // Default to 'other'
};

// Mock AI analysis function - in real implementation, this would call an AI service
export const analyzePasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  suggestions: string[];
} => {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
  const length = password.length;
  
  const suggestions: string[] = [];
  let score = 0;
  
  if (length < 8) {
    suggestions.push('Use at least 8 characters');
  } else {
    score += 1;
  }
  
  if (!hasLowercase) {
    suggestions.push('Add lowercase letters');
  } else {
    score += 1;
  }
  
  if (!hasUppercase) {
    suggestions.push('Add uppercase letters');
  } else {
    score += 1;
  }
  
  if (!hasNumbers) {
    suggestions.push('Add numbers');
  } else {
    score += 1;
  }
  
  if (!hasSpecialChars) {
    suggestions.push('Add special characters');
  } else {
    score += 1;
  }
  
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score === 3) {
    strength = 'medium';
  } else if (score === 4) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }
  
  return { strength, score, suggestions };
};

export const analyzeWebsiteWithAI = async (website: string, url?: string): Promise<string> => {
  // This would typically be an API call to an AI service
  // For now, we'll use our rule-based classifier
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return classifyPassword(website, url);
  } catch (error) {
    toast.error("Failed to analyze website");
    console.error("AI analysis failed:", error);
    return "other";
  }
};
