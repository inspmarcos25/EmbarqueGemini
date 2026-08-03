# Embarque — Controle de Escala Offshore

Aplicação para quem trabalha em **regime de embarque offshore** acompanhar a própria escala: quando embarca, quando folga, o que precisa estar resolvido antes de subir a bordo e quais certificações estão perto de vencer.

![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> **Status:** protótipo funcional. As três telas estão navegáveis e a exportação em PDF funciona, mas o estado ainda vive em memória — recarregar a página zera os dados. Persistência é o próximo passo (ver roadmap).

## O problema

Quem trabalha embarcado vive por ciclos de **14x14, 14x21, 21x21 ou 28x28**. Isso significa que datas de embarque, folga, vencimento de certificado e compromissos pessoais precisam ser planejados com meses de antecedência — e uma certificação vencida, como o BOSIET, simplesmente impede o embarque. Planilha e calendário de celular resolvem mal esse problema porque não entendem o conceito de ciclo.

## Telas

| Tela | O que faz |
|---|---|
| **Escala** | Calendário do ciclo de rotação, com embarque, bordo e folga distinguidos visualmente |
| **Tarefas** | Checklist por fase — pré-embarque, a bordo e folga — com prioridade e prazo |
| **Perfil** | Dados do tripulante, tipo de rotação, próximo embarque e certificações com status `válida` / `vencendo` / `vencida` |

Recursos: exportação da escala em **PDF** (jsPDF + autotable), animações de transição (Motion) e busca.

## Modelagem

O domínio está tipado em `src/types.ts`:

```ts
type RotationType = '14x14' | '14x21' | '21x21' | '28x28';

interface Certification {
  id: string;
  name: string;          // BOSIET, CBSP, ASO...
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
}
```

O status de certificação é **derivado da data de validade**, não digitado — isso impede que o dado fique inconsistente, que é exatamente o erro que causaria um embarque barrado.

## Rodando localmente

Pré-requisito: **Node 20+**

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Roadmap

- [ ] Persistência local (IndexedDB ou SQLite) — hoje o estado é em memória
- [ ] Geração automática do calendário a partir da data de embarque e do tipo de rotação
- [ ] Alertas de certificação vencendo
- [ ] Extrair `App.tsx` (1050 linhas) em componentes por tela
- [ ] Exportar a escala em formato `.ics` para o calendário do celular

---

<details>
<summary><strong>🇺🇸 English</strong></summary>

<br>

**Embarque** helps offshore workers track their own rotation schedule: boarding dates, time off, what has to be sorted before going on board, and which certifications are about to expire.

Offshore work runs on **14x14, 14x21, 21x21 or 28x28** cycles, which means boarding dates, leave, certificate expiry and personal commitments have to be planned months ahead — and an expired certification such as BOSIET simply blocks boarding. Spreadsheets and phone calendars handle this poorly because they have no concept of a rotation cycle.

Three screens: **Schedule** (rotation calendar), **Tasks** (checklist split by pre-boarding / on-board / time-off phases) and **Profile** (crew data, rotation type and certifications). Certification status is *derived* from the expiry date rather than entered by hand, so the data can't drift out of sync. Schedules export to PDF.

**Status:** working prototype — state is still in memory, so a page reload clears it. Persistence is the next step.

Built with React 19, TypeScript, Vite and Tailwind v4. Run it with `npm install && npm run dev`.

</details>
