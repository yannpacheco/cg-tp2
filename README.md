# TP2 - Ilha do Contrabando

Porto pirata low-poly com navio, casa, tesouro e capitão.
HTML/CSS/JS + TWGL.js (internet).

Execute `python -m http.server 8000` e abra http://localhost:8000.
1 = câmera automática + scroll; 2 = arrastar; L = luz; V = vento; P = posição do capitão.

Ilha: raio 5.5, chão Y = 0; mar: raio 8.5. Cena: src/scene.js.
Hierarquia: pedestal fixo e canhão giratório. Personagem estático, três posições.
Assets: Kenney e Quaternius. [Créditos](assets/README.md).

Fundo panorâmico de céu ao entardecer, acompanhando as câmeras.
O navio navega automaticamente ao redor da ilha (uma volta em cerca de 52 s).
