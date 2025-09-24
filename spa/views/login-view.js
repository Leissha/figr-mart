Vue.component('login-view', {
  data() {
    return { 
      loginForm: { 
        username: '', 
        password: '' 
      }, 
      valid: false 
    };
  },

  methods: {
    submit() {
      this.$emit('login', { ...this.loginForm });
    },
    goToHome() {
      this.$emit('go-to-home');
    },
    goToRegister() {
      this.$emit('go-to-register');
    }
  },

  template: `
    <div class="row my-15 justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="">
          <h5 class="text-center mb-3">Login</h5>
          <div class="mb-2">
            <label for="username" class="form-label">Username</label>
            <input id="username" type="text" class="form-control" v-model="loginForm.username" placeholder="Enter username">
          </div>
          <div class="mb-2">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" class="form-control" v-model="loginForm.password" placeholder="Enter password">
          </div>
          <div class="d-grid gap-2">
            <custom-button variant="primary-pink" @click="submit">Login</custom-button>
            <custom-button variant="outline-secondary-dark" @click="goToHome">Cancel</custom-button>
          </div>
          <div class="mt-3 text-center">
            <small class="text-muted">Don't have an account? </small>
            <a href="#" @click="goToRegister" class="text-decoration-none">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  `
});
