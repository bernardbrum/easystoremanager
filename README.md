# EasyStore Manager

Crie a aplicação completa "EasyManager" — um Micro-SaaS para comércio local — utilizando Tailwind CSS, Lucide Icons e Shadcn UI. O design deve ser moderno, mobile-first, limpo e responsivo.

Toda a aplicação deve consumir dados de um arquivo centralizado `src/data/mockData.ts` (contendo dados da loja, produtos com categorias, avaliações e a lista de estratégias). Nenhuma tela deve ter dados hardcoded no HTML.

Crie as seguintes rotas e interfaces:

---

### 1. ROTAS PÚBLICAS (Visão do Cliente)

- `/:slug` (BioLink & Vitrine Digital):

  - Topo com banner, logo, nome da loja, horário de funcionamento e botões rápidos (WhatsApp, Endereço no Google Maps, Copiar Chave PIX).

  - Barra de busca e filtro horizontal de produtos por categorias.

  - Grid de produtos (Foto, Nome, Descrição, Preço e botão "+ Adicionar").

  - Botão flutuante do Carrinho com contador de itens.

  - Modal/Drawer do Carrinho calculando o total e botão "Enviar Pedido via WhatsApp" que abre a URL do WhatsApp formatando os itens do pedido.

- `/:slug/avaliar` (Ímã de Avaliações Google Maps):

  - Tela minimalista centralizada com a logo da loja e a pergunta "Como foi sua experiência conosco hoje?".

  - Componente de 5 estrelas grandes.

  - Lógica frontend: Se clicar em 5 estrelas, exiba um botão "Avaliar no Google Maps" com redirecionamento externo. Se clicar em 1 a 4 estrelas, abra um modal de feedback interno ("Como podemos melhorar?") com caixa de texto e botão de envio.

---

### 2. PAINEL ADMIN (`/dashboard`)

Crie um layout base com barra lateral (Sidebar) responsiva contendo a navegação para os 4 módulos:

- MÓDULO 1: Gestão da Vitrine (`/dashboard/vitrine`)

  - Form para editar dados da loja (Nome, WhatsApp, Link do Google Maps, Slug).

  - Tabela/Cards de Produtos com busca, filtro e botão "+ Novo Produto".

  - Modal de Cadastro/Edição de Produto (Nome, Categoria, Preço, Descrição, Switch "Visível na Vitrine" e upload simulado).

- MÓDULO 2: Gerador de Artes 1-Clique (`/dashboard/artes`)

  - Coluna de Controle: Dropdown para selecionar o produto do mockData, seletores de templates visuais ("Oferta do Dia", "Destaque", "Novidade") e campos de texto editáveis (Título e Chamada).

  - Coluna de Preview: Container visual em formato Story/Status (proporção 9:16 - 1080x1920) renderizando a arte em tempo real.

  - Botão "Baixar Arte (PNG)" usando a biblioteca `html-to-image` para fazer o download da imagem do preview.

- MÓDULO 3: Gestão de Avaliações (`/dashboard/avaliacoes`)

  - Cards de Métricas (Total de Avaliações, Média, Enviados ao Google, Feedbacks Privados).

  - Gerador/Copiador do Link e QR Code de Balcão (`easymanager.app/sua-loja/avaliar`).

  - Tabela de Feedbacks Privados (< 5 estrelas) exibindo data, quantidade de estrelas e a mensagem de crítica do cliente.

- MÓDULO 4: Arsenal de Estratégias (`/dashboard/estrategias`)

  - Filtro por Categoria do Comércio (Farmácia, Vestuário, Pet Shop, Mercado, Geral) e por Data Comemorativa (Dia das Mães, Pais, Black Friday, Evergreen/Sem data).

  - Grid de Cards de Estratégias com título, badges de filtro, nível de dificuldade e resumo da ação.

  - Modal "Ver Passo a Passo Completo" ao clicar no card, exibindo objetivo, checklist de materiais, roteiro de balcão e scripts prontos para WhatsApp.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://easystoremanager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a9385df6-0a8d-44bc-af70-da7662a92d62).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
