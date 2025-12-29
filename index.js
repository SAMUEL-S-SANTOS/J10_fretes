const TEMPO_ESPERA = 500; 

function configurarAutocomplete(inputId, listaId) {
    const input = document.getElementById(inputId);
    const lista = document.getElementById(listaId);
    let timeoutId;

    if (!input || !lista) return;

    
    input.addEventListener('input', function() {
        const termo = this.value;

        
        clearTimeout(timeoutId);

        if (termo.length < 3) {
            lista.style.display = 'none';
            return;
        }

       
        timeoutId = setTimeout(() => {
            buscarEnderecos(termo, lista, input);
        }, TEMPO_ESPERA);
    });

    
    document.addEventListener('click', function(e) {
        if (e.target !== input) {
            lista.style.display = 'none';
        }
    });
}

async function buscarEnderecos(termo, lista, input) {
    try {
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(termo)}&countrycodes=br&limit=5`;

        const response = await fetch(url);
        const data = await response.json();

        lista.innerHTML = ''; 

        if (data.length === 0) {
            lista.style.display = 'none';
            return;
        }

       
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.display_name; 
            
            
            li.addEventListener('click', () => {
                input.value = item.display_name; 
                lista.style.display = 'none'; 
                
                
                console.log("Lat:", item.lat, "Lon:", item.lon);
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