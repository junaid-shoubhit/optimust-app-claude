import { jwtDecode } from "jwt-decode";


export const useAuthenticate = () => {
    const token = localStorage.getItem('token') || null;
    if (!token) {
        return false;
    } else {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch {
            return false;
        }
    }
}
