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

В репозитории лежит готовый проект Xcode: `safari/VOT Safari/VOT Safari.xcodeproj`.
Он собирает расширение из `.output/chrome-mv3`, поэтому сначала выполните
`npm run build`.

1. Откройте проект в Xcode, в Signing & Capabilities у обоих таргетов (приложение
   и расширение) выберите свою команду (подойдёт бесплатный Apple ID, Personal Team).
2. Запустите приложение (⌘R).
3. В Safari: Develop → Allow Unsigned Extensions, затем Settings → Extensions →
   включите VOT Safari и разрешите доступ к сайтам.

Проект можно пересоздать после изменения манифеста командой
`npm run build:safari` (нужен полноценный Xcode).

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
