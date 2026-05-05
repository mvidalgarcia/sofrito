import { NextResponse } from 'next/server';

const MOCK_RECIPES = [
  {
    name: "Paella Valenciana",
    ingredients: [
      { item: "arroz bomba", amount: "200 g" },
      { item: "pollo", amount: "300 g" },
      { item: "conejo", amount: "200 g" },
      { item: "judías verdes", amount: "100 g" },
      { item: "garrofón", amount: "100 g" },
      { item: "tomate", amount: "1 unidad" },
      { item: "pimentón dulce", amount: "1 cucharadita" },
      { item: "azafrán", amount: "unas hebras" },
      { item: "aceite de oliva", amount: "50 ml" },
      { item: "agua", amount: "800 ml" },
      { item: "sal", amount: "al gusto" }
    ],
    steps: [
      "Calienta el aceite en una paella.",
      "Dora el pollo y el conejo troceados.",
      "Añade las judías verdes y el garrofón.",
      "Agrega el tomate rallado y el pimentón.",
      "Vierte el agua y las hebras de azafrán. Lleva a ebullición.",
      "Añade el arroz y cocina a fuego medio durante 18 minutos.",
      "Deja reposar 5 minutos antes de servir."
    ],
    servings: 4,
    prepTime: "20 min",
    cookTime: "40 min"
  },
  {
    name: "Arroz con Marisco",
    ingredients: [
      { item: "arroz", amount: "2 tazas" },
      { item: "gambas", amount: "200 g" },
      { item: "mejillones", amount: "200 g" },
      { item: "almejas", amount: "150 g" },
      { item: "calamares", amount: "150 g" },
      { item: "aceite de oliva", amount: "3 cucharadas" },
      { item: "ajos", amount: "2 dientes" },
      { item: "cebolla", amount: "1 pequeña" },
      { item: "tomate", amount: "1 rallado" },
      { item: "pimiento rojo", amount: "1" },
      { item: "caldo de pescado", amount: "4 tazas" },
      { item: "perejil", amount: "al gusto" }
    ],
    steps: [
      "Prepara el caldo de pescado y mantenlo caliente.",
      "Sofríe el marisco en aceite caliente y reserva.",
      "Sofríe la cebolla, ajo y pimiento.",
      "Añade el tomate y cocina 3 minutos.",
      "Vierte el arroz y mezcla bien.",
      "Añade el caldo caliente y el marisco.",
      "Cocina 15 minutos y sirve con perejil."
    ],
    servings: 4,
    prepTime: "20 min",
    cookTime: "30 min"
  },
  {
    name: "Tacos al Pastor",
    ingredients: [
      { item: "carne de cerdo", amount: "500 g" },
      { item: "piña", amount: "1 taza" },
      { item: "chile guajillo", amount: "3" },
      { item: "pasta de achiote", amount: "2 cucharadas" },
      { item: "vinagre", amount: "1/4 taza" },
      { item: "ajos", amount: "3" },
      { item: "comino", amount: "1 cucharadita" },
      { item: "orégano", amount: "1 cucharadita" },
      { item: "tortillas de maíz", amount: "8" },
      { item: "cilantro fresco", amount: "1/2 taza" },
      { item: "cebolla", amount: "1/2 taza" },
      { item: "limón", amount: "2" }
    ],
    steps: [
      "Hidrata los chiles en agua caliente.",
      "Licúa los chiles con achiote, vinagre, ajo, comino y orégano.",
      "Marina la carne en la mezcla por 2 horas.",
      "Ase la carne y la piña a fuego alto.",
      "Calienta las tortillas.",
      "Pica la carne y sirve en tortillas.",
      "Decora con cilantro, cebolla y limón."
    ],
    servings: 4,
    prepTime: "30 min",
    cookTime: "15 min"
  },
  {
    name: "Pasta Carbonara",
    ingredients: [
      { item: "espagueti", amount: "400 g" },
      { item: "guanciale o bacon", amount: "200 g" },
      { item: "huevos", amount: "4" },
      { item: "queso pecorino", amount: "100 g" },
      { item: "queso parmesano", amount: "50 g" },
      { item: "pimienta negra", amount: "al gusto" }
    ],
    steps: [
      "Cocina la pasta al dente.",
      "Sofríe el guanciale hasta dorado.",
      "Bate los huevos con los quesos.",
      "Mezcla la pasta caliente con el guanciale.",
      "Retira del fuego y añade la mezcla de huevos.",
      "Revuelve rápidamente para crear la salsa.",
      "Sirve con pimienta negra."
    ],
    servings: 4,
    prepTime: "10 min",
    cookTime: "15 min"
  },
  {
    name: "Ensalada César",
    ingredients: [
      { item: "lechuga romana", amount: "1 grande" },
      { item: "pollo a la parrilla", amount: "2 pechugas" },
      { item: "pan crujiente", amount: "2 tazas" },
      { item: "parmesano", amount: "1 taza" },
      { item: "huevo", amount: "1" },
      { item: "anchoas", amount: "4" },
      { item: "ajo", amount: "2 dientes" },
      { item: "aceite de oliva", amount: "1/2 taza" },
      { item: "limón", amount: "1" },
      { item: "mostaza", amount: "1 cucharada" }
    ],
    steps: [
      "Ase el pollo y corta en tiras.",
      "Prepara el aderezo con huevo, anchoas, ajo y aceite.",
      "Lava y corta la lechuga.",
      "Tuesta el pan y córtalo en cubos.",
      "Mezcla la lechuga con el aderezo.",
      "Añade el pollo y el pan.",
      "Espolvorea parmesano y sirve."
    ],
    servings: 4,
    prepTime: "15 min",
    cookTime: "20 min"
  }
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mock = searchParams.get('mock');
  const index = parseInt(mock || '0', 10);
  
  return NextResponse.json({
    ...MOCK_RECIPES[index % MOCK_RECIPES.length],
    id: generateId(),
  });
}