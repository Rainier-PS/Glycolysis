(function () {
  'use strict';

  var GLYCOLYSIS_QUESTIONS = [
    {
      id: 'q1',
      type: 'single',
      checkpoint: 1,
      question: 'What molecule begins glycolysis?',
      options: [
        { id: 'q1_a', text: 'ATP' },
        { id: 'q1_b', text: 'Glucose' },
        { id: 'q1_c', text: 'NADH' },
        { id: 'q1_d', text: 'Pyruvate' }
      ],
      correctAnswer: 'q1_b',
      explanation: 'Glucose is the six-carbon sugar that serves as the starting molecule for glycolysis.',
      difficulty: 'beginner'
    },
    {
      id: 'q2',
      type: 'single',
      checkpoint: 2,
      question: 'Where does glycolysis take place?',
      options: [
        { id: 'q2_a', text: 'Nucleus' },
        { id: 'q2_b', text: 'Cytosol' },
        { id: 'q2_c', text: 'Mitochondrial matrix' },
        { id: 'q2_d', text: 'Ribosome' }
      ],
      correctAnswer: 'q2_b',
      explanation: 'Glycolysis takes place in the cytosol, the fluid portion of the cell outside the organelles.',
      difficulty: 'beginner'
    },
    {
      id: 'q3',
      type: 'single',
      checkpoint: 3,
      question: 'Why does the cell invest ATP near the beginning of glycolysis?',
      options: [
        { id: 'q3_a', text: 'To add phosphate groups and prepare the molecule for later reactions' },
        { id: 'q3_b', text: 'To produce pyruvate immediately' },
        { id: 'q3_c', text: 'To turn NADH into NAD+' },
        { id: 'q3_d', text: 'To stop the pathway' }
      ],
      correctAnswer: 'q3_a',
      explanation: 'ATP is used to add phosphate groups to the glucose-derived molecule during the early steps, preparing it for the reactions that follow.',
      difficulty: 'beginner'
    },
    {
      id: 'q4',
      type: 'single',
      checkpoint: 4,
      question: 'What happens when the six-carbon molecule reaches the splitting stage?',
      options: [
        { id: 'q4_a', text: 'It becomes one six-carbon molecule again' },
        { id: 'q4_b', text: 'It splits into two three-carbon molecules' },
        { id: 'q4_c', text: 'It immediately becomes ATP' },
        { id: 'q4_d', text: 'It leaves the cell' }
      ],
      correctAnswer: 'q4_b',
      explanation: 'Fructose-1,6-bisphosphate is split into two three-carbon molecules. DHAP is converted to G3P, so two G3P molecules continue through glycolysis.',
      difficulty: 'beginner'
    },
    {
      id: 'q5',
      type: 'single',
      checkpoint: 5,
      question: 'Why do the later reactions of glycolysis happen twice for every glucose molecule?',
      options: [
        { id: 'q5_a', text: 'Because glucose is made of two ATP molecules' },
        { id: 'q5_b', text: 'Because the six-carbon molecule becomes two three-carbon molecules' },
        { id: 'q5_c', text: 'Because NAD+ can only work twice' },
        { id: 'q5_d', text: 'Because pyruvate has six carbons' }
      ],
      correctAnswer: 'q5_b',
      explanation: 'After the split, the single six-carbon glucose has become two three-carbon molecules. Each one goes through the rest of the pathway, so all downstream reactions occur twice per glucose.',
      difficulty: 'beginner'
    },
    {
      id: 'q6',
      type: 'single',
      checkpoint: 7,
      question: 'What happens to NAD+ during glycolysis?',
      options: [
        { id: 'q6_a', text: 'It is reduced to NADH' },
        { id: 'q6_b', text: 'It becomes glucose' },
        { id: 'q6_c', text: 'It is converted directly into ATP' },
        { id: 'q6_d', text: 'It becomes pyruvate' }
      ],
      correctAnswer: 'q6_a',
      explanation: 'NAD+ accepts electrons and hydrogen during the oxidation of G3P and is reduced to NADH. Because there are two G3P molecules, two NADH are produced.',
      difficulty: 'beginner'
    },
    {
      id: 'q7',
      type: 'single',
      checkpoint: 8,
      question: 'What is produced at the end of each three-carbon pathway?',
      options: [
        { id: 'q7_a', text: 'Glucose' },
        { id: 'q7_b', text: 'NAD+' },
        { id: 'q7_c', text: 'Pyruvate' },
        { id: 'q7_d', text: 'ATP only' }
      ],
      correctAnswer: 'q7_c',
      explanation: 'After the remaining reactions, each three-carbon molecule becomes pyruvate. One glucose gives two pyruvate molecules.',
      difficulty: 'beginner'
    },
    {
      id: 'q8',
      type: 'single',
      checkpoint: 9,
      question: 'What is the net ATP gain from glycolysis for one glucose molecule?',
      options: [
        { id: 'q8_a', text: '0 ATP' },
        { id: 'q8_b', text: '1 ATP' },
        { id: 'q8_c', text: '2 ATP' },
        { id: 'q8_d', text: '4 ATP' }
      ],
      correctAnswer: 'q8_c',
      explanation: 'Two ATP are invested during the early phase, while four ATP are produced later. The net gain is therefore 2 ATP.',
      difficulty: 'beginner'
    },
    {
      id: 'q9',
      type: 'multi',
      question: 'Which of the following are net products of glycolysis from one glucose molecule?',
      options: [
        { id: 'q9_a', text: '2 pyruvate' },
        { id: 'q9_b', text: '2 NADH' },
        { id: 'q9_c', text: '2 ATP net' },
        { id: 'q9_d', text: '4 ATP net' },
        { id: 'q9_e', text: '2 glucose' }
      ],
      correctAnswers: ['q9_a', 'q9_b', 'q9_c'],
      explanation: 'From one glucose molecule, glycolysis produces 2 pyruvate, 2 NADH, and a net gain of 2 ATP (4 produced minus 2 invested).',
      difficulty: 'beginner'
    },
    {
      id: 'q10',
      type: 'matching',
      question: 'Match each part of glycolysis with what happens to it.',
      pairs: [
        { id: 'q10_p1', left: 'Glucose', right: 'Six-carbon starting molecule', leftId: 'q10_l1', rightId: 'q10_r1' },
        { id: 'q10_p2', left: 'NAD+', right: 'Reduced to NADH', leftId: 'q10_l2', rightId: 'q10_r2' },
        { id: 'q10_p3', left: 'Fructose-1,6-bisphosphate', right: 'Split into two three-carbon molecules', leftId: 'q10_l3', rightId: 'q10_r3' },
        { id: 'q10_p4', left: 'Pyruvate', right: 'Final three-carbon product', leftId: 'q10_l4', rightId: 'q10_r4' }
      ],
      correctMatches: {
        'q10_l1': 'q10_r1',
        'q10_l2': 'q10_r2',
        'q10_l3': 'q10_r3',
        'q10_l4': 'q10_r4'
      },
      explanation: 'Glucose is the six-carbon starting molecule. NAD+ is reduced to NADH during the pathway. Fructose-1,6-bisphosphate splits into two three-carbon molecules. Pyruvate is the final three-carbon product.',
      difficulty: 'beginner'
    }
  ];

  window.GLYCOLYSIS_QUESTIONS = GLYCOLYSIS_QUESTIONS;
})();
