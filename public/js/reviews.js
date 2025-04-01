document.addEventListener("DOMContentLoaded", () => {
    const routeId = window.location.pathname.split("/").pop();  // Получаем ID маршрута из URL
    const routeName = document.getElementById("routeName");
    const reviewsList = document.getElementById("reviewsList");
    const newReviewForm = document.getElementById("newReviewForm");

    // Загружаем информацию о маршруте и его отзывы
    // fetch(`/api/routes/${routeId}`)
    //     .then(response => {
    //         console.log("Статус ответа:", response.status);
    //         return response.text(); // Получаем текст ответа
    //     })
    //     .then(text => {
    //         console.log("Тело ответа:", text);
    //         if (!text) throw new Error("Сервер вернул пустой ответ!");
    //         return JSON.parse(text); // Преобразуем в JSON
    //     })
    //     .then(data => {
    //         routeName.textContent = data.name;
    //         displayReviews(data.reviews);
    //     })
    //     .catch(error => console.error("Ошибка загрузки маршрута:", error));

    // Функция для отображения отзывов
    function displayReviews(reviews) {
        reviewsList.innerHTML = '';  // Очищаем список
        reviews.forEach(review => {
            const reviewElement = document.createElement("div");
            reviewElement.innerHTML = `
                <p>${review.content}</p>
                <p><strong>Автор:</strong> ${review.author}</p>
            `;
            reviewsList.appendChild(reviewElement);
        });
    }

    // Добавление нового отзыва
    newReviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = document.getElementById("reviewContent").value;

        const newReview = { content, author: "Пользователь" }; // Можно добавить авторизацию

        fetch(`/api/routes/${routeId}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReview)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
                }
                return response.text(); // Получаем текст ответа
            })
            .then(text => {
                if (!text) {
                    throw new Error("Ответ сервера пуст!");
                }
                return JSON.parse(text); // Парсим JSON вручную
            })
            .then(data => {
                routeName.textContent = data.name;
                displayReviews(data.reviews);
            })
            .catch(error => {
                console.error("Ошибка загрузки маршрута:", error);
            });
    });


    document.getElementById("newReviewForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const routeId = document.getElementById("routeId").value;
        const reviewText = document.getElementById("reviewText").value;

        const response = await fetch("/add-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ routeId, reviewText })
        });

        if (response.ok) {
            alert("Отзыв добавлен!");
            document.getElementById("reviewForm").style.display = "none";
        } else {
            alert("Ошибка при добавлении отзыва");
        }
    });



});
