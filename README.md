# Manifesto — Instituto Piratininga

Página do manifesto do Instituto Piratininga: sete capítulos sobre a recusa do fatalismo, a crença no potencial humano e o método de uma tecnologia social que fica.

**Site:** https://guillherme3339.github.io/manifesto-piratininga/

## Stack

Site estático, sem build — HTML + CSS + JS puros.

- **GSAP + ScrollTrigger** (CDN) — animações de entrada e revelação por scroll
- **Lenis** (CDN) — smooth scroll
- **Plus Jakarta Sans** (Google Fonts)

Degrada graciosamente: sem JS ou com `prefers-reduced-motion`, todo o conteúdo aparece estático.

## Design

Paleta e tipografia seguem o branding book v2 do Instituto ("Papel & Terracota"): Marfim `#FAF7F2`, Papel `#F5F0E8`, Carvão Quente `#1F1E1B`, Terracota `#C15F3C` (só acento — o olho do peixe é o único ponto terracota do logo). Tipografia: Fraunces (títulos e manifesto) + Plus Jakarta Sans (corpo). Tema alterna claro/escuro por seção; o botão no topo força modo escuro global (segue `prefers-color-scheme` por padrão).

## Desenvolvimento

Basta servir a pasta:

```sh
npx serve .
```
