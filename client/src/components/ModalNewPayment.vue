<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <section class="modal-card-body">
        <b-field
          label="You"
          :type="youError ? 'is-danger' : ''"
          :message="youError">
          <b-select
              placeholder="Select a name"
              v-model="you"
              @input="fixDestinations"
              expanded>
            <option
              v-for="person in PEOPLE"
              :value="person"
              :key="person"
            >
            {{ person }}
            </option>
          </b-select>
        </b-field>

        <b-field
            label="Amount"
            :type="amountError ? 'is-danger' : ''"
            :message="amountError">
          <b-input placeholder="0.00" v-model="amount"></b-input>
        </b-field>

        <b-field
          :label="chargeText"
          :type="destinationError ? 'is-danger' : ''"
          :message="destinationError"></b-field>
        <b-checkbox
            v-for="person in PEOPLE"
            :key="person"
            v-model="destinations"
            :disabled="person == you || (paymentType && destinations.length > 0 && !destinations.includes(person))"
            :native-value="person">
            {{ person }}
        </b-checkbox>

        <br><br>

        <b-field
          :label="paymentType ? 'Payment Method' : 'Description'"
          :type="descriptionError ? 'is-danger' : ''"
          :message="descriptionError">
          <b-input type="textarea"
              placeholder="Required"
              v-model="description">
            </b-input>
        </b-field>
        
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">Cancel</button>
        <button class="button is-primary" type="button" @click="submit">Create</button>
      </footer>
    </div>
  </form>
</template>

<script>

import axios from 'axios';
import {PEOPLE} from '../constants';

export default {
  props: ['title', 'paymentType'],

  data() {
    return {
      you: null,
      destinations: [],
      amount: '5.00',
      description: '',

      youError: null,
      amountError: null,
      destinationError: null,
      descriptionError: null
    };
  },

  computed: {
    amountDivisible() {
      return this.destinations.length &&
        Math.floor(parseFloat(this.amount)*100) % this.destinations.length == 0;
    },
    chargeText() {
      if (this.destinations.length <= 1) {
        return this.paymentType ? 'Pay' : 'Request from'
      } else {
        if (this.paymentType) return '';
        const amt = parseFloat(this.amount);
        if (this.amountDivisible) {
          return `Split ($${(amt/this.destinations.length).toFixed(2)} each)`
        } else {
          return 'Split (Not divisible)';
        }
      }
    }
  },

  created() {
    this.PEOPLE = PEOPLE;
  },

  methods: {
    fixDestinations() {
      this.destinations = this.destinations.filter(d => d != this.you);
    },

    submit() {
      if (!this.you) {
        this.youError = 'Who are you??';
      } else {
        this.youError = null;
      }

      if (!this.amount.match(/^\$?[0-9]+\.[0-9]{2}$/)) {
        this.amountError = 'Incorrect format! Must be in format #.## (e.g. $26.50)';
      } else if (parseFloat(this.amount) >= 1000) {
        this.amountError = 'Too large!';
      } else if (this.destinations != 0 && !this.amountDivisible) {
        this.amountError = 'Amount must be divisible by number of payers.';
      } else {
        this.amountError = null;
      }

      if (!this.description) {
        this.descriptionError = 'A description is required! Give some information :)';
      } else {
        this.descriptionError = null;
      }

      if (!this.destinations.length) {
        this.destinationError = 'You must choose at least one person.';
      } else {
        this.destinationError = null;
      }

      if (this.youError || this.amountError || this.descriptionError || this.destinationError) {
        return;
      }

      //http://localhost:8080/api/create?payment=false&source=Lucas&description=Test&destinations=Herman,Alex,Tim&amount=1500
      axios
        .get('/api/create', {
          params: {
            payment: this.paymentType,
            source: this.you,
            description: this.description,
            destinations: this.destinations.join(','),
            amount: Math.floor(parseFloat(this.amount)*100)
          }
        })
        .then(resp => {
          this.$vueEventBus.$emit('new-payment', resp.data);
          this.$toast.open(this.paymentType ? 'Payment created' : 'Request created');
          this.$parent.close();
        })
        .catch(err => {
          console.error(err);
          this.$toast.open({
            type: 'is-danger',
            message: err.response.data
          });
        });
    }
  }
};

</script>

<style>

input {
  text-align: center;
}

</style>