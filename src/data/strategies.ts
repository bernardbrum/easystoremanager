import storeBanner from "@/assets/store-banner.jpg";
import storeLogo from "@/assets/store-logo.png";
import prodPao from "@/assets/prod-pao.jpg";
import prodCafe from "@/assets/prod-cafe.jpg";
import prodQueijo from "@/assets/prod-queijo.jpg";
import prodAzeite from "@/assets/prod-azeite.jpg";
import prodVinho from "@/assets/prod-vinho.jpg";
import prodGranola from "@/assets/prod-granola.jpg";

export type Store = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  whatsapp: string;
  address: string;
  mapsLink: string;
  googleReviewLink: string;
  pixKey: string;
  openingHours: { label: string; hours: string }[];
  todayLabel: string;
  isOpenNow: boolean;
  logo: string;
  banner: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  visible: boolean;
};

export type Review = {
  id: string;
  date: string;
  rating: number;
  message: string;
  channel: "google" | "private";
  customer: string;
};

export type StrategyCategory = "Farmácia" | "Vestuário" | "Pet Shop" | "Mercado" | "Geral";
export type StrategyDate =
  | "Dia das Mães"
  | "Dia dos Pais"
  | "Black Friday"
  | "Evergreen/Sem data";

export type Strategy = {
  id: string;
  title: string;
  summary: string;
  category: StrategyCategory;
  date: StrategyDate;
  difficulty: "Fácil" | "Médio" | "Avançado";
  estimatedTime: string;
  objective: string;
  materials: string[];
  counterScript: string[];
  whatsappScripts: { label: string; text: string }[];
};

export const store: Store = {
  id: "store-1",
  name: "Empório Bela Vista",
  slug: "emporio-bela-vista",
  tagline: "Padaria artesanal, mercearia fina e cafés especiais no seu bairro.",
  whatsapp: "5511987654321",
  address: "Rua das Acácias, 128 — Vila Bela Vista, São Paulo/SP",
  mapsLink: "https://maps.google.com/?q=Rua+das+Acacias+128+Sao+Paulo",
  googleReviewLink: "https://search.google.com/local/writereview?placeid=ChIJ_emporio_bela_vista",
  pixKey: "emporiobelavista@pix.com.br",
  openingHours: [
    { label: "Segunda a Sexta", hours: "07:00 — 20:00" },
    { label: "Sábado", hours: "07:00 — 18:00" },
    { label: "Domingo", hours: "08:00 — 13:00" },
  ],
  todayLabel: "Hoje: 07:00 — 20:00",
  isOpenNow: true,
  logo: storeLogo,
  banner: storeBanner,
};

export const categories = [
  "Padaria",
  "Cafés",
  "Mercearia",
  "Adega",
  "Saudáveis",
] as const;

export const products: Product[] = [
  {
    id: "p1",
    name: "Pão Sourdough Artesanal",
    description: "Fermentação natural de 24h, casca crocante e miolo úmido. 700g.",
    price: 26.9,
    category: "Padaria",
    image: prodPao,
    visible: true,
  },
  {
    id: "p2",
    name: "Café Especial Torra Média",
    description: "Grãos 100% arábica do Sul de Minas. Notas de chocolate e caramelo. 250g.",
    price: 39.5,
    category: "Cafés",
    image: prodCafe,
    visible: true,
  },
  {
    id: "p3",
    name: "Queijo Canastra Meia Cura",
    description: "Produção artesanal mineira, maturado 22 dias. Peça de 500g.",
    price: 58.0,
    category: "Mercearia",
    image: prodQueijo,
    visible: true,
  },
  {
    id: "p4",
    name: "Azeite Extra Virgem 500ml",
    description: "Acidez 0,2%, primeira prensagem a frio. Ideal para finalizar pratos.",
    price: 64.9,
    category: "Mercearia",
    image: prodAzeite,
    visible: true,
  },
  {
    id: "p5",
    name: "Vinho Tinto Reserva",
    description: "Blend de uvas selecionadas, safra 2021. Harmoniza com carnes e queijos.",
    price: 89.9,
    category: "Adega",
    image: prodVinho,
    visible: true,
  },
  {
    id: "p6",
    name: "Granola Caseira com Mel",
    description: "Aveia, castanhas e mel silvestre. Sem açúcar refinado. Pote 400g.",
    price: 32.0,
    category: "Saudáveis",
    image: prodGranola,
    visible: true,
  },
  {
    id: "p7",
    name: "Croissant de Manteiga (4un)",
    description: "Massa folhada com manteiga francesa, assado na hora.",
    price: 34.0,
    category: "Padaria",
    image: prodPao,
    visible: true,
  },
  {
    id: "p8",
    name: "Cápsulas de Café (10un)",
    description: "Compatíveis com as principais máquinas. Intensidade 8.",
    price: 27.9,
    category: "Cafés",
    image: prodCafe,
    visible: false,
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    date: "2026-07-28",
    rating: 5,
    message: "Atendimento impecável e o pão sourdough é o melhor da região.",
    channel: "google",
    customer: "Marina L.",
  },
  {
    id: "r2",
    date: "2026-07-27",
    rating: 5,
    message: "Loja linda, produtos frescos. Virei cliente fiel.",
    channel: "google",
    customer: "Rodrigo P.",
  },
  {
    id: "r3",
    date: "2026-07-26",
    rating: 3,
    message: "Produtos ótimos, mas a fila do caixa no sábado à tarde estava muito demorada.",
    channel: "private",
    customer: "Camila S.",
  },
  {
    id: "r4",
    date: "2026-07-24",
    rating: 2,
    message: "Pedi entrega e chegou 50 minutos depois do combinado, sem aviso.",
    channel: "private",
    customer: "Fernando A.",
  },
  {
    id: "r5",
    date: "2026-07-22",
    rating: 4,
    message: "Faltou opção de pão sem glúten. No resto, nota 10.",
    channel: "private",
    customer: "Juliana T.",
  },
  {
    id: "r6",
    date: "2026-07-20",
    rating: 5,
    message: "O café especial é sensacional, e a equipe explica tudo com paciência.",
    channel: "google",
    customer: "Alexandre M.",
  },
  {
    id: "r7",
    date: "2026-07-18",
    rating: 5,
    message: "Melhor mercearia do bairro, sempre saio com mais do que fui buscar.",
    channel: "google",
    customer: "Beatriz N.",
  },
  {
    id: "r8",
    date: "2026-07-15",
    rating: 1,
    message: "Fui mal atendido no balcão da padaria, o atendente parecia com pressa.",
    channel: "private",
    customer: "Cliente anônimo",
  },
];

export const artTemplates = [
  {
    id: "oferta",
    name: "Oferta do Dia",
    description: "Fundo quente com selo de desconto e preço gigante.",
    defaultTitle: "OFERTA DO DIA",
    defaultCallToAction: "Só hoje, enquanto durar o estoque!",
    badge: "SÓ HOJE",
  },
  {
    id: "destaque",
    name: "Destaque",
    description: "Estilo editorial sóbrio para produtos premium.",
    defaultTitle: "DESTAQUE DA SEMANA",
    defaultCallToAction: "Peça pelo WhatsApp e retire na loja.",
    badge: "SELEÇÃO",
  },
  {
    id: "novidade",
    name: "Novidade",
    description: "Visual fresco e claro para lançamentos.",
    defaultTitle: "CHEGOU NOVIDADE",
    defaultCallToAction: "Passe na loja e venha experimentar.",
    badge: "NOVO",
  },
] as const;

export const strategies: Strategy[] = [
  {
    id: "s1",
    title: "Kit Presente Express para o Dia das Mães",
    summary:
      "Monte 3 faixas de kit prontos na entrada da loja para resolver o presente de quem deixou para a última hora.",
    category: "Geral",
    date: "Dia das Mães",
    difficulty: "Fácil",
    estimatedTime: "2 horas de preparo",
    objective:
      "Aumentar o ticket médio nos 5 dias antes do Dia das Mães vendendo combinações prontas em vez de itens soltos.",
    materials: [
      "Caixas ou sacolas kraft (3 tamanhos)",
      "Papel de seda e fita de cetim",
      "Cartões de mensagem em branco",
      "Cartaz A4 com as 3 faixas de preço",
    ],
    counterScript: [
      "Cumprimente e pergunte: 'Já garantiu o presente da sua mãe?'",
      "Aponte para a mesa de kits e apresente as 3 faixas em 10 segundos.",
      "Ofereça a personalização gratuita do cartão de mensagem.",
      "Feche sugerindo o kit intermediário — é o que mais vende.",
    ],
    whatsappScripts: [
      {
        label: "Disparo para a lista de clientes",
        text: "Oi, {{nome}}! Montamos kits prontos de Dia das Mães aqui no Empório Bela Vista, a partir de R$ 59. Embalagem e cartão inclusos. Quer que eu separe um para você retirar hoje?",
      },
      {
        label: "Resposta para quem pede foto",
        text: "Claro! Estou te enviando as fotos dos 3 kits. O mais pedido é o intermediário (café especial + granola + caneca). Reservo no seu nome?",
      },
    ],
  },
  {
    id: "s2",
    title: "Recompra programada de medicamentos de uso contínuo",
    summary:
      "Registre a data de término da caixa e envie um lembrete no WhatsApp 3 dias antes de acabar.",
    category: "Farmácia",
    date: "Evergreen/Sem data",
    difficulty: "Médio",
    estimatedTime: "15 min/dia",
    objective:
      "Transformar compras esporádicas em recorrência mensal previsível e evitar que o cliente compre na concorrência.",
    materials: [
      "Planilha ou caderno de controle de recompra",
      "Etiquetas com data de término da caixa",
      "Celular da loja com WhatsApp Business",
    ],
    counterScript: [
      "Ao vender uso contínuo, pergunte: 'Essa caixa dura quantos dias?'",
      "Peça autorização: 'Posso te avisar quando estiver acabando?'",
      "Anote nome, medicamento e data prevista de término.",
      "Cole a etiqueta com a data na caixa antes de entregar.",
    ],
    whatsappScripts: [
      {
        label: "Lembrete de recompra",
        text: "Olá, {{nome}}! Pela nossa anotação, seu {{medicamento}} termina em {{data}}. Já separei uma caixa aqui. Quer retirar ou prefere entrega?",
      },
      {
        label: "Follow-up sem resposta",
        text: "{{nome}}, deixo a reserva do seu {{medicamento}} até amanhã às 18h. Se preferir, consigo enviar por entrega hoje mesmo. 😉",
      },
    ],
  },
  {
    id: "s3",
    title: "Prova de sofá: leve 3, pague depois de experimentar",
    summary:
      "Permita que a cliente leve peças selecionadas para provar em casa, com prazo de 24h para devolver.",
    category: "Vestuário",
    date: "Evergreen/Sem data",
    difficulty: "Avançado",
    estimatedTime: "1 semana para estruturar",
    objective:
      "Eliminar a objeção do 'vou pensar' e aumentar a conversão de clientes cadastradas em até 40%.",
    materials: [
      "Termo simples de retirada para provar",
      "Sacola reutilizável da marca",
      "Cadastro com CPF e telefone confirmado",
      "Controle de peças em prova",
    ],
    counterScript: [
      "Identifique a cliente indecisa entre 2 ou 3 peças.",
      "Explique: 'Leve as três para casa, prove com calma e volte amanhã.'",
      "Preencha o termo e confirme o telefone na hora.",
      "Envie mensagem no dia seguinte pela manhã.",
    ],
    whatsappScripts: [
      {
        label: "Confirmação da prova em casa",
        text: "Oi, {{nome}}! Suas 3 peças estão reservadas até amanhã às 19h. Qualquer dúvida de tamanho, me chama por aqui que te ajudo na hora.",
      },
      {
        label: "Fechamento da prova",
        text: "{{nome}}, como ficaram as peças? Se quiser ficar só com uma, sem problema — traz as outras quando puder e fechamos por aqui. 💛",
      },
    ],
  },
  {
    id: "s4",
    title: "Clube do banho: cartão fidelidade do Pet Shop",
    summary:
      "A cada 5 banhos, o 6º sai grátis — com aviso automático de retorno pelo WhatsApp.",
    category: "Pet Shop",
    date: "Evergreen/Sem data",
    difficulty: "Fácil",
    estimatedTime: "3 horas",
    objective:
      "Elevar a frequência média de banhos de 45 para 30 dias e fidelizar tutores do bairro.",
    materials: [
      "Cartões fidelidade impressos com 6 espaços",
      "Carimbo da loja",
      "Agenda de retorno por pet",
      "Foto do pet após o banho",
    ],
    counterScript: [
      "Na entrega do pet, mostre a foto do antes e depois.",
      "Entregue o cartão e carimbe o primeiro banho.",
      "Agende o próximo banho ali mesmo, com data marcada.",
      "Confirme se pode enviar o lembrete pelo WhatsApp.",
    ],
    whatsappScripts: [
      {
        label: "Lembrete de retorno com foto",
        text: "Oi, {{nome}}! O {{pet}} está chegando nos 30 dias do último banho. Tenho horário na {{dia}} às {{hora}}. Confirmo?",
      },
      {
        label: "Aviso de banho grátis",
        text: "Boa notícia, {{nome}}: o próximo banho do {{pet}} é por nossa conta! 🎉 Quer agendar para esta semana?",
      },
    ],
  },
  {
    id: "s5",
    title: "Black Friday em 3 ondas de estoque",
    summary:
      "Divida a promoção em três blocos de horários com produtos diferentes para gerar retorno no mesmo dia.",
    category: "Mercado",
    date: "Black Friday",
    difficulty: "Médio",
    estimatedTime: "1 semana de planejamento",
    objective:
      "Escoar estoque parado sem queimar a margem dos campeões de venda, aumentando o fluxo em 3 picos.",
    materials: [
      "Lista de produtos com giro baixo e margem alta",
      "Cartazes por onda (manhã, tarde, noite)",
      "Story pronto para cada onda",
      "Time escalado nos horários de pico",
    ],
    counterScript: [
      "Ao atender, informe qual onda está ativa e o que vem na próxima.",
      "Incentive o retorno: 'Às 17h libera a onda de bebidas.'",
      "Sugira sempre um item complementar da onda vigente.",
      "Ofereça cadastro na lista de WhatsApp para o aviso das próximas ondas.",
    ],
    whatsappScripts: [
      {
        label: "Aviso de abertura de onda",
        text: "🔥 ONDA 2 LIBERADA: até 40% em mercearia até as 17h aqui no Empório Bela Vista. Corre que é por tempo limitado!",
      },
      {
        label: "Última chamada",
        text: "{{nome}}, faltam 40 minutos para encerrar a última onda da Black Friday. Quer que eu separe seus itens para retirada rápida?",
      },
    ],
  },
  {
    id: "s6",
    title: "Vitrine do churrasco para o Dia dos Pais",
    summary:
      "Monte uma ilha temática com tudo do churrasco e um combo fechado com preço redondo.",
    category: "Mercado",
    date: "Dia dos Pais",
    difficulty: "Fácil",
    estimatedTime: "3 horas",
    objective:
      "Aumentar o volume por cupom na semana do Dia dos Pais reunindo carne, bebida e acompanhamentos.",
    materials: [
      "Ilha ou mesa central na loja",
      "Cartaz com o combo e o preço fechado",
      "Etiquetas de sugestão de uso",
      "Amostras para degustação",
    ],
    counterScript: [
      "Pergunte se o churrasco de domingo já está resolvido.",
      "Leve o cliente até a ilha e mostre o combo completo.",
      "Ofereça a degustação e sugira uma bebida para acompanhar.",
      "Feche oferecendo entrega no sábado de manhã.",
    ],
    whatsappScripts: [
      {
        label: "Oferta do combo",
        text: "Oi, {{nome}}! Montamos o Combo Churrasco do Dia dos Pais: carne, carvão, pão de alho e bebida por R$ {{valor}}. Reservo o seu para sábado?",
      },
      {
        label: "Confirmação de retirada",
        text: "Combinado, {{nome}}! Seu combo fica separado para retirada no sábado até as 12h. Se precisar de algo mais, me chama por aqui.",
      },
    ],
  },
  {
    id: "s7",
    title: "Ímã de avaliações no balcão",
    summary:
      "Use um QR Code no caixa para direcionar clientes satisfeitos ao Google e capturar críticas em privado.",
    category: "Geral",
    date: "Evergreen/Sem data",
    difficulty: "Fácil",
    estimatedTime: "30 minutos",
    objective:
      "Subir a nota média no Google Maps e resolver insatisfações antes que virem avaliação pública.",
    materials: [
      "Display de acrílico com QR Code",
      "Frase curta impressa: 'Como foi sua experiência?'",
      "Link da página de avaliação da loja",
    ],
    counterScript: [
      "Após finalizar a venda, agradeça pelo nome.",
      "Aponte para o QR Code: 'Leva 10 segundos e ajuda muito a gente.'",
      "Não escolha a nota pelo cliente — deixe ele decidir.",
      "Se a nota for baixa, escute e resolva ainda na loja.",
    ],
    whatsappScripts: [
      {
        label: "Pedido de avaliação pós-compra",
        text: "Oi, {{nome}}! Obrigado pela visita de hoje. Se puder avaliar sua experiência em 10 segundos, é só clicar aqui: {{link}} 🙏",
      },
      {
        label: "Resposta a feedback negativo",
        text: "{{nome}}, obrigado por nos contar. Isso não é o padrão que queremos entregar. Já ajustamos o processo e quero te compensar na próxima visita — pode ser?",
      },
    ],
  },
  {
    id: "s8",
    title: "Dermo-consulta rápida de 5 minutos",
    summary:
      "Ofereça uma análise de pele gratuita no balcão e transforme em venda consultiva de dermocosméticos.",
    category: "Farmácia",
    date: "Evergreen/Sem data",
    difficulty: "Médio",
    estimatedTime: "2 dias de treino da equipe",
    objective:
      "Aumentar a venda de dermocosméticos, que têm margem maior que medicamentos de prescrição.",
    materials: [
      "Cantinho com espelho e boa iluminação",
      "Roteiro de 4 perguntas sobre rotina de pele",
      "Amostras de limpeza, hidratação e protetor",
      "Ficha de recomendação para levar em casa",
    ],
    counterScript: [
      "Convide: 'Posso fazer uma análise rápida da sua pele?'",
      "Faça as 4 perguntas do roteiro e anote.",
      "Recomende no máximo 3 produtos, do essencial ao extra.",
      "Entregue a ficha escrita, mesmo se a compra não sair hoje.",
    ],
    whatsappScripts: [
      {
        label: "Follow-up da consulta",
        text: "Oi, {{nome}}! Aqui é da farmácia. Como sua pele está reagindo ao {{produto}}? Qualquer dúvida da rotina, me chama.",
      },
      {
        label: "Convite para a consulta",
        text: "{{nome}}, nesta semana estamos com análise de pele gratuita de 5 minutinhos. Quer agendar um horário?",
      },
    ],
  },
];

export const strategyCategories: StrategyCategory[] = [
  "Farmácia",
  "Vestuário",
  "Pet Shop",
  "Mercado",
  "Geral",
];

export const strategyDates: StrategyDate[] = [
  "Dia das Mães",
  "Dia dos Pais",
  "Black Friday",
  "Evergreen/Sem data",
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");
