## JaSMEd

### Configuration requise

Le serveur de JaSMEd tourne sur [node.js](http://nodejs.org/) *(>= v0.6.12)*.
Vous trouverez [ici](https://github.com/joyent/node/wiki/Installation) un guide d'installation.

Le client n'est pleinement compatible qu'avec une version récente de [Google Chrome](https://www.google.com/chrome) pour l'instant.

### Dépendances

Une fois node.js installé et les sources de JaSMEd récupérées.

Pour s'assurer que toutes les dépendances sont installées, exécutez la commande suivante à la source du projet:

	npm install

Pour démarrer la version actuelle de JaSMEd, il faut faire tourner un serveur Redis.

Instructions pour l'installer et le démarrer: [Redis Quick Start](http://redis.io/topics/quickstart)

Grace à Redis, plus besoin de se ré-identifier au redémarrage du serveur.

P.S.: si redis server est dans votre PATH, on peut démarrer le serveur redis avec la commande:

	./bin/redis

### Exécutable

Pour faire tourner le serveur, exécutez la commande:

	npm start

En mode développement, il est possible de lancer le serveur de telle sorte que les modifications soit prises en compte sans qu'il n'y ait besoin de relancer le serveur manuellement.

	./bin/devserver

L'application est ensuite accessible dans Chrome à l'adresse `http://localhost:3000`

### Authentification

Pour utiliser JaSMEd il faut disposer de comptes. Actuellement il n'y a pas de moyen de créer un compte JaSMEd. Cependant, on dispose de 6 comptes par défault:
	
	thibaud
	grizix
	jaimito
	acekat
	berthou
	esj
	
Le mot de passe est le même pour tous les identifiants:
	
	pwd

