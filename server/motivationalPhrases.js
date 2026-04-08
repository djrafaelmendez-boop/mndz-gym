// Motivational phrases for routine badges (server-side copy)
const MOTIVATIONAL_PHRASES = [
  'Keep Going', 'You Got This', 'Stay Focused', 'No Excuses', 'One More Rep',
  'Trust The Process', 'Keep Pushing', 'Never Settle', 'Stay Strong', 'Beast Mode',
  'Go All In', 'Built Different', 'Earn It', 'No Limits', 'Keep Moving',
  'Stay Sharp', 'Push Hard', 'Strong Mind', 'Stay Locked In', 'Make It Happen',
  'Day By Day', 'Show Up Daily', 'Stay Consistent', 'Grind Mode', 'No Days Off',
  'Stay Hungry', 'Put In Work', 'Every Rep Counts', 'Stay The Course',
  'Do The Work', 'Rise And Grind', 'Keep Stacking', 'Stay Relentless',
  'Outwork Everyone', 'Zero Shortcuts', 'Full Send', 'Lights Out', 'All Gas',
  'Raw Power', 'Unleash It', 'Go Hard', 'Max Effort', 'Send It', 'Level Up',
  'Power Up', 'Fired Up', "Let's Go", 'Game On', 'Bring It', 'On Fire',
  'Own It', 'Born Ready', 'Fear Nothing', 'Stay Fearless', 'Be Legendary',
  'Run It', "Can't Stop", "Won't Quit", 'Prove Them Wrong', 'Silence The Doubt',
  'Believe In You', 'Stay Unshakable', 'Chase Greatness', 'Lead The Way',
  'Break Through', 'Lock In', 'Eyes Forward', 'Stay Dialed', 'Clear Mind',
  'Tunnel Vision', 'No Distractions', 'Zone In', 'Laser Focus', 'Mind Over Matter',
  'Stay Present', 'Sharp Focus', 'Deep Focus', 'All In', 'Head Down',
  'Stay Committed', 'Keep Evolving', 'Better Than Yesterday', 'Always Improving',
  'New Level', 'Progress Daily', 'Grow Stronger', 'Raise The Bar', 'Next Chapter',
  'One Step Closer', 'Build Momentum', 'Rise Up', 'Get After It', 'Stack Wins',
  'Crush It', 'Keep Climbing', 'Warrior Mode', 'Iron Will', 'Unbreakable',
  'Stay Savage', 'Fight For It', 'No Surrender', 'Heart Of A Lion', 'Forged In Iron',
  'Stay Gritty', 'Relentless', 'Never Back Down', 'Stand Tall', 'Hold The Line',
  'Built Tough', 'Stay Ruthless', 'Dominate', 'Execute', 'Conquer', 'Persist',
  'Thrive', 'Elevate', 'Ignite', 'Overcome', 'Commit', 'Achieve', 'Deliver',
  'Prevail', 'Unleash', 'Transform', 'Ascend',
];

export function getRandomPhrase() {
  return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
}

export default MOTIVATIONAL_PHRASES;
