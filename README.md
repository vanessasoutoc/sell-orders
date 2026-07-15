# Sistema de Ordens de Venda

[![Front-end Tests](https://github.com/vanessasoutoc/sell-orders/actions/workflows/front-end-tests.yml/badge.svg)](https://github.com/vanessasoutoc/sell-orders/actions/workflows/front-end-tests.yml)

Projeto para Gestão de ordens de venda, com controle de clientes, transportes, agendamentos e auditoria de operações.

**OBS: O teste é pra vaga de front-end, entretanto eu achei interessante criar o backend.

---

## Tecnologias utilizadas

### Back-end (`/api`)
| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | ≥ 24 | Runtime |
| NestJS | 11 | Framework HTTP e injeção de dependências |
| TypeScript | 5.7 | Linguagem |
| Sequelize + sequelize-typescript | 6 / 2.1 | ORM |
| MySQL | 8 | Banco de dados relacional |
| `@nestjs/event-emitter` | 3 | Comunicação assíncrona entre módulos via eventos |
| `@nestjs/swagger` | 11 | Documentação automática da API (OpenAPI) |
| Jest + ts-jest | 30 | Testes unitários e de integração |

### Front-end (`/front-end`)
| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | ≥ 24 | Runtime |
| Next.js | 16 | Framework React com App Router |
| React | 19 | UI |
| TypeScript | 5.9 | Linguagem |
| TailwindCSS | 4 | Estilização |
| TanStack Query (React Query) | 5 | Cache e gerenciamento de estado assíncrono |
| React Hook Form | 7 | Gerenciamento de formulários |
| Jest + Testing Library | 30 / 16 | Testes unitários, de integração e e2e |

---

## Instruções de execução

### Pré-requisitos
- Node.js ≥ 24
- MySQL 8 rodando localmente ou via Docker

### Via Docker

O projeto possui um `docker-compose.yml` na raiz que sobe a API, o front-end e o MySQL juntos.

```bash
# na raiz do projeto
docker compose up --build

# a API estará disponível em http://localhost:3000
# o front-end estará disponível em http://localhost:3001
# documentação Swagger em http://localhost:3000/docs
```

> As variáveis de ambiente do banco já estão pré-configuradas no `docker-compose.yml` (`DB_HOST=mysql`, `DB_USER=nest`, `DB_PASSWORD=nest123`, `DB_NAME=nestdb`). O serviço da API aguarda o MySQL estar saudável antes de iniciar (`depends_on` com `healthcheck`).

### Back-end

```bash
cd api

# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.example .env
# edite .env com as credenciais do seu banco MySQL:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# iniciar em modo desenvolvimento (hot reload)
npm run start:dev

# a API estará disponível em http://localhost:3000
# documentação Swagger em http://localhost:3000/api
```

Executar testes da API:

```bash
cd api
npm test              # testes unitários
npm run test:cov      # com cobertura
npm run test:e2e      # testes e2e
```

### Front-end

```bash
cd front-end

# instalar dependências
npm install

# iniciar em modo desenvolvimento
npm run dev

# a aplicação estará disponível em http://localhost:3001
```

Executar testes do front-end:

```bash
cd front-end
npm test              # todos os testes
npm run test:watch    # modo watch
```

> O banco de dados é criado e sincronizado automaticamente pelo Sequelize (`synchronize: true`) na primeira execução da API.

---

## Decisões arquiteturais

### Separação em dois projetos independentes
A API e o front-end são projetos separados com seus próprios `package.json`, permitindo deploy, versionamento e escalabilidade independentes.

### Back-end: arquitetura modular com NestJS
Cada domínio do negócio (`orders`, `customers`, `appointments`, `audit-logs`, etc.) é encapsulado em um módulo NestJS com controller, service e model próprios. Isso garante baixo acoplamento e facilita a adição de novos domínios sem impacto nos existentes.

### Comunicação assíncrona via eventos
A auditoria de operações é desacoplada dos serviços de negócio através do `EventEmitter2`. Os serviços emitem eventos (`audit.order`, etc.) e o `AuditListener` os persiste de forma independente, sem bloquear o fluxo principal e sem criar dependência direta entre módulos.

### Front-end: App Router do Next.js com Client Components
As páginas de ordens utilizam `'use client'` com TanStack Query para gerenciamento de estado assíncrono, permitindo cache automático, revalidação e estados de loading/error sem boilerplate. A lógica de serviço (chamadas HTTP) é isolada em arquivos `*Service.ts` separados dos componentes.

### Validação de regras de negócio em duas camadas
A regra de sequência de status (`CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`) é validada tanto no back-end (lançando `BadRequestException`) quanto no front-end (filtrando as opções do select), garantindo consistência mesmo que o front-end seja contornado.

---

## Estratégia de modelagem do domínio

O domínio é centrado na entidade **Order** (Ordem de Venda), que agrega as seguintes relações:

```
Customer ──< Order >── TransportType
                │
                ├── OrderStatus        (status atual da ordem)
                ├── OrderItem[]        (itens e quantidades — tabela pivot)
                └── Appointment        (agendamento de entrega, opcional)
                        └── AppointmentStatus
```

**Decisões de modelagem:**

- `OrderItem` é uma tabela pivot explícita entre `Order` e `Item`, com o campo `quantity`, permitindo que o mesmo item apareça em múltiplas ordens com quantidades diferentes.
- `CustomerTransportType` é uma tabela pivot entre `Customer` e `TransportType` com o campo `active`, modelando a autorização de transportes por cliente — uma ordem só pode ser criada com um transporte ativo para aquele cliente.
- `OrderStatus` e `AppointmentStatus` são entidades separadas (não enums), permitindo que novos status sejam adicionados via dados sem alteração de código.
- `Appointment` tem relação `HasOne` com `Order` (uma ordem tem no máximo um agendamento), com `confirmedAt` nulo enquanto pendente.
- `AuditLog` é uma entidade transversal que registra `before`/`after` em JSON para qualquer operação sobre ordens, com IP do solicitante.

---

## Estratégia de persistência

- **ORM:** Sequelize com `sequelize-typescript`, usando decorators para definição de modelos e relacionamentos diretamente nas classes TypeScript.
- **Sincronização:** `synchronize: true` no `SequelizeModule` — o Sequelize cria e atualiza as tabelas automaticamente com base nos modelos. Adequado para desenvolvimento; em produção deve ser substituído por migrations.
- **Banco de dados:** MySQL 8, configurado via variáveis de ambiente (`.env`).
- **Paginação:** Implementada de forma centralizada via função `paginate()` em `common/pagination.dto.ts`, retornando `{ data, total, page, limit, totalPages }` de forma consistente em todos os endpoints de listagem.
- **Consultas com eager loading:** Todas as consultas de ordens incluem os relacionamentos necessários via `include: INCLUDE_ALL`, evitando N+1 queries ao retornar listas.
- **Auditoria:** Cada operação de criação, atualização e remoção de ordens persiste um registro em `audit_logs` com snapshot `before`/`after` em JSON, IP do cliente e timestamp.

---

## Considerações sobre escalabilidade

- **Modularidade:** A arquitetura modular do NestJS permite extrair módulos em microsserviços independentes (ex: `audit-logs`, `appointments`) sem refatoração significativa, bastando expor os serviços via mensageria (RabbitMQ, Kafka) em vez de eventos locais.
- **Eventos assíncronos:** O uso de `EventEmitter2` para auditoria já estabelece o padrão de comunicação por eventos. A migração para um broker externo exigiria apenas a troca do emissor, sem alterar os serviços de negócio.
- **Paginação obrigatória:** Todos os endpoints de listagem são paginados, evitando que consultas sem limite sobrecarreguem o banco à medida que o volume de dados cresce.
- **Separação de leitura e escrita:** Os serviços já distinguem operações de leitura (`findAll`, `findOne`) das de escrita (`create`, `update`, `remove`), facilitando a adoção futura de réplicas de leitura no banco.
- **Front-end:** O TanStack Query gerencia cache no cliente, reduzindo requisições redundantes. A invalidação seletiva de queries (`queryClient.invalidateQueries`) garante que apenas os dados afetados sejam recarregados.
- **Autorizações por cliente:** O modelo `CustomerTransportType` com flag `active` permite escalar o controle de permissões por cliente sem alteração de schema — basta ativar/desativar registros.

---

## Considerações sobre performance

- **Eager loading controlado:** A constante `INCLUDE_ALL` centraliza os `include` das queries de ordens, evitando duplicação e facilitando a otimização pontual (ex: remover includes desnecessários em endpoints específicos).
- **`distinct: true` em `findAndCountAll`:** Usado nas listagens paginadas com joins para garantir contagem correta sem duplicatas, evitando resultados incorretos de paginação.
- **Filtros no banco:** Os filtros de listagem (`orderStatusId`, `customerId`, `transportTypeId`, `date`) são aplicados diretamente na cláusula `WHERE` do SQL, não em memória.
- **Autocomplete com busca server-side:** Os endpoints `/autocomplete` de clientes e itens recebem o termo de busca e aplicam o filtro no banco, retornando apenas 10 registros por vez — evitando carregar listas completas no front-end.
- **Cache no front-end:** O TanStack Query mantém os dados em cache com `staleTime` padrão, evitando refetches desnecessários ao navegar entre páginas. Listas de status e tipos de transporte (dados raramente alterados) se beneficiam diretamente desse cache.
- **Validação dupla de status:** A filtragem dos status permitidos no select do front-end evita que requisições inválidas cheguem à API, reduzindo carga desnecessária no servidor.


## Proposta de melhorias que podem ser implementadas
- **Migrations:** Substituir `synchronize: true` por migrations versionadas para produção, garantindo controle de alterações de schema.
- **Autenticação e autorização:** Implementar JWT ou OAuth2 para proteger endpoints
