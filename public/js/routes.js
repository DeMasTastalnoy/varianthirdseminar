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

                    const isAdmin = window.userRole === "admin";

                    const deleteButtonHTML = (window.userRole === "admin")
                        ? `<button class="delete-route-btn" data-route-id="${route.id}">Удалить маршрут</button>`
                        : "";

                    const coordinatesHTML = isAdmin
                        ? `<p>Координаты: ${route.coordinates}</p>`
                        : `<p style="display: none;">Координаты: ${route.coordinates}</p>`;

                    const favoriteButtonHTML = `<button class="add-favorite-btn" data-route-id="${route.id}">В избранное</button>`;

                    routeElement.innerHTML = `
                        <h3>${route.name}</h3>
                        <p>${route.description}</p>
                        ${coordinatesHTML}
                        <p style="display:none;">Координаты: ${route.coordinates}</p>
                        <button class="review-btn" data-route-id="${route.id}">Оставить отзыв</button>
                        <button class="viewReviewsBtn" data-route-id="${route.id}">Просмотр отзывов</button>
                        ${favoriteButtonHTML}
                        ${deleteButtonHTML}
                    `;
                    routesList.appendChild(routeElement);
                });

                document.addEventListener("click", async function (e) {
                    if (e.target.classList.contains("delete-route-btn")) {
                        const routeId = e.target.getAttribute("data-route-id");
                        const confirmed = confirm("Вы уверены, что хотите удалить этот маршрут?");
                        if (!confirmed) return;

                        try {
                            const response = await fetch(`/api/routes/${routeId}`, {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" }
                            });

                            if (response.ok) {
                                alert("Маршрут удалён");
                                e.target.closest(".route-card").remove(); // Удаляем из DOM
                            } else {
                                const err = await response.json();
                                alert("Ошибка: " + err.message);
                            }
                        } catch (error) {
                            console.error("Ошибка при удалении маршрута:", error);
                            alert("Ошибка сервера");
                        }
                    }
                });

                document.addEventListener("click", async function (e) {
                    if (e.target.classList.contains("add-favorite-btn")) {
                        const routeId = e.target.getAttribute("data-route-id");

                        try {
                            const response = await fetch("/api/user/preferences", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ favoriteRouteId: routeId })
                            });

                            if (response.ok) {
                                alert("Маршрут добавлен в избранное!");
                                e.target.disabled = true;
                                e.target.textContent = "В избранном";
                            } else {
                                const err = await response.json();
                                alert("Ошибка: " + err.message);
                            }
                        } catch (err) {
                            console.error("Ошибка при добавлении в избранное:", err);
                            alert("Ошибка сервера");
                        }
                    }
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

                function getStarsHTML(rating) {
                    const fullStars = Math.floor(rating);
                    const hasHalfStar = rating - fullStars >= 0.5;
                    let stars = "";

                    for (let i = 0; i < fullStars; i++) {
                        stars += "⭐";
                    }

                    if (hasHalfStar) stars += "✬"; // или можно использовать "⯪" или половину SVG

                    while (stars.length < 5) {
                        stars += "☆";
                    }

                    return stars;
                }

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
                                    reviewList.innerHTML = "<h2 class='review-header'>Отзывы о маршруте</h2><p>Отзывов пока нет, будьте первым.</p>";
                                } else {
                                    const averageRating =
                                        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

                                    // Создаём HTML для звёзд
                                    const starsHTML = getStarsHTML(averageRating);

                                    reviewList.innerHTML = `
                                        <h2 class='review-header'>Отзывы о маршруте</h2>
                                        <div class="average-rating">
                                            <span>Рейтинг маршрута</span>
                                            <span>${starsHTML}</span>
                                            <span class="rating-number">(${averageRating.toFixed(1)} из 5)</span>
                                        </div>
                                    `;

                                    // Вывод отзывов
                                    reviews.forEach(review => {
                                        const reviewElement = document.createElement("div");
                                        reviewElement.classList.add("review-card");
                                        reviewElement.innerHTML = `
                                        <p>${review.comment}</p>
                                        <p><strong>Оценка:</strong> ${"⭐".repeat(review.rating)}</p>
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


