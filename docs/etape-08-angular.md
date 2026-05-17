# Étape 08 • Frontend Angular

## Objectif

Créer une interface chat minimaliste qui consomme le WebSocket de streaming. La réponse s'affiche token par token, avec un curseur clignotant pendant la génération.

---

## Ce qu'on a créé

```
frontend/
├── package.json                  ← dépendances Angular 17
├── angular.json                  ← configuration du projet Angular
├── tsconfig.json                 ← configuration TypeScript
├── proxy.conf.json               ← proxy dev vers Spring Boot :8080
└── src/
    ├── index.html                ← page HTML racine
    ├── main.ts                   ← bootstrap Angular
    ├── styles.css                ← styles globaux
    └── app/
        ├── app.component.ts      ← logique du chat
        ├── app.component.html    ← template HTML
        ├── app.component.css     ← styles du composant
        └── chat.service.ts       ← gestion WebSocket
```

---

## Explications fichier par fichier

### `chat.service.ts` • gestion WebSocket

```typescript
ask(question: string): Observable<StreamToken> {
  this.ws.send(JSON.stringify({ question }));
  return this.token$.asObservable();
}
```

Le service ouvre une connexion WebSocket vers `/ws/rag` et expose un `Observable<StreamToken>`. À chaque token reçu du serveur, il émet dans le Subject — le composant s'y abonne et met à jour l'interface.

`Subject` = canal de communication interne dans RxJS. Le service y pousse des valeurs, le composant les reçoit.

---

### `app.component.ts` • logique du chat

```typescript
send(): void {
  const assistantMsg: Message = { role: 'assistant', text: '', streaming: true };
  this.messages.push(assistantMsg);

  this.sub = this.chatService.ask(q).subscribe((token: StreamToken) => {
    if (!token.done) {
      assistantMsg.text += token.token;   // accumulation token par token
    } else {
      assistantMsg.streaming = false;     // fin du stream
      this.loading = false;
    }
  });
}
```

La réponse de l'assistant est une référence d'objet dans le tableau `messages`. Angular détecte les mutations et met à jour le DOM automatiquement à chaque token.

`streaming: true` affiche le curseur clignotant `▋` tant que la génération est en cours.

---

### `proxy.conf.json` • pont dev local

```json
{
  "/api": { "target": "http://localhost:8080" },
  "/ws":  { "target": "ws://localhost:8080", "ws": true }
}
```

En développement, le serveur Angular tourne sur `:4200` et Spring Boot sur `:8080`. Le proxy redirige automatiquement les appels `/api/*` et `/ws/*` vers Spring Boot — pas de CORS à gérer.

---

## Aperçu de l'interface

```
┌─────────────────────────────────────┐
│  kore-genie • IA Privée • Données   │  ← header JetBrains Mono
├─────────────────────────────────────┤
│                                     │
│      [Question utilisateur]         │  ← bulle droite, fond bleu nuit
│                                     │
│  [Réponse assistant token par       │  ← bulle gauche, curseur ▋
│   token avec curseur clignotant]    │
│                                     │
├─────────────────────────────────────┤
│  [ textarea question... ] [Envoyer] │  ← footer, accent #fbbf24
└─────────────────────────────────────┘
```

Palette : fond `#0f0f0f`, texte `#e5e5e5`, accent `#fbbf24` (or KORE), police JetBrains Mono.

---

## Commandes

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer en dev (proxy vers Spring Boot :8080)
npm start

# Ouvrir dans le navigateur
# http://localhost:4200

# Build production
npm run build
# Le résultat est dans frontend/dist/kore-genie-ui/
```

---

## Concepts clés

| Concept | Explication |
|---|---|
| **Standalone component** | Angular 17 • un composant sans NgModule, auto-suffisant |
| **Observable** | Flux de données asynchrone RxJS • on s'y abonne pour recevoir les tokens |
| **Subject** | Observable auquel on peut pousser des valeurs manuellement |
| **Proxy Angular** | Redirige les appels API/WS du frontend vers le backend en dev • évite les CORS |
| **Mutation d'objet** | Angular détecte les changements sur la référence • `msg.text +=` met à jour la vue |

---

## Prochaine étape

→ **Étape 09** • Ingestion via l'interface • uploader un document depuis le chat UI.
