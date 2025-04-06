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


    const stars = document.querySelectorAll(".star");

    stars.forEach((star, index) => {
        star.addEventListener("mouseover", () => {
            // Подсветить все до наведённой включительно
            stars.forEach((s, i) => {
                s.classList.toggle("hover", i <= index);
            });
        });

        star.addEventListener("mouseout", () => {
            // Убрать подсветку при выходе мышки
            stars.forEach(s => s.classList.remove("hover"));
        });

        star.addEventListener("click", () => {
            const rating = index + 1;
            document.getElementById("reviewRating").value = rating;

            // Обновить выбранные звёзды
            stars.forEach((s, i) => {
                s.classList.toggle("selected", i < rating);
            });
        });
    });


    document.getElementById("newReviewForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const routeId = document.getElementById("routeId").value;
        const reviewText = document.getElementById("reviewText").value;
        const rating = parseInt(document.getElementById("reviewRating").value);

        if (!rating || rating < 1 || rating > 5) {
            alert("Пожалуйста, выберите оценку от 1 до 5 звёзд");
            return;
        }

        const response = await fetch("/add-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ routeId, reviewText, rating })
        });

        if (response.ok) {
            alert("Отзыв добавлен!");
            document.getElementById("reviewForm").style.display = "none";
        } else {
            alert("Ошибка при добавлении отзыва");
        }
    });



});
