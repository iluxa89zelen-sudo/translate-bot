import { TranslateService } from "./translate.service.js";

if (!process.env.YANDEX_CLOUD_SERVICE_ACCOUNT_API_KEY) {
  throw new Error('YANDEX_CLOUD_SERVICE_ACCOUNT_API_KEY not set in environment variables');
}

if (!process.env.YANDEX_CLOUD_FOLDER_ID) {
  throw new Error('YANDEX_CLOUD_FOLDER_ID not set in environment variables');
}

export const translateService = new TranslateService(
  process.env.YANDEX_CLOUD_SERVICE_ACCOUNT_API_KEY,
  process.env.YANDEX_CLOUD_FOLDER_ID
)
