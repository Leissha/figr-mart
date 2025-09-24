Vue.component('cart-view', {
  props: ['cart', 'total', 'gst', 'grandTotal', 'isLoggedIn', 'canCheckout'],
  // Ref $emit helps emit events to the parent component: 
  // https://vuejs.org/guide/essentials/component-basics.html
  // https://vuejs.org/guide/components/events
  methods: {
    incQty(i) {
      this.$emit('inc-qty', i);
    },
    decQty(i) {
      this.$emit('dec-qty', i);
    },
    remove(i) {
      this.$emit('remove-item', i);
    },
    goToCheckout() {
      this.$emit('go-to-checkout');
    },
    goToLogin() {
      this.$emit('go-to-login');
    }
  },
  template: `
    <div class="row my-8 justify-content-center">
      <div>
        <div class="table-responsive">
          <table class="table table-dark align-middle table-sm">
            <caption class="text-secondary small">Shopping cart items</caption>
            <thead>
              <tr>
                <th scope="col" class="small">Product</th>
                <th scope="col" class="small">Qty</th>
                <th scope="col" class="text-end small d-none d-md-table-cell">Unit</th>
                <th scope="col" class="text-end small">Subtotal</th>
                <th scope="col" class="small">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cart.length===0"><td colspan="5" class="text-muted small">Your cart is empty.</td></tr>
              <tr v-for="(c,i) in cart" :key="c.id">
                <td class="small">{{ c.name }}</td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <custom-button variant="outline-primary-pink" :disabled="c.qty<=1" @click="decQty(i)" small>−</custom-button>
                    <span class="px-1 text-white small">{{ c.qty }}</span>
                    <custom-button variant="outline-primary-pink" @click="incQty(i)" small>+</custom-button>
                  </div>
                </td>
                <td class="text-end small d-none d-md-table-cell">{{ c.price | currency }}</td>
                <td class="text-end small">{{ (c.price*c.qty) | currency }}</td>
                <td><custom-button variant="outline-primary-pink" @click="remove(i)" small>Remove</custom-button></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Order Summary -->
        <div class="mt-4">
          <div class="d-flex justify-content-between small"><span class="text-white">Subtotal</span><span class="fw-semibold text-white">{{ total | currency }}</span></div>
          <div class="d-flex justify-content-between small"><span class="text-white">GST (10%)</span><span class="fw-semibold text-white">{{ gst | currency }}</span></div>
          <hr>
          <div class="d-flex justify-content-between fw-bold"><span class="text-white">Total</span><span class="text-white">{{ grandTotal | currency }}</span></div>
        <div class="d-flex flex-column align-items-center gap-2 mt-8">
          <custom-button variant="primary-pink" :disabled="!canCheckout" @click="goToCheckout">
            {{ isLoggedIn ? 'Proceed to Checkout' : 'Please login to Checkout' }}
          </custom-button>
          <a href="#" @click.prevent="goToLogin" class="text-primary text-decoration-none">
            Login here
          </a>
        </div>
      </div>
    </div>
  `
});
