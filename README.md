# Brand Force — site (versão GitHub Pages, fiel ao template Ashley)

Site reconstruído em cima do template **Ashley** (comprado na Envato),
mantendo a estrutura, classes CSS e animações originais do template.
HTML/CSS/JS puro — sem build, sobe direto no GitHub Pages.

## Duas correções feitas no pacote baixado

1. **Font Awesome**: os arquivos de fonte (woff/ttf) não vieram no
   pacote baixado da Envato — sem eles os ícones não apareceriam. Troquei
   o link local pelo Font Awesome 5.15.4 via CDN (cdnjs), mesma versão/API.
2. **Fonte "Outfit"**: usada em todo o CSS do template, mas não havia
   nenhum link para carregá-la. Adicionei via Google Fonts.

## Escopo desta reconstrução

O template Ashley é um portfólio criativo completo (múltiplas variações
de home, portfólio, projetos individuais, equipe, serviços). Para o site
da Brand Force, usei as páginas que fazem sentido para uma agência:

- **`index.html`** — home completa (banner, estúdio, serviços, diferenciais, depoimentos, clientes, blog, rodapé)
- **`blog.html`** — lista de posts, com filtro por categoria
- **`publication.html`** — post individual (`?slug=...`)
- **`contact.html`** — mapa do Rio de Janeiro + formulário de contato
- **`404.html`**
- **`admin/`** — painel oculto de publicação

Não reconstruí as variações de portfólio/projetos/serviço avulso/equipe
separada do template — são específicas de portfólio pessoal e não
tinham conteúdo real da Brand Force para preencher.

## Fotos removidas do template

O pacote baixado usa fotos de banco de imagens (rostos de "equipe",
fotos de escritório) para preencher o layout de demonstração. Não
reproduzi essas fotos: (1) não há garantia de que a licença cobre uso
em produção, e (2) usá-las faria parecer que são pessoas reais da
Brand Force, o que não é verdade. Troquei por gráficos com as cores e
o mark da marca. A seção "Meet Our Team" virou "Por que Brand Force",
com 4 pilares no lugar de 4 rostos.

## Tags de rastreamento

Google Analytics (gtag.js, ID `G-M8BWQTLLHQ`) e Facebook Pixel (ID
`327542032723929`) já estão no `<head>` de todas as páginas, exatamente
como enviado.

## Como publicar no GitHub Pages

1. Crie um repositório (público, para Pages gratuito).
2. Suba todos os arquivos desta pasta para a raiz.
3. **Settings → Pages** → branch `main`, pasta `/ (root)`.
4. Site no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Site em 3 idiomas (PT · EN · ET)

Implementado como páginas estáticas separadas por idioma (mesma
abordagem da entrega anterior, agora reconstruída em cima do template
Ashley):

- `/` (raiz) = português — idioma padrão.
- `/en/` = inglês, `/et/` = estoniano — mesmas 5 páginas
  (`index.html`, `blog.html`, `publication.html`, `contact.html`,
  `404.html`), mesma URL de post (`?slug=...`), conteúdo traduzido.
- Detecção automática do idioma do navegador na primeira visita, com
  redirecionamento antes da tela desenhar (sem "pulo" visual).
- Escolha manual (seletor de idioma no menu) fica salva e tem
  prioridade sobre a detecção automática depois.
- Tags `hreflang` configuradas em cada página.
- O blog lê `data/posts.pt.json`, `.en.json` ou `.et.json` conforme o
  idioma da página.

**Tradução:** inglês e estoniano de todo o site (menu, todas as 5
páginas, os 3 posts do blog) foram traduzidos por mim. Para o inglês
tenho boa confiança; para o **estoniano, recomendo revisão de um
falante nativo** antes de publicar.

Testei as 15 páginas (5 × 3 idiomas) com servidor local antes de
entregar — todas carregam corretamente.

## Painel oculto do blog (`/admin/`)

Não aparece em nenhum menu do site (bloqueado também no `robots.txt`).
Tem um seletor de idioma (Português / English / Eesti) — cada um lê e
grava em `data/posts.{idioma}.json` separadamente.

- A senha da primeira tela é só uma barreira local de conveniência.
- **A segurança de verdade é o token do GitHub** (permissão de escrita
  no repositório) — sem ele, ninguém publica nada.
- Gere um token em `github.com → Settings → Developer settings →
  Fine-grained tokens`, com acesso restrito a este repositório e
  permissão de leitura/escrita em "Contents".

## O que ainda precisa da sua revisão

- **Logos de clientes** (`img/clients/`): veja o `LEIA-ME.txt`.
- **Depoimentos**: marcados como "Exemplo" — trocar por reais aprovados.
- **E-mail de contato**: `contato@brandforce.rio.br` é suposição minha.
- **Newsletter e formulário de contato**: nesta versão (GitHub, sem
  backend), se o envio falhar eles abrem um rascunho de e-mail no
  cliente de e-mail da pessoa. Na versão Hostinger eles funcionam de
  verdade (gravam em arquivo no servidor).

## Redes sociais

Instagram, Facebook e LinkedIn — no menu, rodapé e seção de contato,
nos 3 idiomas.
