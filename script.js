document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на DOM элементы
    const exportBtn = document.getElementById('exportBtn');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const fileName = document.getElementById('fileName');
    const variablesContainer = document.getElementById('variablesContainer');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const checkPluginBtn = document.getElementById('checkPluginBtn');
    const loadLatestBtn = document.getElementById('loadLatestBtn');
    const connectionStatus = document.getElementById('connectionStatus');

    // Серверный URL
    const SERVER_URL = 'http://localhost:3000';

    // Обработчики табов
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Делаем активной нужную вкладку
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Показываем нужный контент
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Обработчик нажатия на кнопку "Экспорт"
    exportBtn.addEventListener('click', () => {
        jsonFileInput.click();
    });

    // Обработчик выбора файла
    jsonFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Отображаем имя выбранного файла
        fileName.textContent = file.name;
        
        // Читаем содержимое файла
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Парсим JSON
                const data = JSON.parse(e.target.result);
                // Отображаем данные
                displayVariables(data);
            } catch (error) {
                showError('Ошибка при чтении JSON файла. Убедитесь, что файл имеет правильный формат.');
                console.error('Ошибка парсинга JSON:', error);
            }
        };
        reader.onerror = () => {
            showError('Не удалось прочитать файл.');
        };
        reader.readAsText(file);
    });

    // Проверка подключения к серверу
    checkPluginBtn.addEventListener('click', async () => {
        showLoading();
        
        try {
            const response = await fetch(`${SERVER_URL}/api/tokens`, {
                method: 'OPTIONS'
            });
            
            if (response.ok) {
                connectionStatus.textContent = 'Подключено';
                connectionStatus.className = 'connection-status connected';
                variablesContainer.innerHTML = '<p class="placeholder-text">Соединение с сервером установлено. Теперь вы можете получать данные от Figma плагина.</p>';
            } else {
                throw new Error('Сервер не отвечает');
            }
        } catch (error) {
            connectionStatus.textContent = 'Не подключено';
            connectionStatus.className = 'connection-status disconnected';
            showError('Не удалось подключиться к серверу. Убедитесь, что сервер запущен на порту 3000.');
            console.error('Ошибка подключения:', error);
        }
    });

    // Загрузка последних данных с сервера
    loadLatestBtn.addEventListener('click', async () => {
        showLoading();
        
        try {
            const response = await fetch(`${SERVER_URL}/latest-tokens.json`);
            
            if (response.ok) {
                const data = await response.json();
                displayVariables(data);
            } else {
                throw new Error('Не удалось получить данные');
            }
        } catch (error) {
            showError('Не удалось загрузить последние данные. Возможно, плагин еще не отправлял данные на сервер.');
            console.error('Ошибка загрузки данных:', error);
        }
    });

    // Показать индикатор загрузки
    function showLoading() {
        variablesContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    }

    // Функция для отображения переменных из JSON
    function displayVariables(data) {
        // Очищаем контейнер
        variablesContainer.innerHTML = '';

        // Проверяем структуру данных
        if (!data || typeof data !== 'object') {
            showError('Неверный формат данных.');
            return;
        }

        // Если в данных есть структура плагина, преобразуем ее
        if (data.variablesCount && data.stylesCount) {
            // В этом случае у нас данные от Figma плагина, преобразуем их
            const transformedData = transformPluginData(data);
            data = transformedData;
        }

        // Проверяем, есть ли у нас переменные для отображения
        const hasVariables = Object.keys(data).length > 0;
        
        if (!hasVariables) {
            showEmptyState();
            return;
        }
        
        // Создаем разметку для переменных
        let html = '';
        
        // Перебираем все коллекции переменных
        for (const [collectionName, variables] of Object.entries(data)) {
            if (typeof variables === 'object' && variables !== null) {
                html += `<div class="variable-collection">
                    <h2 class="collection-title">${formatCollectionName(collectionName)}</h2>
                    <div class="variables-grid">`;
                
                // Перебираем все переменные в коллекции
                for (const [varName, varValue] of Object.entries(variables)) {
                    const formattedValue = formatVariableValue(varValue);
                    const colorPreview = isColorValue(varValue) ? 
                        `<span class="color-preview" style="background-color: ${formattedValue}"></span>` : '';
                    
                    html += `<div class="variable-item">
                        <div class="variable-name">${formatVariableName(varName)}</div>
                        <div class="variable-value">${formattedValue}${colorPreview}</div>
                    </div>`;
                }
                
                html += `</div></div>`;
            }
        }
        
        variablesContainer.innerHTML = html;
    }

    // Преобразование данных плагина в формат для отображения
    function transformPluginData(pluginData) {
        // Результирующие данные
        const result = {};
        
        // Если есть коллекции переменных, добавляем их
        if (pluginData.variablesCount && pluginData.variablesCount.collections) {
            result.variables = {};
            
            // Добавляем количество переменных по коллекциям
            for (const [collectionName, count] of Object.entries(pluginData.variablesCount.collections)) {
                result.variables[collectionName] = { count: String(count) };
            }
            
            // Добавляем общее количество
            result.variables.total = String(pluginData.variablesCount.total);
        }
        
        // Если есть стили, добавляем их
        if (pluginData.stylesCount) {
            result.styles = {
                paint: String(pluginData.stylesCount.paint),
                text: String(pluginData.stylesCount.text),
                effect: String(pluginData.stylesCount.effect),
                grid: String(pluginData.stylesCount.grid),
                total: String(pluginData.stylesCount.total)
            };
        }
        
        // Добавляем метаданные
        result.metadata = {
            fileName: pluginData.fileName || 'Неизвестный файл',
            timestamp: pluginData.timestamp || new Date().toISOString()
        };
        
        return result;
    }

    // Вспомогательная функция для форматирования имени переменной
    function formatVariableName(name) {
        return name.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/-/g, ' ');
    }
    
    // Вспомогательная функция для форматирования имени коллекции
    function formatCollectionName(name) {
        return name.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/-/g, ' ');
    }
    
    // Вспомогательная функция для форматирования значения переменной
    function formatVariableValue(value) {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    }
    
    // Вспомогательная функция для определения цветовых значений
    function isColorValue(value) {
        if (typeof value === 'string') {
            // Проверяем HEX цвета
            if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                return true;
            }
            // Проверяем RGB/RGBA цвета
            if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.test(value)) {
                return true;
            }
        }
        return false;
    }
    
    // Отображение сообщения об ошибке
    function showError(message) {
        variablesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
    
    // Отображение пустого состояния
    function showEmptyState() {
        variablesContainer.innerHTML = '<p class="empty-state">Файл не содержит переменных Figma</p>';
    }
}); 