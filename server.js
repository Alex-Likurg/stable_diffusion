const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // Импортируем cors
const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' })); // Для обработки больших изображений
app.use(cors()); // Используем cors для разрешения CORS-запросов

// Настройка соединения с MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ZX060688',
    database: 'stable_difussion',
    port: 3306 // Указываем порт отдельно
});

// Подключение к базе данных
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});


// Маршрут для получения изображений
app.get('/get-images', (req, res) => {
    const query = 'SELECT prompt, imageBase64 FROM images ORDER BY RAND() LIMIT 6';
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).send('Failed to fetch images from the database');
            return;
        }

        const images = rows.map(row => ({
            prompt: row.prompt,
            imageBase64: Buffer.from(row.imageBase64).toString('base64')
        }));
        res.json(images);
    });
});

// Маршрут для сохранения изображения
app.post('/save-image', (req, res) => {
    const { prompt, imageBase64 } = req.body;

    // Преобразование base64 строки в буфер
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Сохранение изображения в базе данных
    const query = 'INSERT INTO images (prompt, imageBase64) VALUES (?, ?)';
    connection.query(query, [prompt, imageBuffer], (err, results) => {
        if (err) {
            console.error('Error saving image to database:', err);
            res.status(500).send('Error saving image to database');
            return;
        }
        res.send('Image saved successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
