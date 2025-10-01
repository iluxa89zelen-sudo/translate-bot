import got from "got";

export enum TargetLanguageCode {
  ru = "ru",
  en = "en",
  de = "de",
  ja = "ja",
  zh = "zh"
}

export interface TranslateParams {
  text: string,
  targetLanguageCode: TargetLanguageCode
}

export interface TranslateResult {
  data?: string,
  error?: any
}

export interface TranslateResponse {
  translations: {
    text: string,
    detectedLanguageCode: TargetLanguageCode
  }
}

export class TranslateService {
  constructor(
    private readonly YANDEX_CLOUD_SERVICE_ACCOUNT_API_KEY: string,
    private readonly YANDEX_CLOUD_FOLDER_ID: string
  ) {}

  async translate(params: TranslateParams): Promise<TranslateResult> {
    try {
      const response = await got.post('https://translate.api.cloud.yandex.net/translate/v2/translate', {
        headers: {
          Authorization: `Api-Key ${this.YANDEX_CLOUD_SERVICE_ACCOUNT_API_KEY}`,
        },
        json: {
          folderId: this.YANDEX_CLOUD_FOLDER_ID,
          targetLanguageCode: params.targetLanguageCode,
          texts: [params.text]
        },
        retry: {
          limit: 0
        },
        timeout: {
          request: 10000
        }
      }).json<TranslateResponse>();

      if (!Array.isArray(response.translations) || response.translations.length == 0) {
        return { error: 'Translations reponse is empty' };
      }

      return { data: response.translations[0].text };
    } catch (error) {
      return { error: `Translation request failed: ${error}` }
    }
  }
}

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
