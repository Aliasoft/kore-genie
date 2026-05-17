# Étape 09 • Upload de document depuis l'UI

## Objectif

Permettre à l'utilisateur de déposer un document (PDF, Word, Markdown) directement depuis l'interface chat. Le fichier est indexé dans Chroma et l'utilisateur peut immédiatement poser des questions dessus.

---

## Ce qu'on a créé / modifié

```
frontend/src/app/
├── ingest.service.ts       ← appel HTTP POST /api/ingest
├── upload.component.ts     ← composant upload drag & drop
├── upload.component.html   ← template zone de dépôt
├── upload.component.css    ← styles zone de dépôt
├── app.component.ts        ← intégration UploadComponent + message système
├── app.component.html      ← ajout barre upload + message système
├── app.component.css       ← styles upload-bar + message système
└── main.ts                 ← ajout provideHttpClient()
```

---

## Flux complet

```
[Utilisateur dépose un fichier]
        |
  UploadComponent.ingest()
        |
  IngestService.upload()     → POST /api/ingest (multipart)
        |
  Spring Boot IngestionService
        |
  Tika → chunks → Ollama embed → Chroma
        |
  { filename, chunks, status: "OK" }
        |
  UploadComponent émet (uploaded)
        |
  AppComponent.onDocUploaded()
        |
  Message système vert dans le chat :
  "Document indexé : fichier.pdf (42 chunks)"
        |
  [Utilisateur pose une question]
```

---

## Explications fichier par fichier

### `ingest.service.ts`

```typescript
upload(file: File): Observable<IngestionResponse> {
  const form = new FormData();
  form.append('file', file);
  return this.http.post<IngestionResponse>('/api/ingest', form);
}
```

`FormData` est l'équivalent JavaScript d'un formulaire `multipart/form-data`. Angular HttpClient sérialise et envoie le fichier binaire correctement. Le proxy redirige `/api/ingest` vers Spring Boot `:8080`.

---

### `upload.component.ts` • drag & drop

```typescript
onDrop(event: DragEvent): void {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file) this.ingest(file);
}
```

Deux modes d'upload :
- **Clic** : ouvre le sélecteur de fichiers natif
- **Drag & drop** : dépose directement sur la zone

Les états du composant :

| État | Affichage |
|---|---|
| `idle` | Zone de dépôt grise avec texte indicatif |
| `uploading` | Message de progression, zone désactivée |
| `success` | Nom du fichier + nombre de chunks, vert |
| `error` | Message d'erreur, rouge |

---

### `app.component.ts` • message système

```typescript
onDocUploaded(event: UploadEvent): void {
  const text = event.success
    ? `Document indexé : ${event.filename} (${event.chunks} chunks).`
    : `Échec de l'indexation de ${event.filename}.`;
  this.messages.push({ role: 'system', text });
}
```

Un message de rôle `system` s'insère dans le fil du chat. Il est centré, en vert, sans bulle — visuellement distinct des messages utilisateur et assistant.

---

### `main.ts` • HttpClient

```typescript
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
})
```

Angular 17 standalone requiert de déclarer explicitement `provideHttpClient()` dans les providers de l'application. Sans ça, `HttpClient` ne peut pas être injecté.

---

## Aperçu de l'interface complète

```
┌──────────────────────────────────────────┐
│  kore-genie • IA Privée • Données        │
├──────────────────────────────────────────┤
│  ＋ Déposer un document  PDF Word MD     │  ← upload bar
├──────────────────────────────────────────┤
│                                          │
│        [Question utilisateur]            │
│                                          │
│    ✓ Document indexé : rapport.pdf       │  ← message système vert
│         (42 chunks)                      │
│                                          │
│  [Réponse de l'assistant en streaming▋]  │
│                                          │
├──────────────────────────────────────────┤
│  [ textarea... ]              [Envoyer]  │
└──────────────────────────────────────────┘
```

---

## Concepts clés

| Concept | Explication |
|---|---|
| **FormData** | Objet JS pour construire des requêtes multipart • équivalent d'un `<form enctype="multipart/form-data">` |
| **Drag & drop API** | API navigateur native • `dragover`, `dragleave`, `drop` sont des événements DOM standard |
| **EventEmitter** | Mécanisme Angular pour qu'un composant enfant communique avec son parent |
| **`provideHttpClient()`** | Provider Angular 17 standalone pour injecter HttpClient sans NgModule |
| **Message système** | Rôle neutre dans le chat pour les notifications non liées à une question |

---

## Récapitulatif de tous les endpoints utilisés

| Endpoint | Appelé par | Usage |
|---|---|---|
| `POST /api/ingest` | `IngestService` | Upload + indexation document |
| `WS /ws/rag` | `ChatService` | Questions en streaming |

---

## Le MVP est complet

À ce stade, kore-genie est un MVP fonctionnel de bout en bout :

1. On dépose un document dans l'UI
2. Il est extrait, découpé, vectorisé et stocké dans Chroma
3. On pose une question dans le chat
4. La réponse arrive en streaming, ancrée sur le document
5. Tout tourne on-premise • aucune donnée ne sort
