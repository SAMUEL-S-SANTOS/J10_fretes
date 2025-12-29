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