const mysql = require('mysql2');

// Параметры соединения с БД
const config = {
    host: 'localhost',            // Хост
    user: 'dima',                 // Пользователь базы данных
    password: '11111111111',      // Пароль пользователя 
    database: 'shop',           // Имя БД
    port: 3306,                   // Порт, на котором запущен MySQL сервер
};

// Создание пула соединений
const pool = mysql.createPool(config);

// Обработка ошибок пула
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err);
        return;
    }
    console.log('Успешно подключено к базе данных!');
    connection.release(); // Освобождаем соединение обратно в пул
});

// Экспорт пула для использования в других модулях
module.exports = pool;
