Vue.component('nav-bar', {
  props: ['isLoggedIn', 'cartCount'],
  methods: {
    goToHome: function() {
      this.$emit('go-to-home');
    },
    goToProfile: function() {
      this.$emit('go-to-profile');
    },
    goToLogin: function() {
      this.$emit('go-to-login');
    },
    goToCart: function() {
      this.$emit('go-to-cart');
    },
    logout: function() {
      this.$emit('logout');
    }
  },
  template: `
    <div class="d-flex justify-content-between align-items-center">
      <h2 @click="goToHome" class="d-flex align-items-center">
        <img src="logo.svg" alt="FIGR" class="me-2" style="width: 22px; height: 22px;">FIGR
      </h2>
      
      <div class="d-flex gap-1 align-items-center">          
        <!-- 
          HD6.3: Dropdown for user profile using Vuetify premade components (The syntax is diff since I use Vue 2): 
          https://vuetifyjs.com/en/components/menus/#examples
        -->
        <v-menu v-if="isLoggedIn" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <custom-button variant="secondary-dark" v-bind="attrs" v-on="on">
              <i class="bi bi-person me-1"></i> Profile
            </custom-button>
          </template>
          <v-list>
            <v-list-item @click="goToProfile">
              <v-list-item-icon>
                <i class="bi bi-person"></i>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>View Profile</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-icon>
                <i class="bi bi-box-arrow-right"></i>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        
        <custom-button v-if="!isLoggedIn" variant="outline-secondary-dark" @click="goToLogin">
          <i class="bi bi-person me-1"></i> Login
        </custom-button>

        <custom-button variant="outline-primary-pink" @click="goToCart" class="position-relative">
          <i class="bi bi-heart me-1"></i> Cart
          <span class="badge ms-1" style="background-color: #FF1FD6; color: white;">{{ cartCount }}</span>
        </custom-button>
      </div>
    </div>
  `
});
