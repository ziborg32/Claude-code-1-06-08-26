# Claude-code-1-06-08-26

## Генерация картинок через Midjourney

Использует npm-пакет [`midjourney-api`](https://github.com/midjourney-api/midjourney-api) (обёртка над платным сервисом [apiframe.pro](https://apiframe.pro)). Сгенерированные картинки сохраняются в `images/`.

### Настройка

1. Зарегистрируйтесь на https://apiframe.pro и получите API-ключ.
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
node scripts/generate-image.js "a red knight riding a blue horse" fast
```

Картинка появится в `images/` с именем вида `<timestamp>-<slug-промпта>.png`. Закоммитьте и запушьте файл, чтобы сохранить его в репозитории.