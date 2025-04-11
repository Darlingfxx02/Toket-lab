// Обработчик запросов для локального сервера и Vercel serverless функции
const http = require('http');
const fs = require('fs');
const path = require('path');

// Функция для обработки запросов (используется и для локального сервера, и для Vercel serverless)
async function handleRequest(req, res) {
  // Включаем CORS для всех запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Обрабатываем preflight запросы OPTIONS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Получаем путь запроса
  let pathname;
  if (req.url) {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = reqUrl.pathname;
  } else {
    pathname = '/';
  }

  // Логирование запросов для отладки
  console.log(`${req.method} ${pathname}`);

  // Обрабатываем API запросы от плагина Figma
  if ((pathname === '/api/tokens' || pathname === '/api/import') && req.method === 'POST') {
    try {
      // Для Vercel serverless функции тело запроса уже доступно
      let body = '';
      if (req.body) {
        // Если тело запроса уже доступно (Vercel serverless)
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        // Собираем тело запроса для локального сервера
        await new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            body = Buffer.concat(chunks).toString();
            resolve();
          });
          req.on('error', reject);
        });
      }

      // Парсим полученные JSON данные
      const data = JSON.parse(body);
      
      // Сохраняем данные в файл (для локального сервера)
      // В Vercel мы не можем писать в файловую систему, но данные будут доступны по API
      try {
        const fileName = `latest-tokens.json`;
        
        fs.writeFileSync(
          path.join(__dirname, fileName),
          JSON.stringify(data, null, 2)
        );
        
        console.log(`Получены данные от Figma плагина. Сохранено в ${fileName}`);
      } catch (error) {
        console.log("Не удалось сохранить файл, возможно работаем в Vercel");
      }
      
      // Отправляем успешный ответ
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Данные успешно получены',
        data: data // Возвращаем полученные данные для Vercel
      }));
    } catch (error) {
      console.error('Ошибка при обработке данных:', error);
      
      // Отправляем ошибку
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Ошибка при обработке данных' }));
    }
    return;
  }

  // Для всех остальных API запросов
  if (pathname.startsWith('/api/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'API endpoint не найден' }));
    return;
  }

  // Для локального сервера - обрабатываем запросы к статическим файлам
  if (process.env.NODE_ENV !== 'production') {
    // Обрабатываем запрос на статические файлы
    if (pathname === '/' || pathname === '/index.html') {
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end('Ошибка сервера');
          return;
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      });
      return;
    }

    // Обрабатываем запросы CSS файлов
    if (pathname.endsWith('.css')) {
      fs.readFile(path.join(__dirname, pathname), (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Файл не найден');
          return;
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        res.end(data);
      });
      return;
    }

    // Обрабатываем запросы JS файлов
    if (pathname.endsWith('.js')) {
      fs.readFile(path.join(__dirname, pathname), (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Файл не найден');
          return;
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        res.end(data);
      });
      return;
    }

    // Обрабатываем запросы JSON файлов
    if (pathname.endsWith('.json')) {
      fs.readFile(path.join(__dirname, pathname), (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Файл не найден');
          return;
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
      return;
    }
  }

  // Для всех остальных запросов в Vercel - перенаправление на index.html
  if (process.env.NODE_ENV === 'production') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'API Server is running' }));
    return;
  }

  // Для всех остальных запросов локально возвращаем 404
  res.statusCode = 404;
  res.end('Страница не найдена');
}

// Порт, на котором будет запущен локальный сервер
const PORT = process.env.PORT || 3000;

// Создаем локальный HTTP сервер
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(handleRequest);

  // Запускаем сервер
  server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Ожидаем данные от Figma плагина...`);
  });
}

// Экспортируем функцию для использования с Vercel serverless
module.exports = handleRequest; 