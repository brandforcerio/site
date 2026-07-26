/* ==========================================================================
   BRAND FORCE — admin/admin.js
   Painel oculto de blog. Duas camadas:
   1) "Portão" de senha local (só uma barreira de conveniência — o hash
      fica salvo no localStorage DESTE navegador, nada é enviado a lugar
      nenhum). Não é criptografia forte, é só para afastar curiosos.
   2) Autenticação real: um Personal Access Token do GitHub com permissão
      de escrita no repositório. Sem esse token, ninguém publica nada,
      mesmo que descubra a URL do painel.
   ========================================================================== */
(function(){
  "use strict";

  var LS_HASH = 'bf_admin_pass_hash';
  var SS_TOKEN = 'bf_gh_token';
  var LS_OWNER = 'bf_gh_owner';
  var LS_REPO = 'bf_gh_repo';
  var LS_BRANCH = 'bf_gh_branch';
  var LS_LANG = 'bf_gh_lang';

  function sha256(text){
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(function(buf){
      return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
    });
  }

  /* ---------------------------- PORTÃO ---------------------------- */
  var gateScreen = document.getElementById('gateScreen');
  var panelScreen = document.getElementById('panelScreen');
  var gateTitle = document.getElementById('gateTitle');
  var gatePass = document.getElementById('gatePass');
  var gateBtn = document.getElementById('gateBtn');
  var gateMsg = document.getElementById('gateMsg');

  var storedHash = localStorage.getItem(LS_HASH);
  if(!storedHash){
    gateTitle.textContent = 'Crie uma senha de acesso';
    gatePass.placeholder = 'Escolha uma senha para este navegador';
  }

  function showGateMsg(text, ok){
    gateMsg.textContent = text;
    gateMsg.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  gateBtn.addEventListener('click', function(){
    var val = gatePass.value.trim();
    if(!val){ showGateMsg('Digite uma senha.', false); return; }

    if(!storedHash){
      sha256(val).then(function(hash){
        localStorage.setItem(LS_HASH, hash);
        openPanel();
      });
      return;
    }
    sha256(val).then(function(hash){
      if(hash === storedHash) openPanel();
      else showGateMsg('Senha incorreta.', false);
    });
  });
  gatePass.addEventListener('keydown', function(e){ if(e.key === 'Enter') gateBtn.click(); });

  function openPanel(){
    gateScreen.classList.add('hidden');
    panelScreen.classList.remove('hidden');
    restoreConfig();
  }

  /* ---------------------------- CONEXÃO GITHUB ---------------------------- */
  var cfgOwner = document.getElementById('cfgOwner');
  var cfgRepo = document.getElementById('cfgRepo');
  var cfgBranch = document.getElementById('cfgBranch');
  var cfgToken = document.getElementById('cfgToken');
  var cfgLang = document.getElementById('cfgLang');
  var connectBtn = document.getElementById('connectBtn');
  var connectMsg = document.getElementById('connectMsg');
  var listCard = document.getElementById('listCard');
  var formCard = document.getElementById('formCard');

  function restoreConfig(){
    cfgOwner.value = localStorage.getItem(LS_OWNER) || '';
    cfgRepo.value = localStorage.getItem(LS_REPO) || '';
    cfgBranch.value = localStorage.getItem(LS_BRANCH) || 'main';
    if(cfgLang) cfgLang.value = localStorage.getItem(LS_LANG) || 'pt';
    var tok = sessionStorage.getItem(SS_TOKEN);
    if(tok) cfgToken.value = tok;
  }

  function showConnectMsg(text, ok){
    connectMsg.textContent = text;
    connectMsg.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  function ghHeaders(){
    return {
      'Authorization': 'Bearer ' + sessionStorage.getItem(SS_TOKEN),
      'Accept': 'application/vnd.github+json'
    };
  }

  function currentLang(){
    return (cfgLang && cfgLang.value) || localStorage.getItem(LS_LANG) || 'pt';
  }

  function ghApiUrl(){
    var owner = localStorage.getItem(LS_OWNER);
    var repo = localStorage.getItem(LS_REPO);
    return 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/data/posts.' + currentLang() + '.json';
  }

  var currentSha = null;
  var currentPosts = [];

  connectBtn.addEventListener('click', function(){
    if(!cfgOwner.value || !cfgRepo.value || !cfgToken.value){
      showConnectMsg('Preencha usuário, repositório e token.', false);
      return;
    }
    localStorage.setItem(LS_OWNER, cfgOwner.value.trim());
    localStorage.setItem(LS_REPO, cfgRepo.value.trim());
    localStorage.setItem(LS_BRANCH, cfgBranch.value.trim() || 'main');
    if(cfgLang) localStorage.setItem(LS_LANG, cfgLang.value);
    sessionStorage.setItem(SS_TOKEN, cfgToken.value.trim());

    fetchPosts();
  });

  function fetchPosts(){
    showConnectMsg('Conectando…', true);
    fetch(ghApiUrl() + '?ref=' + encodeURIComponent(localStorage.getItem(LS_BRANCH)), { headers: ghHeaders() })
      .then(function(r){
        if(!r.ok) throw new Error('Não foi possível ler o repositório (status ' + r.status + '). Confira usuário, repositório e token.');
        return r.json();
      })
      .then(function(data){
        currentSha = data.sha;
        var json = decodeURIComponent(escape(atob(data.content.replace(/\n/g,''))));
        currentPosts = JSON.parse(json);
        showConnectMsg('Conectado. ' + currentPosts.length + ' post(s) encontrados.', true);
        listCard.classList.remove('hidden');
        formCard.classList.remove('hidden');
        renderList();
      })
      .catch(function(err){ showConnectMsg(err.message, false); });
  }

  /* ---------------------------- LISTA ---------------------------- */
  var postList = document.getElementById('postList');

  function renderList(){
    if(!currentPosts.length){
      postList.innerHTML = '<p style="color:rgba(240,238,234,.5); font-size:.88rem;">Nenhum post ainda.</p>';
      return;
    }
    var sorted = currentPosts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    postList.innerHTML = sorted.map(function(p){
      return (
        '<div class="post-row">' +
          '<div><b>' + p.title + '</b><br><span>' + p.date + ' · ' + p.category + '</span></div>' +
          '<div class="row-actions">' +
            '<button data-edit="' + p.slug + '">Editar</button>' +
            '<button data-del="' + p.slug + '">Excluir</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    postList.querySelectorAll('[data-edit]').forEach(function(btn){
      btn.addEventListener('click', function(){ loadIntoForm(btn.getAttribute('data-edit')); });
    });
    postList.querySelectorAll('[data-del]').forEach(function(btn){
      btn.addEventListener('click', function(){ deletePost(btn.getAttribute('data-del')); });
    });
  }

  /* ---------------------------- FORMULÁRIO ---------------------------- */
  var fTitle = document.getElementById('fTitle');
  var fSlug = document.getElementById('fSlug');
  var fCategory = document.getElementById('fCategory');
  var fAuthor = document.getElementById('fAuthor');
  var fDate = document.getElementById('fDate');
  var fCover = document.getElementById('fCover');
  var fExcerpt = document.getElementById('fExcerpt');
  var fContent = document.getElementById('fContent');
  var formTitle = document.getElementById('formTitle');
  var formMsg = document.getElementById('formMsg');
  var saveBtn = document.getElementById('saveBtn');
  var newBtn = document.getElementById('newBtn');

  var editingSlug = null;

  function slugify(text){
    return text.toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  fTitle.addEventListener('input', function(){
    if(!editingSlug) fSlug.value = slugify(fTitle.value);
  });

  function clearForm(){
    editingSlug = null;
    formTitle.textContent = '3. Novo post';
    [fTitle,fSlug,fCategory,fCover,fExcerpt,fContent].forEach(function(el){ el.value = ''; });
    fAuthor.value = 'Equipe Brand Force';
    fDate.value = new Date().toISOString().slice(0,10);
    formMsg.className = 'msg';
  }
  newBtn.addEventListener('click', clearForm);
  clearForm();

  function loadIntoForm(slug){
    var p = currentPosts.find(function(x){ return x.slug === slug; });
    if(!p) return;
    editingSlug = slug;
    formTitle.textContent = 'Editando: ' + p.title;
    fTitle.value = p.title; fSlug.value = p.slug; fCategory.value = p.category;
    fAuthor.value = p.author; fDate.value = p.date; fCover.value = p.cover || '';
    fExcerpt.value = p.excerpt; fContent.value = p.content;
    window.scrollTo({ top: formCard.offsetTop - 20, behavior:'smooth' });
  }

  function commitPosts(message){
    var updated = JSON.stringify(currentPosts, null, 2);
    var b64 = btoa(unescape(encodeURIComponent(updated)));
    return fetch(ghApiUrl(), {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type':'application/json' }, ghHeaders()),
      body: JSON.stringify({
        message: message,
        content: b64,
        sha: currentSha,
        branch: localStorage.getItem(LS_BRANCH)
      })
    }).then(function(r){
      if(!r.ok) return r.json().then(function(e){ throw new Error(e.message || ('Erro ' + r.status)); });
      return r.json();
    }).then(function(res){
      currentSha = res.content.sha;
    });
  }

  saveBtn.addEventListener('click', function(){
    if(!fTitle.value || !fSlug.value){
      formMsg.textContent = 'Preencha ao menos título e slug.';
      formMsg.className = 'msg err';
      return;
    }
    var payload = {
      slug: slugify(fSlug.value),
      title: fTitle.value,
      excerpt: fExcerpt.value,
      category: fCategory.value || 'Geral',
      author: fAuthor.value || 'Equipe Brand Force',
      date: fDate.value || new Date().toISOString().slice(0,10),
      cover: fCover.value,
      content: fContent.value
    };

    if(editingSlug){
      var idx = currentPosts.findIndex(function(p){ return p.slug === editingSlug; });
      if(idx > -1) currentPosts[idx] = payload;
    } else {
      if(currentPosts.some(function(p){ return p.slug === payload.slug; })){
        formMsg.textContent = 'Já existe um post com esse slug. Escolha outro.';
        formMsg.className = 'msg err';
        return;
      }
      currentPosts.push(payload);
    }

    formMsg.textContent = 'Publicando…';
    formMsg.className = 'msg ok';
    commitPosts('blog: ' + (editingSlug ? 'atualiza' : 'publica') + ' post "' + payload.title + '"')
      .then(function(){
        formMsg.textContent = 'Publicado! O site atualiza em alguns instantes.';
        formMsg.className = 'msg ok';
        renderList();
        clearForm();
      })
      .catch(function(err){
        formMsg.textContent = 'Erro ao publicar: ' + err.message;
        formMsg.className = 'msg err';
      });
  });

  function deletePost(slug){
    if(!confirm('Excluir este post definitivamente?')) return;
    currentPosts = currentPosts.filter(function(p){ return p.slug !== slug; });
    commitPosts('blog: remove post "' + slug + '"').then(function(){
      renderList();
      if(editingSlug === slug) clearForm();
    }).catch(function(err){ alert('Erro ao excluir: ' + err.message); });
  }
})();
