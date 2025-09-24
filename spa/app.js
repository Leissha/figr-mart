// Initialize Vuetify
Vue.use(Vuetify);
const vuetify = new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#FF1FD6',
        background: '#141414',
        surface: '#1a1a1a'
      }
    }
  }
});

new Vue({
  el: '#app',
  vuetify: vuetify,

  data: {
    currentView: 'home',
    filters: { q: '', type: 'All' },
    sortOrder: 'normal', // HD6.3: sort selector (default to no sorting)
    categories: ['All', 'Skullpanda', 'Hirono', 'Dimoo'], // Category filter options
    products: [],
    cart: [],

    // HD6.3: User authentication
    user: null,

    users: [], // Store registered users
    orderHistory: [], // Order history
    
    // C6.1: Vuetify form validation
    firstNameRules: [
      v => !!v || 'First name is required',
      v => /^[A-Za-z\s]+$/.test(v) || 'First name must contain only letters',
    ],
    lastNameRules: [
      v => !!v || 'Last name is required',
      v => /^[A-Za-z\s]+$/.test(v) || 'Last name must contain only letters',
    ],
    usernameRules: [
      v => !!v || 'Username is required',
      v => (v && v.length >= 3) || 'Username must be at least 3 characters long',
    ],
    passwordRules: [
      v => !!v || 'Password is required',
      v => (v && v.length >= 6) || 'Password must be at least 6 characters long',
    ],
    emailRules: [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Email must be valid',
    ],
  },
  computed: {
    // Ref: C3.3 compute
    cartCount() { 
      return this.cart.reduce((a,c) => {return a+c.qty},0); 
    },
    total() {
      return this.cart.reduce((sum,c) => { return sum + c.price*c.qty; }, 0);
    },
    gst() { 
      return this.total * APP_CONFIG.GST_RATE; 
    },
    grandTotal(){ return this.total + this.gst; },
    
    // HD6.3: User authentication computed
    isLoggedIn(){ return !!this.user; },
    canCheckout(){ return this.isLoggedIn && this.cart.length > 0; },
  },
  methods: {
    // Navigation methods for components
    goToHome() { this.currentView = 'home'; },
    goToCart() { this.currentView = 'cart'; },
    goToCheckout() { this.currentView = 'checkout'; },
    goToLogin() { this.currentView = 'login'; },
    goToRegister() { this.currentView = 'register'; },
    goToProfile() { this.currentView = 'profile'; },
    
    // Filter and sort methods for home-view component
    updateFilters(newFilters) {
      this.filters = newFilters;
    },
    updateSortOrder(newSortOrder) {
      this.sortOrder = newSortOrder;
    },
    
    // Ref: P5.1 Lab post add/remove
    add(p){
      var idx = this.cart.findIndex((c) => { return c.id===p.id; });
      if(idx===-1){
        this.cart.push({ id:p.id, name:p.name, price:p.price, qty:1 }); 
      }
      else{ 
        this.cart[idx].qty += 1; 
      }
      this.saveCart();
    },
    
    // Ref: P5.1 Lab post add/remove
    incQty(i){ 
      this.cart[i].qty += 1;
      this.saveCart();
    },
    decQty(i){ 
      if(this.cart[i].qty>1) { 
        this.cart[i].qty -= 1;
        this.saveCart();
      } 
    },
    remove(i){ 
      this.cart.splice(i,1);
      this.saveCart();
    },
    
    // HD6.3: 
    // User account with sessionStorage persistence :) 
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage 
    login(creds){
      if (creds.username && creds.password) {
        // Check if user exists in registered users
        var foundUser = this.users.find((u_db) =>{ return u_db.username === creds.username;});
        
        if (foundUser) {
          // User exists - create session
          this.user = { 
            username: foundUser.username, 
            name: foundUser.name,
            email: foundUser.email,
            loginTime: new Date().toISOString()
          };

          this.saveUser(); // Save current user session
          this.currentView = 'home';
        } else {
          alert('Username not found. Please register first.');
        }
      } else {
        alert('Please enter username and password');
      }
    },
    
    logout(){
      this.user = null;
      this.saveUser(); // Save current user session
      this.currentView = 'home';
    },
    
    // Save current user session, storage key: hd6_user
    saveUser(){
      if (this.user) {
        sessionStorage.setItem('hd6_user', JSON.stringify(this.user));
      } else {
        sessionStorage.removeItem('hd6_user');
      }
    },
    
    // Load current user session, storage key: hd6_user
    loadUser(){
      var saved = sessionStorage.getItem('hd6_user');
      if (saved) {
        this.user = JSON.parse(saved);
      }
    },
    // HD6.3: C6.1: User account registration form + SessionStorage persistence
    register(form) {
      const newUser = {
        id: Date.now(),
        name: form.firstName + ' ' + form.lastName,
        username: form.username,
        email: form.email,
        registrationDate: new Date().toISOString()
      };

      // Add new user to user database
      this.users.push(newUser);
      this.saveUsers();

      // Set current user session
      this.user = newUser;
      this.saveUser();
      
      // Task done, move to next view
      this.currentView = 'home';
      alert('Account created successfully!');
    },

    // HD6.3: Order processing
    processOrder(){
      if (this.canCheckout) {
        var order = {
          id: Date.now(),
          date: new Date().toISOString(),
          items: this.cart.slice(),
          total: this.grandTotal,
          user: this.user.username
        };
        
        this.orderHistory.push(order);
        this.saveOrderHistory();
        this.cart = [];
        this.currentView = 'profile';
      }
    },

    // HD6.3: Generic data persistence 
    saveToStorage(key, data) {
      try { 
        sessionStorage.setItem(key, JSON.stringify(data)); 
      } catch(e) {
        console.warn('Failed to save to storage:', key, e);
      }
    },

    loadFromStorage(key, defaultValue = []) {
      try {
        var saved = sessionStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch(e) {
        console.warn('Failed to load from storage:', key, e);
        return defaultValue;
      }
    },

    // User database to store & load multiple user accounts (when register)
    saveUsers() { this.saveToStorage('hd6_users', this.users); },
    loadUsers() { this.users = this.loadFromStorage('hd6_users', []); },
    
    saveOrderHistory() { this.saveToStorage('hd6_orders', this.orderHistory); },
    loadOrderHistory() { this.orderHistory = this.loadFromStorage('hd6_orders', []); },
    
    saveCart() { this.saveToStorage('cart', this.cart); },
    loadCart() { this.cart = this.loadFromStorage('cart', []); }
  },
  
  // Load all user-related data when app is created
  created(){
    var self = this;
    // Load products from local JSON file
    fetch('products.json').then((r) => { return r.json(); }).then((list) => {
      self.products = list;
    });
    
    // HD6.3: Load all user-related data
    this.loadUser();
    this.loadUsers();
    this.loadOrderHistory();
    this.loadCart();
  },
});