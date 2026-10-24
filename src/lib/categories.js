// "Outros" = tudo que não é NPC nem Boss (Suicidio, Fogo, Player...)
export const CATEGORIES = [
  { key: 'all', label: 'Tudo', match: () => true },
  { key: 'npc', label: 'NPCs', match: (type) => type === 'NPC' },
  { key: 'boss', label: 'Bosses', match: (type) => type === 'Boss' },
  { key: 'other', label: 'Outros', match: (type) => type !== 'NPC' && type !== 'Boss' },
]
