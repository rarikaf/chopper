let cards = JSON.parse(localStorage.getItem("myCards")) || [];


// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    renderCards();

    document
        .getElementById("search")
        .addEventListener("input", renderCards);

    document
        .getElementById("filter")
        .addEventListener("change", renderCards);

});


// ==============================
// MODAL
// ==============================

function openAddModal() {

    document.getElementById("modal").style.display = "flex";

}

function closeModal() {

    document.getElementById("modal").style.display = "none";

    document.getElementById("cardCode").value = "";
    document.getElementById("cardName").value = "";
    document.getElementById("cardSet").value = "";
    document.getElementById("cardImage").value = "";

    document.getElementById("preview").innerHTML = "";

}


// ==============================
// PREVIEW DA FOTO
// ==============================

document
    .getElementById("cardImage")
    .addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (event) {

            document.getElementById("preview").innerHTML = `
                <img src="${event.target.result}">
            `;

        };

        reader.readAsDataURL(file);

    });


// ==============================
// ADICIONAR CARTA
// ==============================

function addCard() {

    const code =
        document.getElementById("cardCode").value.trim();

    const name =
        document.getElementById("cardName").value.trim();

    const set =
        document.getElementById("cardSet").value.trim();

    const imageInput =
        document.getElementById("cardImage");

    if (!code || !name || !imageInput.files[0]) {

        alert("Preencha o código, nome e escolha uma foto.");

        return;

    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const newCard = {

            id: Date.now(),

            code: code,

            name: name,

            set: set,

            image: event.target.result,

            owned: false,

            quantity: 0

        };

        cards.push(newCard);

        saveCards();

        closeModal();

        renderCards();

    };

    reader.readAsDataURL(imageInput.files[0]);

}


// ==============================
// MARCAR COMO TENHO
// ==============================

function markOwned(id) {

    const card = cards.find(card => card.id === id);

    if (!card) return;

    card.owned = true;

    if (card.quantity < 1) {
        card.quantity = 1;
    }

    saveCards();

    renderCards();

}


// ==============================
// MARCAR COMO FALTA
// ==============================

function markMissing(id) {

    const card = cards.find(card => card.id === id);

    if (!card) return;

    card.owned = false;

    card.quantity = 0;

    saveCards();

    renderCards();

}


// ==============================
// AUMENTAR QUANTIDADE
// ==============================

function increaseQuantity(id) {

    const card = cards.find(card => card.id === id);

    if (!card) return;

    card.quantity++;

    card.owned = true;

    saveCards();

    renderCards();

}


// ==============================
// DIMINUIR QUANTIDADE
// ==============================

function decreaseQuantity(id) {

    const card = cards.find(card => card.id === id);

    if (!card) return;

    if (card.quantity > 0) {
        card.quantity--;
    }

    if (card.quantity === 0) {
        card.owned = false;
    }

    saveCards();

    renderCards();

}


// ==============================
// EXCLUIR CARTA
// ==============================

function deleteCard(id) {

    const confirmDelete =
        confirm("Deseja realmente excluir esta carta?");

    if (!confirmDelete) return;

    cards = cards.filter(card => card.id !== id);

    saveCards();

    renderCards();

}


// ==============================
// SALVAR
// ==============================

function saveCards() {

    localStorage.setItem(
        "myCards",
        JSON.stringify(cards)
    );

}


// ==============================
// RENDERIZAR CARTAS
// ==============================

function renderCards() {

    const container =
        document.getElementById("cards");

    const search =
        document
            .getElementById("search")
            .value
            .toLowerCase();

    const filter =
        document.getElementById("filter").value;


    let filteredCards = cards.filter(card => {

        const matchesSearch =

            card.name
                .toLowerCase()
                .includes(search)

            ||

            card.code
                .toLowerCase()
                .includes(search)

            ||

            card.set
                .toLowerCase()
                .includes(search);


        let matchesFilter = true;


        if (filter === "owned") {
            matchesFilter = card.owned;
        }


        if (filter === "missing") {
            matchesFilter = !card.owned;
        }


        return matchesSearch && matchesFilter;

    });


    container.innerHTML = "";


    if (filteredCards.length === 0) {

        container.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #64748b;
            ">
                <h2>📭 Nenhuma carta encontrada</h2>

                <p>
                    Adicione sua primeira carta usando
                    o botão "Adicionar carta".
                </p>
            </div>
        `;

    }


    filteredCards.forEach(card => {

        const cardElement =
            document.createElement("div");

        cardElement.className = "card";


        const statusClass =
            card.owned ? "owned" : "missing";

        const statusText =
            card.owned
                ? `✅ Tenho (${card.quantity})`
                : "❌ Falta";


        cardElement.innerHTML = `

            <img
                class="card-image"
                src="${card.image}"
                alt="${card.name}"
            >

            <div class="card-info">

                <div class="card-code">
                    ${card.code}
                </div>

                <div class="card-name">
                    ${card.name}
                </div>

                <div class="card-set">
                    ${card.set || "Sem coleção"}
                </div>

                <div class="status ${statusClass}">
                    ${statusText}
                </div>


                ${
                    card.owned
                    ?
                    `
                    <div class="card-buttons">

                        <button
                            class="missing-button"
                            onclick="decreaseQuantity(${card.id})"
                        >
                            −
                        </button>

                        <button
                            class="have-button"
                            onclick="increaseQuantity(${card.id})"
                        >
                            + Cópia
                        </button>

                    </div>
                    `
                    :
                    `
                    <div class="card-buttons">

                        <button
                            class="have-button"
                            onclick="markOwned(${card.id})"
                        >
                            ✅ Tenho
                        </button>

                    </div>
                    `
                }


                ${
                    card.owned
                    ?
                    `
                    <button
                        class="missing-button"
                        style="width:100%; margin-top:7px;"
                        onclick="markMissing(${card.id})"
                    >
                        ❌ Marcar como falta
                    </button>
                    `
                    :
                    ""
                }


                <button
                    class="delete-button"
                    onclick="deleteCard(${card.id})"
                >
                    🗑️ Excluir
                </button>

            </div>
        `;


        container.appendChild(cardElement);

    });


    updateStats();

}


// ==============================
// ESTATÍSTICAS
// ==============================

function updateStats() {

    const total = cards.length;

    const owned =
        cards.filter(card => card.owned).length;

    const missing =
        total - owned;


    const percentage =
        total === 0
            ? 0
            : Math.round((owned / total) * 100);


    document.getElementById("totalCards")
        .textContent = total;


    document.getElementById("ownedCards")
        .textContent = owned;


    document.getElementById("missingCards")
        .textContent = missing;


    document.getElementById("percentage")
        .textContent = percentage + "%";


    document.getElementById("progressText")
        .textContent = `${owned} / ${total}`;


    document.getElementById("progressBar")
        .style.width = percentage + "%";

}
