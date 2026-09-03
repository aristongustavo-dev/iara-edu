# IARA EDU

Plataforma educacional digital (React + Vite). Aplicativo disponível em **vários formatos** para rodar sem erros em qualquer aparelho:

| Plataforma | Arquivo / Forma | Como obter |
|---|---|---|
| **Navegador (web)** | Link público via túnel Cloudflare | Ver seção "Link público" abaixo |
| **Celular/Tablet (Android)** | `distribuicao\IARA-EDU-android.apk` | Instalar o APK (permitir "fontes desconhecidas") |
| **Windows** | `distribuicao\IARA-EDU-windows-instalador.exe` (instalador) ou `IARA-EDU-windows-portable.exe` (sem instalar) | Executar o arquivo |
| **Qualquer navegador (offline)** | PWA instalável — abre pela web e pode ser instalado na tela inicial | Abrir o link, tocar "Instalar" |

---

## 1. Link público (rodar no celular agora)

O servidor local mantém o app no ar na porta 4173 e um túnel Cloudflare expõe:

> **https://specific-analytical-cir-fantastic.trycloudflare.com**

Para manter o app sempre acessível, o watchdog monitora automaticamente:

1. `watchdog.bat` verifica se o servidor e o túnel estão vivos a cada 2 minutos.
2. Se morrerem, reinicia automaticamente (registrado como tarefa agendada no Windows).
3. Para iniciar manualmente: `start-server.bat` + `start-tunnel.bat`.

---

## 2. Servidor local (rede interna)

- **`npm run serve`** → roda `server.mjs` na porta **4173** (`http://localhost:4173`).
- O servidor imprime os IPs da rede; acesse de outros dispositivos da mesma rede via `http://IP_DA_MAQUINA:4173` (ex.: `http://192.168.2.54:4173`).
- `start-server.bat` faz o mesmo redirecionando o log para `static-server.log`.

---

## 3. Windows (EXE)

### Instalável
`distribuicao\IARA-EDU-windows-instalador.exe` — assistente de instalação (pergunta local, cria atalho "IARA EDU").

### Portátil
`distribuicao\IARA-EDU-windows-portable.exe` — roda direto, sem instalar, numa janela própria.

> Rebuild (do código): `npm run electron` → saída em `release\`.

---

## 4. Android (APK)

### Instalar o APK pronto
1. Copie `distribuicao\IARA-EDU-android.apk` para o aparelho (ou baixe por link).
2. Toque no arquivo e instale. Se o sistema exigir, ative "Instalar aplicativos desconhecidos" na fonte usada.
3. O aplicativo aparece como **IARA EDU**.

> Rebuild completo (do código): `npm run android` (requer Android SDK + JDK 21; vai abrir o Android Studio).
> Build manual: `cd android` e `gradlew assembleDebug` com `JAVA_HOME` apontando para o JDK 21 e `ANDROID_HOME` para o SDK (definidos em `android\local.properties`).

---

## 5. PWA (instalar no celular/tablet)

1. Abra o link público (ou o servidor local) no navegador.
2. Toque no botão **"Instalar"** que aparece no topo (ou use o menu do navegador: "Adicionar à tela inicial" / "Instalar app").
3. O app funciona **offline** depois de instalado (Service Worker com cache).

---

## 6. Deploy público permanente

Para **não depender** do túnel local (que muda), o projeto está pronto para hospedagem gratuita:

- **Render** (recomendado — grátis, Node.js + URL fixa `https://iara-edu.onrender.com`):
  1. Suba o código para um repositório no GitHub.
  2. Em [render.com](https://render.com) → **New → Web Service** → conecte o repositório.
  3. O arquivo `render.yaml` já vem configurado (build + start). Apenas clique em **Deploy**.
- **Vercel**: `deploy-vercel.bat` ou `npm run deploy` (requer `npx vercel login` uma única vez). A config de API + SPA já está em `vercel.json` e `api/`.

Depois do deploy, ele gera uma URL fixa (ex.: `https://iara-edu.onrender.com`) — **essa URL não muda** e pode ser compartilhada com todos os alunos e professores. A sincronização de contas (`/api/db` e `/api/sync`) continua igual, agora rodando na nuvem.

---

## 7. A Fazendinha (gamificação)

Módulo de gamificação integrado ao IARA EDU:

- **Fazenda virtual por aluno** (criada automaticamente no login): plantar e colher culturas (milho, trigo, cenoura, alface, café, cacau), criar animais, construir e decorar o terreno.
- **Economia**: Milhos (🌽, ganhos em atividades e colheitas) e Gemas (💎, missões/eventos).
- **XP e níveis** da fazenda (desbloqueiam culturas, animais e itens da loja).
- **Energia** (⚡): cada ação gasta energia; ela regenera com o tempo.
- **Missões diárias** (`/FarmMissions`), **ranking** (`/FarmRanking` — turma, escola, mais milhos, fazendeiro do mês) e **loja** (`/FarmShop`).
- **Eventos escolares** — criados pelo diretor em `/FarmAdmin`; enquanto ativos, a fazenda ganha decoração temática.
- **Recompensa por BNCC**: atividades concluídas, questões acertadas e nota ≥ 80% rendem Milhos + XP + energia automaticamente.
- **Medalhas** adicionadas: Matemático, Cientista, Agricultor, Gênio e Persistente.

---

## 8. Cadastro do aluno (autoatendimento)

Na tela de acesso `/acesso` (o link que você compartilha), além de entrar com uma conta de demonstração, o **aluno pode criar a própria conta**:

1. Toque em **"Criar minha conta"**.
2. Informe nome completo, e-mail, senha (confirme a senha) e a série.
3. Pronto — o aluno entra automaticamente e cai direto na tela inicial, já com avatares e fazenda criados.

Regras: o e-mail precisa ser válido e não pode estar duplicado; a senha precisa ter no mínimo 4 caracteres. Alunos que se cadastram são **matriculados automaticamente** numa turma da série escolhida (quando houver vaga). Contas de demonstração (sem senha) continuam entrando com um toque.

> ⚠️ **Como os dados circulam (com o servidor no ar):** as **contas** (cadastro do aluno, usuários criados em `/Users`) são **sincronizadas entre aparelhos** via a API `/api/sync` embutida no servidor (arquivo `server-data\api-db.json`). Ou seja: um aluno pode se cadastrar em um aparelho e entrar com o mesmo e-mail/senha em **qualquer outro** — o progresso de atividades, fazenda e avatares continua guardado no **dispositivo** onde foi feito.
>
> ⚠️ **Realize o sync**: para o cadastro valer em outros aparelhos, o **servidor precisa estar no ar** (não funciona no modo estritamente offline). Cada aparelho puxa/empurra as contas automaticamente ao abrir o app, entrar, sair e ao salvar usuários no painel.
>
> 💡 **App de desktop (Windows), que abre arquivos locais:** para o sync funcionar também no EXE, abra o app e digite no console (F12) `localStorage.setItem('iara_api_url', 'https://specific-analytical-cir-fantastic.trycloudflare.com')` e recarregue. Com o deploy permanente, use a URL fixa (ex.: `https://iara-edu.onrender.com`).

---

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `joao@escola.com` | definida no cadastro pela tela de acesso |
| Professor | `marina@escola.com` | idem |
| Diretor | `diretor@escola.com` | idem |

---

## Desenvolvimento

```bash
npm install      # dependências
npm run dev      # dev server (Vite) — http://localhost:5173
npm run lint     # ESLint
npm run build    # build de produção -> dist/
npm run preview  # testa o build localmente
```

### Stack
React 18, Vite 5, Tailwind CSS, React Router, TanStack Query, Framer Motion, Radix UI, Capacitor 8, Electron, PWA (Workbox).

### Estrutura relevante
| Caminho | Função |
|---|---|
| `src/` | código do app (páginas, componentes, API mock) |
| `dist/` | build de produção (gerado por `npm run build`) |
| `server.mjs` | servidor estático local + fallback SPA |
| `android/` | projeto Android (Capacitor) |
| `electron/main.mjs` | janela do app desktop (Electron) |
| `public/icons/` | ícones do PWA |
| `src/api/farm.js` | API da Fazendinha (fazenda, plantio, economia, missões, eventos, ranking) |
| `src/pages/Farm.jsx` | Tela principal da Fazendinha (jogo) |
| `src/pages/FarmShop.jsx` | Loja (sementes, animais, construções, decoração) |
| `src/pages/FarmMissions.jsx` | Missões diárias |
| `src/pages/FarmRanking.jsx` | Ranking da fazenda |
| `src/pages/FarmAdmin.jsx` | Painel do professor/diretor (evolução + eventos) |
| `distribuicao/` | instaláveis prontos (APK, EXEs) |
| `release/` | saída do electron-builder |