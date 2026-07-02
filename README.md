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

Paleta e tipografia seguem o branding book do Instituto: Preto Piratininga `#111111`, Branco Névoa `#F5F5F5`, Vermelho MASP `#C8102E` (só acento). Tema alterna claro/escuro por seção; o botão no topo força modo escuro global (segue `prefers-color-scheme` por padrão).

## Desenvolvimento

Basta servir a pasta:

```sh
npx serve .
```
