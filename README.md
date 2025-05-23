# Просмотрщик переменных Figma

Это приложение для отображения переменных из Figma плагина, экспортированных в формате JSON. Поддерживает как ручную загрузку JSON-файлов, так и автоматическое получение данных от Figma плагина.

## Как использовать

### Метод 1: Ручная загрузка

1. Откройте файл `index.html` в любом современном браузере
2. Перейдите на вкладку "Ручная загрузка"
3. Нажмите кнопку "Экспорт"
4. Выберите JSON файл с переменными Figma
5. Просмотрите переменные в интерфейсе приложения

### Метод 2: Интеграция с Figma плагином

1. Запустите сервер командой: `node server.js`
2. Откройте приложение по адресу: `http://localhost:3000`
3. Перейдите на вкладку "Из плагина"
4. Нажмите кнопку "Проверить подключение"
5. Откройте Figma и запустите плагин "Variables & Styles Counter"
6. В плагине нажмите кнопку "Export to Desktop"
7. Вернитесь в веб-приложение и нажмите "Загрузить последние данные"
8. Просмотрите переменные в интерфейсе приложения

## Структура проекта

- `index.html` - основной HTML файл
- `styles.css` - CSS стили
- `script.js` - JavaScript код для обработки и отображения данных
- `server.js` - HTTP-сервер для связи с Figma плагином
- `example.json` - пример JSON файла с переменными для тестирования
- `latest-tokens.json` - последние данные, полученные от Figma плагина

## Поддерживаемые форматы JSON

### 1. Стандартный формат для ручной загрузки

```json
{
  "коллекция1": {
    "переменная1": "значение1",
    "переменная2": "значение2"
  },
  "коллекция2": {
    "переменная3": "значение3",
    "переменная4": "значение4"
  }
}
```

### 2. Формат данных от Figma плагина

```json
{
  "variablesCount": {
    "collections": {
      "Colors": 8,
      "Typography": 7
    },
    "total": 15
  },
  "stylesCount": {
    "paint": 12,
    "text": 8,
    "effect": 4,
    "grid": 0,
    "total": 24
  },
  "timestamp": "2023-09-15T12:34:56.789Z",
  "fileName": "Design System"
}
```

## Возможности

- Отображение переменных в удобном формате
- Визуальный предпросмотр цветовых значений
- Автоматическое форматирование имен переменных для лучшей читаемости
- Поддержка ручной загрузки JSON файлов
- Интеграция с Figma плагином для автоматического получения данных
- Простой и интуитивно понятный интерфейс 