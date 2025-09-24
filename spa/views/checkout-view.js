Vue.component('checkout-view', {
  props: ['user', 'cart', 'total', 'gst', 'grandTotal'],
  methods: {
    processOrder() {
      this.$emit('process-order');
    },
    goToCart() {
      this.$emit('go-to-cart');
    },
    formatCurrency(n) {
      return '$' + Number(n || 0).toFixed(2);
    }
  },
  template: `
    <div class="row my-5 justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">
        <div>
          <h5 class="text-center mb-3">Order Confirmation</h5>
          <div class="mb-3">
            <h6>Shipping to:</h6>
            <p class="mb-1"><strong>{{ user.name }}</strong></p>
            <p class="text-muted">{{ user.email }}</p>
          </div>
          
          <div class="mb-3">
            <h6>Order Summary:</h6>
            <ul class="list-unstyled">
              <li v-for="c in cart" class="d-flex justify-content-between py-1">
                <span>{{ c.qty }} × {{ c.name }}</span>
                <span>{{ formatCurrency(c.price * c.qty) }}</span>
              </li>
            </ul>
            <hr>
            <div class="d-flex justify-content-between"><span>Subtotal</span><span>{{ formatCurrency(total) }}</span></div>
            <div class="d-flex justify-content-between"><span>GST (10%)</span><span>{{ formatCurrency(gst) }}</span></div>
            <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>{{ formatCurrency(grandTotal) }}</span></div>
          </div>
          
          <div class="d-grid gap-2 col-12 col-md-3 mx-auto">
            <custom-button variant="primary-pink" @click="processOrder" block>Complete Order</custom-button>
            <custom-button variant="outline-secondary-dark" @click="goToCart" block>Back to Cart</custom-button>
          </div>
        </div>
      </div>
    </div>
  `
});
