# JaSMEd

### Dependances

Pour s'assurer que toutes les dépendances sont installées, exécuter la commande:

	npm install

Pour démarrer la version actuelle de JaSMEd, il faut faire tourner un serveur Redis.

Instructions pour l'installer et le démarrer: [Redis Quick Start](http://redis.io/topics/quickstart)

Grace à Redis, plus besoin de se ré-identifier au redémarrage du serveur.

### Exécutable

Un dossier bin a été ajouté pour simplifier les choses, pour faire tourner JaSMEd exécuter la commande:

	./bin/devserver
	
Plus besoin de relancer le serveur quand des modifications sont apportés.

# GIT

### Master branch

Cette branche contient uniquement une version stable de l'application, que l'on peut suivre version après version.

### Develop branch

Cette branche contient l'application en développement. Toutes les modifications faites à l'application sont faites
directement sur cette branche.


### Commandes Git

Cloner le dépôt, ceci crée un dossier PSAR dans votre répertoire courant:

	git clone https://Acekat@github.com/Acekat/PSAR.git

Seul la branche master est cloné, il faut aussi "tracker" la branche develop:

	git branch --track develop origin/develop

Récupérer une version stable:

	git checkout <branch>		// passer sur la branche <branch>
	git pull origin <branch>	// fetch + merge la branche <branch> du serveur avec la branche courant locale (<branch>)

**A priori on ne pull pas la branche master, sauf pour récupérer une version stable**
*La branche develop est à pullé avec de commencer des modifications*

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

