import { translateService } from "./services/translate.service.js";
import { TranslateController } from "./controllers/translate.controller.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}

const translateController = new TranslateController(token, translateService);

await translateController.start();
