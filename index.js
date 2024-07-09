"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Получаем элемент формы по ID после загрузки скрипта
const form = document.getElementById('form');
if (form) {
    // Добавляем обработчик события отправки формы
    form.addEventListener('submit', submitForm);
}
else {
    // Выводим ошибку, если элемент формы не найден
    console.error('Form element not found');
}
// Функция, вызываемая при отправке формы
function submitForm(e) {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    e.preventDefault();
    // Вызываем функцию для обработки данных формы
    getData();
}
// Асинхронная функция для получения данных и обработки запроса к API
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Получаем элементы ввода и контейнер сообщений по ID
        const inputElement = document.getElementById("input");
        const messagesElement = document.getElementById("messages");
        // Проверяем наличие элементов ввода и сообщений
        if (!inputElement || !messagesElement) {
            // Выводим ошибку, если элементы не найдены
            console.error('Input or messages element not found');
            return;
        }
        // Получаем и очищаем введенные данные
        const userData = inputElement.value.trim();
        if (userData === "")
            return; // Прерываем выполнение, если данные пустые
        // Отображаем сообщение пользователя
        displayUserMessage(userData);
        // Очищаем поле ввода
        clearInput();
        // Константы для ключа API и URL запроса
        const API = 'sk-orYOcq8pjQ9zXfO4nuNrZ9ZaQiU2L0WhtjWzTDnrLsh8pt00';
        const API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';
        // Создаем объект FormData для отправки данных формы
        const formData = new FormData();
        formData.append('prompt', userData); // Добавляем текстовый запрос
        formData.append('output_format', 'webp'); // Устанавливаем формат вывода
        formData.append('aspect_ratio', '4:5'); // прописываем соотнощение сторон
        try {
            // Выполняем запрос к API с использованием fetch
            const response = yield fetch(API_URL, {
                method: 'POST', // Метод запроса
                headers: {
                    Authorization: `Bearer ${API}`, // Заголовок авторизации
                    Accept: "image/*" // Заголовок принятия изображений
                },
                body: formData // Тело запроса
            });
            // Проверяем успешность ответа
            if (response.status === 200) {
                // Получаем данные ответа в виде ArrayBuffer
                const buffer = yield response.arrayBuffer();
                const base64Flag = 'data:image/webp;base64,'; // Префикс для base64 данных
                // Преобразуем ArrayBuffer в строку base64
                const imageStr = arrayBufferToBase64(buffer);
                // Отображаем изображение
                displayResponseImage(base64Flag + imageStr);
            }
            else {
                // Получаем текст ошибки из ответа
                const errorText = yield response.text();
                // Выбрасываем ошибку с текстом ошибки и статусом
                throw new Error(`${response.status}: ${errorText}`);
            }
        }
        catch (error) {
            // Логируем ошибку в консоль
            console.error('Error:', error);
            // Проверяем, является ли ошибка экземпляром класса Error
            if (error instanceof Error) {
                // Отображаем сообщение об ошибке
                displayErrorMessage(error);
            }
            else {
                // Отображаем сообщение об неизвестной ошибке
                displayErrorMessage(new Error('An unknown error occurred'));
            }
        }
    });
}
// Функция для преобразования ArrayBuffer в строку base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    // Преобразуем ArrayBuffer в Uint8Array для работы с байтами
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    // Проходим по каждому байту и добавляем его к строке
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Возвращаем строку в формате base64
    return window.btoa(binary);
}
// Функция для отображения сообщения пользователя
function displayUserMessage(message) {
    const messagesContainer = document.getElementById("messages");
    // Добавляем новое сообщение в начало контейнера
    messagesContainer.innerHTML = `<div class="mess-user"><p>${message}</p></div>` + messagesContainer.innerHTML;
}
// Функция для очистки поля ввода
function clearInput() {
    const inputElement = document.getElementById("input");
    if (inputElement) {
        // Очищаем значение поля ввода
        inputElement.value = "";
    }
}
// Функция для отображения изображения, полученного от API
function displayResponseImage(imageData) {
    const messagesContainer = document.getElementById("messages");
    if (imageData) {
        // Добавляем изображение в начало контейнера
        messagesContainer.innerHTML = `<div class="mess-chat"><img src="${imageData}" alt="Generated Image"></div>` + messagesContainer.innerHTML;
    }
    else {
        // Отображаем сообщение об ошибке, если изображение не получено
        messagesContainer.innerHTML = `<div class="mess-error"><p>Ошибка: Изображение не получено</p></div>` + messagesContainer.innerHTML;
    }
}
// Функция для отображения сообщений об ошибках
function displayErrorMessage(error) {
    const messagesContainer = document.getElementById("messages");
    // Добавляем сообщение об ошибке в начало контейнера
    messagesContainer.innerHTML = `<div class="mess-error"><p>Ошибка: ${error.message}</p></div>` + messagesContainer.innerHTML;
}
