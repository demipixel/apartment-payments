<template>
  <div class="ViewPaymentsList">
    <button class="button"
      :style="style"
      :class="{ 'is-primary': !paymentType, 'is-warning': paymentType }"
      @click="isComponentModalActive = true">
      Create {{ paymentType ? 'Payment' : 'Request' }}
    </button>

    <b-table
          :data="(payments || []).slice().reverse()"
          paginated
          per-page="8"
          detailed
          detail-key="id"
      >

          <template slot-scope="props">
              <b-table-column field="source" :label="paymentType ? 'Payer' : 'Requester'">
                  {{ getPerson(props.row.source) }}
              </b-table-column>

              <b-table-column field="user.last_name" :label="paymentType ? 'Receiver' : 'Owers'">
                  {{ props.row.destinations.map(id => getPerson(id)).join(', ') }}
              </b-table-column>

              <b-table-column field="date" label="Date" sortable centered>
                  <!-- <span class="tag is-success"> -->
                      {{ new Date(props.row.time).toLocaleDateString() }}
                  <!-- </span> -->
              </b-table-column>

              <b-table-column label="Amount">
                  ${{ (props.row.amount/100).toFixed(2) }}
              </b-table-column>
          </template>

          <template slot="detail" slot-scope="props">
              <div class="content">
                <span v-html="newLineToBreak(props.row.description)"></span>
                {{ props.row.destinations.length > 1 ? `($${(props.row.amount/100/props.row.destinations.length).toFixed(2)} each)` : ''}}
                <button
                  class="button is-danger is-small delete-button"
                  type="button"
                  @click="requestDeletePayment(props.row.id)">
                    Delete
                </button>
              </div>
          </template>
      </b-table>

      <b-modal :active.sync="isComponentModalActive" has-modal-card>
          <modal-new-payment v-bind="modalData"></modal-new-payment>
      </b-modal>
  </div>
</template>

<script>

import {PEOPLE} from '../constants';
import ModalNewPayment from './ModalNewPayment.vue';
import axios from 'axios';

export default {
  components: {
    ModalNewPayment
  },
  props: ['payments', 'paymentType', 'side'],

  created() {
    this.getPerson = id => {
      return PEOPLE[id];
    }

    this.newLineToBreak = str => {
      return str.replace(/<.+>/g, '').replace(/\n/g, '<br />');
    }

    this.style = {
      float: this.side
    };

    this.modalData = {
      title: this.paymentType ? 'New Payment' : 'New Request',
      paymentType: this.paymentType
    };
  },

  data() {
    return {
      isComponentModalActive: false
    };
  },

  methods: {
    requestDeletePayment(id) {
      this.$dialog.confirm({
          title: 'Deleting transaction',
          message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
          confirmText: 'Delete Transaction',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.deletePayment(id)
      });
    },

    deletePayment(id) {
      axios.get('/api/delete', { params: { id: id }})
        .then(() => {
          this.$toast.open('Transaction deleted');
          this.$vueEventBus.$emit('delete-payment', id);
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
}

</script>

<style scoped>

.ViewPaymentsList {
  display: inline-block;
  width: 44%;
  vertical-align: top;
}

.delete-button {
  float: right;
}

</style>