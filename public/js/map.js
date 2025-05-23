// document.addEventListener("DOMContentLoaded", () => {
//     // Инициализация карты Яндекс
//     ymaps.ready(function () {
//         const map = new ymaps.Map("map", {
//             center: [55.751244, 37.618423], // Москва, координаты центра
//             zoom: 5, // Зум карты
//         });
//
//         // Добавление маркера
//         const marker = new ymaps.Placemark([55.751244, 37.618423], {
//             balloonContent: "Москва — столица России"
//         });
//         map.geoObjects.add(marker);
//
//         // Создание маршрута
//         const route = new ymaps.route([
//             [55.751244, 37.618423], // Москва
//             [59.9342802, 30.3350986] // Санкт-Петербург
//         ]);
//         map.geoObjects.add(route);
//     });
// });



document.addEventListener("DOMContentLoaded", () => {
    ymaps.ready(function () {
        const map = new ymaps.Map("map", {
            center: [55.751244, 37.618423], // Москва, координаты центра
            zoom: 5, // Зум карты
        });

        // Добавление маркера
        const marker = new ymaps.Placemark([55.751244, 37.618423], {
            balloonContent: "Москва — столица России"
        });
        map.geoObjects.add(marker);
        const marker2 = new ymaps.Placemark([59.9342802, 30.3350986], {
            balloonContent: "Санкт-Петербург"
        });
        map.geoObjects.add(marker2);

        async function loadRoutes() {
            try {
                const response = await fetch("/api/routes");
                const routes = await response.json();

                routes.forEach(route => {
                    let coords = route.coordinates;
                    if (typeof coords === "string") {
                        coords = JSON.parse(coords); // Если координаты хранятся строкой, парсим в массив
                    }

                    if (Array.isArray(coords)) {
                        coords.forEach(([lat, lng]) => {
                            const placemark = new ymaps.Placemark([lat, lng], {
                                balloonContentHeader: `<b>${route.name}</b>`,
                                balloonContentBody: `<p>${route.description}</p>`,
                            }, {
                                preset: "islands#redDotIcon"
                            });

                            map.geoObjects.add(placemark);
                        });
                    }
                });
            } catch (err) {
                console.error("Ошибка загрузки маршрутов:", err);
            }
        }

        loadRoutes();
        // map.events.add("click", function (e) {
        //     const coords = e.get("coords"); // Получаем координаты клика
        //     const marker = new ymaps.Placemark(coords, {
        //         balloonContent: `Точка на карте: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
        //     });
        //     map.geoObjects.add(marker); // Добавляем маркер на карту
        // });
    });
});
