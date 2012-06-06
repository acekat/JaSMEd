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
thibaud, grizix, jaimito, acekat, berthou, esj
Le mot de passe est le même pour tous les identifiants: pwd


## GIT

### Master branch

Cette branche contient uniquement une version stable de l'application, que l'on peut suivre version après version.

### Develop branch

Cette branche contient l'application en développement. Toutes les modifications faites à l'application sont faites
directement sur cette branche.


### Commandes Git

Cloner le dépôt, ceci crée un dossier JaSMEd dans votre répertoire courant:

	git clone https://Acekat@github.com/Acekat/JaSMEd.git

Seul la branche develop est cloné, il faut aussi "tracker" la branche master:

	git branch --track master origin/master

Récupérer une version stable:

	git checkout <branch>		// passer sur la branche <branch>
	git pull origin <branch>	// fetch + merge la branche <branch> du serveur avec la branche courant locale (<branch>)

**A priori on ne pull pas la branche master, sauf pour récupérer une version stable**

*La branche develop est a puller avant de commencer des modifications*

Ajouter/Mettre-à-jour des fichier sur Git:

	git add <nom.fichier>

Envoyer un commit au serveur:

	git checkout <branch>
	git push origin <branch>	// Envoie du commit de la branche <branch> sur la branche <branch> du serveur

*Les pushs sur la branche master sont fait uniquement après un merge d'une version stable de la branche develop*

Commit:

	git commit -m 'Message de description du commit'
	git commit			// lance un éditeur pour décrire le commit (une ligne simple puis description plus large après saut de ligne)

**Il est obligatoire de fournir un message de commit**

	git commit --amend	// modifier le message du dernier commit

Merger:

	git checkout master
	git merge develop		// merge la branche develop à la branche locale (master)

**Il ne sera à priori jamais nécessaire de merger sur la branche develop, puisque les changements se feront directement sur cette bracnche**

Annuler un commit:

	git reset HEAD^			// revient à l'avant dernier commit
	git reset <num.commit>	// revient au commit dont le numéro est précisé

*avec l'option --hard : annule et perd tous les changements*

Annuler un push:

	git revert <num.commit>		// crée un commit inverse au dernier commit
	git push					// push ce commit inverse

**Impossible de supprimer un commit pushé**

