document.addEventListener("DOMContentLoaded", () => {
    const routesList = document.getElementById("routesList");
    const addRouteBtn = document.getElementById("addRouteBtn");
    const routeForm = document.getElementById("routeForm");
    const newRouteForm = document.getElementById("newRouteForm");

    function displayRoutes() {
        fetch("/api/routes")
            .then(response => response.json())
            .then(data => {
                routesList.innerHTML = '';
                data.forEach(route => {
                    const routeElement = document.createElement("div");
                    routeElement.classList.add("route-card");
                    routeElement.innerHTML = `
                        <h3>${route.name}</h3>
                        <p>${route.description}</p>
                        <p style="display:none;">Координаты: ${route.coordinates}</p>
                        <button class="review-btn" data-route-id="${route.id}">Оставить отзыв</button>
                        <button class="viewReviewsBtn" data-route-id="${route.id}">Просмотр отзывов</button>
                    `;
                    routesList.appendChild(routeElement);
                });

                document.getElementById("cancelReviewBtn").addEventListener("click", function () {
                    document.getElementById("reviewForm").style.display = "none";
                });

                function openReviewForm(routeId) {
                    document.getElementById("routeId").value = routeId;
                    document.getElementById("reviewForm").style.display = "block";
                }
                // Вешаем обработчики на кнопки "Оставить отзыв"
                document.querySelectorAll(".review-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const routeId = this.getAttribute("data-route-id");
                        openReviewForm(routeId);
                    });
                });
                document.querySelectorAll(".viewReviewsBtn").forEach(button => {
                    button.addEventListener("click", function () {
                        console.log("Получаем отзывы")
                        const routeId = this.getAttribute("data-route-id");
                        const reviewList = document.getElementById("reviewList");

                        fetch(`/api/reviews/${routeId}`)
                            .then(response => response.json())
                            .then(reviews => {
                                reviewList.innerHTML = ""; // Очищаем список
                                if (reviews.length === 0) {
                                    reviewList.innerHTML = "<h2 class='review-header'>Отзывы о маршруте</h2><p>Отзывов пока нет.</p>";
                                } else {
                                    reviewList.innerHTML = "<h2 class='review-header'>Отзывы о маршруте</h2>";
                                    reviews.forEach(review => {
                                        const reviewElement = document.createElement("div");
                                        reviewElement.classList.add("review-card");
                                        reviewElement.innerHTML = `
                                    <p>${review.comment}</p>
                                    <p><strong>Автор:</strong> ${review.name}</p>
                                `;
                                        reviewList.appendChild(reviewElement);
                                    });
                                }
                                reviewList.style.display = "flex"; // Показываем блок с отзывами
                            })
                            .catch(error => console.error("Ошибка загрузки отзывов:", error));
                    });
                });

            })
            .catch(error => console.error("Ошибка загрузки маршрутов:", error));


            }

    displayRoutes();

    addRouteBtn.addEventListener("click", () => {
        routeForm.style.display = 'block';
    });

    newRouteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("routeName").value;
        const description = document.getElementById("routeDescription").value;
        const coordinates = document.getElementById("routeCoordinates").value
            .split(";")
            .map(pair => pair.split(",").map(coord => parseFloat(coord.trim())));

        const newRoute = { name, description, coordinates };

        fetch("/api/routes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newRoute),
        })
            .then(response => response.json())
            .then(() => {
                routeForm.style.display = 'none';
                displayRoutes();
            });
    });
});


