
import ky from "ky";

export const apiClient = ky.create({
  prefix: "https://workbook.devnoco.com/v8/",
});
