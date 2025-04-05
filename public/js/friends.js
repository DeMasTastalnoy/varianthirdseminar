document.addEventListener("DOMContentLoaded", () => {
    const friendsList = document.getElementById("friendsList");
    const noFriendsMessage = document.getElementById("noFriendsMessage");

    const addFriendBtn = document.getElementById("addFriendBtn");
    const addFriendSection = document.getElementById("addFriendSection");
    const friendSearchInput = document.getElementById("friendSearchInput");
    const friendSearchResults = document.getElementById("friendSearchResults");

    const token = localStorage.getItem("token");
    console.log(userId);
    // ✅ Загрузка друзей и их маршрутов
    function loadFriends() {
        fetch(`/api/friends/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                friendsList.innerHTML = "";

                if (!data || data.length === 0) {
                    noFriendsMessage.style.display = "block";
                    return;
                }

                noFriendsMessage.style.display = "none";

                const groupedFriends = {};
                data.forEach(({ id, name, route_id, route_name }) => {
                    if (!groupedFriends[id]) {
                        groupedFriends[id] = { name, routes: [] };
                    }
                    if (route_id && route_name) {
                        groupedFriends[id].routes.push({ id: route_id, name: route_name });
                    }
                });

                Object.entries(groupedFriends).forEach(([id, friend]) => {
                    const friendDiv = document.createElement("div");
                    friendDiv.classList.add("friend-card");

                    const routesHtml = friend.routes.length > 0
                        ? `<ul>
            ${friend.routes.map(route =>
                            `<li>${route.name} <button onclick="viewRoute(${route.id} style='margin-left:4px;')">Просмотр</button></li>`
                        ).join("")}
           </ul>`
                        : `<p>У пользователя нет избранных маршрутов</p>`;

                    friendDiv.innerHTML = `
        <h3>${friend.name}</h3>
        ${routesHtml}
    `;

                    friendDiv.innerHTML = `
                        <h3 style='padding-left:4px; border:2px solid black; margin:0;' >${friend.name}</h3>
                        <ul>
                            ${friend.routes.map(route =>
                        `<li>${route.name} <button onclick="viewRoute(${route.id} style='margin-left:4px;)">Просмотр</button></li>`
                    ).join("")}
                        </ul>
                    `;
                    friendsList.appendChild(friendDiv);
                });
            })
            .catch(error => console.error("Ошибка загрузки друзей:", error));
    }

    // 🔍 Поиск друга по имени
    friendSearchInput.addEventListener("input", () => {
        const query = friendSearchInput.value.trim();
        if (query.length < 2) {
            friendSearchResults.innerHTML = "";
            return;
        }

        fetch(`/api/user/search?name=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(users => {
                friendSearchResults.innerHTML = "";
                if (users.length === 0) {
                    friendSearchResults.innerHTML = "<p>Пользователь не найден</p>";
                    return;
                }

                users.forEach(user => {
                    const result = document.createElement("div");
                    result.innerHTML = `
                        <p>${user.name}</p>
                        <button data-id="${user.id}" class="addFriendBtn">Добавить в друзья</button>
                    `;
                    friendSearchResults.appendChild(result);
                });

                document.querySelectorAll(".addFriendBtn").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const friendId = btn.getAttribute("data-id");
                        console.log(friendId);

                        const response = await fetch("/api/friends/add", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",

                            },
                            credentials: "include",
                            body: JSON.stringify({ friendId })
                        });

                        if (response.ok) {
                            alert("Друг добавлен!");
                            loadFriends();
                        } else {
                            alert("Ошибка при добавлении друга");
                        }
                    });
                });
            });
    });

    // 📦 Кнопка раскрытия поиска
    addFriendBtn.addEventListener("click", () => {
        addFriendSection.style.display =
            addFriendSection.style.display === "none" ? "block" : "none";
    });

    // 🚀 Загружаем друзей при загрузке страницы
    loadFriends();
});

// 🔗 Просмотр маршрута
function viewRoute(routeId) {
    window.location.href = `/route/${routeId}`;
}
