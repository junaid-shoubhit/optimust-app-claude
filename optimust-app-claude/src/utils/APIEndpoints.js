export const API = import.meta.env.VITE_API_OPTIMUST_URL || "https://optimust.app/app_api/api/";
export const DM_API = import.meta.env.VITE_API_OPTIMUST_DM_API_URL
export const DM_URL = import.meta.env.VITE_API_OPTIMUST_DM_URL
export const ENDPOINTS = {
    LOGIN: "user/login",
    VERIFY_OTP: "user/loginTfa",
    RESET_PASSWORD: "user/resetPassword",
    RESEND_CODE: "user/resendCode",
    FIRM_CHANGE: "user/firmChange",
};