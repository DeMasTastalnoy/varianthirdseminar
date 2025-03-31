document.addEventListener("DOMContentLoaded", () => {
    const routesList = document.getElementById("routesList");
    const addRouteBtn = document.getElementById("addRouteBtn");
    const routeForm = document.getElementById("routeForm");
    const newRouteForm = document.getElementById("newRouteForm");

    // Функция для отображения маршрутов
    function displayRoutes() {
        fetch("/api/routes")  // Получаем список маршрутов с сервера
            .then(response => response.json())
            .then(data => {
                routesList.innerHTML = '';  // Очищаем список
                data.forEach(route => {
                    const routeElement = document.createElement("div");
                    routeElement.classList.add("route-card");
                    routeElement.innerHTML = `
                        <h3>${route.name}</h3>
                        <p>${route.description}</p>
                        <p>Координаты: ${route.coordinates}</p>
                        <button class="viewReviewsBtn" data-route-id="${route.id}">Просмотр отзывов</button>
                    `;
                    routesList.appendChild(routeElement);
                });
            });
    }


    // Показать форму для добавления маршрута
    addRouteBtn.addEventListener("click", () => {
        routeForm.style.display = 'block';
    });

    // Добавление нового маршрута
    newRouteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("routeName").value;
        const description = document.getElementById("routeDescription").value;
        // const coordinates = document.getElementById("routeCoordinates").value.split(",").map(coord => parseFloat(coord.trim()));
        const coordinates = document.getElementById("routeCoordinates").value
            .split(";") // Разделяем точки по ";"
            .map(pair => pair.split(",").map(coord => parseFloat(coord.trim())));

        const newRoute = { name, description, coordinates };
        console.log(newRoute);
        fetch("/api/routes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newRoute),
        })
            .then(response => response.json())
            .then(data => {
                routeForm.style.display = 'none';
                displayRoutes();  // Обновляем список маршрутов
            });
    });

    // Загрузка маршрутов при старте
    displayRoutes();
});
