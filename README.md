# Claude-code-1-06-08-26

## Генерация картинок через Midjourney

Использует официальный [`@apiframe-ai/sdk`](https://www.npmjs.com/package/@apiframe-ai/sdk) (Apiframe v2 API, `https://api.apiframe.ai`). Сгенерированные картинки сохраняются в `images/`.

### Настройка

1. Получите API-ключ (формат `afk_...`) в кабинете https://console.apiframe.ai → API Keys.
2. Скопируйте `.env.example` в `.env` и вставьте ключ:
   ```bash
   cp .env.example .env
   ```
3. Установите зависимости:
   ```bash
   npm install
   ```

### Использование

```bash
node scripts/generate-image.js "a red knight riding a blue horse" "16:9"
```

Или получить результат уже отправленной задачи по её `jobId`:

```bash
node scripts/generate-image.js --job-id <uuid>
```

Картинка появится в `images/` с именем вида `<timestamp>-<slug-промпта>.png`. Закоммитьте и запушьте файл, чтобы сохранить его в репозитории.

### Через GitHub Actions

Воркфлоу `.github/workflows/generate-image.yml` можно запустить вручную (`workflow_dispatch`) с полями `prompt` + `aspect_ratio`, либо `job_id` — картинка автоматически закоммитится в `images/` на GitHub-раннере (там нет сетевых ограничений). Требуется секрет репозитория `MIDJOURNEY_API_KEY`.