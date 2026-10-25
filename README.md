# TP2 — Ilha do Contrabando

Trabalho Prático 2 da disciplina de Computação Gráfica.

**Tecnologias:** HTML, CSS, JavaScript, WebGL, GLSL e TWGL.js.

**Repositório:** https://github.com/yannpacheco/cg-tp2

**Cena publicada:** [Adicionar URL do GitHub Pages]

## 1. A Cena

**Ilha do Contrabando** é um diorama tridimensional inspirado em um porto pirata, desenvolvido em estilo low-poly utilizando WebGL e TWGL.js.

A cena representa uma pequena ilha cercada pelo oceano, com uma casa de madeira, um cais, um navio pirata, palmeiras, tesouros, barris, caixas, rochas e outros elementos de ambientação.

O personagem principal é um capitão pirata, que pode ser visualizado em três posições e orientações diferentes. O cenário também contém um canhão montado sobre uma estrutura fixa, cuja parte superior gira continuamente por meio de transformações hierárquicas.

O ambiente possui animações e efeitos visuais, como ondas no mar, movimentação de um navio, vento nas palmeiras, partículas de poeira, gaivotas em movimento, sons ambientais, sombras dinâmicas e alternância entre dia e noite.

### 1.1. Estrutura do diorama

O cenário foi construído sobre uma plataforma circular de areia, com raio de 5,5 unidades, cercada por uma superfície aquática de raio 8,5 unidades.

Abaixo do conjunto existe um hemisfério que forma a base do diorama.

A superfície da ilha possui relevo procedural, enquanto o mar utiliza shaders específicos para representar ondas e efeitos visuais associados à água.

### 1.2. Personagem

O personagem utilizado é o capitão Barbarossa, do Pirate Kit da Quaternius.

A tecla `P` permite alternar ciclicamente entre três estados, modificando a posição e a orientação do capitão.

O modelo é estático, ou seja, não utiliza animação esquelética. As alterações são realizadas pelas transformações geométricas aplicadas ao objeto.

### 1.3. Modelagem hierárquica

O diorama possui um canhão giratório composto por:

- Uma estrutura fixa, representada por um pedestal.
- Uma parte móvel, constituída pelo canhão e seu grupo de transformação.

A animação utiliza uma hierarquia de objetos, permitindo que o canhão gire em torno do eixo vertical sem deslocar o pedestal.

A implementação utiliza transformações locais e multiplicação de matrizes para preservar as relações entre objetos pais e filhos.

### 1.4. Câmeras

Foram implementados três modos de visualização, todos utilizando projeção perspectiva.

**Câmera 1 — Automática:** posicionada acima do cenário, gira continuamente ao redor do centro do diorama. O scroll do mouse permite ajustar a distância da câmera.

**Câmera 2 — Orbital:** permite que o usuário altere os ângulos de visualização com o movimento do mouse, mantendo o centro da cena como referência.

**Câmera 3 — Livre:** permite navegar pela cena com `W`, `A`, `S` e `D`. Arraste o mouse sobre a cena para olhar em qualquer direção.

### 1.5. Iluminação

A renderização utiliza iluminação direcional com componentes ambiente e difusa, calculadas a partir das normais das superfícies e da direção da luz.

A tecla `L` permite ligar ou desligar a iluminação.

O projeto também implementa sombras dinâmicas por meio de *shadow mapping*, utilizando uma etapa adicional de renderização a partir da perspectiva da fonte luminosa.

### 1.6. Interações e controles

| Tecla              | Funcionalidade                                  |
| ------------------ | ----------------------------------------------- |
| `1`                | Ativar câmera automática                        |
| `2`                | Ativar câmera orbital                           |
| `3`                | Ativar câmera de navegação livre                |
| `W`, `A`, `S`, `D` | Mover a câmera livre                            |
| `P`                | Alternar posições e orientações do capitão      |
| `L`                | Ligar/desligar iluminação                       |
| `V`                | Ligar/desligar vento e poeira                   |
| `G`                | Iniciar passagem das gaivotas                   |
| `S`                | Ligar/desligar áudio (exceto no modo livre)     |
| `N`                | Alternar entre dia e noite                      |
| Scroll             | Ajustar distância da câmera automática          |
| Arrastar mouse     | Rotacionar câmera orbital ou olhar ao redor no modo livre |

O menu também disponibiliza controles para modificar a intensidade das ondas, do vento e das partículas de poeira.
