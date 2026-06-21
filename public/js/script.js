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