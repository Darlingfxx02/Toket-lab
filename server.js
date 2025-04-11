// Простой HTTP-сервер для приема данных от Figma плагина
const http = require('http');
const fs = require('fs');
const path = require('path');

// Порт, на котором будет запущен сервер
const PORT = 3000;

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
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

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  // Логирование запросов для отладки
  console.log(`${req.method} ${pathname}`);

  // Обрабатываем API запросы
  if (pathname === '/api/tokens' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // Парсим полученные JSON данные
        const data = JSON.parse(body);
        
        // Сохраняем данные в файл
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `latest-tokens.json`;
        
        fs.writeFileSync(
          path.join(__dirname, fileName),
          JSON.stringify(data, null, 2)
        );
        
        console.log(`Получены данные от Figma плагина. Сохранено в ${fileName}`);
        
        // Отправляем успешный ответ
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Данные успешно получены' }));
      } catch (error) {
        console.error('Ошибка при обработке данных:', error);
        
        // Отправляем ошибку
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Ошибка при обработке данных' }));
      }
    });
    return;
  }

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

  // Для всех остальных запросов возвращаем 404
  res.statusCode = 404;
  res.end('Страница не найдена');
});

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Ожидаем данные от Figma плагина...`);
}); 