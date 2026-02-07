import api from './axios';

//register
export const registerUser = (data) => {
    return api.post("/register", data);
};

//login
export const loginUser = (data) => {
    return api.post("/login", data);
};

//verify registration (OTP / email verification)
export const verifyRegistration = (data) => {
    return api.post("/verify-registration", data);
};

//resend OTP
export const resendOtp = (data) => {
    return api.post("/resend-otp", data);
};

//forgot password - send reset OTP to email
export const forgetPassword = (data) => {
    return api.post("/forgot-password", data);
};

//reset password using OTP
export const resetPassword = (data) => {
    return api.post("/reset-password", data);
};

//get logged user (protected route)
export const getProfile = (token) => {
    return api.get("/profile", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};