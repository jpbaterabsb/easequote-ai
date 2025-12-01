# EASEQUOTE - GUIA COMPLETO DE MATERIAIS E SERVIÇOS

---

## 🎯 ARQUITETURA DO SISTEMA EASEQUOTE

### **Visão Geral**
O EaseQuote utiliza dois motores independentes para gerar orçamentos precisos:
1. **Labor Engine** → Calcula mão de obra usando a Price Library
2. **Material Engine** → Calcula quantidades de materiais usando fórmulas matemáticas fixas

### **Fluxo de Trabalho**

#### **1. USER INPUTS** (O que o instalador informa)
Na tela de criação de orçamento, o instalador fornece:
- **Area (sqft)** → Exemplo: 250 sqft
- **Tile size** → Exemplo: 12x24, 24x24, 6x36, mosaic, etc.
- **Complexity add-ons** → Exemplo: many cuts, diagonal, many corners
- **(Opcional)** Detalhes como: cômodos, obstáculos, recortes especiais

---

#### **2. CÁLCULO DE MATERIAIS** (100% Matemático)
O Material Engine calcula automaticamente usando **fórmulas fixas**:

**Princípio básico:**
```
Quantidade = Área ÷ Cobertura do Material
```

**Regras internas do sistema:**
```
• Thinset bags = area ÷ thinset_coverage (80 sqft/saco)
• Grout bags = area ÷ grout_coverage (200 sqft/saco)
• Tiles needed = area ÷ sqft_per_tile
• Spacers = tiles_needed × spacers_per_tile
• Leveling clips = tiles_needed × clips_per_tile
• Silicone tubes = perimeter ÷ 25 (25 ft/tubo)
```

**⚠️ IMPORTANTE:** 
- **Nenhuma IA gera números** nos cálculos de materiais
- Todas as fórmulas são fixas no código
- Os valores vêm da Tabela Técnica (Tile Size & Coverage), separada da Price Library

---

#### **3. CÁLCULO DE SERVIÇOS** (Price Library)
O Labor Engine busca preços na Price Library e calcula:

**Fórmula:**
```
Total Service = Unit Price × Quantidade (sqft ou units)
```

**Exemplos de serviços:**
- Base installation (Tile) — $4.50/sqft
- Demo remove (Tile) — $1.50/sqft
- Subfloor leveling — $1.00/sqft
- Door trimming — $30/unit
- Complexidade — percentuais ou valores extras

**⚠️ IMPORTANTE:** Apenas matemática simples, sem IA

---

#### **4. EXIBIÇÃO NA INTERFACE**

**ABA: SERVICES (Labor)**
```
• Tile Installation — 250 sqft × $4.50/sqft = $1,125
• Demo Tile — 250 sqft × $1.50/sqft = $375
• Subfloor Leveling — 100 sqft × $1.00/sqft = $100
```

**ABA: MATERIALS (Auto-calculated)**
```
• Thinset — 6 bags (calculado: 250 ÷ 80 = 3.1 → 4 bags)
• Grout — 1 bag (calculado: 250 ÷ 200 = 1.25 → 2 bags)
• Spacers — 900 units (depende do tile size)
• Leveling Clips — 300 units (depende do tile size)
• Silicone — 3 tubes (perímetro ÷ 25)
```

**ABA: COMPLEXITY (Add-ons)**
```
• Many cuts — +10% sobre mão de obra
• Diagonal layout — +$0.50/sqft
• Many corners — +15% sobre mão de obra em área afetada
```

---

#### **5. RESUMO FINAL (Summary)**

**Estrutura do orçamento:**
```
Services Total:      $1,600
Materials Total:     $500
Complexity Total:    $200
─────────────────────────────
TOTAL GERAL:        $2,300
```

Este total é enviado ao cliente no formato de PDF ou apresentação digital.

---

#### **6. PAPEL DA IA NO SISTEMA**

**A IA NÃO participa dos cálculos matemáticos.**

**A IA é usada APENAS para:**
- ✅ Montar o PDF final com layout profissional
- ✅ Gerar textos explicativos para o cliente
- ✅ Organizar tabelas de services + materials + totals
- ✅ Deixar a linguagem amigável e clara

**Fluxo correto:**
```
Backend calcula tudo → IA formata e apresenta
```

**Benefícios dessa arquitetura:**
- ✅ Consistência nos cálculos
- ✅ Transparência nas fórmulas
- ✅ Menor custo de IA (não processa cálculos)
- ✅ Mais controle para desenvolvedores e instaladores

---

## 📐 ESPECIFICAÇÕES DE TILES E MATERIAIS

### Categorias que Requerem Cálculo por Tamanho de Tile:
1. Tile Floor
2. Tile Wall
3. Shower Walls
4. Shower Floor
5. Backsplash (tile)
6. Tub Surround

---

## 🔲 TABELA DE TILES - ESPECIFICAÇÕES POR TAMANHO

### **Tile – Subway / Small Formats**
| Tamanho | sqft/peça | Clips/sqf | Spacers/sqf |
|---------|-----------|-----------|-------------|
| 3x6     | 0.125     | 10        | 10          |
| 3x12    | 0.25      | 6         | 6           |
| 4x12    | 0.33      | 5         | 5           |

### **Tile – Rectangular (Common Wood-Look)**
| Tamanho | sqft/peça | Clips/sqf | Spacers/sqf |
|---------|-----------|-----------|-------------|
| 6x24    | 1.00      | 3         | 3           |
| 6x36    | 1.50      | 3         | 3           |
| 6x48    | 2.00      | 2.4       | 2.4         |
| 8x36    | 2.00      | 2.2       | 2.2         |
| 8x48    | 2.66      | 3.4       | 3.4         |
| 12x24   | 2.00      | 2.5       | 2.5         |
| 12x36   | 3.00      | 2         | 2           |
| 12x48   | 4.00      | 1.8       | 1.8         |

### **Tile – Square Formats**
| Tamanho | sqft/peça | Clips/sqf | Spacers/sqf |
|---------|-----------|-----------|-------------|
| 12x12   | 1.00      | 4         | 4           |
| 16x16   | 1.77      | 2.8       | 2.8         |
| 18x18   | 2.25      | 2         | 2           |
| 24x24   | 4.00      | 1.8       | 1.8         |
| 30x30   | 6.25      | 1.4       | 1.4         |

### **Special Shapes**
| Formato           | sqft/peça | Clips/sqf | Spacers/sqf |
|-------------------|-----------|-----------|-------------|
| Hexagon 8"        | 0.35      | 7         | 7           |
| Hexagon 12"       | 0.75      | 5         | 5           |
| Penny Tile (sheet)| 1.00      | 0         | 0           |
| Mosaic Sheet 12x12| 1.00      | 0-1       | 0-1         |
| Arabesco          | 0.30      | 6-8       | 6-8         |
| Fish Scale        | 0.25      | 8-10      | 8-10        |

---

## 🧮 FÓRMULAS DE COBERTURA - PADRÃO INDÚSTRIA

| Material | Cobertura | Fórmula de Cálculo |
|----------|-----------|-------------------|
| **Thinset (50lb bag)** | 70–90 sqft | sqft ÷ 80 |
| **Grout (bag/pouch)** | 150–250 sqft | sqft ÷ 200 |
| **Waterproof (liquid/roll)** | 50–60 sqft | sqft ÷ 55 |
| **Backer Board 3x5** | 15 sqft/sheet | sqft ÷ 15 |
| **Silicone** | 25 linear ft | linear ft ÷ 25 |
| **Mortar (shower pan)** | 25–35 sqft | sqft ÷ 30 |

---

## 🏠 1) FLOORING

### **VINYL PLANK**

**SERVIÇOS**
- Installation — $2.25/sqf
- Demo remove — $0.50/sqf
- Subfloor leveling — $0.50–1.50/sqf
- Door trimming — $20–40/unit

**MATERIAIS**
- Underlayment — $0.40–0.60/sqf
- Quarter round — $1–2/ft
- Transition strips — $18–30/unit
- Baseboards — $2–3/ft
- Adhesive (if glue assist) — $20–35/unit

**COMPLEXIDADE**
- Many cuts — +10%
- Diagonal — +$0.50/sqf
- Corners — +15%

**ADD-ONS**
- Existing floor removal — $0.50/sqf

---

### **VINYL GLUE-DOWN**

**SERVIÇOS**
- Installation — $2.25/sqf
- Demo remove — $0.50/sqf

**MATERIAIS**
- Adhesive — $20–35/unit
- Quarter round — $1–2/ft
- Transition strips — $18–30/unit

**COMPLEXIDADE**
- Many cuts — +10%
- Diagonal — +$0.50/sqf
- Corners — +15%

**ADD-ONS**
- Door trimming — $20–40/unit

---

### **LAMINATE**

**SERVIÇOS**
- Installation — $2.00/sqf
- Demo remove — $0.50/sqf
- Stairs — $40–80/step

**MATERIAIS**
- Underlayment — $0.30–0.50/sqf
- Transition strips — $18–30/unit
- Quarter round — $1–2/ft

**COMPLEXIDADE**
- Many cuts — +10%

**ADD-ONS**
- Baseboard remove/install

---

### **HARDWOOD**

**SERVIÇOS**
- Installation — $6.00/sqf
- Demo remove — $1.50/sqf
- Stairs — $60–120/step
- Refinish — $3–5/sqf

**MATERIAIS**
- Nails/adhesive — $20–40/unit
- Wood filler — $15–25/unit
- Stain/finish — as required

**COMPLEXIDADE**
- Herringbone / chevron — +$3–6/sqf
- Many cuts — +15%

**ADD-ONS**
- Subfloor repair — as required

---

### **TILE FLOORING** ⭐

**SERVIÇOS**
- Tile installation — $4.50/sqf
- Demo remove — $1–2/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — $15–25/unit
   - Fórmula: sqft ÷ 80
   - Ex: 100 sqft = 100 ÷ 80 = 1.25 → **2 sacos**

2. **Grout** — $15–25/unit
   - Fórmula: sqft ÷ 200
   - Ex: 100 sqft = 100 ÷ 200 = 0.5 → **1 saco**

3. **Leveling Clips** — $20–40/unit
   - Quantidade depende do tamanho do tile (ver tabela acima)
   - Ex: Tile 12x24 = 2.5 clips/sqf
   - Para 100 sqft = 100 × 2.5 = **250 clips**

4. **Spacers** — $5–15/unit
   - Quantidade depende do tamanho do tile (ver tabela acima)
   - Ex: Tile 12x24 = 2.5 spacers/sqf
   - Para 100 sqft = 100 × 2.5 = **250 spacers**

5. **Silicone** — $5–10/unit
   - Fórmula: linear ft ÷ 25
   - Ex: 50 linear ft = 50 ÷ 25 = **2 tubos**

**COMPLEXIDADE**
- Diagonal — +$0.80–1.50/sqf
- Large format (24x24+) — +$1.50–3/sqf
- Decorative band — $8–20/ft

**ADD-ONS**
- Waterproof — $2–4/sqf
  - Material: sqft ÷ 55
  - Ex: 100 sqft = 100 ÷ 55 = 1.8 → **2 galões**
- Niche — $120–250/unit

**📊 EXEMPLO DE CÁLCULO COMPLETO:**
```
Projeto: 100 sqft com tile 12x24

MATERIAIS:
• Thinset: 100 ÷ 80 = 1.25 → 2 sacos × $20 = $40
• Grout: 100 ÷ 200 = 0.5 → 1 saco × $20 = $20
• Clips: 100 × 2.5 = 250 clips → 1 unit × $30 = $30
• Spacers: 100 × 2.5 = 250 → 1 unit × $10 = $10
• Silicone: Perímetro estimado 40 ft ÷ 25 = 2 tubos × $7 = $14

SERVIÇO:
• Installation: 100 × $4.50 = $450

TOTAL: $564 (sem add-ons ou complexidade)
```

---

### **FLOORING DEMOLITION**
Light / Medium / Heavy

### **SUBFLOOR PREPARATION**
Leveling / repairs / patching

### **BASEBOARDS / TRIM**
Install / remove / replace

---

## 🚿 2) BATHROOM

### **SHOWER (FULL)** ⭐

**SERVIÇOS**
- Full shower installation — $35–65/sqf
- Demo existing shower — $300–650
- Pan rebuild — $150–350

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Waterproof Membrane** — Incluído no preço
   - Fórmula: sqft ÷ 55
   
4. **Cement Board** — Incluído no preço
   - Fórmula: sqft ÷ 15
   
5. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

6. **Leveling System** — Quantidade depende do tile
   - Ver tabela de tiles para clips/spacers por sqft
   
7. **Drain Kit** — Incluído no preço

**COMPLEXIDADE**
- Many corners — +15%
- Large format tile (24x24+) — +$1.50/sqf
- Mosaic floor — +$3–5/sqf

**ADD-ONS**
- Niche — $120–250
- Bench — $150–250
- Linear drain — $180–350
- Premium waterproof — $380–450

**📊 EXEMPLO DE CÁLCULO:**
```
Projeto: Shower completo 60 sqft (paredes) com tile 12x24

MATERIAIS INCLUÍDOS NO PREÇO DO SERVIÇO:
• Thinset: 60 ÷ 80 = 0.75 → 1 saco
• Grout: 60 ÷ 200 = 0.3 → 1 saco
• Cement board: 60 ÷ 15 = 4 folhas
• Waterproof: 60 ÷ 55 = 1.1 → 2 galões
• Clips: 60 × 2.5 = 150 clips
• Spacers: 60 × 2.5 = 150 spacers

SERVIÇO:
• Installation: 60 × $50 = $3,000 (já inclui materiais base)

ADD-ONS:
• Niche: $150
• Bench: $200

TOTAL: $3,350
```

---

### **SHOWER WALLS** ⭐

**SERVIÇOS**
- Tile install — $8–12/sqf
- Demo — $1–2/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Cement Board** — Incluído no preço
   - Fórmula: sqft ÷ 15
   
4. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

5. **Clips/Spacers** — Quantidade depende do tile escolhido (ver tabela)

**COMPLEXIDADE**
- Large format (24x24+) — +$1.50/sqf

**ADD-ONS**
- Waterproof — $180–350
  - Material: sqft ÷ 55
- Niche — $75–150

---

### **SHOWER FLOOR** ⭐

**SERVIÇOS**
- Mosaic tile — $12–18/sqf
- Demo pan — $120–250

**MATERIAIS**

1. **Mosaic Tile** — Cliente fornece ou incluído
   - Geralmente 1 sqft/sheet
   - Não requer clips/spacers (0-1 por sqft)
   
2. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
3. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

4. **Mortar (para pan)** — Incluído no rebuild
   - Fórmula: sqft ÷ 30
   
5. **Drain Kit** — Incluído no preço

**ADD-ONS**
- Waterproof — $120–220
  - Material: sqft ÷ 55

**📊 EXEMPLO:**
```
Shower floor: 12 sqft com mosaic

MATERIAIS (incluídos no serviço):
• Mosaic: 12 sheets
• Thinset: 12 ÷ 80 = 0.15 → 1 saco
• Grout: 12 ÷ 200 = 0.06 → 1 saco
• Mortar: 12 ÷ 30 = 0.4 → 1 saco

SERVIÇO:
• Installation: 12 × $15 = $180

ADD-ON:
• Waterproof: 12 ÷ 55 = 0.22 → 1 galão = $150

TOTAL: $330
```

---

### **BATHROOM FLOOR** ⭐

**SERVIÇOS**
- Tile install — $4.5–6/sqf
- Demo tile — $1–2/sqf
- Demo vinyl — $0.50/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

4. **Leveling Clips** — Quantidade depende do tile (ver tabela)

5. **Spacers** — Quantidade depende do tile (ver tabela)

**ADD-ONS**
- Toilet R&I — $40–60
- Transitions — $18–30

---

### **TUB SURROUND** ⭐

**SERVIÇOS**
- Tile install — $7–10/sqf
- Demo — $80–150

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

4. **Cement Board** — Incluído no preço
   - Fórmula: sqft ÷ 15

5. **Clips/Spacers** — Quantidade depende do tile (ver tabela)

**ADD-ONS**
- Niche — $75–150
- Waterproof — $180–350
  - Material: sqft ÷ 55

---

### **VANITY**

**SERVIÇOS**
- Install — $120–250
- Remove — $40–80

**MATERIAIS**
- Silicone
- Basic plumbing fittings

---

### **TOILET**

**SERVIÇOS**
- Install — $40–60
- Replace — $80–120
- Remove — $40

**MATERIAIS**
- Wax ring — $3–6
- Silicone — $8

---

### **BATHROOM DEMOLITION**
Light / Medium / Heavy

---

## 🍳 3) KITCHEN

### **BACKSPLASH** ⭐

**SERVIÇOS**
- Install — $12–20/sqf
- Demo — $2–4/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile escolhido)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

4. **Edge Trims** — Conforme necessário

5. **Clips/Spacers** — Quantidade depende do tile escolhido (ver tabela)
   - Subway tiles (3x6, 3x12): mais clips/spacers
   - Mosaics: geralmente não precisam

**COMPLEXIDADE**
- Mosaic (pequenos formatos) — +$2–4/sqf
  - Menos clips/spacers mas mais tempo de instalação
- Many outlets — +$1/sqf

**📊 EXEMPLO:**
```
Backsplash: 40 sqft com tile 3x12

MATERIAIS (incluídos):
• Thinset: 40 ÷ 80 = 0.5 → 1 saco
• Grout: 40 ÷ 200 = 0.2 → 1 saco
• Clips: 40 × 6 = 240 clips
• Spacers: 40 × 6 = 240 spacers
• Silicone: 15 linear ft ÷ 25 = 1 tubo

SERVIÇO:
• Installation: 40 × $16 = $640

TOTAL: $640 (materiais incluídos)
```

---

### **KITCHEN FLOOR** ⭐

**SERVIÇOS**
- Tile installation — $4.5–6/sqf
- Vinyl installation — $2.25/sqf
- Demo tile — $1–2/sqf
- Demo vinyl — $0.50/sqf

**MATERIAIS (TILE)**

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Clips/Spacers** — Quantidade depende do tile (ver tabela)

4. **Transitions** — $18–30/unit

**MATERIAIS (VINYL)**
- Underlayment
- Transitions

**ADD-ONS**
- Move appliances — $20–40

---

### **COUNTERTOP TILE** ⭐

**SERVIÇOS**
- Tile install — $12–20/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200

3. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

4. **Clips/Spacers** — Quantidade depende do tile (ver tabela)

---

### **KITCHEN DEMOLITION**
Light / Medium / Heavy

---

## 🌳 4) OUTDOOR

### **PATIO TILE** ⭐

**SERVIÇOS**
- Tile installation — $10–18/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Outdoor Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200
   - Grout especial para exterior

3. **Clips/Spacers** — Quantidade depende do tile (ver tabela)

---

### **POOL DECK TILE** ⭐

**SERVIÇOS**
- Install — $12–20/sqf

**MATERIAIS** (quantidade varia conforme o tamanho do tile)

1. **Thinset** — Incluído no preço
   - Fórmula: sqft ÷ 80
   
2. **Anti-slip Grout** — Incluído no preço
   - Fórmula: sqft ÷ 200
   - Grout especial antiderrapante

3. **Silicone** — Incluído no preço
   - Fórmula: linear ft ÷ 25

4. **Clips/Spacers** — Quantidade depende do tile (ver tabela)

---

### **OUTDOOR WATERPROOFING**

**SERVIÇOS**
- Membrane install

**MATERIAIS**
- Waterproof membrane
  - Fórmula: sqft ÷ 55
- Corners / seals

---

## 🎨 5) PAINTING

### **INTERIOR WALLS**

**SERVIÇOS**
- Wall painting — $1.00–1.80/sqf
- Wall prep (patch + sand) — $20–80
- Accent wall — $50–150

**MATERIAIS**
- Paint
- Primer
- Tape / plastic
- Caulk

**COMPLEXIDADE**
- Many colors — +10–20%
- Wall damage — +$0.20–0.50/sqf
- High walls — +$0.20–0.60/sqf

---

### **CEILINGS**

**SERVIÇOS**
- Ceiling painting — $1.20–2.50/sqf
- Ceiling repair — $50–180

**MATERIAIS**
- Ceiling paint
- Primer

**COMPLEXIDADE**
- High ceilings — +$0.30–0.80/sqf
- Popcorn — +$0.50–1.20/sqf

---

### **TRIM & BASEBOARD PAINTING**

**SERVIÇOS**
- Trim painting — $1–2/ft

**MATERIAIS**
- Trim paint
- Caulk

**ADD-ONS**
- Caulking — $0.20–0.40/ft
- Sanding — $0.20–0.35/ft

---

### **DOORS & FRAMES**

**SERVIÇOS**
- One side — $35–60
- Both sides — $55–95
- Frame — $20–40

**MATERIAIS**
- Semi-gloss paint
- Primer

---

### **POPCORN CEILING REMOVAL**

**SERVIÇOS**
- Removal — $1.20–3.00/sqf

**MATERIAIS**
- Plastic protection
- Texture spray
- Primer

**ADD-ONS**
- New texture — $0.50–1.50/sqf

---

## 🔨 6) DRYWALL

### **PATCHES**

**SERVIÇOS**
- Small (0–6") — $50–90
- Medium (6–12") — $80–150
- Large (12–24") — $120–250

**MATERIAIS**
- Drywall cut
- Joint compound
- Tape
- Sandpaper

**COMPLEXIDADE**
- Texture match — +$20–80
- Corners — +10–20%

**ADD-ONS**
- Paint touch-up — $20–60
- Primer — $10–25

---

### **DRYWALL INSTALLATION**

**SERVIÇOS**
- Install — $1.50–2.50/sqf
- Demolition — $1–1.80/sqf

**MATERIAIS**
- Drywall sheets — $12–22
- Screws
- Joint compound
- Tape

**COMPLEXIDADE**
- Many outlets/cuts — +10–20%
- High ceilings — +$0.20–0.60/sqf

**ADD-ONS**
- Insulation — $0.80–1.50/sqf
- Moisture-resistant drywall — +$4–6/sheet

---

### **FINISH LEVELS**

**SERVIÇOS**
- Level 1 — $0.80–1.20/sqf
- Level 2 — $1–1.50/sqf
- Level 3 — $1.50–2.50/sqf
- Level 4 — $2.50–4.00/sqf
- Level 5 — $3.50–5.50/sqf

**MATERIAIS**
- Joint compound
- Tape
- Sandpaper
- Primer

**COMPLEXIDADE**
- Curved walls — +20%

---

### **TEXTURE MATCH**

**SERVIÇOS**
- Texture match — $0.80–2.00/sqf

**MATERIAIS**
- Texture spray
- Primer

**COMPLEXIDADE**
- Hard texture match — +20–40%

---

### **CEILING DRYWALL REPAIR**

**SERVIÇOS**
- Ceiling repair — $120–350+

**MATERIAIS**
- Drywall
- Joint compound
- Tape
- Primer

**COMPLEXIDADE**
- Hard angles — +10–20%
- Texture match — +20–50%

---

### **CORNER BEAD**

**SERVIÇOS**
- Install — $20–45
- Repair — $15–30

**MATERIAIS**
- Corner bead
- Joint compound

**ADD-ONS**
- Texture finish — $20–60

---

### **DRYWALL DEMOLITION**

**SERVIÇOS**
- Remove drywall — $1–1.80/sqf
- Ceiling demo — +20–30%

---

## 📝 GUIA RÁPIDO DE USO

### **Como Calcular Materiais para Projetos com Tile:**

#### **Passo 1: Identifique o tamanho do tile**
Consulte a tabela de tiles no início do documento

#### **Passo 2: Calcule clips e spacers**
```
Quantidade = Área total (sqft) × Clips/sqf do tile escolhido
```

#### **Passo 3: Calcule materiais base**
```
• Thinset: sqft ÷ 80 = número de sacos
• Grout: sqft ÷ 200 = número de sacos
• Waterproof: sqft ÷ 55 = número de galões
• Cement Board: sqft ÷ 15 = número de folhas
• Silicone: linear ft ÷ 25 = número de tubos
```

#### **Passo 4: Some os custos**
```
TOTAL = Serviço + Materiais (se separados) + Add-ons + Complexidade
```

---

## 💡 EXEMPLOS PRÁTICOS COMPLETOS

### **Exemplo 1: Bathroom Floor**
```
PROJETO: 50 sqft com tile 12x12

1. MATERIAIS (incluídos no preço do serviço):
   • Thinset: 50 ÷ 80 = 0.625 → 1 saco
   • Grout: 50 ÷ 200 = 0.25 → 1 saco
   • Clips: 50 × 4 = 200 clips
   • Spacers: 50 × 4 = 200 spacers
   • Silicone: perímetro ~25 ft ÷ 25 = 1 tubo

2. SERVIÇO:
   • Installation: 50 × $5.25 = $262.50

3. ADD-ONS:
   • Toilet R&I: $50
   • Transition: $24

TOTAL: $336.50
```

### **Exemplo 2: Kitchen Backsplash**
```
PROJETO: 35 sqft com subway tile 3x6

1. MATERIAIS (incluídos no preço):
   • Thinset: 35 ÷ 80 = 0.44 → 1 saco
   • Grout: 35 ÷ 200 = 0.175 → 1 saco
   • Clips: 35 × 10 = 350 clips (subway precisa mais!)
   • Spacers: 35 × 10 = 350 spacers
   • Silicone: 12 linear ft ÷ 25 = 1 tubo

2. SERVIÇO:
   • Installation: 35 × $16 = $560

3. COMPLEXIDADE:
   • Many outlets: +$35 (1 sqf × $35)

TOTAL: $595
```

### **Exemplo 3: Full Shower**
```
PROJETO: 80 sqft total
- Paredes: 60 sqft com tile 6x24
- Piso: 20 sqft com mosaic

PAREDES:
1. MATERIAIS (incluídos):
   • Thinset: 60 ÷ 80 = 0.75 → 1 saco
   • Grout: 60 ÷ 200 = 0.3 → 1 saco
   • Cement board: 60 ÷ 15 = 4 folhas
   • Waterproof: 60 ÷ 55 = 1.1 → 2 galões
   • Clips: 60 × 3 = 180 clips
   • Spacers: 60 × 3 = 180 spacers

2. SERVIÇO PAREDES:
   • Installation: 60 × $10 = $600

PISO:
1. MATERIAIS (incluídos):
   • Mosaic: 20 sheets
   • Thinset: 20 ÷ 80 = 0.25 → 1 saco
   • Grout: 20 ÷ 200 = 0.1 → 1 saco
   • Mortar para pan: 20 ÷ 30 = 0.67 → 1 saco
   • Clips/Spacers: 0-1 por sqft (mosaics)

2. SERVIÇO PISO:
   • Installation: 20 × $15 = $300

ADD-ONS:
• Niche: $150
• Bench: $200
• Waterproof premium: $400

TOTAL: $1,650
```

---

## ⚠️ NOTAS IMPORTANTES

### **Sobre Materiais:**
- **"Incluído no preço"**: Significa que o custo dos materiais base já está incorporado no preço por sqft do serviço
- **Preços separados**: Quando listados com $ (ex: $15–25/unit), são cobrados separadamente
- **Fórmulas**: Sempre arredonde para cima para garantir material suficiente

### **Sobre Tiles:**
- Tiles maiores (24x24+) = menos clips/spacers mas instalação mais complexa
- Subway tiles pequenos (3x6, 3x12) = mais clips/spacers
- Mosaics em sheets = quase não precisam clips/spacers (já vêm montados)

### **Sobre Cálculos:**
- Sempre adicione 10% de desperdício na compra de tiles
- Para áreas irregulares, calcule a metragem quadrada total e some todas as seções
- Linear feet para silicone = perímetro da área + juntas especiais

---

**Documento Unificado - EaseQuote 2024**