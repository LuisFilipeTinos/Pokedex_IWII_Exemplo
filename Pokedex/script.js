 const TYPE_COLORS = {
    normal:  "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
    grass:   "#7AC74C", ice:  "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground:  "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock:    "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel:   "#B7B7CE", fairy: "#D685AD"
  };

  const els = {
    form: document.getElementById('searchForm'),
    input: document.getElementById('searchInput'),
    stateMessage: document.getElementById('stateMessage'),
    card: document.getElementById('pokemonCard'),
    dexNumber: document.getElementById('dexNumber'),
    sprite: document.getElementById('sprite'),
    model: document.getElementById('model'),
    modelShiny: document.getElementById('model-shiny'),
    name: document.getElementById('pName'),
    meta: document.getElementById('pMeta'),
    typeBadges: document.getElementById('typeBadges'),
    factHeight: document.getElementById('factHeight'),
    factWeight: document.getElementById('factWeight'),
    factExp: document.getElementById('factExp'),
    factDefault: document.getElementById('factDefault'),
    abilityList: document.getElementById('abilityList'),
    statList: document.getElementById('statList'),
    crySection: document.getElementById('crySection'),
    cryBtn: document.getElementById('cryBtn'),
    cryAudio: document.getElementById('cryAudio'),
    quickBtns: document.querySelectorAll('.quick-btn')
  };

  function showState(glyph, text){
    els.card.classList.remove('visible');
    els.stateMessage.style.display = 'flex';
    els.stateMessage.querySelector('.glyph').textContent = glyph;
    els.stateMessage.querySelector('div:last-child') ? null : null;
    els.stateMessage.innerHTML = `<div class="glyph">${glyph}</div><div>${text}</div>`;
  }

  function statLabel(name){
    const map = {
      hp: 'HP', attack: 'ataque', defense: 'defesa',
      'special-attack': 'ataque esp.', 'special-defense': 'defesa esp.', speed: 'velocidade'
    };
    return map[name] || name;
  }

  async function loadPokemon(query){
    const key = query.trim().toLowerCase();
    if(!key) return;

    showState('...', 'Consultando a PokéAPI.');

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}/`);
      if(!res.ok){
        if(res.status === 404){
          showState('X', `Nenhum Pokémon encontrado para "${query}". Confira o nome ou número.`);
        } else {
          showState('!', 'A PokéAPI não respondeu como esperado. Tente novamente.');
        }
        return;
      }
      const data = await res.json();
      renderPokemon(data);
    } catch (err) {
      showState('!', 'Não foi possível conectar à PokéAPI agora. Verifique sua conexão e tente de novo.');
    }
  }

  function renderPokemon(data){
    els.stateMessage.style.display = 'none';
    els.card.classList.add('visible');

    els.dexNumber.textContent = `Nº ${String(data.id).padStart(3, '0')}`;

    const artwork = data.sprites?.other?.['official-artwork']?.front_default
      || data.sprites?.front_default
      || '';
    els.sprite.src = artwork;
    els.sprite.alt = data.name;

    els.model.src = data.sprites?.other?.['showdown']?.front_default;
    els.modelShiny.src = data.sprites?.other?.['showdown']?.front_shiny;

    els.name.textContent = data.name;
    els.meta.textContent = `Ordem de aparição: ${data.order ?? '—'}`;

    els.typeBadges.innerHTML = '';
    (data.types || []).forEach(t => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.textContent = t.type.name;
      badge.style.background = TYPE_COLORS[t.type.name] || '#888';
      els.typeBadges.appendChild(badge);
    });

    els.factHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
    els.factWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;
    els.factExp.textContent = data.base_experience != null ? data.base_experience : '—';
    els.factDefault.textContent = data.is_default ? 'sim' : 'não';

    els.abilityList.innerHTML = '';
    (data.abilities || []).forEach(a => {
      const chip = document.createElement('span');
      chip.className = 'ability-chip' + (a.is_hidden ? ' hidden-ability' : '');
      chip.textContent = a.ability.name.replace(/-/g, ' ');
      els.abilityList.appendChild(chip);
    });

    els.statList.innerHTML = '';
    (data.stats || []).forEach(s => {
      const max = 180;
      const pct = Math.min(100, Math.round((s.base_stat / max) * 100));
      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <span class="stat-label">${statLabel(s.stat.name)}</span>
        <span class="stat-track"><span class="stat-fill" style="width:${pct}%"></span></span>
        <span class="stat-value">${s.base_stat}</span>
      `;
      els.statList.appendChild(row);
    });

    const cryUrl = data.cries?.latest || data.cries?.legacy;
    if (cryUrl) {
      els.crySection.style.display = 'block';
      els.cryAudio.src = cryUrl;
      els.cryBtn.onclick = () => {
        els.cryAudio.currentTime = 0;
        els.cryAudio.play().catch(() => {});
      };
    } else {
      els.crySection.style.display = 'none';
    }
  }

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadPokemon(els.input.value);
  });

  els.quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      els.input.value = btn.dataset.pick;
      loadPokemon(btn.dataset.pick);
    });
  });

  loadPokemon('bulbasaur');