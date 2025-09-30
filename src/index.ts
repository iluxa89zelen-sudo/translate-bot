import { translateService } from "./services/index.js";
import { TargetLanguageCode } from "./services/translate.service.js";

const { data: text, error}  = await translateService.translate({
    text: "Hello world",
    targetLanguageCode: TargetLanguageCode.ru
});

if (error) {
    console.error(error);
} else {
    console.log(text)
}
