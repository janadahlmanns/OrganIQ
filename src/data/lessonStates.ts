const lessonStates: Record<string, 'perfect' | 'completed' | 'uncompleted' | 'locked'> = {
  // Lungs (fully completed)
  'lung-01': 'perfect',
  'lung-02': 'perfect',
  'lung-03': 'completed',
  'lung-04': 'perfect',
  'lung-05': 'completed',
  'lung-06': 'completed',
  'lung-07': 'completed',
  'lung-08': 'perfect',
  'lung-09': 'completed',
  'lung-review': 'completed',

  // Heart (previous lung state)
  'heart-01': 'perfect',
  'heart-02': 'completed',
  'heart-03': 'perfect',
  'heart-04': 'completed',
  'heart-05': 'completed',
  'heart-06': 'uncompleted',
  'heart-07': 'locked',
  'heart-08': 'locked',
  'heart-09': 'locked',
  'heart-review': 'uncompleted',

  // Ear (fresh topic)
  'ear-01': 'uncompleted',
  'ear-02': 'locked',
  'ear-03': 'locked',
  'ear-04': 'locked',
  'ear-05': 'locked',
  'ear-06': 'locked',
  'ear-07': 'locked',
  'ear-08': 'locked',
  'ear-09': 'locked',
  'ear-review': 'uncompleted',
};

export default lessonStates;
