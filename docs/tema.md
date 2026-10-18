# Ilha do Contrabando — porto pirata

Casa de madeira ao fundo, tesouro e capitão no centro, navio de velas listradas
junto ao cais à direita. Palmeiras nas laterais, rochas TWGL e canhão giratório.
Referências visuais: assets/preview/quaternius/Preview.png e Preview2.png.

Ilha ampliada de raio 4 para 5.5; disco de mar simples de raio 8.5 em Y = -0.2.
Hemisfério preservado sob a ilha, achatado na vertical. O mar é opaco e sem ondas.
Câmeras afastadas para 24 unidades, zoom entre 16 e 40; alvo em (1, 0.7, 0).
O limite da poeira acompanha o raio da ilha.

| Elemento | Posição (X, Z) |
| --- | --- |
| Casa pirata | (-1.2, -2.2) |
| Navio | (6.5, -0.6), no mar |
| Cais | (4.65, 0), ligando a praia ao navio |
| Palmeiras | (-3.7, 0.2) e (0.8, -3.8) |
| Baú e ouro | (-1.1, 0.9), região central esquerda |
| Barris | (-2.8, -0.9) e (-2.3, -0.75) |
| Âncora | (3.7, 1.3) |
| Canhão hierárquico | (2.3, -2.3) |
| Rochas TWGL | região (-2.9, 2.5) |

Capitão Barbarossa estático, escala 0.9. Tecla P e botão alternam:
1. Tesouro: (0.3, 1.1), orientação 0.
2. Cais: (3.1, 0.2), orientação PI/2.
3. Clareira diante da casa: (1.3, -0.3), orientação -PI/3.

A altura 0.006 compensa o pequeno deslocamento dos pés no OBJ.
Objetos Quaternius usam Atlas_Pirate.png; Kenney mantém sua paleta.
Rochas, vento, areia clareada e hierarquia foram preservados.

Base ampliada: hemisfério azul com raio igual ao mar (8.5), topo em Y = -0.2.
Borda cilíndrica da ilha fecha os 0.2 de altura entre água e areia.
Enquadramento do globo: distância inicial 26, alvo (1, -0.5, 0), escala vertical do hemisfério 0.85. Borda da areia sem tampas sobrepostas.

Navio em órbita circular no mar: raio 6.8, velocidade 0.12 rad/s, altura 0.2.
Proa acompanha a tangente. Percurso conferido com todos os vértices do OBJ
para manter o casco fora da ilha e dentro do disco de mar.

Relevo: três dunas suaves de 0.14 a 0.24 unidades nas áreas livres da areia.
Geometria e normais em src/terrain.js; textura contínua com o chão.
Posições do capitão e borda da ilha preservadas planas; poeira acompanha o relevo.

Revisão do terreno: as três dunas isoladas foram substituídas por ondulações
contínuas em toda a areia, com transição suave na praia e sob a casa.
Objetos, poses do capitão e poeira acompanham a altura calculada do terreno.

Gaivotas: G ou botão chama uma formação de três aves com asas abertas.
Passagem de 10 s acima da ilha, com pequena oscilação de altura e som de gaivota.
Ignora novos acionamentos durante o voo; encerra o áudio ao terminar ou sair da aba.
Modelo e áudio locais, com fontes em assets/CREDITS-Seagulls.md.

Mar animado em src/water.js: duas ondas senoidais de baixa amplitude,
normais calculadas pela inclinação, padrão procedural em movimento,
cores turquesa/azul por distância da praia, espuma suave e reflexo especular.
O hemisfério continua rígido, com material próprio; ondas zeram na borda externa.
Navio acompanha a altura das ondas, com leve inclinação. Não usa textura externa nem transparência.

Controles de intensidade: ondas 0–15x, vento 0–4x e poeira 0–3x.
Poeira usa um conjunto fixo de até 84 partículas; padrão 28.
Ondas chegam a amplitude teórica de 1.2 unidades e zeram na praia/borda externa.
Navio acompanha a altura e tem balanço limitado; valores iniciais preservam a brisa leve.

Painel de bordo com papel claro, tinta azul e detalhes de latão, organizado em
câmeras, som, ambiente e ações. Câmeras também têm botões. No celular o painel
fica embaixo e começa recolhido; todos os controles continuam disponíveis por rolagem.
Som ambiente local de 2min47s em loop; S/botão silencia mar e gaivotas juntos.
Áudio pausa na aba oculta e retoma apenas se estava ligado. Fonte em assets/CREDITS-Beach.md.
