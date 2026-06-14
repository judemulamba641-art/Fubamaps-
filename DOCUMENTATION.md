# Documentation opérationnelle

## Règles métier
- Une catégorie regroupe plusieurs types.
- Un type appartient à une seule catégorie.
- Un commerce doit toujours respecter `Commerce.category == Commerce.type.category`.
- Le backend refuse toute combinaison incohérente.

## Téléphone
Formats acceptés à la saisie :
- `+243XXXXXXXXX`
- `243XXXXXXXXX`
- `0XXXXXXXXX`

Stockage normalisé :
- `+243XXXXXXXXX`

## Frontend
- Le formulaire de création et de modification n'affiche que les types compatibles avec la catégorie choisie.
- Un changement de catégorie réinitialise automatiquement le type.
- Les erreurs de saisie sont affichées immédiatement sous le champ concerné.

## Backend
- Les sérializers valident la cohérence catégorie / type.
- Les sérializers et le modèle valident le numéro de téléphone.
- Les vues commerces utilisent `select_related` sur `category` et `type` pour limiter les requêtes supplémentaires.

## GeoDjango / PostGIS
- L'objectif cible est de remplacer les coordonnées flottantes par un `PointField`.
- L'environnement courant ne permet pas de valider la migration spatiale car GDAL / GEOS manquent dans le conteneur.
- La suite de la migration devra être exécutée sur une machine avec GeoDjango complet et PostgreSQL/PostGIS.

## Vérifications exécutées
- Tests backend commerces : OK
- Build frontend : OK
- Lint frontend : OK
