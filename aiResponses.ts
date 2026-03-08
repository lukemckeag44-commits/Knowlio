import { WeaknessAnalysis } from './types';

export const generateWeaknessAnalysis = (topic: string): WeaknessAnalysis => {
  const analyses: Record<string, WeaknessAnalysis> = {
    'math': {
      topic: 'Mathematics - Quadratic Equations',
      weakness: 'You struggle most on timed tests involving quadratic equations. Your homework scores are strong (95%), but test scores drop significantly (68-72%).',
      strategies: [
        'Practice solving problems under timed conditions - set a 2-minute timer per question',
        'Focus on recognizing problem types quickly before solving',
        'Create a "cheat sheet" of formulas and review it before tests',
      ],
      practiceQuestions: [
        'Solve: x² - 5x + 6 = 0',
        'Factor completely: 2x² + 7x + 3',
        'Find the vertex of y = x² - 4x + 3',
        'If the discriminant is -4, how many real solutions exist?',
        'A ball is thrown with h(t) = -5t² + 20t + 2. Find maximum height.',
      ],
      explanation: 'Quadratic equations follow the form ax² + bx + c = 0. You can solve them by factoring, completing the square, or using the quadratic formula. The key is recognizing which method is fastest for each problem type.',
    },
    'english': {
      topic: 'English - Essay Structure & Analysis',
      weakness: 'Your literary analysis essays lack strong thesis statements and supporting evidence organization.',
      strategies: [
        'Use the "PEEL" paragraph structure: Point, Evidence, Explanation, Link',
        'Write your thesis statement AFTER your body paragraphs to ensure it matches your arguments',
        'Practice finding 3 pieces of textual evidence for every claim you make',
      ],
      practiceQuestions: [
        'Write a thesis statement for: "How does Shakespeare use imagery in Macbeth?"',
        'Identify the literary device: "Life is but a walking shadow"',
        'Create a topic sentence for a paragraph about guilt in Macbeth',
        'Find a quote from Act 1 that foreshadows Macbeth\'s downfall',
        'Explain how the motif of blood develops throughout the play',
      ],
      explanation: 'Strong essays have a clear thesis that makes an argument (not just states a fact), body paragraphs with specific evidence, and analysis that explains WHY the evidence supports your point.',
    },
    'science': {
      topic: 'Science - Forces and Motion',
      weakness: 'You understand concepts well in isolation but struggle to apply multiple physics concepts together in complex problems.',
      strategies: [
        'Draw free-body diagrams for EVERY force problem before solving',
        'Practice identifying all forces acting on an object systematically',
        'Work through problems step-by-step, writing out each equation',
      ],
      practiceQuestions: [
        'A 5kg box is pushed with 20N of force. If friction is 5N, what is the acceleration?',
        'Calculate the net force on a 10kg object accelerating at 3 m/s²',
        'A car brakes from 20 m/s to rest in 4 seconds. What is the deceleration?',
        'Two forces of 10N and 15N act in opposite directions. What is the net force?',
        'An object in free fall has what acceleration? (ignore air resistance)',
      ],
      explanation: 'Newton\'s Second Law (F = ma) is the foundation of mechanics. Net force equals mass times acceleration. Always identify ALL forces, find the net force, then solve for the unknown.',
    },
    'french': {
      topic: 'French - Verb Conjugation',
      weakness: 'You mix up verb endings for different tenses, especially passé composé vs imparfait.',
      strategies: [
        'Create conjugation tables and practice writing them out daily',
        'Use mnemonics: DR MRS VANDERTRAMP for être verbs in passé composé',
        'Practice by describing your day using both tenses',
      ],
      practiceQuestions: [
        'Conjugate "aller" in passé composé for "je"',
        'When do you use imparfait vs passé composé?',
        'Write the sentence: "I was eating when he arrived" in French',
        'Conjugate "finir" in present tense for all persons',
        'What is the past participle of "prendre"?',
      ],
      explanation: 'Passé composé describes completed actions (I ate). Imparfait describes ongoing past states or habitual actions (I was eating, I used to eat). Use passé composé for specific events, imparfait for background/description.',
    },
  };

  const key = topic.toLowerCase();
  if (key.includes('math') || key.includes('quadratic')) return analyses['math'];
  if (key.includes('english') || key.includes('essay')) return analyses['english'];
  if (key.includes('science') || key.includes('physics') || key.includes('force')) return analyses['science'];
  if (key.includes('french') || key.includes('verb')) return analyses['french'];
  
  return analyses['math']; // default
};

export const generateChatResponse = (message: string, tutorStyle: string): string => {
  const lowerMessage = message.toLowerCase();
  
  const responses: Record<string, Record<string, string>> = {
    encouraging: {
      greeting: "Hey! So glad you're here! 🌟 What would you like to work on today? Remember, every study session is a step toward success!",
      math: "Math can be tricky, but you've totally got this! 💪 Let's break it down into smaller pieces. What specific topic is giving you trouble?",
      help: "Of course I'll help! That's what I'm here for! 😊 Tell me more about what you're struggling with, and we'll figure it out together.",
      test: "Test coming up? No worries! Let's create a game plan. When is it, and what topics will it cover? We'll make sure you're ready! ✨",
      default: "That's a great question! Let me help you work through this. Remember, asking for help is a sign of strength! 🌟",
    },
    strict: {
      greeting: "Hello. Let's make the most of our time together. What subject needs attention today?",
      math: "Mathematics requires consistent practice. Let's identify the specific concept you need to master and create a structured approach.",
      help: "I'm here to help you succeed. Please describe your challenge clearly so we can address it efficiently.",
      test: "Test preparation requires a strategic approach. Tell me the date and topics, and I'll create a detailed study schedule.",
      default: "Let's address this systematically. Can you provide more specific details about what you need help with?",
    },
    friendly: {
      greeting: "Heyyy! 🎉 So happy to see you! What adventure shall we go on today? Learning is way more fun together!",
      math: "Ooh math! It's like solving puzzles! 🧩 What kind of math puzzle are we tackling? I love finding creative ways to understand tricky concepts!",
      help: "Absolutely! Helping is my favorite thing! 💕 Spill the tea - what's on your mind?",
      test: "A test? Let's turn studying into a game! 🎮 Tell me about it and we'll make prep actually fun!",
      default: "Ooh interesting! Tell me more! I love exploring new topics together! ✨",
    },
    analytical: {
      greeting: "Greetings. I've analyzed your recent performance data. Based on patterns, I recommend focusing on [weakest subject]. Shall we proceed?",
      math: "Mathematical analysis indicates your struggles correlate with timed conditions. I recommend systematic practice with gradually decreasing time limits.",
      help: "Processing request. To provide optimal assistance, please specify: 1) Subject area, 2) Specific topic, 3) Type of help needed.",
      test: "Test preparation optimization: Provide test date, topics covered, and current understanding level (1-10). I'll calculate optimal study distribution.",
      default: "Analyzing query. To maximize learning efficiency, please provide additional context for more precise recommendations.",
    },
  };

  const styleResponses = responses[tutorStyle] || responses.encouraging;
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return styleResponses.greeting;
  }
  if (lowerMessage.includes('math') || lowerMessage.includes('equation') || lowerMessage.includes('algebra')) {
    return styleResponses.math;
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('understand')) {
    return styleResponses.help;
  }
  if (lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('quiz')) {
    return styleResponses.test;
  }
  
  return styleResponses.default;
};

export const generateQuickStudyContent = (subject: string, minutes: number): { title: string; points: string[]; tips: string[] } => {
  const content: Record<string, { title: string; points: string[]; tips: string[] }> = {
    math: {
      title: 'Quick Math Review',
      points: minutes === 2 ? [
        '📐 Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a',
        '📊 Slope Formula: m = (y₂ - y₁) / (x₂ - x₁)',
        '🔢 BEDMAS: Brackets, Exponents, Division, Multiplication, Addition, Subtraction',
      ] : minutes === 5 ? [
        '📐 Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a',
        '📊 Slope-Intercept Form: y = mx + b',
        '🔢 Factoring: Look for common factors first, then use patterns',
        '📈 Vertex Form: y = a(x - h)² + k, vertex at (h, k)',
        '✨ Discriminant: b² - 4ac tells you number of solutions',
      ] : [
        '📐 Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a',
        '📊 Slope-Intercept Form: y = mx + b',
        '🔢 Factoring trinomials: Find two numbers that multiply to ac and add to b',
        '📈 Vertex Form: y = a(x - h)² + k, vertex at (h, k)',
        '✨ Discriminant: positive = 2 solutions, zero = 1 solution, negative = 0 real solutions',
        '🎯 Point-Slope Form: y - y₁ = m(x - x₁)',
        '📉 Standard Form: Ax + By = C',
        '🔄 To complete the square: take half of b, square it, add to both sides',
      ],
      tips: ['Focus on understanding, not memorizing', 'Practice one problem type at a time', 'Check your work by substituting answers back'],
    },
    english: {
      title: 'Quick English Review',
      points: minutes === 2 ? [
        '📝 Thesis = Argument + Reason (not just a topic)',
        '📖 PEEL: Point, Evidence, Explanation, Link',
        '✍️ Use specific quotes, not vague references',
      ] : minutes === 5 ? [
        '📝 Strong thesis = Debatable claim + 3 supporting reasons',
        '📖 PEEL paragraphs: Point, Evidence, Explanation, Link',
        '✍️ Embed quotes smoothly into your sentences',
        '🎭 Literary devices: metaphor, simile, imagery, symbolism',
        '📚 Always explain WHY evidence supports your point',
      ] : [
        '📝 Thesis formula: [Topic] + [Argument] + [3 Reasons]',
        '📖 PEEL: Point (topic sentence), Evidence (quote), Explanation (analysis), Link (to thesis)',
        '✍️ Quote integration: "According to...", "The author states...", embedded quotes',
        '🎭 Key devices: metaphor, simile, personification, imagery, symbolism, foreshadowing, irony',
        '📚 Analysis > Summary: Explain the "so what?" of every quote',
        '🔗 Transition words: Furthermore, However, Consequently, Moreover',
        '📋 Conclusion: Restate thesis differently, summarize main points, end with insight',
        '✨ Vary sentence structure: short for impact, long for complexity',
      ],
      tips: ['Read your essay aloud to catch errors', 'Every paragraph needs a clear purpose', 'Show, don\'t tell'],
    },
    science: {
      title: 'Quick Science Review',
      points: minutes === 2 ? [
        '⚡ F = ma (Force = mass × acceleration)',
        '🔬 Scientific Method: Question → Hypothesis → Experiment → Analysis → Conclusion',
        '🧪 Always include units in your answers',
      ] : minutes === 5 ? [
        '⚡ Newton\'s Laws: 1) Inertia, 2) F=ma, 3) Action-Reaction',
        '🔬 Scientific Method: Observe → Question → Hypothesis → Test → Analyze → Conclude',
        '🧪 SI Units: meters (m), kilograms (kg), seconds (s), Newtons (N)',
        '📊 Acceleration = Change in velocity / Time',
        '🔄 Energy is conserved: KE + PE = constant (in closed systems)',
      ] : [
        '⚡ Newton\'s 1st Law: Objects stay at rest or in motion unless acted upon by a force',
        '⚡ Newton\'s 2nd Law: F = ma, acceleration is proportional to net force',
        '⚡ Newton\'s 3rd Law: Every action has an equal and opposite reaction',
        '🔬 Scientific Method: Observation → Question → Hypothesis → Experiment → Data → Conclusion',
        '🧪 Key SI Units: m, kg, s, N, J (Joules), W (Watts)',
        '📊 Kinematic equations: v = v₀ + at, d = v₀t + ½at²',
        '🔄 Conservation of Energy: Energy cannot be created or destroyed',
        '⚗️ Chemical equations must be balanced (same atoms on both sides)',
      ],
      tips: ['Draw diagrams for physics problems', 'Always check units', 'Memorize key formulas'],
    },
  };

  const key = subject.toLowerCase();
  if (key.includes('math')) return content.math;
  if (key.includes('english')) return content.english;
  if (key.includes('science')) return content.science;
  
  return content.math; // default
};

export const generateStudyMethod = (learningStyle: string): { method: string; description: string; steps: string[] } => {
  const methods: Record<string, { method: string; description: string; steps: string[] }> = {
    visual: {
      method: 'Mind Mapping Method',
      description: 'Perfect for visual learners who understand concepts through diagrams and spatial relationships.',
      steps: [
        'Write the main topic in the center of a blank page',
        'Draw branches for each subtopic using different colors',
        'Add keywords, symbols, and small drawings to each branch',
        'Connect related ideas with lines or arrows',
        'Review by recreating the map from memory',
      ],
    },
    auditory: {
      method: 'Teach-Back Method',
      description: 'Ideal for auditory learners who learn best by hearing and speaking information.',
      steps: [
        'Read through the material once to understand the basics',
        'Explain the concept out loud as if teaching someone else',
        'Record yourself explaining and listen back',
        'Note areas where you stumbled or were unclear',
        'Re-study those areas and teach again until fluent',
      ],
    },
    kinesthetic: {
      method: 'Active Recall with Movement',
      description: 'Great for hands-on learners who need physical engagement while studying.',
      steps: [
        'Write questions on flashcards (physical or digital)',
        'Walk around while reviewing cards',
        'Use hand gestures to represent different concepts',
        'Take short movement breaks every 25 minutes',
        'Practice problems while standing at a whiteboard',
      ],
    },
    reading: {
      method: 'SQ3R Method',
      description: 'Perfect for reading/writing learners who prefer text-based learning.',
      steps: [
        'Survey: Skim headings, summaries, and questions first',
        'Question: Turn headings into questions to answer',
        'Read: Read actively, looking for answers to your questions',
        'Recite: Summarize each section in your own words',
        'Review: Go back and review your notes and summaries',
      ],
    },
  };

  return methods[learningStyle] || methods.visual;
};
