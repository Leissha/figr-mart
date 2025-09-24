Vue.component('register-view', {
  props: ['firstNameRules', 'lastNameRules', 'emailRules', 'usernameRules', 'passwordRules'],
  data() {
    return {
      valid: false,
      registerForm: {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    register() {
      // Validate the form first, then emit (like C6.1 approach)
      if (this.$refs.registerForm.validate()) {
        this.$emit('register', { ...this.registerForm});
      } 
    },
    goToHome() {
      this.$emit('go-to-home');
    },
    goToLogin() {
      this.$emit('go-to-login');
    }
  },

  computed: {
    confirmPasswordRulesComputed() {
      return [
        v => !!v || 'Confirm password is required',
        v => v === this.registerForm.password || 'Passwords must match'
      ];
    }
  },

  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="">
          <h5 class="text-center mb-3">Create Account</h5>
          <v-form ref="registerForm" v-model="valid" lazy-validation action="http://mercury.swin.edu.au/it000000/formtest.php" autocomplete="off">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="registerForm.firstName"
                  label="First Name"
                  :rules="firstNameRules"
                  required>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="registerForm.lastName"
                  label="Last Name"
                  :rules="lastNameRules"
                  required>
                </v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="registerForm.email"
              label="Email"
              :rules="emailRules"
              required>
            </v-text-field>
            <v-text-field
              v-model="registerForm.username"
              label="Username"
              :rules="usernameRules"
              required>
            </v-text-field>
            <v-text-field
              v-model="registerForm.password"
              label="Password"
              type="password"
              :rules="passwordRules"
              required>
            </v-text-field>
            <v-text-field
              v-model="registerForm.confirmPassword"
              label="Confirm Password"
              type="password"
              :rules="confirmPasswordRulesComputed"
              required>
            </v-text-field>
            <div class="d-flex flex-column align-items-center gap-2">
              <custom-button
                variant="primary-pink"
                :disabled="!valid"
                @click="register"
                block>
                Create Account
              </custom-button>
              <custom-button
                variant="secondary-dark"
                @click="goToHome"
                block
                class="mt-2">
                Cancel
              </custom-button>
            </div>
          </v-form>
          <div class="mt-3 text-center">
            <small class="text-muted">Already have an account? </small>
            <a href="#" @click="goToLogin" class="text-decoration-none">Login</a>
          </div>
        </div>
      </div>
    </div>
  `
});
