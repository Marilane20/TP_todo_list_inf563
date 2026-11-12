# language: fr
Fonctionnalité: Gestion des projets et des tâches dans IndexedDB

  Contexte:
    Etant donné une application Todo initialisée avec IndexedDB

  Scénario: Création d'un projet et ajout d'une tâche
    Quand je crée un projet nommé "INF563 V&V"
    Et j'ajoute la tâche "Configurer Stryker Mutator" au projet "INF563 V&V"
    Alors le projet "INF563 V&V" doit contenir 1 tâche
    Et la tâche "Configurer Stryker Mutator" du projet "INF563 V&V" doit avoir le statut "TODO"

  Scénario: Modification de l'état d'avancement d'une tâche
    Etant donné un projet existant nommé "Mémoire Master"
    Et une tâche "Rédiger l'état de l'art" dans le projet "Mémoire Master"
    Quand je change le statut de la tâche "Rédiger l'état de l'art" du projet "Mémoire Master" vers "DONE"
    Alors la tâche "Rédiger l'état de l'art" du projet "Mémoire Master" doit avoir le statut "DONE"

  Scénario: Suppression d'une tâche d'un projet
    Etant donné un projet existant nommé "Stage"
    Et une tâche "Préparer soutenance" dans le projet "Stage"
    Quand je supprime la tâche "Préparer soutenance" du projet "Stage"
    Alors le projet "Stage" doit contenir 0 tâche