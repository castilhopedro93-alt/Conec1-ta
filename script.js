/* =========================================================
   CONEC-TA
   SISTEMA DE RESERVA DE SALAS
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const DEFAULT_ROOMS = [

    {
        id: "sala-01",
        resources: ["projetor", "ar", "quadro"],
        name: "Sala 01",
        number: 1,
        capacity: 20,
        description: "Sala para reuniões e atividades administrativas.",
        icon: "▣"
    },

    {
        id: "sala-02",
        resources: ["quadro"],
        name: "Sala 02",
        number: 2,
        capacity: 15,
        description: "Ambiente ideal para reuniões menores.",
        icon: "◇"
    },

    {
        id: "sala-03",
        resources: ["projetor", "ar", "som", "acessivel"],
        name: "Sala 03",
        number: 3,
        capacity: 30,
        description: "Espaço amplo para treinamentos e apresentações.",
        icon: "▦"
    },

    {
        id: "sala-04",
        resources: ["ar"],
        name: "Sala 04",
        number: 4,
        capacity: 10,
        description: "Sala compacta para reuniões rápidas.",
        icon: "○"
    },

    {
        id: "sala-05",
        resources: ["computadores", "projetor", "ar"],
        name: "Sala 05",
        number: 5,
        capacity: 20,
        description: "Sala equipada para encontros de equipe.",
        icon: "△"
    },

    {
        id: "sala-06",
        resources: ["quadro", "acessivel"],
        name: "Sala 06",
        number: 6,
        capacity: 12,
        description: "Ambiente reservado para pequenas equipes.",
        icon: "□"
    }

];


const TIMES = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00"
];


// Horário de funcionamento: reservas de 30 em 30 minutos
const DAY_START = 8 * 60;   // 08:00
const DAY_END = 18 * 60;    // 18:00
const STEP = 30;

const HOUR_HEIGHT = 65;     // altura de 1 hora na agenda (px)


// Recursos que uma sala pode ter
const RESOURCES = [
    { id: "projetor", label: "Projetor" },
    { id: "ar", label: "Ar-condicionado" },
    { id: "computadores", label: "Computadores" },
    { id: "acessivel", label: "Acessível" },
    { id: "quadro", label: "Quadro branco" },
    { id: "som", label: "Caixa de som" }
];


const ROOM_ICONS = ["▣", "◇", "▦", "○", "△", "□", "◈", "▤", "⬡", "☆"];


const STORAGE_KEYS = {
    rooms: "conecta_rooms",
    reservations: "conecta_reservations",
    history: "conecta_historico",
    theme: "conecta_theme"
};


// Traz os dados salvos com o nome antigo do sistema, se existirem
migrateOldStorage();


let rooms = loadRooms();

let reservations =
    (
        JSON.parse(
            localStorage.getItem(STORAGE_KEYS.reservations)
        ) || []
    ).map(normalizeReservation);


let selectedAgendaDate = new Date();

let editingReservationId = null;


/* =========================================================
   ÍCONES (SVG desenhados à mão, 24x24, traço)
========================================================= */

const ICON_PATHS = {
    dashboard: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    agenda: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><circle cx="8" cy="14" r=".9" fill="currentColor"/><circle cx="12" cy="14" r=".9" fill="currentColor"/><circle cx="16" cy="14" r=".9" fill="currentColor"/><circle cx="8" cy="17.5" r=".9" fill="currentColor"/><circle cx="12" cy="17.5" r=".9" fill="currentColor"/>',
    salas: '<path d="M5.5 21V4.5A1.5 1.5 0 0 1 7 3h10a1.5 1.5 0 0 1 1.5 1.5V21z"/><path d="M3 21h18"/><circle cx="14.8" cy="12.5" r="1.1" fill="currentColor"/>',
    reservas: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V2.8h6V4"/><path d="m8.8 13 2.3 2.3 4.3-4.6"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/><path d="M8 10.5h5M10.5 8v5"/>',
    criar: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
    exportar: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4.5 16.5v2A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-2"/>',
    predio: '<path d="M4 21V5.5A2.5 2.5 0 0 1 6.5 3h7A2.5 2.5 0 0 1 16 5.5V21"/><path d="M16 9h2.5A2.5 2.5 0 0 1 21 11.5V21M2.5 21h19M8 7.5h4M8 11.5h4M8 15.5h4"/>',
    livre: '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16.2 9"/>',
    hoje: '<rect x="3" y="4.5" width="13" height="13" rx="2.5"/><path d="M3 8.5h13M7 2.5v3.5M12 2.5v3.5"/><circle cx="17.5" cy="17.5" r="4.5"/><path d="M17.5 15.6v2l1.4 1.1"/>',
    ocupacao: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.4A9 9 0 0 1 20.6 9H15z"/>',
    projetor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4.5M8 20.5h8M7 12.5l3-3 2.5 2 4.5-4.5"/>',
    computador: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20.5h8M12 16v4.5"/><path d="M7 8h6M7 11h4"/>',
    pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.7"/><path d="M15.8 14.3a5 5 0 0 1 5.7 5"/>',
    livro: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/><path d="M9 7.5h7"/>',
    conversa: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4.5V16h-.5"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    relatorios: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
    download: '<path d="M12 4v11"/><path d="m8 11 4 4 4-4"/><path d="M5 20h14"/>',
    historico: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4.5h4.5"/><path d="M12 7.5V12l3 2"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5a8 8 0 0 1 16 0"/>',
    sair: '<path d="M14 4.5h3.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
    lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    lapis: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    lixeira: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    ideia: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'
};


// Ícone de cada sala, na ordem em que aparecem (repete se houver mais salas)
const ROOM_ICON_KEYS = ["projetor", "pessoas", "ideia", "conversa", "computador", "livro"];


function iconSVG(name) {
    return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
}


// Cor (0 a 5) e ícone de cada sala, pela posição dela na lista
function getRoomColor(roomId) {
    return String(Math.max(rooms.findIndex(room => room.id === roomId), 0) % 6);
}

function getRoomIcon(roomId) {
    const index = Math.max(rooms.findIndex(room => room.id === roomId), 0);
    return iconSVG(ROOM_ICON_KEYS[index % ROOM_ICON_KEYS.length]);
}


// Coloca os ícones fixos da página (menu, números e botões)
function applyIcons() {

    const navMap = {
        dashboard: "dashboard",
        agenda: "agenda",
        salas: "salas",
        reservas: "reservas",
        "buscar-sala": "buscar",
        "criar-sala": "criar",
        "minhas-reservas": "usuario",
        historico: "historico",
        relatorios: "relatorios"
    };

    $$(".nav-item").forEach(item => {
        const icon = item.querySelector(".nav-icon");
        if (icon && navMap[item.dataset.section]) {
            icon.innerHTML = iconSVG(navMap[item.dataset.section]);
        }
    });

    ["predio", "livre", "hoje", "ocupacao"].forEach((name, index) => {
        const stat = $$(".stat-icon")[index];
        if (stat) stat.innerHTML = iconSVG(name);
    });

    $("#exportButton").innerHTML = iconSVG("exportar");

    // Botão Sair com o mesmo estilo de ícone do menu
    const logoutIcon = $(".logout-button .nav-icon");
    if (logoutIcon) logoutIcon.innerHTML = iconSVG("sair");

    // Mostra quem está logado no rodapé do menu
    try {
        const sessao = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (sessao && sessao.nome) {
            $("#loggedUserName").textContent = `Olá, ${sessao.nome.split(" ")[0]}`;
            $("#loggedUserEmail").textContent = sessao.email || "";
        }
    } catch (error) {
        // sem sessão salva: mantém o texto padrão
    }

    const searchIcon = $(".search-box > span");
    if (searchIcon) searchIcon.innerHTML = iconSVG("buscar");

}


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", initialize);


function initialize() {

    applyIcons();
    populateRoomSelects();
    populateTimeSelect();
    setMinimumDate();
    setupNavigation();
    setupModal();
    setupFilters();
    setupAgendaControls();
    setupTheme();
    setupExport();
    setupRoomForm();
    setupResourcePickers();
    setupSearch();
    setupHistory();
    setupReport();
    renderAll();


    // Atualiza a cada minuto o que depende da hora atual
    // (salas livres agora, próximas reservas, status)
    setInterval(() => {
        renderStats();
        renderTodaySchedule();
        renderRecentReservations();
        renderRooms();
        renderMyReservations();
    }, 60 * 1000);

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function setupNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            navigateTo(section);

            $("#sidebar").classList.remove("open");

        });

    });


    $$("[data-go]").forEach(button => {

        button.addEventListener("click", () => {

            navigateTo(button.dataset.go);

        });

    });


    $("#mobileMenu").addEventListener("click", () => {

        $("#sidebar").classList.toggle("open");

    });

}


function navigateTo(section) {

    $$(".page-section").forEach(page => {

        page.classList.remove("active");

    });


    const target = document.getElementById(section);

    if (!target) return;

    target.classList.add("active");


    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.section === section
        );

    });


    const titles = {
        dashboard: "Dashboard",
        agenda: "Agenda",
        salas: "Salas",
        reservas: "Reservas",
        "criar-sala": "Criar Sala",
        "minhas-reservas": "Minhas reservas",
        historico: "Histórico",
        relatorios: "Relatórios",
        "buscar-sala": "Buscar sala"
    };


    $("#pageTitle").textContent =
        titles[section] || "Dashboard";


    if (section === "agenda") {
        renderAgenda();
    }

    if (section === "reservas") {
        renderReservationsTable();
    }

    if (section === "buscar-sala") {
        runSearch();
    }

    if (section === "minhas-reservas") {
        renderMyReservations();
    }

    if (section === "historico") {
        historyLimit = HISTORY_PAGE;
        renderHistory();
    }

    if (section === "relatorios") {
        renderReport();
    }

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    $("#myNewReservation").addEventListener("click", () => openReservationModal());

    $("#newReservationButton").addEventListener(
        "click",
        () => openReservationModal()
    );

    $("#closeModal").addEventListener("click", closeReservationModal);

    $("#cancelModal").addEventListener("click", closeReservationModal);

    $("#closeDetails").addEventListener("click", closeDetailsModal);


    $("#reservationModal").addEventListener("click", event => {

        if (event.target === $("#reservationModal")) {
            closeReservationModal();
        }

    });


    $("#detailsModal").addEventListener("click", event => {

        if (event.target === $("#detailsModal")) {
            closeDetailsModal();
        }

    });


    $("#reservationForm").addEventListener(
        "submit",
        handleReservationSubmit
    );


    // Modal de confirmação
    $("#confirmOk").addEventListener("click", () => closeConfirm(true));

    $("#confirmCancel").addEventListener("click", () => closeConfirm(false));

    $("#confirmModal").addEventListener("click", event => {

        if (event.target === $("#confirmModal")) {
            closeConfirm(false);
        }

    });

    $("#room").addEventListener("change", checkConflict);

    $("#date").addEventListener("change", () => {
        updateStartOptions();
        updateEndOptions();
        updateRepeatFields();
        checkConflict();
    });

    $("#startTime").addEventListener("change", () => {
        updateEndOptions();
        checkConflict();
    });

    $("#endTime").addEventListener("change", checkConflict);

    $("#participants").addEventListener("input", checkConflict);

    $("#repeat").addEventListener("change", () => {
        updateRepeatFields();
        checkConflict();
    });

    $("#repeatUntil").addEventListener("change", checkConflict);

    $("#confirmAlt").addEventListener("click", () => closeConfirm("alt"));

}


function openReservationModal(options = {}) {

    editingReservationId = options.id || null;


    $("#reservationForm").reset();

    // Data mínima = hoje (atualiza caso a página fique aberta de um dia para o outro)
    $("#date").min = getTodayString();

    // Já abre com a data de hoje
    $("#date").value = options.date || getTodayString();

    $("#conflictMessage").classList.remove("active");

    // Reabilita o botão caso tenha ficado desabilitado por um conflito anterior
    $("#submitReservation").disabled = false;

    // Repetição: só ao criar (ao editar, muda apenas aquela reserva)
    $("#repeat").value = "none";
    $("#repeatUntil").value = "";
    $$(".repeat-field").forEach(field => {
        field.hidden = Boolean(options.id);
    });
    updateRepeatFields();


    if (options.room) {
        $("#room").value = options.room;
    }

    if (options.date) {
        $("#date").value = options.date;
    }

    updateStartOptions();

    if (options.startTime) {
        $("#startTime").value = options.startTime;
    }

    updateEndOptions();

    if (options.endTime) {
        $("#endTime").value = options.endTime;
    }

    if (options.participants) {
        $("#participants").value = options.participants;
    }


    // Nova reserva: o responsável já vem com o nome de quem está logado
    const currentUser = getCurrentUser();

    if (!options.id && currentUser) {
        $("#responsible").value = currentUser.nome;
    }


    if (options.id) {

        const reservation = reservations.find(
            item => item.id === options.id
        );

        if (!reservation) return;

        // Só quem fez a reserva pode editar
        if (!canManageReservation(reservation)) {
            showToast(`Só ${getOwnerName(reservation)} pode editar esta reserva.`, "warning");
            return;
        }

        $("#room").value = reservation.room;
        $("#date").value = reservation.date;
        $("#startTime").value = reservation.startTime;
        updateStartOptions();
        updateEndOptions();
        $("#endTime").value = reservation.endTime;
        $("#responsible").value = reservation.responsible;
        $("#purpose").value = reservation.purpose || "";
        $("#participants").value = reservation.participants || "";

    }


    $("#reservationModal").classList.add("active");


    setTimeout(() => {
        $("#responsible").focus();
    }, 100);

}


function closeReservationModal() {

    $("#reservationModal").classList.remove("active");

    editingReservationId = null;

}


/* =========================================================
   FORMULÁRIO
========================================================= */

function handleReservationSubmit(event) {

    event.preventDefault();


    const room = $("#room").value;
    const date = $("#date").value;
    const startTime = $("#startTime").value;
    const endTime = $("#endTime").value;
    const responsible = $("#responsible").value.trim();
    const purpose = $("#purpose").value.trim();


    if (!room || !date || !startTime || !endTime || !responsible) {

        showToast(
            "Preencha todos os campos obrigatórios.",
            "error"
        );

        return;

    }


    // Mesmas regras usadas no aviso do formulário
    const problem = getReservationProblem();

    if (problem) {

        checkConflict();

        showToast(problem, "error");

        return;

    }


    const roomInfo = rooms.find(item => item.id === room);


    if (editingReservationId) {

        const original = reservations.find(item => item.id === editingReservationId);

        if (original && !canManageReservation(original)) {
            showToast(`Só ${getOwnerName(original)} pode editar esta reserva.`, "error");
            return;
        }

        const index = reservations.findIndex(
            item => item.id === editingReservationId
        );


        if (index !== -1) {

            const before = { ...reservations[index] };

            reservations[index] = {
                ...reservations[index],
                room,
                date,
                startTime,
                endTime,
                responsible,
                purpose,
                participants: Number($("#participants").value) || null,
                roomName: roomInfo.name
            };

            const changes = describeChanges(before, reservations[index]);

            // Só registra se algo realmente mudou
            if (changes.length) {
                logHistory("editada", reservations[index], { changes });
            }

        }


        saveReservations();
        closeReservationModal();
        renderAll();

        showToast("Reserva atualizada com sucesso.");

        return;

    }


    const dates = getOccurrenceDates();

    const currentUser = getCurrentUser();

    const seriesId = dates.length > 1 ? createId() : null;


    dates.forEach(occurrenceDate => {

        reservations.push({

            id: createId(),

            room,
            roomName: roomInfo.name,
            date: occurrenceDate,
            startTime,
            endTime,
            responsible,
            purpose,
            participants: Number($("#participants").value) || null,
            seriesId,
            ownerEmail: currentUser ? currentUser.email : null,
            ownerName: currentUser ? currentUser.nome : null,
            createdAt: new Date().toISOString()

        });

    });


    // Registra no histórico (uma linha por reserva ou por série semanal)
    const created = reservations.slice(-dates.length);

    logHistory("criada", created[0], {
        count: dates.length,
        until: dates.length > 1 ? dates[dates.length - 1] : null
    });


    saveReservations();
    closeReservationModal();
    renderAll();


    showToast(
        dates.length > 1
            ? `${dates.length} reservas criadas, toda semana até ${formatDate(dates[dates.length - 1])}.`
            : "Reserva criada com sucesso."
    );

}


function createId() {

    return crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);

}


/* =========================================================
   REPETIÇÃO SEMANAL
========================================================= */

const MAX_WEEKS = 26;


function updateRepeatFields() {

    const weekly = $("#repeat").value === "weekly";

    const untilField = $("#repeatUntilField");

    const untilInput = $("#repeatUntil");


    untilField.hidden = !weekly || Boolean(editingReservationId);

    untilInput.required = weekly && !editingReservationId;

    untilInput.min = $("#date").value || getTodayString();


    // Sugere 4 semanas à frente
    if (weekly && !untilInput.value && $("#date").value) {
        untilInput.value = addDays($("#date").value, 7 * 4);
    }

}


// Lista de datas da reserva: só a escolhida ou uma por semana
function getOccurrenceDates() {

    const date = $("#date").value;

    if (!date) return [];


    if ($("#repeat").value !== "weekly" || editingReservationId) {
        return [date];
    }


    const until = $("#repeatUntil").value;

    if (!until || until < date) return [date];


    const dates = [];

    for (
        let current = date;
        current <= until && dates.length < MAX_WEEKS;
        current = addDays(current, 7)
    ) {
        dates.push(current);
    }

    return dates;

}


function addDays(dateString, days) {

    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day + days);

    return toDateString(date);

}


/* =========================================================
   CONFLITO
========================================================= */

// Retorna o texto do problema (ou "" se estiver tudo certo)
function getReservationProblem() {

    const room = $("#room").value;
    const date = $("#date").value;
    const startTime = $("#startTime").value;
    const endTime = $("#endTime").value;


    if (!room || !date || !startTime || !endTime) return "";


    // Capacidade da sala x número de participantes
    const participants = Number($("#participants").value) || 0;

    const roomInfo = rooms.find(item => item.id === room);

    if (roomInfo && roomInfo.capacity && participants > roomInfo.capacity) {
        return `A ${roomInfo.name} comporta até ${roomInfo.capacity} pessoas. Escolha uma sala maior ou diminua o número de participantes.`;
    }


    if (toMinutes(endTime) <= toMinutes(startTime)) {
        return "O horário de término precisa ser depois do início.";
    }


    if (isStartInPast(date, startTime)) {
        return "Esse horário já passou. Escolha um horário a partir de agora.";
    }


    if ($("#repeat").value === "weekly" && !editingReservationId) {

        const until = $("#repeatUntil").value;

        if (!until) {
            return "Escolha até quando a reserva vai se repetir.";
        }

        if (until < date) {
            return "A data final da repetição precisa ser depois da data da reserva.";
        }

        if (addDays(date, 7 * (MAX_WEEKS - 1)) < until) {
            return `A repetição pode ter no máximo ${MAX_WEEKS} semanas.`;
        }

    }


    const conflicts = getOccurrenceDates()
        .map(occurrenceDate =>
            findConflict(room, occurrenceDate, startTime, endTime)
        )
        .filter(Boolean);


    if (!conflicts.length) return "";


    if (conflicts.length === 1 && conflicts[0].date === date) {

        const conflict = conflicts[0];

        return `Esta sala já está reservada das ${conflict.startTime} às ${conflict.endTime} (${conflict.responsible}).`;

    }


    const list = conflicts
        .slice(0, 4)
        .map(item => formatDate(item.date).slice(0, 5))
        .join(", ");

    const more = conflicts.length > 4 ? ` e mais ${conflicts.length - 4}` : "";

    return `A sala já está ocupada nesse horário em ${list}${more}.`;

}


function checkConflict() {

    const message = getReservationProblem();


    $("#conflictText").textContent = message;

    $("#conflictMessage").classList.toggle("active", Boolean(message));

    $("#submitReservation").disabled = Boolean(message);

}


// Retorna a reserva que se sobrepõe ao horário escolhido (ou undefined)
function findConflict(room, date, startTime, endTime) {

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);


    return reservations.find(item =>
        item.id !== editingReservationId &&
        item.room === room &&
        item.date === date &&
        start < toMinutes(item.endTime) &&
        end > toMinutes(item.startTime)
    );

}


/* =========================================================
   SELECTS
========================================================= */

function populateRoomSelects() {

    const roomSelect = $("#room");
    const filterRoom = $("#filterRoom");

    const currentRoom = roomSelect.value;
    const currentFilter = filterRoom.value;


    roomSelect.innerHTML =
        `<option value="">Selecione uma sala</option>`;

    filterRoom.innerHTML =
        `<option value="all">Todas as salas</option>`;


    rooms.forEach(room => {

        const option =
            `<option value="${room.id}">${escapeHTML(getRoomLabel(room))}</option>`;

        roomSelect.insertAdjacentHTML("beforeend", option);

        filterRoom.insertAdjacentHTML("beforeend", option);

    });


    // Mantém a seleção anterior, se a sala ainda existir
    if (rooms.some(room => room.id === currentRoom)) {
        roomSelect.value = currentRoom;
    }

    if (rooms.some(room => room.id === currentFilter)) {
        filterRoom.value = currentFilter;
    }

}


function populateTimeSelect() {

    const startSelect = $("#startTime");
    const endSelect = $("#endTime");


    for (let minutes = DAY_START; minutes < DAY_END; minutes += STEP) {

        const time = fromMinutes(minutes);

        startSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${time}">${time}</option>`
        );

    }


    for (let minutes = DAY_START + STEP; minutes <= DAY_END; minutes += STEP) {

        const time = fromMinutes(minutes);

        endSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${time}">${time}</option>`
        );

    }

}


// Bloqueia os horários de início que já passaram (só quando a data é hoje)
function updateStartOptions() {

    const date = $("#date").value;
    const startSelect = $("#startTime");


    [...startSelect.options].forEach(option => {

        if (!option.value) return;

        option.disabled =
            isStartInPast(date, option.value) &&
            option.value !== getEditingOriginal("startTime", date);

    });


    // Se o horário escolhido ficou bloqueado, limpa a seleção
    const selected = startSelect.selectedOptions[0];

    if (selected && selected.disabled) {
        startSelect.value = "";
    }

}


// Ao editar uma reserva que já começou, o horário original continua válido
function getEditingOriginal(field, date) {

    if (!editingReservationId) return null;

    const original = reservations.find(
        item => item.id === editingReservationId
    );

    if (!original || original.date !== date) return null;

    return original[field];

}


function isStartInPast(date, startTime) {

    if (!date || !startTime) return false;


    const today = getTodayString();

    if (date > today) return false;

    if (date < today) return true;


    // Mesmo dia: compara com a hora atual
    if (startTime === getEditingOriginal("startTime", date)) return false;

    return toMinutes(startTime) < getNowMinutes();

}


function getNowMinutes() {

    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();

}


// Só deixa escolher um término depois do início.
// Se o término ficou inválido, sugere 1 hora depois do início.
function updateEndOptions() {

    const startTime = $("#startTime").value;
    const endSelect = $("#endTime");


    const start = startTime ? toMinutes(startTime) : null;


    [...endSelect.options].forEach(option => {

        if (!option.value) return;

        option.disabled =
            start !== null && toMinutes(option.value) <= start;

    });


    if (
        start !== null &&
        (!endSelect.value || toMinutes(endSelect.value) <= start)
    ) {

        endSelect.value = fromMinutes(Math.min(start + 60, DAY_END));

    }

}


/* =========================================================
   DATA
========================================================= */

function getTodayString() {

    return toDateString(new Date());

}


function formatDate(dateString) {

    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;

}


function formatLongDate(dateString) {

    const [year, month, day] = dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}


function setMinimumDate() {

    $("#date").min = getTodayString();

    $("#date").value = getTodayString();

}


/* =========================================================
   STORAGE
========================================================= */

function saveReservations() {

    localStorage.setItem(
        STORAGE_KEYS.reservations,
        JSON.stringify(reservations)
    );

}


function saveRooms() {

    localStorage.setItem(
        STORAGE_KEYS.rooms,
        JSON.stringify(rooms)
    );

}


function loadRooms() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.rooms)
        );

        if (Array.isArray(saved) && saved.length) {

            // Salas salvas antes dos recursos existirem
            return saved.map(room => {

                if (Array.isArray(room.resources)) return room;

                const original = DEFAULT_ROOMS.find(item => item.id === room.id);

                return {
                    ...room,
                    resources: original ? [...original.resources] : []
                };

            });

        }

    } catch (error) {
        // Se os dados estiverem corrompidos, usa as salas padrão
    }

    return DEFAULT_ROOMS.map(room => ({ ...room }));

}


function migrateOldStorage() {

    const oldKeys = {
        roomflow_reservations: STORAGE_KEYS.reservations,
        roomflow_theme: STORAGE_KEYS.theme
    };


    Object.entries(oldKeys).forEach(([oldKey, newKey]) => {

        const oldValue = localStorage.getItem(oldKey);

        if (oldValue !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, oldValue);
        }

        localStorage.removeItem(oldKey);

    });

}


/* =========================================================
   RENDER GERAL
========================================================= */

function renderAll() {

    renderMyReservations();
    renderHistory();
    renderReport();

    runSearch();

    renderStats();
    renderTodaySchedule();
    renderRecentReservations();
    renderRooms();
    renderAgenda();
    renderReservationsTable();
    renderRoomList();

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function renderStats() {

    const today = getTodayString();


    const todayReservations = reservations.filter(
        item => item.date === today
    );


    // Salas ocupadas neste exato momento
    const busyNow = new Set(
        todayReservations
            .filter(isHappeningNow)
            .map(item => item.room)
    );


    const available = rooms.length - busyNow.size;


    // Ocupação = horas reservadas hoje / horas disponíveis em todas as salas
    const totalMinutes = rooms.length * (DAY_END - DAY_START);

    const bookedMinutes = todayReservations.reduce(
        (sum, item) => sum + getDuration(item),
        0
    );


    const occupancy =
        totalMinutes === 0
            ? 0
            : Math.round((bookedMinutes / totalMinutes) * 100);


    $("#totalRooms").textContent = rooms.length;

    $("#availableRooms").textContent = available;

    $("#todayReservations").textContent = todayReservations.length;

    $("#occupancy").textContent = `${occupancy}%`;

}


/* =========================================================
   AGENDA DE HOJE
========================================================= */

function renderTodaySchedule() {

    const container = $("#todaySchedule");

    const today = getTodayString();


    const items = reservations
        .filter(item => item.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("hoje")}</div>
                <p>Nenhuma reserva para hoje.</p>
            </div>
        `;

        return;

    }


    container.innerHTML = items.map(item => `

        <div class="schedule-item" data-id="${item.id}">

            <div class="schedule-time">
                ${item.startTime}
                <small>até ${item.endTime}</small>
            </div>

            <div class="schedule-main">
                <strong>${escapeHTML(item.roomName)}</strong>
                <span>${escapeHTML(item.responsible)}</span>
            </div>

            <span class="schedule-status">
                Reservado
            </span>

        </div>

    `).join("");


    container
        .querySelectorAll(".schedule-item")
        .forEach(element => {

            element.addEventListener("click", () =>
                showReservationDetails(element.dataset.id)
            );

        });

}


/* =========================================================
   RECENTES
========================================================= */

function renderRecentReservations() {

    const container = $("#recentReservations");


    // Só as que ainda não terminaram, da mais próxima para a mais distante
    const items = reservations
        .filter(item => !isPast(item))
        .sort((a, b) => {

            const first = `${a.date} ${a.startTime}`;
            const second = `${b.date} ${b.startTime}`;

            return first.localeCompare(second);

        })
        .slice(0, 5);


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("reservas")}</div>
                <p>Nenhuma reserva agendada.</p>
            </div>
        `;

        return;

    }


    container.innerHTML = items.map(item => `

        <div class="schedule-item" data-id="${item.id}">

            <div class="schedule-time">
                ${formatDate(item.date)}
            </div>

            <div class="schedule-main">
                <strong>${escapeHTML(item.roomName)}</strong>
                <span>${formatRange(item)} · ${escapeHTML(item.responsible)}</span>
            </div>

            <span class="schedule-status">
                ${getReservationStatus(item)}
            </span>

        </div>

    `).join("");


    container
        .querySelectorAll(".schedule-item")
        .forEach(element => {

            element.addEventListener("click", () =>
                showReservationDetails(element.dataset.id)
            );

        });

}


/* =========================================================
   SALAS
========================================================= */

function renderRooms() {

    const container = $("#roomsGrid");

    const today = getTodayString();


    container.innerHTML = rooms.map(room => {

        // Reservas desta sala que ainda não terminaram, em ordem
        const upcoming = reservations
            .filter(item => item.room === room.id && !isPast(item))
            .sort((a, b) =>
                `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
            );

        const current = upcoming.find(isHappeningNow);

        const next = upcoming.find(item => !isHappeningNow(item));


        // Status da sala
        let statusClass = "free";
        let statusText = "Livre";

        if (current) {
            statusClass = "busy";
            statusText = `Ocupada até ${current.endTime}`;
        } else if (next && next.date === today) {
            statusClass = "reserved";
            statusText = `Reservada hoje às ${next.startTime}`;
        } else if (next) {
            statusClass = "reserved";
            statusText = `Reservada em ${formatDate(next.date).slice(0, 5)}`;
        }


        // Lista das próximas reservas (até 3)
        const nextList = upcoming.slice(0, 3).map(item => `
            <li class="${isHappeningNow(item) ? "now" : ""}">
                <span class="room-next-when">
                    ${item.date === today ? "Hoje" : formatDate(item.date).slice(0, 5)}
                    · ${formatRange(item)}
                </span>
                <span class="room-next-who">${escapeHTML(item.responsible)}</span>
            </li>
        `).join("");

        const more = upcoming.length > 3
            ? `<li class="room-next-more">+${upcoming.length - 3} ${upcoming.length - 3 === 1 ? "reserva" : "reservas"}</li>`
            : "";

        const nextBlock = upcoming.length
            ? `<div class="room-next">
                   <span class="room-next-title">Próximas reservas</span>
                   <ul>${nextList}${more}</ul>
               </div>`
            : `<div class="room-next empty">Nenhuma reserva agendada.</div>`;


        return `

            <article class="room-card status-${statusClass}" data-color="${getRoomColor(room.id)}">

                <div class="room-cover">
                    ${getRoomIcon(room.id)}
                </div>

                <div class="room-body">

                    <span class="room-number">Nº ${room.number}</span>

                    <h3>${escapeHTML(room.name)}</h3>

                    <p>${escapeHTML(room.description || "Sem descrição.")}</p>

                    ${renderResourceChips(room.resources)}

                    ${nextBlock}

                    <div class="room-meta">

                        <span class="capacity">
                            👥 ${room.capacity ? `Até ${room.capacity} pessoas` : "Capacidade livre"}
                        </span>

                        <span class="room-status ${statusClass}">
                            ${statusText}
                        </span>

                    </div>

                </div>

            </article>

        `;

    }).join("");

}


/* =========================================================
   AGENDA
========================================================= */

function renderAgenda() {

    const dateString = toDateString(selectedAgendaDate);


    $("#agendaDate").textContent = formatDate(dateString);

    $("#agendaDateFull").textContent =
        capitalize(formatLongDate(dateString));


    renderAgendaRooms();

    renderAgendaTimes();

}


function renderAgendaRooms() {

    const header = $("#agendaRooms");

    const grid = $("#agendaGrid");


    header.style.gridTemplateColumns =
        `repeat(${rooms.length}, minmax(130px, 1fr))`;

    grid.style.gridTemplateColumns =
        `repeat(${rooms.length}, minmax(130px, 1fr))`;


    header.innerHTML = rooms.map((room, index) => `
        <div class="room-heading" data-color="${index % 6}">
            <span class="room-dot"></span>
            <span class="room-heading-text">
                <strong>${escapeHTML(room.name)}</strong>
                <small>${room.capacity ? `até ${room.capacity} pessoas` : "capacidade livre"}</small>
            </span>
        </div>
    `).join("");


    grid.innerHTML = rooms.map(room => `

        <div class="grid-column" data-room="${room.id}">

            ${TIMES.map(time => `
                <div
                    class="grid-cell"
                    data-room="${room.id}"
                    data-time="${time}"
                ></div>
            `).join("")}

        </div>

    `).join("");


    renderBookings();

}


function renderAgendaTimes() {

    const column = $("#timeColumn");


    column.innerHTML = TIMES.map(time => `
        <div class="time-slot">
            ${time}
        </div>
    `).join("");

}


function renderBookings() {

    const dateString = toDateString(selectedAgendaDate);

    const grid = $("#agendaGrid");


    reservations
        .filter(item => item.date === dateString)
        .forEach(reservation => {

            const column = grid.querySelector(
                `.grid-column[data-room="${reservation.room}"]`
            );

            if (!column) return;


            const start = Math.max(toMinutes(reservation.startTime), DAY_START);
            const end = Math.min(toMinutes(reservation.endTime), DAY_END);

            if (end <= start) return;


            const booking = document.createElement("div");

            booking.className = "booking";

            // Posição e altura proporcionais ao horário
            const top = ((start - DAY_START) / 60) * HOUR_HEIGHT;
            const height = ((end - start) / 60) * HOUR_HEIGHT;

            booking.style.top = `${top + 3}px`;

            booking.style.height = `${height - 6}px`;

            // Reservas de 30 min são baixas: mostra só o nome
            if (end - start <= 30) {
                booking.classList.add("compact");
            }


            // Cor da sala e iniciais de quem reservou
            const roomIndex = rooms.findIndex(room => room.id === reservation.room);

            booking.dataset.color = String(Math.max(roomIndex, 0) % 6);

            const initials = reservation.responsible
                .split(/\s+/)
                .filter(word => word && !/^(prof|dr|dra|sr|sra)\.?$/i.test(word))
                .slice(0, 2)
                .map(word => word[0].toUpperCase())
                .join("");

            if (isHappeningNow(reservation)) {
                booking.classList.add("now");
            }

            booking.innerHTML = `
                <i class="booking-avatar">${escapeHTML(initials)}</i>
                <span class="booking-text">
                    <strong>
                        ${escapeHTML(reservation.responsible)}
                    </strong>
                    <span>
                        ${formatRange(reservation)} ·
                        ${escapeHTML(reservation.purpose || "Reserva")}
                    </span>
                </span>
            `;


            booking.addEventListener("click", event => {

                event.stopPropagation();

                showReservationDetails(reservation.id);

            });


            column.appendChild(booking);

        });


    const today = getTodayString();


    // Linha vermelha da hora atual (só no dia de hoje, dentro do expediente)
    const nowMinutes = getNowMinutes();

    if (dateString === today && nowMinutes >= DAY_START && nowMinutes <= DAY_END) {

        const line = document.createElement("div");

        line.className = "now-line";

        line.style.top = `${((nowMinutes - DAY_START) / 60) * HOUR_HEIGHT}px`;

        line.innerHTML = `<span>${fromMinutes(nowMinutes)}</span>`;

        grid.appendChild(line);

    }


    $$("#agendaGrid .grid-cell").forEach(cell => {

        const cellStart = toMinutes(cell.dataset.time);


        // Horários que já terminaram não podem ser reservados
        const isPastCell =
            dateString < today ||
            (dateString === today && cellStart + 60 <= getNowMinutes());

        if (isPastCell) {
            cell.classList.add("past-cell");
            return;
        }


        cell.title = "Clique para reservar";


        cell.addEventListener("click", () => {

            // Se a hora já começou, sugere o próximo horário de 30 em 30 min
            let start = cellStart;

            if (dateString === today && start < getNowMinutes()) {
                start = Math.ceil(getNowMinutes() / STEP) * STEP;
            }


            openReservationModal({
                room: cell.dataset.room,
                date: dateString,
                startTime: fromMinutes(start),
                endTime: fromMinutes(Math.min(start + 60, DAY_END))
            });

        });

    });

}


/* =========================================================
   CONTROLES AGENDA
========================================================= */

function setupAgendaControls() {

    $("#previousDay").addEventListener("click", () => {

        selectedAgendaDate = new Date(selectedAgendaDate);

        selectedAgendaDate.setDate(
            selectedAgendaDate.getDate() - 1
        );

        renderAgenda();

    });


    $("#nextDay").addEventListener("click", () => {

        selectedAgendaDate = new Date(selectedAgendaDate);

        selectedAgendaDate.setDate(
            selectedAgendaDate.getDate() + 1
        );

        renderAgenda();

    });


    $("#todayButton").addEventListener("click", () => {

        selectedAgendaDate = new Date();

        renderAgenda();

    });

}


/* =========================================================
   TABELA DE RESERVAS
========================================================= */

function renderReservationsTable() {

    const table = $("#reservationsTable");

    const search = $("#searchInput").value.toLowerCase().trim();

    const roomFilter = $("#filterRoom").value;

    const dateFilter = $("#filterDate").value;

    const today = getTodayString();


    const filtered = reservations.filter(item => {

        const text = [
            item.roomName,
            item.responsible,
            item.purpose,
            item.date,
            item.startTime,
            item.endTime
        ]
            .join(" ")
            .toLowerCase();


        if (search && !text.includes(search)) {
            return false;
        }

        if (roomFilter !== "all" && item.room !== roomFilter) {
            return false;
        }

        if (dateFilter === "today" && item.date !== today) {
            return false;
        }

        if (dateFilter === "future" && item.date < today) {
            return false;
        }

        if (dateFilter === "past" && item.date >= today) {
            return false;
        }

        return true;

    });


    filtered.sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
    );


    if (!filtered.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Nenhuma reserva encontrada.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = filtered.map(item => {

        const past = isPast(item);

        return `

            <tr>

                <td>
                    <span class="room-badge" data-color="${getRoomColor(item.room)}">
                        ${escapeHTML(item.roomName)}
                    </span>
                </td>

                <td>${formatDate(item.date)}</td>

                <td><strong>${formatRange(item)}</strong></td>

                <td>
                    ${escapeHTML(item.responsible)}
                    ${isMine(item) ? `<span class="mine-badge">Você</span>` : ""}
                </td>

                <td>${escapeHTML(item.purpose || "—")}</td>

                <td>
                    <span class="status-badge ${past ? "past" : "upcoming"}">
                        ${past ? "Finalizada" : "Agendada"}
                    </span>
                </td>

                <td>
                    <button
                        class="action-button"
                        title="Detalhes"
                        data-action="details"
                        data-id="${item.id}"
                    >
                        ${iconSVG("olho")}
                    </button>
                </td>

            </tr>

        `;

    }).join("");


    table
        .querySelectorAll("[data-action='details']")
        .forEach(button => {

            button.addEventListener("click", () =>
                showReservationDetails(button.dataset.id)
            );

        });

}


/* =========================================================
   FILTROS
========================================================= */

function setupFilters() {

    $("#searchInput").addEventListener("input", renderReservationsTable);

    $("#filterRoom").addEventListener("change", renderReservationsTable);

    $("#filterDate").addEventListener("change", renderReservationsTable);

}


/* =========================================================
   DETALHES
========================================================= */

function showReservationDetails(id) {

    const reservation = reservations.find(item => item.id === id);

    if (!reservation) return;


    $("#reservationDetails").innerHTML = `

        <div class="details-list">

            <div class="detail-row">
                <span>Sala</span>
                <strong>${escapeHTML(reservation.roomName)}</strong>
            </div>

            <div class="detail-row">
                <span>Data</span>
                <strong>${formatDate(reservation.date)}</strong>
            </div>

            <div class="detail-row">
                <span>Horário</span>
                <strong>${formatRange(reservation)}</strong>
            </div>

            <div class="detail-row">
                <span>Responsável</span>
                <strong>${escapeHTML(reservation.responsible)}</strong>
            </div>

            <div class="detail-row">
                <span>Reservado por</span>
                <strong>
                    ${escapeHTML(getOwnerName(reservation))}
                    ${isMine(reservation) ? `<span class="mine-badge">Você</span>` : ""}
                </strong>
            </div>

            <div class="detail-row">
                <span>Participantes</span>
                <strong>${reservation.participants ? `${reservation.participants} pessoas` : "Não informado"}</strong>
            </div>

            <div class="detail-row">
                <span>Finalidade</span>
                <strong>${escapeHTML(reservation.purpose || "Não informada")}</strong>
            </div>

            ${reservation.seriesId ? `
                <div class="detail-row">
                    <span>Repetição</span>
                    <strong>Toda semana (${reservations.filter(item => item.seriesId === reservation.seriesId).length} no total)</strong>
                </div>
            ` : ""}

            ${canManageReservation(reservation) ? `
                <div class="modal-footer">

                    <button class="secondary-button" id="editReservation">
                        Editar
                    </button>

                    <button
                        class="primary-button"
                        id="deleteReservation"
                        style="background: var(--danger);"
                    >
                        Cancelar reserva
                    </button>

                </div>
            ` : `
                <p class="details-locked">
                    Esta reserva foi feita por <strong>${escapeHTML(getOwnerName(reservation))}</strong>.
                    Só essa pessoa pode editar ou cancelar.
                </p>
            `}

        </div>

    `;


    $("#detailsModal").classList.add("active");


    if (canManageReservation(reservation)) {

        $("#editReservation").addEventListener("click", () => {

            closeDetailsModal();

            openReservationModal({ id });

        });


        $("#deleteReservation").addEventListener("click", () =>
            deleteReservation(id)
        );

    }

}


function closeDetailsModal() {

    $("#detailsModal").classList.remove("active");

}


/* =========================================================
   EXCLUSÃO
========================================================= */

async function deleteReservation(id) {

    const reservation = reservations.find(item => item.id === id);

    if (!reservation) return;


    if (!canManageReservation(reservation)) {
        showToast(`Só ${getOwnerName(reservation)} pode cancelar esta reserva.`, "error");
        return;
    }


    // Outras reservas da mesma repetição semanal que ainda não aconteceram
    const series = reservation.seriesId
        ? reservations.filter(item =>
            item.seriesId === reservation.seriesId &&
            !isPast(item) &&
            canManageReservation(item)
        )
        : [];


    const isSeries = series.length > 1;


    const answer = await showConfirm({
        title: "Cancelar reserva?",
        message: isSeries
            ? `Esta reserva da <strong>${escapeHTML(reservation.roomName)}</strong> se repete toda semana. Cancelar só a de ${formatDate(reservation.date)} ou as <strong>${series.length}</strong> próximas?`
            : `A reserva da <strong>${escapeHTML(reservation.roomName)}</strong> em ${formatDate(reservation.date)}, das ${reservation.startTime} às ${reservation.endTime}, será cancelada.`,
        confirmText: isSeries ? "Só esta" : "Sim, cancelar",
        cancelText: "Voltar",
        altText: isSeries ? `Todas (${series.length})` : ""
    });

    if (!answer) return;


    if (answer === "alt") {

        const ids = new Set(series.map(item => item.id));

        logHistory("cancelada", series[0], {
            count: series.length,
            until: series[series.length - 1].date
        });

        reservations = reservations.filter(item => !ids.has(item.id));

    } else {

        logHistory("cancelada", reservation);

        reservations = reservations.filter(item => item.id !== id);

    }


    saveReservations();
    closeDetailsModal();
    renderAll();

    showToast(
        answer === "alt"
            ? `${series.length} reservas canceladas.`
            : "Reserva cancelada."
    );

}


/* =========================================================
   EXPORTAÇÃO CSV
========================================================= */

function setupExport() {

    $("#exportButton").addEventListener("click", exportCSV);

}


function exportCSV() {

    if (!reservations.length) {

        showToast(
            "Não existem reservas para exportar.",
            "warning"
        );

        return;

    }


    const header = [
        "Sala",
        "Data",
        "Início",
        "Término",
        "Responsável",
        "Finalidade"
    ];


    const rows = reservations.map(item => [
        item.roomName,
        formatDate(item.date),
        item.startTime,
        item.endTime,
        item.responsible,
        item.purpose || ""
    ]);


    const csv = [header, ...rows]
        .map(row =>
            row
                .map(value =>
                    `"${String(value).replaceAll('"', '""')}"`
                )
                .join(";")
        )
        .join("\n");


    const blob = new Blob(
        ["\ufeff" + csv],
        { type: "text/csv;charset=utf-8;" }
    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `reservas-${getTodayString()}.csv`;

    link.click();

    URL.revokeObjectURL(url);


    showToast("Arquivo exportado com sucesso.");

}


/* =========================================================
   TEMA
========================================================= */

function setupTheme() {

    $("#themeToggle").innerHTML = iconSVG("lua");

    const saved = localStorage.getItem(STORAGE_KEYS.theme);


    if (saved === "dark") {

        document.body.classList.add("dark");

        $("#themeToggle").innerHTML = iconSVG("sol");

    }


    $("#themeToggle").addEventListener("click", () => {

        const dark = document.body.classList.toggle("dark");

        localStorage.setItem(
            STORAGE_KEYS.theme,
            dark ? "dark" : "light"
        );

        $("#themeToggle").innerHTML = iconSVG(dark ? "sol" : "lua");

    });

}


/* =========================================================
   CRIAR SALA
========================================================= */

let editingRoomId = null;


function setupRoomForm() {

    $("#roomForm").addEventListener("submit", handleRoomSubmit);

    // "Limpar" também sai do modo de edição
    $("#roomForm").addEventListener("reset", () => {
        setTimeout(exitRoomEdit, 0);
    });

}


function startRoomEdit(id) {

    const room = rooms.find(item => item.id === id);

    if (!room) return;


    editingRoomId = id;


    $("#roomName").value = room.name;
    $("#roomNumber").value = room.number;
    $("#roomCapacity").value = room.capacity || "";
    $("#roomDescription").value = room.description || "";
    setCheckedResources("#roomResources", room.resources || []);


    $("#roomFormEyebrow").textContent = "EDITANDO";
    $("#roomFormTitle").textContent = `Editando: ${room.name}`;
    $("#roomSubmit").textContent = "Salvar alterações";
    $("#roomReset").textContent = "Cancelar edição";


    renderRoomList();

    $("#roomName").focus();

    $("#roomForm").scrollIntoView({ behavior: "smooth", block: "center" });

}


function exitRoomEdit() {

    editingRoomId = null;

    $("#roomFormEyebrow").textContent = "NOVA SALA";
    $("#roomFormTitle").textContent = "Dados da sala";
    $("#roomSubmit").textContent = "Criar sala";
    $("#roomReset").textContent = "Limpar";

    renderRoomList();

}


function handleRoomSubmit(event) {

    event.preventDefault();


    const name = $("#roomName").value.trim();
    const number = Number($("#roomNumber").value);
    const capacity = Number($("#roomCapacity").value) || null;
    const description = $("#roomDescription").value.trim();
    const resources = getCheckedResources("#roomResources");


    if (!name || !Number.isInteger(number) || number < 1) {

        showToast(
            "Informe o nome e um número válido para a sala.",
            "error"
        );

        return;

    }


    const numberTaken = rooms.some(
        room => room.number === number && room.id !== editingRoomId
    );

    if (numberTaken) {

        showToast(
            `Já existe uma sala com o número ${number}.`,
            "error"
        );

        return;

    }


    // Editando uma sala existente
    if (editingRoomId) {

        const room = rooms.find(item => item.id === editingRoomId);

        Object.assign(room, { name, number, capacity, description, resources });

        rooms.sort((a, b) => a.number - b.number);


        // As reservas guardam o nome da sala: atualiza todas
        reservations.forEach(item => {
            if (item.room === room.id) {
                item.roomName = name;
            }
        });


        saveRooms();
        saveReservations();

        $("#roomForm").reset();

        populateRoomSelects();
        renderAll();

        showToast(`Sala "${name}" atualizada.`);

        return;

    }


    const room = {

        id: "sala-" + (
            crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now())
        ),

        name,
        number,
        capacity,
        description,
        resources,
        icon: ROOM_ICONS[rooms.length % ROOM_ICONS.length]

    };


    rooms.push(room);

    rooms.sort((a, b) => a.number - b.number);

    saveRooms();
    populateRoomSelects();
    renderAll();

    $("#roomForm").reset();

    showToast(`Sala "${name}" criada com sucesso.`);

}


function renderRoomList() {

    const container = $("#roomList");

    if (!container) return;


    if (!rooms.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("salas")}</div>
                <p>Nenhuma sala cadastrada.</p>
            </div>
        `;

        return;

    }


    container.innerHTML = rooms.map(room => `

        <div class="schedule-item room-list-item ${room.id === editingRoomId ? "editing" : ""}" data-color="${getRoomColor(room.id)}">

            <div class="schedule-time">
                Nº ${room.number}
            </div>

            <div class="schedule-main">
                <strong>${escapeHTML(room.name)}</strong>
                <span>${room.capacity ? `Até ${room.capacity} pessoas` : "Capacidade livre"}</span>
            </div>

            <div class="room-actions">

                <button
                    class="action-button edit"
                    title="Editar sala"
                    aria-label="Editar ${escapeHTML(room.name)}"
                    data-edit-room="${room.id}"
                >
                    ${iconSVG("lapis")}
                </button>

                <button
                    class="action-button"
                    title="Excluir sala"
                    aria-label="Excluir ${escapeHTML(room.name)}"
                    data-delete-room="${room.id}"
                >
                    ${iconSVG("lixeira")}
                </button>

            </div>

        </div>

    `).join("");


    container
        .querySelectorAll("[data-edit-room]")
        .forEach(button => {

            button.addEventListener("click", () =>
                startRoomEdit(button.dataset.editRoom)
            );

        });


    container
        .querySelectorAll("[data-delete-room]")
        .forEach(button => {

            button.addEventListener("click", () =>
                deleteRoom(button.dataset.deleteRoom)
            );

        });

}


async function deleteRoom(id) {

    const room = rooms.find(item => item.id === id);

    if (!room) return;


    const hasUpcoming = reservations.some(
        item => item.room === id && !isPast(item)
    );

    if (hasUpcoming) {

        showToast(
            "Esta sala tem reservas agendadas. Cancele-as antes de excluir.",
            "warning"
        );

        return;

    }


    const confirmed = await showConfirm({
        title: "Excluir sala?",
        message: `A sala <strong>${escapeHTML(room.name)}</strong> (Nº ${room.number}) será removida. Essa ação não pode ser desfeita.`,
        confirmText: "Excluir sala"
    });

    if (!confirmed) return;


    rooms = rooms.filter(item => item.id !== id);

    if (editingRoomId === id) {
        $("#roomForm").reset();
    }

    saveRooms();
    populateRoomSelects();
    renderAll();

    showToast("Sala excluída.");

}


function getRoomLabel(room) {

    return room.capacity
        ? `${room.name} (Nº ${room.number}) · até ${room.capacity} pessoas`
        : `${room.name} (Nº ${room.number})`;

}


/* =========================================================
   RECURSOS DAS SALAS
========================================================= */

function setupResourcePickers() {

    ["#roomResources", "#searchResources"].forEach(selector => {

        const container = $(selector);

        if (!container) return;

        container.innerHTML = RESOURCES.map(resource => `
            <label class="resource-option">
                <input type="checkbox" value="${resource.id}">
                <span>${resource.label}</span>
            </label>
        `).join("");

    });

}


function getCheckedResources(selector) {

    return [...$$(`${selector} input:checked`)].map(input => input.value);

}


function setCheckedResources(selector, ids) {

    $$(`${selector} input`).forEach(input => {
        input.checked = ids.includes(input.value);
    });

}


function getResourceLabel(id) {

    const resource = RESOURCES.find(item => item.id === id);

    return resource ? resource.label : id;

}


function renderResourceChips(ids = [], highlight = []) {

    if (!ids || !ids.length) {
        return `<div class="resource-chips"><span class="chip muted">Sem recursos cadastrados</span></div>`;
    }

    return `
        <div class="resource-chips">
            ${ids.map(id => `
                <span class="chip ${highlight.includes(id) ? "match" : ""}">
                    ${getResourceLabel(id)}
                </span>
            `).join("")}
        </div>
    `;

}


/* =========================================================
   BUSCAR SALA LIVRE
========================================================= */

function setupSearch() {

    const start = $("#searchStart");
    const end = $("#searchEnd");


    for (let minutes = DAY_START; minutes < DAY_END; minutes += STEP) {
        const time = fromMinutes(minutes);
        start.insertAdjacentHTML("beforeend", `<option value="${time}">${time}</option>`);
    }

    for (let minutes = DAY_START + STEP; minutes <= DAY_END; minutes += STEP) {
        const time = fromMinutes(minutes);
        end.insertAdjacentHTML("beforeend", `<option value="${time}">${time}</option>`);
    }


    // Valores iniciais: hoje, a partir do próximo horário livre
    const today = getTodayString();

    let first = Math.ceil(getNowMinutes() / STEP) * STEP;

    let date = today;

    if (first < DAY_START) first = DAY_START;

    if (first > DAY_END - 60) {
        date = addDays(today, 1);
        first = DAY_START;
    }

    $("#searchDate").value = date;
    $("#searchDate").min = today;
    start.value = fromMinutes(first);
    end.value = fromMinutes(Math.min(first + 60, DAY_END));


    // A busca roda sozinha a cada alteração
    ["#searchDate", "#searchStart", "#searchEnd", "#searchPeople"].forEach(selector => {
        $(selector).addEventListener("input", runSearch);
        $(selector).addEventListener("change", runSearch);
    });

    $("#searchResources").addEventListener("change", runSearch);

}


function runSearch() {

    const results = $("#searchResults");

    if (!results) return;


    const date = $("#searchDate").value;
    const startTime = $("#searchStart").value;
    const endTime = $("#searchEnd").value;
    const people = Number($("#searchPeople").value) || 0;
    const needed = getCheckedResources("#searchResources");


    $("#searchHelp").hidden = true;


    if (!date || !startTime || !endTime || toMinutes(endTime) <= toMinutes(startTime)) {

        $("#searchSummary").textContent = "Escolha um horário de término depois do início.";
        results.innerHTML = "";
        $("#unavailableBox").hidden = true;
        return;

    }


    // Data ou horário no passado: explica e oferece um atalho
    if (isStartInPast(date, startTime)) {

        showSearchPastHelp(date);

        $("#searchSummary").textContent = "";
        results.innerHTML = "";
        $("#unavailableBox").hidden = true;
        return;

    }


    const available = [];
    const unavailable = [];


    rooms.forEach(room => {

        const reasons = [];


        const conflict = findConflict(room.id, date, startTime, endTime);

        if (conflict) {
            reasons.push(`Ocupada das ${conflict.startTime} às ${conflict.endTime} (${conflict.responsible})`);
        }


        if (people && room.capacity && people > room.capacity) {
            reasons.push(`Cabem só ${room.capacity} pessoas`);
        }


        const missing = needed.filter(id => !(room.resources || []).includes(id));

        if (missing.length) {
            reasons.push(`Não tem ${missing.map(getResourceLabel).join(", ").toLowerCase()}`);
        }


        if (reasons.length) {
            unavailable.push({ room, reasons });
        } else {
            available.push(room);
        }

    });


    // Sala mais "justa" primeiro: a menor capacidade que atende
    available.sort((a, b) => (a.capacity || 999) - (b.capacity || 999));


    const when = `${formatDate(date)}, das ${startTime} às ${endTime}`;

    $("#searchSummary").innerHTML = available.length
        ? `<strong>${available.length} ${available.length === 1 ? "sala livre" : "salas livres"}</strong> em ${when}${people ? ` para ${people} pessoas` : ""}.`
        : `Nenhuma sala atende a essa busca em ${when}. Tente outro horário ou menos recursos.`;


    results.innerHTML = available.map(room => `

        <article class="result-card" data-color="${getRoomColor(room.id)}">

            <div class="result-icon">${getRoomIcon(room.id)}</div>

            <div class="result-head">
                <span class="room-number">Nº ${room.number}</span>
                <span class="result-free">Livre</span>
            </div>

            <h3>${escapeHTML(room.name)}</h3>

            <p class="result-capacity">
                ${room.capacity ? `Até ${room.capacity} pessoas` : "Capacidade livre"}
            </p>

            ${renderResourceChips(room.resources, needed)}

            <button
                class="primary-button result-book"
                data-book-room="${room.id}"
            >
                Reservar esta sala
            </button>

        </article>

    `).join("");


    results.querySelectorAll("[data-book-room]").forEach(button => {

        button.addEventListener("click", () => {

            openReservationModal({
                room: button.dataset.bookRoom,
                date,
                startTime,
                endTime,
                participants: people || ""
            });

        });

    });


    $("#unavailableBox").hidden = !unavailable.length;

    $("#unavailableList").innerHTML = unavailable.map(({ room, reasons }) => `
        <div class="unavailable-item">
            <strong>${escapeHTML(room.name)}</strong>
            <span>${reasons.map(escapeHTML).join(" · ")}</span>
        </div>
    `).join("");

}


// Mostra por que não dá para buscar no passado e sugere a próxima opção válida
function showSearchPastHelp(date) {

    const today = getTodayString();
    const tomorrow = addDays(today, 1);

    const duration = Math.max(
        toMinutes($("#searchEnd").value) - toMinutes($("#searchStart").value),
        60
    );

    // Próximo horário de hoje (de 30 em 30 min) que ainda cabe no expediente
    const nextSlot = Math.max(
        Math.ceil(getNowMinutes() / STEP) * STEP,
        DAY_START
    );

    const todayStillOpen = nextSlot + STEP <= DAY_END;


    const actions = [];


    if (date < today) {

        $("#searchHelpTitle").textContent = "Essa data já passou";

        $("#searchHelpText").textContent =
            `As reservas só podem ser feitas para hoje (${formatDate(today)}) ou para os próximos dias. Escolha uma data a partir de hoje.`;

    } else {

        $("#searchHelpTitle").textContent = "Esse horário de hoje já passou";

        $("#searchHelpText").textContent = todayStillOpen
            ? `Agora são ${fromMinutes(getNowMinutes())}. Hoje ainda dá para reservar a partir das ${fromMinutes(nextSlot)}, ou escolha um dia à frente.`
            : `Agora são ${fromMinutes(getNowMinutes())} e as salas funcionam até as ${fromMinutes(DAY_END)}. Escolha um dia à frente.`;

    }


    if (todayStillOpen) {
        actions.push({
            label: `Buscar hoje a partir das ${fromMinutes(nextSlot)}`,
            date: today,
            start: nextSlot
        });
    }

    // Amanhã, no mesmo horário que a pessoa tinha escolhido (se couber no expediente)
    let tomorrowStart = toMinutes($("#searchStart").value);

    if (tomorrowStart + duration > DAY_END) {
        tomorrowStart = DAY_START;
    }

    actions.push({
        label: `Buscar amanhã (${formatDate(tomorrow).slice(0, 5)}) às ${fromMinutes(tomorrowStart)}`,
        date: tomorrow,
        start: tomorrowStart
    });


    $("#searchHelpActions").innerHTML = actions.map((action, index) => `
        <button
            type="button"
            class="${index === 0 ? "primary-button" : "secondary-button"}"
            data-help-index="${index}"
        >
            ${action.label}
        </button>
    `).join("");


    $("#searchHelpActions").querySelectorAll("[data-help-index]").forEach(button => {

        button.addEventListener("click", () => {

            const action = actions[Number(button.dataset.helpIndex)];

            const end = Math.min(action.start + duration, DAY_END);

            $("#searchDate").value = action.date;
            $("#searchStart").value = fromMinutes(action.start);
            $("#searchEnd").value = fromMinutes(Math.max(end, action.start + STEP));

            runSearch();

        });

    });


    $("#searchHelp").hidden = false;

}


/* =========================================================
   USUÁRIO LOGADO E PERMISSÕES
========================================================= */

// Usuário que fez login (salvo pela tela de login)
function getCurrentUser() {

    try {
        return JSON.parse(localStorage.getItem("usuarioLogado"));
    } catch (error) {
        return null;
    }

}


// A reserva é de quem está logado?
function isMine(reservation) {

    const user = getCurrentUser();

    return Boolean(
        user &&
        reservation.ownerEmail &&
        reservation.ownerEmail === user.email
    );

}


// Pode editar/cancelar: quem criou a reserva.
// Reservas antigas, feitas antes do login existir, não têm dono e continuam liberadas.
function canManageReservation(reservation) {

    if (!reservation.ownerEmail) return true;

    return isMine(reservation);

}


function getOwnerName(reservation) {

    if (!reservation.ownerEmail) return "Não registrado";

    return reservation.ownerName || reservation.ownerEmail;

}


/* =========================================================
   MINHAS RESERVAS
========================================================= */

function renderMyReservations() {

    const upcomingBox = $("#myUpcoming");

    if (!upcomingBox) return;


    const mine = reservations
        .filter(isMine)
        .sort((a, b) =>
            `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
        );

    const upcoming = mine.filter(item => !isPast(item));

    const past = mine.filter(isPast).reverse().slice(0, 10);


    const user = getCurrentUser();

    const hours = upcoming.reduce((sum, item) => sum + getDuration(item), 0) / 60;

    $("#mySummary").innerHTML = user
        ? `<strong>${escapeHTML(user.nome)}</strong>, você tem <strong>${upcoming.length}</strong> ${upcoming.length === 1 ? "reserva agendada" : "reservas agendadas"}${upcoming.length ? ` (${hours.toLocaleString("pt-BR")} h no total)` : ""}.`
        : "Entre com sua conta para ver suas reservas.";


    const row = item => `

        <div class="schedule-item my-item" data-id="${item.id}" data-color="${getRoomColor(item.room)}">

            <div class="schedule-time">
                ${item.date === getTodayString() ? "Hoje" : formatDate(item.date).slice(0, 5)}
                <small>${formatRange(item)}</small>
            </div>

            <div class="schedule-main">
                <strong>${escapeHTML(item.roomName)}</strong>
                <span>${escapeHTML(item.purpose || "Sem finalidade")}${item.seriesId ? " · toda semana" : ""}</span>
            </div>

            <span class="schedule-status ${isPast(item) ? "state-past" : isHappeningNow(item) ? "state-now" : "state-upcoming"}">
                ${getReservationStatus(item)}
            </span>

        </div>

    `;


    upcomingBox.innerHTML = upcoming.length
        ? upcoming.map(row).join("")
        : `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("agenda")}</div>
                <p>Você não tem reservas agendadas.</p>
            </div>
        `;

    $("#myPast").innerHTML = past.length
        ? past.map(row).join("")
        : `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("reservas")}</div>
                <p>Nenhuma reserva anterior.</p>
            </div>
        `;


    $$("#minhas-reservas .my-item").forEach(element => {

        element.addEventListener("click", () =>
            showReservationDetails(element.dataset.id)
        );

    });

}


/* =========================================================
   HISTÓRICO GERAL DE AGENDAMENTOS
   Guarda cada ação (reserva feita, editada ou cancelada),
   mesmo depois que a reserva deixa de existir.
========================================================= */

const HISTORY_PAGE = 40;

let historyLimit = HISTORY_PAGE;


function loadHistory() {

    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.history));
        if (Array.isArray(saved)) return saved;
    } catch (error) {
        // dados corrompidos: começa do zero
    }

    return null;

}


function saveHistory(list) {

    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(list));

}


// Na primeira vez, cria o histórico a partir das reservas que já existem
function getHistory() {

    let list = loadHistory();

    if (list) return list;


    list = reservations.map(item => ({
        id: createId(),
        type: "criada",
        at: item.createdAt || "",
        byName: item.ownerName || "Não registrado",
        byEmail: item.ownerEmail || null,
        reservation: snapshotReservation(item),
        count: 1,
        imported: true
    }));

    saveHistory(list);

    return list;

}


// Cópia só dos dados que o histórico precisa mostrar
function snapshotReservation(item) {

    return {
        room: item.room,
        roomName: item.roomName,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        responsible: item.responsible,
        purpose: item.purpose || ""
    };

}


function logHistory(type, reservation, extra = {}) {

    if (!reservation) return;

    const user = getCurrentUser();

    const list = getHistory();

    list.push({
        id: createId(),
        type,
        at: new Date().toISOString(),
        byName: user ? user.nome : "Não registrado",
        byEmail: user ? user.email : null,
        reservation: snapshotReservation(reservation),
        count: extra.count || 1,
        until: extra.until || null,
        changes: extra.changes || []
    });

    saveHistory(list);

}


// Lista o que mudou numa edição (sala, data, horário, responsável...)
function describeChanges(before, after) {

    const changes = [];

    if (before.room !== after.room) {
        changes.push(`sala: ${before.roomName} → ${after.roomName}`);
    }

    if (before.date !== after.date) {
        changes.push(`data: ${formatDate(before.date)} → ${formatDate(after.date)}`);
    }

    if (before.startTime !== after.startTime || before.endTime !== after.endTime) {
        changes.push(`horário: ${formatRange(before)} → ${formatRange(after)}`);
    }

    if (before.responsible !== after.responsible) {
        changes.push(`responsável: ${before.responsible} → ${after.responsible}`);
    }

    if ((before.purpose || "") !== (after.purpose || "")) {
        changes.push("finalidade alterada");
    }

    if ((before.participants || null) !== (after.participants || null)) {
        changes.push(`participantes: ${before.participants || "—"} → ${after.participants || "—"}`);
    }

    return changes;

}


function setupHistory() {

    // Garante que as reservas antigas entrem no histórico antes de qualquer ação nova
    getHistory();

    const roomFilter = $("#historyRoom");

    if (!roomFilter) return;


    ["#historySearch", "#historyType", "#historyRoom"].forEach(selector => {
        $(selector).addEventListener("input", () => {
            historyLimit = HISTORY_PAGE;
            renderHistory();
        });
    });

    $("#historyMore").addEventListener("click", () => {
        historyLimit += HISTORY_PAGE;
        renderHistory();
    });

    const searchIcon = $("#historico .search-box > span");
    if (searchIcon) searchIcon.innerHTML = iconSVG("buscar");

}


function renderHistory() {

    const container = $("#historyList");

    if (!container) return;


    // Atualiza a lista de salas do filtro (inclui salas que já foram excluídas)
    const roomFilter = $("#historyRoom");
    const currentRoom = roomFilter.value;

    const all = getHistory()
        .slice()
        .sort((a, b) => (b.at || "").localeCompare(a.at || ""));

    const roomNames = new Map();

    rooms.forEach(room => roomNames.set(room.id, room.name));
    all.forEach(event => {
        if (!roomNames.has(event.reservation.room)) {
            roomNames.set(event.reservation.room, event.reservation.roomName);
        }
    });

    roomFilter.innerHTML =
        `<option value="all">Todas as salas</option>` +
        [...roomNames].map(([id, name]) =>
            `<option value="${id}">${escapeHTML(name)}</option>`
        ).join("");

    if ([...roomNames.keys()].includes(currentRoom)) {
        roomFilter.value = currentRoom;
    }


    // Números do topo (sempre sobre o histórico inteiro)
    const total = type => all
        .filter(event => event.type === type)
        .reduce((sum, event) => sum + (event.count || 1), 0);

    const people = new Set(all.map(event => event.byEmail || event.byName));

    $("#historyStats").innerHTML = `
        <div class="history-stat"><strong>${total("criada")}</strong><span>${total("criada") === 1 ? "reserva feita" : "reservas feitas"}</span></div>
        <div class="history-stat"><strong>${total("editada")}</strong><span>${total("editada") === 1 ? "edição" : "edições"}</span></div>
        <div class="history-stat"><strong>${total("cancelada")}</strong><span>${total("cancelada") === 1 ? "cancelamento" : "cancelamentos"}</span></div>
        <div class="history-stat"><strong>${people.size}</strong><span>${people.size === 1 ? "pessoa" : "pessoas"}</span></div>
    `;


    // Filtros
    const search = $("#historySearch").value.toLowerCase().trim();
    const type = $("#historyType").value;
    const room = roomFilter.value;

    const filtered = all.filter(event => {

        if (type !== "all" && event.type !== type) return false;

        if (room !== "all" && event.reservation.room !== room) return false;

        if (search) {
            const text = [
                event.byName,
                event.reservation.roomName,
                event.reservation.responsible,
                event.reservation.purpose
            ].join(" ").toLowerCase();

            if (!text.includes(search)) return false;
        }

        return true;

    });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${iconSVG("historico")}</div>
                <p>${all.length ? "Nada encontrado com esses filtros." : "Nenhum agendamento registrado ainda."}</p>
            </div>
        `;

        $("#historyMore").hidden = true;

        return;

    }


    const visible = filtered.slice(0, historyLimit);

    const verbs = {
        criada: "reservou",
        editada: "editou a reserva da",
        cancelada: "cancelou a reserva da"
    };

    let lastDay = "";

    container.innerHTML = visible.map(event => {

        const when = new Date(event.at);
        const dayKey = event.at ? toDateString(when) : "anterior";

        let dayHeader = "";

        if (dayKey !== lastDay) {
            lastDay = dayKey;
            dayHeader = `<div class="history-day">${dayKey === "anterior" ? "Antes do histórico existir" : getDayLabel(dayKey)}</div>`;
        }

        const r = event.reservation;

        const target = event.count > 1
            ? `${event.count} reservas semanais, de ${formatDate(r.date).slice(0, 5)} até ${formatDate(event.until).slice(0, 5)}, ${formatRange(r)}`
            : `${formatDate(r.date)}, ${formatRange(r)}`;

        const changes = event.changes && event.changes.length
            ? `<span class="history-changes">${event.changes.map(escapeHTML).join(" · ")}</span>`
            : "";

        const time = !event.at
            ? ""
            : `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;

        return `
            ${dayHeader}
            <div class="history-item type-${event.type}">

                <span class="history-icon">${iconSVG(event.type === "criada" ? "criar" : event.type === "editada" ? "lapis" : "lixeira")}</span>

                <div class="history-text">
                    <p>
                        <strong>${escapeHTML(event.byName)}</strong>
                        ${verbs[event.type]}
                        <strong class="history-room" data-color="${getRoomColor(r.room)}">${escapeHTML(r.roomName)}</strong>
                        <span class="history-when">· ${target}</span>
                    </p>
                    <span class="history-meta">
                        ${r.purpose ? escapeHTML(r.purpose) + " · " : ""}Responsável: ${escapeHTML(r.responsible)}
                    </span>
                    ${changes}
                </div>

                <span class="history-time">${time}</span>

            </div>
        `;

    }).join("");


    $("#historyMore").hidden = filtered.length <= historyLimit;

    $("#historyMore").textContent =
        `Mostrar mais (${filtered.length - historyLimit} restantes)`;

}


function getDayLabel(dayKey) {

    const today = getTodayString();

    if (dayKey === today) return "Hoje";

    if (dayKey === addDays(today, -1)) return "Ontem";

    return capitalize(formatLongDate(dayKey));

}


/* =========================================================
   RELATÓRIOS
   Números calculados a partir das reservas e do histórico.
========================================================= */

const MONTH_NAMES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const WEEK_DAYS_LONG = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

let reportPeriod = "month";


function setupReport() {

    if (!$("#reportContent")) return;


    $$("#reportPeriod button").forEach(button => {

        button.addEventListener("click", () => {

            reportPeriod = button.dataset.period;

            $$("#reportPeriod button").forEach(item =>
                item.classList.toggle("on", item === button)
            );

            fillReportRanges();
            renderReport();

        });

    });

    $("#reportRange").addEventListener("change", renderReport);

    $("#reportPrint").addEventListener("click", () => window.print());

    $(".rp-print-icon").innerHTML = iconSVG("download");

    fillReportRanges();

}


function parseDate(dateString) {

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);

}


// Monta a lista de períodos (semanas, meses ou semestres) do seletor
function fillReportRanges() {

    const select = $("#reportRange");

    const today = parseDate(getTodayString());

    const options = [];


    if (reportPeriod === "week") {

        // Semana de segunda a domingo
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

        for (let i = 4; i >= -12; i--) {

            const start = new Date(monday);
            start.setDate(monday.getDate() + i * 7);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const s = toDateString(start);
            const e = toDateString(end);

            const label = i === 0
                ? `Esta semana (${formatDate(s).slice(0, 5)} a ${formatDate(e).slice(0, 5)})`
                : `${formatDate(s).slice(0, 5)} a ${formatDate(e).slice(0, 5)}`;

            options.push({ value: `${s}|${e}`, label, current: i === 0 });

        }

    }


    if (reportPeriod === "month") {

        for (let i = 2; i >= -12; i--) {

            const start = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

            options.push({
                value: `${toDateString(start)}|${toDateString(end)}`,
                label: `${capitalize(MONTH_NAMES[start.getMonth()])} de ${start.getFullYear()}`,
                current: i === 0
            });

        }

    }


    if (reportPeriod === "semester") {

        const currentHalf = today.getMonth() < 6 ? 0 : 1;

        for (let i = 1; i >= -3; i--) {

            const index = today.getFullYear() * 2 + currentHalf + i;
            const year = Math.floor(index / 2);
            const half = index % 2;

            const start = new Date(year, half * 6, 1);
            const end = new Date(year, half * 6 + 6, 0);

            options.push({
                value: `${toDateString(start)}|${toDateString(end)}`,
                label: `${half + 1}º semestre de ${year}`,
                current: i === 0
            });

        }

    }


    select.innerHTML = options.map(option =>
        `<option value="${option.value}" ${option.current ? "selected" : ""}>${option.label}</option>`
    ).join("");

}


// Período anterior de mesmo tamanho (para comparar)
function getPreviousRange(start, end) {

    const s = parseDate(start);

    if (reportPeriod === "month") {
        return [
            toDateString(new Date(s.getFullYear(), s.getMonth() - 1, 1)),
            toDateString(new Date(s.getFullYear(), s.getMonth(), 0))
        ];
    }

    if (reportPeriod === "semester") {
        return [
            toDateString(new Date(s.getFullYear(), s.getMonth() - 6, 1)),
            toDateString(new Date(s.getFullYear(), s.getMonth(), 0))
        ];
    }

    return [addDays(start, -7), addDays(end, -7)];

}


function countWorkDays(start, end) {

    let count = 0;

    for (let day = start; day <= end; day = addDays(day, 1)) {
        const weekDay = parseDate(day).getDay();
        if (weekDay !== 0 && weekDay !== 6) count++;
    }

    return count;

}


function formatHours(minutes) {

    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);

    if (!h) return `${m} min`;

    return m ? `${h}h${String(m).padStart(2, "0")}` : `${h} h`;

}


function renderReport() {

    const container = $("#reportContent");

    if (!container || !$("#reportRange").value) return;


    const [start, end] = $("#reportRange").value.split("|");

    const inRange = (date, s, e) => date >= s && date <= e;

    const list = reservations.filter(item => inRange(item.date, start, end));

    const [prevStart, prevEnd] = getPreviousRange(start, end);

    const previous = reservations.filter(item => inRange(item.date, prevStart, prevEnd)).length;


    const cancelled = getHistory()
        .filter(event => event.type === "cancelada" && inRange(event.reservation.date, start, end))
        .reduce((sum, event) => sum + (event.count || 1), 0);


    const totalMinutes = list.reduce((sum, item) => sum + getDuration(item), 0);

    const capacity = rooms.length * countWorkDays(start, end) * (DAY_END - DAY_START);

    const occupancy = capacity ? Math.round(totalMinutes / capacity * 100) : 0;


    // Comparação com o período anterior
    const previousName = {
        week: "à semana anterior",
        month: `a ${MONTH_NAMES[(parseDate(start).getMonth() + 11) % 12]}`,
        semester: "ao semestre anterior"
    }[reportPeriod];

    let trend = `<small>nenhuma reserva no período anterior</small>`;

    if (previous) {

        const change = Math.round((list.length - previous) / previous * 100);

        trend = change === 0
            ? `<small>igual ao período anterior</small>`
            : `<small class="${change > 0 ? "up" : "down"}">${change > 0 ? "▲" : "▼"} ${Math.abs(change)}% em relação ${previousName}</small>`;

    }

    const periodLabel = { week: "na semana", month: "no mês", semester: "no semestre" }[reportPeriod];


    const kpis = `
        <div class="rp-kpis">
            <div class="rp-kpi"><span>Reservas ${periodLabel}</span><strong>${list.length}</strong>${trend}</div>
            <div class="rp-kpi"><span>Horas reservadas</span><strong>${formatHours(totalMinutes)}</strong><small>${list.length ? `média de ${formatHours(totalMinutes / list.length)} por reserva` : "nenhuma reserva"}</small></div>
            <div class="rp-kpi"><span>Ocupação média</span><strong>${occupancy}%</strong><small>das 8h às 18h, dias úteis</small></div>
            <div class="rp-kpi"><span>Cancelamentos</span><strong>${cancelled}</strong><small class="${cancelled ? "down" : ""}">${cancelled ? `${Math.round(cancelled / (list.length + cancelled) * 100)}% das reservas` : "nenhum cancelamento"}</small></div>
        </div>
    `;

    const printTitle = `<h3 class="rp-print-title">Conec-ta · Relatório de uso · ${escapeHTML($("#reportRange").selectedOptions[0].textContent)}</h3>`;


    if (!list.length) {

        container.innerHTML = printTitle + kpis + `
            <div class="panel">
                <div class="empty-state">
                    <div class="empty-icon">${iconSVG("relatorios")}</div>
                    <p>Nenhuma reserva neste período. Escolha outro período acima.</p>
                </div>
            </div>
        `;

        return;

    }


    // Salas mais usadas (horas)
    const byRoom = new Map();

    rooms.forEach(room => byRoom.set(room.id, { id: room.id, name: room.name, minutes: 0 }));

    list.forEach(item => {
        if (!byRoom.has(item.room)) {
            byRoom.set(item.room, { id: item.room, name: item.roomName, minutes: 0 });
        }
        byRoom.get(item.room).minutes += getDuration(item);
    });

    const roomRows = [...byRoom.values()].sort((a, b) => b.minutes - a.minutes);

    const maxRoom = Math.max(...roomRows.map(row => row.minutes), 1);

    const bars = roomRows.map(row => `
        <div class="rp-bar" data-color="${getRoomColor(row.id)}">
            <span>${escapeHTML(row.name)}</span>
            <div><i style="width:${row.minutes / maxRoom * 100}%"></i></div>
            <b>${row.minutes ? formatHours(row.minutes) : "—"}</b>
        </div>
    `).join("");


    // Mapa de calor: quantas reservas ocupam cada hora de cada dia
    const usedDays = new Set(list.map(item => parseDate(item.date).getDay()));

    const heatDays = [1, 2, 3, 4, 5].concat([6, 0].filter(day => usedDays.has(day)));

    const hoursOfDay = [];
    for (let m = DAY_START; m < DAY_END; m += 60) hoursOfDay.push(m);

    const heat = {};

    list.forEach(item => {

        const day = parseDate(item.date).getDay();
        const s = toMinutes(item.startTime);
        const e = toMinutes(item.endTime);

        hoursOfDay.forEach(h => {
            if (s < h + 60 && e > h) {
                heat[`${day}-${h}`] = (heat[`${day}-${h}`] || 0) + 1;
            }
        });

    });

    const maxHeat = Math.max(...Object.values(heat), 1);

    const level = value => value ? Math.max(1, Math.round(value / maxHeat * 5)) : 0;

    const heatmap = `
        <div class="rp-heat" style="grid-template-columns: 34px repeat(${hoursOfDay.length}, 1fr)">
            <span></span>
            ${hoursOfDay.map(h => `<em>${h / 60}h</em>`).join("")}
            ${heatDays.map(day => `
                <span>${WEEK_DAYS[day]}</span>
                ${hoursOfDay.map(h => {
                    const value = heat[`${day}-${h}`] || 0;
                    return `<i class="l${level(value)}" title="${WEEK_DAYS[day]} às ${h / 60}h: ${value} ${value === 1 ? "reserva" : "reservas"}"></i>`;
                }).join("")}
            `).join("")}
        </div>
        <div class="rp-legend">menos <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><i class="l5"></i> mais</div>
    `;

    // Ordena por dia da semana/hora para o texto sair em ordem
    const peaks = Object.entries(heat)
        .filter(([, value]) => value === maxHeat)
        .map(([key]) => key.split("-").map(Number))
        .sort((a, b) => ((a[0] + 6) % 7) - ((b[0] + 6) % 7) || a[1] - b[1]);

    let peakText;

    if (peaks.length > 3) {
        peakText = `Vários horários empatam como os mais usados (${maxHeat} ${maxHeat === 1 ? "reserva" : "reservas"} cada).`;
    } else {
        const names = peaks.map(([day, h]) => `${WEEK_DAYS_LONG[day]} às ${h / 60}h`);
        peakText = names.length > 1
            ? `${capitalize(names.slice(0, -1).join(", "))} e ${names[names.length - 1]} são os horários mais disputados.`
            : `${capitalize(names[0])} é o horário mais disputado.`;
    }


    // Quem mais reserva
    const byPerson = new Map();

    list.forEach(item => {
        const name = item.ownerName || item.responsible || "Não registrado";
        byPerson.set(name, (byPerson.get(name) || 0) + 1);
    });

    const ranking = [...byPerson].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const initials = name => name.split(/\s+/).filter(Boolean).map(word => word[0]).slice(0, 2).join("").toUpperCase();

    const rank = `
        <ol class="rp-rank">
            ${ranking.map(([name, total], index) => `
                <li>
                    <span class="rp-pos">${index + 1}</span>
                    <span class="rp-av">${escapeHTML(initials(name))}</span>
                    <span class="rp-name">${escapeHTML(name)}</span>
                    <b>${total} ${total === 1 ? "reserva" : "reservas"}</b>
                </li>
            `).join("")}
        </ol>
    `;


    // Reservas por dia da semana
    const byDay = {};

    list.forEach(item => {
        const day = parseDate(item.date).getDay();
        byDay[day] = (byDay[day] || 0) + 1;
    });

    const maxDay = Math.max(...Object.values(byDay), 1);

    const columns = `
        <div class="rp-cols">
            ${heatDays.map(day => `
                <div>
                    <b>${byDay[day] || 0}</b>
                    <i style="height:${(byDay[day] || 0) / maxDay * 100}%"></i>
                    <span>${WEEK_DAYS[day]}</span>
                </div>
            `).join("")}
        </div>
    `;


    const card = (eyebrow, title, body) => `
        <div class="panel rp-card">
            <div class="rp-head">
                <span class="eyebrow">${eyebrow}</span>
                <h3>${title}</h3>
            </div>
            ${body}
        </div>
    `;

    container.innerHTML = `
        ${printTitle}
        ${kpis}
        <div class="rp-grid2">
            ${card("HORAS RESERVADAS", "Salas mais usadas", bars)}
            ${card("QUANDO AS SALAS MAIS SÃO USADAS", "Horários de pico", heatmap + `<p class="rp-note">${peakText}</p>`)}
        </div>
        <div class="rp-grid2">
            ${card("PESSOAS", "Quem mais reserva", rank)}
            ${card("DISTRIBUIÇÃO", "Reservas por dia da semana", columns)}
        </div>
    `;

}


/* =========================================================
   CONFIRMAÇÃO
========================================================= */

let confirmResolver = null;


function showConfirm({
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    altText = ""
}) {

    $("#confirmTitle").textContent = title;

    $("#confirmMessage").innerHTML = message;

    $("#confirmOk").textContent = confirmText;

    $("#confirmCancel").textContent = cancelText;

    // Terceiro botão opcional (ex.: "Cancelar todas")
    $("#confirmAlt").hidden = !altText;
    $("#confirmAlt").textContent = altText;

    $(".confirm-actions").classList.toggle("three", Boolean(altText));


    $("#confirmModal").classList.add("active");


    setTimeout(() => {
        $("#confirmCancel").focus();
    }, 50);


    return new Promise(resolve => {
        confirmResolver = resolve;
    });

}


function closeConfirm(result) {

    $("#confirmModal").classList.remove("active");

    if (confirmResolver) {

        confirmResolver(result);

        confirmResolver = null;

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    const container = $("#toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;


    const icon =
        type === "error" || type === "warning"
            ? "!"
            : "✓";


    const title =
        type === "error"
            ? "Atenção"
            : type === "warning"
                ? "Aviso"
                : "Tudo certo";


    toast.innerHTML = `

        <div class="toast-icon">
            ${icon}
        </div>

        <div>
            <strong>${title}</strong>
            <p>${escapeHTML(message)}</p>
        </div>

    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateX(20px)";

        setTimeout(() => toast.remove(), 250);

    }, 3500);

}


/* =========================================================
   STATUS
========================================================= */

function isPast(item) {

    const target = new Date(`${item.date}T${item.endTime}:00`);

    return target < new Date();

}


function isHappeningNow(item) {

    if (item.date !== getTodayString()) return false;

    const now = getNowMinutes();

    return toMinutes(item.startTime) <= now && now < toMinutes(item.endTime);

}


function getReservationStatus(item) {

    if (isPast(item)) return "Finalizada";

    if (isHappeningNow(item)) return "Em andamento";

    return "Agendada";

}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function toDateString(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function toMinutes(time) {

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

}


function fromMinutes(total) {

    const hours = String(Math.floor(total / 60)).padStart(2, "0");

    const minutes = String(total % 60).padStart(2, "0");

    return `${hours}:${minutes}`;

}


function formatRange(item) {

    return `${item.startTime} – ${item.endTime}`;

}


function getDuration(item) {

    return toMinutes(item.endTime) - toMinutes(item.startTime);

}


// Reservas antigas tinham só "time" (1 hora). Converte para início e fim.
function normalizeReservation(item) {

    if (item.startTime && item.endTime) return item;


    const startTime = item.startTime || item.time || "08:00";

    const endTime = fromMinutes(
        Math.min(toMinutes(startTime) + 60, 24 * 60 - 1)
    );


    const { time, ...rest } = item;

    return { ...rest, startTime, endTime };

}


function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ATALHOS
========================================================= */

document.addEventListener("keydown", event => {

    // ESC fecha modais
    if (event.key === "Escape") {

        // Se a confirmação estiver aberta, fecha só ela
        if ($("#confirmModal").classList.contains("active")) {

            closeConfirm(false);

            return;

        }

        closeReservationModal();

        closeDetailsModal();

    }


    // N cria nova reserva
    if (
        event.key.toLowerCase() === "n" &&
        !isTyping() &&
        !$("#reservationModal").classList.contains("active") &&
        !$("#detailsModal").classList.contains("active") &&
        !$("#confirmModal").classList.contains("active")
    ) {

        event.preventDefault();

        openReservationModal();

    }

});


function isTyping() {

    const tag = document.activeElement?.tagName;

    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    );

}
function sair() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
