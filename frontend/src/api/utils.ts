/**
 * API Utility Functions
 * Centralized backend URL configuration for all API interactions
 */

/**
 * Get the backend base URL (without /api suffix)
 * Used for constructing full URLs to backend resources (e.g., local storage images)
 * 
 * @returns Backend base URL (e.g., "http://localhost:5000" or "https://backend.railway.app")
 */
export const getBackendBaseUrl = (): string => {
  // If VITE_BACKEND_URL is explicitly set, use it (remove /api if present)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/api$/, "");
  }
  
  // Otherwise, use environment-based defaults
  if (import.meta.env.MODE === "production") {
    // Production backend URL (Railway)
    return "https://rentease-production-1e1b.up.railway.app";
  }
  
  // Development backend URL
  return "http://localhost:5000";
};

/**
 * Get the full backend URL for local storage images
 * Prepends backend base URL to the image path
 * 
 * @param imagePath - Image path from backend (e.g., "/local-images/avatars/uuid.jpg")
 * @returns Full URL to the image
 */
export const getLocalImageUrl = (imagePath: string): string => {
  // In development, prepend backend URL to make it accessible
  if (import.meta.env.MODE === "development") {
    const backendUrl = getBackendBaseUrl();
    return `${backendUrl}${imagePath}`;
  }
  
  // In production with local storage, return as-is (backend should handle full URL)
  return imagePath;
};

/**
 * Process any image URL - converts local storage paths to full URLs if needed
 * Use this for all image URLs from API responses to ensure they work on network
 * 
 * @param imageUrl - Image URL from API (could be "/local-images/..." or full URL)
 * @returns Processed image URL that works in current environment
 */
export const processImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // If it's already a full URL (http/https), check if it contains localhost
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // If it contains localhost and we have VITE_BACKEND_URL set, replace localhost with network IP
    if (imageUrl.includes('localhost') && import.meta.env.VITE_BACKEND_URL) {
      const backendBaseUrl = getBackendBaseUrl();
      // Replace localhost:port with the network IP from VITE_BACKEND_URL
      const urlObj = new URL(imageUrl);
      const newUrl = imageUrl.replace(urlObj.origin, backendBaseUrl);
      return newUrl;
    }
    return imageUrl;
  }
  
  // If it's a local storage path (starts with /local-images/), convert it
  if (imageUrl.startsWith('/local-images/')) {
    return getLocalImageUrl(imageUrl);
  }
  
  // If it's a local storage path without leading slash (local-images/...), add slash and convert
  if (imageUrl.startsWith('local-images/')) {
    return getLocalImageUrl(`/${imageUrl}`);
  }
  
  // If it's a relative path starting with /, it might be a local image - try to process it
  if (imageUrl.startsWith('/') && import.meta.env.MODE === "development") {
    // Check if it looks like an image path that should be served from backend
    const backendUrl = getBackendBaseUrl();
    return `${backendUrl}${imageUrl}`;
  }
  
  // Otherwise return as-is (might be a relative path or Supabase URL)
  return imageUrl;
};

