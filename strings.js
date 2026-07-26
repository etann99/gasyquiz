/* =========================================================================
   strings.js — Tout le CONTENU textuel de l'application :
   - STRINGS : libellés d'interface (équivalent de l'ancien locales/strings.json)
   - QUESTIONS : les questions du quiz (équivalent de l'ancien data/questions.ts)
   Aucune logique ici — uniquement des données. Modifie ce fichier pour
   changer les textes ou les questions, sans toucher à script.js.
   ========================================================================= */

const STRINGS = {
  "app": {
    "title": "Fantaro ny marina",
    "subtitle": "Literatiora",
    "version": "1.0",
    "themeTag": "Literatiora"
  },
  "header": {
    "totalScore": "Isa",
    "pts": "isa",
    "questionProgress": "{ankehitriny}/{fitambarana}",
    "projectionMode": "Lehibe",
    "normalMode": "Tsotra",
    "resetGame": "Averina",
    "confirmReset": "Te hamerina ve ianao ?"
  },
  "modes": {
    "title": "Fomba famaliana",
    "manta": {
      "name": "Manta",
      "badge": "isa 5",
      "description": "Valiny malalaka",
      "placeholder": "Valiny omenao..."
    },
    "sosona": {
      "name": "Sosona",
      "badge": "isa 1",
      "description": "safidy 2",
      "prompt": ""
    },
    "efajoro": {
      "name": "Efajoro",
      "badge": "isa 3",
      "description": "safidy 4",
      "prompt": ""
    }
  },
  "question": {
    "questionLabel": "F{id}",
    "modeSelected": "{endrika}",
    "changeMode": "Ovaina",
    "submitAnswer": "Ekena",
    "nextQuestion": "Manaraka",
    "previousQuestion": "Teo aloha",
    "seeSummary": "Vokatra",
    "answeredTag": "Vita",
    "pointsAwarded": "+{points} isa",
    "noPoints": "isa 0"
  },
  "feedback": {
    "correct": "Marina !",
    "incorrect": "Diso !",
    "mantaMatchNote": "",
    "officialAnswer": "Valiny ofisialy :",
    "acceptedAlternatives": "Valiny hafa ekena :",
    "yourAnswer": "Valiny omenao :",
    "pointsAdded": "isa",
    "tryAnotherQuestion": ""
  },
  "navigation": {
    "questionList": "Fanontaniana",
    "allQuestions": "Fanontaniana",
    "filterAll": "Rehetra ({count})",
    "filterAnswered": "Vita ({count})",
    "filterPending": "Eo am-piandrasana ({count})"
  },
  "summary": {
    "title": "Vokatra",
    "finalScore": "Totalin'isa",
    "maxPossible": "amin'ny isa {max} ",
    "accuracy": "Fahenterana",
    "statsByMode": "Antsipiriany isaky ny fomba famaliana",
    "restartQuiz": "Averina",
    "close": "Ialana"
  },
  "projection": {
    "title": "Endrika lehibe",
    "exit": "Ialana",
    "pressEsc": "Echap raha hiala"
  }
};

const QUESTIONS = [
  {
    "id": 1,
    "question": "Iza no mpanoratra malagasy nanoratra tantara foronina betsaka indrindra ?",
    "reponse": "Rapatsalahy Paul / Idealy-Soa",
    "sosona": ["Rapatsalahy Paul", "Emilson Daniel Andriamalala"],
    "efajoro": ["Rapatsalahy Paul", "E.D. Andriamalala", "Esther Randriamamonjy", "Randriamiadanarivo"]
  },
  {
    "id": 2,
    "question": "Inona amin'ireo sombitantara hita ao amin'ny boky Lavakombarika no miresaka momban'ny entana ao an-trano izay mikisaka ho azy ?",
    "reponse": "Taratasy misokatra ho an'i Lobo",
    "sosona": ["Miandry razana", "Taratasy misokatra ho an'i Lobo"],
    "efajoro": ["Matoatoa", "Taratasy misokatra ho an'i Lobo", "Miandry razana", "Tsy matahotra mpamosavy aho"]
  },
  {
    "id": 3,
    "question": "Ao amin'ny tantara foronina \"Ilay Vohitry ny Nofy\", nosoratan'i E.D. Andriamalala, inona ny asan'ilay lehilahy mpandray anjara fototra ?",
    "reponse": "Mpandraharaha",
    "reponses_acceptees": ["Mpivarotra", "Mpanao raharaham-barotra", "Mpitantana tsena"],
    "sosona": ["Mpandraharaha", "Mpitsabo"],
    "efajoro": ["Mpampianatra", "Mpamboly", "Mpandraharaha", "Mpitsabo"]
  },
  {
    "id": 4,
    "question": "Iza no tena anaran'ny mpanoratra mitondra ny solonarana hoe \"Dox\" ?",
    "reponse": "Jean Verdi Salomon Razakandrainy",
    "sosona": ["Jean Verdi Salomon Razakandrainy", "Auguste Rajaonarivelo"],
    "efajoro": ["Auguste Rajaonarivelo", "Jean Verdi Salomon Razakandrainy", "Jacques Rabemananjara", "Georges Andriamanantena"]
  },
  {
    "id": 5,
    "question": "Iza amin'ireo mpanoratra tantara ankehitriny no nanoratra ny boky \"Inspecteur Christophe Rabearimanana\" ?",
    "reponse": "Zara Ainga",
    "reponses_acceptees": ["Herinirina Tojosoa"],
    "sosona": ["Andrianimerina Hobiana", "Zara Ainga"],
    "efajoro": ["Johary Ravaloson", "Zara Ainga", "Andrianimerina Hobiana", "Mose Njo"]
  },
  {
    "id": 6,
    "question": "Inona ilay boky vahiny lazaina fa nahavoaraoka an-dRabearivelo tao amin'ny Kolejy Masina Misely Amparibe ny namakiany azy ?",
    "reponse": "Les Fleurs du Mal",
    "sosona": ["Les Fleurs du Mal", "La Métamorphose"],
    "efajoro": ["Les Fleurs du Mal", "Le Spleen de Paris", "La Métamorphose", "Crimes et châtiments"]
  },
  {
    "id": 7,
    "question": "Tamin'ny taona firy no nivoaka ny boky nosoratan'i Iharilanto Patrick Andriamangatiana mitondra ny lohateny hoe Onjam-pilafila ?",
    "reponse": "2001",
    "sosona": ["1991", "2001"],
    "efajoro": ["1991", "2001", "2002", "1995"]
  },
  {
    "id": 8,
    "question": "Ao amin'ny boky Vakivakim-piainana, inona no solonanarana nomena an'i Tsiry, mpandray anjara fototra ?",
    "reponse": "Besapaka",
    "sosona": ["Bangakely", "Besapaka"],
    "efajoro": ["Beloha", "Bangakely", "Besapaka", "Ilavasofina"]
  },
  {
    "id": 9,
    "question": "Inona amin'ny tantara foronin'i E.D. Andriamalala no nahazo ny loka Akbaraly ?",
    "reponse": "Fofombadiko",
    "sosona": ["Hetraketraka", "Fofombadiko"],
    "efajoro": ["Taolambalo", "Hetraketraka", "Ilay Vohitry ny Nofy", "Fofombadiko"]
  },
  {
    "id": 10,
    "question": "Tamin'ny taona firy no niforona ara-pomba ofisialy ny fikambanana mpanoratra Faribolana Sandratra ?",
    "reponse": "1989",
    "sosona": ["1989", "1990"],
    "efajoro": ["1975", "1989", "1990", "1984"]
  }
];
