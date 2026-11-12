
import ky from "ky";

export const apiClient = ky.create({
  prefix:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/",
});
