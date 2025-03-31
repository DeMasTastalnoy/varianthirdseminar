document.addEventListener("DOMContentLoaded", () => {
    const routeId = window.location.pathname.split("/").pop();  // Получаем ID маршрута из URL
    const routeName = document.getElementById("routeName");
    const reviewsList = document.getElementById("reviewsList");
    const newReviewForm = document.getElementById("newReviewForm");

    // Загружаем информацию о маршруте и его отзывы
    fetch(`/api/routes/${routeId}`)
        .then(response => response.json())
        .then(data => {
            routeName.textContent = data.name;
            displayReviews(data.reviews);  // Отображаем отзывы
        });

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

        const newReview = { content, author: "Пользователь" };  // Здесь можно добавить авторизацию

        fetch(`/api/routes/${routeId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newReview),
        })
            .then(response => response.json())
            .then(data => {
                displayReviews(data.reviews);  // Обновляем список отзывов
            });
    });
});
