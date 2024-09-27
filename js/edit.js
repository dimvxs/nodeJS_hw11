var express = require('express');
var router = express.Router();
var connection = require('./config'); //импорт соединения с базой данных
var path = require('path');



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
    res.sendFile(path.join(__dirname, '../html/edit.html'));
});



router.post('/add', function(req, res){
    
    var checkID = 'SELECT * FROM items WHERE id = ?';

    var name = req.body.name;
    var id = req.body.id;
    var price = req.body.price;
    var quantity = req.body.quantity;
    var categoryID = req.body.categoryID;

    
 
    
    req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            connection.release();
            return res.status(500).send('Ошибка сервера');
        }
    
    
        req.dbConnection.execute(checkID, [id], (err, results) => {
        
        if (err) {
            console.error(err);
            req.dbConnection.release();
            return res.status(500).send('ошибка при проверке ID товара');
        }
    
        if (results.length > 0) {
            // название группы уже существует
            req.dbConnection.release();
            return res.status(500).send('товар уже существует');
        }
    
    });
    
       
    
    
        var insert = 'INSERT INTO items (id, name, price, quantity, categoryID) VALUES (?, ?, ?, ?, ?)';
    
        req.dbConnection.commit(function(err) {
                if (err) {
                    console.error(err);
                    return req.dbConnection.rollback(function() {
                        req.dbConnection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }

                req.dbConnection.execute(insert, [id, name, price, quantity, categoryID], (err) => {
    
                    if (err) {
                        console.error(err);
                        return req.dbConnection.rollback(function() {
                            req.dbConnection.release();
                            res.status(500).send('ошибка при добавлении ID товара');
                        });
                
                    
                    }
        
                console.log('транзакция успешно завершена.');
                res.send('товар успешно добавлен в базу данных.');
                req.dbConnection.release(); // Возвращаем соединение в пул
            });
        });
    });
    });
    





    router.post('/delete', function(req, res){

       
            const query = "DELETE FROM items WHERE id = ?";

            var name = req.body.name;
            var id = req.body.id;
            var price = req.body.price;
            var quantuty = req.body.quantity;
            var categoryID = req.body.categoryID;
        



                req.dbConnection.beginTransaction(function(err) {
                if (err) {
                    console.error('Ошибка начала транзакции: ', err);
                    req.dbConnection.release();
                    return res.status(500).send('Ошибка сервера');
                }
    


                req.dbConnection.execute(query, [id], (err) => {

                if (err) {
                    console.error('Ошибка при удалении товара:', err);
                    return conn.rollback(function() {
                        conn.release();
                        res.status(500).send('Ошибка при удалении товара');
                        req.dbConnection.release();
                    });
                }

                req.dbConnection.commit(function(err) {
                    if (err) {
                        console.error(err);
                        return req.dbConnection.rollback(function() {
                            req.dbConnection.release();
                            res.status(500).send('ошибка  при завершении транзакции');
                        });
                    }
              
                console.log('товар удален');
                res.send('товар успешно удален');
                req.dbConnection.release();
            });
            });
        });
    });


    


router.post('/edit', function(req, res){
    const query = "UPDATE items SET name = ?, price = ?, quantity = ?, categoryID = ? WHERE Id = ?";
    var name = req.body.name;
    var id = req.body.id;
    var price = req.body.price;
    var quantity = req.body.quantity;
    var categoryID = req.body.categoryID;
    
          
        req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }
    


        req.dbConnection.execute(query, [name, price, quantity, categoryID, id], (err) => {

        if (err) {
            console.error('Ошибка при обновлении товара:', err);
            return res.status(500).send('Ошибка при обновлении товара');
        }


        req.dbConnection.commit(function(err) {
            if (err) {
                console.error(err);
                return req.dbConnection.rollback(function() {
                    req.dbConnection.release();
                    res.status(500).send('ошибка  при завершении транзакции');
                });
            }

        console.log('товар обновлен');
        res.send('товар успешно обновлен');
    });
})
});
});


module.exports = router;
