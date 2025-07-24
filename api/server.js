const jsonServer = require('json-server');
const fs = require('fs'); // Импортируем модуль fs
const path = require('path');

const server = jsonServer.create();
const filePath = path.join(__dirname, 'db.json'); // Указываем путь к файлу db.json

// Читаем данные из файла db.json
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data); // Парсим данные из JSON в объект

// Создаем маршрутизатор на основе прочитанных данных
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults();

server.use(middlewares);

// Перезапись маршрутов
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id',
  })
);

// Обработка POST, PUT и DELETE запросов для записи в файл
server.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // После обработки запроса обновляем файл db.json
    const newData = JSON.stringify(router.db.getState(), null, 2);
    fs.writeFileSync(filePath, newData, 'utf-8');
  }
  next();
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});

// Экспортируем сервер
module.exports = server;