** MASTER BRANCH **

Cette branche contient uniquement une version stable de l'application, que l'on peut suivre version après version.

Commandes Git:

	Cloner le dépôt, ceci crée un dossier PSAR dans votre répertoire courant:
	> git clone https://Acekat@github.com/Acekat/PSAR.git
	Seul la branche master est cloné, il faut aussi "tracker" la branche develop:
	> git branch --track develop origin/develop

	Récupérer une version stable:
	> git checkout master		// passer sur la branche master
	> git pull origin master	// fetch + merge la branche master du serveur avec la branche courant locale (master)
	!! A priori on ne pull pas la branche master, sauf pour récupérer une version stable !!

	Envoyer un commit au serveur:
	!! PAS D'ENVOIE DE COMMIT SUR LA BRANCHE MASTER !!
	!! sauf pour un fichier spécifique à la branche (README, .gitignore) !!

	Commit:
	!! Il n'est pas non plus nécessaire de commit directement sur cette branche, elle est seulement mise à jour par
	des merges avec la branche develop !!

	Merger:
	> git checkout master
	> git merge develop		// merge la branche develop à la branche locale (master)
	!! NE JAMAIS MERGER SA BRANCHE PERSONNELLE A LA BRANCHE MASTER !!

	Annuler un commit:
	> git reset HEAD^			// revient à l'avant dernier commit
	> git reset <num.commit>	// revient au commit dont le numéro est précisé
	avec l'option --hard : annule et perd tous les changements
	> git commit --amend		// modifier le message du dernier commit

	Annuler un push:
	> git revert <num.commit>	// crée un commit inverse au dernier commit
	> git push					// push ce commit inverse
	!! Impossible de supprimer un commit pushé !!



** DEVELOP BRANCH **

Cette branche contient l'application en développement. Toutes les modifications faites à l'application sont faites
directement sur cette branche.

Commandes Git:

	Récupérer les mises à jours faites par les collaborateurs:
	> git checkout develop		// passer sur la branche develop
	> git pull origin develop	// fetch + merge la branche master du serveur avec la branche courant locale (develop)
	
	Envoyer un commit au serveur:
	> git checkout develop
	> git push origin develop	// Envoie du commit de la branche develop sur la branche develop du serveur

	Ajouter/Mettre-à-jour des fichier sur Git:
	> git add <nom.fichier>

	Commit:
	> git commit -m 'Message de description du commit'
	> git commit			// lance un éditeur pour décrire le commit (une ligne simple puis description plus large après saut de ligne)
	!! Il est obligatoire de fournir un message de commit !!
	> git commit --amend	// modifier le message du dernier commit

	Merger:
	!! Il ne sera à priori jamais nécessaire de merger sur la branche develop, puisque les changements se feront
	directement sur cette bracnche !!
	
	Annuler un commit:
	> git reset HEAD^			// revient à l'avant dernier commit
	> git reset <num.commit>	// revient au commit dont le numéro est précisé
	avec l'option --hard : annule et perd tous les changements

	Annuler un push:
	> git revert <num.commit>	// crée un commit inverse au dernier commit
	> git push					// push ce commit inverse
	!! Impossible de supprimer un commit pushé !!
