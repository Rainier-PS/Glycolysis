(function () {
  'use strict';

  var GLYCOLYSIS_QUESTIONS = [
    {
      id: 'q1',
      checkpoint: 1,
      question: 'What molecule begins glycolysis?',
      options: ['ATP', 'Glucose', 'NADH', 'Pyruvate'],
      correctAnswer: 1,
      explanation: 'Glucose is the six-carbon sugar that serves as the starting molecule for glycolysis.',
      knowledgeBoundary: 'Glucose introduction',
      difficulty: 'beginner'
    },
    {
      id: 'q2',
      checkpoint: 3,
      question: 'Why does the cell invest ATP near the beginning of glycolysis?',
      options: [
        'To prepare the glucose pathway for later reactions',
        'To produce pyruvate immediately',
        'To turn NADH into NAD+',
        'To stop the pathway'
      ],
      correctAnswer: 0,
      explanation: 'ATP is used to add phosphate groups during the early steps, helping prepare the molecule for the reactions that follow.',
      knowledgeBoundary: 'ATP investment phase',
      difficulty: 'beginner'
    },
    {
      id: 'q3',
      checkpoint: 5,
      question: 'What happens when the six-carbon molecule reaches the splitting stage?',
      options: [
        'It becomes one six-carbon molecule again',
        'It splits into two three-carbon molecules',
        'It immediately becomes ATP',
        'It leaves the cell'
      ],
      correctAnswer: 1,
      explanation: 'Fructose-1,6-bisphosphate is split into two three-carbon molecules. DHAP is converted to G3P, so two G3P molecules continue through glycolysis.',
      knowledgeBoundary: 'Six-carbon split',
      difficulty: 'beginner'
    },
    {
      id: 'q4',
      checkpoint: 7,
      question: 'What happens to NAD+ during glycolysis?',
      options: [
        'It is reduced to NADH',
        'It becomes glucose',
        'It is converted directly into ATP',
        'It becomes pyruvate'
      ],
      correctAnswer: 0,
      explanation: 'NAD+ accepts electrons from the reaction and is reduced to NADH. Because glycolysis continues through two three-carbon pathways, two NADH are produced per glucose.',
      knowledgeBoundary: 'NAD+ to NADH',
      difficulty: 'beginner'
    },
    {
      id: 'q5',
      checkpoint: 9,
      question: 'What is the net ATP gain from glycolysis for one glucose molecule?',
      options: ['0 ATP', '1 ATP', '2 ATP', '4 ATP'],
      correctAnswer: 2,
      explanation: 'Two ATP are invested during the early phase, while four ATP are produced later. The net gain is therefore 2 ATP.',
      knowledgeBoundary: 'ATP payoff and accounting',
      difficulty: 'beginner'
    }
  ];

  window.GLYCOLYSIS_QUESTIONS = GLYCOLYSIS_QUESTIONS;
})();
