// Elementos do DOM
const cepInput = document.getElementById('cepInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('resultCard');
const errorMessage = document.getElementById('errorMessage');

// Elementos para exibir os resultados
const cepElement = document.getElementById('cep');
const logradouroElement = document.getElementById('logradouro');
const bairroElement = document.getElementById('bairro');
const cidadeElement = document.getElementById('cidade');
const estadoElement = document.getElementById('estado');

// Função para formatar o CEP (adicionar hífen)
function formatCEP(cep) {
    cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length <= 5) return cep;
    return cep.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}

// Função para limpar o CEP (remover hífen)
function cleanCEP(cep) {
    return cep.replace(/\D/g, '');
}

// Evento para formatar o CEP enquanto digita
cepInput.addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = value.substring(0, 8); // Limita a 8 dígitos
    
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5);
    }
    
    e.target.value = value;
});

// Função principal para buscar o CEP
async function buscarCEP() {
    // Limpa mensagens anteriores
    resultCard.style.display = 'none';
    errorMessage.classList.remove('active');
    
    // Obtém e valida o CEP
    let cep = cleanCEP(cepInput.value);
    
    if (cep.length !== 8) {
        errorMessage.textContent = '⚠️ CEP deve conter 8 dígitos!';
        errorMessage.classList.add('active');
        return;
    }

    // Mostra loading
    loading.classList.add('active');
    searchBtn.disabled = true;

    try {
        // Faz a requisição para a API ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        // Esconde loading
        loading.classList.remove('active');
        searchBtn.disabled = false;

        // Verifica se o CEP foi encontrado
        if (data.erro) {
            errorMessage.textContent = '⚠️ CEP não encontrado!';
            errorMessage.classList.add('active');
            return;
        }

        // Preenche os dados no card
        cepElement.textContent = formatCEP(data.cep) || '-';
        logradouroElement.textContent = data.logradouro || '-';
        bairroElement.textContent = data.bairro || '-';
        cidadeElement.textContent = data.localidade || '-';
        estadoElement.textContent = data.uf || '-';

        // Mostra o card de resultado
        resultCard.style.display = 'block';

    } catch (error) {
        // Esconde loading
        loading.classList.remove('active');
        searchBtn.disabled = false;
        
        // Mostra mensagem de erro
        errorMessage.textContent = '⚠️ Erro ao buscar CEP. Tente novamente!';
        errorMessage.classList.add('active');
        console.error('Erro:', error);
    }
}

// Função para preencher CEP de exemplo (torna global)
window.fillExampleCEP = function(cep) {
    cepInput.value = formatCEP(cep);
    buscarCEP();
}

// Evento do botão de busca
searchBtn.addEventListener('click', buscarCEP);

// Evento para buscar ao pressionar Enter
cepInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarCEP();
    }
});

// Validação adicional do CEP (apenas números)
cepInput.addEventListener('keydown', function(e) {
    // Permite: backspace, delete, tab, escape, enter, setas, hífen
    if ([46, 8, 9, 27, 13, 37, 38, 39, 40, 189].indexOf(e.keyCode) !== -1 ||
        // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true))) {
        return;
    }

    // Impede caracteres não numéricos
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});