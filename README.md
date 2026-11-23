# No Prazo

Aplicativo Android offline para controlar produtos por lote e receber avisos locais de validade. Construído com React Native, Expo Router, SQLite, React Hook Form e Zod.

## Executar no Expo Go

```bash
npm install
npx expo start
```

Leia o QR Code exibido no terminal com o Expo Go em um aparelho Android. As notificações locais funcionam em aparelho físico. A splash nativa definitiva precisa ser conferida em um build de release, pois o Expo Go exibe sua própria experiência de inicialização.

## Verificações

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Estrutura

- `src/app`: rotas e telas com Expo Router.
- `src/db`: migrações, preferências e repositório SQLite.
- `src/features/lots`: tipos, regras de validade e schema Zod.
- `src/services`: permissões, agendamento e reconciliação de notificações locais.
- `src/components`: componentes visuais e formulário compartilhado.

## Dados locais

Desinstalar o aplicativo ou limpar seus dados apagará o estoque cadastrado. Backup, exportação e sincronização não fazem parte deste MVP.
