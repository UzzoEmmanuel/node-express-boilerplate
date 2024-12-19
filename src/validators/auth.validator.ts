import { body } from 'express-validator';

export const registerValidator = [
  // name validation
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  // email validation
  body('email').trim().isEmail().normalizeEmail().withMessage('Email invalide'),

  // password validation
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

export const loginValidator = [
  // email validation
  body('email').trim().isEmail().normalizeEmail().withMessage('Email invalide'),

  // password validation
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];
