# server
```bash
https://server-influenceurs.onrender.com/
```
###  `/getprofils/facebook`

**Requête :**

```json
{ "url": "https://www.facebook.com/rihanna" }
```

**Réponse :**

```json
{
  "profile": {
    "plateforme": "Facebook",
    "nom": "Rihanna",
    "followers": 12345678,
    "likes": 9876543
  }
}
```

---

### `/getprofils/instagram`

**Requête :**

```json
{ "url": "https://www.instagram.com/rihanna/" }
```

**Réponse :**

```json
{
  "profile": {
    "nom": "rihanna",
    "url": "https://www.instagram.com/rihanna/",
    "postsCount": 200,
    "followers": 150000000,
    "following": 200
  }
}
```

---

###  `/getprofils/youtube`

**Requête :**

```json
{ "url": "https://www.youtube.com/@rihanna" }
```

**Réponse :**

```json
{
  "profile": {
    "nom": "Rihanna Official",
    "url": "https://www.youtube.com/@rihanna",
    "followers": "25M subscribers",
    "videos": "150 videos",
    "vues": "3B views"
  }
}
```

---

###  `/getprofils/tiktok`

**Requête :**

```json
{ "url": "https://www.tiktok.com/@rihanna" }
```

**Réponse :**

```json
{
  "profile": {
    "nom": "Rihanna",
    "handle": "@rihanna",
    "verified": true,
    "followers": 12000000,
    "following": 50,
    "likes": 300000000,
    "videos": 180
  }
}
```

---

###  `/getprofils/twitter`

**Requête :**

```json
{ "url": "https://x.com/rihanna" }
```

**Réponse :**

```json
{
  "profile": {
    "nom": "Rihanna",
    "followers": 100000000,
    "following": 900,
    "tweets": 8000,
    "verified": true
  }
}
```

---

###  `/getprofils/threads`

**Requête :**

```json
{ "url": "https://www.threads.net/@rihanna" }
```

**Réponse :**

```json
{
  "profile": {
    "fullName": "Rihanna",
    "followerCount": 2500000,
    "isVerified": true
  }
}
```
