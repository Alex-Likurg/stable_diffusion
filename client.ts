import { buffer } from "stream/consumers";

// Устанавливаем обработчик события, который выполнится после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed'); // Логируем сообщение о полной загрузке DOM
    const form = document.getElementById('form') as HTMLFormElement; // Находим элемент формы по ID и приводим его к типу HTMLFormElement
    console.log('Form element:', form); // Логируем найденный элемент формы

    if (form) { // Проверяем, что элемент формы найден
        form.addEventListener('submit', submitForm); // Устанавливаем обработчик события на отправку формы
    } else {
        console.error('Form element not found'); // Логируем ошибку, если элемент формы не найден
    }

    fetchImages(); // Вызов функции для извлечения и отображения изображений из базы данных при загрузке страницы
});

    


// Функция обработчика отправки формы
function submitForm(e: Event) {
    e.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    getData(); // Вызываем функцию для обработки данных формы
}

// Асинхронная функция для получения данных и отправки запроса к API
async function getData() {
    const inputElement = document.getElementById("input") as HTMLInputElement; // Находим элемент ввода по ID и приводим его к типу HTMLInputElement
    const messagesElement = document.getElementById("messages") as HTMLDivElement; // Находим элемент для отображения сообщений по ID и приводим его к типу HTMLDivElement

    if (!inputElement || !messagesElement) { // Проверяем наличие элементов
        console.error('Input or messages element not found'); // Логируем ошибку, если элементы не найдены
        return; // Прекращаем выполнение функции, если элементы не найдены
    }

    const userData = inputElement.value.trim(); // Получаем значение из элемента ввода и обрезаем пробелы по краям
    if (userData === "") return; // Если значение пустое, прекращаем выполнение функции

    displayUserMessage(userData); // Отображаем сообщение пользователя
    clearInput(); // Очищаем поле ввода

    const API = 'sk-orYOcq8pjQ9zXfO4nuNrZ9ZaQiU2L0WhtjWzTDnrLsh8pt00'; // Токен API (небезопасно хранить его в коде)
    const API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core'; // URL для отправки запроса к API

    const width = 512; // Пример ширины изображения
    const height = 768; // Пример высоты изображения

    const formData = new FormData(); // Создаем объект FormData для отправки данных в запросе
    formData.append('prompt', userData); // Добавляем введенные данные в объект FormData
    formData.append('output_format', 'webp'); // Добавляем формат вывода изображения
    formData.append('width', width.toString()); // Добавляем ширину изображения
    formData.append('height', height.toString()); // Добавляем высоту изображения

    try {
        const response = await fetch(API_URL, {
            method: 'POST', // Устанавливаем метод запроса POST
            headers: {
                Authorization: `Bearer ${API}`, // Добавляем токен авторизации в заголовки
                Accept: "image/*" // Устанавливаем ожидаемый тип ответа
            },
            body: formData // Устанавливаем тело запроса
        });

        if (response.status === 200) { // Проверяем, что статус ответа 200 (OK)
            const buffer = await response.arrayBuffer(); // Получаем тело ответа в виде массива байтов
            const base64Flag = 'data:image/webp;base64,'; // Префикс для Base64 строки изображения
            const imageStr = arrayBufferToBase64(buffer); // Преобразуем массив байтов в строку Base64

            displayResponseImage(base64Flag + imageStr); // Отображаем полученное изображение

            // Сохранение изображения в базе данных
            await saveImageToDatabase(userData, imageStr.replace(base64Flag, '')); // Сохраняем изображение в базу данных, убирая префикс Base64
        } else if (response.status === 402) { // Проверяем, что статус ответа 402 (Недостаточно кредитов)
            console.error('Insufficient credits. Please check your account.'); // Логируем ошибку
            displayErrorMessage(new Error('Insufficient credits. Please check your account.')); // Отображаем сообщение об ошибке
        } else {
            const errorText = await response.text(); // Получаем текст ошибки из ответа
            throw new Error(`${response.status}: ${errorText}`); // Выбрасываем ошибку с кодом и текстом ошибки
        }
    } catch (error) {
        console.error('Error:', error); // Логируем ошибку
        if (error instanceof Error) {
            displayErrorMessage(error); // Отображаем сообщение об ошибке
        } else {
            displayErrorMessage(new Error('An unknown error occurred')); // Отображаем сообщение об неизвестной ошибке
        }
    }
}

// Функция для сохранения изображения в базу данных
async function saveImageToDatabase(prompt: string, imageBase64: string) {
    try {
        const response = await fetch('http://localhost:3000/save-image', {
            method: 'POST', // Устанавливаем метод запроса POST
            headers: {
                'Content-Type': 'application/json' // Устанавливаем тип содержимого запроса
            },
            body: JSON.stringify({ prompt, imageBase64 }) // Устанавливаем тело запроса с данными в формате JSON
        });

        if (!response.ok) { // Проверяем, что статус ответа не OK
            throw new Error('Failed to save image to database'); // Выбрасываем ошибку
        }

        const result = await response.text(); // Получаем текстовый ответ
        console.log(result); // Логируем результат
    } catch (error) {
        console.error('Error saving image to database:', error); // Логируем ошибку
    }
}

async function fetchImages() {
    try {
        const response = await fetch('http://localhost:3000/get-images', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch images from the database');
        }

        const images = await response.json();
        console.log('Fetched images:', images); // Добавьте это для отладки
        displayImages(images);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function displayImages(images: { prompt: string, imageBase64: string }[]) {
    const imageGallery = document.getElementById('imageGallery') as HTMLDivElement;
    imageGallery.innerHTML = ''; // Очищаем галерею перед добавлением новых изображений
    
    images.forEach(image => {
        console.log('Displaying image:', image); // Добавьте это для отладки
        const imgElement = document.createElement('img');
        const base64Image = `data:image/webp;base64,${image.imageBase64}`;        
        console.log(base64Image); // Логируем base64 строку
        imgElement.src = base64Image;
        imgElement.alt = image.prompt;
        imageGallery.appendChild(imgElement);
    });
}


// Функция для преобразования массива байтов в строку Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''; // Инициализируем пустую строку
    const bytes = new Uint8Array(buffer); // Преобразуем массив байтов в тип Uint8Array
    const len = bytes.byteLength; // Получаем длину массива байтов
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]); // Преобразуем каждый байт в символ и добавляем к строке
    }
    return window.btoa(binary); // Кодируем строку в Base64
}

// Функция для отображения сообщения пользователя
function displayUserMessage(message: string) {
    const messagesContainer = document.getElementById("messages") as HTMLDivElement; // Находим элемент для отображения сообщений по ID и приводим его к типу HTMLDivElement
    messagesContainer.innerHTML = `<div class="mess-user"><p>${message}</p></div>` + messagesContainer.innerHTML; // Добавляем сообщение пользователя в контейнер
}

// Функция для очистки поля ввода
function clearInput() {
    const inputElement = document.getElementById("input") as HTMLInputElement; // Находим элемент ввода по ID и приводим его к типу HTMLInputElement
    if (inputElement) {
        inputElement.value = ""; // Очищаем значение поля ввода
    }
}

// Функция для отображения сгенерированного изображения
function displayResponseImage(imageData: string) {
    const messagesContainer = document.getElementById("messages") as HTMLDivElement; // Находим элемент для отображения сообщений по ID и приводим его к типу HTMLDivElement
    if (imageData) {
        messagesContainer.innerHTML = `<div class="mess-chat"><img src="${imageData}" alt="Generated Image"></div>` + messagesContainer.innerHTML; // Добавляем сгенерированное изображение в контейнер
    } else {
        messagesContainer.innerHTML = `<div class="mess-error"><p>Ошибка: Изображение не получено</п></div>` + messagesContainer.innerHTML; // Добавляем сообщение об ошибке, если изображение не получено
    }
}

// Функция для отображения сообщения об ошибке
function displayErrorMessage(error: Error) {
    const messagesContainer = document.getElementById("messages") as HTMLDivElement; // Находим элемент для отображения сообщений по ID и приводим его к типу HTMLDivElement
    // Добавляем сообщение об ошибке в начало контейнера
    messagesContainer.innerHTML = `<div class="mess-error"><p>Ошибка: ${error.message}</p></div>` + messagesContainer.innerHTML;
}
