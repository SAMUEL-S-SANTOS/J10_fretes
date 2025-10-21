(function () {
  const STORAGE_KEY = 'j10_locations_v1';
  const MAX_ENTRIES = 10;
  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  const form = document.getElementById('quoteForm');
  const locationInput = document.getElementById('location');
  const datalist = document.getElementById('locations');

  function loadLocations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch (e) {
      console.warn('Could not load locations from localStorage', e);
      return [];
    }
  }

  function saveLocations(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
    } catch (e) {
      console.warn('Could not save locations to localStorage', e);
    }
  }

  function populateDatalist(list) {
    datalist.innerHTML = '';
    list.forEach((loc) => {
      const opt = document.createElement('option');
      opt.value = loc;
      datalist.appendChild(opt);
    });
  }

  function addLocation(value) {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    let list = loadLocations();
    // remove duplicates (case-insensitive)
    list = list.filter((l) => l.toLowerCase() !== trimmed.toLowerCase());
    // insert at front
    list.unshift(trimmed);
    // cap length
    list = list.slice(0, MAX_ENTRIES);
    saveLocations(list);
    populateDatalist(list);
  }

  // debounced fetch helper
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // fetch suggestions from Nominatim (OpenStreetMap)
  async function fetchNominatim(query) {
    if (!query || query.trim().length < 2) return [];
    // Bias queries to Brazil by appending the country. We also request addressdetails=1 so
    // we can extract street and house number when available.
    const biasedQuery = `${query} Brazil`;
    const params = new URLSearchParams({
      q: biasedQuery,
      format: 'json',
      addressdetails: '1',
      limit: '12',
      dedupe: '1',
      countrycodes: 'br'
    });
    try {
      const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'Accept-Language': 'pt-BR',
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      
      const brazilOnly = (data || []).filter((item) => {
        return (item.address && item.address.country_code && item.address.country_code.toLowerCase() === 'br') ||
          (item.display_name && /brasil|brazil/i.test(item.display_name));
      });

     
      function formatItem(item) {
        const a = item.address || {};
        
        const locality = a.city || a.town || a.village || a.county || '';
        const state = a.state || '';
        const road = a.road || a.pedestrian || a.cycleway || a.footway || a.residential || '';
        const house = a.house_number || a.house || '';
        const neighbourhood = a.suburb || a.neighbourhood || a.hamlet || '';

        let main = '';
        if (road) {
          main = road + (house ? `, ${house}` : '');
        } else if (item.display_name) {
          
          main = item.display_name.split(',')[0];
        }

        const parts = [];
        if (main) parts.push(main);
        if (neighbourhood) parts.push(neighbourhood);
        if (locality) parts.push(locality);
        if (state) parts.push(state);

        const formatted = parts.join(' — ');
        return formatted || item.display_name;
      }

      const formatted = brazilOnly.map(formatItem).filter(Boolean);
      return formatted;
    } catch (e) {
      console.warn('Nominatim request failed', e);
      return [];
    }
  }

  function combineSuggestions(local, remote) {
    const seen = new Set();
    const out = [];
    const push = (s) => {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(s);
      }
    };
    local.forEach(push);
    remote.forEach(push);
    return out.slice(0, MAX_ENTRIES);
  }

  
  const updateSuggestions = debounce(async function () {
    const q = locationInput.value;
    const local = loadLocations().filter((l) => l.toLowerCase().includes(q.toLowerCase()));
    const remote = await fetchNominatim(q);
    const combined = combineSuggestions(local, remote);
    populateDatalist(combined);
  }, 250);

  
  const initial = loadLocations();
  populateDatalist(initial);

  
  if (form) {
    form.addEventListener('submit', function (e) {
      const val = locationInput && locationInput.value;
      if (val) addLocation(val);
      
    });
  }

  
  if (locationInput) {
    locationInput.addEventListener('input', function () {
      updateSuggestions();
    });

    locationInput.addEventListener('blur', function () {
      
      addLocation(locationInput.value);
    });

    locationInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        addLocation(locationInput.value);
      }
    });
  }

  
})();
