import { HealthGoal, FollowUpQuestion } from '@wellness-copilot/types';

const FOLLOW_UP_QUESTIONS: Record<HealthGoal, FollowUpQuestion[]> = {
  energy: [
    {
      id: 'e1',
      text: 'How would you rate your energy levels today?',
      type: 'scale',
      goal_relevance: ['energy'],
    },
    {
      id: 'e2',
      text: 'Do you experience an afternoon energy slump?',
      type: 'boolean',
      goal_relevance: ['energy'],
    },
    {
      id: 'e3',
      text: 'How many cups of coffee or caffeinated drinks did you have today?',
      type: 'multiple_choice',
      options: ['0', '1', '2', '3+'],
      goal_relevance: ['energy'],
    },
    {
      id: 'e4',
      text: 'How many hours of sleep did you get last night?',
      type: 'multiple_choice',
      options: ['<5', '5-6', '6-7', '7-8', '8+'],
      goal_relevance: ['energy', 'sleep_recovery'],
    },
    {
      id: 'e5',
      text: 'What time did you eat your last meal yesterday?',
      type: 'open',
      goal_relevance: ['energy', 'metabolism'],
    },
  ],
  sleep_recovery: [
    {
      id: 's1',
      text: 'How would you rate your sleep quality last night?',
      type: 'scale',
      goal_relevance: ['sleep_recovery'],
    },
    {
      id: 's2',
      text: 'How long did it take you to fall asleep last night?',
      type: 'multiple_choice',
      options: ['<10 min', '10-20 min', '20-30 min', '30+ min'],
      goal_relevance: ['sleep_recovery'],
    },
    {
      id: 's3',
      text: 'Did you wake up during the night?',
      type: 'boolean',
      goal_relevance: ['sleep_recovery'],
    },
    {
      id: 's4',
      text: 'How rested do you feel this morning?',
      type: 'scale',
      goal_relevance: ['sleep_recovery', 'energy'],
    },
    {
      id: 's5',
      text: 'Did you use any screens in the 30 minutes before bed?',
      type: 'boolean',
      goal_relevance: ['sleep_recovery'],
    },
  ],
  metabolism: [
    {
      id: 'm1',
      text: 'How would you describe your hunger levels today?',
      type: 'multiple_choice',
      options: ['Low / not hungry', 'Normal', 'Higher than usual', 'Constant cravings'],
      goal_relevance: ['metabolism'],
    },
    {
      id: 'm2',
      text: 'How many meals or eating occasions did you have today?',
      type: 'multiple_choice',
      options: ['1', '2', '3', '4+'],
      goal_relevance: ['metabolism'],
    },
    {
      id: 'm3',
      text: 'Did you do any physical activity today?',
      type: 'boolean',
      goal_relevance: ['metabolism', 'performance'],
    },
    {
      id: 'm4',
      text: 'How many glasses of water did you drink today?',
      type: 'multiple_choice',
      options: ['<4', '4-6', '6-8', '8+'],
      goal_relevance: ['metabolism'],
    },
    {
      id: 'm5',
      text: 'Did you include protein in your breakfast today?',
      type: 'boolean',
      goal_relevance: ['metabolism', 'performance'],
    },
  ],
  longevity_prevention: [
    {
      id: 'l1',
      text: 'How would you rate your stress levels today?',
      type: 'scale',
      goal_relevance: ['longevity_prevention'],
    },
    {
      id: 'l2',
      text: 'Did you spend any time outdoors today?',
      type: 'boolean',
      goal_relevance: ['longevity_prevention'],
    },
    {
      id: 'l3',
      text: 'How many servings of vegetables or fruits did you eat today?',
      type: 'multiple_choice',
      options: ['0', '1-2', '3-4', '5+'],
      goal_relevance: ['longevity_prevention'],
    },
    {
      id: 'l4',
      text: 'Did you take any supplements today?',
      type: 'boolean',
      goal_relevance: ['longevity_prevention'],
    },
    {
      id: 'l5',
      text: 'How connected did you feel to others today?',
      type: 'scale',
      goal_relevance: ['longevity_prevention'],
    },
  ],
  performance: [
    {
      id: 'p1',
      text: 'How would you rate your physical performance today?',
      type: 'scale',
      goal_relevance: ['performance'],
    },
    {
      id: 'p2',
      text: 'Did you complete your planned workout or movement today?',
      type: 'boolean',
      goal_relevance: ['performance'],
    },
    {
      id: 'p3',
      text: 'How is your muscle soreness today?',
      type: 'multiple_choice',
      options: ['None', 'Mild', 'Moderate', 'Significant'],
      goal_relevance: ['performance'],
    },
    {
      id: 'p4',
      text: 'How well did you focus on tasks today?',
      type: 'scale',
      goal_relevance: ['performance', 'energy'],
    },
    {
      id: 'p5',
      text: 'Did you eat within 2 hours after your workout?',
      type: 'boolean',
      goal_relevance: ['performance', 'metabolism'],
    },
  ],
};

export function getFollowUpQuestions(goal: HealthGoal): FollowUpQuestion[] {
  return FOLLOW_UP_QUESTIONS[goal] || FOLLOW_UP_QUESTIONS.energy;
}
