document.addEventListener("DOMContentLoaded", function() {

    const searchInput = document.getElementById("userSearch");

    if (searchInput) {

        searchInput.addEventListener("keyup", function() {

            const value = this.value.toLowerCase();

            const rows = document.querySelectorAll(".user-row");

            rows.forEach((row) => {

                const text = row.innerText.toLowerCase();

                if (text.includes(value)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }

            });

        });

    }

});


const noteSearch = document.getElementById("noteSearch");

if (noteSearch) {
    noteSearch.addEventListener("keyup", function() {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".note-row").forEach(row => {

            const text = row.innerText.toLowerCase();

            if (text.includes(value)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        });

    });
}