/* =========================================================
   MOSTRAR / ESCONDER SENHA
   Coloca um botão de "olho" dentro de cada campo de senha
   da página (login, cadastro e redefinir senha).
========================================================= */

(function () {

    const OLHO =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

    const OLHO_FECHADO =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6"/>' +
        '<path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>' +
        '<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M3 3l18 18"/></svg>';


    function adicionarOlho(input) {

        if (input.dataset.olho) return;
        input.dataset.olho = "1";


        // Envolve o campo para o botão ficar por cima, no canto direito
        const caixa = document.createElement("div");
        caixa.className = "senha-caixa";
        input.parentNode.insertBefore(caixa, input);
        caixa.appendChild(input);


        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "olho";
        botao.innerHTML = OLHO;
        botao.setAttribute("aria-label", "Mostrar senha");
        botao.setAttribute("aria-pressed", "false");
        botao.title = "Mostrar senha";
        caixa.appendChild(botao);


        botao.addEventListener("click", () => {

            const mostrando = input.type === "password";

            input.type = mostrando ? "text" : "password";

            botao.innerHTML = mostrando ? OLHO_FECHADO : OLHO;
            botao.setAttribute("aria-label", mostrando ? "Esconder senha" : "Mostrar senha");
            botao.setAttribute("aria-pressed", String(mostrando));
            botao.title = mostrando ? "Esconder senha" : "Mostrar senha";

            // Mantém o cursor no campo, no fim do texto
            input.focus();
            const fim = input.value.length;
            try { input.setSelectionRange(fim, fim); } catch (e) { /* alguns tipos não aceitam */ }

        });


        // Ao enviar o formulário, volta a esconder a senha
        if (input.form) {
            input.form.addEventListener("submit", () => {
                if (input.type === "text") botao.click();
            });
        }

    }


    function iniciar() {
        document.querySelectorAll('input[type="password"]').forEach(adicionarOlho);
    }


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
