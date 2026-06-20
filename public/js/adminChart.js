window.addEventListener("load", () => {

    const canvas = document.getElementById("notesChart");

    if (!canvas) return;

    new Chart(canvas, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
                label: "Notes Upload",
                data: [10, 18, 15, 30, 28, 40],
                borderWidth: 3,
                tension: 0.4
            }]
        }
    });

});