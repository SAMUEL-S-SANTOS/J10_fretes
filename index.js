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
    industrial: ["Máquinas", "Equipamentos", "Ferramentas"],
    comercial: ["Produtos", "Caixas", "Materiais de escritório"],
    residencial: ["Armário", "Sofá", "Geladeira", "Cama", "Mesa"]
};

const freightType = document.getElementById('freight-type');
const itemsDiv = document.getElementById('item-quantities');
const itemsTextarea = document.getElementById('items');

freightType.addEventListener('change', function() {
    const selected = this.value;
    itemsDiv.innerHTML = '';
    itemsTextarea.value = '';
    if (freightItems[selected]) {
        freightItems[selected].forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '4px';
            const label = document.createElement('label');
            label.textContent = item + ': ';
            label.style.marginRight = '4px';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '';
            input.style.width = '60px';
            input.setAttribute('data-item', item);
            input.addEventListener('input', updateItemsTextarea);
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            itemsDiv.appendChild(wrapper);
        });
    }
});

function updateItemsTextarea() {
    const inputs = itemsDiv.querySelectorAll('input[type="number"]');
    const result = [];
    inputs.forEach(input => {
        const qty = parseInt(input.value, 10);
        const name = input.getAttribute('data-item');
        if (!isNaN(qty) && qty > 0) {
            result.push(`${name}: ${qty}`);
        }
    });
    itemsTextarea.value = result.join('\n');
}