Vue.component('profile-view', {
  props: ['user', 'orderHistory'],
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    formatCurrency(n) {
      return '$' + Number(n || 0).toFixed(2);
    }
  },
  template: `
    <div class="row">
      <div class="col-12 col-lg-10 col-xl-8">
        <h4 class="mb-3">Welcome, {{ user.name }}!</h4>
        <div class="row">
          <div class="col-12">
            <div class="mb-4">
              <h6 class="card-title">Account Information</h6>
              <p><strong>Username:</strong> {{ user.username }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Member since:</strong> {{ formatDate(user.registrationDate) }}</p>
            </div>
            <div class="">
              <h6 class="card-title">Order History</h6>
              <div v-if="orderHistory.length === 0" class="text-muted">No orders yet</div>
              <div v-else>
                <div v-for="order in orderHistory" :key="order.id" class="border-bottom py-2">
                  <div class="d-flex justify-content-between">
                    <span>Order #{{ order.id }}</span>
                    <span>{{ formatCurrency(order.total) }}</span>
                  </div>
                  <small class="text-muted">{{ formatDate(order.date) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
});
