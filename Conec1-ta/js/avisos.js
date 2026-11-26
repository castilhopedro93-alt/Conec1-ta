/* =========================================================
   AVISOS DE RESERVA
   Enquanto o site estiver aberto, avisa a pessoa sobre as
   reservas dela: 1 dia antes e 2 horas antes.
   Precisa ser carregado DEPOIS do script.js.
========================================================= */

const AVISO_UM_DIA = 24 * 60 * 60 * 1000;
const AVISO_DUAS_HORAS = 2 * 60 * 60 * 1000;
const AVISO_DURACAO = 15 * 1000;       // quanto tempo o aviso fica na tela
const AVISO_CHECAGEM = 60 * 1000;      // confere a cada minuto


/* ---------- Quais avisos já foram mostrados ---------- */

// Fica salvo por usuário neste navegador, para não repetir o aviso
// quando a pessoa recarrega a página.
function chaveAvisos() {

    const user = getCurrentUser();

    return "conecta_avisos_" + (user && user.email ? user.email : "sem-usuario");

}


function lerAvisosFeitos() {

    try {
        const saved = JSON.parse(localStorage.getItem(chaveAvisos()));
        if (saved && typeof saved === "object") return saved;
    } catch (error) {
        // dados corrompidos: começa do zero
    }

    return {};

}


function salvarAvisosFeitos(feitos) {

    try {
        localStorage.setItem(chaveAvisos(), JSON.stringify(feitos));
    } catch (error) {
        // sem espaço ou bloqueado: o aviso só pode se repetir
    }

}


/* ---------- Texto dos avisos ---------- */

function inicioDaReserva(item) {

    return new Date(`${item.date}T${item.startTime}:00`);

}


function textoQuando(item) {

    const hoje = getTodayString();

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);

    if (item.date === hoje) return "hoje";
    if (item.date === toDateString(amanha)) return "amanhã";

    return "em " + formatDate(item.date);

}


function textoFaltam(milissegundos) {

    const minutos = Math.max(1, Math.round(milissegundos / 60000));

    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    return resto ? `${horas} h e ${resto} min` : `${horas} h`;

}


function montarMensagem(item, tipo, faltam) {

    const sala = item.roomName || "sala";
    const horario = formatRange(item);

    if (tipo === "2h") {
        return `Sua reserva da ${sala} começa em ${textoFaltam(faltam)} (${horario}).`;
    }

    return `Lembrete: você tem a reserva da ${sala} ${textoQuando(item)}, das ${horario}.`;

}


/* ---------- Aviso na tela ---------- */

function mostrarAviso(mensagem, tipo) {

    const container = $("#toastContainer");

    if (!container) return;

    const aviso = document.createElement("div");

    aviso.className = "toast warning toast-lembrete";
    aviso.setAttribute("role", "status");

    const icone = document.createElement("div");
    icone.className = "toast-icon";
    icone.textContent = "!";

    const corpo = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = tipo === "2h" ? "Sua reserva está chegando" : "Lembrete de reserva";

    const texto = document.createElement("p");
    texto.textContent = mensagem;

    corpo.append(titulo, texto);

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "toast-close";
    fechar.setAttribute("aria-label", "Fechar aviso");
    fechar.textContent = "×";

    aviso.append(icone, corpo, fechar);
    container.appendChild(aviso);

    const remover = () => {
        aviso.style.opacity = "0";
        aviso.style.transform = "translateX(20px)";
        setTimeout(() => aviso.remove(), 250);
    };

    fechar.addEventListener("click", remover);
    setTimeout(remover, AVISO_DURACAO);

}


/* ---------- Conferência ---------- */

// Cada reserva tem dois avisos, independentes:
//   "1d": quando faltarem 24 horas (só se a reserva foi feita com mais de 24 h de antecedência)
//   "2h": quando faltarem 2 horas
// Cada um aparece uma vez só (fica salvo neste navegador).
function conferirAvisos() {

    if (!getCurrentUser()) return;

    const agora = Date.now();

    const feitos = lerAvisosFeitos();

    let mudou = false;


    // Limpa o que não existe mais (reservas canceladas ou antigas)
    const ids = new Set(reservations.map(item => item.id));

    Object.keys(feitos).forEach(id => {
        if (!ids.has(id)) {
            delete feitos[id];
            mudou = true;
        }
    });


    reservations
        .filter(isMine)
        .sort((a, b) => inicioDaReserva(a) - inicioDaReserva(b))
        .forEach(item => {

            const faltam = inicioDaReserva(item).getTime() - agora;

            // Já começou ou já passou
            if (faltam <= 0) return;

            // Ainda falta mais de 1 dia
            if (faltam > AVISO_UM_DIA) return;

            const jaFeitos = feitos[item.id] || [];

            // Reserva feita com menos de 24 h de antecedência: não existe
            // "um dia antes" para avisar, então só vale o aviso de 2 horas.
            const inicio = inicioDaReserva(item).getTime();
            const criadaEm = item.createdAt ? new Date(item.createdAt).getTime() : 0;
            const semTempoPara1d = criadaEm > inicio - AVISO_UM_DIA;

            const devemAvisar1d = !semTempoPara1d && !jaFeitos.includes("1d");
            const devemAvisar2h = faltam <= AVISO_DUAS_HORAS && !jaFeitos.includes("2h");


            // Se os dois ficaram devidos ao mesmo tempo (o site estava fechado,
            // ou a reserva foi criada para daqui a menos de 2 horas), mostra só
            // o de 2 horas, que é o que ainda importa.
            if (devemAvisar2h) {

                mostrarAviso(montarMensagem(item, "2h", faltam), "2h");

                feitos[item.id] = ["1d", "2h"];
                mudou = true;

                return;

            }

            if (devemAvisar1d) {

                mostrarAviso(montarMensagem(item, "1d", faltam), "1d");

                feitos[item.id] = [...jaFeitos, "1d"];
                mudou = true;

            }

        });


    if (mudou) salvarAvisosFeitos(feitos);

}


let avisosIniciados = false;

// Chamada pelo script.js depois de carregar os dados
function iniciarAvisos() {

    if (avisosIniciados) return;

    avisosIniciados = true;

    conferirAvisos();

    setInterval(conferirAvisos, AVISO_CHECAGEM);

}


// Para testar a aparência pelo Console do navegador (F12): avisosDeTeste()
function avisosDeTeste() {

    mostrarAviso("Lembrete: você tem a reserva da Sala 01 amanhã, das 10:00 – 11:00.", "1d");

    setTimeout(() => {
        mostrarAviso("Sua reserva da Sala 01 começa em 2 h (10:00 – 11:00).", "2h");
    }, 1500);

}
