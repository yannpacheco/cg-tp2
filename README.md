# TP2 - Diorama

HTML, CSS, JavaScript e TWGL.js (requer internet).

Execute `python -m http.server 8000` e abra http://localhost:8000.

Base circular, hemisfério e três primitivas de teste, com luz direcional. Tecla L: ligar/desligar iluminação.
Centro: (0, 0, 0). Chão: Y = 0. Y aponta para cima. Escala: 1 unidade.

Edite posição, rotação (radianos), escala e material em `src/scene.js`.
Remova as três linhas de teste para deixar apenas a base.

Câmeras: 1 = giro automático + scroll; 2 = orbital ao arrastar o mouse.
Teste de hierarquia: haste fixa e hélice giratória. Use addObject(config) em src/scene.js para adicionar objetos; children define partes filhas.
