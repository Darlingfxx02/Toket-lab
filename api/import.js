// API endpoint для импорта данных из Figma плагина
const fs = require('fs');
const path = require('path');

// Глобальное хранилище для последних полученных данных
// В serverless среде данные будут храниться только в течение жизни функции
let lastReceivedData = null;

module.exports = async (req, res) => {
  // Включаем CORS для всех запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Обрабатываем preflight запросы OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Возвращаем последние данные для GET запроса
  if (req.method === 'GET') {
    if (lastReceivedData) {
      return res.status(200).json({
        success: true,
        data: lastReceivedData
      });
    } else {
      try {
        // Пытаемся прочитать данные из файла (локальная разработка)
        const data = fs.readFileSync(path.join(process.cwd(), 'latest-tokens.json'), 'utf8');
        const jsonData = JSON.parse(data);
        return res.status(200).json({
          success: true,
          source: 'file',
          data: jsonData
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Данные не найдены. Необходимо сначала импортировать данные из Figma.'
        });
      }
    }
  }

  // Обрабатываем POST запрос - получение данных от плагина
  if (req.method === 'POST') {
    try {
      // Получаем данные из тела запроса
      const data = req.body;
      lastReceivedData = data;
      
      // Пытаемся сохранить данные в файл (для локальной разработки)
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'latest-tokens.json'),
          JSON.stringify(data, null, 2)
        );
        console.log('Данные сохранены в файл');
      } catch (error) {
        console.log('Невозможно сохранить в файл в serverless окружении');
      }
      
      return res.status(200).json({
        success: true,
        message: 'Данные успешно получены',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Ошибка при обработке данных:', error);
      return res.status(400).json({
        success: false,
        error: 'Ошибка при обработке данных'
      });
    }
  }

  // Для всех остальных методов
  return res.status(405).json({
    success: false,
    error: 'Метод не разрешен'
  });
}; 