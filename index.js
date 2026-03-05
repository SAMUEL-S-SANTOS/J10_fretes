const TEMPO_ESPERA = 500; 

function configurarAutocomplete(inputId, listaId) {
    const input = document.getElementById(inputId);
    const lista = document.getElementById(listaId);
    let timeoutId;

    if (!input || !lista) return;

    input.addEventListener('input', function() {
        
        const valorTotal = this.value;
        const numeroDigitado = valorTotal.match(/\d+/) ? valorTotal.match(/\d+/)[0] : '';
        
       
        const termoLimpo = valorTotal.replace(/\d+/g, '').trim();

        clearTimeout(timeoutId);

        if (termoLimpo.length < 3) {
            lista.style.display = 'none';
            return;
        }

        timeoutId = setTimeout(() => {
            
            buscarEnderecos(termoLimpo, lista, input, numeroDigitado);
        }, TEMPO_ESPERA);
    });

    document.addEventListener('click', function(e) {
        if (e.target !== input) {
            lista.style.display = 'none';
        }
    });
}

async function buscarEnderecos(termo, lista, input, numeroSalvo) {
    try {
        
        const termoBusca = `${termo}, Santa Catarina`;

        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(termoBusca)}&countrycodes=br&limit=5&addressdetails=1`;

        const response = await fetch(url);
        const data = await response.json();

        lista.innerHTML = '';

        if (data.length === 0) {
            lista.style.display = 'none';
            return;
        }

        data.forEach(item => {
            const li = document.createElement('li');
            
          
            const end = item.address;
            
            
            const rua = end.road || end.pedestrian || end.street || termo;
            const bairro = end.suburb || end.neighbourhood || end.residential || '';
            const cidade = end.city || end.town || end.municipality || end.village || '';
            const estado = "SC"; 

            let textoSugestao = `${rua}`;
            if (bairro) textoSugestao += `, ${bairro}`;
            if (cidade) textoSugestao += ` - ${cidade}`;
            
            li.textContent = textoSugestao;

            
            li.addEventListener('click', () => {
                
                const numeroFinal = numeroSalvo ? numeroSalvo : "";
                
                
                let enderecoFormatado = `${rua}, ${numeroFinal}`;
                
                
                if (!numeroFinal) enderecoFormatado += " "; 
                
                if (bairro) enderecoFormatado += `, ${bairro}`;
                if (cidade) enderecoFormatado += `, ${cidade}-${estado}`;

                input.value = enderecoFormatado;
                lista.style.display = 'none';
                
                
                input.focus();
            });

            lista.appendChild(li);
        });

        lista.style.display = 'block';

    } catch (error) {
        console.error("Erro ao buscar endereço:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    configurarAutocomplete('txtOrigem', 'listaOrigem');
    configurarAutocomplete('txtDestino', 'listaDestino');
});

const freightItems = {
    industrial: ["Máquinas", "Mesa", "Cadeiras", "Bancadas", "Armarios"],
    comercial: ["Produtos", "Caixas", "Mesas", "Cadeiras", "Prateleiras", "Balcões", "Expositores"],
    residencial: ["Armário", "Sofá", "Geladeira", "Cama", "Mesa", "Fogão", "Máquina de Lavar", "Estante", "Cadeira"]
};

const freightType = document.getElementById('freight-type');
const itemsDiv = document.getElementById('item-quantities');
const itemsTextarea = document.getElementById('items');
if (itemsTextarea) {
    itemsTextarea.setAttribute('maxlength', '200');
}

freightType.addEventListener('change', function() {
    const selected = this.value;
    itemsDiv.innerHTML = '';
    itemsTextarea.value = '';
    if (freightItems[selected]) {
        freightItems[selected].forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '4px';

            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.setAttribute('data-item', item);
            checkbox.style.marginRight = '6px';

            
            const label = document.createElement('label');
            label.textContent = item;
            label.style.marginRight = '8px';

            
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '';
            input.style.width = '60px';
            input.setAttribute('data-item', item);
            input.style.display = 'none';

        
            checkbox.addEventListener('change', function() {
                if (checkbox.checked) {
                    input.style.display = '';
                    input.focus();
                } else {
                    input.style.display = 'none';
                    input.value = '';
                }
                updateItemsTextarea();
            });

            
            input.addEventListener('input', updateItemsTextarea);

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            itemsDiv.appendChild(wrapper);
        });

        
        const outroWrapper = document.createElement('div');
        outroWrapper.style.marginTop = '8px';
        outroWrapper.style.marginBottom = '4px';

        const outroBtn = document.createElement('button');
        outroBtn.type = 'button';
        outroBtn.textContent = 'Outro';
        outroBtn.className = 'action-btn';
        outroBtn.style.marginRight = '8px';

        // Textarea para outros itens
        const outroTextarea = document.createElement('textarea');
        outroTextarea.placeholder = 'Descreva outros itens (máx. 200 caracteres)';
        outroTextarea.style.display = 'none';
        outroTextarea.style.width = '100%';
        outroTextarea.style.marginTop = '8px';
        outroTextarea.setAttribute('id', 'outro-item-nome');
        outroTextarea.setAttribute('maxlength', '200');
        outroTextarea.rows = 2;

        // Exibir textarea ao clicar no botão
        outroBtn.addEventListener('click', function() {
            outroTextarea.style.display = '';
            outroTextarea.focus();
        });

        // Quebrar linha ao pressionar Enter
        outroTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const start = outroTextarea.selectionStart;
                const end = outroTextarea.selectionEnd;
                outroTextarea.value = outroTextarea.value.substring(0, start) + "\n" + outroTextarea.value.substring(end);
                outroTextarea.selectionStart = outroTextarea.selectionEnd = start + 1;
                updateItemsTextarea();
            }
        });

        outroTextarea.addEventListener('input', updateItemsTextarea);

        outroWrapper.appendChild(outroBtn);
        outroWrapper.appendChild(outroTextarea);
        itemsDiv.appendChild(outroWrapper);
    }
});

function updateItemsTextarea() {
    const wrappers = itemsDiv.querySelectorAll('div');
    const result = [];
    wrappers.forEach(wrapper => {
        const checkbox = wrapper.querySelector('input[type="checkbox"]');
        const input = wrapper.querySelector('input[type="number"]');
        if (checkbox && input && checkbox.checked) {
            const qty = parseInt(input.value, 10);
            const name = checkbox.getAttribute('data-item');
            if (!isNaN(qty) && qty > 0) {
                result.push(`${name}: ${qty}`);
            }
        }
    });
   
    itemsTextarea.value = result.join('\n');

    const formOrcamento = document.getElementById('quoteForm');

formOrcamento.addEventListener('submit', function(event) {
    // Impede a página de recarregar
    event.preventDefault();

    // Feedback visual para o usuário
    const btnSubmit = document.querySelector('.submit-btn');
    const textoOriginal = btnSubmit.value;
    btnSubmit.value = 'Enviando...';

    
    emailjs.sendForm('SEU_SERVICE_ID', 'SEU_TEMPLATE_ID', this)
        .then(function() {
            
            alert('Orçamento solicitado com sucesso! Entraremos em contato em breve.');
            
            
            btnSubmit.value = textoOriginal;
            formOrcamento.reset();
            
           
            const itemsDiv = document.getElementById('item-quantities');
            if (itemsDiv) itemsDiv.innerHTML = '';
            
        }, function(error) {
           
            console.error('Erro ao enviar e-mail:', error);
            alert('Ocorreu um erro ao enviar o orçamento. Tente novamente mais tarde.');
            btnSubmit.value = textoOriginal;
        });
});
}