<template>
  <div id="app">
    <u style="font-size: 40px;">APARTMENT PAYMENTS</u><br>
    <b-loading
      :is-full-page="true"
      :active.sync="isLoading"
    ></b-loading>
    
    <TheViewPaymentsTable
      :totals="totals"
      :isLoading="isLoading"
    />
    <div class="level" style="display: block">
      <ViewPaymentsList
        class="level-left"
        style="margin-left: 5%; margin-right: 10px;"
        :payments="requests"
        :paymentType="false"
        :isLoading="isLoading"
        side="left"
      />
      <ViewPaymentsList
        class="level-right"
        style="margin-right: 5%; margin-left: 10px;"
        :payments="payments"
        :paymentType="true"
        :isLoading="isLoading"
        side="right"
      />
    </div>
  </div>
</template>

<script>
import TheViewPaymentsTable from './components/TheViewPaymentsTable.vue';
import ViewPaymentsList from './components/ViewPaymentsList.vue';

import {PEOPLE} from './constants';

import axios from 'axios';

export default {
  name: 'app',
  components: {
    TheViewPaymentsTable,
    ViewPaymentsList
  },

  data() {
    return {
      db: null
    };
  },

  computed: {
    totals() {
      const owed = {};
      for (let i = 0; i < PEOPLE.length; i++) {
        const person = PEOPLE[i];
        owed[person] = {};
        for (let j = 0; j < PEOPLE.length; j++) {
          const otherPerson = PEOPLE[j];
          if (person == otherPerson) continue;
          owed[person][otherPerson] = 0;
        }
      }

      if (!this.db) return owed;

      for (const p in this.db.payments) {
        const payment = this.db.payments[p];
        const sourceName = PEOPLE[payment.source];
        for (const d in payment.destinations) {
          const destination = payment.destinations[d];
          const destName = PEOPLE[destination];
          owed[sourceName][destName] += payment.amount;
          owed[destName][sourceName] -= payment.amount;
        }
      }

      owed.loaded = true;

      return owed;
    },

    isLoading() {
      return !this.db;
    },

    payments() {
      return this.db ? this.db.payments.filter(p => p.type) : [];
    },

    requests() {
      return this.db ? this.db.payments.filter(p => !p.type) : [];
    }
  },

  created() {
    axios
      .get('/api')
      .then(response => {
        this.db = response.data;
      })
      .catch(err => {
        alert(err);
      });

    this.$vueEventBus.$on('new-payment', payment => {
      console.log(payment);
      this.db.payments.push(payment);
    });

    this.$vueEventBus.$on('delete-payment', id => {
      for (let i = 0; i < this.db.payments.length; i++) {
        if (this.db.payments[i].id == id) {
          this.db.payments.splice(i, 1);
          break;
        }
      }
    });
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
