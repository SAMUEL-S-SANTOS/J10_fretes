function initAutocomplete() {
    
    const inputOrigem = document.getElementById("txtOrigem");
    const inputDestino = document.getElementById("txtDestino");

    
    if (!inputOrigem || !inputDestino) {
        console.error("Campos de endereço não encontrados no HTML.");
        return;
    }

    
    const options = {
        componentRestrictions: { country: "br" }, 
        fields: ["address_components", "geometry", "icon", "name"],
        types: ["address"], 
    };

    
    const autocompleteOrigem = new google.maps.places.Autocomplete(inputOrigem, options);

    
    const autocompleteDestino = new google.maps.places.Autocomplete(inputDestino, options);

    
    autocompleteOrigem.addListener("place_changed", () => {
        const place = autocompleteOrigem.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
            console.log("Local retornado não possui geometria.");
            return;
        }
        console.log("Endereço Origem selecionado:", place.name);
        console.log("Lat:", place.geometry.location.lat(), "Lng:", place.geometry.location.lng());
    });
}


window.initAutocomplete = initAutocomplete;