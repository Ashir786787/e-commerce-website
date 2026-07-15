import axios from "axios";

const api = axios.create({
  baseURL:
    typeof window !== "undefined"
      ? "/api"
      : `${process.env.NEXT_PUBLIC_APP_URL}/api`,
  withCredentials: true,
});

export default api;
