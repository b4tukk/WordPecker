import { v4 as uuidv4 } from "uuid"

export function initializeDefaultLists() {
  const basicSpanishId = uuidv4()
  const travelPhrasesId = uuidv4()

  return [
    {
      id: basicSpanishId,
      title: "Basic Spanish Vocabulary",
      description: "Essential Spanish words for beginners",
      language: "spanish",
      wordCount: 5,
      progress: 0,
      createdAt: new Date().toISOString(),
      words: [
        {
          id: uuidv4(),
          term: "hola",
          definition: "hello",
          notes: "Greeting",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "adiós",
          definition: "goodbye",
          notes: "Farewell",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "gracias",
          definition: "thank you",
          notes: "Expressing gratitude",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "por favor",
          definition: "please",
          notes: "Making requests",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "de nada",
          definition: "you're welcome",
          notes: "Response to thank you",
          mastered: false,
        },
      ],
    },
    {
      id: travelPhrasesId,
      title: "Travel Phrases",
      description: "Useful phrases for traveling",
      language: "french",
      wordCount: 3,
      progress: 0,
      createdAt: new Date().toISOString(),
      words: [
        {
          id: uuidv4(),
          term: "Où est...?",
          definition: "Where is...?",
          notes: "For asking locations",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "Je voudrais...",
          definition: "I would like...",
          notes: "For ordering or requesting",
          mastered: false,
        },
        {
          id: uuidv4(),
          term: "Parlez-vous anglais?",
          definition: "Do you speak English?",
          notes: "Useful when you need help",
          mastered: false,
        },
      ],
    },
  ]
}
