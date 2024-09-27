var express = require('express');
var router = express.Router();
var connection = require('./config'); //импорт соединения с базой данных
var path = require('path');
var Cookies = require('cookies');

// Middleware для получения соединения из пула
router.use(function(req, res, next) {
    connection.getConnection(function(err, connection) {
        if (err) {
            console.error('Ошибка при получении соединения из пула: ', err);
            return res.status(500).send('Ошибка сервера');
        }
        req.dbConnection = connection; // Сохраняем соединение в объекте запроса
        next(); // Передаем управление следующему обработчику
    });
});


router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../html/authorization.html'));
});


router.post('/submit', function(req, res){
var login = req.body.login;
var password = req.body.password;

var query = 'SELECT * FROM admins WHERE login = ? AND password = ?';




req.dbConnection.beginTransaction(function(err) {
    if (err) {
        console.error('Ошибка начала транзакции: ', err);
        req.dbConnection.release();
        return res.status(500).send('Ошибка сервера');
    }
req.dbConnection.execute(query, [login, password], function(err, results) {
    if (err) {
        console.error('Ошибка при выполнении запроса: ', err);
        req.dbConnection.release();
        return res.status(500).send('Ошибка сервера');
    }

    // Проверяем, найден ли пользователь
    if (results.length > 0) {

        var cookies = new Cookies(req, res, { keys: ['Secret_string'] });
        var cookieOptions = {
            maxAge: 12000,
            path: '/',
            secure: false,
            signed: true
        };
        cookies.set('login', login, cookieOptions); // Устанавливаем куки с логином


        // Если пользователь найден, возвращаем успех
        req.dbConnection.release();
        return res.redirect('/edit');

    } else {
        // Если пользователь не найден, возвращаем сообщение об ошибке
        req.dbConnection.release();
        res.status(401).send('Неверный логин или пароль');
    }

    // Освобождаем соединение
    req.dbConnection.release();
});
});
});

module.exports = router;