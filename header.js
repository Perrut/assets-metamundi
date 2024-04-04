document.documentElement.style.visibility = 'hidden';
document.documentElement.style.overflow = 'hidden';

metamundiIdApresentacao = 'div-lazy-0';
metamundiIdCardPesquisa = 'div-lazy-1';
metamundiIdSobre = 'div-lazy-2';
// metamundiIdQuemSomos = 'div-lazy-3';
metamundiIdDepoimentos = 'div-lazy-3';
metamundiIdCardProdutos = 'div-lazy-4';

onload = () => {
    console.log('Teste Script MetaMundi');
    if (estaNaPaginaInicial()) {
        // debito técnico, para forçar o lazy load
        window.scrollTo(0, document.body.scrollHeight);

        const load = promiseDeCarregamento();
        load.then(() => logicaPosCarregamento());
    } else {
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.overflow = '';
    }
    removeLinksHeaderUsuarioLogado();
};

logicaPosCarregamento = () => {
    // cards serviços
    const cartoes = getCartoes();
    adicionaEventoCartaoDesktop(cartoes);
    adicionaEventoCartaoMobile(cartoes);

    // links área site
    const botao = document.getElementById('metamundi-quem-somos-toggle-button');
    botao.addEventListener('click', function () {
        exibeItens();
    });

    // Area do cliente
    const authDivDesktop = document.querySelector("#header > div.primary-color > div.hidden-mobile.container.hide-in-mobile > div > div > div > div.content-auth");
    if (authDivDesktop) {
        authDivDesktop.innerHTML = '<button type="button" onclick="fazLogin()" class="el-button btn-hd-cadastrar primary-color el-button--text el-button--mini"><!----><!----><span>Área do cliente</span></button>';
    }
    const authDivMobile = document.querySelector("#modalHeaderMob > div > ul > li:nth-child(6)");
    if (authDivMobile) {
        authDivMobile.innerText = 'Área do cliente';
    }

    // Links do menu mobile
    controlaLinksMenuMobile();

    ocultaItensUsuarioNaoLogado();

    // Depoimentos
    carregaConteudoDepoimentos();

    // Padding Home e Header
    ajustaHeaderEHome();

    // Ajusta link quem somos footer
    ajustaLinkQuemSomosFooter();

    if ('https://metamundi.com.br/#sobre' === window.location.href) {
        location.href = '#sobre';
    }
    if ('https://metamundi.com.br/#solucoes' === window.location.href) {
        location.href = '#solucoes';
    }

    defineLinkLinkedIN();

    ocultaItensUsuarioLogado();

    // reseta hash paginas
    redefineHash();
    // debito técnico, para forçar o lazy load
    document.documentElement.style.visibility = 'visible';
    document.documentElement.style.overflow = '';

    adicionaSweetAlert();

    aguardaPorSweetAlertEExibeModalDeCadastro();
}

promiseDeCarregamento = () => {
    return new Promise(resolve => setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        resolve();
    }, 1000));
}

onhashchange = () => {
    redefineHash();
}

// reseta hash paginas de link
redefineHash = () => {
    if (['#sobre', '#solucoes', '#logout'].includes(location.hash)) {
        history.replaceState(null, '', '/');
    }
}

// Serviços
getCartoes = () => {
    return document.getElementsByClassName('metamundi-card-expansivel');
}

isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

adicionaEventoCartaoDesktop = (cartoes) => {
    for (let cartao of cartoes) {
        cartao.addEventListener('mouseover', function () {
            if (!isMobile()) {
                cartao.classList.add('metamundi-card-expansivel--expandido');
            }
        });
        cartao.addEventListener('mouseout', function () {
            if (!isMobile()) {
                cartao.classList.remove('metamundi-card-expansivel--expandido');
            }
        });
    }
}

adicionaEventoCartaoMobile = (cartoes) => {
    for (let cartao of cartoes) {
        cartao.addEventListener('click', function () {
            if (isMobile()) {
                for (let c of cartoes) {
                    if (c !== cartao) {
                        c.classList.remove('metamundi-card-expansivel--expandido');
                    }
                }
                cartao.classList.toggle('metamundi-card-expansivel--expandido');
            }
        });
    }
}

// Quem somos
exibeItens = () => {
    const itensParaExibir = document.getElementsByClassName('metamundi-quem-somos-conteudo--oculto');
    const botao = document.getElementById('metamundi-quem-somos-toggle-button');

    botao.innerText = botao.innerText === 'Mais' ? 'Menos' : 'Mais';

    for (item of itensParaExibir) {
        item.classList.toggle('metamundi-quem-somos-conteudo--exibe');
    }

    setTimeout(() => {
        for (item of itensParaExibir) {
            item.classList.toggle('metamundi-quem-somos-conteudo--show');
        }
        if (botao.innerText === 'Mais') {
            location.href = '#sobre';
        }
    }, 500);
}

// Area do cliente
fazLogin = () => {
    window.location.href = '/login'
}


// Links do menu mobile
controlaLinksMenuMobile = () => {
    if (isMobile()) {
        const sobre = document.querySelector("#modalHeaderMob > div > ul > div:nth-child(4) > div > li");
        const solucoes = document.querySelector("#modalHeaderMob > div > ul > div:nth-child(5) > div > li");

        for (link of [sobre, solucoes]) {
            link.addEventListener('click', function () {
                const fechar = document.querySelector("#modalHeaderMob > div > div > button");
                fechar.dispatchEvent(new Event('click'));
            });
        }
    }
}

isPessoaLogada = () => {
    // return document.getElementById('iptPessoaLogada').value !== 'null';
    // procura pelo texto Area do Cliente
    const pessoaLogadaDesktop = document
        .querySelector("#header > div.primary-color > div.hidden-mobile.container.hide-in-mobile > div > div > div > div.content-auth > button > span") === null;
    // procura pelo texto Sair
    const pessoaLogadaMobile = document.querySelector("#modalHeaderMob > div > ul > li:nth-child(7)") !== null;
    return pessoaLogadaDesktop || pessoaLogadaMobile;
}

// Depoimentos
let quantidadeDepoimentos = 0;
let depoimentoAtual = 1;
configuraSlideShow = () => {
    const slidesContainer = document.getElementById("metamundi-depoimentos-slides-container");
    const slide = document.querySelector(".metamundi-depoimentos-slide");
    const prevButton = document.getElementById("metamundi-depoimentos-slide-arrow-prev");
    const nextButton = document.getElementById("metamundi-depoimentos-slide-arrow-next");
    let slideShowInterval = setInterval(() => {
        trocaSlides();
    }, 5000);

    const trocaSlides = () => {
        if (quantidadeDepoimentos > 1) {
            if (depoimentoAtual !== quantidadeDepoimentos) {
                const slideWidth = slide.clientWidth;
                slidesContainer.scrollLeft += slideWidth;
                depoimentoAtual++;
            } else {
                const slideWidth = slide.clientWidth;
                slidesContainer.scrollLeft = slidesContainer.scrollLeft - (quantidadeDepoimentos * slideWidth);
                depoimentoAtual = 1;
            }
        }
    }

    slidesContainer.addEventListener("pointerover", () => {
        clearInterval(slideShowInterval);
    });

    slidesContainer.addEventListener("pointerleave", () => {
        slideShowInterval = setInterval(() => {
            trocaSlides();
        }, 5000);
    });

    nextButton.addEventListener("click", () => {
        if (quantidadeDepoimentos > 1 && depoimentoAtual !== quantidadeDepoimentos) {
            const slideWidth = slide.clientWidth;
            slidesContainer.scrollLeft += slideWidth;
            depoimentoAtual++;
        }
    });

    prevButton.addEventListener("click", () => {
        if (quantidadeDepoimentos > 1 && depoimentoAtual !== 1) {
            const slideWidth = slide.clientWidth;
            slidesContainer.scrollLeft -= slideWidth;
            depoimentoAtual--;
        }
    });
}

// Depoimentos
carregaConteudoDepoimentos = async () => {
    try {
        const response = await fetch("https://metamundi.com.br/Conteudo/Listar", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json;charset=UTF-8",
                "controllername": "home",
                "pragma": "no-cache",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
            },
            "referrer": "https://metamundi.com.br/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"IdConteudoTipo\":3,\"PageSize\":20,\"PageNumber\":1,\"PegarDescricao\":true}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        const dadosRequisicao = await response.json();
        const slidesContainer = document.getElementById("metamundi-depoimentos-slides-container");
        if (slidesContainer) {
            slidesContainer.innerHTML = '';
            dadosRequisicao.Data.forEach(depoimento => {
                slidesContainer.innerHTML += '<li class="metamundi-depoimentos-slide">' +
                    '<h3 class="metamundi-depoimentos-titulo">' + depoimento.Titulo + '</h3>' +
                    '<img class="metamundi-depoimentos-foto" loading="lazy" src="' + depoimento.ConteudoImagem[0].Path + '">' +
                    '<div class="metamundi-depoimentos-conteudo">' + depoimento.ConteudoDescricao.Descricao + '</div>'
                '</li>';
            });
            quantidadeDepoimentos = dadosRequisicao.Data.length;
            configuraSlideShow();
        }
    } catch (error) {
        console.error('Falha ao carregar os slides.', error);
    }
}

// Padding Home e Header
ajustaHeaderEHome = () => {
    if (estaNaPaginaInicial()) {
        const divConteudo = document.querySelector("#header-component");
        divConteudo.style.position = 'fixed';
        divConteudo.style.width = '100%';
        divConteudo.style.boxShadow = '0 0.5px #dadada';
        divConteudo.style.top = 0;
        document.querySelector("#div-lazy-0 > div > div > div").style.paddingTop = 0;
    }
}

// Ajusta link quem somos footer
ajustaLinkQuemSomosFooter = () => {
    document.querySelector("#footer > div.footer-wrapper > div > div > div:nth-child(1) > ul > li:nth-child(1) > a").href = 'https://metamundi.com.br/#sobre';
}

estaNaPaginaInicial = () => {
    return [
        'https://metamundi.com.br/',
        'https://metamundi.com.br/#sobre',
        'https://metamundi.com.br/#solucoes',
        'https://metamundi.com.br/#logout'
    ].includes(window.location.href);
}

ocultaItensUsuarioLogado = () => {
    if (isPessoaLogada()) {
        [
            metamundiIdApresentacao,
            metamundiIdDepoimentos,
            metamundiIdSobre
        ].forEach(item => {
            document.getElementById(item).remove();
        });
        document.getElementById(metamundiIdCardPesquisa).style.marginTop = '126px';
        document.querySelector("#div-lazy-1 > div").style.backgroundColor = 'white';
    }
}

ocultaItensUsuarioNaoLogado = () => {
    if (!isPessoaLogada()) {
        [
            metamundiIdCardPesquisa,
            metamundiIdCardProdutos
        ].forEach(item => {
            document.getElementById(item).remove();
        });
    }
}

removeLinksHeaderUsuarioLogado = () => {
    // remove links header se usuário logado
    if (isPessoaLogada()) {
        const listaHeaderDesktop = document.querySelector("#main-menu > nav > div > ul > div > ul");
        if (listaHeaderDesktop) {
            listaHeaderDesktop.remove();
        }
        const itemHeaderMobile = document.querySelector("#modalHeaderMob > div > ul > div:nth-child(3)");
        if (itemHeaderMobile) {
            itemHeaderMobile.remove();
            document.querySelector("#modalHeaderMob > div > ul > div:nth-child(3)").remove();
            document.querySelector("#modalHeaderMob > div > ul > div:nth-child(3)").remove();
        }
    }
}

defineLinkLinkedIN = () => {
    const link = document.querySelector("#footer > div.footer-wrapper > div > div > div:nth-child(4) > ul.social-icons.clearfix > li.linkedin > a");
    link.setAttribute('href', 'https://www.linkedin.com/company/metamundi-solucoes-para-viagens/');
}

adicionaSweetAlert = () => {
    const swalScript = document.createElement('script');
    swalScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/sweetalert2@11');
    document.head.appendChild(swalScript);
}

aguardaPorSweetAlertEExibeModalDeCadastro = () => {
    const verifica = setInterval(() => {
        if (Swal) {
            clearInterval(verifica);
            if (!isPessoaLogada() && window.location.href === 'https://metamundi.com.br/') {
                Swal.fire({
                    title: "Não perca as melhores oportunidades!",
                    text: "Cadastre-se e aproveite as nossas ofertas.",
                    confirmButtonColor: "#60b670",
                    confirmButtonText: "Cadastrar",
                    showCloseButton: true,
                    imageUrl: 'https://repositorio-prod.azurewebsites.net/api/repository/Produto/20376/1v0kEdvd_200x200'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'https://metamundi.com.br/Cadastro';
                    }
                });
            }
        }
    }, 500);
}