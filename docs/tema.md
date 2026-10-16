# Ilha do Contrabando

Pequeno esconderijo pirata com fortim e praia de desembarque.
Estilo low-poly com paleta original do Kenney Pirate Kit, areia clara e céu azul.
Referências visuais: assets/preview/. Licença CC0 em assets/License-Kenney.txt.

Planta atual (X,Z), chão Y = 0 e raio 4:

| Elemento | Local |
| --- | --- |
| Fortim baixo com ameias | (-1.4, -1.4) |
| Canhão em pedestal fixo | (1.85, -1.65) |
| Cais e barco | (2.1, 0.35) e (2.1, 1.9) |
| Palmeiras | (-2.5, 0.5) e (0.6, -2.65) |
| Baú | (-0.9, 0.2) |
| Barril e caixa | (-2.3, -0.65) e (-0.1, -1.25) |
| Rochas | (-1.6, 2.1) |
| Personagens futuros | Centro e faixa frontal livres |

O canhão substitui a hélice: grupo com pedestal fixo e parte superior que gira
no eixo Y (0.35 rad/s). OBJ fornecem a aparência; TWGL fornece pedestal e base.
As duas peças do fortim são um tipo de objeto, não dois tipos distintos.

Conferir visualmente o conjunto nas duas câmeras antes de fechar a etapa.

Etapa 2: rochas importadas substituídas por três esferas TWGL de poucas faces,
com escalas diferentes e dois tons de cinza. Origem da esfera no centro;
altura Y igual ao raio vertical mantém cada pedra apoiada no chão.
Centro preservado para personagens. Iluminação e câmeras compartilhadas com os demais objetos.
