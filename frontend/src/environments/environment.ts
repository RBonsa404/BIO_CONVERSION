// URL relative : en développement, `ng serve` relaie /api vers le backend
// (proxy.conf.json) ; en production, le backend sert lui-même le frontend.
// L'application fonctionne donc à l'identique sur n'importe quelle machine ou domaine.
export const environment = {
  production: false,
  apiUrl: '/api/v1'
};
