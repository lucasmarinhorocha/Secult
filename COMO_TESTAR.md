# GearOne — versão estática

Esta pasta contém uma conversão funcional do projeto para **HTML, CSS e JavaScript puro**. Não é necessário instalar React, TypeScript, npm, banco de dados ou backend para testar a interface.

## Como testar

### Opção 1: abrir diretamente

Abra o arquivo `index.html` no navegador. O login de demonstração já vem preenchido:

- E-mail: `coordenador@test.com`
- Senha: `password123`

### Opção 2: usar um servidor local

Na pasta do projeto, execute um servidor HTTP simples:

```bash
python3 -m http.server 8080
```

Depois acesse <http://localhost:8080>.

## O que está funcionando

A versão inclui login demonstrativo, tela inicial, navegação entre módulos, dashboard com indicadores e gráficos em CSS, tabelas de insumos/ocorrências/documentos, listas de presença, modais de criação e edição, exclusão de registros, download demonstrativo de documentos e persistência dos dados no `localStorage` do navegador.

## Arquivos principais

- `index.html`: estrutura mínima da aplicação.
- `style.css`: layout, responsividade e componentes visuais.
- `script.js`: navegação, dados de demonstração e interações.

Os arquivos React/TypeScript originais foram mantidos em `src/` para referência; a versão independente usa somente os três arquivos acima.

> Observação: sem o backend original, autenticação, QR Code real, API, banco de dados e geração de PDF são simulados no navegador. A interface está pronta para teste e pode posteriormente ser conectada a uma API.
