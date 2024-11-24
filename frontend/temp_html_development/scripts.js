document.getElementById("log-out").addEventListener("click", function () {
    document.getElementById("logout-modal").style.display = "block";
});

document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("logout-modal").style.display = "none";
});

document.getElementById("decline-logout").addEventListener("click", function () {
    document.getElementById("logout-modal").style.display = "none";
});

// Добавить логику подтверждения для выхода
document.getElementById("confirm-logout").addEventListener("click", function () {
    alert("Logged out successfully!");
    document.getElementById("logout-modal").style.display = "none";
});
