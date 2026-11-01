# VOT Safari

Озвучка и субтитры к видео на других языках прямо в Safari (macOS). Форк
[voice-over-translation](https://github.com/ilyhalight/voice-over-translation)
с новым интерфейсом в стиле Liquid Glass. Сборка рассчитана на Safari и браузеры
на Chromium.

## Сборка

```bash
npm install
npm run build          # результат: .output/chrome-mv3
```

## Safari

```bash
xcrun safari-web-extension-converter .output/chrome-mv3 \
  --project-location ~/Desktop/vot-safari --app-name "VOT Safari" --macos-only
```

Откройте проект в Xcode, выберите команду для подписи (Personal Team
подойдёт), запустите приложение (⌘R) и включите расширение в
Safari → Settings → Extensions. Для неподписанной сборки в меню Develop включите
Allow Unsigned Extensions.

## Разработка

| Команда | Что делает |
| --- | --- |
| `npm run dev` | сборка с отладкой и автоперезагрузкой |
| `npm run check` | проверка типов |
| `npm run lint` | линтер (Biome) |
| `npm run format` | форматирование |

Правила для компонентов, локализации и коммитов описаны в `AGENTS.md`.

## Авторы и лицензия

Оригинальный проект: Toil, SashaXser, MrSoczekXD, mynovelhost, sodapng и
участники [voice-over-translation](https://github.com/ilyhalight/voice-over-translation).
Safari-версия и редизайн: Lurevelle Digital.

Лицензия MIT, см. `LICENSE`.
