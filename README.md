# IARA EDU

Plataforma educacional digital (React + Vite). Aplicativo disponível em **vários formatos** para rodar sem erros em qualquer aparelho:

| Plataforma | Arquivo / Forma | Como obter |
|---|---|---|
| **Navegador (web)** | **Link público permanente: https://iara-edu.vercel.app** | Acessar no navegador de qualquer aparelho |
| **Celular/Tablet (Android)** | `distribuicao\IARA-EDU-android.apk` | Instalar o APK (permitir "fontes desconhecidas") |
| **Windows** | `distribuicao\IARA-EDU-windows-instalador.exe` (instalador) ou `IARA-EDU-windows-portable.exe` (sem instalar) | Executar o arquivo |
| **Qualquer navegador (offline)** | PWA instalável — abre pela web e pode ser instalado na tela inicial | Abrir o link, tocar "Instalar" |

---

## 1. Link público permanente (rodar no celular agora)

O app está **hospedado na nuvem (Vercel)** e acessível de qualquer aparelho:

> **https://iara-edu.vercel.app**

Essa URL é **fixa e não muda** — pode ser compartilhada com todos os alunos e professores. Cadastros, contas e progresso são **sincronizados na nuvem** automaticamente (não dependem do servidor local).

> 🛠️ **Alternativa (servidor local + túnel Cloudflare):** a máquina também pode manter um túnel ativo (o watchdog reinicia a cada 2 min), útil para testes em rede. Para obtê-lo: `start-server.bat` + `start-tunnel.bat`; a URL atual fica em `watchdog-url.txt`. **Não é mais necessário** para o uso externo — use o link permanente com prioridade.

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

## 6. Deploy público permanente (concluído)

O projeto está **deployado e no ar** na hospedagem gratuita:

- **Vercel** — **https://iara-edu.vercel.app** (URL fixa). Inclui:
  - SPA (React/Vite) servido do `dist/`.
  - **Suporte serverless em `/api/db` e `/api/sync`** (pasta `api/` na raiz, config `vercel.json`).
  - **Persistência real** em **Upstash Redis (KV)**, pré-configurada no projeto — os dados não se perdem.

Para **publicar uma nova versão** (após mudanças no código), a partir da pasta do projeto:

```bash
npx vercel --prod --yes      # requer login (npx vercel login) uma única vez; o login já está ativo na máquina
```

- **Render** (alternativa): `render.yaml` já pronto para subir em render.com (URL `https://iara-edu.onrender.com`). Não é necessário, pois o Vercel já está ativo.
- **Offline/aparelhos**: os EXEs/APK continuam funcionando; para o sync apontar para a nuvem, veja a seção 8.

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

> ⚠️ **Como os dados circulam (com a nuvem no ar):** as **contas** (cadastro do aluno, usuários criados em `/Users`) e o **progresso** (atividades, medalhas, fazendinha, avatares, turmas, relatórios) são **sincronizados entre aparelhos** via as APIs `/api/sync` e `/api/db` na nuvem (**Upstash Redis**). Ou seja: um aluno pode se cadastrar em um aparelho e entrar com o mesmo e-mail/senha em **qualquer outro**, e ver o próprio progresso. O app também guarda uma cópia local (offline-first); ele puxa a nuvem ao abrir e empurra a cada alteração.
>
> ⚠️ **Sync na nuvem**: para cadastro/progresso valer em outros aparelhos, é preciso **internet** (o modo estritamente offline só guarda no dispositivo). Cada aparelho puxa/empurra automaticamente ao abrir o app, entrar, sair e ao salvar usuários no painel.
>
> 💡 **App de desktop (Windows), que abre arquivos locais:** com o modo de servidor local, se precisar conectar uma API específica, abra F12 e rode `localStorage.setItem('iara_api_url', '...')`. **Com o deploy permanente em nuvem, não é necessário** — o app detecta automaticamente que está hospedado (usando o mesmo domínio `/api`).

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