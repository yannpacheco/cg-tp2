# Ilha do Contrabando — direção inicial

Uma pequena ilha tropical esconde um antigo fortim usado por piratas para guardar seus saques.
Um barco encalhado marca a chegada à praia; o centro livre receberá o personagem e o tesouro.

Estilo: low-poly, cores chapadas e luz de dia. Referências: as prévias Kenney em assets/preview,
fortins costeiros e praias tropicais. Sem texturas nesta primeira versão.

Paleta: areia #E0C280, pedra #7A808C, madeira #7A401F, céu #A6CCE6.
Vegetação futura: verde #497344; detalhes futuros: vermelho e dourado.

## Planta inicial (vista de cima, raio 4)

```text
                    -Z (fundo)
               .----------------.
             / Fortim   Hélice    \
            | (-1.3,-.8) (1.2,-1.5)|
       -X   |                      |   +X
            | Palmeiras* Pirata*   |
            | (-2,1)     (0,.8)    |
             \         Barco      /
               '---(1.5,1.6)----'
                    +Z (frente)
```

* Reservas para próximas etapas. Coordenadas no chão: (X, Z), Y = 0.
Três tipos planejados: fortim, barco e palmeiras. As duas peças de torre contam como um tipo.
Manter o centro livre e conferir o conjunto pelas duas câmeras.

Importados: barco e duas peças de torre OBJ. Primitivas TWGL: chão, hemisfério,
palmeiras/rochas futuras e personagem simples a definir. A haste/hélice continua
como teste temporário; seu substituto temático será escolhido depois.

Os modelos já estão colocados como primeiro teste, ainda sujeitos a ajustes visuais.
Procedência e limitações: assets/README.md.
