import helmet from 'helmet';

const helmetConfig = helmet({
  // Prevents the browser from guessing the MIME type
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },

  // Protection against clickjacking
  frameguard: {
    action: 'deny',
  },

  // Disables automatic MIME type detection
  noSniff: true,

  // XSS Protection
  xssFilter: true,

  // Requires HTTPS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Hide Express from header
  hidePoweredBy: true,
});

export default helmetConfig;
