# Calculadora de Horas Extras

Uma aplicação web para registrar e calcular horas extras de trabalho, permitindo ao usuário acompanhar saldos diários e mensais, além de definir metas e gerar previsões.

---

## 🔗 Demo

Acesse o projeto em produção: [calculadora-de-horas.odutra.com](https://calculadora-de-horas.odutra.com/)

---

## 🚀 Funcionalidades

* **Registro de dias**: Adicione entradas e saídas para dois períodos diários, marque feriados.
* **Cálculo de horas extras**:

  * Exibe o saldo de horas (positivas e negativas) por dia.
  * Soma automática do total de horas extras de todos os meses e do mês selecionado.
* **Meta de horas**:

  * Defina uma meta em horas.
  * Armazene a meta no navegador e exiba status de cumprimento.
  * Exiba previsões de quantos dias faltam para alcançar a meta com diferentes ritmos diários.
* **Gráficos**: Visualização da distribuição de horas extras por mês utilizando gráficos de pizza.
* **Exportar/Importar**:

  * Exporte os dados registrados em um arquivo JSON.
  * Importe um arquivo JSON para restaurar ou compartilhar registros.

---

## 🛠 Tecnologias

* **React** com **TypeScript**
* **Material UI** para componentes de interface
* **Recharts** para gráficos interativos
* **localStorage** para persistência de dados no cliente

---

## ⚙️ Instalação e Execução Local

1. Clone este repositório:

   ```bash
   git clone https://github.com/odutradev/calculadora-de-horas.git
   cd calculadora-de-horas
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```
4. Abra [http://localhost:7100](http://localhost:7100) no navegador.


## 👤 Autor

**João Dutra** ([odutradev](https://github.com/odutradev))

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
