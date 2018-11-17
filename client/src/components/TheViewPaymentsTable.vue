<template>
  <div style="display: inline-block;">
    <table cellspacing="10">
      <tr>
        <th>
          You owe<i class="mdi mdi-arrow-right-bold"></i><br>
          You get<i class="mdi mdi-arrow-down-bold"></i>
        </th>
        <th v-for="person in PEOPLE" :key="person">
          {{ person }}
        </th>
      </tr>
      <tr v-for="personToPay in PEOPLE" :key="personToPay">
        <th>{{ personToPay }}</th>
        <td
          v-for="personToGet in PEOPLE"
          :key="personToGet"
          :class="{ disabled: personToGet == personToPay }"
          :style="{ background: getBackground(personToPay, personToGet) }">
          <span
            v-if="personToGet != personToPay"
            class="amount">
            {{ totals[personToPay][personToGet] &lt; 0 ? '-' : '' }}${{ Math.abs(totals[personToPay][personToGet]/100).toFixed(2) }}
          </span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>

import {PEOPLE} from '../constants';

export default {
  props: ['totals'],

  created() {
    this.PEOPLE = PEOPLE;

    this.getBackground = (personToPay, personToGet) => {
      if (!this.totals.loaded) return '';

      const amt = this.totals[personToPay][personToGet];
      if (amt > 0) return '#cfb';
      if (amt < 0)  return '#fcc';
      else return '';
    }
  }
}

</script>

<style scoped>

div {
  position: relative;
  margin-bottom: 70px;
}

table:before {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 50px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
              0 8px 0 -3px #f6f6f6,
              0 9px 1px -3px rgba(0, 0, 0, 0.2),
              0 16px 0 -6px #f6f6f6,
              0 17px 2px -6px rgba(0, 0, 0, 0.2);
}

table {
  font-size: 20px;
  border-collapse: separate;
  border-spacing: 5px;

  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 10px;
}

th {
  width: 110px;
  background-color: #f0f0f0;
}

td, th {
  height: 35px;
  text-align: center !important;
  border-radius: 3px;
}

td.disabled {
  background: #f0f0f0;
}

.amount {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: 3px;
}

</style>