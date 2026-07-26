/* ==========================================================================
   BRAND FORCE — site.js
   Lógica específica da Brand Force (não mexe no main.js do template):
   - populamento dinâmico do blog (home / blog.html / publication.html)
   - envio do formulário de newsletter
   - ano automático no rodapé
   ========================================================================== */
(function(){
  "use strict";

  var LANG = window.BF_LANG || 'pt';
  var PREFIX = window.BF_PREFIX || '';

  var STRINGS = {
    pt: { readMore: 'Ler mais', empty: 'Nenhum post publicado ainda.', notFound: 'Post não encontrado.', backToBlog: 'Voltar para o blog', locale: 'pt-BR' },
    en: { readMore: 'Read more', empty: 'No posts published yet.', notFound: 'Post not found.', backToBlog: 'Back to blog', locale: 'en-US' },
    et: { readMore: 'Loe rohkem', empty: 'Postitusi pole veel avaldatud.', notFound: 'Postitust ei leitud.', backToBlog: 'Tagasi blogisse', locale: 'et-EE' }
  };
  var T = STRINGS[LANG] || STRINGS.pt;

  var PLACEHOLDER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#E7E2D8"/>' +
    '<g fill="#F7931E" transform="translate(200,150)">' +
    '<rect x="-14" y="-70" width="28" height="140" rx="14"/>' +
    '<rect x="-14" y="-70" width="28" height="140" rx="14" transform="rotate(60)"/>' +
    '<rect x="-14" y="-70" width="28" height="140" rx="14" transform="rotate(120)"/></g></svg>';
  var PLACEHOLDER_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(PLACEHOLDER_SVG);

  function fmtDate(iso){
    try{
      var d = new Date(iso + 'T12:00:00');
      return d.toLocaleDateString(T.locale, { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
    }catch(e){ return iso; }
  }

  function loadPosts(){
    return fetch(PREFIX + 'data/posts.' + LANG + '.json', { cache:'no-store' })
      .then(function(r){ if(!r.ok) throw new Error('posts indisponivel'); return r.json(); })
      .catch(function(err){ console.warn('Brand Force blog:', err); return []; });
  }

  function cardHTML(post, horizontal){
    var cover = post.cover && post.cover.trim() ? post.cover : PLACEHOLDER_COVER;
    return (
      '<a href="publication.html?slug=' + encodeURIComponent(post.slug) + '" class="mil-blog-card' + (horizontal ? ' mil-blog-card-hori mil-more' : '') + ' mil-mb-60">' +
        '<div class="mil-cover-frame mil-up"><img src="' + cover + '" alt="cover"></div>' +
        '<div class="mil-post-descr">' +
          '<div class="mil-labels mil-up mil-mb-30">' +
            '<div class="mil-label mil-upper mil-accent">' + (post.category || '').toUpperCase() + '</div>' +
            '<div class="mil-label mil-upper">' + fmtDate(post.date) + '</div>' +
          '</div>' +
          '<h4 class="mil-up mil-mb-30">' + post.title + '</h4>' +
          '<p class="mil-post-text mil-up mil-mb-30">' + (post.excerpt || '') + '</p>' +
          '<div class="mil-link mil-dark mil-arrow-place mil-up"><span>' + T.readMore + '</span></div>' +
        '</div>' +
      '</a>'
    );
  }

  /* ---------- corrige o seletor de idioma em publication.html (preserva ?slug=) ---------- */
  function fixPublicationLangLinks(){
    var search = location.search;
    var maps = {
      pt: { pt: 'publication.html', en: 'en/publication.html', et: 'et/publication.html' },
      en: { pt: '../publication.html', en: 'publication.html', et: '../et/publication.html' },
      et: { pt: '../publication.html', en: '../en/publication.html', et: 'publication.html' }
    };
    var map = maps[LANG];
    if(!map) return;
    document.querySelectorAll('[data-lang]').forEach(function(el){
      var l = el.getAttribute('data-lang');
      if(map[l]) el.setAttribute('href', map[l] + search);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){

    /* ---------- ano do rodape ---------- */
    var yearEl = document.getElementById('footerYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- blog teaser (home, 2 posts) ---------- */
    var teaser = document.getElementById('blogTeaser');
    /* ---------- blog "populares" (blog.html, 2 posts) + lista completa ---------- */
    var popular = document.getElementById('blogPopular');
    var fullList = document.getElementById('blogFullList');
    var categoriesList = document.getElementById('blogCategories');
    /* ---------- post unico ---------- */
    var single = document.getElementById('publicationContent');
    var similar = document.getElementById('blogSimilar');

    if(teaser || popular || fullList){
      loadPosts().then(function(posts){
        posts = posts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });

        if(teaser){
          teaser.innerHTML = posts.slice(0,2).map(function(p){
            return '<div class="col-lg-6">' + cardHTML(p,false) + '</div>';
          }).join('') || '<div class="col-lg-12"><p>' + T.empty + '</p></div>';
        }
        if(popular){
          popular.innerHTML = posts.slice(0,2).map(function(p){
            return '<div class="col-lg-6">' + cardHTML(p,false) + '</div>';
          }).join('') || '<div class="col-lg-12"><p>' + T.empty + '</p></div>';
        }
        if(fullList){
          fullList.innerHTML = posts.map(function(p){
            return '<div class="col-lg-12">' + cardHTML(p,true) + '</div>';
          }).join('') || '<div class="col-lg-12"><p>' + T.empty + '</p></div>';
        }
        if(categoriesList){
          var cats = Array.from(new Set(posts.map(function(p){ return p.category; }).filter(Boolean)));
          var allLabel = LANG === 'en' ? 'All categories' : (LANG === 'et' ? 'Kõik kategooriad' : 'Todas as categorias');
          categoriesList.innerHTML = cats.map(function(c){
            return '<li><a href="#" data-cat="' + c + '">' + c + '</a></li>';
          }).join('') + '<li><a href="#" data-cat="" class="mil-active">' + allLabel + '</a></li>';

          categoriesList.addEventListener('click', function(e){
            var a = e.target.closest('a[data-cat]');
            if(!a) return;
            e.preventDefault();
            categoriesList.querySelectorAll('a').forEach(function(el){ el.classList.remove('mil-active'); });
            a.classList.add('mil-active');
            var cat = a.getAttribute('data-cat');
            var filtered = cat ? posts.filter(function(p){ return p.category === cat; }) : posts;
            if(fullList){
              fullList.innerHTML = filtered.map(function(p){
                return '<div class="col-lg-12">' + cardHTML(p,true) + '</div>';
              }).join('') || '<div class="col-lg-12"><p>' + T.empty + '</p></div>';
            }
          });
        }
      });
    }

    if(single){
      fixPublicationLangLinks();
      var slug = new URLSearchParams(window.location.search).get('slug');
      loadPosts().then(function(posts){
        var post = posts.find(function(p){ return p.slug === slug; });

        if(!post){
          single.innerHTML = '<div class="col-lg-12"><p>' + T.notFound + ' <a href="blog.html">' + T.backToBlog + '</a></p></div>';
          document.querySelectorAll('.mil-publication-title').forEach(function(el){ el.textContent = T.notFound; });
          return;
        }

        document.title = post.title + ' — Brand Force';
        document.querySelectorAll('.mil-publication-title').forEach(function(el){ el.innerHTML = post.title; });
        document.querySelectorAll('.mil-publication-category').forEach(function(el){ el.textContent = post.category; });
        document.querySelectorAll('.mil-publication-date').forEach(function(el){ el.textContent = fmtDate(post.date); });
        document.querySelectorAll('.mil-publication-author').forEach(function(el){ el.textContent = post.author; });
        document.querySelectorAll('.mil-publication-cover').forEach(function(el){
          el.src = (post.cover && post.cover.trim()) ? post.cover : PLACEHOLDER_COVER;
        });

        single.innerHTML = post.content;

        if(similar){
          var others = posts.filter(function(p){ return p.slug !== slug; }).slice(0,2);
          similar.innerHTML = others.map(function(p){
            return '<div class="col-lg-6">' + cardHTML(p,false) + '</div>';
          }).join('');
        }
      });
    }

    /* ---------- newsletter: tenta backend real (Hostinger); senão, fallback por e-mail ---------- */
    document.querySelectorAll('.mil-subscribe-form').forEach(function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var input = form.querySelector('input[type=email], input[type=text]');
        var email = input ? input.value : '';
        if(!email) return;

        fetch(PREFIX + 'api/subscribe.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        }).then(function(r){
          if(!r.ok) throw new Error('sem backend');
          return r.json();
        }).then(function(){
          form.reset();
        }).catch(function(){
          window.location.href = 'mailto:brandforce.rio@gmail.com?subject=Newsletter&body=' + encodeURIComponent(email);
        });
      });
    });

    /* ---------- formulario de contato ---------- */
    var contactForm = document.getElementById('contactForm');
    if(contactForm){
      contactForm.addEventListener('submit', function(e){
        e.preventDefault();
        var name = document.getElementById('contactName').value;
        var email = document.getElementById('contactEmail').value;
        var message = document.getElementById('contactMessage').value;

        fetch(PREFIX + 'api/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, email: email, message: message })
        }).then(function(r){
          if(!r.ok) throw new Error('sem backend');
          return r.json();
        }).then(function(){
          contactForm.reset();
          var msg = document.getElementById('contactMsg');
          if(msg) msg.textContent = LANG === 'en' ? 'Message sent — thank you!' : (LANG === 'et' ? 'Sõnum saadetud — aitäh!' : 'Mensagem enviada — obrigado!');
        }).catch(function(){
          var subject = encodeURIComponent('Contato via site — ' + name);
          var body = encodeURIComponent(message + '\n\n' + email);
          window.location.href = 'mailto:brandforce.rio@gmail.com?subject=' + subject + '&body=' + body;
        });
      });
    }
  });
})();

/* ---------- corrige o scroll para âncoras (#estudio, #servicos, #clientes) ---------- */
(function(){
  function scrollToTarget(hash){
    var target;
    try { target = document.querySelector(hash); } catch(e){ return; }
    if(!target) return;
    var offset = 100;
    if(window.gsap && window.ScrollToPlugin){
      gsap.registerPlugin(ScrollToPlugin);
      gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: offset }, ease: "power2.out" });
    } else {
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  window.addEventListener('load', function(){
    if(location.hash) setTimeout(function(){ scrollToTarget(location.hash); }, 500);
  });

  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href*="#"]');
    if(!a) return;
    var href = a.getAttribute('href');
    var hashIndex = href.indexOf('#');
    if(hashIndex === -1) return;
    var pathPart = href.slice(0, hashIndex);
    var hashPart = href.slice(hashIndex);
    var currentFile = location.pathname.split('/').pop() || 'index.html';
    var isSamePage = (pathPart === '' || pathPart === currentFile);
    if(!isSamePage) return;

    var target;
    try { target = document.querySelector(hashPart); } catch(err){ return; }
    if(!target) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    scrollToTarget(hashPart);
    history.pushState(null, '', hashPart);
  }, true);
})();
