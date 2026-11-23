/* =========================================================
   SINCRONIZAÇÃO COM O SUPABASE
   Carrega salas, reservas e histórico do banco ao abrir o site
   e envia as mudanças quando o sistema salva.
   Precisa ser carregado DEPOIS do bdsupa.js e ANTES do script.js.
========================================================= */

// Última versão enviada ao banco (para enviar só o que mudou)
const SYNC = {
    rooms: new Map(),
    reservations: new Map(),
    history: new Set()
};

// Histórico em memória (o script.js lê e grava por aqui)
let historyList = [];

// Só envia ao banco depois de carregar com sucesso
let dataReady = false;

// Vira true se o usuário logado está na tabela admins
let isAdmin = false;

/* ---------- Conversão entre o sistema e as tabelas ---------- */

function roomToRow(room) {
    return {
        id: room.id,
        name: room.name,
        number: room.number,
        capacity: room.capacity,
        description: room.description || "",
        resources: room.resources || [],
        icon: room.icon || null
    };
}

function rowToRoom(row) {
    return {
        id: row.id,
        name: row.name,
        number: row.number,
        capacity: row.capacity,
        description: row.description || "",
        resources: row.resources || [],
        icon: row.icon || "▣"
    };
}

function reservationToRow(item) {
    return {
        id: item.id,
        room: item.room,
        room_name: item.roomName || null,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime,
        responsible: item.responsible || "",
        purpose: item.purpose || "",
        participants: item.participants || null,
        series_id: item.seriesId || null,
        owner_email: item.ownerEmail,
        owner_name: item.ownerName || null,
        created_at: item.createdAt || new Date().toISOString()
    };
}

function rowToReservation(row) {
    return {
        id: row.id,
        room: row.room,
        roomName: row.room_name,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        responsible: row.responsible,
        purpose: row.purpose,
        participants: row.participants,
        seriesId: row.series_id,
        ownerEmail: row.owner_email,
        ownerName: row.owner_name,
        createdAt: row.created_at
    };
}

function historyToRow(entry) {
    return {
        id: entry.id,
        type: entry.type,
        at: entry.at || new Date().toISOString(),
        by_name: entry.byName || null,
        by_email: entry.byEmail || null,
        reservation: entry.reservation || null,
        count: entry.count || 1,
        until: entry.until || null,
        changes: entry.changes || []
    };
}

function rowToHistory(row) {
    return {
        id: row.id,
        type: row.type,
        at: row.at,
        byName: row.by_name,
        byEmail: row.by_email,
        reservation: row.reservation,
        count: row.count,
        until: row.until,
        changes: row.changes || []
    };
}

// O nome da sala não conta na comparação: ao renomear uma sala, isso evita
// tentar alterar reservas de outras pessoas (o banco não permite).
function reservationKey(row) {
    const { room_name, ...rest } = row;
    return JSON.stringify(rest);
}


/* ---------- Fila de envio (uma gravação por vez) ---------- */

let syncQueue = Promise.resolve();

function enqueueSync(task) {

    syncQueue = syncQueue
        .then(task)
        .catch(error => {
            console.error("Erro ao salvar no banco:", error);
            if (typeof showToast === "function") {
                showToast("Não foi possível salvar no banco: " + (error.message || error), "error");
            }
        });

    return syncQueue;

}


/* ---------- Envio genérico: só o que mudou ---------- */

async function pushTable(table, list, toRow, keyFn, store) {

    const current = new Map(
        list.map(item => [item.id, keyFn(toRow(item))])
    );

    const changed = list
        .filter(item => store.get(item.id) !== current.get(item.id))
        .map(toRow);

    const removed = [...store.keys()].filter(id => !current.has(id));

    if (!changed.length && !removed.length) return;


    if (changed.length) {
        const { error } = await db.from(table).upsert(changed);
        if (error) throw error;
    }

    if (removed.length) {
        const { error } = await db.from(table).delete().in("id", removed);
        if (error) throw error;
    }


    store.clear();
    current.forEach((value, id) => store.set(id, value));

}


function pushRooms() {

    if (!dataReady) return;

    enqueueSync(() => pushTable(
        "rooms", rooms, roomToRow, row => JSON.stringify(row), SYNC.rooms
    ));

}


function pushReservations() {

    if (!dataReady) return;

    enqueueSync(() => pushTable(
        "reservations", reservations, reservationToRow, reservationKey, SYNC.reservations
    ));

}


function pushHistory() {

    if (!dataReady) return;

    enqueueSync(async () => {

        const fresh = historyList.filter(entry => !SYNC.history.has(entry.id));

        if (!fresh.length) return;

        const { error } = await db.from("history").upsert(fresh.map(historyToRow));
        if (error) throw error;

        fresh.forEach(entry => SYNC.history.add(entry.id));

    });

}


/* ---------- Carregar tudo ao abrir o site ---------- */

async function loadFromDatabase() {

    try {
const [roomsResult, reservationsResult, historyResult, adminResult] = await Promise.all([
    db.from("rooms").select("*"),
    db.from("reservations").select("*"),
    db.from("history").select("*").order("at", { ascending: true }),
    db.from("admins").select("email")
]);

[roomsResult, reservationsResult, historyResult, adminResult].forEach(result => {
    if (result.error) throw result.error;
});

isAdmin = adminResult.data.length > 0;

        // Salas
        if (roomsResult.data.length === 0 && isAdmin) {

            // Primeira vez: envia as salas que o sistema já tem
            // (as salvas neste navegador ou as padrão)
            dataReady = true;

            await pushTable(
                "rooms", rooms, roomToRow, row => JSON.stringify(row), SYNC.rooms
            );

        } else {

            rooms = roomsResult.data
                .map(rowToRoom)
                .sort((a, b) => a.number - b.number);

            SYNC.rooms.clear();
            rooms.forEach(room => {
                SYNC.rooms.set(room.id, JSON.stringify(roomToRow(room)));
            });

        }


        // Reservas
        reservations = reservationsResult.data
            .map(rowToReservation)
            .map(normalizeReservation);

        // O nome mostrado vem da sala atual
        reservations.forEach(item => {
            const room = rooms.find(r => r.id === item.room);
            if (room) item.roomName = room.name;
        });

        SYNC.reservations.clear();
        reservations.forEach(item => {
            SYNC.reservations.set(item.id, reservationKey(reservationToRow(item)));
        });


        // Histórico
        historyList = historyResult.data.map(rowToHistory);

        SYNC.history.clear();
        historyList.forEach(entry => SYNC.history.add(entry.id));


        dataReady = true;

    } catch (error) {

        console.error("Erro ao carregar do banco:", error);

        dataReady = false;

        if (typeof showToast === "function") {
            showToast("Não foi possível carregar os dados do banco.", "error");
        }

    }

}