/** Fictional firm and app identity used across the shell. */
export const FIRM = {
  name: 'Студио Градина',
  offices: ['Београд', 'Нови Сад'],
  size: 60,
} as const;

export const APP = {
  name: 'АрхиБорд',
  tagline: 'Одбор за одрживу архитектуру',
} as const;

/** Person id of the demo „current user“ (board chair) used for greetings. */
export const CURRENT_USER_ID = 'p-jelena-markovic';
