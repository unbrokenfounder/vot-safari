# VOT Safari

Озвучка и субтитры к видео на других языках прямо в Safari (macOS). Форк
[voice-over-translation](https://github.com/ilyhalight/voice-over-translation)
с новым интерфейсом в стиле Liquid Glass. Сборка рассчитана на Safari и браузеры
на Chromium.

## Установка (для пользователей)

Нужен Mac с macOS 13 или новее и Safari. Apple-аккаунт не нужен.

1. Скачайте `VOT-Safari.zip` и распакуйте. Перенесите **VOT Safari.app** в папку
   «Программы».
2. Первый запуск: правый клик по приложению → **Открыть** → **Открыть**
   (macOS предупредит про неподписанное приложение, это ожидаемо). Если
   предупреждение не даёт открыть, выполните в Терминале:
   `xattr -cr "/Applications/VOT Safari.app"` и откройте приложение снова.
3. В Safari откройте меню **Develop → Allow Unsigned Extensions**
   (если меню Develop нет: Safari → Settings → Advanced → Show features for web
   developers). Эту настройку Safari сбрасывает при каждом перезапуске, её нужно
   включать заново.
4. Safari → Settings → **Extensions** → включите **VOT Safari Extension** и в
   «Edit Websites» поставьте **Allow** для всех сайтов.
5. Откройте видео на YouTube: над плеером появится кнопка «Перевести видео».

Для живых голосов нужен вход через Яндекс (Настройки → Мой аккаунт). Если
перевод не стартует из-за региона, включите прокси в Настройки → Настройки
прокси-сервера.

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

Собрать архив для раздачи (универсальное приложение для Apple Silicon и Intel,
ad-hoc подпись, без аккаунта Apple): `npm run package:safari`, результат в
`release/VOT-Safari.zip`.

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
