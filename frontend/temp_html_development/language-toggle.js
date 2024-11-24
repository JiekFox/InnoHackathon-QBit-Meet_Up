document.getElementById("language-toggle").addEventListener("click", function () {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === "en" ? "ru" : "en";
    document.documentElement.lang = newLang;

    // Перевод контента в зависимости от выбранного языка
    const translations = {
        en: {
            title: "Public MeetUps!",
            description: "Here you can find Meetings available to everyone that you can make an assignment for",
            createButton: "Create"
        },
        ru: {
            title: "Общественные встречи!",
            description: "Здесь вы можете найти встречи, доступные всем, на которые вы можете записаться.",
            createButton: "Создать"
        }
    };

    const elements = translations[newLang];
    document.querySelector(".intro > .title").textContent = elements.title;
    document.querySelector(".intro > .description").textContent = elements.description;
    document.querySelector(".create-meeting-button").textContent = elements.createButton;
});
