const env = import.meta.env;

export const siteConfig = {
  supportEmail: env.VITE_SUPPORT_EMAIL || "nexl6911@gmail.com",
  supportPhone: env.VITE_SUPPORT_PHONE || "+977 00000000",
  supportAddress: env.VITE_SUPPORT_ADDRESS || "Itahari, Nepal",
  brandEmail: env.VITE_BRAND_EMAIL || "nexl6911@gmail.com",
  brandPhone: env.VITE_BRAND_PHONE || "+977 9702634469",
  brandAddress: env.VITE_BRAND_ADDRESS || "Itahari, Sunsari, Nepal",
  frontendUrl: env.VITE_FRONTEND_URL || "http://localhost:5173",
  backendUrl: env.VITE_BACKEND_URL || "http://localhost:3000",
};
