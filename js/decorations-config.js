/*
  ===== ADORNOS NOS BOTÕES =====
  Esse arquivo é o único que você precisa editar pra adicionar
  enfeites (PNG) em cima de qualquer botão do site — tipo um chapéu
  de Papai Noel, uma abóbora, um laço, o que quiser.

  COMO ADICIONAR UM ADORNO NOVO:
  1. Coloque o arquivo PNG (fundo transparente) dentro de
     img/decorations/ — pode dar qualquer nome, ex: meu-adorno.png
  2. Copie um dos blocos { ... } abaixo, cole na lista, e ajuste:
       - image:  caminho do arquivo que você colocou
       - target: qual botão vai receber o adorno (veja a lista de
                 alvos prontos logo abaixo)
       - position: em qual canto do botão o adorno aparece —
                 "top-right", "top-left", "bottom-right" ou
                 "bottom-left"
       - size:   tamanho do adorno em pixels (o valor é a largura;
                 a altura ajusta sozinha mantendo a proporção)
       - start / end: (opcional) período do ano em que o adorno
                 fica ativo, no formato "MM-DD" (mês-dia). Se você
                 apagar essas duas linhas, o adorno fica sempre
                 ativo, o ano inteiro.

  ALVOS PRONTOS (o que colocar em "target"):
    '#linkCardComissoes'  → botão "Comissões e preços" (home)
    '#linkCardTos'        → botão "Termos de Uso (TOS)" (home)
    '#statusBadge'        → o badge de comissões abertas/fechadas
    '.music-toggle'       → o botãozinho de nota musical
    '.theme-toggle'       → o botão de sol/lua (tema)

  Pra decorar outro botão que não está nessa lista, basta usar
  qualquer seletor CSS válido (ex: '.gallery-item' decora TODAS as
  imagens da galeria de uma vez).
*/

window.SITE_DECORATIONS = [

  // Exemplo já pronto e funcionando — pode apagar quando quiser.
  {
    id: 'exemplo-estrela',
    image: 'img/decorations/exemplo-estrela.png',
    target: '#linkCardComissoes',
    position: 'top-right',
    size: 40,
    // sem start/end = fica sempre ativo
  },

  // Exemplo de adorno SAZONAL (só aparece num período do ano) —
  // troque a imagem e descomente pra usar.
  // {
  //   id: 'halloween-abobora',
  //   image: 'img/decorations/abobora.png',
  //   target: '#linkCardTos',
  //   position: 'top-left',
  //   size: 44,
  //   start: '10-20',
  //   end: '11-02',
  // },

];
