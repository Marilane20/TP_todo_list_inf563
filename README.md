# TP INF563 — Vérification et Validation de Logiciel

Application de gestion de tâches par projets développée en **TypeScript** avec persistance locale dans **IndexedDB**, réalisée selon une démarche complète d'assurance qualité logicielle (**TDD, BDD, Couverture de code, Tests de mutation et DevSecOps**).

## Correspondance des outils (Écosystème Java → TypeScript)

| Pratique V&V | Outil Java | Équivalent TypeScript utilisé |
| Tests Unitaires & TDD | JUnit 5 | **Vitest** |
| Simulation Base de Données | H2 In-Memory | **fake-indexeddb** |
| Tests Comportementaux (BDD) | Cucumber-JVM | **Cucumber.js** (Gherkin FR) |
| Couverture de Code | JaCoCo | **Vitest Coverage V8** |
| Tests de Mutation | PIT (Pitest) | **Stryker Mutator** |
| CI/CD & DevSecOps | Maven + GitHub Actions | **GitHub Actions + npm audit** |

## Commandes principales

- `npm run dev` : Lancer l'interface web locale (Vite)
- `npm test` : Exécuter les tests unitaires et d'intégration (TDD)
- `npm run test:coverage` : Générer le rapport de couverture V8
- `npm run test:bdd` : Exécuter les scénarios Gherkin (Cucumber)
- `npm run test:mutation` : Lancer l'analyse par mutation (Stryker)
- `npm run security:audit` : Vérifier les vulnérabilités des dépendances